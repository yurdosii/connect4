from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.views import router as api_router
from .connect4.settings import settings
from .db.utils import get_mongodb


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # set up MongoDB
    mongodb = get_mongodb()
    app.mongodb = mongodb  # type: ignore[attr-defined]
    yield
    # close MongoDB connection
    app.mongodb.close()  # type: ignore[attr-defined, operator]


app = FastAPI(lifespan=lifespan)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"Hello": "world"}
