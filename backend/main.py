from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import render, assets
from pathlib import Path

app = FastAPI(
    title="AI Video Flow API",
    description="AI 短视频自动生成平台后端服务",
    version="0.1.0"
)

# 注册路由
app.include_router(render.router)
app.include_router(assets.router)

# 静态文件服务（素材访问）
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "AI Video Flow API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
