import React, { useState, useMemo } from "react";
import {
    ArrowLeft, Package, Zap, Clock, DollarSign,
    TrendingUp, Info, Printer, Save, History, Crown
} from "lucide-react";
import { Link } from "wouter";
import logo from '../assets/logo.png';

/* =============================
   LAYOUT DE IMPRESSÃO (PROFISSIONAL)
   Otimizado para gerar PDF para o Cliente
============================== */
const PrintLayout = ({ dados, inputs }) => {
    const date = new Date().toLocaleDateString('pt-BR');

    return (
        <div id="print-area" className="hidden print:flex flex-col p-12 bg-white text-black h-screen w-full fixed top-0 left-0 z-[9999]">
            {/* Cabeçalho do Relatório */}
            <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-8 mb-8">
                <div className="flex items-center gap-5">
                    <img src={logo} alt="LayerForge" className="w-14 h-14 object-contain grayscale" />
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">Orçamento de Impressão 3D</h1>
                        <p className="text-sm text-zinc-500 font-medium">Emitido em {date}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">ID do Documento</h2>
                    <p className="text-lg font-mono font-bold text-zinc-900">#{Math.floor(Math.random() * 90000) + 10000}</p>
                </div>
            </div>

            {/* Especificações Técnicas */}
            <div className="mb-10 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 grid grid-cols-3 gap-8">
                <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Material Estimado</span>
                    <span className="block text-lg font-bold text-zinc-800">{inputs.peso}g <span className="text-sm font-normal text-zinc-500">(Incluso suportes)</span></span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tempo de Máquina</span>
                    <span className="block text-lg font-bold text-zinc-800">
                        {inputs.horas}h {inputs.minutos}m
                    </span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Processo</span>
                    <span className="block text-lg font-bold text-zinc-800">FDM / Resina</span>
                </div>
            </div>

            {/* Tabela de Composição de Preço */}
            <div className="flex-1">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-1">Discriminação do Serviço</h3>
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-900 text-white">
                            <th className="py-4 px-6 rounded-l-xl font-bold">Item / Descrição do Serviço</th>
                            <th className="py-4 px-6 rounded-r-xl text-right font-bold">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="text-zinc-700">
                        <tr className="border-b border-zinc-100">
                            <td className="py-6 px-6">
                                <span className="font-bold block">Insumos e Matéria-prima</span>
                                <span className="text-xs text-zinc-500">Filamento de engenharia e materiais de consumo.</span>
                            </td>
                            <td className="py-6 px-6 text-right font-mono text-base">{formatBRL(dados.custoMaterial)}</td>
                        </tr>
                        <tr className="border-b border-zinc-100">
                            <td className="py-6 px-6">
                                <span className="font-bold block">Custos Operacionais</span>
                                <span className="text-xs text-zinc-500">Depreciação de hardware, energia elétrica e manutenção técnica.</span>
                            </td>
                            <td className="py-6 px-6 text-right font-mono text-base">{formatBRL(dados.custoEnergia)}</td>
                        </tr>
                        <tr className="border-b border-zinc-100">
                            <td className="py-6 px-6">
                                <span className="font-bold block">Mão de Obra e Setup</span>
                                <span className="text-xs text-zinc-500">Fatiamento, preparação de mesa e pós-processamento manual.</span>
                            </td>
                            <td className="py-6 px-6 text-right font-mono text-base">{formatBRL(dados.custoMaoDeObra + dados.lucroLiquido)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Totalizador Principal */}
            <div className="mt-10 flex justify-end">
                <div className="w-80 bg-zinc-900 text-white p-8 rounded-3xl shadow-xl flex flex-col items-end">
                    <span className="text-xs text-zinc-400 uppercase font-bold tracking-widest mb-1">Investimento Total</span>
                    <span className="text-4xl font-black font-mono">{formatBRL(dados.precoVenda)}</span>
                    <div className="mt-4 pt-4 border-t border-white/10 w-full text-right">
                        <span className="text-[10px] text-zinc-500">Pagamento conforme condições acordadas.</span>
                    </div>
                </div>
            </div>

            {/* Rodapé Legal */}
            <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-end">
                <div className="max-w-md">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Observações Importantes</p>
                    <ul className="text-[9px] text-zinc-500 space-y-1 leading-tight">
                        <li>• Este orçamento possui validade de 5 dias corridos.</li>
                        <li>• O prazo de entrega inicia-se após a aprovação do modelo e pagamento.</li>
                        <li>• Pequenas variações de textura são inerentes ao processo de impressão 3D.</li>
                    </ul>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">Documento Gerado via LayerForge</p>
                    <p className="text-[9px] text-zinc-400">Plataforma de Gestão para Makers 3D</p>
                </div>
            </div>
        </div>
    );
};

