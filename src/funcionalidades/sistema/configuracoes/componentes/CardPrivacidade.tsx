import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, Trash2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { CabecalhoCard } from "./Compartilhados";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

/**
 * Propriedades do componente CardPrivacidade.
 */
interface PropsCardPrivacidade {
  /** Indica se o card deve ter um destaque visual (animação de alerta) */
  destaque?: boolean;
}

/**
 * Componente voltado para conformidade com a LGPD.
 * Permite ao usuário exportar seus dados (Portabilidade) ou excluir sua conta (Direito ao Esquecimento).
 */
export function CardPrivacidade({ destaque }: PropsCardPrivacidade) {
  const navegar = useNavigate();
  const { excluirConta, exportarDadosPessoais } = usarAutenticacao();

  const [confirmouEliminacao, definirConfirmouEliminacao] = useState(false);
  const [modalAberto, definirModalAberto] = useState(false);
  const [passo, definirPasso] = useState(1);

  /**
   * Executa o processo final de exclusão da conta do usuário.
   */
  const lidarComEliminacao = async () => {
    try {
      navegar("/", { replace: true });
      await excluirConta();
      toast.success("Sua conta foi excluída com sucesso.");
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : "Erro inesperado ao excluir conta.";
      toast.error(mensagem + " Faça login novamente e tente de novo.");
    }
  };

  /**
   * Abre o modal de confirmação de exclusão em passos.
   */
  const abrirModal = () => {
    definirModalAberto(true);
    definirPasso(1);
    definirConfirmouEliminacao(false);
  };

  return (
    <>
      <motion.div
        animate={
          destaque
            ? {
                borderColor: ["rgba(255, 0, 0, 0.2)", "rgba(255, 0, 0, 1)", "rgba(255, 0, 0, 0.2)"],
                outline: [
                  "2px solid rgba(255, 0, 0, 0)",
                  "2px solid rgba(255, 0, 0, 0.4)",
                  "2px solid rgba(255, 0, 0, 0)",
                ],
                boxShadow: [
                  "0 0 0 0px rgba(255, 0, 0, 0)",
                  "0 0 0 12px rgba(255, 0, 0, 0.15)",
                  "0 0 0 0px rgba(255, 0, 0, 0)",
                ],
              }
            : {}
        }
        transition={{
          duration: 1.2,
          repeat: destaque ? 4 : 0,
          ease: "easeInOut",
        }}
        className="rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-5 md:p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.03] to-zinc-500/[0.01] dark:from-zinc-500/[0.05] dark:to-zinc-500/[0.02] pointer-events-none" />
        <CabecalhoCard
          titulo="Privacidade (LGPD)"
          descricao="Lei nº 13.709/2018 — Sua privacidade é um direito"
          icone={Shield}
          corIcone="text-rose-500"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <p className="text-xs leading-relaxed text-gray-600 dark:text-zinc-400">
            Seus dados são tratados com transparência e responsabilidade, conforme nossa{" "}
            <a
              href="/politica-de-privacidade"
              className="hover:underline font-bold"
              style={{ color: "var(--cor-primaria)" }}
            >
              Política de Privacidade
            </a>
            .<br />
            Para exercer seus direitos ou tirar dúvidas, fale com nosso DPO:{" "}
            <a
              href="mailto:privacidade@printlog.com.br"
              className="font-bold text-gray-900 dark:text-white hover:underline transition-colors"
            >
              privacidade@printlog.com.br
            </a>
          </p>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={exportarDadosPessoais}
              className="h-10 px-4 rounded-xl text-white hover:brightness-110 text-[10px] font-black uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              style={{ backgroundColor: "var(--cor-primaria)" }}
            >
              <Download size={13} /> Exportar
            </button>
            <button
              onClick={abrirModal}
              className="h-10 px-4 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-500/30 text-[10px] font-black uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
            >
              <Trash2 size={13} /> Excluir Conta
            </button>
          </div>
        </div>
      </motion.div>

      {/* MODAL */}
      <Dialogo
        aberto={modalAberto}
        aoFechar={() => definirModalAberto(false)}
        titulo={passo === 1 ? "Excluir conta" : "Confirmação final"}
        larguraMax="max-w-md"
      >
        <div className="p-6">
          <div className="mb-6 flex gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1 flex flex-col gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${s <= passo ? "bg-gradient-to-r from-rose-500 to-rose-600" : "bg-gray-200 dark:bg-white/10"}`}
                />
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${s <= passo ? "text-rose-600 dark:text-rose-400" : "text-gray-400 dark:text-zinc-600"}`}
                >
                  {s === 1 ? "Impacto" : "Confirmação"}
                </p>
              </div>
            ))}
          </div>

          {passo === 1 ? (
            <div className="space-y-6">
              <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-5 border border-rose-100 dark:border-rose-500/20 flex flex-col items-center gap-3 text-center">
                <div className="p-3 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Essa ação é definitiva</h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-2 leading-relaxed">
                    Ao confirmar, todos os seus dados — projetos, clientes e histórico de impressões — serão apagados
                    permanentemente das nossas bases em até 30 dias, salvo os dados que a lei nos obriga a manter.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-zinc-400 text-center leading-relaxed">
                Manteremos apenas algumas cópias limitadas e estritamente necessárias por obrigações legais, conforme
                detalhado na nossa{" "}
                <a href="/politica-de-privacidade" className="hover:underline" style={{ color: "var(--cor-primaria)" }}>
                  Política de Privacidade
                </a>
                .
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => definirModalAberto(false)}
                  className="h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold text-gray-700 dark:text-zinc-300 transition-all font-mono uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => definirPasso(2)}
                  className="h-11 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-sm text-xs font-bold text-white flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                >
                  Continuar <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center px-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Quase lá...</h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                  Para sua segurança, confirme pela última vez se deseja encerrar sua conta.
                </p>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/30 bg-gray-50 dark:bg-white/[0.02] cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={confirmouEliminacao}
                  onChange={(e) => definirConfirmouEliminacao(e.target.checked)}
                  className="mt-0.5 h-4.5 w-4.5 rounded text-zinc-900 dark:text-white focus:ring-zinc-800 dark:focus:ring-white border-gray-300 bg-white dark:border-white/20 dark:bg-zinc-800 cursor-pointer transition-all"
                />
                <span className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
                  <strong>Concordo:</strong> Entendo que meus dados serão apagados permanentemente (salvo retenções
                  legais) e quero excluir minha conta.
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    definirPasso(1);
                    definirConfirmouEliminacao(false);
                  }}
                  className="h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold text-gray-700 dark:text-zinc-300 transition-all uppercase tracking-wider"
                >
                  Voltar
                </button>
                <button
                  onClick={lidarComEliminacao}
                  disabled={!confirmouEliminacao}
                  className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                    confirmouEliminacao
                      ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:brightness-110 shadow-lg shadow-rose-500/20 active:scale-[0.98]"
                      : "bg-gray-100 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  Excluir
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialogo>
    </>
  );
}
