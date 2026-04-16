import { Package, AlertCircle, ShoppingCart, TrendingDown } from "lucide-react";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { servicoInventario } from "@/compartilhado/servicos/servicoInventario";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { useMemo, useState } from "react";
import { ModalSugestoesCompra } from "./ModalSugestoesCompra";

interface RelatorioInventarioProps {
  materiais: Material[];
  insumos: Insumo[];
}

export function RelatorioInventario({ materiais, insumos }: RelatorioInventarioProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const metricas = useMemo(() => servicoInventario.gerarRelatorioConsolidado(materiais, insumos), [materiais, insumos]);

  return (
    <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
      {/* Elementos Decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32" />
      <div className="absolute -bottom-8 -left-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
        <Package size={160} strokeWidth={1} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <ShoppingCart size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-100">Patrimônio em Insumos</h3>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-5xl font-black tracking-tighter mb-2">
            {centavosParaReais(metricas.valorTotalEstoqueCentavos)}
          </h2>
          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.3em]">
            Capital Imobilizado no Inventário
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertCircle size={14} />
              <span className="text-xl font-black">{metricas.itensEmAlerta}</span>
            </div>
            <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Abaixo do Mínimo</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300">
              <TrendingDown size={14} />
              <span className="text-xl font-black">
                {metricas.giroEstoqueDias > 0 ? `${metricas.giroEstoqueDias}d` : "---"}
              </span>
            </div>
            <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Giro de Inventário</p>
          </div>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="mt-10 w-full py-4 bg-white text-indigo-600 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
        >
          Análise de Compras
        </button>
      </div>

      <ModalSugestoesCompra
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        sugestoes={metricas.sugestoesCompra}
      />
    </div>
  );
}
