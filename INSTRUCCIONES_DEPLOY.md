# Guía de Despliegue a Producción

Este proyecto consta de dos partes:
- **Frontend**: Next.js (`/ui`) -> Desplegar en **Vercel**.
- **Backend**: FastAPI (`/backend`) -> Desplegar en **Railway** (recomendado) o Render.

## 1. Preparación del Repositorio

1. Asegúrate de que todos los cambios estén subidos a GitHub:
   ```bash
   git add .
   git commit -m "Preparar deploy"
   git push origin main
   ```

## 2. Backend (Railway) - Recomendado

1. Crea una cuenta en [Railway.app](https://railway.app/).
2. "New Project" -> "Deploy from GitHub repo".
3. Selecciona tu repositorio.
4. **Configuración de Servicio**:
   - Railway detectará la carpeta. Ve a "Settings" del servicio.
   - **Root Directory**: Escribe `/backend`.
   - **Build Command**: (Dejar vacío o `pip install -r requirements.txt` si no es automático).
   - **Start Command**: Railway usará el `Procfile` automáticamente (`uvicorn backend.main:app ...`).
5. **Variables de Entorno**:
   - Ve a la pestaña "Variables".
   - Agrega `ALLOWED_ORIGINS`:
     ```
     https://tu-proyecto-vercel.vercel.app,http://localhost:3000
     ```
     (Reemplaza la URL de Vercel una vez que la tengas).
6. **Generar Dominio**:
   - Ve a la pestaña "Settings" -> "Public Networking" -> "Generate Domain".
   - Copia esta URL (ej: `https://backend-production.up.railway.app`).

## 3. Frontend (Vercel)

1. Crea una cuenta en [Vercel](https://vercel.com/).
2. "Add New..." -> "Project".
3. Importa tu repositorio de GitHub.
4. **Configuración del Proyecto**:
   - **Framework Preset**: Next.js (detectado).
   - **Root Directory**: Click "Edit" y selecciona la carpeta `ui`.
5. **Variables de Entorno**:
   - Expande "Environment Variables".
   - Clave: `NEXT_PUBLIC_API_URL`
   - Valor: La URL del backend de Railway (ej: `https://backend-production.up.railway.app`).
     *IMPORTANTE: Sin barra al final.*
6. Click "Deploy".

## 4. Verificación Final

1. Abre la URL de Vercel.
2. Verifica que el indicador de "Backend" (arriba a la derecha o en el dashboard) diga **ONLINE**.
3. Prueba ejecutar una consulta SQL simple (`SELECT * FROM cfdi_comprobantes LIMIT 5`).
4. Si sale error de "API_URL no configurada", revisa las variables en Vercel y re-despliega.

## Checklist de Archivos Modificados

- `backend/main.py`: Configuración dinámica de CORS y `os.getenv`.
- `backend/requirements.txt`: Corrección de dependencias.
- `backend/Procfile`: Archivo de arranque para Railway/Render.
- `ui/lib/api.ts`: Centralización de `API_URL` y validación en producción.
- `ui/.env.example`: Plantilla de variables de entorno.
- `ui/README.md`: Instrucciones específicas del frontend.
