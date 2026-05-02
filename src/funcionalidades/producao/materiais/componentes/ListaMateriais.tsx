import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { CardMaterial } from "./CardMaterial";
import { Material } from "../tipos";

interface ListaMateriaisProps {
  materiais: Material[];
  agrupadosPorTipo: [string, Material[]][];
  aoEditar: (m: Material) => void;
  aoHistorico: (m: Material, aba?: "extrato" | "novo") => void;
  aoExcluir: (m: Material) => void;
  aoAlternarFavorito: (id: string) => void;
}

export function ListaMateriais({ materiais, agrupadosPorTipo, aoEditar, aoHistorico, aoExcluir, aoAlternarFavorito }: ListaMateriaisProps) {
  if (materiais.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search size={36} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-700 mb-4" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Nenhum resultado encontrado</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Tente buscar com termos diferentes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <AnimatePresence mode="popLayout">
        {agrupadosPorTipo.map(([tipo, lista], index) => (
          <motion.div
            layout
            key={tipo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {tipo}
                </h3>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#121214] border border-gray-200 dark:border-white/[0.04] text-[10px] font-black text-gray-600 dark:text-zinc-500 uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                  {lista.length} ITEM{lista.length !== 1 ? "S" : ""}
                </span>
              </div>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.04]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
              {lista.map((mat) => (
                <CardMaterial
                  key={mat.id}
                  material={mat}
                  aoEditar={aoEditar}
                  aoHistorico={aoHistorico}
                  aoExcluir={aoExcluir}
                  aoAlternarFavorito={aoAlternarFavorito}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
