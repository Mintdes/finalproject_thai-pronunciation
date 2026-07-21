from fastapi import FastAPI, HTTPException, UploadFile, File
from TwoLayerAlgo import main_algorithm

app = FastAPI(
    title="Thai Pronunciation API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

@app.post("/api/run-algo")
async def run_algo(file: UploadFile = File(...)):
    try:
        # อ่านไฟล์เสียงที่ User ส่งมาจาก Frontend
        audio_bytes = await file.read()
        
        # ส่งไฟล์เสียงเข้าโมเดลเพื่อคำนวณ
        result = main_algorithm(audio_bytes)
        
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))