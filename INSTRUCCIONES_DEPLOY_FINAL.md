# INSTRUCCIONES FINALES DE DESPLIEGUE (Producción)

## ✅ Estado Actual
1. **Frontend**: Desplegado en `https://sql.erickddp.com` (Vercel).
2. **Backend**: Código preparado en `/backend` con endpoints actualizados (`/health` retorna `{"ok": true}`) y CORS configurado para aceptar tu dominio.

## 🚀 PASO UNICO: Desplegar Backend (Render.com)

Usaremos **Render** porque es la opción más sencilla para APIs de Python.

1.  Ve a [dashboard.render.com](https://dashboard.render.com/) y haz clic en **New +** -> **Web Service**.
2.  Conecta tu repositorio de GitHub.
3.  Configura esto EXACTAMENTE así:
    *   **Name**: `cfdi-sql-api` (o lo que gustes).
    *   **Region**: Oreon (US West) o la más cercana.
    *   **Root Directory**: `backend` (⚠️ MUY IMPORTANTE).
    *   **Runtime**: `Python 3`.
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   **Instance Type**: Free (para empezar).
4.  Haz clic en **"Advanced"** o baja a **"Environment Variables"** y agrega:
    *   `PYTHON_VERSION`: `3.9.0`
    *   `ALLOWED_ORIGINS`: `https://sql.erickddp.com,http://localhost:3000`
    *   `DATABASE_URL`: `sqlite:///./app.db`
        *   (*Nota: Con SQLite en Render Free, los datos se borran al reiniciar. Para persistencia real, crea una Postgres Database en Render y usa su URL interna aquí.*)
5.  Haz clic en **Create Web Service**.

## 🔗 Conectar Frontend

Una vez que Render termine (puede tardar unos minutos), verás una URL arriba a la izquierda tipo `https://cfdi-sql-api.onrender.com`.

1.  Ve a tu proyecto en **Vercel**.
2.  Settings -> **Environment Variables**.
3.  Agrega/Edita `NEXT_PUBLIC_API_URL`:
    *   Valor: `https://cfdi-sql-api.onrender.com` (Tu URL real de Render).
    *   **IMPORTANTE**: NO pongas `/` al final.
4.  Ve a **Deployments** y haz "Redeploy" (o haz un push vacío) para que tome la nueva variable.

## 🧪 Verificación Final

1.  Entra a `https://sql.erickddp.com`.
2.  Si ves "BACKEND ONLINE" en verde arriba a la derecha, ¡Felicidades! 🎉
3.  Si ves "Offline", abre la consola del navegador (F12) para ver si es un error de CORS o 404.
    *   Verifica que `/health` en tu API responda `{"ok": true}`.
