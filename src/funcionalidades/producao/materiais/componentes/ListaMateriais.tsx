import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { CardMaterial } from "./CardMaterial";
import { Material } from "../tipos";

interface ListaMateriaisProps {
  materiais: Material[];
  agrupadosPorTipo: [string, Material[]][];
  aoEditar: (m: Material) => void;
  aoHistorico: (m: Material, aba?: "extrato" | "novo" | "cadastro") => void;
  aoExcluir: (m: Material) => void;
  aoAlternarFavorito: (id: string) => void;
}

export function ListaMateriais({ materiais, agrupadosPorTipo, aoEditar, aoHistorico, aoExcluir, aoAlternarFavorito }: ListaMateriaisProps) {
  if (materiais.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center min-h-[400px] relative overflow-hidden">
        {/* Grade de pontos */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-muted/40 dark:bg-white/[0.03] border border-borda-sutil flex items-center justify-center">
            <Search size={28} strokeWidth={1.5} className="text-muted-foreground opacity-30" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-primary uppercase tracking-tight">Nenhum resultado encontrado</h3>
            <p className="text-sm text-muted-foreground">Tente buscar com termos diferentes.</p>
          </div>
        </div>
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
                <h3 className="text-xl font-black text-primary uppercase tracking-tight">
                  {tipo}
                </h3>
                <span className="px-2.5 py-1 rounded-lg bg-muted/60 dark:bg-[#121214] border border-borda-sutil text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                  {lista.length} ITEM{lista.length !== 1 ? "S" : ""}
                </span>
              </div>
              <div className="flex-1 h-px bg-borda-sutil/40" />
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
                  esconderFavorito={true}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
