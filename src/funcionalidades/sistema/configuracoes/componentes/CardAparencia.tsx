import { Palette, Sun, Moon, Check, Type } from "lucide-react";
import { usarContextoTema } from "@/configuracoes/tema/tema_provider";
import type { CorPrimaria } from "@/compartilhado/tipos/modelos";
import { CabecalhoCard } from "./Compartilhados";

const coresDisponiveis = [
  { id: "sky", class: "bg-sky-500", nome: "Céu" },
  { id: "blue", class: "bg-blue-600", nome: "Azul" },
  { id: "indigo", class: "bg-indigo-500", nome: "Índigo" },
  { id: "violet", class: "bg-violet-500", nome: "Violeta" },
  { id: "fuchsia", class: "bg-fuchsia-500", nome: "Fúcsia" },
  { id: "pink", class: "bg-pink-500", nome: "Pink" },
  { id: "rose", class: "bg-rose-500", nome: "Rosa" },
  { id: "orange", class: "bg-orange-500", nome: "Laranja" },
  { id: "amber", class: "bg-amber-500", nome: "Âmbar" },
  { id: "lime", class: "bg-lime-500", nome: "Limão" },
  { id: "emerald", class: "bg-emerald-500", nome: "Esmeralda" },
  { id: "teal", class: "bg-teal-500", nome: "Turquesa" },
  { id: "cyan", class: "bg-cyan-500", nome: "Ciano" },
  { id: "slate", class: "bg-slate-500", nome: "Ardósia" },
];

const fontesDisponiveis = [
  { id: "inter", label: "Inter" },
  { id: "montserrat", label: "Montserrat" },
  { id: "poppins", label: "Poppins" },
];

interface CardAparenciaProps {
  pendente?: boolean;
}

export function CardAparencia({ pendente }: CardAparenciaProps) {
  const { modoTema, alternarTema, corPrimaria, definirCorPrimaria, fonte, definirFonte } = usarContextoTema();

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-4 md:p-5 flex flex-col gap-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.03] to-zinc-500/[0.01] dark:from-zinc-500/[0.05] dark:to-zinc-500/[0.02] pointer-events-none" />
      <CabecalhoCard
        titulo="Aparência Visual"
        descricao="Tema, cores e tipografia"
        icone={Palette}
        corIcone="text-violet-500"
        pendente={pendente}
      />

      {/* TEMA + TIPOGRAFIA - LINHA ÚNICA */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "CLARO", label: "modo claro", icone: Sun, corIcone: "text-amber-500" },
          { id: "ESCURO", label: "modo escuro", icone: Moon, corIcone: "text-sky-500" },
        ].map((modo) => (
          <button
            key={modo.id}
            onClick={modoTema !== modo.id ? alternarTema : undefined}
            className={`rounded-xl border p-2.5 flex items-center gap-2 transition-all outline-none ${
              modoTema === modo.id
                ? "border-[var(--cor-primaria)] bg-[var(--cor-primaria)]/5"
                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
            }`}
            style={modoTema === modo.id ? { borderColor: "var(--cor-primaria)" } : {}}
          >
            <modo.icone size={14} className={modo.corIcone} />
            <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white flex-1 text-left">
              {modo.label}
            </span>
            {modoTema === modo.id && <Check size={12} className="text-emerald-500" />}
          </button>
        ))}
      </div>

      {/* PALETA DE CORES */}
      <div className="bg-gray-50/70 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-200 dark:border-white/10">
        <div className="flex flex-wrap justify-center gap-1.5">
          {coresDisponiveis.map((cor) => (
            <button
              key={cor.id}
              onClick={() => definirCorPrimaria(cor.id as CorPrimaria)}
              className={`relative w-7 h-7 rounded-full ${cor.class} border-[3px] border-white dark:border-card-fundo transition-all hover:scale-110 active:scale-95 shadow-sm ${corPrimaria === cor.id ? "outline outline-offset-1 scale-110" : ""}`}
              style={corPrimaria === cor.id ? { outlineColor: "var(--cor-primaria)", outlineWidth: "2px" } : undefined}
              aria-label={`Selecionar Tema ${cor.nome}`}
            >
              {corPrimaria === cor.id && (
                <Check size={10} className="absolute inset-0 m-auto text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TIPOGRAFIA - LAYOUT ORIGINAL */}
      <div className="flex items-center gap-2">
        <Type size={12} className="text-gray-400 shrink-0" />
        <p className="text-xs uppercase tracking-[0.16em] font-black text-gray-500 dark:text-zinc-500 shrink-0">
          Fonte
        </p>
        <div className="flex gap-1.5 flex-1">
          {fontesDisponiveis.map((f) => (
            <button
              key={f.id}
              onClick={() => definirFonte(f.id as any)}
              className={`flex-1 h-7 rounded-xl border text-[10px] font-black uppercase transition-all ${
                fonte === f.id
                  ? "text-white shadow-sm"
                  : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-zinc-500 hover:border-gray-300"
              }`}
              style={
                fonte === f.id ? { backgroundColor: "var(--cor-primaria)", borderColor: "var(--cor-primaria)" } : {}
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
