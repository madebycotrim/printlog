import React, { useState, useMemo, useEffect } from "react";
import {
    Package, Zap, Clock, DollarSign,
    TrendingUp, Printer, ChevronLeft, Info,
    HardHat, FileEdit, Save, History, Crown, Activity,
    ClipboardCheck, Boxes, Cpu
} from "lucide-react";
import { Link } from "wouter";

/* =============================
   COMPONENTE DE ANÚNCIO LATERAL (SIDEBAR)
   Configurado para as extremidades da tela (Opção Afastada)
============================== */
const AdSidebar = ({ slot }) => {
    useEffect(() => {
        try {
            // Inicializa o bloco de anúncio quando o componente é montado
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("Erro AdSense Sidebar:", e);
        }
    }, []);

    return (
        // Visível apenas em telas bem largas (2xl - acima de 1536px) para não apertar o layout
        <div className="hidden 2xl:flex flex-col items-center sticky top-12 h-fit min-w-[160px] py-4 z-0">
            <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.2em] mb-4 italic">Publicidade</span>
            <div className="bg-[#0e0e11]/20 border border-white/5 rounded-2xl p-1 overflow-hidden shadow-2xl backdrop-blur-sm">
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '160px', height: '600px' }}
                    data-ad-client="ca-pub-8379070221932445"
                    data-ad-slot={slot}
                    data-ad-format="vertical"
                    data-full-width-responsive="false"></ins>
            </div>
        </div>
    );
};

