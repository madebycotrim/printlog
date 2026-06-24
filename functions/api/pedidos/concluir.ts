/// <reference types="@cloudflare/workers-types" />
import { criptografar, descriptografar } from "../utilitarios/criptografia";

interface Env {
    DB: D1Database;
    ENCRYPTION_KEY: string;
}

export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

    try {
        const body = await request.json() as any;
        const { idPedido, novoStatus } = body;

        if (!idPedido || !novoStatus) {
            return new Response(JSON.stringify({ sucesso: false, mensagem: "Parâmetros idPedido e novoStatus são obrigatórios." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Buscar pedido
        const pedido = await env.DB.prepare(
            "SELECT * FROM pedidos_impressao WHERE id = ? AND id_usuario = ?"
        ).bind(idPedido, usuarioId).first() as any;

        if (!pedido) {
            return new Response(JSON.stringify({ sucesso: false, mensagem: "Pedido não encontrado." }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        const statusAtual = pedido.status;

        // Se o status não mudou de/para concluído, apenas atualiza o status do pedido de forma simples
        const deConcluido = statusAtual === 'concluido' || statusAtual === 'arquivado';
        const paraConcluido = novoStatus === 'concluido' || novoStatus === 'arquivado';

        if (deConcluido === paraConcluido) {
            // Apenas atualiza o status do pedido
            const dataConclusao = novoStatus === 'concluido' ? new Date().toISOString() : (pedido.data_conclusao || null);
            await env.DB.prepare(
                "UPDATE pedidos_impressao SET status = ?, data_conclusao = ? WHERE id = ? AND id_usuario = ?"
            ).bind(novoStatus, dataConclusao, idPedido, usuarioId).run();

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Descriptografar extras
        const descDescripto = await descriptografar(pedido.descricao, chaveMestra) || pedido.descricao;
        const extrasRaw = pedido.dados_extras ? await descriptografar(pedido.dados_extras, chaveMestra) : null;
        let extras: any = {};
        if (extrasRaw) {
            try { extras = JSON.parse(extrasRaw); } catch (e) { console.warn("Erro ao fazer parse dos extras do pedido:", e); }
        }

        const materiais = extras.materiais || [];
        const insumosSecundarios = extras.insumosSecundarios || extras.insumos_secundarios || [];
        const tempoEfetivo = extras.tempoMinutos || extras.tempo_minutos || 
            (extras.configuracoes ? ((extras.configuracoes.tempoHoras || 0) * 60 + (extras.configuracoes.tempoMinutos || 0)) : 0) || 0;
        const valorCentavos = pedido.valor_centavos || 0;

        const batchQueries: D1PreparedStatement[] = [];

        if (paraConcluido && !deConcluido) {
            // ─────────────────────────────────────────────────────────────────
            // 1. LIQUIDAR CONCLUSÃO
            // ─────────────────────────────────────────────────────────────────
            
            // 1.1 Desconto de Materiais
            if (materiais.length > 0) {
                const idsMateriais = materiais.map((m: any) => m.idMaterial || m.id).filter(Boolean);
                if (idsMateriais.length > 0) {
                    const placeholders = idsMateriais.map(() => "?").join(",");
                    const { results: dbMateriais } = await env.DB.prepare(
                        `SELECT * FROM materiais WHERE id_usuario = ? AND id IN (${placeholders})`
                    ).bind(usuarioId, ...idsMateriais).all();

                    for (const mat of materiais) {
                        const matId = mat.idMaterial || mat.id;
                        const matEstoque = dbMateriais.find((m: any) => m.id === matId);
                        if (matEstoque) {
                            const quantidadeGasta = mat.quantidadeGasta || 0;
                            const novoPeso = Math.max(0, (matEstoque.peso_restante_gramas || 0) - quantidadeGasta);
                            
                            // Query update material
                            batchQueries.push(
                                env.DB.prepare(
                                    "UPDATE materiais SET peso_restante_gramas = ? WHERE id = ? AND id_usuario = ?"
                                ).bind(novoPeso, matId, usuarioId)
                            );

                            // Query histórico de uso
                            batchQueries.push(
                                env.DB.prepare(
                                    `INSERT INTO historico_uso_materiais (
                                        id, id_material, id_usuario, data, nome_peca, 
                                        quantidade_gasta_gramas, status
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
                                ).bind(crypto.randomUUID(), matId, usuarioId, new Date().toISOString(), descDescripto, quantidadeGasta, "SUCESSO")
                            );
                        }
                    }
                }
            }

            // 1.2 Desconto de Insumos
            if (insumosSecundarios.length > 0) {
                const idsInsumos = insumosSecundarios.map((ins: any) => ins.idInsumo || ins.id).filter(Boolean);
                if (idsInsumos.length > 0) {
                    const placeholders = idsInsumos.map(() => "?").join(",");
                    const { results: dbInsumos } = await env.DB.prepare(
                        `SELECT * FROM insumos WHERE id_usuario = ? AND id IN (${placeholders})`
                    ).bind(usuarioId, ...idsInsumos).all();

                    for (const ins of insumosSecundarios) {
                        const insId = ins.idInsumo || ins.id;
                        const insEstoque = dbInsumos.find((i: any) => i.id === insId);
                        if (insEstoque) {
                            const quantidadeGasta = ins.quantidade || 0;
                            const novaQtd = Math.max(0, (insEstoque.quantidade_atual || 0) - quantidadeGasta);
                            const custoMedio = insEstoque.custo_medio_unidade || 0;

                            // Query update insumo
                            batchQueries.push(
                                env.DB.prepare(
                                    "UPDATE insumos SET quantidade_atual = ?, data_atualizacao = datetime('now') WHERE id = ? AND id_usuario = ?"
                                ).bind(novaQtd, insId, usuarioId)
                            );

                            // Query movimentação de insumo
                            batchQueries.push(
                                env.DB.prepare(
                                    `INSERT INTO movimentacoes_insumo (
                                        id, insumo_id, id_usuario, data, tipo, 
                                        quantidade, valor_total, motivo, observacao
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                                ).bind(crypto.randomUUID(), insId, usuarioId, new Date().toISOString(), "Saída", quantidadeGasta, quantidadeGasta * custoMedio, "Consumo", `Conclusão do pedido: ${descDescripto}`)
                            );
                        }
                    }
                }
            }

            // 1.3 Horímetro + Métricas da Impressora
            if (pedido.id_impressora && tempoEfetivo > 0) {
                const impressora = await env.DB.prepare(
                    "SELECT * FROM impressoras WHERE id = ? AND id_usuario = ?"
                ).bind(pedido.id_impressora, usuarioId).first() as any;

                if (impressora) {
                    const novoHorimetro = Math.max(0, (impressora.horimetro_total_minutos || 0) + tempoEfetivo);
                    
                    let custoEnergiaCentavos = 0;
                    const potencia = extras.configuracoes?.potenciaWatts || impressora.potencia_watts || 0;
                    if (potencia > 0) {
                        const consumoKw = potencia / 1000;
                        const horas = tempoEfetivo / 60;
                        const precoKwh = extras.configuracoes?.precoKwh || 0;
                        custoEnergiaCentavos = Math.round(consumoKw * horas * precoKwh);
                    }

                    const novoCustoEnergia = (impressora.custo_energia_centavos || 0) + custoEnergiaCentavos;
                    const novoTotalProjetos = (impressora.total_projetos_concluidos || 0) + 1;
                    const novaReceita = (impressora.receita_acumulada_centavos || 0) + valorCentavos;
                    
                    const custoCompra = impressora.valor_compra_centavos || 0;
                    const novoRoi = custoCompra > 0 ? Math.round(((novaReceita - custoCompra) / custoCompra) * 100) : 0;

                    let historico: any[] = [];
                    if (impressora.historico_producao) {
                        try {
                            historico = typeof impressora.historico_producao === 'string' 
                                ? JSON.parse(impressora.historico_producao) 
                                : impressora.historico_producao;
                        } catch(e) { console.warn("Erro ao fazer parse do historico da impressora:", e); }
                    }
                    const novoRegistro = {
                        idProtocolo: idPedido,
                        nomeProjeto: descDescripto,
                        minutosImpressao: tempoEfetivo,
                        valorGeradoCentavos: valorCentavos,
                        dataConclusao: new Date().toISOString(),
                        sucesso: true
                    };
                    historico = [novoRegistro, ...historico].slice(0, 50);

                    batchQueries.push(
                        env.DB.prepare(`
                            UPDATE impressoras SET 
                                horimetro_total_minutos = ?,
                                total_projetos_concluidos = ?,
                                receita_acumulada_centavos = ?,
                                custo_energia_centavos = ?,
                                roi_percentual = ?,
                                historico_producao = ?
                            WHERE id = ? AND id_usuario = ?
                        `).bind(
                            novoHorimetro, novoTotalProjetos, novaReceita, novoCustoEnergia,
                            novoRoi, JSON.stringify(historico), pedido.id_impressora, usuarioId
                        )
                    );
                }
            }

            // 1.4 Histórico + Métricas do Cliente
            if (pedido.id_cliente && pedido.id_cliente !== "avulso") {
                const cliente = await env.DB.prepare(
                    "SELECT * FROM clientes WHERE id = ? AND id_usuario = ?"
                ).bind(pedido.id_cliente, usuarioId).first() as any;

                if (cliente) {
                    let historico: any[] = [];
                    if (cliente.historico) {
                        try {
                            historico = typeof cliente.historico === 'string' ? JSON.parse(cliente.historico) : cliente.historico;
                        } catch(e) { console.warn("Erro ao fazer parse do historico do cliente:", e); }
                    }
                    historico.push({
                        id: crypto.randomUUID(),
                        data: new Date().toISOString(),
                        descricao: descDescripto,
                        valorCentavos: valorCentavos,
                        status: "concluido"
                    });

                    batchQueries.push(
                        env.DB.prepare(`
                            UPDATE clientes SET 
                                ltv_centavos = ?, 
                                total_produtos = ?, 
                                historico = ?
                            WHERE id = ? AND id_usuario = ?
                        `).bind(
                            (cliente.ltv_centavos || 0) + valorCentavos,
                            (cliente.total_produtos || 0) + 1,
                            JSON.stringify(historico),
                            pedido.id_cliente,
                            usuarioId
                        )
                    );
                }
            }

            // 1.5 Lançamento Financeiro
            const [descCripto, catCripto] = await Promise.all([
                criptografar(`Receita: ${descDescripto}`, chaveMestra),
                criptografar("Venda de Impressão 3D", chaveMestra)
            ]);

            batchQueries.push(
                env.DB.prepare(`
                    INSERT INTO lancamentos_financeiros (
                        id, id_usuario, id_pedido, id_cliente, tipo, 
                        valor_centavos, descricao, categoria, arquivado, data_criacao
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                `).bind(
                    crypto.randomUUID(), usuarioId, idPedido, pedido.id_cliente || null,
                    "Entrada", valorCentavos, descCripto, catCripto, new Date().toISOString()
                )
            );

            // 1.6 Atualizar Status do Pedido
            batchQueries.push(
                env.DB.prepare(
                    "UPDATE pedidos_impressao SET status = ?, data_conclusao = ? WHERE id = ? AND id_usuario = ?"
                ).bind(novoStatus, new Date().toISOString(), idPedido, usuarioId)
            );

        } else if (deConcluido && !paraConcluido) {
            // ─────────────────────────────────────────────────────────────────
            // 2. REVERTER CONCLUSÃO
            // ─────────────────────────────────────────────────────────────────

            // 2.1 Remover lançamentos financeiros
            batchQueries.push(
                env.DB.prepare(
                    "DELETE FROM lancamentos_financeiros WHERE id_pedido = ? AND id_usuario = ?"
                ).bind(idPedido, usuarioId)
            );

            // 2.2 Estornar Materiais
            if (materiais.length > 0) {
                const idsMateriais = materiais.map((m: any) => m.idMaterial || m.id).filter(Boolean);
                if (idsMateriais.length > 0) {
                    const placeholders = idsMateriais.map(() => "?").join(",");
                    const { results: dbMateriais } = await env.DB.prepare(
                        `SELECT * FROM materiais WHERE id_usuario = ? AND id IN (${placeholders})`
                    ).bind(usuarioId, ...idsMateriais).all();

                    for (const mat of materiais) {
                        const matId = mat.idMaterial || mat.id;
                        const matEstoque = dbMateriais.find((m: any) => m.id === matId);
                        if (matEstoque) {
                            const quantidadeGasta = mat.quantidadeGasta || 0;
                            const pesoMaximo = matEstoque.peso_gramas || 1000;
                            const novoPeso = Math.min(pesoMaximo, (matEstoque.peso_restante_gramas || 0) + quantidadeGasta);

                            batchQueries.push(
                                env.DB.prepare(
                                    "UPDATE materiais SET peso_restante_gramas = ? WHERE id = ? AND id_usuario = ?"
                                ).bind(novoPeso, matId, usuarioId)
                            );

                            // Deleta os registros de uso criados para este pedido
                            batchQueries.push(
                                env.DB.prepare(
                                    "DELETE FROM historico_uso_materiais WHERE id_material = ? AND id_usuario = ? AND nome_peca = ?"
                                ).bind(matId, usuarioId, descDescripto)
                            );
                        }
                    }
                }
            }

            // 2.3 Estornar Insumos
            if (insumosSecundarios.length > 0) {
                const idsInsumos = insumosSecundarios.map((ins: any) => ins.idInsumo || ins.id).filter(Boolean);
                if (idsInsumos.length > 0) {
                    const placeholders = idsInsumos.map(() => "?").join(",");
                    const { results: dbInsumos } = await env.DB.prepare(
                        `SELECT * FROM insumos WHERE id_usuario = ? AND id IN (${placeholders})`
                    ).bind(usuarioId, ...idsInsumos).all();

                    for (const ins of insumosSecundarios) {
                        const insId = ins.idInsumo || ins.id;
                        const insEstoque = dbInsumos.find((i: any) => i.id === insId);
                        if (insEstoque) {
                            const quantidadeGasta = ins.quantidade || 0;
                            const novaQtd = (insEstoque.quantidade_atual || 0) + quantidadeGasta;

                            batchQueries.push(
                                env.DB.prepare(
                                    "UPDATE insumos SET quantidade_atual = ?, data_atualizacao = datetime('now') WHERE id = ? AND id_usuario = ?"
                                ).bind(novaQtd, insId, usuarioId)
                            );

                            // Deleta as movimentações geradas na conclusão
                            batchQueries.push(
                                env.DB.prepare(
                                    "DELETE FROM movimentacoes_insumo WHERE insumo_id = ? AND id_usuario = ? AND observacao = ?"
                                ).bind(insId, usuarioId, `Conclusão do pedido: ${descDescripto}`)
                            );
                        }
                    }
                }
            }

            // 2.4 Estornar Horímetro + Impressora
            if (pedido.id_impressora && tempoEfetivo > 0) {
                const impressora = await env.DB.prepare(
                    "SELECT * FROM impressoras WHERE id = ? AND id_usuario = ?"
                ).bind(pedido.id_impressora, usuarioId).first() as any;

                if (impressora) {
                    const novoHorimetro = Math.max(0, (impressora.horimetro_total_minutos || 0) - tempoEfetivo);
                    
                    let custoEnergiaCentavos = 0;
                    const potencia = extras.configuracoes?.potenciaWatts || impressora.potencia_watts || 0;
                    if (potencia > 0) {
                        const consumoKw = potencia / 1000;
                        const horas = tempoEfetivo / 60;
                        const precoKwh = extras.configuracoes?.precoKwh || 0;
                        custoEnergiaCentavos = Math.round(consumoKw * horas * precoKwh);
                    }

                    const novoCustoEnergia = Math.max(0, (impressora.custo_energia_centavos || 0) - custoEnergiaCentavos);
                    const novoTotalProjetos = Math.max(0, (impressora.total_projetos_concluidos || 0) - 1);
                    const novaReceita = Math.max(0, (impressora.receita_acumulada_centavos || 0) - valorCentavos);
                    
                    const custoCompra = impressora.valor_compra_centavos || 0;
                    const novoRoi = custoCompra > 0 ? Math.round(((novaReceita - custoCompra) / custoCompra) * 100) : 0;

                    let historico: any[] = [];
                    if (impressora.historico_producao) {
                        try {
                            historico = typeof impressora.historico_producao === 'string' 
                                ? JSON.parse(impressora.historico_producao) 
                                : impressora.historico_producao;
                        } catch(e) { console.warn("Erro ao fazer parse do historico da impressora para reversão:", e); }
                    }
                    historico = historico.filter((r: any) => r.idProtocolo !== idPedido);

                    batchQueries.push(
                        env.DB.prepare(`
                            UPDATE impressoras SET 
                                horimetro_total_minutos = ?,
                                total_projetos_concluidos = ?,
                                receita_acumulada_centavos = ?,
                                custo_energia_centavos = ?,
                                roi_percentual = ?,
                                historico_producao = ?
                            WHERE id = ? AND id_usuario = ?
                        `).bind(
                            novoHorimetro, novoTotalProjetos, novaReceita, novoCustoEnergia,
                            novoRoi, JSON.stringify(historico), pedido.id_impressora, usuarioId
                        )
                    );
                }
            }

            // 2.5 Estornar Cliente
            if (pedido.id_cliente && pedido.id_cliente !== "avulso") {
                const cliente = await env.DB.prepare(
                    "SELECT * FROM clientes WHERE id = ? AND id_usuario = ?"
                ).bind(pedido.id_cliente, usuarioId).first() as any;

                if (cliente) {
                    let historico: any[] = [];
                    if (cliente.historico) {
                        try {
                            historico = typeof cliente.historico === 'string' ? JSON.parse(cliente.historico) : cliente.historico;
                        } catch(e) { console.warn("Erro ao fazer parse do historico do cliente para reversão:", e); }
                    }
                    historico = historico.filter((h: any) => h.descricao !== descDescripto);

                    batchQueries.push(
                        env.DB.prepare(`
                            UPDATE clientes SET 
                                ltv_centavos = ?, 
                                total_produtos = ?, 
                                historico = ?
                            WHERE id = ? AND id_usuario = ?
                        `).bind(
                            Math.max(0, (cliente.ltv_centavos || 0) - valorCentavos),
                            Math.max(0, (cliente.total_produtos || 0) - 1),
                            JSON.stringify(historico),
                            pedido.id_cliente,
                            usuarioId
                        )
                    );
                }
            }

            // 2.6 Atualizar Status do Pedido (Limpando data de conclusão)
            batchQueries.push(
                env.DB.prepare(
                    "UPDATE pedidos_impressao SET status = ?, data_conclusao = NULL WHERE id = ? AND id_usuario = ?"
                ).bind(novoStatus, idPedido, usuarioId)
            );
        }

        // Executar Batch
        if (batchQueries.length > 0) {
            await env.DB.batch(batchQueries);
        }

        return new Response(JSON.stringify({ sucesso: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (erro: any) {
        console.error("[concluir] Erro transacional:", erro);
        return new Response(JSON.stringify({
            sucesso: false,
            mensagem: String(erro?.message || "Erro desconhecido ao processar transação.")
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
