import { Settings, Plus, Star, Check } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { traduzirTextoGlobal } from "@/compartilhado/utilitarios/tradutorUniversalDOM";
import { memo, useMemo } from "react";

/**
 * Interface para as propriedades do ModalArmazemMateriais.
 */
interface PropriedadesModalArmazemMateriais {
  aberto: boolean;
  aoFechar: () => void;
  busca: string;
  setBusca: (v: string) => void;
  filtroTipo: 'TODOS' | 'FDM' | 'SLA';
  setFiltroTipo: (v: 'TODOS' | 'FDM' | 'SLA') => void;
  materiaisFiltrados: any[];
  selecionados: any[];
  aoAlternar: (id: string) => void;
  aoCriarNovo: () => void;
  aoAlternarFavorito: (id: string) => void;
}

interface ItemCardMaterialProps {
  material: any;
  isSelecionado: boolean;
  aoAlternar: (id: string) => void;
  aoAlternarFavorito: (id: string) => void;
}

/**
 * Card individual de material memoizado com content-visibility para máxima performance e 120 FPS.
 */
const ItemCardMaterial = memo(function ItemCardMaterial({
  material: m,
  isSelecionado,
  aoAlternar,
  aoAlternarFavorito,
}: ItemCardMaterialProps) {
  const unidade = m.tipo === 'SLA' ? 'ml' : 'g';
  const totalKgOuL = (m.pesoGramas || 1000) / 1000;
  const precoPorUnidade = (m.precoCentavos / 100) / totalKgOuL;

  return (
    <div
      onClick={() => aoAlternar(m.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          aoAlternar(m.id);
        }
      }}
      className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden h-24 bg-card cursor-pointer select-none ${
        isSelecionado ? "shadow-md" : "hover:shadow-lg"
      }`}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "96px",
        borderColor: isSelecionado ? m.cor : `${m.cor}22`,
        backgroundColor: isSelecionado ? `${m.cor}11` : undefined,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 opacity-40 pointer-events-none"
        style={{ backgroundColor: m.cor || '#888' }}
      />

      <div className="shrink-0 w-14 flex items-center justify-center pointer-events-none">
        <div className="group-hover:scale-105 transition-transform duration-300">
          {m.tipo === 'SLA' ? (
            <GarrafaResina cor={m.cor} tamanho={36} porcentagem={(m.pesoRestanteGramas / (m.pesoGramas || 1000)) * 100} />
          ) : (
            <Carretel cor={m.cor} tamanho={42} porcentagem={(m.pesoRestanteGramas / (m.pesoGramas || 1000)) * 100} />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
        <div className="flex justify-between items-start">
          <div className="min-w-0 pr-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white truncate">
              {m.nome}
            </h4>
            <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 truncate">
              {m.fabricante || "Genérico"} • {m.tipoMaterial || m.tipo}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                aoAlternarFavorito(m.id);
              }}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                m.favorito
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-zinc-400 hover:text-amber-500/50 hover:bg-white/5"
              }`}
            >
              <Star size={10} fill={m.favorito ? "currentColor" : "none"} />
            </button>
            {isSelecionado && (
              <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg z-10">
                <Check size={12} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 border-t border-borda-sutil dark:border-white/5 pt-2 mt-1">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
              {traduzirTextoGlobal("Saldo")}
            </span>
            <span className={`text-[10px] font-black tabular-nums ${m.pesoRestanteGramas < 100 ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-300'}`}>
              {m.pesoRestanteGramas}{unidade}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-emerald-500 tabular-nums">
              {centavosParaReais(Math.round(precoPorUnidade * 100))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Modal para listagem e seleção de materiais do armazém.
 */
export function ModalArmazemMateriais({
  aberto,
  aoFechar,
  busca,
  setBusca,
  filtroTipo,
  setFiltroTipo,
  materiaisFiltrados,
  selecionados,
  aoAlternar,
  aoCriarNovo,
  aoAlternarFavorito
}: PropriedadesModalArmazemMateriais) {
  // Hash Map O(1) de seleção
  const idsSelecionados = useMemo(
    () => new Set(selecionados.map((s) => s.id)),
    [selecionados]
  );

  // Filtro instantâneo em memória
  const listaExibida = useMemo(() => {
    let lista = materiaisFiltrados;
    if (filtroTipo !== 'TODOS') {
      lista = lista.filter(m => m.tipo === filtroTipo);
    }
    if (busca && busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter(m =>
        (m.nome && m.nome.toLowerCase().includes(termo)) ||
        (m.fabricante && m.fabricante.toLowerCase().includes(termo)) ||
        (m.tipoMaterial && m.tipoMaterial.toLowerCase().includes(termo))
      );
    }
    return lista;
  }, [materiaisFiltrados, filtroTipo, busca]);

  const filtrosOpcoes = useMemo(() => [
    { id: 'TODOS', label: traduzirTextoGlobal("Tudo") },
    { id: 'FDM', label: traduzirTextoGlobal("Filamento") },
    { id: 'SLA', label: traduzirTextoGlobal("Resina") },
  ], []);

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Armazém de Materiais"
      iconeTitulo={Settings}
      corDestaque="sky"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      temResultados={true}
      totalResultados={listaExibida.length}
      elementoExtra={
        <div className="flex items-center gap-1 p-1 h-full">
          {filtrosOpcoes.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroTipo(f.id as any)}
              className={`px-6 h-full min-w-[100px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                filtroTipo === f.id
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Botão Novo Material */}
        <button
          onClick={aoCriarNovo}
          className="p-3 rounded-2xl border-2 border-dashed border-borda-sutil dark:border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex items-center gap-4 h-24 group cursor-pointer"
        >
          <div className="shrink-0 w-14 flex items-center justify-center">
            <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all text-zinc-400">
              <Plus size={22} />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white">
              {traduzirTextoGlobal("Novo Material")}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {traduzirTextoGlobal("Adicionar ao catálogo")}
            </span>
          </div>
        </button>

        {listaExibida.map((m) => (
          <ItemCardMaterial
            key={m.id}
            material={m}
            isSelecionado={idsSelecionados.has(m.id)}
            aoAlternar={aoAlternar}
            aoAlternarFavorito={aoAlternarFavorito}
          />
        ))}
      </div>
    </ModalListagemPremium>
  );
}
