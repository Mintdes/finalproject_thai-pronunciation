import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt
import os

REF_FOLDER = "newref/" # โฟลเดอร์สำหรับเก็บไฟล์ต้นฉบับ ซึ่งเป็นเสียง AI
USER_FOLDER = "newuser/" # โฟลเดอร์สำหรับเก็บไฟล์ที่ User พูดมาเพื่อตรวจสอบ

def extract_features(y, sr):
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc = (mfcc - np.mean(mfcc, axis=1, keepdims=True)) / (np.std(mfcc, axis=1, keepdims=True) + 1e-6)
    return mfcc

def calculate_dist(ref_path, user_path):
    try:
        y_ref, _ = librosa.load(ref_path, sr=22050)
        y_user, _ = librosa.load(user_path, sr=22050)

        y_ref, _ = librosa.effects.trim(y_ref, top_db=20)
        y_user, _ = librosa.effects.trim(y_user, top_db=20)
        
        feat_ref = extract_features(y_ref, 22050)
        feat_user = extract_features(y_user, 22050)

        # -------------------------------
        # วิธีที่ 1: Global path constraint
        # จำกัด DTW ให้อยู่ใกล้ diagonal
        # -------------------------------
        T_ref = feat_ref.shape[1]
        T_user = feat_user.shape[1]
        band = int(0.15 * max(T_ref, T_user))  # 10–15% เป็นช่วงที่เหมาะกับ speech

        D, wp = librosa.sequence.dtw(
            X=feat_ref,
            Y=feat_user,
            metric='cosine',
            band_rad=band
        )

        return D[-1, -1] / len(wp)

    except Exception as e:
        return 0.0

def run_smart_selector(user_filename):
    u_path = os.path.join(USER_FOLDER, user_filename)
    
    ref_files = [f for f in os.listdir(REF_FOLDER) if f.endswith('.wav')]
    results = []

    # คำนวณระยะห่าง DTW ทั้งหมด
    for r_file in ref_files:
        dist = calculate_dist(os.path.join(REF_FOLDER, r_file), u_path)
        results.append({"Ref": r_file, "Dist": dist})

    # เรียงลำดับจากระยะห่างน้อยไปมาก (ใกล้เคียงที่สุดก่อน)
    results = sorted(results, key=lambda x: x['Dist'])
    
    # แสดงผล Top 3
    print(f"\n📢 วิเคราะห์ประโยค: {user_filename}")
    print(f"{'Rank':<6} | {'Reference':<40} | {'Distance (DTW)':<40}")
    print("-" * 66)

    for i, res in enumerate(results[:3], 1):
        print(f"{i:<6} | {res['Ref']:<40} | {res['Dist']:>13.3f}")

    print("-" * 66)
    print(f">>> ประโยคที่ใกล้เคียงที่สุด: {results[0]['Ref']} (Distance: {results[0]['Dist']:.3f})")
    
    return results

def run_batch_matching():
    user_files = [
        f for f in os.listdir(USER_FOLDER)
        if f.lower().endswith(".wav")
    ]

    if not user_files:
        print("❌ ไม่พบไฟล์ .wav ใน user_attempts/")
        return

    print(f"\n🔍 เริ่มตรวจสอบทั้งหมด {len(user_files)} ไฟล์\n")

    summary = []

    for u_file in user_files:
        print("=" * 70)
        results = run_smart_selector(u_file)

        if results:
            best = results[0]
            summary.append({
                "User": u_file,
                "BestRef": best["Ref"],
                "Distance": best["Dist"]
            })

    # สรุปรวม
    print("\n📊 SUMMARY RESULT")
    print(f"{'User File':<40} | {'Matched Reference':<40} | {'DTW'}")
    print("-" * 75)

    for row in summary:
        print(f"{row['User']:<40} | {row['BestRef']:<40} | {row['Distance']:.3f}")

def plot_comparison(user_filename, top3_results):
    """พล็อตกราฟเปรียบเทียบเสียงต้นฉบับกับ Top 3 ที่ใกล้เคียงที่สุด"""
    
    u_path = os.path.join(USER_FOLDER, user_filename)
    
    # โหลดเสียงต้นฉบับ
    y_user, sr = librosa.load(u_path, sr=22050)
    y_user, _ = librosa.effects.trim(y_user, top_db=25)
    
    # สร้างกราฟ 4 แถว
    fig, axes = plt.subplots(4, 1, figsize=(7, 6))
    fig.suptitle(f'Comparison: {user_filename}', fontsize=16, fontweight='bold')
    
    # แถวที่ 1: เสียงต้นฉบับ (User)
    librosa.display.waveshow(y_user, sr=sr, ax=axes[0], color='blue')
    axes[0].set_title('User Sound', fontsize=12, fontweight='bold')
    axes[0].set_xlabel('Time (s)')
    axes[0].set_ylabel('Amplitude')
    
    # แถวที่ 2-4: Top 3 อันดับที่ใกล้เคียงที่สุด
    for i, result in enumerate(top3_results[:3], 1):
        ref_path = os.path.join(REF_FOLDER, result['Ref'])
        
        # โหลดไฟล์เสียงอ้างอิง
        y_ref, sr_ref = librosa.load(ref_path, sr=22050)
        y_ref, _ = librosa.effects.trim(y_ref, top_db=25)
        
        # Waveform
        librosa.display.waveshow(y_ref, sr=sr_ref, ax=axes[i], color='green')
        axes[i].set_title(f'#{i} - {result["Ref"]} (Distance: {result["Dist"]:.4f})', 
                            fontsize=11, fontweight='bold')
        axes[i].set_xlabel('Time (s)')
        axes[i].set_ylabel('Amplitude')
    
    plt.tight_layout()
    plt.show()

# --- Run Program ---
if __name__ == "__main__":
    # ระบุชื่อไฟล์ที่ User พูดมาเพียง 1 ไฟล์
    TARGET_USER_FILE = "us0.03-watchmovies.wav"
    
    # รันการเปรียบเทียบและเรียงลำดับ
    ranked_list = run_smart_selector(TARGET_USER_FILE)
    
    best_match = ranked_list[0]
    run_batch_matching()
    # print(f"\n✅ ผลสรุป: ประโยคที่ใกล้เคียงที่สุดคือ '{best_match['Ref']}' (Distance: {best_match['Dist']:.3f})")
    # plot_comparison(TARGET_USER_FILE, ranked_list)