import { useState, useEffect } from "react";
import { Trash2, Download, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, UserX, Database, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";

/**
 * Página de Gestão de Dados Pessoais (Direitos do Titular).
 * Finalidade: Permitir que o usuário exerça seus direitos de acesso e exclusão (Art. 18 da LGPD).
 * Conectado ao Firebase Auth e sistema de portabilidade.
 * Padronizada com cabeçalho global e suporte a temas claro/escuro.
 */
export default function PaginaGestaoDados() {
  const { exportarDadosPessoais, excluirConta, usuario } = useAutenticacao();
  const [etapa, setEtapa] = useState<"escolha" | "confirmacao_exclusao" | "processando" | "sucesso">("escolha");
  const [carregando, setCarregando] = useState(false);

  // Injeção de metatag robots: noindex para evitar punição de conteúdo duplicado no Google
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useDefinirCabecalho({
    titulo: "Gestão de Dados",
    subtitulo: "Exerça seus direitos garantidos pela LGPD",
    ocultarBusca: true,
  });

  const lidarComExportacao = async () => {
    setCarregando(true);
    try {
      await exportarDadosPessoais();
    } finally {
      setCarregando(false);
    }
  };

  const lidarComExclusao = async () => {
    setEtapa("processando");
    try {
      await excluirConta();
      setEtapa("sucesso");
    } catch (erro) {
      alert("Erro ao excluir conta. Por favor, faça login novamente para confirmar esta ação sensível.");
      setEtapa("escolha");
    }
  };

  if (!usuario) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-zinc-500">Por favor, faça login para gerenciar seus dados.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500 text-zinc-800 dark:text-zinc-300">
      <div className="bg-card border border-borda-sutil rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest w-fit mb-6">
          <ShieldAlert size={14} />
          Privacidade do Titular (Art. 18 LGPD)
        </div>
        <p className="text-sm text-secondary leading-relaxed">
          O PrintLog está em total conformidade com a Lei Geral de Proteção de Dados Pessoais. Você tem total controle sobre suas informações. Utilize as opções abaixo para gerenciar ou excluir seus dados permanentemente.
        </p>
      </div>

      <div className="relative">
        {etapa === "escolha" && (
          <div className="grid gap-4">
            <button
              onClick={lidarComExportacao}
              disabled={carregando}
              className="group relative p-6 rounded-3xl bg-card border border-borda-sutil hover:border-emerald-500/30 hover:shadow-md transition-all text-left overflow-hidden disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                  {carregando ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-primary font-bold mb-1">Direito à Portabilidade</h3>
                  <p className="text-xs text-secondary">Baixe um arquivo JSON com seus metadados de cadastro (Art. 18, V).</p>
                </div>
                <ArrowRight size={20} className="text-muted group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button
              onClick={() => setEtapa("confirmacao_exclusao")}
              className="group relative p-6 rounded-3xl bg-card border border-borda-sutil hover:border-red-500/30 hover:shadow-md transition-all text-left overflow-hidden cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                  <Trash2 size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-primary font-bold mb-1">Direito ao Esquecimento</h3>
                  <p className="text-xs text-secondary">Exclua sua conta e todos os seus dados permanentemente (Art. 18, VI).</p>
                </div>
                <ArrowRight size={20} className="text-muted group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        )}

        {etapa === "confirmacao_exclusao" && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Tem certeza absoluta?</h2>
            <p className="text-secondary text-sm mb-6 leading-relaxed">
              Esta ação é irreversível. Todas as suas impressoras, materiais, custos e projetos cadastrados serão excluídos permanentemente de nossos servidores ativos e backups em conformidade com a LGPD (Art. 18, VI).
            </p>
            <p className="text-amber-500 text-xs font-semibold mb-8 border border-amber-500/30 rounded-xl p-4 bg-amber-500/5 leading-relaxed text-left">
              ⚠️ ATENÇÃO: O PrintLog fornece a plataforma no estado em que se encontra ("as is") e não mantém backups residuais após a exclusão. A exportação e cópia de segurança de qualquer dado de negócio relevante é de sua inteira responsabilidade e deve ser efetuada ANTES desta exclusão definitiva.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={lidarComExclusao}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer text-sm"
              >
                Sim, Excluir Tudo Permanentemente
              </button>
              <button
                onClick={() => setEtapa("escolha")}
                className="w-full bg-transparent text-secondary hover:text-primary font-medium py-2 transition-colors cursor-pointer text-sm"
              >
                Cancelar e Voltar
              </button>
            </div>
          </motion.div>
        )}

        {etapa === "processando" && (
          <div className="py-20 text-center">
            <Loader2 size={48} className="mx-auto text-emerald-500 animate-spin mb-4" />
            <p className="text-secondary">Processando solicitação de exclusão...</p>
          </div>
        )}

        {etapa === "sucesso" && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-12 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Solicitação Concluída</h2>
            <p className="text-secondary text-sm mb-8">
              Seus dados foram removidos conforme solicitado. Sentiremos sua falta, maker!
            </p>
            <button
              onClick={() => window.location.href = "/"}
              className="inline-flex items-center gap-2 text-emerald-500 font-bold hover:underline cursor-pointer text-sm"
            >
              Voltar para a Home
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </div>

      <footer className="mt-16 pt-8 border-t border-borda-sutil flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          <div className="flex items-center gap-2">
            <Database size={12} className="text-emerald-500/50" />
            Base Legal: Art. 18 LGPD
          </div>
          <div className="flex items-center gap-2">
            <UserX size={12} className="text-red-500/50" />
            Eliminação de Dados Pessoais
          </div>
        </div>
        <p className="text-[10px] text-muted font-mono mt-2">
          Dúvidas ou suporte de compliance: suporte@printlog.com.br · PrintLog © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
