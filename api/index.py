from fastapi import FastAPI, HTTPException, UploadFile, File
from typing import Optional

# import ฟังก์ชันประมวลผลจาก TwoLayerAlgo
from TwoLayerAlgo import main_algorithm

app = FastAPI(
    title="Thai Pronunciation API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

@app.get("/api")
@app.get("/api/")
def root():
    return {"status": "ok", "message": "API is working"}

@app.post("/api/run-algo")
async def run_algo(file: UploadFile = File(...)):
    try:
        # อ่านไฟล์เสียงเป็น Bytes
        audio_bytes = await file.read()
        
        # ส่งข้อมูลไฟล์ไปยังอัลกอริทึมของคุณ
        result = main_algorithm(audio_bytes)
        
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))