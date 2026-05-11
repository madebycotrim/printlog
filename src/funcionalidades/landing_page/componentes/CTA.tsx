import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ChamadaAcao() {
  const navegar = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Glow de Fundo Específico do CTA */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="container relative mx-auto px-6">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Emblema */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">
              Feito por Makers, Para Makers — Junte-se à Missão
            </span>
          </motion.div>

          {/* Título */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight uppercase"
          >
            MAIS QUE UM SOFTWARE, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 italic">
              UMA MISSÃO.
            </span>
          </motion.h2>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            O PrintLog nasceu da vontade de ver a comunidade 3D brasileira crescer com dignidade. 
            Não estamos aqui pelo lucro, mas para manter este sistema vivo e ajudar você a eliminar o chutômetro.
            Junte-se a nós para manter este projeto online e evoluindo para todos.
          </motion.p>

          {/* Botão de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={() => navegar("/cadastro")}
              className="group relative px-10 py-5 bg-sky-600 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-sky-500/20 hover:bg-sky-500 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Ser um Maker Fundador
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <p className="text-sm text-sky-500 font-black uppercase tracking-[0.1em]">
              Acesso total gratuito para quem apoia o início do projeto
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
