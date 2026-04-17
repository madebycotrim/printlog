import { useState, useEffect, useMemo } from "react";
import { AlertCircle, Plus, Settings, X, RotateCcw, Activity, Box } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Impressora, PecaDesgaste } from "@/funcionalidades/producao/impressoras/tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { motion, AnimatePresence } from "framer-motion";

interface ModalPecasDesgasteProps {
  aberto: boolean;
  aoFechar: () => void;
  impressora: Impressora | null;
  aoSalvar: (idImpressora: string, pecas: PecaDesgaste[]) => void;
}

export function ModalPecasDesgaste({ aberto, aoFechar, impressora, aoSalvar }: ModalPecasDesgasteProps) {
  const [pecas, definirPecas] = useState<PecaDesgaste[]>([]);
  const [novaPecaNome, definirNovaPecaNome] = useState("");
  const [novaPecaVida, definirNovaPecaVida] = useState("");
  const [exibindoForm, definirExibindoForm] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (aberto && impressora) {
      definirPecas(impressora.pecasDesgaste || []);
      definirExibindoForm(false);
      definirNovaPecaNome("");
      definirNovaPecaVida("");
      setBusca("");
    }
  }, [aberto, impressora]);

  const pecasFiltradas = useMemo(() => {
    if (!busca) return pecas;
    const termo = busca.toLowerCase();
    return pecas.filter((p) => p.nome.toLowerCase().includes(termo));
  }, [pecas, busca]);

  if (!impressora) return null;

  const horimetroAtualMinutos = impressora.horimetroTotalMinutos || 0;

  const lidarComAdicionarPeca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPecaNome.trim() || !novaPecaVida.trim()) return;

    const novaPeca: PecaDesgaste = {
      id: crypto.randomUUID(),
      nome: novaPecaNome,
      vidaUtilEstimadaMinutos: Math.round(Number(novaPecaVida) * 60),
      minutosTrocado: horimetroAtualMinutos,
      dataInclusao: new Date().toISOString(),
    };

    const novasPecas = [...pecas, novaPeca];
    definirPecas(novasPecas);
    aoSalvar(impressora.id, novasPecas);

    definirNovaPecaNome("");
    definirNovaPecaVida("");
    definirExibindoForm(false);
  };

  const lidarComResetarPeca = (idPeca: string) => {
    const novasPecas = pecas.map((p) => {
      if (p.id === idPeca) {
        return {
          ...p,
          minutosTrocado: horimetroAtualMinutos,
          dataInclusao: new Date().toISOString(),
        };
      }
      return p;
    });

    definirPecas(novasPecas);
    aoSalvar(impressora.id, novasPecas);
  };

  const lidarComRemoverPeca = (idPeca: string) => {
    const novasPecas = pecas.filter((p) => p.id !== idPeca);
    definirPecas(novasPecas);
    aoSalvar(impressora.id, novasPecas);
  };

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Peças de Desgaste"
      iconeTitulo={Settings}
      corDestaque="sky"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      placeholderBusca="BUSCAR PEÇA MONITORADA..."
      temResultados={exibindoForm || pecasFiltradas.length > 0}
      totalResultados={pecasFiltradas.length}
      iconeVazio={Box}
      mensagemVazio="Nenhuma peça monitorada encontrada para esta busca."
      infoRodape="O horímetro da peça é zerado automaticamente após o registro de troca."
    >
      <div className="space-y-8">
        {/* ═══════ HEADER DA IMPRESSORA ═══════ */}
        <div className="p-8 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
              {impressora.imagemUrl ? (
                <img src={impressora.imagemUrl} alt={impressora.nome} className="w-[85%] h-[85%] object-contain" />
              ) : (
                <Settings size={32} className="text-zinc-600" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">
                {impressora.nome}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest bg-white dark:bg-black/20 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/5">
                  HORÍMETRO:{" "}
                  <strong className="text-gray-900 dark:text-white">{(horimetroAtualMinutos / 60).toFixed(1)}H</strong>
                </span>
              </div>
            </div>
            <button
              onClick={() => definirExibindoForm(!exibindoForm)}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            >
              {exibindoForm ? <X size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
              {exibindoForm ? "CANCELAR" : "NOVA PEÇA"}
            </button>
          </div>
        </div>

        {/* ═══════ FORMULÁRIO DE INCLUSÃO ═══════ */}
        <AnimatePresence>
          {exibindoForm && (
            <motion.form
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              onSubmit={lidarComAdicionarPeca}
              className="bg-sky-500/[0.03] dark:bg-sky-400/[0.03] p-8 rounded-3xl border border-sky-500/10 dark:border-sky-400/10 space-y-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-6">
                <CampoTexto
                  autoFocus
                  rotulo="Nome da Peça"
                  icone={Settings}
                  value={novaPecaNome}
                  onChange={(e) => definirNovaPecaNome(e.target.value)}
                  placeholder="Ex: Bico 0.4mm Hardened"
                />
                <div className="relative">
                  <CampoTexto
                    rotulo="Vida Útil"
                    icone={Activity}
                    type="number"
                    value={novaPecaVida}
                    onChange={(e) => definirNovaPecaVida(e.target.value)}
                    placeholder="Ex: 500"
                  />
                  <span className="absolute right-4 top-[42px] text-[9px] uppercase font-black text-gray-400 dark:text-zinc-600">
                    Horas
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-sky-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-sky-500/20 hover:brightness-110 hover:-translate-y-1 transition-all active:scale-95"
                >
                  ADICIONAR AO RASTREIO
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ═══════ LISTA DE PEÇAS MONITORADAS ═══════ */}
        <div className="space-y-4">
          {pecasFiltradas.length === 0 && !exibindoForm ? (
            <div className="text-center py-20 flex flex-col items-center gap-6 text-gray-300 dark:text-zinc-800 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl">
              <Settings size={48} strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-[0.2em] max-w-[280px] leading-relaxed">
                Nenhuma peça monitorada. Comece a rastrear o desgaste de Bicos e FEPs.
              </p>
            </div>
          ) : (
            pecasFiltradas.map((peca) => {
              const minutosTrabalhadasNaPeca = Math.max(0, horimetroAtualMinutos - peca.minutosTrocado);
              const porcentagemDesgaste = Math.min(
                100,
                (minutosTrabalhadasNaPeca / peca.vidaUtilEstimadaMinutos) * 100,
              );
              const estourouVida = porcentagemDesgaste >= 100;

              const corBarra = estourouVida ? "bg-rose-500" : porcentagemDesgaste > 80 ? "bg-amber-500" : "bg-sky-500";

              return (
                <motion.div
                  layout
                  key={peca.id}
                  className="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl p-6 transition-all group hover:bg-gray-50 dark:hover:bg-white/5 hover:-translate-y-1 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${corBarra} shadow-[0_0_12px] ${estourouVida ? "shadow-rose-500/50" : "shadow-sky-500/30"} animate-pulse`}
                      />
                      <div>
                        <h5 className="text-base font-black text-gray-900 dark:text-white tracking-tight uppercase">
                          {peca.nome}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          {estourouVida ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                              <AlertCircle size={10} strokeWidth={3} /> TROCA CRÍTICA
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                              Monitoramento Ativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => lidarComResetarPeca(peca.id)}
                        className="p-3 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 bg-gray-100 dark:bg-white/5 rounded-xl transition-all hover:scale-110 active:scale-95 group/btn"
                        title="Zerar Horímetro (Troca Realizada)"
                      >
                        <RotateCcw
                          size={16}
                          strokeWidth={2.5}
                          className="group-hover/btn:rotate-[-45deg] transition-transform"
                        />
                      </button>
                      <button
                        onClick={() => lidarComRemoverPeca(peca.id)}
                        className="p-3 text-gray-400 hover:text-rose-500 bg-gray-100 dark:bg-white/5 rounded-xl transition-all hover:scale-110 active:scale-95"
                        title="Parar de Monitorar"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                          PROGRESSO DE DESGASTE
                        </span>
                        <div className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                          {(minutosTrabalhadasNaPeca / 60).toFixed(1)}H{" "}
                          <small className="text-[10px] opacity-40 mx-1">/</small>{" "}
                          {(peca.vidaUtilEstimadaMinutos / 60).toFixed(0)}H
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-black ${estourouVida ? "text-rose-500" : "text-gray-900 dark:text-white"} tracking-tighter`}
                      >
                        {Math.round(porcentagemDesgaste)}%
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentagemDesgaste}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={`h-full rounded-full ${corBarra} shadow-sm`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </ModalListagemPremium>
  );
}
