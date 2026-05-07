import { Calculator, Clock, UserPlus, Package, Box, Wrench, PlusCircle } from "lucide-react";

/**
 * Interface para as propriedades do DockAcoes.
 */
interface PropriedadesDockAcoes {
  aoNavegar: (rota: string) => void;
  aoAbrirModalCliente: () => void;
  aoAbrirModalSelecaoMat: () => void;
  aoAbrirModalSelecaoIns: () => void;
  aoAbrirModalFinanceiro: () => void;
}

/**
 * Dock flutuante de ações rápidas.
 */
export function DockAcoes({
  aoNavegar,
  aoAbrirModalCliente,
  aoAbrirModalSelecaoMat,
  aoAbrirModalSelecaoIns,
  aoAbrirModalFinanceiro
}: PropriedadesDockAcoes) {
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4 group">
      <div className="flex flex-col gap-4 translate-y-10 opacity-0 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
        
        <button 
          onClick={() => aoNavegar("/calculadora")}
          className="flex items-center justify-between w-52 bg-card/80 backdrop-blur-xl border border-borda-sutil p-3.5 rounded-2xl hover:bg-amber-500/20 hover:border-amber-500/50 transition-all group/btn shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-all">Novo Orçamento</span>
          <Calculator size={20} className="text-amber-500" />
        </button>

        <button 
          onClick={() => aoNavegar("/projetos")}
          className="flex items-center justify-between w-52 bg-card/80 backdrop-blur-xl border border-borda-sutil p-3.5 rounded-2xl hover:bg-sky-500/20 hover:border-sky-500/50 transition-all group/btn shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-all">Ver Fila</span>
          <Clock size={20} className="text-sky-500" />
        </button>

        <button 
          onClick={aoAbrirModalCliente}
          className="flex items-center justify-between w-52 bg-card/80 backdrop-blur-xl border border-borda-sutil p-3.5 rounded-2xl hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all group/btn shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-all">Novo Cliente</span>
          <UserPlus size={20} className="text-indigo-500" />
        </button>

        <button 
          onClick={aoAbrirModalSelecaoMat}
          className="flex items-center justify-between w-52 bg-card/80 backdrop-blur-xl border border-borda-sutil p-3.5 rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all group/btn shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-all">Repor Material</span>
          <Package size={20} className="text-emerald-500" />
        </button>

        <button 
          onClick={aoAbrirModalSelecaoIns}
          className="flex items-center justify-between w-52 bg-card/80 backdrop-blur-xl border border-borda-sutil p-3.5 rounded-2xl hover:bg-teal-500/20 hover:border-teal-500/50 transition-all group/btn shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-all">Repor Insumo</span>
          <Box size={20} className="text-teal-500" />
        </button>

        <button 
          onClick={() => aoNavegar("/impressoras")}
          className="flex items-center justify-between w-52 bg-card/80 backdrop-blur-xl border border-borda-sutil p-3.5 rounded-2xl hover:bg-rose-500/20 hover:border-rose-500/50 transition-all group/btn shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-all">Status Máquinas</span>
          <Wrench size={20} className="text-rose-500" />
        </button>

        <button 
          onClick={aoAbrirModalFinanceiro}
          className="flex items-center justify-between w-52 bg-card/80 backdrop-blur-xl border border-borda-sutil p-3.5 rounded-2xl hover:bg-violet-500/20 hover:border-violet-500/50 transition-all group/btn shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary transition-all">Lançar Venda</span>
          <PlusCircle size={20} className="text-violet-500" />
        </button>
      </div>

      <div className="bg-card/90 backdrop-blur-2xl border border-borda-sutil p-4 rounded-3xl shadow-premium cursor-pointer group-hover:scale-110 transition-all">
        <PlusCircle size={24} className="text-amber-500" />
      </div>
    </div>
  );
}
