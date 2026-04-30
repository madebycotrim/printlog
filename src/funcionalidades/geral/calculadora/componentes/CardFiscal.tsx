import { memo } from "react";
import { TrendingUp, Settings } from "lucide-react";
import { PerfilFiscal } from "../tipos";

interface CardFiscalProps {
  perfisFiscais?: PerfilFiscal[];
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
  abrirConfigFiscal?: () => void;
}

export const CardFiscal = memo(function CardFiscal({
  perfisFiscais = [], tipoOperacao, setTipoOperacao, impostos, setImpostos, icms, setIcms, iss, setIss, cobrarImpostos, setCobrarImpostos, abrirConfigFiscal
}: CardFiscalProps) {

  const obterDicaFiscal = (id: string) => {
    switch (id) {
      case 'mei':
        return "O MEI paga um valor fixo (DAS). Recomendado usar CNAE 2229-3/99 (Fabricação) ou 1813-0/99 (Impressão).";
      case 'cpf':
        return "Reserva de 10-20% recomendada para IRPF (Carnê-Leão). Grandes plataformas exigem nota fiscal.";
      case 'produto':
        return "CNAE 4789-0/99. Incide ICMS/IPI. Use para itens de pronta entrega ou fabricação em série.";
      case 'servico':
        return "CNAE 1813-0/99. Incide ISS. Use para encomendas específicas onde o cliente fornece o arquivo digital.";
      default:
        return "Configuração personalizada de regime fiscal.";
    }
  };

  return (
    <div className={`p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 ${!cobrarImpostos ? "opacity-40 grayscale" : ""}`}>
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-violet-400 border border-violet-500/30">
            <TrendingUp size={18} />
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
            cobrarImpostos ? 'bg-violet-500' : 'bg-gray-200 dark:bg-zinc-700'
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
            { nome: "Produto", label: "Venda (ICMS)", base: 0, icms: 4, iss: 0 },
            { nome: "Servico", label: "Serviço (ISS)", base: 0, icms: 0, iss: 5 },
          ]).map((p: any) => {
            const id = p.nome.toLowerCase();
            const label = p.label || p.nome;
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
                    setIss(p.iss ?? 0);
                  }
                }}
                className={`px-4 h-11 flex flex-col items-center justify-center text-center rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider shrink-0 leading-tight
                  ${tipoOperacao === id 
                    ? "bg-violet-500/10 border-violet-500 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                    : "bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-violet-500/30 text-zinc-400"}
                `}
              >
                <span>{label.toUpperCase()}</span>
                <span className={`text-[8px] font-bold opacity-80 ${tipoOperacao === id ? "text-violet-400/80" : "text-gray-400"} ${!cobrarImpostos ? "line-through text-zinc-500" : ""}`}>
                  {id === 'mei' ? "" : id === 'servico' ? `(${p.base}% + ${p.iss}%)` : `(${p.base}% + ${p.icms}%)`}
                </span>
              </button>
            );
          })}
          {abrirConfigFiscal && (
            <button 
              onClick={abrirConfigFiscal} 
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 transition-all shrink-0"
            >
              <Settings size={16} />
            </button>
          )}
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wide mt-2 ml-1">
           {obterDicaFiscal(tipoOperacao)}
        </p>

        {tipoOperacao !== 'mei' && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Base (%)</label>
              <input 
                type="number" 
                placeholder="0" 
                disabled={!cobrarImpostos} 
                value={!cobrarImpostos ? "" : (impostos === 0 ? "" : impostos)} 
                onChange={(e) => setImpostos(Number(e.target.value))} 
                className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-violet-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} 
              />
            </div>
            {tipoOperacao !== 'servico' && (
              <div>
                <label className="block text-xs font-black uppercase text-zinc-400 mb-2">ICMS (%)</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  disabled={!cobrarImpostos} 
                  value={!cobrarImpostos ? "" : (icms === 0 ? "" : icms)} 
                  onChange={(e) => setIcms(Number(e.target.value))} 
                  className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-violet-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} 
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
                  value={!cobrarImpostos ? "" : (iss === 0 ? "" : iss)} 
                  onChange={(e) => setIss(Number(e.target.value))} 
                  className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-violet-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
