import { Settings, Plus, Star, Check } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";

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
      totalResultados={materiaisFiltrados.length}
      elementoExtra={
        <div className="flex items-center gap-1 p-1 h-full">
          {[
            { id: 'TODOS', label: 'Tudo' },
            { id: 'FDM', label: 'Filamento' },
            { id: 'SLA', label: 'Resina' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroTipo(f.id as any)}
              className={`px-6 h-full min-w-[100px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroTipo === f.id
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
          className="p-3 rounded-2xl border-2 border-dashed border-borda-sutil dark:border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex items-center gap-4 h-24 group"
        >
          <div className="shrink-0 w-14 flex items-center justify-center">
            <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all text-zinc-400 group-hover:text-white">
              <Plus size={22} />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white">Novo Material</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Adicionar ao catálogo</span>
          </div>
        </button>

        {materiaisFiltrados.map(m => {
          const isSelecionado = selecionados.some(s => s.id === m.id);
          const unidade = m.tipo === 'SLA' ? 'ml' : 'g';
          const totalKgOuL = m.pesoGramas / 1000;
          const precoPorUnidade = (m.precoCentavos / 100) / totalKgOuL;

          return (
            <div
              key={m.id}
              onClick={() => aoAlternar(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  aoAlternar(m.id);
                }
              }}
              className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden h-24 bg-card cursor-pointer ${isSelecionado ? "shadow-md" : "hover:shadow-lg"}`}
              style={{
                borderColor: isSelecionado ? m.cor : `${m.cor}22`,
                backgroundColor: isSelecionado ? `${m.cor}11` : undefined
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 opacity-40"
                style={{ backgroundColor: m.cor || '#888' }}
              />

              <div className="shrink-0 w-14 flex items-center justify-center">
                <div className="group-hover:scale-110 transition-transform duration-500">
                  {m.tipo === 'SLA' ? (
                    <GarrafaResina cor={m.cor} tamanho={36} porcentagem={(m.pesoRestanteGramas / m.pesoGramas) * 100} />
                  ) : (
                    <Carretel cor={m.cor} tamanho={42} porcentagem={(m.pesoRestanteGramas / m.pesoGramas) * 100} />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white truncate">
                      {m.nome}
                    </h4>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter truncate">
                      {m.fabricante} • {m.tipoMaterial}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        aoAlternarFavorito(m.id);
                      }}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${m.favorito
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
                    <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Saldo</span>
                    <span className={`text-[9px] font-black tabular-nums ${m.pesoRestanteGramas < 100 ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-300'}`}>
                      {m.pesoRestanteGramas}{unidade}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-emerald-500 tracking-tighter tabular-nums">
                      R$ {precoPorUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ModalListagemPremium>
  );
}
