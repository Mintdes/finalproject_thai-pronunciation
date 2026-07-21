import librosa
import numpy as np
import os

REF_FOLDER = "newref/"
USER_FOLDER = "newuser/"

# ─────────────────────────────────────────────────────
# Feature Extraction  (single source of truth)
# ─────────────────────────────────────────────────────

def extract_features(y, sr):
    """Layer 1: สกัด MFCC และทำ mean-std normalization ต่อแต่ละ coefficient"""
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc = (mfcc - np.mean(mfcc, axis=1, keepdims=True)) / (
        np.std(mfcc, axis=1, keepdims=True) + 1e-6
    )
    return mfcc

def extract_chroma(y, sr):
    """Layer 2: สกัด Chroma STFT และทำ normalization สำหรับประโยคที่แยกยากด้วย MFCC"""
    chroma = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
    chroma = (chroma - np.mean(chroma, axis=1, keepdims=True)) / (
        np.std(chroma, axis=1, keepdims=True) + 1e-6
    )
    return chroma

def load_audio(path):
    """โหลดและ trim silence — ใช้ร่วมกันทุก function"""
    y, sr = librosa.load(path, sr=22050)
    y, _ = librosa.effects.trim(y, top_db=20)
    return y, sr

# ─────────────────────────────────────────────────────
# DTW Distance  (รองรับทั้ง MFCC และ Chroma)
# ─────────────────────────────────────────────────────

def calculate_dist(ref_path, user_feat, feature_type="mfcc"):
    try:
        y_ref, sr = load_audio(ref_path)
        
        if feature_type == "mfcc":
            feat_ref = extract_features(y_ref, sr)
        else:
            feat_ref = extract_chroma(y_ref, sr)

        T_ref  = feat_ref.shape[1]
        T_user = user_feat.shape[1]
        band   = int(0.15 * max(T_ref, T_user))

        D, wp = librosa.sequence.dtw(
            X=feat_ref, Y=user_feat, metric="cosine", band_rad=band
        )
        dist = D[-1, -1] / len(wp)
        return dist, feat_ref, wp

    except Exception:
        return 0.0, None, None

def extract_fusion_features(y, sr):
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc = (mfcc - np.mean(mfcc, axis=1, keepdims=True)) / (
        np.std(mfcc, axis=1, keepdims=True) + 1e-6
    )
    
    chroma = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
    chroma = (chroma - np.mean(chroma, axis=1, keepdims=True)) / (
        np.std(chroma, axis=1, keepdims=True) + 1e-6
    )
    
    return np.vstack([mfcc, chroma])

# ─────────────────────────────────────────────────────
# Matching Logic (Two-Layer Cascade)
# ─────────────────────────────────────────────────────

def run_smart_selector(user_filename, trigger_threshold=0.10):
    u_path = os.path.join(USER_FOLDER, user_filename)

    y_user, sr_user = load_audio(u_path)
    feat_user_mfcc = extract_features(y_user, sr_user)

    ref_files = [f for f in os.listdir(REF_FOLDER) if f.endswith(".wav")]
    results = []

    # --- LAYER 1: MFCC Matching ---
    for r_file in ref_files:
        dist, feat_ref, wp = calculate_dist(
            os.path.join(REF_FOLDER, r_file), feat_user_mfcc, feature_type="mfcc"
        )
        results.append({
            "Ref":      r_file,
            "Dist":     dist,
            "feat_ref": feat_ref,
            "wp":       wp,
            "Layer":    "Layer 1 (MFCC)"
        })

    results.sort(key=lambda x: x["Dist"])

    # --- LAYER 2: Feature Fusion Verification ---
    if len(results) >= 2:
        dist1 = results[0]["Dist"]
        dist2 = results[1]["Dist"]
        
        pct_diff = (dist2 - dist1) / (dist1 + 1e-6)

        if pct_diff < trigger_threshold:
            feat_user_fusion = extract_fusion_features(y_user, sr_user)
            T_user = feat_user_fusion.shape[1]
            
            chroma_candidates = results[:2]
            layer2_results = []
            
            for cand in chroma_candidates:
                try:
                    y_ref, sr_ref = load_audio(os.path.join(REF_FOLDER, cand["Ref"]))
                    feat_ref_fusion = extract_fusion_features(y_ref, sr_ref)
                    T_ref = feat_ref_fusion.shape[1]
                    
                    band = int(0.15 * max(T_ref, T_user))
                    D, wp_f = librosa.sequence.dtw(
                        X=feat_ref_fusion, Y=feat_user_fusion, metric="cosine", band_rad=band
                    )
                    
                    f_dist = D[-1, -1] / max(T_ref, T_user)
                    
                    layer2_results.append({
                        "Ref":      cand["Ref"],
                        "Dist":     f_dist,
                        "feat_ref": feat_ref_fusion,
                        "wp":       wp_f,
                        "Layer":    "Layer 2 (MFCC + Chroma)"
                    })
                except Exception:
                    continue
            
            layer2_results.sort(key=lambda x: x["Dist"])
            
            if len(layer2_results) >= 2:
                results[0] = layer2_results[0]
                results[1] = layer2_results[1]

    return results, feat_user_mfcc