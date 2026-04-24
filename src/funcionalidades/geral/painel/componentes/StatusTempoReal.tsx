import { ChevronRight, Printer } from "lucide-react";
import { StatusItem } from "./StatusItem";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { StatusImpressora, StatusPedido } from "@/compartilhado/tipos/modelos";
import { useNavigate } from "react-router-dom";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";

export function StatusTempoReal() {
    const { impressoras } = usarArmazemImpressoras();
    const { pedidos } = usarPedidos();
    const navegar = useNavigate();

    // Filtramos apenas máquinas que não estão aposentadas
    const maquinasAtivas = impressoras.filter(imp => !imp.dataAposentadoria);
    
    // Pegamos as 3 primeiras para o resumo do dashboard
    const resumoMaquinas = maquinasAtivas.slice(0, 3);

    // Encontra o trabalho (pedido) ativo em uma máquina específica
    const buscarTrabalhoAtivo = (idImpressora: string) => {
        return pedidos.find(p => p.idImpressora === idImpressora && p.status === StatusPedido.EM_PRODUCAO);
    };

    const obterCorStatus = (status: string) => {
        switch (status) {
            case StatusImpressora.LIVRE: return "bg-emerald-500";
            case StatusImpressora.IMPRIMINDO: return "bg-amber-500";
            case StatusImpressora.MANUTENCAO: return "bg-rose-500";
            default: return "bg-zinc-500";
        }
    };

    const obterLabelStatus = (status: string) => {
        switch (status) {
            case StatusImpressora.LIVRE: return "PRONTA";
            case StatusImpressora.IMPRIMINDO: return "EM CURSO";
            case StatusImpressora.MANUTENCAO: return "EM REVISÃO";
            default: return status;
        }
    };

    return (
        <div className="bg-white dark:bg-[#121215] rounded-2xl p-8 border border-gray-100 dark:border-white/5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white mb-6 uppercase">Status em Tempo Real</h3>

            {resumoMaquinas.length > 0 ? (
                <div className="space-y-6 flex-1">
                    {resumoMaquinas.map((imp) => {
                        const trabalho = buscarTrabalhoAtivo(imp.id);
                        return (
                            <StatusItem
                                key={imp.id}
                                titulo={trabalho ? trabalho.descricao : imp.status === StatusImpressora.IMPRIMINDO ? "Trabalho Não Identificado" : "Monitoramento de Saúde"}
                                maquina={imp.nome}
                                // Sem telemetria, progresso é 100% se pronto, ou 0% se ocupada (dados reais disponíveis)
                                progresso={imp.status === StatusImpressora.LIVRE ? 100 : 0}
                                status={obterLabelStatus(imp.status)}
                                cor={obterCorStatus(imp.status)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                    <Printer size={40} className="text-gray-300 dark:text-zinc-700 mb-3" />
                    <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Nenhuma máquina ativa</p>
                </div>
            )}

            <button 
                onClick={() => navegar("/impressoras")}
                className="mt-8 w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
                Ver Parque Completo
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
