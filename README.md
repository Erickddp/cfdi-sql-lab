# CFDI SQL LAB

Una app web interactiva para aprender SQL con conceptos reales de CFDI 4.0 (México), usando 100% datos ficticios.

## Requisitos previos

- Python 3.9+
- Node.js 18+

## Instrucciones de Instalación (Windows)

### 1. Backend (FastAPI)

Abrir una terminal en `cfdi-sql-lab/backend`:

```powershell
# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
> Nota: Asegúrate de ejecutar uvicorn desde el directorio padre (`cfdi-sql-lab`) o ajustar el import.
> Si estás dentro de la carpeta `backend`, usa: `uvicorn main:app --reload`

### 2. Frontend (Next.js)

Abrir otra terminal en `cfdi-sql-lab/ui`:

```powershell
# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev
```

### 3. Uso

1. Abrir navegador en `http://localhost:3000`.
2. En el panel central "Data Browser", hacer clic en "Start Seed (Small)" para generar datos iniciales.
3. Usar el "Data Browser" para explorar tablas.
4. Usar "Dashboard" para ver KPIs.
5. Usar "SQL Console" a la izquierda para escribir queries o usar las "Guided Queries".

## Estructura del Modelo de Datos

- **cfdi_comprobantes**: Tabla principal (facturas).
- **cfdi_emisores**: Quien emite la factura.
- **cfdi_receptores**: Quien recibe la factura.
- **cfdi_conceptos**: Los ítems de la factura.
- **pagos**: Registro de pagos y abonos.
"# cfdi-sql-lab" 
