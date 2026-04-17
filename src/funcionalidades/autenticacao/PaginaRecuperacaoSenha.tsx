import { useState } from "react";
import { usarAutenticacao } from "./contextos/ContextoAutenticacao";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { LayoutAutenticacao } from "./componentes/LayoutAutenticacao";
import { PainelBranding } from "./componentes/PainelBranding";
import { InputAuth } from "./componentes/InputAuth";

export function PaginaRecuperacaoSenha() {
  const navegar = useNavigate();
  const { recuperarSenha } = usarAutenticacao();
  const [email, definirEmail] = useState("");
  const [erro, definirErro] = useState("");
  const [sucesso, definirSucesso] = useState(false);
  const [carregandoRecuperacao, definirCarregandoRecuperacao] = useState(false);

  const enviarLinkRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    definirErro("");

    if (!email) {
      definirErro("Por favor, informe seu email.");
      return;
    }

    if (!email.includes("@")) {
      definirErro("Informe um email válido.");
      return;
    }

    try {
      definirCarregandoRecuperacao(true);
      await recuperarSenha(email);
      definirSucesso(true);
    } catch (err: any) {
      definirErro(err.message);
    } finally {
      definirCarregandoRecuperacao(false);
    }
  };

  return (
    <LayoutAutenticacao linkVoltar="/login" textoVoltar="Voltar ao login" larguraMaxima="max-w-5xl">
      {/* ESQUERDA - BRANDING (Componente Padronizado) */}
      <PainelBranding
        largura="w-1/2"
        titulo={
          <>
            Recuperação{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#0ea5e9]">
              de Acesso.
            </span>
          </>
        }
        descricao="Não se preocupe. Acontece com os melhores makers. Vamos recuperar sua conta em instantes."
        beneficios={
          <div className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              Processo seguro e criptografado
            </span>
          </div>
        }
      />

      {/* DIREITA - FORMULÁRIO */}
      <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center relative bg-black/20">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo-colorida.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-white font-black tracking-tighter text-xl">PRINTLOG</span>
        </div>

        {!sucesso ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Esqueceu a senha?</h1>
              <p className="text-zinc-500 text-sm">Digite seu email profissional para receber o link de redefinição.</p>
            </div>

            {erro && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-pulse">
                <AlertCircle size={18} />
                {erro}
              </div>
            )}

            <form onSubmit={enviarLinkRecuperacao} className="space-y-6">
              <InputAuth
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => definirEmail(e.target.value)}
                placeholder="seu@email.com"
                icone={Mail}
              />

              <button
                type="submit"
                disabled={carregandoRecuperacao}
                className="w-full bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_-5px_rgba(14,165,233,0.4)] hover:shadow-[0_6px_25px_-5px_rgba(14,165,233,0.6)] active:transform active:scale-[0.98] flex items-center justify-center gap-2 border border-blue-400/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {carregandoRecuperacao ? (
                  <span className="animate-pulse">Enviando...</span>
                ) : (
                  <>
                    <span>Enviar Link de Recuperação</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Email Enviado!</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              Enviamos um link de recuperação para <strong>{email}</strong>.
              <br />
              Verifique sua caixa de entrada (e spam).
            </p>

            <button
              onClick={() => navegar("/login")}
              className="inline-flex items-center gap-2 text-[#0ea5e9] font-bold hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              Voltar para o Login
            </button>
          </div>
        )}
      </div>
    </LayoutAutenticacao>
  );
}
