import { Book, Key, Link2, Search, Table as TableIcon } from 'lucide-react';

export function LearningMode() {
    return (
        <div className="p-6 max-w-2xl mx-auto space-y-8 h-full overflow-y-auto bg-zinc-950 text-zinc-300">
            <header className="mb-8 border-b border-zinc-800 pb-4">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Book className="text-blue-500" /> SQL Learning Hub
                </h1>
                <p className="text-zinc-500">
                    Master SQL concepts using real-world CFDI 4.0 data structures.
                </p>
            </header>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <TableIcon size={20} className="text-purple-400" /> 1. Tables & Structure
                </h2>
                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <p className="text-sm leading-relaxed mb-4">
                        A <span className="text-purple-400 font-bold">Table</span> is a collection of related data held in a structured format within a database. It consists of columns (fields) and rows (records).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                <Key size={12} className="text-yellow-500" /> Primary Key (PK)
                            </h3>
                            <p className="text-xs text-zinc-400">
                                A unique identifier for each record in a table. In our <code className="bg-zinc-800 px-1 rounded">cfdi_comprobantes</code> table, the <code className="text-green-400">id</code> column is the PK.
                            </p>
                        </div>
                        <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                <Link2 size={12} className="text-blue-500" /> Foreign Key (FK)
                            </h3>
                            <p className="text-xs text-zinc-400">
                                A field that links to the Primary Key of another table.
                                <br />Example: <code className="bg-zinc-800 px-1 rounded">emisor_id</code> links to the <code className="bg-zinc-800 px-1 rounded">cfdi_emisores</code> table.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Search size={20} className="text-green-400" /> 2. Key Concepts in this Lab
                </h2>
                <div className="grid gap-4">
                    <ConceptCard
                        title="SELECT & WHERE"
                        desc="Use SELECT to specify columns and WHERE to filter rows. Essential for finding specific invoices (UUIDs) or dates."
                        example="SELECT * FROM cfdi_comprobantes WHERE total > 1000;"
                    />
                    <ConceptCard
                        title="JOIN"
                        desc="Combines rows from two or more tables. Use it to see the 'Name' of an Issuer (Emisor) instead of just their ID."
                        example="SELECT c.uuid, e.nombre FROM cfdi_comprobantes c JOIN cfdi_emisores e ON c.emisor_id = e.id;"
                    />
                    <ConceptCard
                        title="GROUP BY & Aggregates"
                        desc="Groups rows that have the same values into summary rows. Used with COUNT(), SUM(), AVG(). Perfect for monthly reports."
                        example="SELECT metodo_pago, SUM(total) FROM cfdi_comprobantes GROUP BY metodo_pago;"
                    />
                </div>
            </section>
        </div>
    );
}

function ConceptCard({ title, desc, example }: any) {
    return (
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="text-sm font-bold text-zinc-200 mb-2">{title}</h3>
            <p className="text-xs text-zinc-500 mb-3">{desc}</p>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-900 font-mono text-xs text-blue-400">
                {example}
            </div>
        </div>
    );
}
