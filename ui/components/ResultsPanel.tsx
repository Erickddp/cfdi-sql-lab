import { ArrowDownToLine, Zap, Download, Database } from "lucide-react";

interface ResultsPanelProps {
    columns: string[];
    rows: any[];
    rowCount: number;
    elapsedMs: number;
    error?: string | null;
}

export function ResultsPanel({ columns, rows, rowCount, elapsedMs, error }: ResultsPanelProps) {

    const handleExport = () => {
        if (!rows.length) return;

        // Simple CSV Export
        const header = columns.join(",");
        const csv = rows.map(row =>
            columns.map(col => {
                const val = row[col];
                if (val === null) return "";
                if (typeof val === "string" && val.includes(",")) return `"${val}"`;
                return val;
            }).join(",")
        ).join("\n");

        const blob = new Blob([header + "\n" + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results_${new Date().getTime()}.csv`;
        a.click();
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-mono text-sm">
            <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-950">
                <span className="font-bold text-zinc-400 text-xs uppercase flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> Result Grid
                </span>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{rowCount} rows</span>
                    <span>{elapsedMs}ms</span>
                    <button
                        onClick={handleExport}
                        disabled={rowCount === 0}
                        className="hover:text-zinc-200 disabled:opacity-50"
                        title="Export CSV"
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            <div
                className="flex-1 w-full overflow-auto bg-zinc-950 relative"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                {error && (
                    <div className="absolute inset-0 p-4 font-mono text-red-400">
                        ERROR: {error}
                    </div>
                )}

                {!error && columns.length > 0 && (
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead className="sticky top-0 bg-zinc-900 z-10 shadow-sm">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col} className="p-2 border-b border-zinc-800 text-zinc-300 font-normal whitespace-nowrap text-xs uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-900/50 border-b border-zinc-900/50 last:border-0 text-zinc-400">
                                    {columns.map((col) => (
                                        <td key={`${i}-${col}`} className="p-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-xs">
                                            {row[col] === null ? <span className="text-zinc-600 italic">NULL</span> : String(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!error && columns.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-700">
                        <Database size={48} className="opacity-20 mb-4" />
                        <p className="italic">No results to display. Run a query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
