import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const planos = [
  {
    nome: "Gratuito",
    preco: "R$ 0",
    periodo: "sempre",
    descricao: "Ideal para hobbistas e quem está começando agora.",
    recursos: [
      "Calculadora Técnica de Custos",
      "Gestão de Materiais e Insumos",
      "Métricas Básicas de Lucratividade",
      "Gráfico de Pizza (Custos 360º)",
      "Exportação de Orçamentos Simples",
      "Acesso à Central Maker",
    ],
    destaque: false,
    botao: "Começar Agora",
  },
  {
    nome: "Membro Fundador PRO",
    precoOriginal: "R$ 29,90",
    preco: "R$ 0",
    periodo: "tempo limitado",
    descricao: "Para profissionais que querem escalar seu estúdio 3D.",
    recursos: [
      "Tudo do plano Gratuito",
      "Sugestões de Preço via IA (Llama 3)",
      "Insights de Mercado e Dicas da IA",
      "Identidade Visual do seu Estúdio",
      "Orçamentos Profissionais Personalizados",
      "Selo Exclusivo de Membro Fundador",
      "Suporte Prioritário",
    ],
    destaque: true,
    botao: "Garantir Vaga Pro",
  },
];

export function Precificacao() {
  const navegar = useNavigate();
  return (
    <section id="planos" className="py-24 relative overflow-hidden bg-[#050505]">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Zap size={12} />
            Evolução Constante
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tighter mb-6"
          >
            Escolha o Plano Ideal para seu <span className="text-sky-500">Sucesso</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 max-w-2xl text-lg"
          >
            Comece grátis e evolua conforme seu estúdio cresce. Aproveite nossa oferta histórica de lançamento para o plano PRO.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {planos.map((plano, index) => (
            <motion.div
              key={plano.nome}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-10 rounded-2xl border transition-all duration-500 relative flex flex-col h-full bg-zinc-900/50 backdrop-blur-sm ${
                plano.destaque
                  ? "border-sky-500/30 shadow-[0_20px_50px_rgba(14,165,233,0.15)] bg-gradient-to-br from-zinc-900 to-blue-950/30"
                  : "border-white/5 hover:border-sky-500/20"
              }`}
            >
              {plano.destaque && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg">
                  Oferta de Lançamento
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black uppercase tracking-widest">{plano.nome}</h3>
                  {plano.destaque && <Crown className="text-sky-400" size={18} />}
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{plano.descricao}</p>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter">{plano.preco}</span>
                  <span className="text-zinc-500 text-sm uppercase font-bold tracking-widest">/ {plano.periodo}</span>
                </div>
                {plano.precoOriginal && (
                  <span className="text-zinc-600 text-sm line-through block mt-1 font-bold">de {plano.precoOriginal}</span>
                )}
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plano.recursos.map((recurso) => (
                  <div key={recurso} className="flex items-start gap-3 group">
                    <div className={`mt-1 p-0.5 rounded-full bg-sky-500/20 text-sky-500`}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-sm text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors uppercase tracking-tight">
                      {recurso}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navegar("/cadastro")}
                className={`w-full h-16 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  plano.destaque
                    ? "bg-sky-500 text-white hover:bg-sky-400 shadow-xl shadow-sky-500/20"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {plano.destaque && <Sparkles size={16} />}
                {plano.botao}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.5 }}
           className="mt-16 text-center"
        >
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
            * Plano 100% OFF válido para os primeiros 500 membros fundadores.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
