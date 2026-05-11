import { Dialogo } from "@/compartilhado/componentes";
import { AlertTriangle } from "lucide-react";
import { Pedido } from "../tipos";

interface PropriedadesModalFalha {
  aberto: boolean;
  aoFechar: () => void;
  pedido: Pedido | null;
  aoConfirmar: (id: string) => void;
}

/**
 * Modal de Confirmação de Falha - Design Premium
 * Substitui o confirm() nativo do navegador.
 */
export function ModalFalhaProjeto({ aberto, aoFechar, pedido, aoConfirmar }: PropriedadesModalFalha) {
  if (!pedido) return null;

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
          Registrar Perda?
        </h2>
        
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-8 w-full">
          <p className="text-zinc-400 text-[11px] leading-relaxed uppercase tracking-wider font-bold">
            Você está confirmando uma falha técnica no projeto:
          </p>
          <div className="mt-2 py-2 border-y border-white/5">
            <span className="text-white font-black text-sm uppercase block truncate">
              {pedido.descricao}
            </span>
          </div>
          <p className="mt-3 text-zinc-500 text-[10px] font-medium leading-relaxed">
            Esta ação irá descontar <span className="text-rose-500 font-black">{pedido.pesoGramas || 0}g</span> de 
            <span className="text-zinc-200 font-black"> {pedido.material || "Material"}</span> do seu estoque virtual permanentemente.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={aoFechar}
            className="px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              aoConfirmar(pedido.id);
              aoFechar();
            }}
            className="px-6 py-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-500/10 active:scale-95"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
