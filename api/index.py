from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

# กำหนด docs_url และ openapi_url ให้อยู่ใต้ /api
app = FastAPI(
    title="Thai Pronunciation API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

@app.get("/api")
@app.get("/api/")
def root():
    return {"status": "ok", "message": "Thai Pronunciation API is running"}

# กำหนดโครงสร้างข้อมูลที่รับเข้ามา (ถ้ามี)
class InputData(BaseModel):
    params: Optional[Dict[str, Any]] = None

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is running on Vercel"}

@app.post("/api/run-algo")
def run_algo(data: InputData):
    try:
        # เรียกใช้ฟังก์ชันจาก TwoLayerAlgo.py
        result = main_algorithm(data.params)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# สำคัญ: ตัวแปรแอปต้องชื่อ 'app' เพื่อให้ Vercel เรียกใช้ได้โดยอัตโนมัติ