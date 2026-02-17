import React, { useState, useMemo } from 'react';
import { AlertOctagon, Layers, Loader2, Save, Ban } from 'lucide-react';
import VisualizacaoMaterial from './VisualizacaoMaterial';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useMateriais } from '../logic/consultasMateriais';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import api from '../../../utils/api';
import { parseNumber } from "../../../utils/numbers";
import { MATERIAIS_RESINA_FLAT } from "../logic/constantes";

export default function ModalRegistrarFalhaMaterial({ aberto, aoFechar, aoSalvar }) {
    const [carregando, setCarregando] = useState(false);
    const [mostrarErros, setMostrarErros] = useState(false);
    const { feedback, showSuccess, showError, hide: esconderFeedback } = useFormFeedback();

    // Estado do Formulário
    const [formulario, setFormulario] = useState({
        pesoDesperdiciado: '',
        custoDesperdiciado: '',
        motivo: 'Falha de Aderência',
        idFilamento: 'manual',
    });

    const { data: filamentos = [] } = useMateriais();

    const motivos = [
        "Falha de Aderência", "Entupimento de Bico", "Queda de Energia",
        "Erro no Fatiamento", "Fim de Filamento", "Warping (Empenamento)",
        "Layer Shift", "Outros"
    ];

    const manipularEnvio = async () => {
        if (!formulario.pesoDesperdiciado) {
            setMostrarErros(true);
            return;
        }
        setCarregando(true);
        esconderFeedback();
        try {
            await api.post('/failures', {
                weightWasted: formulario.pesoDesperdiciado,
                costWasted: formulario.custoDesperdiciado,
                reason: formulario.motivo,
                filamentId: formulario.idFilamento
            });

            showSuccess('Falha registrada com sucesso!');
            if (aoSalvar) aoSalvar();

            setTimeout(() => {
                aoFechar();
                setFormulario({ pesoDesperdiciado: '', custoDesperdiciado: '', motivo: 'Falha de Aderência', idFilamento: 'manual' });
                setMostrarErros(false);
                esconderFeedback();
            }, 1500);
        } catch (error) {
            console.error(error);
            showError('Erro ao registrar falha. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    };

    const manipularMudancaFilamento = (id) => {
        const fil = filamentos.find(f => String(f.id) === String(id));
        let custo = '';

        if (fil && formulario.pesoDesperdiciado) {
            const precoPorGrama = (Number(fil.preco) / Number(fil.peso_total));
            custo = (precoPorGrama * Number(formulario.pesoDesperdiciado)).toFixed(2);
        }
        setFormulario(anterior => ({ ...anterior, idFilamento: id, custoDesperdiciado: custo }));
    };

    const manipularMudancaPeso = (val) => {
        const peso = val.replace(',', '.');
        let custo = formulario.custoDesperdiciado;

        if (formulario.idFilamento !== 'manual') {
            const fil = filamentos.find(f => String(f.id) === String(formulario.idFilamento));
            if (fil) {
                const precoPorGrama = (Number(fil.preco) / Number(fil.peso_total));
                custo = (precoPorGrama * parseNumber(peso)).toFixed(2);
            }
        }
        setFormulario(anterior => ({ ...anterior, pesoDesperdiciado: peso, custoDesperdiciado: custo }));
    };

    const opcoesFilamento = useMemo(() => [
        { group: "Ações", items: [{ value: "manual", label: "Nenhum / Apenas Registrar" }] },
        {
            group: "Meus Filamentos",
            items: filamentos.map(f => ({ value: String(f.id), label: f.nome, color: f.cor_hex }))
        }
    ], [filamentos]);

    // Logic to Detect if Selected Item is Resin
    const isSelectedResin = useMemo(() => {
        if (formulario.idFilamento === 'manual') return false;
        const fil = filamentos.find(f => String(f.id) === String(formulario.idFilamento));
        if (!fil) return false;

        const mat = (fil.material || "").trim();
        const tipo = (fil.tipo || "").toUpperCase();

        return (
            tipo === 'SLA' ||
            tipo === 'RESINA' ||
            MATERIAIS_RESINA_FLAT.includes(mat) ||
            MATERIAIS_RESINA_FLAT.some(r => mat.toLowerCase().includes(r.toLowerCase())) ||
            mat.toLowerCase().includes('resina') ||
            mat.toLowerCase().includes('resin')
        );
    }, [formulario.idFilamento, filamentos]);

    const unitSuffix = isSelectedResin ? "ml" : "g";
    const volumeLabel = isSelectedResin ? "Volume Perdido" : "Peso Perdido";

    // Conteúdo da Barra Lateral segue estética do ModalFilamento
    const conteudoLateral = (
        <div className="flex flex-col items-center w-full h-full relative z-10 justify-between py-6">
            {/* Cabeçalho Contextual */}
            <div className="w-full flex justify-between items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Alerta</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-zinc-700">
                    FALHA
                </div>
            </div>

            {/* Visualização Central do Ícone */}
            <div className="relative group w-full flex-1 flex items-center justify-center select-none">
                {/* Brilho Dinâmico */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full opacity-20 blur-[60px] bg-rose-500 transition-all duration-700 pointer-events-none" />

                {/* Container de Ícone ou Visualização do Carretel */}
                <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-105 pointer-events-none drop-shadow-2xl">
                    {formulario.idFilamento !== 'manual' && filamentos.find(f => String(f.id) === String(formulario.idFilamento)) ? (
                        <VisualizacaoMaterial
                            cor={filamentos.find(f => String(f.id) === String(formulario.idFilamento)).cor_hex}
                            tamanho={200}
                            porcentagem={80} // Visual fixo para modo de falha
                            tipo={isSelectedResin ? 'SLA' : 'FDM'}
                        />
                    ) : (
                        <div className="w-48 h-48 rounded-full bg-zinc-900/50 border border-rose-500/20 flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                            <AlertOctagon size={80} className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" strokeWidth={1.5} />
                        </div>
                    )}
                </div>

                {/* Sobreposição de Informações */}
                <div className="absolute inset-x-0 bottom-6 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <p className="text-[9px] font-bold text-rose-500/80 uppercase tracking-widest mb-1">Motivo</p>
                    <h3 className="text-xl font-bold text-white drop-shadow-lg leading-tight px-4 line-clamp-2">
                        {formulario.motivo}
                    </h3>
                </div>
            </div>

            {/* Cartão de Prejuízo */}
            <div className="w-full px-6 pb-2">
                <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Material Afetado</span>
                            <span className="text-xs font-bold text-zinc-300 truncate max-w-[180px]">
                                {formulario.idFilamento !== 'manual' ? (filamentos.find(f => String(f.id) === String(formulario.idFilamento))?.nome || 'Selecionando...') : 'Registro Manual'}
                            </span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-zinc-800/50" />

                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Prejuízo Estimado</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-mono text-zinc-500">R$</span>
                            <span className="text-2xl font-bold font-mono text-rose-400 tracking-tighter shadow-rose-500/10 drop-shadow-md">
                                {formulario.custoDesperdiciado || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Conteúdo do Rodapé
    const conteudoRodape = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={esconderFeedback} />

            <div className="flex gap-4">
                <button disabled={carregando} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={carregando}
                    onClick={manipularEnvio}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!carregando ? "bg-rose-500 text-white hover:bg-rose-400 active:scale-95 hover:shadow-xl shadow-lg shadow-rose-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {carregando ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                    Confirmar Prejuízo
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={aoFechar}
            sidebar={conteudoLateral}
            header={{ title: "Registrar Falha", subtitle: "Registre desperdícios para abater do lucro bruto mensal" }}
            footer={conteudoRodape}
            isSaving={carregando}
            isDirty={!!formulario.pesoDesperdiciado}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <UnifiedInput
                        label="O que aconteceu?"
                        type="select"
                        options={[{
                            items: (isSelectedResin ? [
                                "Falha de Aderência (Plataforma)", "Falha de Cura", "Queda de Energia",
                                "Suporte Quebrado", "Fim de Resina", "Resina Contaminada", "Outros"
                            ] : [
                                "Falha de Aderência", "Entupimento de Bico", "Queda de Energia",
                                "Erro no Fatiamento", "Fim de Filamento", "Warping (Empenamento)", "Outros"
                            ]).map(r => ({ value: r, label: r }))
                        }]}
                        value={formulario.motivo}
                        onChange={(v) => setFormulario({ ...formulario, motivo: v })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <UnifiedInput
                            label={volumeLabel}
                            suffix={unitSuffix}
                            type="number"
                            placeholder="0"
                            value={formulario.pesoDesperdiciado}
                            onChange={(e) => manipularMudancaPeso(e.target.value)}
                            error={mostrarErros && !formulario.pesoDesperdiciado}
                        />
                        <UnifiedInput
                            label="Custo Est."
                            suffix="R$"
                            type="number"
                            placeholder="0.00"
                            value={formulario.custoDesperdiciado}
                            onChange={(e) => setFormulario({ ...formulario, custoDesperdiciado: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/50 space-y-4">
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                        <Layers size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Abater do Estoque?</span>
                    </div>
                    <UnifiedInput
                        type="select"
                        options={opcoesFilamento}
                        value={formulario.idFilamento}
                        onChange={manipularMudancaFilamento}
                    />
                </div>
            </div>
        </SideBySideModal>
    );
}
