import { create } from "zustand";
import { Material, RegistroUso } from "@/funcionalidades/producao/materiais/tipos";

interface EstadoMateriais {
    materiais: Material[];
    totalMateriais: number;
    carregando: boolean;
    jaCarregou: boolean;

    // Ações Base
    definirMateriais: (materiais: Material[], total?: number) => void;
    adicionarPagina: (materiais: Material[]) => void;
    definirCarregando: (status: boolean) => void;
    definirJaCarregou: (status: boolean) => void;
    adicionarMaterial: (novo: Material) => void;
    atualizarMaterial: (id: string, dados: Partial<Material>) => void;
    arquivarMaterial: (id: string) => void;

    // Ações Específicas de Domínio
    abaterPeso: (id: string, qtdAbatida: number, motivo: string, status?: "SUCESSO" | "FALHA" | "CANCELADO" | "MANUAL") => void;
    reporEstoque: (id: string, quantidadeComprada: number, precoTotalNovaCompra: number) => void;
}

export const useArmazemMateriais = create<EstadoMateriais>((set) => ({
    materiais: [],
    totalMateriais: 0,
    carregando: false,
    jaCarregou: false,

    definirMateriais: (materiais, total) => set({ materiais, totalMateriais: total ?? materiais.length }),
    adicionarPagina: (novosMateriais) => set((state) => {
        // Evita duplicatas ao dar append na página
        const mapIds = new Set(state.materiais.map(m => m.id));
        const unicos = novosMateriais.filter(m => !mapIds.has(m.id));
        return { materiais: [...state.materiais, ...unicos] };
    }),
    definirCarregando: (status) => set({ carregando: status }),
    definirJaCarregou: (status) => set({ jaCarregou: status }),

    adicionarMaterial: (novo) => set((state) => ({ materiais: [novo, ...state.materiais] })),

    atualizarMaterial: (id, dados) =>
        set((state) => ({
            materiais: state.materiais.map((m) => (m.id === id ? { ...m, ...dados } : m)),
        })),

    arquivarMaterial: (id) =>
        set((state) => ({
            materiais: state.materiais.map((m) =>
                m.id === id ? { ...m, arquivado: true } : m
            ),
        })),

    abaterPeso: (id, qtdAbatida, motivo, status = "MANUAL") =>
        set((state) => ({
            materiais: state.materiais.map((m) => {
                if (m.id !== id) return m;

                let qtdFaltando = qtdAbatida;
                let novoPesoRestante = m.pesoRestanteGramas;
                let novoEstoque = m.estoque;

                // Abate do rolo atual
                if (qtdFaltando <= novoPesoRestante) {
                    novoPesoRestante -= qtdFaltando;
                } else {
                    // Esgotou o rolo atual. Desconta o restante dos próximos rolos lacrados do estoque
                    qtdFaltando -= novoPesoRestante;
                    novoPesoRestante = 0;

                    while (qtdFaltando > 0 && novoEstoque > 0) {
                        novoEstoque--; // Abre um rolo novo
                        if (qtdFaltando <= m.pesoGramas) {
                            novoPesoRestante = m.pesoGramas - qtdFaltando;
                            qtdFaltando = 0;
                        } else {
                            qtdFaltando -= m.pesoGramas;
                        }
                    }
                }

                const novoRegistro: RegistroUso = {
                    id: crypto.randomUUID(),
                    data: new Date().toISOString(),
                    nomePeca: motivo || (status === "FALHA" ? "Perda Técnica / Sucata" : "Abatimento Manual"),
                    quantidadeGastaGramas: qtdAbatida,
                    status: status,
                };

                return {
                    ...m,
                    pesoRestanteGramas: Number(novoPesoRestante.toFixed(2)),
                    estoque: novoEstoque,
                    historicoUso: [novoRegistro, ...(m.historicoUso || [])],
                };
            }),
        })),

    reporEstoque: (id, quantidadeComprada, precoTotalNovaCompra) =>
        set((state) => ({
            materiais: state.materiais.map((m) => {
                if (m.id !== id) return m;

                const estoqueEmUsoFracao = m.pesoRestanteGramas / m.pesoGramas;
                const estoqueTotalAtualFract = m.estoque + estoqueEmUsoFracao;
                const valorTotalAtual = estoqueTotalAtualFract * m.precoCentavos;

                const novoEstoqueTotalFract = estoqueTotalAtualFract + quantidadeComprada;
                const novoValorTotal = valorTotalAtual + precoTotalNovaCompra;
                const novoPrecoMedioUnitario =
                    novoEstoqueTotalFract > 0
                        ? novoValorTotal / novoEstoqueTotalFract
                        : m.precoCentavos;

                const novoRegistro: RegistroUso = {
                    id: crypto.randomUUID(),
                    data: new Date().toISOString(),
                    nomePeca: `Reposição de Estoque (+${quantidadeComprada})`,
                    quantidadeGastaGramas: 0,
                    status: "MANUAL",
                };

                return {
                    ...m,
                    estoque: m.estoque + quantidadeComprada,
                    precoCentavos: Number(novoPrecoMedioUnitario.toFixed(2)),
                    historicoUso: [novoRegistro, ...(m.historicoUso || [])],
                };
            }),
        })),
}));
