# CFDI SQL Lab - UI

Frontend construido con Next.js 14.

## Configuración Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar entorno:
   Copiar `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   (Para local, `active` la URL por defecto es localhost, así que puede estar vacío, pero para verificar prod use la URL real).

3. Correr en desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue en Vercel

1. Importar este repositorio en Vercel.
2. Seleccionar el directorio `ui` como **Root Directory**.
3. En la configuración de "Environment Variables", agregar:
   - `NEXT_PUBLIC_API_URL`: La URL de tu backend desplegado (ej: `https://mi-backend.up.railway.app`).
4. Desplegar.

## Build

```bash
npm run build
```
Esta aplicación es estática/SSR híbrida.
