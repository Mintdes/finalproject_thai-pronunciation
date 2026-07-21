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
        audio_bytes = await file.read()
        results = run_smart_selector_file(audio_bytes)
        return {"status": "success", "results": results}
    except Exception as e:
        # พิมพ์ประเภทและข้อความ Error ชัดเจน ไม่ให้ว่างเปล่า
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")