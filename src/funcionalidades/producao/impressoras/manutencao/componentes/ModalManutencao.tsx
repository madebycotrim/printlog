import { useState } from "react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Impressora } from "../../tipos";
import { usarManutencao } from "../hooks/usarManutencao";
import { MonitorPecas } from "./MonitorPecas";
import { FormularioManutencao } from "./FormularioManutencao";
import { History, Activity, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface ModalManutencaoProps {
  aberto: boolean;
  aoFechar: () => void;
  impressora: Impressora;
}

export function ModalManutencao({ aberto, aoFechar, impressora }: ModalManutencaoProps) {
  const { pecas, manutencoes, registrarManutencao } = usarManutencao(impressora.id);
  const [abaAtiva, setAbaAtiva] = useState<"monitor" | "historico" | "novo">("monitor");
  const [formularioSujo, definirFormularioSujo] = useState(false);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

  const fecharModalRealmente = () => {
    definirConfirmarDescarte(false);
    aoFechar();
  };

  const lidarComTentativaFechamento = () => {
    if (formularioSujo && !confirmarDescarte) {
      definirConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  const formatarMoeda = (centavos: number) => {
    return (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={`Manutenção: ${impressora.nome}`}
      larguraMax="max-w-xl"
    >
      <div className="p-6 bg-white dark:bg-[#18181b]">
        {/* Navegação Interna */}
        <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl mb-6">
          <button
            onClick={() => setAbaAtiva("monitor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-lg transition-all ${
              abaAtiva === "monitor"
                ? "bg-white dark:bg-zinc-800 shadow-sm border border-border"
                : "text-muted-foreground"
            }`}
          >
            <Activity size={14} /> MONITOR
          </button>
          <button
            onClick={() => setAbaAtiva("historico")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-lg transition-all ${
              abaAtiva === "historico"
                ? "bg-white dark:bg-zinc-800 shadow-sm border border-border"
                : "text-muted-foreground"
            }`}
          >
            <History size={14} /> HISTÓRICO
          </button>
          <button
            onClick={() => setAbaAtiva("novo")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-lg transition-all ${
              abaAtiva === "novo" ? "bg-primaria text-white shadow-lg shadow-primaria/20" : "text-muted-foreground"
            }`}
          >
            <Plus size={14} /> REGISTRAR
          </button>
        </div>

        <div className="min-h-[400px]">
          {abaAtiva === "monitor" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <MonitorPecas pecas={pecas} />
            </motion.div>
          )}

          {abaAtiva === "historico" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {manutencoes.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground italic">Nenhum histórico registrado</p>
                </div>
              ) : (
                manutencoes.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-border bg-card/50">
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          m.tipo === "Preventiva"
                            ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                            : "border-amber-500/30 text-amber-500 bg-amber-500/5"
                        }`}
                      >
                        {m.tipo}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {new Date(m.data).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-3">{m.descricao}</p>
                    <div className="flex gap-4 text-[10px] font-black uppercase text-muted-foreground">
                      {m.custoCentavos > 0 && <span>Custo: {formatarMoeda(m.custoCentavos)}</span>}
                      {m.tempoParadaMinutos > 0 && <span>Parada: {m.tempoParadaMinutos}min</span>}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {abaAtiva === "novo" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <FormularioManutencao
                idImpressora={impressora.id}
                pecas={pecas}
                aoCancelar={() => setAbaAtiva("monitor")}
                aoSalvar={async (dados) => {
                  await registrarManutencao(dados);
                }}
                aoAlterarDirty={definirFormularioSujo}
              />
            </motion.div>
          )}
        </div>

        {/* ALERTA DE DESCARTE v9.0 */}
        {confirmarDescarte && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex flex-col items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
              Há alterações não salvas no registro!
            </span>
            <div className="flex gap-3 w-full">
              <button
                onClick={fecharModalRealmente}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all"
              >
                Descartar e Fechar
              </button>
              <button
                onClick={() => definirConfirmarDescarte(false)}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg transition-all"
              >
                Manter Registro
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialogo>
  );
}
