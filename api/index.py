from fastapi import FastAPI, HTTPException, UploadFile, File
from TwoLayerAlgo import run_smart_selector_file

app = FastAPI(
    title="Thai Pronunciation API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

@app.post("/api/run-algo")
async def run_algo(file: UploadFile = File(...)):
    try:
        # อ่านข้อมูลไฟล์เสียงที่อัปโหลด
        audio_bytes = await file.read()
        
        # ส่งไปคำนวณในอัลกอริทึม
        results = run_smart_selector_file(audio_bytes)
        
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