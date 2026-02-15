import { useState } from 'react';
import { Play, Code, Database, History, BookOpen, ChevronRight } from 'lucide-react';
import { GUIDED_QUERIES } from '@/lib/queries';

interface SqlConsoleProps {
    onRun: (sql: string) => void;
    isLoading: boolean;
    history: string[];
}

export function SqlConsole({ onRun, isLoading, history }: SqlConsoleProps) {
    const [sql, setSql] = useState<string>("SELECT * FROM cfdi_comprobantes LIMIT 10;");
    const [showGuided, setShowGuided] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            onRun(sql);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900">
            <div className="flex items-center justify-between p-2 border-b border-zinc-900 bg-zinc-950">
                <span className="font-bold text-zinc-400 text-xs uppercase flex items-center gap-2">
                    <Code size={14} className="text-blue-500" /> SQL Playground
                </span>
                <button
                    disabled={isLoading}
                    onClick={() => onRun(sql)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs disabled:opacity-50 transition-colors shadow-sm shadow-blue-900/20 font-bold"
                >
                    <Play size={12} fill="currentColor" /> RUN
                </button>
            </div>

            <div className="flex-1 relative group">
                <textarea
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-zinc-950 text-zinc-300 font-mono text-sm p-4 resize-none focus:outline-none scrollbar-thin selection:bg-blue-500/30"
                    spellCheck={false}
                    placeholder="-- Write your SQL query here..."
                />

                {/* Floating Hint */}
                <div className="absolute bottom-4 right-4 text-xs text-zinc-600 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    Ctrl + Enter to run
                </div>
            </div>

            <div className="h-[40%] border-t border-zinc-900 flex flex-col bg-zinc-900/30">
                <div
                    className="border-b border-zinc-900 p-2 text-xs font-bold text-zinc-400 flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors"
                    onClick={() => setShowGuided(!showGuided)}
                >
                    <span className="flex items-center gap-2"><BookOpen size={12} /> GUIDED QUERIES ({GUIDED_QUERIES.length})</span>
                    {/* <ChevronRight size={12} className={`transition-transform ${showGuided ? 'rotate-90' : ''}`} /> */}
                </div>

                <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                    {GUIDED_QUERIES.map((q) => (
                        <div
                            key={q.id}
                            onClick={() => setSql(q.sql)}
                            className="group cursor-pointer p-3 border-b border-zinc-900/50 hover:bg-zinc-900 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-zinc-300 text-xs font-semibold group-hover:text-blue-400 transition-colors">{q.id}. {q.title}</span>
                                <span className={`text-[10px] px-1 rounded ${q.difficulty === 1 ? 'bg-green-900 text-green-300' : q.difficulty === 2 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                                    Lvl {q.difficulty}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-[10px] leading-tight mb-2">{q.description}</p>
                            <div className="flex gap-1 flex-wrap">
                                {q.tags.map(tag => (
                                    <span key={tag} className="text-[9px] text-zinc-600 bg-zinc-950 px-1 rounded border border-zinc-800">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
