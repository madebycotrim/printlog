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

export function CardFiscal({
  perfisFiscais = [], tipoOperacao, setTipoOperacao, impostos, setImpostos, icms, setIcms, iss, setIss, cobrarImpostos, setCobrarImpostos, abrirConfigFiscal
}: CardFiscalProps) {

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
    <div className={`p-8 rounded-2xl border shadow-sm space-y-6 transition-all duration-300 ${cobrarImpostos ? "bg-white dark:bg-zinc-900 border-gray-100 dark:border-white/5" : "bg-gray-50/50 dark:bg-zinc-900/50 border-gray-100 dark:border-white/5 opacity-70 grayscale"}`}>
      <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-orange-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Estrutura Fiscal</h3>
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
                  ${tipoOperacao === id ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-sm" : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:border-orange-500/30"}
                `}
              >
                <span>{p.nome.toUpperCase()}</span>
                <span className={`text-[8px] font-bold opacity-80 ${tipoOperacao === id ? "text-orange-500/80" : "text-gray-400"} ${!cobrarImpostos ? "line-through text-zinc-500" : ""}`}>
                  (%)
                </span>
              </button>
            );
          })}
          {abrirConfigFiscal && (
            <button 
              onClick={abrirConfigFiscal} 
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all shrink-0"
            >
              <Settings size={16} />
            </button>
          )}
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wide mt-2 ml-1">
           {obterDicaFiscal(tipoOperacao)}
        </p>

        {tipoOperacao !== 'mei' && (
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-white/5">
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">Base (%)</label>
              <input type="number" placeholder="0" disabled={!cobrarImpostos} value={!cobrarImpostos ? 0 : (impostos || "")} onChange={(e) => setImpostos(Number(e.target.value))} className={`w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} />
            </div>
            {tipoOperacao !== 'servico' && (
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">ICMS (%)</label>
                <input type="number" placeholder="0" disabled={!cobrarImpostos} value={!cobrarImpostos ? 0 : (icms || "")} onChange={(e) => setIcms(Number(e.target.value))} className={`w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} />
              </div>
            )}
            {tipoOperacao === 'servico' && (
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">ISS (%)</label>
                <input type="number" placeholder="0" disabled={!cobrarImpostos} value={!cobrarImpostos ? 0 : (iss || "")} onChange={(e) => setIss(Number(e.target.value))} className={`w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm ${!cobrarImpostos ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
