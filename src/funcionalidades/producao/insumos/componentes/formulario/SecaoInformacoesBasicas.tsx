import { Box, Tag } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes";
import { CATEGORIAS } from "../../constantes";
import { CategoriaInsumo } from "../../tipos";

interface PropriedadesSecaoBasica {
  register: any;
  errors: any;
  categoriaAtiva: CategoriaInsumo;
  aoMudarCategoria: (cat: CategoriaInsumo) => void;
}

export function SecaoInformacoesBasicas({ register, errors, categoriaAtiva, aoMudarCategoria }: PropriedadesSecaoBasica) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 flex items-center gap-3">
          Informações Básicas
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-100 to-transparent dark:from-white/5 dark:to-transparent" />
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CampoTexto
          rotulo="Nome do Insumo"
          icone={Box}
          placeholder="Ex: Álcool Isopropílico, Fita Blue Tape..."
          erro={errors.nome?.message}
          {...register("nome", { required: "Obrigatório" })}
        />

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
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
          {CATEGORIAS.map((cat) => {
            const estaSelecionado = categoriaAtiva === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => aoMudarCategoria(cat.id as CategoriaInsumo)}
                className={`h-11 px-6 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.1em] transition-all whitespace-nowrap border shrink-0 uppercase
                  ${
                    estaSelecionado
                      ? `bg-${cat.corTema} border-${cat.corTema} text-white shadow-xl shadow-${cat.corTema}/20 scale-[1.02]`
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
