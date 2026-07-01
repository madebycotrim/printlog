import { Box, Tag } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes";
import { SeletorIcone } from "@/compartilhado/componentes/ui";
import { CATEGORIAS } from "../../constantes";
import { CategoriaInsumo } from "../../tipos";

interface PropriedadesSecaoBasica {
  register: any;
  errors: any;
  categoriaAtiva: CategoriaInsumo;
  aoMudarCategoria: (cat: CategoriaInsumo) => void;
  iconeAtivo?: string;
  aoMudarIcone?: (icone: string) => void;
  corTema?: string;
}

const CORES_TAILWIND: Record<string, string> = {
  "zinc-500": "bg-zinc-500 border-zinc-500 shadow-zinc-500/20",
  "stone-500": "bg-stone-500 border-stone-500 shadow-stone-500/20",
  "amber-500": "bg-amber-500 border-amber-500 shadow-amber-500/20",
  "pink-500": "bg-pink-500 border-pink-500 shadow-pink-500/20",
  "red-500": "bg-red-500 border-red-500 shadow-red-500/20",
  "teal-500": "bg-teal-500 border-teal-500 shadow-teal-500/20",
  "violet-500": "bg-violet-500 border-violet-500 shadow-violet-500/20",
  "emerald-500": "bg-emerald-500 border-emerald-500 shadow-emerald-500/20",
  "sky-500": "bg-sky-500 border-sky-500 shadow-sky-500/20",
};

export function SecaoInformacoesBasicas({ register, errors, categoriaAtiva, aoMudarCategoria, iconeAtivo, aoMudarIcone, corTema }: PropriedadesSecaoBasica) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 flex items-center gap-3">
          Informações Básicas
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-100 to-transparent dark:from-white/5 dark:to-transparent" />
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex gap-4">
          {aoMudarIcone && (
            <div className="shrink-0 space-y-1.5">
              <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">
                Ícone
              </label>
              <SeletorIcone valor={iconeAtivo} aoMudar={aoMudarIcone} corTema={corTema} />
            </div>
          )}
          <div className="flex-1">
            <CampoTexto
              rotulo="Nome do Insumo"
              icone={Box}
              placeholder="Ex: Álcool Isopropílico, Fita Blue Tape..."
              erro={errors.nome?.message}
              {...register("nome", { required: "Obrigatório" })}
            />
          </div>
        </div>

        <CampoTexto
          rotulo="Marca / Fabricante"
          icone={Tag}
          placeholder="Ex: Prime, 3M, Sinteglos..."
          erro={errors.marca?.message}
          {...register("marca")}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-1">
          Categoria Logística
        </label>
        <input type="hidden" {...register("categoria")} />
        <div 
          className="flex flex-wrap items-center gap-2 mt-2"
        >
          {CATEGORIAS.map((cat) => {
            const estaSelecionado = categoriaAtiva === cat.id;
            const classesCorSelecionada = CORES_TAILWIND[cat.corTema] || CORES_TAILWIND["zinc-500"];
            
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => aoMudarCategoria(cat.id as CategoriaInsumo)}
                className={`h-11 px-6 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.1em] transition-all whitespace-nowrap border shrink-0 uppercase
                  ${
                    estaSelecionado
                      ? `${classesCorSelecionada} text-white shadow-xl scale-[1.02]`
                      : "bg-zinc-50 dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
              >
                <cat.icone size={14} strokeWidth={estaSelecionado ? 3 : 2} />
                {cat.rotulo}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
