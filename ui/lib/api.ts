const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
    console.warn('⚠️ ADVERTENCIA: NEXT_PUBLIC_API_URL no está definida. Las peticiones usarán localhost.');
}

async function fetchJson(endpoint: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!res.ok) {
            let errorMessage = `Error ${res.status}: ${res.statusText}`;
            try {
                const errorBody = await res.json();
                if (errorBody.detail) errorMessage = errorBody.detail;
            } catch (e) {
                // Ignore JSON parse error on error response
            }
            throw new Error(errorMessage);
        }

        return await res.json();
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Is the backend running?');
        }
        // Network errors (Failed to fetch) usually mean backend is down
        if (error.message === 'Failed to fetch') {
            throw new Error('Backend unavailable. Check if FastAPI is running at ' + API_URL);
        }
        throw error;
    }
}

export async function checkBackendHealth() {
    try {
        await fetchJson('/health', { method: 'GET' });
        return true;
    } catch (e) {
        return false;
    }
}

export async function seedData(scale: string) {
    return fetchJson('/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scale }),
    });
}

export async function runQuery(sql: string) {
    return fetchJson('/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
    });
}

export async function getDashboardStats() {
    return fetchJson('/dashboard');
}

export async function getTables() {
    return fetchJson('/playground/tables');
}

export async function getComprobantes(params: any = {}) {
    const searchParams = new URLSearchParams(params);
    return fetchJson(`/comprobantes?${searchParams.toString()}`);
}
