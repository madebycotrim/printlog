import React, { useMemo } from "react";
import { X, Check, Wrench, Gauge, Plus } from "lucide-react";
import { analisarSaudeImpressora } from "../logic/diagnostics";
import { parseNumber, formatDecimal } from "../../../utils/numbers";
import SideBySideModal from "../../../components/ui/SideBySideModal";

// Sub-componente para os medidores da lateral (Refinado)
const MedidorManutencao = ({ rotulo, valor, maximo, unidade }) => {
    // Garante que o divisor não seja zero para evitar NaN
    const divisor = Math.max(1, maximo);
    const porcentagem = Math.min(100, (valor / divisor) * 100);
    const ehCritico = porcentagem > 85;

    // Calcula o valor restante para exibição
    const restante = Math.max(0, maximo - valor);

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-zinc-500">{rotulo}</span>
                <span className={ehCritico ? 'text-rose-400' : 'text-emerald-500/80'}>
                    {formatDecimal(restante, 0)}{unidade}
                </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-950/40 rounded-full border border-zinc-800/50 p-[1px]">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${ehCritico ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                    style={{ width: `${Math.max(0, 100 - porcentagem)}%` }}
                />
            </div>
        </div>
    );
};

export default function DiagnosticsModal({ printer, onClose, onResolve, completedTasks = new Set(), onToggleTask }) {
    // Tarefas calculadas para evitar recálculos (deve vir antes do early return)
    const tarefas = useMemo(() => {
        if (!printer) return [];
        return analisarSaudeImpressora(printer) || [];
    }, [printer]);

    const [tarefasExtras, setTarefasExtras] = React.useState([]);
    const [novaTarefa, setNovaTarefa] = React.useState("");

    // Organização de dados de entrada
    const horasTotais = parseNumber(printer?.horas_totais);
    const ultimaManutencao = parseNumber(printer?.ultima_manutencao_hora);
    const intervaloManutencao = parseNumber(printer?.intervalo_manutencao) || 300;

    // Cálculo de tempo decorrido
    const horasDesdeUltima = Math.max(0, horasTotais - ultimaManutencao);

    // Validação de segurança
    if (!printer) return null;

    // Definição do visual com base na gravidade das tarefas
    const temaVisual = tarefas.some(t => t.severidade === 'critical')
        ? 'rose'
        : tarefas.length > 0 ? 'amber' : 'emerald';

    const mapaCores = {
        rose: { texto: 'text-rose-400', borda: 'border-rose-500/20', bg: 'bg-rose-500/5' },
        amber: { texto: 'text-amber-400', borda: 'border-amber-500/20', bg: 'bg-amber-500/5' },
        emerald: { texto: 'text-emerald-400', borda: 'border-emerald-500/20', bg: 'bg-emerald-500/5' }
    }[temaVisual];

    // Quantidade de tarefas concluídas
    const totalConcluidas = completedTasks instanceof Set ? completedTasks.size : 0;

    const handleAdicionarExtra = () => {
        if (!novaTarefa.trim()) return;
        setTarefasExtras(prev => [...prev, novaTarefa.trim()]);
        setNovaTarefa("");
    };

    const handleFinalizar = () => {
        // Coleta o que foi feito: Itens marcados do checklist + Tarefas extras
        const itensChecklist = tarefas.filter(t => completedTasks.has(t.rotulo)).map(t => t.rotulo);
        const todasAsAcoes = [...itensChecklist, ...tarefasExtras];
        onResolve?.(printer.id, todasAsAcoes);
    };

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col h-full w-full justify-between">
            <div className="space-y-8 w-full">
                <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <Gauge size={14} className="text-zinc-500" /> Saúde das Peças
                </h3>
                <div className="space-y-6 w-full">
                    <MedidorManutencao rotulo="Hotend e Bico" valor={horasDesdeUltima} maximo={intervaloManutencao * 0.6} unidade="h" />
                    <MedidorManutencao rotulo="Eixos e Correias" valor={horasDesdeUltima} maximo={intervaloManutencao} unidade="h" />
                    <MedidorManutencao rotulo="Aquecimento e Mesa" valor={horasDesdeUltima} maximo={intervaloManutencao * 2} unidade="h" />
                </div>
            </div>

            <div className="pt-8 border-t border-zinc-800/50 w-full">
                <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-3 tracking-widest">Tempo de Uso Total</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-zinc-100 tracking-tighter">{Math.floor(horasTotais)}</span>
                    <span className="text-xs font-semibold text-zinc-500 uppercase">Horas</span>
                </div>
            </div>
        </div>
    );

    // Footer Content
    const footerContent = (
        <div className="flex justify-between items-center w-full">
            <div className="flex gap-2.5">
                {tarefas.map((t, i) => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${completedTasks?.has?.(t.rotulo) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-900/50'
                        }`} />
                ))}
            </div>
            <div className="flex items-center gap-8">
                <button
                    onClick={onClose}
                    className="text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-200 transition-all tracking-widest"
                >
                    Cancelar
                </button>

                <button
                    disabled={tarefas.length > 0 && totalConcluidas < tarefas.length}
                    onClick={handleFinalizar}
                    className={`px-10 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${totalConcluidas === tarefas.length && tarefas.length > 0
                        ? 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg active:scale-[0.98]'
                        : 'bg-zinc-950/40 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50'
                        }`}
                >
                    Finalizar Manutenção
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={!!printer}
            onClose={onClose}
            sidebar={sidebarContent}
            header={{
                title: "Protocolo de Manutenção",
                subtitle: `Máquina: ${printer.nome || "Impressora Desconhecida"}`,
                icon: Wrench
            }}
            footer={footerContent}
        >
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Lista de Revisão</h3>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        {totalConcluidas} / {tarefas.length} TAREFAS CONCLUÍDAS
                    </span>
                </div>

                <div className="space-y-4">
                    {tarefas.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem]">
                            <Check size={40} className="text-zinc-800 mb-4" />
                            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Tudo em ordem por aqui</p>
                        </div>
                    ) : (
                        tarefas.map((tarefa, idx) => {
                            const concluida = completedTasks?.has?.(tarefa.rotulo);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => onToggleTask?.(tarefa.rotulo)}
                                    className={`group flex items-center gap-5 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${concluida
                                        ? 'bg-zinc-950/40/20 border-zinc-800/40 opacity-50'
                                        : 'bg-zinc-950/40/40 border-zinc-800 hover:border-zinc-800/30 hover:bg-zinc-950/40/60 shadow-sm'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${concluida
                                        ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                                        : 'border-zinc-800/50 bg-zinc-950 text-zinc-500 group-hover:border-zinc-500'
                                        }`}>
                                        {concluida ? <Check size={20} strokeWidth={3} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-sm font-bold tracking-tight ${concluida ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                                                {tarefa.rotulo}
                                            </span>
                                            {tarefa.severidade === 'critical' && !concluida && (
                                                <span className="text-[9px] font-bold text-rose-400 uppercase px-2 py-0.5 rounded-md border border-rose-500/30 bg-rose-500/5 animate-pulse">Crítico</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Ação: {tarefa.acao}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* TAREFAS EXTRAS (ADICIONADAS PELO USUÁRIO) */}
                {tarefasExtras.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                        <h4 className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Ações Extras Realizadas</h4>
                        <div className="space-y-2">
                            {tarefasExtras.map((t, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-zinc-300 text-xs">
                                    <Check size={14} className="text-sky-400" /> {t}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INPUT PARA NOVA TAREFA EXTRA */}
                <div className="flex gap-2 pt-2">
                    <input
                        className="flex-1 bg-zinc-950/40 border border-zinc-800 rounded-xl px-4 text-xs outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
                        placeholder="Adicionar serviço extra realizado..."
                        value={novaTarefa}
                        onChange={(e) => setNovaTarefa(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdicionarExtra()}
                    />
                    <button
                        onClick={handleAdicionarExtra}
                        disabled={!novaTarefa.trim()}
                        className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-all"
                    >
                        <Plus size={16} className="text-zinc-400" />
                    </button>
                </div>
            </div>
        </SideBySideModal>
    );
}