/* =============================
   LAYOUT PDF: MEMORIAL DE MANUFATURA MAKER
============================== */
const PrintLayout = ({ dados, inputs, nomeProjeto }) => {
    const date = new Date().toLocaleDateString('pt-BR');
    const validade = new Date();
    validade.setDate(validade.getDate() + 7);

    return (
        <div id="print-area" className="hidden print:block bg-white text-black font-mono text-[11px] p-10 w-[210mm] mx-auto min-h-screen">
            <div className="border-[3px] border-black p-1">
                <div className="border border-black p-8 relative min-h-[260mm] flex flex-col">

                    {/* Selo de Autenticidade */}
                    <div className="absolute top-12 right-10 border-2 border-black px-4 py-1 rotate-12 font-black uppercase text-xl opacity-10">
                        DOCUMENTO ORIGINAL
                    </div>

                    {/* Cabeçalho Industrial */}
                    <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-[1000] uppercase tracking-tighter italic leading-none mb-2">
                                ORÇAMENTO <span className="text-zinc-400">TÉCNICO</span>
                            </h1>
                            <p className="text-[10px] font-bold bg-black text-white px-2 py-0.5 inline-block">
                                REGISTRO-MAKER: #{Math.floor(Math.random() * 90000 + 10000)}
                            </p>
                        </div>
                        <div className="text-right uppercase">
                            <p className="font-black text-lg leading-none">PrintLog</p>
                            <p className="text-[9px] font-bold text-zinc-500 italic">Calculadora Maker</p>
                        </div>
                    </div>

                    {/* Detalhes do Projeto */}
                    <div className="mb-12">
                        <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Descrição do Projeto / Referência</p>
                        <p className="text-3xl font-[1000] uppercase border-b-2 border-black pb-2 italic leading-none">
                            {nomeProjeto || "PROJETO_NAO_IDENTIFICADO"}
                        </p>
                        <div className="flex gap-8 mt-4 text-[9px] font-bold uppercase text-zinc-600">
                            <span>Data de Emissão: {date}</span>
                            <span>Orçamento Válido até: {validade.toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>

                    {/* Parâmetros Técnicos (Grid Retocado) */}
                    <div className="mb-12">
                        <h3 className="bg-black text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest mb-4 italic inline-block">
                            01. Especificações de Operação
                        </h3>
                        <div className="grid grid-cols-3 gap-0 border-2 border-black divide-x-2 divide-black">
                            <div className="p-6 text-center">
                                <p className="text-[8px] font-black uppercase text-zinc-400 mb-2">Massa Estimada</p>
                                <p className="text-3xl font-black">{inputs.peso}<span className="text-sm ml-1">g</span></p>
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-[8px] font-black uppercase text-zinc-400 mb-2">Tempo de Impressão</p>
                                <p className="text-3xl font-black">{inputs.horas}h {inputs.minutos}m</p>
                            </div>
                            <div className="p-6 text-center bg-zinc-50">
                                <p className="text-[8px] font-black uppercase text-zinc-400 mb-2">Consumo Nominal</p>
                                <p className="text-3xl font-black">{inputs.consumo}<span className="text-sm ml-1">W</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Detalhamento de Custos */}
                    <div className="flex-1">
                        <h3 className="bg-black text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest mb-4 italic inline-block">
                            02. Composição de Valores
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-black rotate-45" />
                                    <span className="font-bold uppercase italic">Logística de Insumos e Polímeros</span>
                                </div>
                                <span className="font-black text-sm">{formatBRL(dados.custoMaterial + dados.custoEnergia)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-black rotate-45" />
                                    <span className="font-bold uppercase italic">Preparação e Hora Técnica (MDO)</span>
                                </div>
                                <span className="font-black text-sm">{formatBRL(dados.custoMaoDeObra)}</span>
                            </div>

                            {/* VALOR FINAL PREMIUM */}
                            <div className="mt-12 bg-zinc-900 text-white p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-16 -translate-y-16" />
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#10b981]">Investimento Total</p>
                                        <p className="text-[8px] font-bold uppercase italic opacity-60">Condições válidas por 7 dias corridos</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-start justify-end gap-2">
                                            <span className="text-2xl font-black mt-2">R$</span>
                                            <span className="text-7xl font-[1000] italic tracking-tighter leading-none">
                                                {formatBRL(dados.precoVenda).replace("R$", "").trim()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Termos e Rodapé */}
                    <div className="mt-auto pt-8 border-t-2 border-black">
                        <div className="grid grid-cols-[1fr_220px] gap-10 items-end">
                            <div>
                                <p className="text-[9px] font-black uppercase mb-3 underline decoration-2">Termos e Notas Técnicas:</p>
                                <p className="text-[8px] leading-relaxed text-zinc-600 uppercase font-bold italic text-justify">
                                    * Peças produzidas via manufatura aditiva apresentam linhas de camada inerentes ao processo de deposição (FDM).
                                    * A resistência mecânica e térmica varia conforme a natureza técnica do insumo. Evite exposição direta a fontes de calor intenso ou luz solar prolongada para prevenir deformações.
                                    * Variações de tonalidade e textura superficial podem ocorrer entre diferentes lotes de matéria-prima.
                                    * Este orçamento contempla a depreciação de bicos e partes móveis do hardware utilizado.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-full border-b-2 border-black mb-3"></div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Assinatura Maker</p>
                                <p className="text-[7px] text-zinc-400 mt-1 uppercase font-bold">Responsável Técnico // PrintLog</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* =============================
   COMPONENTES UI DASHBOARD
============================== */
const ProButton = ({ icon: Icon, label }) => (
    <button className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-zinc-500 hover:text-[#10b981] transition-all hover:bg-zinc-900 group">
        <Icon size={14} className="opacity-50 group-hover:opacity-100" />
        <span className="text-[9px] font-black uppercase tracking-[0.12em]">{label}</span>
        <Crown size={10} className="text-orange-500" />
    </button>
);

const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 flex flex-col gap-5 hover:border-white/10 transition-all shadow-xl h-fit">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900/50 flex items-center justify-center text-[#10b981] border border-white/5 shadow-inner"><Icon size={18} /></div>
            <h3 className="text-[10px] font-[1000] text-zinc-500 uppercase tracking-[0.15em] italic">{title}</h3>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
    </div>
);

const InputGroup = ({ label, suffix, value, onChange, placeholder }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <input type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black border border-white/5 rounded-xl py-3.5 px-5 text-sm font-mono text-zinc-100 outline-none transition-all focus:border-[#10b981]/40 focus:ring-4 focus:ring-[#10b981]/5 placeholder:text-zinc-900" />
            {suffix && <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-700 uppercase italic pointer-events-none group-focus-within:text-[#10b981] transition-colors">{suffix}</div>}
        </div>
    </div>
);

const formatBRL = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const parseNumber = (value) => (!value ? 0 : Number(value.toString().replace(",", ".")) || 0);

/* =============================
   PÁGINA DA CALCULADORA
============================== */
export default function CalculadoraPreview() {
    const [nomeProjeto, setNomeProjeto] = useState("");
    const [precoFilamento, setPrecoFilamento] = useState("");
    const [pesoPeca, setPesoPeca] = useState("");
    const [tempoHoras, setTempoHoras] = useState("");
    const [tempoMinutos, setTempoMinutos] = useState("");
    const [consumoWatts, setConsumoWatts] = useState("300");
    const [valorKwh, setValorKwh] = useState("0.95");
    const [maoDeObraHora, setMaoDeObraHora] = useState("");
    const [horasTrabalhadas, setHorasTrabalhadas] = useState("");
    const [margemLucro, setMargemLucro] = useState("100");

    const res = useMemo(() => {
        const pKg = parseNumber(precoFilamento);
        const peso = parseNumber(pesoPeca);
        const tHoras = parseNumber(tempoHoras);
        const tMin = parseNumber(tempoMinutos);
        const watts = parseNumber(consumoWatts);
        const kwhPrice = parseNumber(valorKwh);
        const moHora = parseNumber(maoDeObraHora);
        const moTempo = parseNumber(horasTrabalhadas);
        const margem = parseNumber(margemLucro);

        const tempoTotalHoras = tHoras + (tMin / 60);
        const custoMaterial = (peso / 1000) * pKg;
        const consumoKwhTotal = ((watts * 0.7) / 1000) * tempoTotalHoras;
        const custoEnergia = (consumoKwhTotal * kwhPrice) + (tempoTotalHoras > 0 ? tempoTotalHoras * 0.15 : 0);
        const custoMaoDeObra = moTempo * moHora;
        const custoTotal = custoMaterial + custoEnergia + custoMaoDeObra;
        const precoVenda = custoTotal + (custoTotal * (margem / 100));

        return { custoMaterial, custoEnergia, custoMaoDeObra, custoTotal, precoVenda, lucroReal: precoVenda - custoTotal };
    }, [precoFilamento, pesoPeca, tempoHoras, tempoMinutos, consumoWatts, valorKwh, maoDeObraHora, horasTrabalhadas, margemLucro]);

    const hasValue = res.custoTotal > 0.1;

    return (
        // LAYOUT PRINCIPAL: justify-between e px extras para afastar os anúncios do centro
        <div className="min-h-screen w-full bg-[#050505] text-zinc-100 font-sans flex justify-between items-start relative overflow-x-hidden overflow-y-auto px-6 2xl:px-16">

            {/* ANÚNCIO LATERAL ESQUERDO */}
            <AdSidebar slot="5663131381" />

            {/* CONTEÚDO CENTRAL DA CALCULADORA */}
            <div className="flex-1 flex flex-col max-w-6xl w-full px-4 py-8 relative z-10 mx-auto">
                
                {/* GRID DE FUNDO */}
                <div className="fixed inset-x-0 top-0 h-[600px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #print-area, #print-area * { visibility: visible; }
                        #print-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; background: white !important; }
                        @page { margin: 0; }
                        .adsbygoogle { display: none !important; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
                `}</style>

                <PrintLayout dados={res} inputs={{ peso: pesoPeca, horas: tempoHoras, minutos: tempoMinutos, consumo: consumoWatts }} nomeProjeto={nomeProjeto} />

                {/* HEADER */}
                <header className="flex items-center justify-between mb-10 shrink-0 relative z-20">
                    <div className="flex items-center gap-5">
                        <Link href="/">
                            <button className="p-3.5 bg-[#0e0e11] border border-white/5 rounded-xl hover:bg-zinc-900 text-zinc-500 hover:text-[#10b981] transition-all shadow-xl">
                                <ChevronLeft size={20} />
                            </button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Modo de Visualização</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-[1000] tracking-tighter italic uppercase leading-none">
                                CALCULADORA <span className="text-[#10b981]">MAKER</span>
                            </h1>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-1 max-w-sm ml-10 relative group">
                        <FileEdit size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[#10b981] transition-colors" />
                        <input type="text" placeholder="NOME DO PROJETO" value={nomeProjeto} onChange={(e) => setNomeProjeto(e.target.value.toUpperCase())}
                            className="w-full bg-[#0e0e11] border border-white/5 rounded-xl py-3.5 pl-14 pr-5 text-[9px] font-[1000] tracking-widest uppercase outline-none focus:border-[#10b981]/30 transition-all placeholder:text-zinc-900 shadow-xl" />
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 relative z-20">
                    {/* ENTRADAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min overflow-y-auto pr-3 custom-scrollbar items-start pb-8">
                        <Card title="Materiais e Insumos" icon={Package}>
                            <InputGroup label="Preço do Rolo (KG)" suffix="R$" placeholder="120.00" value={precoFilamento} onChange={setPrecoFilamento} />
                            <InputGroup label="Peso Final da Peça" suffix="GRAMAS" placeholder="450" value={pesoPeca} onChange={setPesoPeca} />
                        </Card>
                        <Card title="Tempo de Impressão" icon={Zap}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputGroup label="Horas" suffix="H" value={tempoHoras} onChange={setTempoHoras} />
                                <InputGroup label="Minutos" suffix="M" value={tempoMinutos} onChange={setTempoMinutos} />
                            </div>
                            <InputGroup label="Energia (KWh)" suffix="R$" value={valorKwh} onChange={setValorKwh} />
                        </Card>
                        <Card title="Mão de Obra" icon={HardHat}>
                            <InputGroup label="Sua Hora Técnica" suffix="R$/H" value={maoDeObraHora} onChange={setMaoDeObraHora} />
                            <InputGroup label="Tempo de Preparação" suffix="H" value={horasTrabalhadas} onChange={setHorasTrabalhadas} />
                        </Card>
                        <Card title="Margem" icon={TrendingUp}>
                            <InputGroup label="Margem de Lucro" suffix="%" value={margemLucro} onChange={setMargemLucro} />
                        </Card>
                    </div>

                    {/* RESULTADOS */}
                    <aside className="flex flex-col gap-6">
                        <div className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden shrink-0">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-[1000] uppercase tracking-[0.3em] text-zinc-600 italic">Sugestão de Venda</span>
                                <Activity size={18} className="text-zinc-800" />
                            </div>
                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-2xl font-black italic text-[#10b981] mb-1.5 leading-none">R$</span>
                                <span className="text-5xl md:text-7xl font-[1000] tracking-tighter font-mono italic text-white leading-none">
                                    {res.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            {hasValue && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                    <span className="text-[10px] font-[1000] uppercase tracking-widest italic leading-none">Lucro Real: {formatBRL(res.lucroReal)}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] p-7 flex flex-col gap-6 shadow-xl">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-zinc-500 uppercase font-black text-[10px] tracking-widest italic leading-none">
                                    <span>Custo de Produção:</span>
                                    <span className="text-zinc-200 text-xl font-mono">{formatBRL(res.custoTotal)}</span>
                                </div>
                                <div className="space-y-3 border-t border-white/5 pt-5">
                                    {res.custoMaterial > 0 && <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase italic tracking-[0.1em]"><span>Materiais</span><span>{formatBRL(res.custoMaterial)}</span></div>}
                                    {res.custoEnergia > 0.05 && <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase italic tracking-[0.1em]"><span>Energia</span><span>{formatBRL(res.custoEnergia)}</span></div>}
                                    {res.custoMaoDeObra > 0 && <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase italic tracking-[0.1em]"><span>MDO</span><span>{formatBRL(res.custoMaoDeObra)}</span></div>}
                                </div>
                            </div>
                            <button onClick={() => window.print()} disabled={!hasValue} className={`w-full h-16 rounded-2xl font-[1000] text-base uppercase tracking-[0.12em] italic transition-all flex items-center justify-center gap-3 ${hasValue ? 'bg-[#10b981] text-black shadow-lg hover:brightness-110 active:scale-95' : 'bg-zinc-900 text-zinc-800 cursor-not-allowed border border-white/5 opacity-50'}`}><Printer size={20} /> GERAR ORÇAMENTO</button>
                            <div className="flex gap-3"><ProButton icon={Save} label="Salvar" /><ProButton icon={History} label="Histórico" /></div>
                        </div>

                        <div className="p-6 rounded-2xl border border-dashed border-zinc-800 flex gap-3 items-start bg-zinc-900/5 h-fit mb-10">
                            <Info size={18} className="text-[#10b981] shrink-0 mt-0.5" />
                            <p className="text-[10px] text-zinc-600 leading-relaxed italic font-[1000] uppercase tracking-tight">* Inclui taxa de depreciação de hardware para manutenção preventiva.</p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ANÚNCIO LATERAL DIREITO */}
            <AdSidebar slot="5663131381" />

        </div>
    );
}