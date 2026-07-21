import librosa
import numpy as np
import os
import tempfile
import wave
from scipy.io import wavfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REF_FOLDER = os.path.join(BASE_DIR, "newref")

# ─────────────────────────────────────────────────────
# Feature Extraction
# ─────────────────────────────────────────────────────

def extract_features(y, sr):
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc = (mfcc - np.mean(mfcc, axis=1, keepdims=True)) / (
        np.std(mfcc, axis=1, keepdims=True) + 1e-6
    )
    return mfcc

def extract_chroma(y, sr):
    chroma = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
    chroma = (chroma - np.mean(chroma, axis=1, keepdims=True)) / (
        np.std(chroma, axis=1, keepdims=True) + 1e-6
    )
    return chroma

def extract_fusion_features(y, sr):
    mfcc = extract_features(y, sr)
    chroma = extract_chroma(y, sr)
    return np.vstack([mfcc, chroma])

# ─────────────────────────────────────────────────────
# Audio Loaders (แยก Bytes กับ Path)
# ─────────────────────────────────────────────────────

def load_audio_from_bytes(audio_bytes):
    """
    อ่านข้อมูลไฟล์เสียง WAV จาก Bytes โดยใช้ Pure Python (scipy + wave)
    """
    # 1. เขียน Bytes ลง Temp File
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        temp_file.write(audio_bytes)
        temp_path = temp_file.name

    try:
        # 2. ใช้ wave module เช็กว่าเป็น RIFF/PCM WAV หรือไม่
        try:
            with wave.open(temp_path, 'rb') as wf:
                sr = wf.getframerate()
                n_channels = wf.getnchannels()
                sampwidth = wf.getsampwidth()
        except wave.Error:
            raise ValueError("รูปแบบไฟล์ไม่ถูกต้อง: Vercel รองรับเฉพาะไฟล์ WAV (PCM) มาตรฐานเท่านั้น กรุณาอัปโหลดไฟล์ .wav แท้")

        # 3. อ่านสัญญาณเสียงด้วย scipy.io.wavfile (Pure Python)
        sr, data = wavfile.read(temp_path)
        
        # Normalization ค่าให้อยู่ในช่วง [-1.0, 1.0]
        if data.dtype == np.int16:
            y = data.astype(np.float32) / 32768.0
        elif data.dtype == np.int32:
            y = data.astype(np.float32) / 2147483648.0
        elif data.dtype == np.float32:
            y = data
        else:
            y = data.astype(np.float32)

        # แปลง Stereo เป็น Mono
        if len(y.shape) > 1:
            y = np.mean(y, axis=1)

        # Resample เป็น 22050 Hz หากค่า SR ไม่ตรง
        if sr != 22050 and len(y) > 0:
            y = librosa.resample(y, orig_sr=sr, target_sr=22050)
            sr = 22050

        # Trim silence
        try:
            y, _ = librosa.effects.trim(y, top_db=20)
        except Exception:
            pass

        return y, sr

    finally:
        # ลบ Temp File ทิ้งเสมอ
        if os.path.exists(temp_path):
            os.remove(temp_path)

def load_audio_from_path(path):
    """ใช้โหลดไฟล์ Reference จากโฟลเดอร์ newref/ ด้วย scipy"""
    sr, data = wavfile.read(path)
    
    if data.dtype == np.int16:
        y = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        y = data.astype(np.float32) / 2147483648.0
    elif data.dtype == np.float32:
        y = data
    else:
        y = data.astype(np.float32)

    if len(y.shape) > 1:
        y = np.mean(y, axis=1)

    if sr != 22050 and len(y) > 0:
        y = librosa.resample(y, orig_sr=sr, target_sr=22050)
        sr = 22050

    try:
        y, _ = librosa.effects.trim(y, top_db=20)
    except Exception:
        pass

    return y, sr

# ─────────────────────────────────────────────────────
# DTW Distance
# ─────────────────────────────────────────────────────

def calculate_dist(ref_path, user_feat, feature_type="mfcc"):
    # ✅ แก้ให้เรียก load_audio_from_path
    y_ref, sr = load_audio_from_path(ref_path)
    
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
    return float(dist), feat_ref, wp

# ─────────────────────────────────────────────────────
# Matching Logic
# ─────────────────────────────────────────────────────

def run_smart_selector_file(audio_bytes, trigger_threshold=0.10):
    # 1. โหลดเสียงผู้ใช้จาก Bytes
    y_user, sr_user = load_audio_from_bytes(audio_bytes)
    feat_user_mfcc = extract_features(y_user, sr_user)

    ref_files = [f for f in os.listdir(REF_FOLDER) if f.endswith(".wav")]
    results = []

    # --- LAYER 1: MFCC Matching ---
    for r_file in ref_files:
        dist, feat_ref, wp = calculate_dist(
            os.path.join(REF_FOLDER, r_file), feat_user_mfcc, feature_type="mfcc"
        )
        results.append({
            "Ref": r_file,
            "Dist": float(dist),
            "Layer": "Layer 1 (MFCC)"
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
                    # ✅ แก้ให้เรียก load_audio_from_path
                    ref_full_path = os.path.join(REF_FOLDER, cand["Ref"])
                    y_ref, sr_ref = load_audio_from_path(ref_full_path)
                    
                    feat_ref_fusion = extract_fusion_features(y_ref, sr_ref)
                    T_ref = feat_ref_fusion.shape[1]
                    
                    band = int(0.15 * max(T_ref, T_user))
                    D, wp_f = librosa.sequence.dtw(
                        X=feat_ref_fusion, Y=feat_user_fusion, metric="cosine", band_rad=band
                    )
                    
                    f_dist = float(D[-1, -1] / max(T_ref, T_user))
                    
                    layer2_results.append({
                        "Ref": cand["Ref"],
                        "Dist": f_dist,
                        "Layer": "Layer 2 (MFCC + Chroma)"
                    })
                except Exception:
                    continue
            
            layer2_results.sort(key=lambda x: x["Dist"])
            
            if len(layer2_results) >= 2:
                results[0] = layer2_results[0]
                results[1] = layer2_results[1]

    return results