/* =============================
   COMPONENTES UI AUXILIARES
============================== */
const AdPlaceholder = ({ label = "Publicidade", className = "", width = "w-[160px]", height = "h-[600px]" }) => (
    <div className={`${width} ${height} flex flex-col items-center justify-center bg-[#09090b] border border-zinc-800 rounded-lg relative overflow-hidden shrink-0 ${className}`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
        <div className="z-10 flex flex-col items-center gap-2 opacity-50">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-700 px-2 py-0.5 rounded">{label}</div>
            <span className="text-[9px] text-zinc-600">Espaço Reservado</span>
        </div>
    </div>
);

const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-all duration-300 shadow-sm group">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-sky-500 transition-colors">
                <Icon size={16} />
            </div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="grid gap-4">{children}</div>
    </div>
);

const InputGroup = ({ label, suffix, value, onChange, placeholder, icon: Icon }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide ml-1">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors">
                    <Icon size={14} />
                </div>
            )}
            <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-800 outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500/10 hover:border-zinc-700 ${Icon ? "pl-9" : "pl-3"} ${suffix ? "pr-10" : "pr-3"}`}
            />
            {suffix && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 pointer-events-none">{suffix}</div>
            )}
        </div>
    </div>
);

const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
        <span className="text-zinc-500 text-xs font-medium">{label}</span>
        <span className="font-mono font-bold text-zinc-200">{formatBRL(value)}</span>
    </div>
);

const parseNumber = (value) => (!value ? 0 : Number(value.toString().replace(",", ".")) || 0);
const formatBRL = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/* =============================
   PÁGINA PRINCIPAL
============================== */
export default function CalculadoraFree() {
    // Estados dos Inputs
    const [precoFilamento, setPrecoFilamento] = useState("");
    const [pesoPeca, setPesoPeca] = useState("");
    const [tempoHoras, setTempoHoras] = useState("");
    const [tempoMinutos, setTempoMinutos] = useState("");
    const [consumoWatts, setConsumoWatts] = useState("300");
    const [valorKwh, setValorKwh] = useState("0.95");
    const [maoDeObraHora, setMaoDeObraHora] = useState("");
    const [horasTrabalhadas, setHorasTrabalhadas] = useState("");
    const [margemLucro, setMargemLucro] = useState("100");

    // Lógica de Cálculo
    const resultado = useMemo(() => {
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

        // Fator de carga média da impressora (70% do pico)
        const consumoKwhTotal = ((watts * 0.7) / 1000) * tempoTotalHoras;
        const custoEnergia = consumoKwhTotal * kwhPrice;

        const custoMaoDeObra = moTempo * moHora;
        const custoTotal = custoMaterial + custoEnergia + custoMaoDeObra;
        const lucroDesejado = custoTotal * (margem / 100);
        const precoVenda = custoTotal + lucroDesejado;

        return { custoMaterial, custoEnergia, custoMaoDeObra, custoTotal, precoVenda, lucroLiquido: lucroDesejado };
    }, [precoFilamento, pesoPeca, tempoHoras, tempoMinutos, consumoWatts, valorKwh, maoDeObraHora, horasTrabalhadas, margemLucro]);

    const isEmpty = resultado.custoTotal <= 0.01;

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-sky-500/30 overflow-x-hidden flex flex-col">

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; background: white; }
                    @page { margin: 0; size: auto; }
                }
            `}</style>

            <PrintLayout
                dados={resultado}
                inputs={{ peso: pesoPeca || '0', horas: tempoHoras || '0', minutos: tempoMinutos || '0' }}
            />

            {/* Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 print:hidden">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <button className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer">
                                <ArrowLeft size={16} />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                Orçamento Rápido<span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/10 text-sky-500 border border-sky-500/20 uppercase font-bold">Free</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex justify-center py-10 px-4 gap-8 relative z-10 print:hidden">
                {/* Banner Lateral Esquerdo (Publicidade) */}
                <aside className="hidden 2xl:flex flex-col gap-4 sticky top-24 h-fit">
                    <AdPlaceholder width="w-[160px]" height="h-[600px]" />
                </aside>

                <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 h-fit">
                    <div className="space-y-6">
                        <Card title="Material & Insumos" icon={Package}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Preço do Rolo" suffix="R$/kg" placeholder="120,00" value={precoFilamento} onChange={setPrecoFilamento} />
                                <InputGroup label="Peso da Peça" suffix="g" placeholder="Ex: 45" value={pesoPeca} onChange={setPesoPeca} />
                            </div>
                        </Card>

                        <Card title="Tempo & Consumo Elétrico" icon={Clock}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Duração Estimada" suffix="h" placeholder="0" value={tempoHoras} onChange={setTempoHoras} />
                                <InputGroup label="Minutos Adicionais" suffix="min" placeholder="0" value={tempoMinutos} onChange={setTempoMinutos} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <InputGroup label="Potência da Impressora" suffix="W" placeholder="300" value={consumoWatts} onChange={setConsumoWatts} icon={Zap} />
                                <InputGroup label="Custo do KWh" suffix="R$/kWh" placeholder="0.95" value={valorKwh} onChange={setValorKwh} />
                            </div>
                        </Card>

                        <Card title="Hora Técnica & Margem" icon={DollarSign}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Valor da sua Hora" suffix="R$/h" placeholder="20,00" value={maoDeObraHora} onChange={setMaoDeObraHora} />
                                <InputGroup label="Tempo de Trabalho" suffix="h" placeholder="Ex: 0.5" value={horasTrabalhadas} onChange={setHorasTrabalhadas} />
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <InputGroup label="Margem de Lucro" suffix="%" placeholder="100" value={margemLucro} onChange={setMargemLucro} icon={TrendingUp} />
                            </div>
                        </Card>
                    </div>

                    <aside className="lg:sticky lg:top-24 h-fit space-y-6">
                        {/* Widget de Preço Sugerido */}
                        <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
                            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full transition-all duration-1000 ${isEmpty ? 'bg-zinc-800/20' : 'bg-sky-500/20 group-hover:bg-sky-500/30'}`}></div>
                            <div className="relative z-10 text-center">
                                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Sugerido para Venda</h2>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-xl text-zinc-600 font-light mt-2">R$</span>
                                    <span className={`text-5xl font-bold tracking-tighter font-mono ${isEmpty ? 'text-zinc-700' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]'}`}>
                                        {isEmpty ? "0,00" : formatBRL(resultado.precoVenda).replace("R$", "").trim()}
                                    </span>
                                </div>
                                {!isEmpty && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mt-2">
                                        <TrendingUp size={12} />
                                        Lucro: {formatBRL(resultado.lucroLiquido)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detalhamento de Custos */}
                        <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 shadow-lg">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} className="text-sky-500" /> Detalhes do Custo
                            </h3>
                            <div className="space-y-2">
                                <SummaryRow label="Material" value={resultado.custoMaterial} />
                                <SummaryRow label="Energia" value={resultado.custoEnergia} />
                                <SummaryRow label="Hora Técnica" value={resultado.custoMaoDeObra} />
                                <div className="h-px bg-zinc-800 my-2"></div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-xs font-bold text-zinc-400 uppercase">Total de Custo</span>
                                    <span className="font-mono font-bold text-zinc-200">{formatBRL(resultado.custoTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Ação de Impressão */}
                        <button
                            onClick={() => window.print()}
                            disabled={isEmpty}
                            className="w-full h-12 bg-zinc-100 hover:bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Printer size={16} /> Gerar PDF Profissional
                        </button>

                        {/* Upsell / Pro Features */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/register" className="w-full group">
                                <button className="w-full h-11 bg-[#09090b] border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-300 transition-all shadow-sm">
                                    <Save size={14} /> Salvar <Crown size={12} className="text-amber-600/80 group-hover:text-amber-500 transition-colors" />
                                </button>
                            </Link>
                            <Link href="/register" className="w-full group">
                                <button className="w-full h-11 bg-[#09090b] border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-300 transition-all shadow-sm">
                                    <History size={14} /> Histórico <Crown size={12} className="text-amber-600/80 group-hover:text-amber-500 transition-colors" />
                                </button>
                            </Link>
                        </div>
                    </aside>
                </main>

                {/* Banner Lateral Direito (Publicidade) */}
                <aside className="hidden xl:flex flex-col gap-4 sticky top-24 h-fit">
                    <AdPlaceholder width="w-[160px]" height="h-[600px]" label="Patrocinado" />
                </aside>
            </div>

            <footer className="py-8 text-center border-t border-white/5 bg-[#050505] print:hidden">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">LayerForge &copy; 2025 - Ferramentas para Impressão 3D</p>
            </footer>
        </div>
    );
}