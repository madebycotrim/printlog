import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle2, Github, Mail, ArrowRight } from "lucide-react";
import { LayoutAutenticacao } from "./componentes/LayoutAutenticacao";
import { PainelBranding } from "./componentes/PainelBranding";
import { useAutenticacao } from "./contextos/ContextoAutenticacao";
import { Carregamento } from "@/compartilhado/componentes";

export function PaginaAcesso() {
  const navegar = useNavigate();
  const localizacao = useLocation();
  const { loginGoogle, loginGithub, enviarLinkMagicoLogin, usuario, carregando } = useAutenticacao();
  const [erro, definirErro] = useState<string | null>(null);
  
  // States do Magic Link
  const [email, definirEmail] = useState("");
  const [carregandoMagic, definirCarregandoMagic] = useState(false);
  const [enviado, definirEnviado] = useState(false);

  const deOndeVimOriginal = (localizacao.state as any)?.from || "/dashboard";
  const deOndeVim = deOndeVimOriginal === "/" ? "/dashboard" : deOndeVimOriginal;

  useEffect(() => {
    if (!carregando && usuario) {
      navegar(deOndeVim, { replace: true });
    }
  }, [usuario, carregando, navegar, deOndeVim]);

  const entrarComGoogle = async () => {
    try {
      await loginGoogle();
    } catch (err: any) {
      definirErro(err.message);
    }
  };

  const entrarComGithub = async () => {
    try {
      await loginGithub();
    } catch (err: any) {
      definirErro(err.message);
    }
  };

  const lidarComLinkMagico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    definirCarregandoMagic(true);
    definirErro(null);
    try {
      await enviarLinkMagicoLogin(email);
      definirEnviado(true);
    } catch (err: any) {
      definirErro(err.message);
    } finally {
      definirCarregandoMagic(false);
    }
  };

  if (carregando || usuario) {
    return (
      <LayoutAutenticacao variante="sky">
        <div className="w-full min-h-[450px] flex items-center justify-center">
          <Carregamento texto="Preparando sua Farm..." tipo="ponto" />
        </div>
      </LayoutAutenticacao>
    );
  }

  return (
    <LayoutAutenticacao variante="sky">
      <PainelBranding
        titulo={
          <>
            Sua Farm,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-emerald-400">
              Lucro Real.
            </span>
          </>
        }
        descricao="Controle total sobre custos, materiais e produção. Deixe o PrintLog calcular enquanto você cria."
        beneficios={
          <>
            <div className="flex items-center gap-3 group">
              <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Precificação automática em segundos
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-1.5 rounded-full bg-blue-500/10 border border-blue-500/10 group-hover:border-blue-500/30 transition-all">
                <CheckCircle2 size={16} className="text-blue-500" />
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Gestão inteligente de filamentos
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-1.5 rounded-full bg-purple-500/10 border border-purple-500/10 group-hover:border-purple-500/30 transition-all">
                <CheckCircle2 size={16} className="text-purple-500" />
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Dashboard de performance financeira
              </span>
            </div>
          </>
        }
      />

      <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center relative bg-black/20">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo-azul.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-white font-black tracking-tighter text-xl">PRINTLOG</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Acesse ou Crie sua conta</h2>
          <p className="text-zinc-400 text-sm">O PrintLog utiliza a autenticação segura do Google e GitHub para login ou cadastro simplificado em poucos cliques.</p>
        </div>

        {erro && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-pulse shadow-lg shadow-red-500/5">
            <AlertCircle size={18} />
            {erro}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={entrarComGoogle}
            className="w-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm backdrop-blur-sm shadow-[0_4px_20px_-5px_rgba(255,255,255,0.05)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar com Google
          </button>

          <button
            type="button"
            onClick={entrarComGithub}
            className="w-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm backdrop-blur-sm shadow-[0_4px_20px_-5px_rgba(255,255,255,0.05)]"
          >
            <Github size={18} />
            Continuar com GitHub
          </button>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-white/5"></div>
            <span className="px-3 text-xs text-zinc-500 font-medium">ou</span>
            <div className="flex-1 border-t border-white/5"></div>
          </div>

          {!enviado ? (
            <form onSubmit={lidarComLinkMagico} className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => definirEmail(e.target.value)}
                  placeholder="Seu melhor e-mail corporativo"
                  className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all placeholder:text-zinc-600"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={carregandoMagic}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#0ea5e9]/20"
              >
                {carregandoMagic ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Continuar com E-mail
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center animate-in fade-in zoom-in duration-300">
              <Mail size={32} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Verifique seu E-mail</h3>
              <p className="text-sm text-zinc-400">
                Enviamos um link mágico seguro para <br/>
                <strong className="text-zinc-200">{email}</strong>
              </p>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
          Ao continuar, você concorda com nossos{" "}
          <a href="/termos-de-servico" className="text-[#0ea5e9] hover:underline">
            Termos de Serviço
          </a>{" "}
          e com a{" "}
          <a href="/politica-de-privacidade" className="text-[#0ea5e9] hover:underline">
            Política de Privacidade
          </a>{" "}
          em conformidade com a LGPD (Art. 7º, V).
        </p>
      </div>
    </LayoutAutenticacao>
  );
}
