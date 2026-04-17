import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ChamadaAcao() {
  const navegar = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Efeitos de Fundo */}
      <div className="absolute inset-0 bg-[#050507]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050507] to-[#050507]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse delay-1000" />
        </div>
      </div>

      {/* ── Grade Animada (Sobrepondo efeitos) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(14,165,233,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(14,165,233,.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "movimentoGrade 20s linear infinite",
          zIndex: 1,
        }}
      />
      <style>{`
                @keyframes movimentoGrade {
                    from { background-position: 0 0; }
                    to   { background-position: 40px 40px; }
                }
            `}</style>

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
              Comece Hoje — É Grátis
            </span>
          </motion.div>

          {/* Título */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
          >
            PRONTO PARA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              LUCRAR DE VERDADE?
            </span>
          </motion.h2>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Feito para makers e farms que querem otimizar sua
            precificação e aumentar seus lucros.
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
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <p className="text-sm text-zinc-500 font-medium">
              Sem cartão de crédito. Sem compromisso.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
