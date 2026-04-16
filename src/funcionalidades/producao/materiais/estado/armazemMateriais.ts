import { create } from "zustand";
import { Material, RegistroUso } from "@/funcionalidades/producao/materiais/tipos";

interface EstadoMateriais {
    materiais: Material[];
    carregando: boolean; // Simular requisições futuras

    // Ações Base
    definirMateriais: (materiais: Material[]) => void;
    definirCarregando: (status: boolean) => void;
    adicionarMaterial: (novo: Material) => void;
    atualizarMaterial: (id: string, dados: Partial<Material>) => void;
    arquivarMaterial: (id: string) => void;

    // Ações Específicas de Domínio
    abaterPeso: (id: string, qtdAbatida: number, motivo: string, status?: "SUCESSO" | "FALHA" | "CANCELADO" | "MANUAL") => void;
    reporEstoque: (id: string, quantidadeComprada: number, precoTotalNovaCompra: number) => void;
}

// Simulando dados iniciais vazios. No futuro será preenchido por React Query / useEffect fetch.
export const usarArmazemMateriais = create<EstadoMateriais>((set) => ({
    materiais: [],
    carregando: false,

    definirMateriais: (materiais) => set({ materiais }),
    definirCarregando: (status) => set({ carregando: status }),

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

                const hoje = new Date();
                const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                    .format(hoje)
                    .replace(" de ", " ")
                    .replace(".,", ",");

                const novoRegistro: RegistroUso = {
                    id: Date.now().toString(),
                    data: dataFormatada,
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

                const hoje = new Date();
                const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                    .format(hoje)
                    .replace(" de ", " ")
                    .replace(".,", ",");

                const novoRegistro: RegistroUso = {
                    id: Date.now().toString(),
                    data: dataFormatada,
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
