from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# SQLite local
engine = create_engine("sqlite:///./senseibird.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class UserStats(Base):
    __tablename__ = "user_stats"
    id = Column(String, primary_key=True, index=True)
    xp = Column(Integer, nullable=False, default=0)
    streak = Column(Integer, nullable=False, default=0)


class Stats(BaseModel):
    xp: int
    streak: int


Base.metadata.create_all(bind=engine)

app = FastAPI(title="SenseiBird API", version="0.1.0")

# CORS para desarrollo: permitir Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stats/{uid}", response_model=Stats)
def get_stats(uid: str):
    db = SessionLocal()
    try:
        row = db.get(UserStats, uid)
        if not row:
            row = UserStats(id=uid, xp=0, streak=0)
            db.add(row)
            db.commit()
            db.refresh(row)
        return Stats(xp=row.xp, streak=row.streak)
    finally:
        db.close()


@app.post("/stats/{uid}")
def set_stats(uid: str, payload: Stats):
    db = SessionLocal()
    try:
        row = db.get(UserStats, uid)
        if not row:
            row = UserStats(id=uid, xp=payload.xp, streak=payload.streak)
            db.add(row)
        else:
            row.xp = payload.xp
            row.streak = payload.streak
        db.commit()
        return {"ok": True}
    finally:
        db.close()
