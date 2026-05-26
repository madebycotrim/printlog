import { useState, useEffect } from "react";
import { useAutenticacao } from "./contextos/ContextoAutenticacao";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { LayoutAutenticacao } from "./componentes/LayoutAutenticacao";
import { PainelBranding } from "./componentes/PainelBranding";
import { Carregamento } from "@/compartilhado/componentes";

export function PaginaCadastro() {
  const navegar = useNavigate();
  const { loginGoogle, usuario, carregando } = useAutenticacao();
  const [aceiteTermos, definirAceiteTermos] = useState(false);
  const [erro, definirErro] = useState("");

  useEffect(() => {
    if (!carregando && usuario) {
      navegar("/dashboard");
    }
  }, [usuario, carregando, navegar]);

  const entrarComGoogle = async () => {
    if (!aceiteTermos) {
      definirErro("Você deve aceitar os termos de serviço e a política de privacidade para continuar.");
      return;
    }
    try {
      await loginGoogle();
    } catch (err: any) {
      definirErro(err.message);
    }
  };

  if (carregando || usuario) {
    return (
      <LayoutAutenticacao variante="emerald">
        <div className="w-full min-h-[450px] flex items-center justify-center">
          <Carregamento texto="Preparando sua Farm..." tipo="ponto" />
        </div>
      </LayoutAutenticacao>
    );
  }

  return (
    <LayoutAutenticacao variante="emerald">
      <PainelBranding
        fundoEfeito="emerald"
        titulo={
          <>
            Junte-se à Comunidade
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#0ea5e9]">
              dos Makers.
            </span>
          </>
        }
        descricao="Comece hoje a profissionalizar sua gestão. O PrintLog é a ferramenta que faltava na sua bancada."
        beneficios={
          <>
            <div className="flex items-center gap-3 group">
              <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Segurança total dos seus dados
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-1.5 rounded-full bg-blue-500/10 border border-blue-500/10 group-hover:border-blue-500/30 transition-all">
                <CheckCircle2 size={16} className="text-blue-500" />
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Acesso imediato a todas as ferramentas
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-1.5 rounded-full bg-purple-500/10 border border-purple-500/10 group-hover:border-purple-500/30 transition-all">
                <CheckCircle2 size={16} className="text-purple-500" />
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Suporte exclusivo na comunidade
              </span>
            </div>
          </>
        }
      />

      <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center relative bg-black/20">
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <img src="/logo-azul.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-white font-black tracking-tighter text-xl">PRINTLOG</span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Crie sua conta grátis</h2>
          <p className="text-zinc-400 text-sm">O PrintLog realiza o cadastro seguro utilizando a sua conta Google.</p>
        </div>

        {erro && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-pulse shadow-lg shadow-red-500/5">
            <AlertCircle size={18} />
            {erro}
          </div>
        )}

        <div className="space-y-6">
          {/* Termos de Uso (Checkbox) */}
          <div className="flex items-start gap-3">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="termos"
                checked={aceiteTermos}
                onChange={(e) => {
                  definirAceiteTermos(e.target.checked);
                  if (e.target.checked) definirErro("");
                }}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-700 bg-zinc-900/50 transition-all checked:border-[#0ea5e9] checked:bg-[#0ea5e9]"
              />
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <label htmlFor="termos" className="text-sm text-zinc-400 cursor-pointer select-none leading-tight">
              Concordo com os{" "}
              <a href="/termos-de-servico" className="text-[#0ea5e9] hover:underline">
                Termos de Serviço
              </a>{" "}
              e a{" "}
              <a href="/politica-de-privacidade" className="text-[#0ea5e9] hover:underline">
                Política de Privacidade
              </a>{" "}
              e dou consentimento para o tratamento seguro de meus dados de acesso. (LGPD Art. 7º, I)
            </label>
          </div>

          <button
            type="button"
            onClick={entrarComGoogle}
            disabled={!aceiteTermos}
            className="w-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm backdrop-blur-sm shadow-[0_4px_20px_-5px_rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed"
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
            Cadastrar com Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Já tem uma conta?{" "}
          <a href="/login" className="font-bold text-[#0ea5e9] hover:underline hover:text-[#0284c7]">
            Acessar conta
          </a>
        </p>
      </div>
    </LayoutAutenticacao>
  );
}
