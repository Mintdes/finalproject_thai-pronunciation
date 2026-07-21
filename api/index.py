from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from TwoLayerAlgo import run_smart_selector_file

# 🎯 กำหนด docs_url และ openapi_url ให้เป็น Relative Path หรือตรงตาม Vercel Prefix
app = FastAPI(
    title="Thai Pronunciation API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/run-algo")
async def run_algo(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        results = run_smart_selector_file(audio_bytes)
        
        if not results:
            raise HTTPException(status_code=500, detail="ไม่สามารถประมวลผลเสียงได้")

        best_match = results[0]
        return {
            "success": True,
            "distance": float(best_match["Dist"]),
            "matched_phrase": best_match["Ref"],
            "layer_used": best_match["Layer"],
            "best_match": best_match,
            "all_results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))