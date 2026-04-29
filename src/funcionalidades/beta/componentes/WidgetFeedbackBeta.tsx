import { MessageCircle, X, Send, Beaker } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { toast } from "react-hot-toast";

/**
 * Widget flutuante de feedback para usuários do Programa Beta.
 */
export function WidgetFeedbackBeta() {
  const { participarPrototipos } = usarBeta();
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Se não estiver participando do Beta, o widget não aparece
  if (!participarPrototipos) return null;

  const enviarFeedback = async () => {
    if (!mensagem.trim()) return;
    
    setEnviando(true);
    // Simula envio para API
    setTimeout(() => {
      toast.success("Feedback enviado para o Lab! 🚀");
      setMensagem("");
      setAberto(false);
      setEnviando(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Beaker size={10} /> Lab Feedback
                </div>
              </div>
              <button 
                onClick={() => setAberto(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <h4 className="text-sm font-black text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">Viu algo legal ou um bug?</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4">Sua opinião molda o futuro do PrintLog.</p>

            <textarea 
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva sua experiência..."
              className="w-full h-24 p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500/50 outline-none transition-all resize-none mb-4"
            />

            <button 
              onClick={enviarFeedback}
              disabled={enviando || !mensagem.trim()}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar para o Time Beta"}
              <Send size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAberto(!aberto)}
        className="w-14 h-14 rounded-full bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center pointer-events-auto relative group"
      >
        <MessageCircle size={24} className={`transition-transform duration-500 ${aberto ? "rotate-90 scale-0" : ""}`} />
        <X size={24} className={`absolute transition-transform duration-500 ${aberto ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`} />
        
        {/* Notificação Pulsante */}
        {!aberto && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950 animate-bounce" />
        )}
      </motion.button>
    </div>
  );
}
