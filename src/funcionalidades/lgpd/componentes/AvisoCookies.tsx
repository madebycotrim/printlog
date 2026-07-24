import { useState, useEffect } from "react";
import { X, ShieldCheck, Check, Loader2, Shield, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { armazenamentoSeguro } from "@/compartilhado/utilitarios/armazenamento-seguro";
import { toast } from "sonner";

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

  const aceitarConsentimento = () => {
    setCarregando(true);
    
    const escolhas = {
      tipo: "TUDO",
      essenciais: true,
      funcionais: true,
      analiticos: true,
      recusado: false,
      data: new Date().toISOString(),
      versao: "2026-05-14"
    };

    setTimeout(() => {
      armazenamentoSeguro.definir("printlog_consentimento_cookies", escolhas);
      document.cookie = "printlog_consentimento=aceito; path=/; max-age=31536000; SameSite=Lax";
      
      setVisivel(false);
      setCarregando(false);
      window.dispatchEvent(new Event("cookies_aceitos_essenciais"));
      toast.success("Preferências salvas com sucesso! 🚀", {
        icon: "🛡️"
      });
    }, 800);
  };

  const recusarConsentimento = () => {
    setCarregando(true);
    
    const escolhas = {
      tipo: "ESSENCIAIS",
      essenciais: true,
      funcionais: false,
      analiticos: false,
      recusado: true,
      data: new Date().toISOString(),
      versao: "2026-05-14"
    };

    setTimeout(() => {
      // Limpa dados de preferência locais
      const chavesPreferencias = ["printlog_tema", "printlog_perfil_ativo", "printlog_config_ui", "printlog_ultima_impressora", "printlog_anos_vida_util"];
      chavesPreferencias.forEach(k => armazenamentoSeguro.remover(k));

      armazenamentoSeguro.definir("printlog_consentimento_cookies", escolhas);
      document.cookie = "printlog_consentimento=recusado; path=/; max-age=31536000; SameSite=Lax";
      
      setVisivel(false);
      setCarregando(false);
      toast.error("Preferências de tema e impressora não serão salvas para respeitar sua privacidade.", {
        duration: 5000,
        icon: "🛡️"
      });
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

              <div className="flex flex-col gap-2">
                <button
                  onClick={aceitarConsentimento}
                  disabled={carregando}
                  className="w-full h-11 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-sky-50 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {carregando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={14} strokeWidth={3} /> 
                      Aceitar Preferências
                    </>
                  )}
                </button>
                
                <button
                  onClick={recusarConsentimento}
                  disabled={carregando}
                  className="w-full h-11 bg-transparent hover:bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {carregando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Ban size={14} /> 
                      Recusar Preferências
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-4 text-center flex flex-col gap-1">
                <Link to="/politica-de-privacidade" className="text-[10px] text-zinc-600 hover:text-zinc-400 underline underline-offset-4">
                  Saber mais sobre nossa política de dados
                </Link>
                <Link to="/politica-de-cookies" className="text-[10px] text-zinc-600 hover:text-zinc-400 underline underline-offset-4">
                  Nossa Política de Cookies
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
