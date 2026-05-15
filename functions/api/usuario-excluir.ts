/// <reference types="@cloudflare/workers-types" />

/**
 * API de Exclusão de Conta (Purga LGPD)
 * Responsável por apagar todos os dados de negócio do usuário no D1.
 * Finalidade: Direito ao Esquecimento | Base Legal: Consentimento (Art. 7º, I — LGPD)
 */

interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, data } = context;
    const usuarioId = data.uid;

    if (!usuarioId) {
        return new Response(JSON.stringify({ erro: "Usuário não identificado" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // Executa a purga em lote (batch) para garantir consistência e performance
        // Nota: Mantemos apenas os logs de acesso (obrigação do Marco Civil), que não estão nestas tabelas.
        await env.DB.batch([
            env.DB.prepare("DELETE FROM pedidos_impressao WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM materiais WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM historico_uso_materiais WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM clientes WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM impressoras WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM insumos WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM movimentacoes_insumo WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM registro_manutencao WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM pecas_desgaste WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM lancamentos_financeiros WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM configuracoes_usuario WHERE id_usuario = ?").bind(usuarioId),
            env.DB.prepare("DELETE FROM cache_ia_precificacao WHERE id_usuario = ?").bind(usuarioId),
        ]);

        return new Response(JSON.stringify({ 
            sucesso: true, 
            mensagem: "Dados de negócio excluídos com sucesso das bases operacionais." 
        }), { 
            headers: { "Content-Type": "application/json" } 
        });
    } catch (erro: any) {
        console.error("[Purga LGPD] Erro ao excluir dados:", erro);
        return new Response(JSON.stringify({ 
            erro: "Erro interno ao processar exclusão de dados.",
            detalhes: erro.message 
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
