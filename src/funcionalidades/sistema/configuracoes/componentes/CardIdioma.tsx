import { Globe, Sparkles } from "lucide-react";
import { CabecalhoCard } from "./Compartilhados";
import { SeletorIdioma } from "@/compartilhado/componentes/SeletorIdioma";
import { useIdioma } from "@/compartilhado/hooks/useIdioma";

interface CardIdiomaProps {
  pendente?: boolean;
}

export function CardIdioma({ pendente }: CardIdiomaProps) {
  const { t, formatarMoeda, formatarData } = useIdioma();

  const exemploData = new Date();
  const exemploCentavos = 14990; // R$ 149,90 ou $ 149.90

  return (
    <div className="h-full rounded-2xl border border-borda-sutil bg-card p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-premium transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />

      <CabecalhoCard
        titulo={t("idiomas.titulo")}
        descricao={t("idiomas.descricao")}
        icone={Globe}
        corIcone="text-blue-500"
        pendente={pendente}
      />

      <div className="space-y-4">
        <SeletorIdioma variante="completo" />

        {/* Pré-visualização inteligente de Formatos Localizados */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Sparkles size={13} className="text-primary" />
            <span>{t("idiomas.adaptacaoFormatos")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-card border border-borda-sutil flex items-center justify-between">
              <span className="text-zinc-400 font-medium">{t("idiomas.exemploMoeda")}</span>
              <span className="font-mono font-bold text-primary dark:text-white">
                {formatarMoeda(exemploCentavos)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-card border border-borda-sutil flex items-center justify-between">
              <span className="text-zinc-400 font-medium">{t("idiomas.exemploData")}</span>
              <span className="font-mono font-bold text-primary dark:text-white">
                {formatarData(exemploData, "completa")}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed">
            {t("idiomas.notaExplicativa")}
          </p>
        </div>
      </div>
    </div>
  );
}
