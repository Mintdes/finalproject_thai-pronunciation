from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

# ดึงฟังก์ชันหรือคลาสมาจาก TwoLayerAlgo.py ของคุณ
from TwoLayerAlgo import main_algorithm  # (เปลี่ยนเป็นชื่อฟังก์ชันที่คุณใช้)

app = FastAPI(title="TwoLayerAlgo API")

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