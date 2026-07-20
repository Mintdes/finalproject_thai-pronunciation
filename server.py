from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import os
import shutil
# นำเข้าฟังก์ชันจากไฟล์โมเดลคัดกรองของคุณ
from twolayermfccandchroma import load_audio, extract_features, calculate_dist

app = FastAPI()
USER_FOLDER = "newuser/"
REF_FOLDER = "newref/"

# ตรวจสอบและสร้างโฟลเดอร์เก็บไฟล์เสียง
os.makedirs(USER_FOLDER, exist_ok=True)
os.makedirs(REF_FOLDER, exist_ok=True)

@app.post("/api/pronounce/evaluate")
async def evaluate_pronunciation(
    audio: UploadFile = File(...),
    phraseKey: str = Form(...) # 🆕 รับชื่อไฟล์ต้นฉบับตรง ๆ ที่ส่งมาจาก React (เช่น "ai-sawasdee.wav")
):
    try:
        # 1. กำหนด Path สำหรับบันทึกเสียงผู้ใช้ที่ส่งมาอัดชั่วคราว
        user_filename = "temp_user_input.wav"
        user_path = os.path.join(USER_FOLDER, user_filename)

        # 2. บันทึกไฟล์เสียงจากหน้าบ้านลงเครื่อง
        with open(user_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # 3. 🎯 ล็อกเป้าหมายจับคู่กับไฟล์เสียงต้นฉบับในระบบทันที
        # phraseKey จะมีค่าเป็นชื่อไฟล์ เช่น "ai-sawasdee.wav" หรือ "morning.mp3" ตามที่หน้าบ้านส่งมา
        ref_path = os.path.join(REF_FOLDER, phraseKey)

        # 4. ตรวจสอบว่าในโฟลเดอร์ newref/ มีไฟล์เสียงชื่อนี้อยู่จริงหรือไม่
        if not os.path.exists(ref_path):
            raise HTTPException(
                status_code=404, 
                detail=f"ไม่พบไฟล์เสียงอ้างอิง '{phraseKey}' ในโฟลเดอร์ {REF_FOLDER} กรุณาตรวจสอบการคัดลอกไฟล์เสียง"
            )

        # 5. สกัดฟีเจอร์เสียงฝั่งผู้ใช้ (User)
        y_user, sr_user = load_audio(user_path)
        feat_user_mfcc = extract_features(y_user, sr_user)
        
        # 6. คำนวณหาคะแนน DTW Distance จับคู่ระหว่างเสียงผู้ใช้และเสียงอ้างอิงตรง ๆ
        # (ระบบจะวิ่งไปดึงและคำนวณระยะห่างกับไฟล์ที่ล็อกไว้ทันที ไม่ต้องวนลูปสแกนทั้งโฟลเดอร์)
        dist, _, _ = calculate_dist(ref_path, feat_user_mfcc, feature_type="mfcc")

        return {
            "success": True,
            "distance": float(dist),          # คะแนนระยะความเพี้ยน (Distance Score) ยิ่งน้อยยิ่งใกล้เคียง
            "matched_phrase": phraseKey,      # ชื่อไฟล์ที่ใช้เปรียบเทียบ
            "layer_used": "Direct Locked (MFCC)"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# สั่งรันเซิร์ฟเวอร์ด้วย uvicorn
if __name__ == "__main__":
    import uvicorn
    from fastapi.middleware.cors import CORSMiddleware
    
    # อนุญาต CORS Middleware ให้ React ยิงเข้ามาได้
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    uvicorn.run(app, host="0.0.0.0", port=5000)