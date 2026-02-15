'use client';
import { useState, useEffect } from 'react';
import { SqlConsole } from '@/components/SqlConsole';
import { DataPreview } from '@/components/DataPreview';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Dashboard } from '@/components/Dashboard';
import { LearningMode } from '@/components/LearningMode';
import { runQuery, seedData, checkBackendHealth } from '@/lib/api';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

export default function Home() {
    const [results, setResults] = useState<any>({ columns: [], rows: [], rowCount: 0, elapsedMs: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'tables' | 'dashboard' | 'learning'>('learning');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('activeView');
        if (saved === 'tables' || saved === 'dashboard' || saved === 'learning') {
            setView(saved);
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('activeView', view);
        }
    }, [view, isInitialized]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        const check = async () => {
            const isOnline = await checkBackendHealth();
            setBackendStatus(isOnline ? 'online' : 'offline');
        };
        check();
        const interval = setInterval(check, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleRun = async (sql: string) => {
        if (backendStatus === 'offline') {
            setError("Backend is offline. Cannot execute query.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await runQuery(sql);
            setResults(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTable = (table: string) => {
        if (backendStatus === 'offline') {
            setError("Backend is offline. Cannot select table.");
            return;
        }
        handleRun(`SELECT * FROM ${table} LIMIT 100;`);
    };

    const handleSeed = async (scale: string) => {
        if (backendStatus === 'offline') return;
        try {
            await seedData(scale);
            setRefreshKey(prev => prev + 1);
            handleRun("SELECT count(*) as total_comprobantes FROM cfdi_comprobantes;");
        } catch (e: any) {
            setError(e.message);
        }
    };

    // Helper: Extract panel contents to avoid duplication, but adjusting classes for compatibility
    // Removed 'md:w-[30%]' and 'md:shrink-0' because Panel handles sizing/shrinking on desktop.
    // Kept mobile height/width classes.
    const leftPanel = (
        <div className={`w-full min-w-[300px] h-[450px] md:h-full border-b md:border-b-0 md:border-r border-zinc-900 flex flex-col ${backendStatus === 'offline' ? 'opacity-50 pointer-events-none' : ''}`}>
            <SqlConsole onRun={handleRun} isLoading={loading} history={[]} />
        </div>
    );

    const centerPanel = (
        <div className="w-full min-w-0 h-[500px] md:h-full flex flex-col border-b md:border-b-0 md:border-r border-zinc-900 relative">
            <div className="h-10 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-4">
                <div className="flex gap-4 h-full items-center">
                    <img src="/sv.svg" alt="CFDI SQL LAB" className="h-6 w-6" />
                    <button
                        onClick={() => setView('tables')}
                        className={`text-xs font-bold uppercase tracking-wider h-full border-b-2 transition-colors ${view === 'tables' ? 'border-blue-500 text-blue-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Data Browser
                    </button>
                    <button
                        onClick={() => setView('dashboard')}
                        className={`text-xs font-bold uppercase tracking-wider h-full border-b-2 transition-colors ${view === 'dashboard' ? 'border-purple-500 text-purple-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setView('learning')}
                        className={`text-xs font-bold uppercase tracking-wider h-full border-b-2 transition-colors ${view === 'learning' ? 'border-green-500 text-green-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Learning Hub
                    </button>
                </div>

                {/* Backend Status Badge */}
                <div className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold ${backendStatus === 'online' ? 'bg-green-900/30 text-green-400 border border-green-900' :
                    backendStatus === 'offline' ? 'bg-red-900/30 text-red-400 border border-red-900' :
                        'bg-yellow-900/30 text-yellow-400 border border-yellow-900'
                    }`}>
                    {backendStatus === 'online' && <Wifi size={12} />}
                    {backendStatus === 'offline' && <WifiOff size={12} />}
                    {backendStatus === 'checking' && <Loader2 size={12} className="animate-spin" />}
                    <span>
                        {backendStatus === 'online' ? 'BACKEND ONLINE' :
                            backendStatus === 'offline' ? 'BACKEND OFFLINE' : 'CONNECTING...'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {backendStatus === 'offline' && (
                    <div className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                        <WifiOff size={48} className="text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Backend Connection Failed</h2>
                        <p className="text-zinc-400 mb-4 max-w-md">
                            Cannot connect to FastAPI server. Please ensure the backend is running.
                        </p>
                        {process.env.NODE_ENV !== 'production' && (
                            <code className="bg-zinc-900 p-3 rounded border border-zinc-800 text-blue-400 font-mono text-sm block mb-4">
                                uvicorn backend.main:app --reload --port 8000
                            </code>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                {view === 'tables' && (
                    <div className="h-full flex flex-col">
                        {/* Pass a dummy function if offline to prevent errors/actions */}
                        <DataPreview onSelectTable={handleSelectTable} onSeed={handleSeed} />
                    </div>
                )}
                {view === 'dashboard' && (
                    <div className="h-full overflow-y-auto">
                        {backendStatus === 'online' && <Dashboard refresh={refreshKey} />}
                    </div>
                )}
                {view === 'learning' && (
                    <div className="h-full overflow-y-auto">
                        <LearningMode />
                    </div>
                )}
            </div>
        </div>
    );

    const rightPanel = (
        <div className="w-full min-w-[300px] h-[500px] md:h-full flex flex-col">
            <ResultsPanel
                columns={results.columns}
                rows={results.rows}
                rowCount={results.row_count || 0}
                elapsedMs={results.elapsed_ms || 0}
                error={error}
            />
        </div>
    );

    return (
        <>
            {/* Mobile Layout (Vertical Stack) */}
            <main className="flex flex-col min-h-screen w-full bg-zinc-950 overflow-auto md:hidden text-zinc-300 font-sans">
                {leftPanel}
                {centerPanel}
                {rightPanel}
            </main>

            {/* Desktop Layout (Resizable Panels) */}
            <main className="hidden md:flex h-screen w-full bg-zinc-950 overflow-hidden text-zinc-300 font-sans">
                <PanelGroup orientation="horizontal">
                    <Panel defaultSize={25} minSize={20} className="flex flex-col">
                        {leftPanel}
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />

                    <Panel defaultSize={50} minSize={30} className="flex flex-col">
                        {centerPanel}
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-blue-500 transition-colors cursor-col-resize" />

                    <Panel defaultSize={25} minSize={20} className="flex flex-col">
                        {rightPanel}
                    </Panel>
                </PanelGroup>
            </main>
        </>
    );
}
