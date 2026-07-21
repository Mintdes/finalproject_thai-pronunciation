from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uvicorn

# นำเข้าฟังก์ชันจากไฟล์ TwoLayerAlgo.py
from TwoLayerAlgo import load_audio, extract_features, calculate_dist, run_smart_selector

app = FastAPI(title="Thai Pronunciation Model Server")

USER_FOLDER = "newuser/"
REF_FOLDER = "newref/"

os.makedirs(USER_FOLDER, exist_ok=True)
os.makedirs(REF_FOLDER, exist_ok=True)

# ปรับตั้งค่า CORS อนุญาตให้ React (Vite) เชื่อมต่อได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/pronounce/evaluate")
async def evaluate_pronunciation(
    audio: UploadFile = File(...),
    phraseKey: str = Form(""),  # รับชื่อไฟล์เสียงต้นฉบับที่เชื่อมจากประโยคในแอป (เช่น "ai-sawasdee.wav")
    thaiPhrase: str = Form("")  # รับข้อความภาษาไทยสำรอง (เช่น "สวัสดี")
):
    try:
        # 1. บันทึกไฟล์เสียงจากไมค์ของผู้ใช้ลงโฟลเดอร์ชั่วคราว
        user_filename = "temp_user_input.wav"
        user_path = os.path.join(USER_FOLDER, user_filename)

        with open(user_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # 2. ตรวจสอบตำแหน่งไฟล์เสียงอ้างอิงใน newref/ จาก phraseKey ที่ส่งมาจากแอป
        ref_path = os.path.join(REF_FOLDER, phraseKey) if phraseKey else ""

        # กรณีที่ 1: หาไฟล์ตรงกับ phraseKey เจอใน newref/ (ทำงานเร็วและแม่นยำที่สุด)
        if ref_path and os.path.exists(ref_path):
            y_user, sr_user = load_audio(user_path)
            feat_user_mfcc = extract_features(y_user, sr_user)
            
            # คำนวณค่า DTW Distance รายคู่ตรงๆ
            dist, _, _ = calculate_dist(ref_path, feat_user_mfcc, feature_type="mfcc")

            return {
                "success": True,
                "distance": float(dist),
                "matched_phrase": phraseKey,
                "layer_used": "Direct Locked (MFCC)"
            }

        # กรณีที่ 2: ถ้าไม่มี phraseKey หรือหาไฟล์ไม่พบ ให้สลับไปใช้ Two-Layer Cascade Auto Selection
        else:
            print(f"⚠️ ไม่พบไฟล์อ้างอิงเฉพาะ '{phraseKey}' สลับไปใช้ Two-Layer Smart Selector...")
            results, _ = run_smart_selector(user_filename, trigger_threshold=0.10)
            
            if not results:
                raise HTTPException(status_code=500, detail="ไม่สามารถประมวลผลเสียงได้")
                
            best_match = results[0]
            return {
                "success": True,
                "distance": float(best_match["Dist"]),
                "matched_phrase": best_match["Ref"],
                "layer_used": best_match["Layer"]
            }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error in evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)