/// <reference types="@cloudflare/workers-types" />

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { env } = context;
    try {
        const { results: tables } = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        
        const details = await Promise.all(tables.map(async (t: any) => {
            try {
                const { results: columns } = await env.DB.prepare(`PRAGMA table_info(${t.name})`).all();
                return { table: t.name, columns };
            } catch (e) {
                return { table: t.name, error: "Erro ao ler colunas" };
            }
        }));

        return new Response(JSON.stringify(details), { headers: { "Content-Type": "application/json" } });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
