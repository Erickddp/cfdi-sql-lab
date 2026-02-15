import random
import uuid
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from models import SessionLocal, CfdiComprobante, CfdiEmisor, CfdiReceptor, CfdiConcepto, Pago, engine

fake = Faker('es_MX')

def generate_rfc():
    # Simulate a Mexican RFC structure (FAKE)
    letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=4))
    date_part = fake.date_of_birth(minimum_age=18, maximum_age=90).strftime('%y%m%d')
    homoclave = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=3))
    return f"{letters}{date_part}{homoclave}"

def seed_database(scale: str):
    db = SessionLocal()
    
    # Scale configuration
    if scale == "small":
        count = 200
    elif scale == "medium":
        count = 2000
    elif scale == "large":
        count = 10000
    else:
        count = 50

    print(f"Seeding {count} records...")

    emisores = []
    receptores = []

    # Pre-generate some Emisores & Receptores for reuse
    for _ in range(max(10, count // 20)):
        emisores.append(CfdiEmisor(
            rfc=generate_rfc(),
            nombre=fake.company(),
            regimen_fiscal=random.choice(["601", "612", "626"])
        ))
    
    for _ in range(max(10, count // 20)):
        receptores.append(CfdiReceptor(
            rfc=generate_rfc(),
            nombre=fake.name(),
            domicilio_fiscal_cp=fake.postcode(),
            regimen_fiscal_receptor=random.choice(["616", "605", "612"]),
            uso_cfdi=random.choice(["G03", "D04", "P01"])
        ))
    
    try:
        db.add_all(emisores)
        db.add_all(receptores)
        db.commit()
    except:
        db.rollback()
        # Fetch existing if error (e.g. unique constraint on regenerate)
        emisores = db.query(CfdiEmisor).all()
        receptores = db.query(CfdiReceptor).all()

    # Refresh lists with IDs
    emisores = db.query(CfdiEmisor).all()
    receptores = db.query(CfdiReceptor).all()

    comprobantes = []
    conceptos_batch = []
    pagos_batch = []

    start_date = datetime.now() - timedelta(days=365)

    for i in range(count):
        fecha_emision = fake.date_time_between(start_date=start_date, end_date="now")
        metodo_pago = random.choices(["PUE", "PPD"], weights=[0.7, 0.3])[0]
        estatus = random.choices(["Vigente", "Cancelado"], weights=[0.85, 0.15])[0]
        
        # Determine total based on concepts
        num_conceptos = random.randint(1, 4)
        subtotal_acc = 0.0
        
        c = CfdiComprobante(
            uuid=str(uuid.uuid4()),
            version="4.0",
            serie=random.choice(["A", "B", "F", "NC"]),
            folio=str(random.randint(1000, 99999)),
            fecha_emision=fecha_emision,
            fecha_timbrado=fecha_emision + timedelta(seconds=random.randint(1, 300)),
            tipo_comprobante="I",
            moneda=random.choices(["MXN", "USD"], weights=[0.9, 0.1])[0],
            exportacion="01",
            metodo_pago=metodo_pago,
            forma_pago=random.choice(["01", "03", "99"]),
            lugar_expedicion_cp=fake.postcode(),
            estatus_sat=estatus,
            emisor=random.choice(emisores),
            receptor=random.choice(receptores),
            fecha_cancelacion=fecha_emision + timedelta(days=random.randint(1, 30)) if estatus == "Cancelado" else None
        )

        # Generate Conceptos
        conceptos_list = []
        for _ in range(num_conceptos):
            cantidad = random.randint(1, 100)
            valor_unitario = round(random.uniform(10.0, 5000.0), 2)
            importe = round(cantidad * valor_unitario, 2)
            subtotal_acc += importe
            
            # Tax logic
            is_exento = random.random() < 0.1
            tasa = 0.16 if not is_exento else 0.0
            
            conc = CfdiConcepto(
                clave_prod_serv=str(random.randint(10000000, 99999999)),
                cantidad=cantidad,
                clave_unidad="H87",
                descripcion=fake.sentence(nb_words=4),
                valor_unitario=valor_unitario,
                importe=importe,
                descuento=0.0,
                objeto_imp="02" if not is_exento else "01",
                impuesto_codigo="002" if not is_exento else None,
                tipo_factor="Tasa" if not is_exento else "Exento",
                tasa_o_cuota=tasa
            )
            conceptos_list.append(conc)

        c.subtotal = subtotal_acc
        c.descuento = 0.0 # Simplify
        iva_total = sum([x.importe * x.tasa_o_cuota for x in conceptos_list if x.tasa_o_cuota])
        c.total = round(subtotal_acc + iva_total, 2)
        c.monto_pagado = 0.0
        
        # Generate Pagos
        pagos_list = []
        if estatus == "Vigente":
            if metodo_pago == "PUE":
                # Paid in full instantly
                c.monto_pagado = c.total
                c.fecha_pago = fecha_emision
                c.saldo = 0.0
            else:
                # PPD: Random payment
                paid_status = random.random()
                if paid_status < 0.5:
                    # Paid partial or full later
                    monto = round(random.uniform(c.total * 0.1, c.total), 2)
                    c.monto_pagado = monto
                    c.saldo = round(c.total - monto, 2)
                    
                    p = Pago(
                        fecha_pago=fecha_emision + timedelta(days=random.randint(1, 60)),
                        monto=monto,
                        metodo=random.choice(["03", "01"]),
                        referencia=fake.bban()
                    )
                    pagos_list.append(p)
                else:
                    c.saldo = c.total

        comprobantes.append(c)
        # We need to add to session to get ID for relationships, 
        # but bulk insert is faster. For simplicity with relationships, add to session.
        db.add(c)
        db.flush() # To get ID into c

        for conc in conceptos_list:
            conc.comprobante_id = c.id
            conceptos_batch.append(conc)
        
        for p in pagos_list:
            p.comprobante_id = c.id
            pagos_batch.append(p)

        if i % 100 == 0:
            db.commit() # Periodic commit

    db.add_all(conceptos_batch)
    db.add_all(pagos_batch)
    db.commit()
    db.close()
    return {"message": f"Seeded {count} records successfully"}
