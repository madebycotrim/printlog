import { Trash2, AlertTriangle, ArrowDownRight, Plus } from "lucide-react";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { servicoDesperdicio } from "@/compartilhado/servicos/servicoDesperdicio";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModalRegistrarPerda } from "@/funcionalidades/producao/materiais/componentes/ModalRegistrarPerda";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";

interface RelatorioDesperdicioProps {
  materiais: Material[];
  insumos: Insumo[];
}

export function RelatorioDesperdicio({ materiais, insumos }: RelatorioDesperdicioProps) {
  const navigate = useNavigate();
  const [modalAberto, definirModalAberto] = useState(false);
  const { abaterPeso } = usarArmazemMateriais();

  const metricas = useMemo(() => servicoDesperdicio.calcularMetricas(materiais, insumos), [materiais, insumos]);

  const confirmarPerda = (idMaterial: string, quantidade: number, motivo: string) => {
    abaterPeso(idMaterial, quantidade, motivo, "FALHA");
  };

  return (
    <>
      <div className="p-10 rounded-[2.5rem] bg-white dark:bg-[#121214] border border-rose-500/10 dark:border-rose-500/5 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500">
                Métrica de Desperdício
              </h3>
              <p className="text-xl font-black dark:text-white tracking-tight">Custo de Falhas & Sucata</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black bg-rose-500 text-white px-3 py-1 rounded-full uppercase tracking-widest">
              {metricas.indiceDesperdicioPercentual}% de Perda
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-5xl font-black tracking-tighter text-rose-500 mb-2">
                {centavosParaReais(metricas.totalPerdidoCentavos)}
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Prejuízo total acumulado</p>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <AlertTriangle size={18} className="text-amber-500" />
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-relaxed tracking-wide">
                {metricas.pesoTotalFalhasGramas > 0
                  ? `Você descartou ${metricas.pesoTotalFalhasGramas}g de material em falhas.`
                  : "Nenhum desperdício registrado ainda. Excelente!"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Top Causas de Perda</h4>
            <div className="space-y-3">
              {metricas.topMotivosDesperdicio.length === 0 ? (
                <p className="text-[10px] font-bold text-gray-400 uppercase opacity-30 py-8">Dados insuficientes</p>
              ) : (
                metricas.topMotivosDesperdicio.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-[11px] font-black uppercase tracking-tight text-gray-600 dark:text-gray-300 group-hover/item:text-rose-500 transition-colors">
                        {item.motivo}
                      </span>
                    </div>
                    <span className="text-[11px] font-black text-gray-400">
                      {centavosParaReais(item.valorCentavos)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <button
            onClick={() => navigate("/relatorios/desperdicio")}
            className="py-4 rounded-2xl bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95"
          >
            Ver Análise Completa
            <ArrowDownRight size={14} />
          </button>
          <button
            onClick={() => definirModalAberto(true)}
            className="py-4 rounded-2xl border border-gray-100 dark:border-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Registrar Perda
          </button>
        </div>
      </div>

      <ModalRegistrarPerda
        aberto={modalAberto}
        aoFechar={() => definirModalAberto(false)}
        materiais={materiais}
        aoConfirmar={confirmarPerda}
      />
    </>
  );
}
