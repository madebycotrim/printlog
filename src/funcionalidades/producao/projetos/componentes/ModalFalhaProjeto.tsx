import { Dialogo } from "@/compartilhado/componentes";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Pedido } from "../tipos";

interface PropriedadesModalFalha {
  aberto: boolean;
  aoFechar: () => void;
  pedido: Pedido | null;
  aoConfirmar: (id: string, gramasPerdidas: number) => void;
}

/**
 * Modal de Confirmação de Falha - Design Premium
 * Solicita a quantidade exata de material perdido na falha.
 */
export function ModalFalhaProjeto({ aberto, aoFechar, pedido, aoConfirmar }: PropriedadesModalFalha) {
  const [houveDesperdicio, setHouveDesperdicio] = useState<boolean>(true);
  const [gramasPerdidas, setGramasPerdidas] = useState<string>(pedido?.pesoGramas?.toString() || "0");

  if (!pedido) return null;

  const handleConfirmar = () => {
    const qtd = houveDesperdicio ? (Number(gramasPerdidas) || 0) : 0;
    aoConfirmar(pedido.id, qtd);
    aoFechar();
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Registrar Falha de Produção"
      larguraMax="max-w-md"
    >
      <div className="p-8 flex flex-col items-center text-center">
        {/* Ícone de Alerta Animado */}
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <AlertTriangle size={40} strokeWidth={1.5} className="animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
          Registrar Falha?
        </h2>
        
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-6 w-full text-left">
          <p className="text-zinc-400 text-[11px] leading-relaxed uppercase tracking-wider font-bold">
            Projeto afetado:
          </p>
          <div className="mt-2 py-2 border-y border-white/5">
            <span className="text-white font-black text-sm uppercase block truncate">
              {pedido.descricao}
            </span>
          </div>
          
          <div className="mt-6 flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={houveDesperdicio}
                onChange={(e) => setHouveDesperdicio(e.target.checked)}
                className="w-5 h-5 rounded bg-zinc-900 border-white/10 text-rose-500 focus:ring-rose-500 focus:ring-offset-zinc-900"
              />
              <span className="text-zinc-300 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                Houve desperdício de material?
              </span>
            </label>

            {houveDesperdicio && (
              <div className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl p-3">
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  Material Perdido (g):
                </span>
                <input
                  type="number"
                  min="0"
                  value={gramasPerdidas}
                  onChange={(e) => setGramasPerdidas(e.target.value)}
                  className="w-24 bg-zinc-800 border border-white/10 rounded-lg px-3 py-1.5 text-right text-sm font-black text-rose-400 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={aoFechar}
            className="px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirmar}
            className="px-6 py-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-500/10 active:scale-95 flex items-center justify-center gap-2"
          >
            Registrar Falha
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
