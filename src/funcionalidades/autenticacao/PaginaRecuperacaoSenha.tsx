import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { LayoutAutenticacao } from "./componentes/LayoutAutenticacao";
import { PainelBranding } from "./componentes/PainelBranding";

export function PaginaRecuperacaoSenha() {
  const navegar = useNavigate();

  return (
    <LayoutAutenticacao linkVoltar="/login" textoVoltar="Voltar ao login" larguraMaxima="max-w-5xl">
      <PainelBranding
        largura="w-1/2"
        titulo={
          <>
            Acesso Secundário{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#0ea5e9]">
              de Contas.
            </span>
          </>
        }
        descricao="Segurança máxima. O PrintLog adota governança de risco zero e delega o gerenciamento de acesso ao Google."
        beneficios={
          <div className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              Processo seguro via Google OAuth
            </span>
          </div>
        }
      />

      <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center relative bg-black/20 text-center">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo-azul.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-white font-black tracking-tighter text-xl">PRINTLOG</span>
        </div>

        <div className="py-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
            <CheckCircle2 size={40} className="text-[#0ea5e9]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Autenticação Delegada</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            O PrintLog não gerencia ou armazena senhas localmente. Para gerenciar a recuperação ou credenciais da sua conta, acesse as configurações de segurança da sua conta Google.
          </p>

          <button
            onClick={() => navegar("/login")}
            className="inline-flex items-center gap-2 text-[#0ea5e9] font-bold hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar para o Login do Google
          </button>
        </div>
      </div>
    </LayoutAutenticacao>
  );
}
