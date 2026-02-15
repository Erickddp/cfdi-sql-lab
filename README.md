# CFDI SQL LAB

Una app web interactiva para aprender SQL con conceptos reales de CFDI 4.0 (México), usando 100% datos ficticios.

## 📦 Estructura del Proyecto

Este monorepo contiene dos partes:
- **/ui**: Frontend (Next.js) -> Desplegable en **Vercel**
- **/backend**: Backend (FastAPI) -> Desplegable en **Render / Railway / Fly.io**

## 🗄️ Modelo de Datos

- **cfdi_comprobantes**: Tabla principal (facturas).
- **cfdi_emisores**: Quien emite la factura.
- **cfdi_receptores**: Quien recibe la factura.
- **cfdi_conceptos**: Los ítems de la factura.
- **pagos**: Registro de pagos y abonos.

---

## 🛠️ Desarrollo Local

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd ui
npm install
# Crear .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

---

## 🚀 Guía de Despliegue (Production)

### PASO 1: Backend (Render / Railway)

1.  **Nuevo Web Service** conectando este repo.
2.  **Root Directory**: `backend` (IMPORTANTE).
3.  **Build Command**: `pip install -r requirements.txt`.
4.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5.  **Environment Variables**:
    -   `PYTHON_VERSION`: `3.9.0`
    -   `DATABASE_URL`: `sqlite:///./app.db` (Demo) o `postgresql://...` (Prod).
    -   `ALLOWED_ORIGINS`: `https://tu-proyecto.vercel.app,http://localhost:3000`.

### PASO 2: Frontend (Vercel)

1.  **Nuevo Proyecto** importando este repo.
2.  **Root Directory**: `ui` (IMPORTANTE: Editar esto en Settings > General).
3.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: URL de tu backend (ej: `https://mi-backend.onrender.com`).

---

## ✅ Checklist de Verificación

### 1. Archivos Ignorados (.gitignore)
Se ha configurado `.gitignore` para NO subir archivos sensibles o pesados:
-   `node_modules` (en raíz y subcarpetas)
-   `.next` (build artifacts)
-   `.env` y `.env.local` (secretos)
-   `app.db` (base de datos local)
-   `.venv` y `__pycache__`

### 2. Configuración
-   **Backend**: `Procfile` listo (`web: uvicorn backend.main:app ...`) para compatibilidad. CORS habilitado. DB configurable por ENV.
-   **Frontend**: `NEXT_PUBLIC_API_URL` implementado dinámicamente. `localStorage` seguro.
