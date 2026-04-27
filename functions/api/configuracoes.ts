/// <reference types="@cloudflare/workers-types" />

/**
 * API de Configurações Operacionais - Cloudflare Pages Functions
 * Persiste as preferências de custo do estúdio no D1 por usuário.
 * Finalidade: Configuração operacional do sistema | Base Legal: Contrato (Art. 7º, V — LGPD)
 */

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env, any, { uid: string; email?: string }> = async (context) => {
    const { env, data, request } = context;

    // Obtido com segurança via Middleware JWT
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const metodo = request.method;

    try {
        const emailUsuario = context.data.email || "";

        // GET — Busca as configurações do usuário (ou retorna os padrões)
        if (metodo === "GET") {
            const resultado = await env.DB.prepare(
                "SELECT * FROM configuracoes_usuario WHERE id_usuario = ? LIMIT 1"
            ).bind(usuarioId).first();

            // Se o usuário existe mas não tem e-mail salvo, atualiza em background
            if (resultado && !resultado.email && emailUsuario) {
                context.waitUntil(
                    env.DB.prepare("UPDATE configuracoes_usuario SET email = ? WHERE id_usuario = ?")
                    .bind(emailUsuario, usuarioId).run()
                );
            }

            if (!resultado) {
                // Retorna valores padrão sem criar o registro ainda
                return new Response(JSON.stringify({
                    custoEnergia: "R$ 0,95",
                    horaMaquina: "R$ 5,00",
                    horaOperador: "R$ 20,00",
                    margemLucro: "150,00%",
                    nomeEstudio: "",
                    sloganEstudio: "",
                    plano: "FREE",
                }), { headers: { "Content-Type": "application/json" } });
            }

            return new Response(JSON.stringify({
                custoEnergia: resultado.custo_energia,
                horaMaquina: resultado.hora_maquina,
                horaOperador: resultado.hora_operador,
                margemLucro: resultado.margem_lucro,
                nomeEstudio: resultado.nome_estudio || "",
                sloganEstudio: resultado.slogan_estudio || "",
                plano: resultado.plano || "FREE",
            }), { headers: { "Content-Type": "application/json" } });
        }

        // PUT — Upsert das configurações (cria ou atualiza)
        if (metodo === "PUT") {
            const dados = await request.json() as any;

            await env.DB.prepare(`
                INSERT INTO configuracoes_usuario (id_usuario, email, custo_energia, hora_maquina, hora_operador, margem_lucro, nome_estudio, slogan_estudio, plano, atualizado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id_usuario) DO UPDATE SET
                    email          = excluded.email,
                    custo_energia  = excluded.custo_energia,
                    hora_maquina   = excluded.hora_maquina,
                    hora_operador  = excluded.hora_operador,
                    margem_lucro   = excluded.margem_lucro,
                    nome_estudio   = excluded.nome_estudio,
                    slogan_estudio = excluded.slogan_estudio,
                    plano          = excluded.plano,
                    atualizado_em  = excluded.atualizado_em
            `).bind(
                usuarioId,
                emailUsuario,
                dados.custoEnergia,
                dados.horaMaquina,
                dados.horaOperador,
                dados.margemLucro,
                dados.nomeEstudio || "",
                dados.sloganEstudio || "",
                dados.plano || "FREE",
                new Date().toISOString()
            ).run();

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
