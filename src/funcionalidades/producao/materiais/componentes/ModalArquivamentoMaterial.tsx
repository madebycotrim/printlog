import { Trash2, AlertTriangle } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";

interface PropriedadesModalArquivamentoMaterial {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
  material: Material | null;
}

export function ModalArquivamentoMaterial({
  aberto,
  aoFechar,
  aoConfirmar,
  material,
}: PropriedadesModalArquivamentoMaterial) {
  if (!material) return null;

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Remover Material" larguraMax="max-w-md">
      <div className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Ícone de Alerta */}
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Remover Material?</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                Este material sairá da sua lista, mas as{" "}
                <strong className="text-gray-900 dark:text-zinc-300">referências passadas</strong> serão preservados.
              </p>
            </div>
          </div>

          {/* Card Resumo do Material a ser apagado */}
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 shadow-sm dark:shadow-none dark:border-white/5 relative z-10 w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#18181b] dark:to-[#121214] border border-gray-200/60 dark:border-white/5 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner">
              <div
                className="absolute inset-0 opacity-15 dark:opacity-10 blur-xl mix-blend-multiply dark:mix-blend-normal"
                style={{ backgroundColor: material.cor }}
              />
              <div className="relative z-10 drop-shadow-md scale-[0.80]">
                {material.tipo === "FDM" ? (
                  <Carretel cor={material.cor} tamanho={48} porcentagem={100} />
                ) : (
                  <GarrafaResina cor={material.cor} tamanho={40} porcentagem={100} />
                )}
              </div>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">
                {material.nome}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider truncate">
                {material.fabricante} • {material.tipoMaterial}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex items-center justify-end gap-3 rounded-br-xl">
          <button
            type="button"
            onClick={aoFechar}
            className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Trash2 size={18} strokeWidth={2.5} />
            Sim, Remover Material
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
