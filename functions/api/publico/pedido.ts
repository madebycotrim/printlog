/// <reference types="@cloudflare/workers-types" />
import { descriptografar } from "../utilitarios/criptografia";

interface Env {
    DB: D1Database;
    ENCRYPTION_KEY: string;
}

export const onRequest: PagesFunction<Env, any> = async (context) => {
    const { env, request } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const metodo = request.method;
    const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

    if (metodo !== "GET") {
        return new Response("Método não permitido", { status: 405 });
    }
    if (!id) {
        return new Response(
            JSON.stringify({ erro: "ID do pedido não fornecido" }), 
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const pedido = await env.DB.prepare(
            "SELECT id, status, valor_centavos, data_criacao, data_conclusao, descricao, dados_extras FROM pedidos_impressao WHERE id = ?"
        ).bind(id).first() as any;

        if (!pedido) {
            return new Response(
                JSON.stringify({ erro: "Pedido não encontrado" }), 
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Descriptografa os dados para exibição pública segura
        const descricao = await descriptografar(pedido.descricao, chaveMestra) || pedido.descricao;
        const extrasRaw = pedido.dados_extras ? await descriptografar(pedido.dados_extras, chaveMestra) : null;
        
        let extras: any = {};
        if (extrasRaw) {
            try { 
                extras = JSON.parse(extrasRaw); 
            } catch (e) {
                // fallback se dados extras falharem
            }
        }

        // Retorna apenas dados de acompanhamento seguros (sem chaves de API, senhas ou faturamento interno)
        const respostaPublica = {
            id: pedido.id,
            status: pedido.status,
            descricao,
            dataCriacao: pedido.data_criacao,
            dataConclusao: pedido.data_conclusao,
            material: extras.material,
            pesoGramas: extras.peso_gramas,
            tempoMinutos: extras.tempo_minutos,
            observacoesPublicas: extras.observacoesPublicas || "", // Observações públicas para o cliente
            codigoRastreio: extras.codigoRastreio || "", // Código de rastreamento do envio
            fotosProgresso: extras.fotosProgresso || [], // Fotos enviadas pelo operador
            posicaoFila: extras.posicao_fila || extras.posicaoFila || null,
            dataInicioAgendada: extras.data_inicio_agendada || extras.dataInicioAgendada || null,
        };

        return new Response(JSON.stringify(respostaPublica), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (erro: any) {
        console.error("[publico-pedido] Erro ao descriptografar:", erro);
        return new Response(
            JSON.stringify({ erro: "Erro interno ao processar dados de rastreamento" }), 
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
