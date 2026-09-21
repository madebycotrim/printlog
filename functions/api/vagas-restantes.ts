/// <reference types="@cloudflare/workers-types" />

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;

    try {
        // Conta quantos usuários já possuem o plano FUNDADOR
        const resultado = await env.DB.prepare(
            "SELECT COUNT(*) as total FROM configuracoes_usuario WHERE plano = 'FUNDADOR'"
        ).first() as { total: number };

        const totalUsuarios = resultado?.total || 0;
        const totalVagas = 50;
        const vagasRestantes = Math.max(0, totalVagas - totalUsuarios);

        return new Response(JSON.stringify({
            totalUsuarios,
            totalVagas,
            vagasRestantes
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
