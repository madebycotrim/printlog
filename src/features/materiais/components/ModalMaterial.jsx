import React, { useState, useEffect, useCallback, useRef } from "react";
import { Terminal, Loader2 } from "lucide-react";
import VisualizacaoMaterial from "./VisualizacaoMaterial";
import FormFeedback from "../../../components/FormFeedback";
import { useToastStore } from '../../../stores/toastStore';
import { useFormFeedback } from "../../../hooks/useFormFeedback";
import { validateInput, schemas } from "../../../utils/validation";
import SideBySideModal from "../../../components/ui/SideBySideModal";
import { parseNumber } from "../../../utils/numbers";
import FormularioIdentificacaoMaterial from "./FormIdentificacaoMaterial";
import FormularioEstoqueMaterial from "./FormEstoqueMaterial";
import { MATERIAIS_RESINA_FLAT, CORES_MAIS_VENDIDAS, CORES_RESINA } from "../logic/constantes";

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
    data_abertura: new Date().toISOString().split('T')[0],
    fornecedor: "",
    url_compra: "",
    data_secagem: ""
};

export default function ModalMaterial({ aberto, aoFechar, aoSalvar, dadosIniciais = null }) {
    const [formulario, setFormulario] = useState(ESTADO_INICIAL);
    const [modificado, setModificado] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [mostrarErros, setMostrarErros] = useState(false);
    const { feedback, showError, hide: esconderFeedback } = useFormFeedback();

    useEffect(() => {
        if (aberto) {
            if (dadosIniciais) {
                // Smart Detection for Edit
                const mat = (dadosIniciais.material || "").trim();
                const tipoRaw = (dadosIniciais.tipo || "").toUpperCase();

                const isDetectedSLA =
                    tipoRaw === 'SLA' ||
                    tipoRaw === 'RESINA' ||
                    MATERIAIS_RESINA_FLAT.includes(mat) ||
                    MATERIAIS_RESINA_FLAT.some(r => mat.toLowerCase().includes(r.toLowerCase())) ||
                    mat.toLowerCase().includes('resina') ||
                    mat.toLowerCase().includes('resin');

                const finalType = isDetectedSLA ? 'SLA' : (dadosIniciais.tipo || 'FDM');

                // If it's a "New" item (no ID) but with a type hint, ensure material matches type
                const defaultMaterial = finalType === 'SLA' ? "Standard" : "PLA";
                const materialValue = dadosIniciais.material || defaultMaterial;

                setFormulario({
                    id: dadosIniciais.id || null,
                    marca: dadosIniciais.marca || "",
                    nome: dadosIniciais.nome || "",
                    material: materialValue,
                    cor_hex: dadosIniciais.cor_hex || "",
                    diametro: dadosIniciais.diametro || "1.75",
                    preco: String(dadosIniciais.preco || ""),
                    peso_total: String(dadosIniciais.peso_total || "1000"),
                    peso_atual: dadosIniciais.peso_atual,
                    data_abertura: dadosIniciais.data_abertura
                        ? (dadosIniciais.data_abertura.split('T')[0])
                        : (dadosIniciais.created_at ? dadosIniciais.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
                    versao: dadosIniciais.versao, // Optimistic Locking
                    tipo: finalType,
                    fornecedor: dadosIniciais.fornecedor || "",
                    url_compra: dadosIniciais.url_compra || "",
                    data_secagem: dadosIniciais.data_secagem ? dadosIniciais.data_secagem.split('T')[0] : ""
                });
            } else {
                // Carregar último tipo usado (FDM/SLA)
                const lastType = localStorage.getItem('printlog_last_material_type') || 'FDM';
                setFormulario({ ...ESTADO_INICIAL, tipo: lastType });
            }
            setModificado(false);
            setSalvando(false);
            setMostrarErros(false);
        }
    }, [aberto, dadosIniciais]);

    const actualizarFormulario = (campo, valor) => {
        if (salvando) return;
        setFormulario(anterior => ({ ...anterior, [campo]: valor }));
        setModificado(true);
        if (mostrarErros) setMostrarErros(false);
    };

    const handleFechar = useCallback(() => {
        if (salvando) return;
        setMostrarErros(false);
        aoFechar();
    }, [salvando, aoFechar]);

    const manipularSalvar = useCallback(async () => {
        if (salvando) return;

        const pesoTotalNum = Math.max(1, safeParse(formulario.peso_total));
        const precoNum = Math.max(0, safeParse(formulario.preco));

        // Lógica: Se vazio/undefined, assume Carretel Novo (Cheio).
        let pesoAtualFinal;
        if (formulario.peso_atual === "" || formulario.peso_atual === undefined || formulario.peso_atual === null) {
            pesoAtualFinal = pesoTotalNum;
        } else {
            pesoAtualFinal = Number(formulario.peso_atual);
        }
        pesoAtualFinal = Math.min(Math.max(0, pesoAtualFinal), pesoTotalNum);

        const payload = {
            ...formulario,
            nome: formulario.nome.trim(),
            marca: formulario.marca.trim(),
            material: formulario.material,
            diametro: formulario.diametro,
            preco: precoNum,
            peso_total: pesoTotalNum,
            peso_atual: pesoAtualFinal,
            favorito: formulario.favorito || false,
            versao: formulario.versao
        };

        const check = validateInput(payload, schemas.filament);
        if (!check.valid) {
            console.error("❌ [VALIDATION ERROR] Erros de validação:", check.errors);

            setMostrarErros(true);
            const shakeElement = document.querySelector('.animate-shake');
            if (shakeElement) {
                shakeElement.classList.remove('animate-shake');
                void shakeElement.offsetWidth;
                shakeElement.classList.add('animate-shake');
            }
            return;
        }

        // Persist Last Used Type
        if (payload.tipo) {
            localStorage.setItem('printlog_last_material_type', payload.tipo);
        }

        try {
            setSalvando(true);
            esconderFeedback();
            const resultado = await aoSalvar(payload);
            aoFechar();
        } catch (error) {
            console.error("❌ [ERROR] Erro ao salvar material:", error);
            console.error("❌ [ERROR] Error stack:", error.stack);
            console.error("❌ [ERROR] Error message:", error.message);
            showError("Erro ao salvar. Verifique os dados.");
        } finally {
            setSalvando(false);
        }
    }, [formulario, aoSalvar, salvando, showError, esconderFeedback, aoFechar]);

    // Conteúdo da Barra Lateral (Prévia) segue estética do ModalCliente
    const CORES_DISPONIVEIS = [
        // Row 1
        "#FFFFFF", "#FFE4C4", "#D1D5DB", "#FFFF00", "#FFD700", "#FF8C00", "#FF4500", "#B8860B",
        // Row 2
        "#ADFF2F", "#32CD32", "#228B22", "#FA8072", "#FF69B4", "#FF00FF", "#DC2626", "#8B0000",
        // Row 3
        "#8A2BE2", "#4B0082", "#06B6D4", "#0EA5E9", "#2563EB", "#1E3A8A", "#8B4513", "#5D4037",
        // Row 4
        "#556B2F", "#6B7280", "#9CA3AF", "#4B5563", "#1F2937", "#09090b"
    ];

    // const coresDisponiveis = formulario.tipo === 'SLA' ? CORES_RESINA : CORES_MAIS_VENDIDAS;
    const coresDisponiveis = CORES_DISPONIVEIS;
    const conteudoLateral = (
        <div className="flex flex-col items-center w-full h-full relative z-10 justify-between py-6 px-6">

            {/* Seção de Informações no Topo */}
            <div className="w-full text-center space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800/50 rounded-full px-3 py-1 bg-zinc-900/30">
                        {formulario.marca || "Marca"}
                        <span className="mx-2 text-zinc-700">/</span>
                        {formulario.material || "Material"}
                    </span>
                </div>

                <h2 className="text-3xl font-black text-white tracking-tighter leading-none break-words line-clamp-2 drop-shadow-xl">
                    {formulario.nome || (formulario.tipo === 'SLA' ? "Nova Resina" : "Novo Filamento")}
                </h2>
            </div>

            {/* Central Spool Visualization */}
            <div className="w-full flex-1 flex items-center justify-center select-none my-6 relative">
                {/* Ambiente de Fundo - Glow Suave */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                        className="w-64 h-64 rounded-full opacity-10 blur-[80px] transition-all duration-1000"
                        style={{ backgroundColor: formulario.cor_hex || "#333" }}
                    />
                </div>

                {/* Visual Container */}
                <div className="relative w-[240px] h-[240px] z-10 transition-transform duration-500 hover:scale-105">
                    <VisualizacaoMaterial
                        cor={formulario.cor_hex || "#202024"}
                        tamanho={240}
                        porcentagem={
                            Math.min(100, (Number(formulario.peso_atual !== undefined ? formulario.peso_atual : formulario.peso_total) / Math.max(1, Number(formulario.peso_total))) * 100)
                        }
                        tipo={formulario.tipo}
                    />
                </div>
            </div>

            {/* Hex Color Display - Minimalista */}
            <div className="w-full flex justify-center pb-2">
                <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm border border-white/5 rounded-full px-5 py-2.5 shadow-2xl">
                    <div className="w-3 h-3 rounded-full shadow-inner ring-1 ring-white/10" style={{ backgroundColor: formulario.cor_hex || "#333" }} />
                    <span className="text-xs font-mono font-medium text-zinc-400 tracking-wider">
                        {formulario.cor_hex || "#---"}
                    </span>
                </div>
            </div>

        </div>
    );

    // Footer Content
    const footerContent = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={esconderFeedback} />

            <div className="flex gap-3">
                <button
                    disabled={salvando} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={salvando}
                    onClick={manipularSalvar}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!salvando ? "bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-95 hover:shadow-xl shadow-lg shadow-blue-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {salvando ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {salvando ? "Salvando..." : dadosIniciais?.id ? "Salvar Alterações" : (formulario.tipo === 'SLA' ? "Cadastrar Resina" : "Cadastrar Filamento")}
                </button>
            </div>
        </div>
    );

    const termo = formulario.tipo === 'SLA' ? 'Resina' : 'Filamento';

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={handleFechar}
            sidebar={conteudoLateral}
            header={{
                title: dadosIniciais?.id ? `Editar ${termo}` : `Nova ${termo}`,
                subtitle: dadosIniciais?.id ? "Atualize os dados do seu material." : "Adicione um novo item ao seu estoque."
            }}
            footer={footerContent}
            salvando={salvando}
            isDirty={modificado}
        >
            <div className="space-y-8 relative">

                <FormularioIdentificacaoMaterial
                    formulario={formulario}
                    atualizarFormulario={actualizarFormulario}
                    mostrarErros={mostrarErros}
                    isEditing={!!dadosIniciais?.id || !!dadosIniciais?.lockedType}
                />

                <FormularioEstoqueMaterial
                    formulario={formulario}
                    atualizarFormulario={actualizarFormulario}
                    setFormulario={setFormulario}
                    mostrarErros={mostrarErros}
                    dadosIniciais={dadosIniciais}
                />
            </div>
        </SideBySideModal>
    );
}
