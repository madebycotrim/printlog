import { Impressora } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { impressoraSchema } from "../esquemas";

/**
 * Serviço de comunicação com a API de Impressoras do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiImpressoras = {
    buscarTodas: async (_usuarioId: string): Promise<Impressora[]> => {
        const dados = await servicoBaseApi.get<any[]>("/api/impressoras");
        
        return dados.map((i: any) => ({
            ...i,
            marca: i.marca,
            modeloBase: i.modelo_base,
            imagemUrl: i.imagem_url,
            taxaHoraCentavos: i.taxa_hora_centavos,
            horimetroTotalMinutos: i.horimetro_total_minutos,
            intervaloRevisaoMinutos: i.intervalo_revisao_minutos,
            valorCompraCentavos: i.valor_compra_centavos,
            potenciaWatts: i.potencia_watts,
            dataAposentadoria: i.data_aposentadoria,
            dataCriacao: i.data_criacao ? new Date(i.data_criacao) : new Date(),
            dataAtualizacao: new Date(),
            // Métricas de desempenho
            totalProjetosConcluidos: i.total_projetos_concluidos ?? 0,
            receitaAcumuladaCentavos: i.receita_acumulada_centavos ?? 0,
            custoEnergiaCentavos: i.custo_energia_centavos ?? 0,
            roiPercentual: i.roi_percentual ?? 0,
            historicoProducao: typeof i.historico_producao === 'string'
                ? JSON.parse(i.historico_producao)
                : (i.historico_producao || []),
        }));
    },

    salvar: async (dados: Partial<Impressora>, _usuarioId: string): Promise<Impressora> => {
        const metodo = dados.id ? "PATCH" : "POST";
        
        // Validação de segurança no cliente
        const dadosValidados = impressoraSchema.partial().parse(dados);

        // Converte camelCase para snake_case para o D1
        const payload = {
            ...dadosValidados,
            id: dados.id,
            id_usuario: _usuarioId,
            modelo_base: dados.modeloBase,
            imagem_url: dados.imagemUrl,
            taxa_hora_centavos: dados.taxaHoraCentavos,
            horimetro_total_minutos: dados.horimetroTotalMinutos,
            intervalo_revisao_minutos: dados.intervaloRevisaoMinutos,
            valor_compra_centavos: dados.valorCompraCentavos,
            potencia_watts: dados.potenciaWatts,
            data_aposentadoria: dados.dataAposentadoria,
            // Métricas de desempenho
            total_projetos_concluidos: dados.totalProjetosConcluidos,
            receita_acumulada_centavos: dados.receitaAcumuladaCentavos,
            custo_energia_centavos: dados.custoEnergiaCentavos,
            roi_percentual: dados.roiPercentual,
            historico_producao: dados.historicoProducao
                ? JSON.stringify(dados.historicoProducao)
                : undefined,
        };

        return servicoBaseApi.requisicao<Impressora>("/api/impressoras", {
            method: metodo,
            body: JSON.stringify(payload)
        });
    },

    remover: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/impressoras?id=${id}`);
    }
};
