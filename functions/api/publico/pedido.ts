/// <reference types="@cloudflare/workers-types" />
import { descriptografar, obterChaveMestra } from "../utilitarios/criptografia";
import { verificarRateLimit } from "../utilitarios/rate-limit";
import { aplicarHeadersCors } from "../utilitarios/cors";

interface Env {
    DB: D1Database;
    ENCRYPTION_KEY: string;
    ENVIRONMENT?: string;
}

export const onRequest: PagesFunction<Env, any> = async (context) => {
    const { env, request } = context;
    const metodo = request.method;

    const headers = aplicarHeadersCors(new Headers(), request, "GET, OPTIONS");

    if (metodo === "OPTIONS") {
        return new Response(null, { headers });
    }

    if (metodo !== "GET") {
        headers.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ erro: "Método não permitido" }), { status: 405, headers });
    }

    const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const limitCheck = verificarRateLimit(ip, "publico-pedido", 60, 60_000);
    if (!limitCheck.permitido) {
        headers.set("Content-Type", "application/json");
        headers.set("Retry-After", String(limitCheck.segundosParaReset));
        return new Response(
            JSON.stringify({ erro: "Muitas consultas consecutivas. Aguarde alguns instantes." }),
            { status: 429, headers }
        );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const chaveMestra = obterChaveMestra(env);

    if (!id || typeof id !== "string" || id.trim().length === 0 || id.length > 64) {
        headers.set("Content-Type", "application/json");
        return new Response(
            JSON.stringify({ erro: "ID do pedido não fornecido ou inválido" }), 
            { status: 400, headers }
        );
    }

    try {
        const pedido = await env.DB.prepare(
            "SELECT id, status, valor_centavos, data_criacao, data_conclusao, descricao, dados_extras FROM pedidos_impressao WHERE id = ?"
        ).bind(id.trim()).first() as any;

        if (!pedido) {
            headers.set("Content-Type", "application/json");
            return new Response(
                JSON.stringify({ erro: "Pedido não encontrado" }), 
                { status: 404, headers }
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
            observacoesPublicas: extras.observacoesPublicas || "",
            codigoRastreio: extras.codigoRastreio || "",
            fotosProgresso: extras.fotosProgresso || [],
            posicaoFila: extras.posicao_fila || extras.posicaoFila || null,
            dataInicioAgendada: extras.data_inicio_agendada || extras.dataInicioAgendada || null,
        };

        headers.set("Content-Type", "application/json");
        return new Response(JSON.stringify(respostaPublica), { headers });
    } catch (erro: any) {
        console.error("[publico-pedido] Erro ao descriptografar:", erro);
        headers.set("Content-Type", "application/json");
        return new Response(
            JSON.stringify({ erro: "Erro interno ao processar dados de rastreamento" }), 
            { status: 500, headers }
        );
    }
};
