import { useState, useEffect } from "react";
import { X, ShieldCheck, Check, Loader2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { armazenamentoSeguro } from "@/compartilhado/utilitarios/armazenamento-seguro";

/**
 * Componente de Consentimento de Cookies (Banner LGPD).
 * Conforme Art. 7º, I da LGPD (Consentimento) e Guias da ANPD.
 * Focado em Linguagem Simples (Plain Language) para total compreensão do usuário.
 */
export function AvisoCookies() {
  const [visivel, setVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const consentimento = armazenamentoSeguro.obter("printlog_consentimento_cookies", null);
    if (!consentimento) {
      const timer = setTimeout(() => setVisivel(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const salvarConsentimento = () => {
    setCarregando(true);
    
    const escolhas = {
      tipo: "ESSENCIAIS",
      essenciais: true,
      data: new Date().toISOString(),
      versao: "2026-05-14"
    };

    setTimeout(() => {
      // Salva no localStorage para o frontend
      armazenamentoSeguro.definir("printlog_consentimento_cookies", escolhas);
      
      // Salva em Cookie para o backend (Middleware)
      // Expira em 1 ano
      document.cookie = "printlog_consentimento=aceito; path=/; max-age=31536000; SameSite=Lax";
      
      setVisivel(false);
      setCarregando(false);
      window.dispatchEvent(new Event("cookies_aceitos_essenciais"));
    }, 800);
  };

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] z-[9999]"
        >
          <div className="relative overflow-hidden bg-[#0a0a0a]/98 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
            
            <div className="p-7">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight">Privacidade Essencial</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-sky-500 uppercase tracking-widest mt-0.5">
                      <ShieldCheck size={10} />
                      Conformidade Legal
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setVisivel(false)}
                  className="p-2 text-zinc-600 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                O PrintLog utiliza apenas cookies <strong>estritamente necessários</strong> para autenticação, segurança e para lembrar suas preferências (como tema e impressora). Armazenamos seu IP apenas pelo prazo legal de 180 dias, conforme exigido pelo Marco Civil da Internet.
              </p>

              <button
                onClick={salvarConsentimento}
                disabled={carregando}
                className="w-full h-12 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-sky-50 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {carregando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Check size={14} strokeWidth={3} /> 
                    Entendido
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/politica-de-privacidade" className="text-[10px] text-zinc-600 hover:text-zinc-400 underline underline-offset-4">
                  Saber mais sobre nossa política de dados
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AvisoCookies;
