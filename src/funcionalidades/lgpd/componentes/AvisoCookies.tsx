import { useState, useEffect } from "react";
import { Cookie, X, ShieldCheck, Settings, Check, Loader2, ArrowLeft, Shield, BarChart3, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Componente de Consentimento de Cookies (Banner LGPD).
 * Conforme Art. 7º, I da LGPD (Consentimento) e Guias da ANPD.
 * Focado em Linguagem Simples (Plain Language) para total compreensão do usuário.
 */
export function AvisoCookies() {
  const [visivel, setVisivel] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState<"banner" | "configurar">("banner");
  
  // Estados de consentimento detalhado
  const [analiticos, setAnaliticos] = useState(true);
  const [funcionais, setFuncionais] = useState(true);

  useEffect(() => {
    const consentimento = localStorage.getItem("printlog_consentimento_cookies");
    if (!consentimento) {
      const timer = setTimeout(() => setVisivel(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const salvarConsentimento = (tipo: "TUDO" | "ESSENCIAIS" | "CUSTOM") => {
    setCarregando(true);
    
    const escolhas = {
      tipo,
      essenciais: true,
      analiticos: tipo === "TUDO" ? true : tipo === "ESSENCIAIS" ? false : analiticos,
      funcionais: tipo === "TUDO" ? true : tipo === "ESSENCIAIS" ? false : funcionais,
      data: new Date().toISOString(),
      versao: "2026-05-14"
    };

    console.info(`[LGPD] Consentimento registrado:`, escolhas);
    
    setTimeout(() => {
      localStorage.setItem("printlog_consentimento_cookies", JSON.stringify(escolhas));
      setVisivel(false);
      setCarregando(false);
      
      if (escolhas.analiticos || escolhas.tipo === "TUDO") {
        window.dispatchEvent(new Event("cookies_aceitos_todos"));
      }
    }, 800);
  };

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[460px] z-[9999]"
        >
          <div className="relative overflow-hidden bg-[#0a0a0a]/98 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/50">
            {/* Efeito de luz sutil conforme modo */}
            <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent ${modo === 'banner' ? 'via-amber-500/50' : 'via-violet-500/50'} to-transparent transition-colors duration-500`} />
            
            <div className="p-7">
              {modo === "banner" ? (
                <>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                        <Cookie size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base leading-tight">Privacidade & Cookies</h3>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                          <ShieldCheck size={10} />
                          Conformidade ANPD
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
                    Utilizamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo conforme nossa <Link to="/politica-de-privacidade" className="text-amber-500 hover:underline font-medium">Política de Privacidade</Link>.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => salvarConsentimento("TUDO")}
                      disabled={carregando}
                      className="w-full h-12 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {carregando ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} strokeWidth={3} /> Aceitar Todos</>}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => salvarConsentimento("ESSENCIAIS")}
                        disabled={carregando}
                        className="h-11 bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-zinc-800 hover:text-white transition-all border border-white/5"
                      >
                        Apenas Essenciais
                      </button>
                      <button
                        onClick={() => setModo("configurar")}
                        className="h-11 bg-zinc-900 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-zinc-800 hover:text-white transition-all border border-white/5 flex items-center justify-center gap-2"
                      >
                        <Settings size={14} />
                        Configurar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <button 
                    onClick={() => setModo("banner")}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest mb-4 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Voltar
                  </button>

                  <h3 className="text-white font-bold text-lg mb-4">Como usamos seus dados?</h3>

                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Essenciais - Âmbar */}
                    <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-amber-500">
                          <Shield size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Essenciais</span>
                        </div>
                        <span className="text-[9px] font-black bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase">Obrigatório</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        São essenciais para o site funcionar. Eles garantem que seu login seja seguro e que suas impressoras e projetos fiquem protegidos. Sem eles, o site não abre.
                      </p>
                    </div>

                    {/* Analíticos - Blue */}
                    <div className="p-4 rounded-2xl bg-sky-500/[0.03] border border-sky-500/10 hover:border-sky-500/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sky-500">
                          <BarChart3 size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Analíticos</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={analiticos} 
                            onChange={(e) => setAnaliticos(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sky-600"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Eles nos mostram quais botões são mais clicados e quais partes do site são mais lentas. Isso nos ajuda a melhorar a ferramenta para você, sem te identificar pessoalmente.
                      </p>
                    </div>

                    {/* Funcionais - Violet */}
                    <div className="p-4 rounded-2xl bg-violet-500/[0.03] border border-violet-500/10 hover:border-sky-500/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-violet-500">
                          <Globe size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Preferências</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={funcionais} 
                            onChange={(e) => setFuncionais(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Lembram suas preferências, como o Modo Escuro ou a ordem da sua lista de pedidos. Assim, você não precisa configurar tudo de novo toda vez que entrar.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => salvarConsentimento("CUSTOM")}
                    disabled={carregando}
                    className="w-full h-11 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
                  >
                    {carregando ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Confirmar Minhas Escolhas"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AvisoCookies;
