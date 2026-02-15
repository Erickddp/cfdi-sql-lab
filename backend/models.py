from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime

import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CfdiEmisor(Base):
    __tablename__ = "cfdi_emisores"
    id = Column(Integer, primary_key=True, index=True)
    rfc = Column(String, unique=True, index=True)
    nombre = Column(String)
    regimen_fiscal = Column(String)

class CfdiReceptor(Base):
    __tablename__ = "cfdi_receptores"
    id = Column(Integer, primary_key=True, index=True)
    rfc = Column(String, unique=True, index=True)
    nombre = Column(String)
    domicilio_fiscal_cp = Column(String)
    regimen_fiscal_receptor = Column(String)
    uso_cfdi = Column(String)

class CfdiComprobante(Base):
    __tablename__ = "cfdi_comprobantes"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True)
    version = Column(String, default="4.0")
    serie = Column(String)
    folio = Column(String)
    fecha_emision = Column(DateTime, index=True)
    fecha_timbrado = Column(DateTime)
    tipo_comprobante = Column(String) # I/E/P/N
    moneda = Column(String)
    subtotal = Column(Float)
    descuento = Column(Float)
    total = Column(Float)
    exportacion = Column(String)
    metodo_pago = Column(String)
    forma_pago = Column(String)
    lugar_expedicion_cp = Column(String)
    estatus_sat = Column(String, index=True) # Vigente/Cancelado
    fecha_cancelacion = Column(DateTime, nullable=True)
    
    # Campos operativos
    fecha_recepcion = Column(DateTime, nullable=True)
    fecha_programacion_pago = Column(DateTime, nullable=True)
    fecha_pago = Column(DateTime, nullable=True)
    monto_pagado = Column(Float, default=0.0)
    saldo = Column(Float) # total - monto_pagado. Updated via trigger or app logic.
    notas = Column(Text, nullable=True)
    fecha_vencimiento = Column(DateTime, nullable=True) # Para calculo de vencidas

    emisor_id = Column(Integer, ForeignKey("cfdi_emisores.id"))
    receptor_id = Column(Integer, ForeignKey("cfdi_receptores.id"))

    emisor = relationship("CfdiEmisor", backref="comprobantes")
    receptor = relationship("CfdiReceptor", backref="comprobantes")
    conceptos = relationship("CfdiConcepto", back_populates="comprobante", cascade="all, delete-orphan")
    pagos_relacionados = relationship("Pago", back_populates="comprobante", cascade="all, delete-orphan")

class CfdiConcepto(Base):
    __tablename__ = "cfdi_conceptos"
    id = Column(Integer, primary_key=True, index=True)
    comprobante_id = Column(Integer, ForeignKey("cfdi_comprobantes.id"))
    clave_prod_serv = Column(String)
    no_identificacion = Column(String, nullable=True)
    cantidad = Column(Float)
    clave_unidad = Column(String)
    unidad = Column(String, nullable=True)
    descripcion = Column(String)
    valor_unitario = Column(Float)
    importe = Column(Float)
    descuento = Column(Float)
    objeto_imp = Column(String)
    impuesto_codigo = Column(String, nullable=True)
    tipo_factor = Column(String, nullable=True)
    tasa_o_cuota = Column(Float, nullable=True)

    comprobante = relationship("CfdiComprobante", back_populates="conceptos")

class Pago(Base):
    __tablename__ = "pagos"
    id = Column(Integer, primary_key=True, index=True)
    comprobante_id = Column(Integer, ForeignKey("cfdi_comprobantes.id"))
    fecha_pago = Column(DateTime)
    monto = Column(Float)
    metodo = Column(String) # TRANSFER/CASH/CARD
    referencia = Column(String, nullable=True)

    comprobante = relationship("CfdiComprobante", back_populates="pagos_relacionados")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
