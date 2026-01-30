import React from 'react';
import { Trash2, AlertTriangle, AlertCircle, PackageOpen, X } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import VisualizacaoCarretel from './VisualizacaoCarretel';
import { useMemo } from 'react';

export default function ModalExcluirFilamento({ aberto, aoFechar, aoConfirmar, item, carregando = false }) {

    const retorno = useMemo(() => {
        if (!item) return { titulo: "Excluir Material", descricao: "Ação irreversível" };

        const peso = Number(item.peso_atual) || 0;
        const total = Number(item.peso_total) || 1000;
        const porcentagem = (peso / total) * 100;

        if (porcentagem > 90) {
            return {
                icone: AlertTriangle,
                titulo: "Excluir Material Novo?",
                subtitulo: "Este carretel está praticamente cheio.",
                aviso: "Você está descartando um material novo. Certifique-se de que é isso mesmo que deseja.",
                cor: "rose"
            };
        } else if (porcentagem > 20) {
            return {
                icone: AlertCircle,
                titulo: "Excluir Material em Uso?",
                subtitulo: `Ainda restam ${Math.round(peso)}g neste carretel.`,
                aviso: "Ao excluir, você perderá todo o histórico de uso vinculado a este lote.",
                cor: "amber"
            };
        } else {
            return {
                icone: PackageOpen,
                titulo: "Descartar Carretel Vazio",
                subtitulo: "O material está no fim.",
                aviso: "Esta ação apenas remove o registro do sistema. O histórico será arquivado.",
                cor: "zinc"
            };
        }
    }, [item]);

    if (!item) return null;

    return (
        <Modal
            isOpen={aberto}
            onClose={aoFechar}
            title={retorno.titulo}
            subtitle={retorno.subtitulo}
            icon={retorno.icone}
            color={retorno.cor}
            maxWidth="max-w-md"
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        onClick={aoFechar}
                        disabled={carregando}
                        className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-xs font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={aoConfirmar}
                        disabled={carregando}
                        className={`flex-1 py-3 px-4 rounded-xl text-white text-xs font-bold uppercase shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed
                            ${retorno.cor === 'rose' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20' :
                                retorno.cor === 'amber' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' :
                                    'bg-zinc-700 hover:bg-zinc-600 shadow-black/40'}`}
                    >
                        {carregando ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Trash2 size={16} />
                        )}
                        {carregando ? "Excluindo..." : "Confirmar Exclusão"}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col items-center pt-2 pb-6 space-y-6">

                {/* Destaque Visual do Carretel */}
                <div className="relative group">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-20 blur-2xl transition-all duration-700 pointer-events-none
                        ${retorno.cor === 'rose' ? 'bg-rose-600' : 'bg-amber-500'}`}
                    />
                    <VisualizacaoCarretel
                        cor={item.cor_hex}
                        tamanho={140}
                        porcentagem={(item.peso_atual / item.peso_total) * 100}
                    />
                </div>

                {/* Detalhes */}
                <div className="text-center space-y-4 px-4 w-full">
                    <div>
                        <h3 className="text-lg font-black text-white leading-none mb-1">
                            {item.nome}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                            <span>{item.marca}</span>
                            <span>•</span>
                            <span>{item.material}</span>
                        </div>
                    </div>

                    {/* Caixa de Aviso */}
                    <div className={`p-4 rounded-xl border flex items-start gap-3 text-left relative overflow-hidden
                         ${retorno.cor === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            retorno.cor === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'}`}>

                        <retorno.icone size={18} className="shrink-0 mt-0.5" />
                        <p className="text-xs font-medium leading-relaxed opacity-90">
                            {retorno.aviso}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
