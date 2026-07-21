from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# ดึงฟังก์ชัน run_smart_selector มาจาก TwoLayerAlgo.py
from TwoLayerAlgo import run_smart_selector

app = FastAPI(
    title="Thai Pronunciation API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

class AudioRequest(BaseModel):
    user_filename: str
    trigger_threshold: Optional[float] = 0.10

@app.post("/api/run-algo")
def run_algo(data: AudioRequest):
    try:
        # เรียกใช้ฟังก์ชัน run_smart_selector
        results, _ = run_smart_selector(
            user_filename=data.user_filename,
            trigger_threshold=data.trigger_threshold
        )
        
        # ตัดข้อมูล numpy / array ออก เพื่อให้แปลงเป็น JSON ส่งกลับไป Frontend ได้
        clean_results = [
            {
                "Ref": r["Ref"],
                "Dist": float(r["Dist"]),
                "Layer": r["Layer"]
            }
            for r in results
        ]
        
        return {
            "status": "success",
            "best_match": clean_results[0] if clean_results else None,
            "all_results": clean_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))