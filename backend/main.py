import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from .models import Base, engine, SessionLocal, CfdiComprobante, CfdiEmisor, CfdiReceptor, CfdiConcepto, Pago
from .seed import seed_database as run_seed

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CFDI SQL LAB")

origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Schemas ---
class SeedRequest(BaseModel):
    scale: str = "small"

class PlaygroundRequest(BaseModel):
    sql: str

class ComprobanteBase(BaseModel):
    uuid: str
    fecha_emision: datetime
    total: float
    estatus_sat: str
    moneda: str
    metodo_pago: str
    
    class Config:
        orm_mode = True

# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/seed")
def seed_data(req: SeedRequest):
    try:
        # Simple blocking seed for this demo. Ideally use background tasks.
        run_seed(req.scale)
        return {"status": "success", "message": f"Seeded {req.scale} dataset."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/comprobantes")
def list_comprobantes(
    skip: int = 0, 
    limit: int = 100, 
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CfdiComprobante)
    if q:
        query = query.filter(
            (CfdiComprobante.uuid.like(f"%{q}%")) | 
            (CfdiComprobante.folio.like(f"%{q}%"))
        )
    return query.offset(skip).limit(limit).all()

@app.get("/playground/tables")
def get_tables(db: Session = Depends(get_db)):
    try:
        # Helper to get table names and columns
        from sqlalchemy import inspect
        inspector = inspect(engine)
        # FIX: use get_table_names() instead of get_tables()
        table_names = inspector.get_table_names()
        
        if not table_names:
            return {}

        table_info = {}
        for table_name in table_names:
            columns = []
            for col in inspector.get_columns(table_name):
                columns.append({
                    "name": col["name"], 
                    "type": str(col["type"]),
                    "nullable": col.get("nullable"),
                    "primary_key": col.get("primary_key"),
                    "default": str(col.get("default")) if col.get("default") else None
                })
            table_info[table_name] = columns
        return table_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/playground/run")
def run_playground_sql(req: PlaygroundRequest, db: Session = Depends(get_db)):
    sql = req.sql.strip()
    
    # Basic security: ONLY ALLOW SELECT
    forbidden = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", "CREATE"]
    if any(word in sql.upper() for word in forbidden):
        raise HTTPException(status_code=400, detail="Only SELECT queries are allowed in this playground.")
    
    try:
        start_time = datetime.now()
        result = db.execute(text(sql))
        end_time = datetime.now()
        
        elapsed_ms = (end_time - start_time).total_seconds() * 1000
        
        # Format results
        keys = result.keys()
        rows = [dict(zip(keys, row)) for row in result.fetchall()]
        
        return {
            "columns": list(keys),
            "rows": rows,
            "row_count": len(rows),
            "elapsed_ms": round(elapsed_ms, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_comprobantes = db.query(func.count(CfdiComprobante.id)).scalar()
    total_facturado = db.query(func.sum(CfdiComprobante.total)).scalar() or 0
    total_vigentes = db.query(func.count(CfdiComprobante.id)).filter(CfdiComprobante.estatus_sat == "Vigente").scalar()
    
    # Top Emisores
    top_emisores_res = db.execute(text("""
        SELECT e.nombre, SUM(c.total) as total 
        FROM cfdi_comprobantes c
        JOIN cfdi_emisores e ON c.emisor_id = e.id
        GROUP BY e.nombre
        ORDER BY total DESC
        LIMIT 5
    """)).fetchall()
    
    top_emisores = [{"name": r[0], "value": r[1]} for r in top_emisores_res]

    return {
        "kpis": {
            "total_docs": total_comprobantes,
            "total_amount": round(total_facturado, 2),
            "vigentes": total_vigentes
        },
        "top_emisores": top_emisores
    }
