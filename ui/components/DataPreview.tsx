import { useState, useEffect } from 'react';
import { Database, FolderTree, PlayCircle, Loader2 } from 'lucide-react';
import { seedData, getTables } from '@/lib/api';

interface DataPreviewProps {
    onSelectTable: (tableName: string) => void;
    onSeed: (scale: string) => Promise<void>;
}

export function DataPreview({ onSelectTable, onSeed }: DataPreviewProps) {
    const [seeding, setSeeding] = useState(false);
    const [tables, setTables] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTables().then(data => {
            setTables(data);
            setLoading(false);
        });
    }, []);

    const handleSeed = async (scale: string) => {
        setSeeding(true);
        try {
            await onSeed(scale);
        } catch (e) {
            console.error(e);
        }
        setSeeding(false);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900">
            <div className="p-4 border-b border-zinc-900">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Database size={14} className="text-green-500" /> Database Schema
                </h2>

                {loading ? (
                    <div className="text-zinc-500 text-xs flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" /> Loading schema...
                    </div>
                ) : (
                    <div className="space-y-1">
                        {Object.keys(tables).map(t => (
                            <div key={t} className="group">
                                <button
                                    onClick={() => onSelectTable(t)}
                                    className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-all flex items-center gap-2"
                                >
                                    <FolderTree size={14} className="opacity-50 group-hover:text-blue-400 group-hover:opacity-100 transition-opacity" />
                                    {t}
                                </button>
                                {/* Simple column list hint on hover? or just indented */}
                                <div className="hidden group-hover:block pl-8 pr-2 py-1">
                                    {tables[t].slice(0, 5).map((col: any) => (
                                        <div key={col.name} className="text-[10px] text-zinc-600 font-mono truncate">
                                            {col.name} <span className="text-zinc-700">({col.type})</span>
                                        </div>
                                    ))}
                                    {tables[t].length > 5 && <div className="text-[10px] text-zinc-700 italic">...</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 flex-1">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <PlayCircle size={14} className="text-purple-500" /> Actions
                </h2>

                <div className="flex flex-col gap-2">
                    <button
                        disabled={seeding}
                        onClick={() => handleSeed("small")}
                        className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2 rounded border border-zinc-800 transition-colors disabled:opacity-50 text-left flex justify-between items-center"
                    >
                        Start Seed (Small)
                        {seeding && <Loader2 size={12} className="animate-spin" />}
                    </button>
                    <button
                        disabled={seeding}
                        onClick={() => handleSeed("medium")}
                        className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2 rounded border border-zinc-800 transition-colors disabled:opacity-50 text-left flex justify-between items-center"
                    >
                        Start Seed (Medium)
                        {seeding && <Loader2 size={12} className="animate-spin" />}
                    </button>
                    <button
                        disabled={seeding}
                        onClick={() => handleSeed("large")}
                        className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2 rounded border border-zinc-800 transition-colors disabled:opacity-50 text-left flex justify-between items-center"
                    >
                        Start Seed (Large)
                        {seeding && <Loader2 size={12} className="animate-spin" />}
                    </button>
                </div>

                <div className="mt-8 p-4 bg-zinc-900/50 rounded border border-zinc-900">
                    <h3 className="text-xs font-bold text-zinc-500 mb-2">PRO TIP</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                        Click a table name to preview its contents (LIMIT 100). Use the SQL Console to run custom queries.
                    </p>
                </div>
            </div>
        </div>
    );
}
