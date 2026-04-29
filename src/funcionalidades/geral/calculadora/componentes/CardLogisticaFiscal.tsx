import { Warehouse, TrendingUp, Settings } from "lucide-react";
import { PerfilMarketplace, PerfilFiscal } from "../tipos";

interface CardLogisticaFiscalProps {
  perfis: PerfilMarketplace[];
  perfisFiscais?: PerfilFiscal[];
  perfilAtivo: string;
  setPerfilAtivo: (v: string) => void;
  taxaEcommerce: number;
  setTaxaEcommerce: (v: number) => void;
  taxaFixa: number;
  setTaxaFixa: (v: number) => void;
  frete: number;
  setFrete: (v: number) => void;
  tipoOperacao: string;
  setTipoOperacao: (v: any) => void;
  impostos: number;
  setImpostos: (v: number) => void;
  icms: number;
  setIcms: (v: number) => void;
  iss: number;
  setIss: (v: number) => void;
  cobrarImpostos: boolean;
  setCobrarImpostos: (v: boolean) => void;
  abrirPerfis: () => void;
  abrirConfigFiscal?: () => void;
}

export function CardLogisticaFiscal({
  perfis, perfisFiscais = [], perfilAtivo, setPerfilAtivo, taxaEcommerce, setTaxaEcommerce, taxaFixa, setTaxaFixa, frete, setFrete,
  tipoOperacao, setTipoOperacao, impostos, setImpostos, icms, setIcms, iss, setIss, cobrarImpostos, setCobrarImpostos, abrirPerfis, abrirConfigFiscal
}: CardLogisticaFiscalProps) {

  const obterDicaFiscal = (id: string) => {
    switch (id) {
      case 'mei':
        return "O MEI paga um valor fixo mensal (DAS), por isso não há imposto por peça vendida.";
      case 'cpf':
        return "Reserva de 10% recomendada para evitar o prejuízo de uma futura cobrança de IRPF.";
      case 'produto':
        return "Imposto unificado padrão para Venda de Produtos Prontos (Simples Nacional - Comércio).";
      case 'servico':
        return "Imposto para Serviços sob Encomenda e Peças Personalizadas (Simples Nacional).";
      default:
        return "Configuração personalizada de regime fiscal.";
    }
  };
  return (
    <div className="space-y-6">
      {/* Logística */}
      <div className="p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[inset_0px_1px_12px_rgba(99,102,241,0.2)]">
              <Warehouse size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-white">Canais de Venda e Logística</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Custos de plataforma e fretes</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {perfis.map((p) => (
            <button
              key={p.nome}
              onClick={() => {
                if (perfilAtivo === p.nome) {
                  setPerfilAtivo("");
                  setTaxaEcommerce(0);
                  setTaxaFixa(0);
                  setFrete(0);
                } else {
                  setPerfilAtivo(p.nome);
                  setTaxaEcommerce(p.taxa);
                  setTaxaFixa(p.fixa);
                  if (p.frete !== undefined) setFrete(p.frete);
                  if (p.imp !== undefined) setImpostos(p.imp);
                }
              }}
              className={`px-4 h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center text-center leading-tight shrink-0
                ${perfilAtivo === p.nome 
                  ? "bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                  : "bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-indigo-500/30 text-zinc-400"}
              `}
            >
              <span>{p.nome}</span>
              <span className={`text-[8px] font-bold opacity-80 ${perfilAtivo === p.nome ? "text-indigo-400/80" : "text-gray-400"}`}>({p.taxa}% + R$ {p.fixa} + R$ {p.frete || 0})</span>
            </button>
          ))}
          <button onClick={abrirPerfis} className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all shrink-0"><Settings size={16} /></button>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
          <div>
            <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Comissão (%)</label>
            <input 
              type="number" 
              placeholder="0" 
              value={taxaEcommerce || ""} 
              onChange={(e) => setTaxaEcommerce(Number(e.target.value))} 
              className="w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-indigo-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner" 
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Taxa Fixa (R$)</label>
            <input 
              type="number" 
              placeholder="0" 
              value={taxaFixa || ""} 
              onChange={(e) => setTaxaFixa(Number(e.target.value))} 
              className="w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-indigo-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner" 
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Frete (R$)</label>
            <input 
              type="number" 
              placeholder="0" 
              value={frete || ""} 
              onChange={(e) => setFrete(Number(e.target.value))} 
              className="w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-indigo-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner" 
            />
          </div>
        </div>
      </div>

      {/* Fiscal */}
      <div className={`p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 ${!cobrarImpostos ? "opacity-40 grayscale" : ""}`}>
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center text-orange-400 border border-orange-500/30 shadow-[inset_0px_1px_12px_rgba(249,115,22,0.2)]">
              <TrendingUp size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-white">Estrutura Fiscal</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Tributos e regimes (MEI/Simples)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCobrarImpostos(!cobrarImpostos)}
            className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
              cobrarImpostos ? 'bg-orange-500' : 'bg-gray-200 dark:bg-zinc-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              cobrarImpostos ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
        <div className={`space-y-6 transition-opacity ${!cobrarImpostos ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            {(perfisFiscais.length > 0 ? perfisFiscais : [
              { nome: "MEI", base: 0, icms: 0, iss: 0 },
              { nome: "CPF", base: 10, icms: 0, iss: 0 },
              { nome: "Produto", base: 0, icms: 4, iss: 0 },
              { nome: "Servico", base: 0, icms: 0, iss: 5 },
            ]).map((p) => {
              const id = p.nome.toLowerCase();
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (tipoOperacao === id) {
                      setTipoOperacao("");
                      setImpostos(0);
                      setIcms(0);
                      setIss(0);
                    } else {
                      setTipoOperacao(id);
                      setImpostos(p.base);
                      setIcms(p.icms);
                      setIss(p.iss);
                    }
                  }}
                  className={`px-4 h-11 flex flex-col items-center justify-center text-center rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider shrink-0 leading-tight
                    ${tipoOperacao === id 
                      ? "bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]" 
                      : "bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-orange-500/30 text-zinc-400"}
                  `}
                >
                  <span>{p.nome.toUpperCase()}</span>
                  <span className={`text-[8px] font-bold opacity-80 ${tipoOperacao === id ? "text-orange-400/80" : "text-gray-400"} ${!cobrarImpostos ? "line-through text-zinc-500" : ""}`}>
                    ({id === 'mei' || !cobrarImpostos ? 0 : id === 'servico' ? (p.base + p.iss) : (p.base + p.icms)}%)
                  </span>
                </button>
              );
            })}
            {abrirConfigFiscal && (
              <button 
                onClick={abrirConfigFiscal} 
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 transition-all shrink-0"
              >
                <Settings size={16} />
              </button>
            )}
          </div>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wide mt-2 ml-1">
             {obterDicaFiscal(tipoOperacao)}
          </p>

          {tipoOperacao !== 'mei' && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div>
                <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Base (%)</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  disabled={!cobrarImpostos} 
                  value={!cobrarImpostos ? 0 : (impostos || "")} 
                  onChange={(e) => setImpostos(Number(e.target.value))} 
                  className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-orange-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} 
                />
              </div>
              {tipoOperacao !== 'servico' && (
                <div>
                  <label className="block text-xs font-black uppercase text-zinc-400 mb-2">ICMS (%)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    disabled={!cobrarImpostos} 
                    value={!cobrarImpostos ? 0 : (icms || "")} 
                    onChange={(e) => setIcms(Number(e.target.value))} 
                    className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-orange-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} 
                  />
                </div>
              )}
              {tipoOperacao === 'servico' && (
                <div>
                  <label className="block text-xs font-black uppercase text-zinc-400 mb-2">ISS (%)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    disabled={!cobrarImpostos} 
                    value={!cobrarImpostos ? 0 : (iss || "")} 
                    onChange={(e) => setIss(Number(e.target.value))} 
                    className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-orange-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
