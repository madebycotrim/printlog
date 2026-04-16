import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { LayoutAutenticacao } from "./componentes/LayoutAutenticacao";
import { PainelBranding } from "./componentes/PainelBranding";
import { InputAuth } from "./componentes/InputAuth";
import { usarAutenticacao } from "./contextos/ContextoAutenticacao";
import { ComponenteTurnstile } from "./componentes/ComponenteTurnstile";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";

export function PaginaAcesso() {
  const navegar = useNavigate();
  const localizacao = useLocation();
  const { login, loginGoogle, usuario, carregando } = usarAutenticacao();
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [erro, definirErro] = useState("");
  const [carregandoLogin, definirCarregandoLogin] = useState(false);
  const [tokenCaptcha, definirTokenCaptcha] = useState<string | null>(null);

  // Se viermos da Home ("/") ou não houver estado, o padrão é sempre o Dashboard.
  // Isso evita que o login redirecione para a Landing Page indesejadamente.
  const deOndeVimOriginal = (localizacao.state as any)?.from || "/dashboard";
  const deOndeVim = deOndeVimOriginal === "/" ? "/dashboard" : deOndeVimOriginal;

  useEffect(() => {
    if (!carregando && usuario) {
      navegar(deOndeVim, { replace: true });
    }
  }, [usuario, carregando, navegar, deOndeVim]);

  const realizarAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    definirErro("");

    if (!email || !senha) {
      definirErro("Por favor, preencha todos os campos.");
      return;
    }

    if (!tokenCaptcha) {
      definirErro("Por favor, resolva o desafio de segurança.");
      return;
    }

    try {
      definirCarregandoLogin(true);
      await login(email, senha);
      // O useEffect acima cuidará do redirecionamento assim que o usuário for detectado
    } catch (err: any) {
      definirErro(err.message);
    } finally {
      definirCarregandoLogin(false);
    }
  };

  const entrarComGoogle = async () => {
    try {
      await loginGoogle();
      // O useEffect acima cuidará do redirecionamento
    } catch (err: any) {
      definirErro(err.message);
    }
  };



  if (carregando || usuario) {
    return <Carregamento texto="Preparando sua Farm..." />;
  }

  return (
    <LayoutAutenticacao variante="sky">
      {/* ESQUERDA - BRANDING (Componente Padronizado) */}
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

      {/* DIREITA - LOGIN FORM (DARK) */}
      <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center relative bg-black/20">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo-colorida.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-white font-black tracking-tighter text-xl">PRINTLOG</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Acesse sua conta</h2>
          <p className="text-zinc-500 text-sm">Bem-vindo de volta! Insira seus dados para continuar.</p>
        </div>

        {erro && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-pulse shadow-lg shadow-red-500/5">
            <AlertCircle size={18} />
            {erro}
          </div>
        )}

        <form onSubmit={realizarAcesso} className="space-y-5">
          <InputAuth
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => definirEmail(e.target.value)}
            placeholder="seu@email.com"
            icone={Mail}
          />

          <InputAuth
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => definirSenha(e.target.value)}
            placeholder="••••••••"
            icone={Lock}
            labelDireita={
              <a
                href="/recuperar-senha"
                className="text-xs font-medium text-[#0ea5e9] hover:text-[#0284c7] hover:underline transition-colors"
              >
                Esqueceu a senha?
              </a>
            }
          />

          <ComponenteTurnstile aoValidar={definirTokenCaptcha} aoExpirar={() => definirTokenCaptcha(null)} />

          <button
            type="submit"
            disabled={carregandoLogin || !tokenCaptcha}
            className="w-full bg-gradient-to-r from-[#0ea5e9] to-blue-600 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_-5px_rgba(14,165,233,0.4)] hover:shadow-[0_6px_25px_-5px_rgba(14,165,233,0.6)] active:transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 border border-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregandoLogin ? (
              <span className="animate-pulse">Entrando...</span>
            ) : (
              <>
                <span>Acessar Minha Conta</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider & Social */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-transparent text-zinc-600 font-medium uppercase tracking-wider backdrop-blur-xl">
              ou
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={entrarComGoogle}
          className="w-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-sm backdrop-blur-sm"
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
          Entrar com Google
        </button>


        <p className="mt-8 text-center text-sm text-zinc-500">
          Não tem uma conta?{" "}
          <a href="/cadastro" className="font-bold text-[#0ea5e9] hover:underline hover:text-[#0284c7]">
            Cadastre-se grátis
          </a>
        </p>
      </div>
    </LayoutAutenticacao>
  );
}
