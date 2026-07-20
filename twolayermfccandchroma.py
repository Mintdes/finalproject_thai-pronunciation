import librosa
import librosa.display
import numpy as np
import os
import soundfile as sf # เพิ่ม import ไว้ด้านบนสุดของไฟล์ด้วย

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
    """โหลดด้วย soundfile หรือ librosa สลับกันเพื่อลดปัญหาไฟล์เปิดไม่ได้"""
    try:
        # 1. ลองโหลดด้วย soundfile (รองรับไฟล์เสียงดิบจากเบราว์เซอร์บางประเภทได้ดี)
        y, sr = sf.read(path)
        if len(y.shape) > 1:
            y = np.mean(y, axis=1) # แปลง Stereo เป็น Mono
        if sr != 22050:
            y = librosa.resample(y, orig_sr=sr, target_sr=22050)
            sr = 22050
        print(# สั่ง Print เพื่อเช็คใน Terminal ว่าอ่านสำเร็จไหม
            f"🟢 โหลดสำเร็จด้วย soundfile: รูปร่างข้อมูล={y.shape}, Sample Rate={sr}"
        )
    except Exception as e:
        # 2. ถ้าระบบแรกพัง ให้พิมพ์บอกเหตุผล และหันไปพึ่ง librosa แบบเต็มตัว
        print(f"⚠️ soundfile อ่านไม่ได้เนื่องจาก: {e}. กำลังลองใช้ librosa...")
        try:
            y, sr = librosa.load(path, sr=22050)
        except Exception as e2:
            print(f"❌ librosa ก็อ่านไม่ได้เนื่องจาก: {e2}")
            raise e2

    # ทำการตัดเสียงเงียบ
    y, _ = librosa.effects.trim(y, top_db=20)
    return y, sr
# ─────────────────────────────────────────────────────
# DTW Distance  (รองรับทั้ง MFCC และ Chroma)
# ─────────────────────────────────────────────────────

def calculate_dist(ref_path, user_feat, feature_type="mfcc"):
    """
    คำนวณ DTW ระหว่าง ref file กับ user features 
    feature_type: "mfcc" หรือ "chroma"
    """
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
    """Layer 2 (Fusion): สกัด MFCC + Chroma และทำ Z-score Normalization แยกตามมิติ"""
    # 1. สกัดและนอร์มัลไลซ์ MFCC (13 มิติ)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc = (mfcc - np.mean(mfcc, axis=1, keepdims=True)) / (
        np.std(mfcc, axis=1, keepdims=True) + 1e-6
    )
    
    # 2. สกัดและนอร์มัลไลซ์ Chroma (12 มิติ)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
    chroma = (chroma - np.mean(chroma, axis=1, keepdims=True)) / (
        np.std(chroma, axis=1, keepdims=True) + 1e-6
    )
    
    # 3. รวมร่าง Feature ในแนวตั้ง (มิติรวมจะเป็น 13 + 12 = 25)
    return np.vstack([mfcc, chroma])


# ─────────────────────────────────────────────────────
# Matching Logic (Two-Layer Cascade - Updated Version)
# ─────────────────────────────────────────────────────

def run_smart_selector(user_filename, trigger_threshold=0.10):
    """
    Layer 1: คัดเลือกด้วย MFCC DTW (หารเฉลี่ยปกติ)
    Layer 2: หาก % diff ต่ำกว่าขีดจำกัด จะดึง Feature Fusion (MFCC + Chroma) 
             และปรับ Normalization เป็น max(T_ref, T_user) เพื่อแก้ไขคำก้ำกึ่ง
    """
    u_path = os.path.join(USER_FOLDER, user_filename)

    # โหลดไฟล์ผู้ใช้ครั้งเดียว
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

    # --- LAYER 2: Feature Fusion Verification (MFCC + Chroma) ---
    if len(results) >= 2:
        dist1 = results[0]["Dist"]
        dist2 = results[1]["Dist"]
        
        # คำนวณ % ความแตกต่างทางสถิติของอันดับ 1 และ 2
        pct_diff = (dist2 - dist1) / (dist1 + 1e-6)

        if pct_diff < trigger_threshold:
            print(f"\n\n [Layer 1 Alert] ค่า % Difference ต่ำเกินไป ({pct_diff*100:.2f}%) เริ่มทำการจำแนกซ้ำด้วย Layer 2 (MFCC + Chroma)...")
            
            # 1. สกัด Feature Fusion ของฝั่ง User
            feat_user_fusion = extract_fusion_features(y_user, sr_user)
            T_user = feat_user_fusion.shape[1]
            
            # 2. นำคู่ Candidates ที่ก้ำกึ่งมา Re-score ใหม่
            chroma_candidates = results[:2]
            layer2_results = []
            
            for cand in chroma_candidates:
                try:
                    # โหลดไฟล์ Reference และสกัดฟีเจอร์แบบผสม
                    y_ref, sr_ref = load_audio(os.path.join(REF_FOLDER, cand["Ref"]))
                    feat_ref_fusion = extract_fusion_features(y_ref, sr_ref)
                    T_ref = feat_ref_fusion.shape[1]
                    
                    # คำนวณ DTW บนพื้นที่ Feature Space แบบผสม
                    band = int(0.15 * max(T_ref, T_user))
                    D, wp_f = librosa.sequence.dtw(
                        X=feat_ref_fusion, Y=feat_user_fusion, metric="cosine", band_rad=band
                    )
                    
                    # 🔥 ปรับปรุงการ Normalization ป้องกันการโกงค่าเฉลี่ยของเส้นตั้งฉาก
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
            
            # จัดอันดับท็อปใหม่ตามคะแนนของ Feature Fusion
            layer2_results.sort(key=lambda x: x["Dist"])
            
            if len(layer2_results) >= 2:
                results[0] = layer2_results[0]
                results[1] = layer2_results[1]

    # ── Console output ──
    print(f"\n📢 วิเคราะห์ประโยค: {user_filename}")
    print(f"{'Rank':<6} | {'Reference':<40} | {'Distance'} | {'Decided By'}")
    print("-" * 85)
    for i, res in enumerate(results[:3], 1):
        print(f"{i:<6} | {res['Ref']:<40} | {res['Dist']:>8.3f} | {res['Layer']}")
    print("-" * 85)
    print(f">>> ประโยคที่ใกล้เคียงที่สุด: {results[0]['Ref']} (ตัดสินโดย: {results[0]['Layer']})")

    return results, feat_user_mfcc

# ─────────────────────────────────────────────────────
# Batch Matching
# ─────────────────────────────────────────────────────
def run_batch_matching():
    user_files = [f for f in os.listdir(USER_FOLDER) if f.lower().endswith(".wav")]

    if not user_files:
        print("❌ 不พบไฟล์ .wav ใน newuser/")
        return

    print(f"\n🔍 เริ่มตรวจสอบทั้งหมด {len(user_files)} ไฟล์\n")
    summary = []

    for u_file in user_files:
        results, _ = run_smart_selector(u_file, trigger_threshold=0.10) # 0.10 = 10%
        if results:
            best = results[0]
            summary.append({"User": u_file, "BestRef": best["Ref"], "Distance": best["Distance"] if "Distance" in best else best["Dist"], "Layer": best["Layer"]})

    print("\n📊 SUMMARY RESULT")
    print(f"{'User File':<35} | {'Matched Reference':<35} | {'DTW':<6} | {'Decided By'}")
    print("-" * 95)
    for row in summary:
        print(f"{row['User']:<35} | {row['BestRef']:<35} | {row['Distance']:<6.3f} | {row['Layer']}")

if __name__ == "__main__":
    run_batch_matching()