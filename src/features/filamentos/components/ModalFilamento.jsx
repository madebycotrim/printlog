import React, { useState, useEffect, useCallback, useRef } from "react";
import { Terminal, Loader2 } from "lucide-react";
import VisualizacaoCarretel from "./VisualizacaoCarretel";
import FormFeedback from "../../../components/FormFeedback";
import { useFormFeedback } from "../../../hooks/useFormFeedback";
import { validateInput, schemas } from "../../../utils/validation";
import SideBySideModal from "../../../components/ui/SideBySideModal";
import { parseNumber } from "../../../utils/numbers";
import FormularioIdentificacaoFilamento from "./FormIdentificacaoFilamento";
import FormularioEstoqueFilamento from "./FormEstoqueFilamento";

// Limpeza avançada de valores numéricos
const safeParse = parseNumber;

const ESTADO_INICIAL = {
    marca: "",
    nome: "",
    material: "",
    cor_hex: "",
    diametro: "1.75",
    preco: "",
    peso_total: "1000",
    data_abertura: new Date().toISOString().split('T')[0]
};

export default function ModalFilamento({ aberto, aoFechar, aoSalvar, dadosIniciais = null }) {
    const [formulario, setFormulario] = useState(ESTADO_INICIAL);
    const [modificado, setModificado] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [mostrarErros, setMostrarErros] = useState(false);
    const { feedback, showError, hide: esconderFeedback } = useFormFeedback();

    useEffect(() => {
        if (aberto) {
            if (dadosIniciais) {
                setFormulario({
                    id: dadosIniciais.id || null,
                    marca: dadosIniciais.marca || "",
                    nome: dadosIniciais.nome || "",
                    material: dadosIniciais.material || "PLA",
                    cor_hex: dadosIniciais.cor_hex || "",
                    diametro: dadosIniciais.diametro || "1.75",
                    preco: String(dadosIniciais.preco || ""),
                    peso_total: String(dadosIniciais.peso_total || "1000"),
                    peso_atual: dadosIniciais.peso_atual,
                    data_abertura: dadosIniciais.data_abertura
                        ? (dadosIniciais.data_abertura.split('T')[0])
                        : (dadosIniciais.created_at ? dadosIniciais.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
                });
            } else {
                setFormulario(ESTADO_INICIAL);
            }
            setModificado(false);
            setSalvando(false);
            setMostrarErros(false);
        }
    }, [aberto, dadosIniciais]);

    const atualizarFormulario = (campo, valor) => {
        if (salvando) return;
        setFormulario(anterior => ({ ...anterior, [campo]: valor }));
        setModificado(true);
    };

    const manipularSalvar = useCallback(async () => {
        console.log("🎯 [DEBUG] ============================================");
        console.log("🎯 [DEBUG] manipularSalvar FOI CHAMADO!");
        console.log("🎯 [DEBUG] Valor de salvando:", salvando);
        console.log("🎯 [DEBUG] ============================================");

        if (salvando) {
            console.log("⚠️ [DEBUG] Salvamento já em andamento, retornando...");
            return;
        }

        const pesoTotalNum = Math.max(1, safeParse(formulario.peso_total));
        const precoNum = Math.max(0, safeParse(formulario.preco));

        // Lógica: Se vazio/undefined, assume Carretel Novo (Cheio). Se for número (incluindo 0), usa ele.
        let pesoAtualFinal;
        if (formulario.peso_atual === "" || formulario.peso_atual === undefined || formulario.peso_atual === null) {
            pesoAtualFinal = pesoTotalNum;
        } else {
            pesoAtualFinal = Number(formulario.peso_atual);
        }
        // Limita para garantir que não exceda o total ou fique abaixo de 0
        pesoAtualFinal = Math.min(Math.max(0, pesoAtualFinal), pesoTotalNum);

        const payload = {
            ...formulario,
            nome: formulario.nome.trim(),
            marca: formulario.marca.trim(),
            material: formulario.material || "PLA",
            diametro: formulario.diametro,
            preco: precoNum,
            peso_total: pesoTotalNum,
            peso_atual: pesoAtualFinal,
            favorito: formulario.favorito || false
        };

        console.log("🔍 [DEBUG] Payload a ser enviado:", payload);

        const check = validateInput(payload, schemas.filament);
        if (!check.valid) {
            console.error("❌ [VALIDATION ERROR] Erros de validação:", check.errors);
            showError(`Validação falhou: ${check.errors.join(', ')}`);
            setMostrarErros(true);
            const shakeElement = document.querySelector('.animate-shake');
            if (shakeElement) {
                shakeElement.classList.remove('animate-shake');
                void shakeElement.offsetWidth;
                shakeElement.classList.add('animate-shake');
            }
            return;
        }

        try {
            console.log("✅ [DEBUG] Validação passou, iniciando salvamento...");
            setSalvando(true);
            esconderFeedback();
            console.log("📡 [DEBUG] Chamando aoSalvar com payload:", payload);
            const resultado = await aoSalvar(payload);
            console.log("✅ [DEBUG] aoSalvar retornou com sucesso:", resultado);
            aoFechar();
        } catch (error) {
            console.error("❌ [ERROR] Erro ao salvar filamento:", error);
            console.error("❌ [ERROR] Error stack:", error.stack);
            console.error("❌ [ERROR] Error message:", error.message);
            showError("Erro ao salvar. Verifique os dados.");
        } finally {
            console.log("🏁 [DEBUG] Finalizando processo de salvamento");
            setSalvando(false);
        }
    }, [formulario, aoSalvar, salvando, showError, esconderFeedback, aoFechar]);

    // Estados e refs para interação com carretel
    const referenciaCarretel = useRef(null);
    const [arrastando, setArrastando] = useState(false);
    const [emFoco, setEmFoco] = useState(false);

    // Interação com Carretel (Arrastar para definir peso)
    const manipularInteracaoCarretel = useCallback((e) => {
        if (!referenciaCarretel.current || salvando) return;

        const rect = referenciaCarretel.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const altura = rect.height;
        const percentual = Math.max(0, Math.min(1, 1 - (y / altura)));

        const pesoTotal = Number(formulario.peso_total) || 1000;
        const novoPeso = Math.round(percentual * pesoTotal);

        atualizarFormulario('peso_atual', novoPeso);
    }, [formulario.peso_total, salvando, atualizarFormulario]);

    // Conteúdo da Barra Lateral (Prévia) segue estética do ModalCliente
    const conteudoLateral = (
        <div className="flex flex-col items-center w-full h-full relative z-10 justify-between py-8 px-6">

            {/* Seção de Informações no Topo */}
            <div className="w-full text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/50">
                        {formulario.marca || "Marca"}
                        <span className="mx-1 text-zinc-700">|</span>
                        {formulario.material || "Material"}
                    </span>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight leading-none break-words line-clamp-2 drop-shadow-lg">
                    {formulario.nome || "Novo Filamento"}
                </h2>
            </div>

            {/* Central Spool Visualization */}
            <div className="w-full flex-1 flex items-center justify-center select-none my-4">
                {/* Visual Container */}
                <div className="relative w-[220px] h-[220px]">

                    {/* HIT BOX - INTERACTION LAYER */}
                    <div
                        className="absolute inset-0 z-50 cursor-ns-resize rounded-full focus:ring-4 focus:ring-blue-500/50 focus:outline-none"
                        ref={referenciaCarretel}
                        tabIndex={0}
                        role="slider"
                        aria-label="Ajustar peso restante"
                        aria-valuemin={0}
                        aria-valuemax={Number(formulario.peso_total) || 1000}
                        aria-valuenow={Number(formulario.peso_atual ?? formulario.peso_total)}
                        aria-valuetext={`${Math.round((Number(formulario.peso_atual ?? formulario.peso_total) / Math.max(1, Number(formulario.peso_total))) * 100)}% restante`}
                        onMouseEnter={() => setEmFoco(true)}
                        onMouseDown={() => setArrastando(true)}
                        onMouseUp={() => setArrastando(false)}
                        onMouseLeave={() => { setArrastando(false); setEmFoco(false); }}
                        onMouseMove={(e) => arrastando && manipularInteracaoCarretel(e)}
                        onClick={manipularInteracaoCarretel}
                        onKeyDown={(e) => {
                            const total = Number(formulario.peso_total) || 1000;
                            const current = Number(formulario.peso_atual ?? total);
                            const step = e.shiftKey ? 10 : 50; // shift for fine grain

                            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                                e.preventDefault();
                                atualizarFormulario("peso_atual", Math.min(total, current + step));
                            } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                                e.preventDefault();
                                atualizarFormulario("peso_atual", Math.max(0, current - step));
                            } else if (e.key === "Home") {
                                e.preventDefault();
                                atualizarFormulario("peso_atual", total);
                            } else if (e.key === "End") {
                                e.preventDefault();
                                atualizarFormulario("peso_atual", 0);
                            }
                        }}
                        onTouchStart={() => setArrastando(true)}
                        onTouchEnd={() => setArrastando(false)}
                        onTouchMove={(e) => arrastando && manipularInteracaoCarretel(e)}
                        title="Arraste ou use setas do teclado para ajustar o peso"
                    />

                    {/* GLOW BACKGROUND */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full opacity-15 blur-[60px] transition-all duration-700 pointer-events-none"
                        style={{ backgroundColor: formulario.cor_hex || "#333" }}
                    />

                    {/* MAIN SPOOL SVG */}
                    <div className={`transform transition-transform duration-500 ${emFoco ? "scale-105" : ""} active:scale-95 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none`}>
                        <VisualizacaoCarretel
                            cor={formulario.cor_hex || "#202024"}
                            tamanho={220}
                            porcentagem={
                                Math.min(100, (Number(formulario.peso_atual !== undefined ? formulario.peso_atual : formulario.peso_total) / Math.max(1, Number(formulario.peso_total))) * 100)
                            }
                        />
                    </div>

                    {/* PERCENTAGE INDICATOR */}
                    <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 transform pointer-events-none z-40 ${emFoco ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
                        <span className="text-3xl font-black text-white drop-shadow-lg tabular-nums tracking-tighter">
                            {Math.round((Number(formulario.peso_atual !== undefined ? formulario.peso_atual : formulario.peso_total) / Math.max(1, Number(formulario.peso_total))) * 100)}%
                        </span>
                    </div>

                    {/* DRAG HINT */}
                    <div className={`absolute right-[-40px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 pointer-events-none ${emFoco ? "opacity-40" : "opacity-0"}`}>
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                </div>
            </div>

            {/* Bottom Tech Details */}
            <div className="w-full flex justify-center pb-2">
                <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl px-4 py-2 hover:bg-zinc-800/80 transition-colors shadow-lg">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hex</span>
                    <div className="w-px h-3 bg-zinc-700" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded shadow-sm border border-zinc-600" style={{ backgroundColor: formulario.cor_hex || "#333" }} />
                        <span className="text-xs font-mono font-bold text-zinc-300 uppercase">{formulario.cor_hex || "#---"}</span>
                    </div>
                </div>
            </div>

        </div>
    );

    // Footer Content
    const footerContent = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={esconderFeedback} />

            <div className="flex gap-4">
                <button disabled={salvando} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={salvando}
                    onClick={manipularSalvar}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!salvando ? "bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-95 hover:shadow-xl shadow-lg shadow-blue-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {salvando ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {salvando ? "Salvando..." : dadosIniciais?.id ? "Salvar Alterações" : "Cadastrar Filamento"}
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={aoFechar}
            sidebar={conteudoLateral}
            header={{
                title: dadosIniciais?.id ? "Editar Filamento" : "Novo Filamento",
                subtitle: dadosIniciais?.id ? "Atualize os dados do seu material." : "Adicione um novo item ao seu estoque."
            }}
            footer={footerContent}
            salvando={salvando}
            modificado={modificado}
        >
            <div className="space-y-8 relative">

                <FormularioIdentificacaoFilamento
                    formulario={formulario}
                    atualizarFormulario={atualizarFormulario}
                    mostrarErros={mostrarErros}
                />

                <FormularioEstoqueFilamento
                    formulario={formulario}
                    atualizarFormulario={atualizarFormulario}
                    setFormulario={setFormulario}
                    mostrarErros={mostrarErros}
                    dadosIniciais={dadosIniciais}
                />
            </div>
        </SideBySideModal>
    );
}
