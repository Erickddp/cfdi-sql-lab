import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/api';

interface DashboardProps {
    refresh: number;
}

export function Dashboard({ refresh }: DashboardProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getDashboardStats().then(data => {
            setStats(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [refresh]);

    if (loading) return <div className="p-10 text-zinc-500 animate-pulse">Loading dashboard...</div>;
    if (!stats) return <div className="p-10 text-red-500">Error loading dashboard</div>;

    const { kpis, top_emisores } = stats;

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto bg-zinc-950">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-blue-500" /> Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Total Comprobantes" value={kpis.total_docs} icon={<FileText size={20} className="text-zinc-400" />} />
                <Card title="Monto Facturado" value={`$${kpis.total_amount.toLocaleString()}`} icon={<DollarSign size={20} className="text-green-500" />} />
                <Card title="Vigentes" value={kpis.vigentes} sub={`Of ${kpis.total_docs}`} icon={<Activity size={20} className="text-purple-500" />} />
            </div>

            <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Top 5 Emisores (Monto)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top_emisores} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                            itemStyle={{ color: '#f4f4f5' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function formatCompactNumber(number: number | string) {
    if (typeof number !== 'number') return number;
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
}

function Card({ title, value, sub, icon }: any) {
    const displayValue = typeof value === 'string' && value.startsWith('$')
        ? '$' + formatCompactNumber(parseFloat(value.replace(/,/g, '').replace('$', '')))
        : formatCompactNumber(value);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between hover:bg-zinc-900 transition-colors min-w-0 overflow-hidden">
            <div className="min-w-0 overflow-hidden">
                <p className="text-zinc-500 text-xs font-semibold uppercase truncate">{title}</p>
                <p className="text-2xl font-bold text-white mt-1 truncate tabular-nums" title={String(value)}>
                    {displayValue}
                </p>
                {sub && <p className="text-zinc-600 text-xs mt-1 truncate">{sub}</p>}
            </div>
            <div className="p-2 bg-zinc-800/50 rounded-full shrink-0 ml-2">{icon}</div>
        </div>
    );
}
