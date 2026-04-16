import { ReactNode } from "react";

interface PropriedadesSecaoFormulario {
  titulo: string;
  children: ReactNode;
  acaoCabecalho?: ReactNode;
  className?: string;
}

/**
 * 🏷️ SecaoFormulario - Agrupador de campos padronizado
 */
export function SecaoFormulario({ titulo, children, acaoCabecalho, className = "" }: PropriedadesSecaoFormulario) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{titulo}</h4>
        {acaoCabecalho}
      </div>
      {children}
    </div>
  );
}

interface PropriedadesGradeCampos {
  children: ReactNode;
  colunas?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * 📏 GradeCampos - Grid de inputs padronizado v9.0
 */
export function GradeCampos({ children, colunas = 2, className = "" }: PropriedadesGradeCampos) {
  const mapaColunas = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={`grid ${mapaColunas[colunas]} gap-6 ${className}`}>{children}</div>;
}
