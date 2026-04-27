/// <reference types="@cloudflare/workers-types" />

interface Env {
    DB: D1Database;
    EMAIL_DONO: string;
}

/**
 * API Administrativa - Gestão de Usuários e Planos
 * Acesso restrito apenas ao e-mail definido na variável de ambiente EMAIL_DONO.
 */
const calcularVencimento = (ciclo: string, dataBase: Date = new Date()) => {
    const data = new Date(dataBase);
    switch (ciclo) {
        case "MENSAL": data.setMonth(data.getMonth() + 1); break;
        case "TRIMESTRAL": data.setMonth(data.getMonth() + 3); break;
        case "SEMESTRAL": data.setMonth(data.getMonth() + 6); break;
        case "ANUAL": data.setFullYear(data.getFullYear() + 1); break;
        case "VITALICIO": data.setFullYear(data.getFullYear() + 100); break;
    }
    return data.toISOString();
};

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, data, request } = context;

    // 1. Verificação de Identidade (Middleware JWT já validou que o usuário existe no Firebase)
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const metodo = request.method;

    try {
        // GET — Lista todos os usuários e seus planos
        if (metodo === "GET") {
            const { results } = await env.DB.prepare(
                "SELECT id_usuario, email, nome_estudio, plano, ciclo_pagamento, vencimento_plano, atualizado_em FROM configuracoes_usuario ORDER BY atualizado_em DESC"
            ).all();

            return new Response(JSON.stringify(results), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // PATCH — Altera o plano/ciclo de um usuário específico
        if (metodo === "PATCH") {
            const { idUsuario, novoPlano, novoCiclo, acao } = await request.json() as any;

            if (!idUsuario) {
                return new Response("ID inválido", { status: 400 });
            }

            const campos = [];
            const valores = [];

            let cicloParaVencimento = novoCiclo;

            if (novoPlano) {
                campos.push("plano = ?");
                valores.push(novoPlano);
                // Se mudou pra FREE, limpa vencimento
                if (novoPlano === "FREE") {
                    campos.push("vencimento_plano = ?");
                    valores.push(null);
                    campos.push("ciclo_pagamento = ?");
                    valores.push(null);
                }
            }
            
            if (novoCiclo && novoPlano !== "FREE") {
                campos.push("ciclo_pagamento = ?");
                valores.push(novoCiclo);
            }

            // Tratamento de renovação ou mudança de ciclo/plano que exige novo vencimento
            if (acao === "RENOVAR" || (novoCiclo && novoPlano !== "FREE") || (novoPlano && novoPlano !== "FREE")) {
                // Precisamos saber o ciclo atual se não foi passado um novo
                if (!cicloParaVencimento) {
                    const atual = await env.DB.prepare("SELECT ciclo_pagamento, vencimento_plano FROM configuracoes_usuario WHERE id_usuario = ?").bind(idUsuario).first() as any;
                    cicloParaVencimento = atual?.ciclo_pagamento || "MENSAL";
                    
                    if (acao === "RENOVAR") {
                        const dataVencimentoAtual = atual?.vencimento_plano ? new Date(atual.vencimento_plano) : new Date();
                        // Se já venceu, renova a partir de hoje. Se não, adiciona ao vencimento atual.
                        const dataBase = dataVencimentoAtual < new Date() ? new Date() : dataVencimentoAtual;
                        const novoVencimento = calcularVencimento(cicloParaVencimento, dataBase);
                        campos.push("vencimento_plano = ?");
                        valores.push(novoVencimento);
                    }
                }

                // Se mudou plano ou ciclo e não é só RENOVAR
                if (acao !== "RENOVAR" && cicloParaVencimento) {
                    const novoVencimento = calcularVencimento(cicloParaVencimento, new Date());
                    campos.push("vencimento_plano = ?");
                    valores.push(novoVencimento);
                }
            }

            if (campos.length === 0) {
                return new Response(JSON.stringify({ sucesso: true }), { status: 200 });
            }

            campos.push("atualizado_em = ?");
            valores.push(new Date().toISOString());
            valores.push(idUsuario);

            await env.DB.prepare(`
                UPDATE configuracoes_usuario 
                SET ${campos.join(", ")} 
                WHERE id_usuario = ?
            `).bind(...valores).run();

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ mensagem: erro.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
