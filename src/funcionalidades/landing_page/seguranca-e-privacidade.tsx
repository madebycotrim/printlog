import { motion, Variants } from "framer-motion";
import { 
  Lock, 
  Fingerprint, 
  Globe, 
  UserCheck, 
  Database, 
  Trash2, 
  ArrowRight,
  ShieldAlert,
  Scale,
  Zap,
  MessageCircle,
  Heart,
  ChevronRight,
  Shield,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Página de Segurança e Privacidade - Versão 15.2 (O Guia Sincero)
 * Focada em honestidade, simplicidade e respeito ao usuário.
 * Ajuste final de consistência de ícones e animações.
 */

const surgir: Variants = {
  oculto: { opacity: 0, y: 20 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function PaginaSegurancaPrivacidade() {
  const navegar = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-sky-500/30 relative">
      
      {/* ── Background Atmosférico ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {/* ── Header Sincero ── */}
      <header className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            <Shield size={14} /> Privacidade e Respeito
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]"
          >
            A VERDADE SOBRE <br />
            <span className="text-zinc-600">SEUS DADOS.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed"
          >
            Privacidade não deveria ser um labirinto jurídico. Abaixo, explico de forma direta o que você realmente precisa saber sobre como o PrintLog funciona.
          </motion.p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-40 relative z-10 space-y-24">
        
        {/* ── Seção: Resumo do "Juridiquês" ── */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Antes de ler os documentos oficiais</h2>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[32px] bg-sky-500/5 border border-sky-500/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Scale size={20} />
              </div>
              <h4 className="text-white font-bold text-sm uppercase">Quem manda no dado?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Você. Os orçamentos, custos e projetos são seus. Eu apenas forneço a "caixa" (software) para você guardá-los e processá-los. Se você decidir sair, pode levar tudo ou apagar tudo.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-orange-500/5 border border-orange-500/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <ShieldAlert size={20} />
              </div>
              <h4 className="text-white font-bold text-sm uppercase">De quem é o risco?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog é uma ferramenta de auxílio. Os cálculos são precisos, mas a decisão final do preço de venda e o risco do seu negócio são seus. Eu não garanto lucro, eu garanto a ferramenta.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <UserCheck size={20} />
              </div>
              <h4 className="text-white font-bold text-sm uppercase">Por que coletamos?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Pela lei (LGPD), nossa base legal é a "Execução de Contrato". Ou seja, só pegamos seu nome (ou apelido) e e-mail porque sem eles você não conseguiria logar e salvar seus orçamentos. Simples assim.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bento Grid: Segurança Técnica ── */}
        <div className="grid md:grid-cols-12 gap-6">
          <motion.section 
            variants={surgir} initial="oculto" whileInView="visivel" viewport={{ once: true }}
            className="md:col-span-8 p-10 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-sky-400">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Criptografia AES-256</h3>
              <p className="text-zinc-500 leading-relaxed max-w-md">
                Seus orçamentos são protegidos por criptografia AES-256. Isso significa que eles são transformados em códigos ilegíveis no banco de dados e só o seu login consegue "desmontar" essa proteção.
              </p>
            </div>
          </motion.section>

          <motion.section 
            variants={surgir} initial="oculto" whileInView="visivel" viewport={{ once: true }}
            className="md:col-span-4 p-10 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
              <Fingerprint size={24} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Login Google</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Delego a segurança da sua senha para o Google. Assim, eu foco em fazer a melhor ferramenta de 3D e eles focam em proteger sua conta com o que há de melhor.
            </p>
          </motion.section>
        </div>

        {/* ── Seção: O que NÃO fazemos ── */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Nossa Ética na Prática</h2>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[32px] bg-zinc-900/30 border border-white/5 flex gap-6 items-start">
              <Activity className="text-zinc-600 shrink-0" size={24} />
              <div className="space-y-2">
                <h4 className="text-white font-bold text-sm">Sem Espionagem</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Eu não fico olhando quanto você fatura ou quais são seus clientes. O sistema é automatizado para você, não para mim.
                </p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-zinc-900/30 border border-white/5 flex gap-6 items-start">
              <Zap className="text-zinc-600 shrink-0" size={24} />
              <div className="space-y-2">
                <h4 className="text-white font-bold text-sm">Sem Spam ou Venda</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Seu e-mail é sagrado. Nunca vou vendê-lo para terceiros ou te encher de propagandas que você não pediu. E se você observar, o sistema nem tem anúncios; meu foco é 100% na ferramenta.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Jornada do Dado ── */}
        <motion.section 
          variants={surgir} initial="oculto" whileInView="visivel" viewport={{ once: true }}
          className="p-10 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-12"
        >
          <h3 className="text-xl font-black text-white uppercase tracking-tight text-center">O Ciclo de Vida do seu Dado</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { t: "1. Cadastro", d: "Nome/Apelido e e-mail via Google.", icon: UserCheck },
              { t: "2. Registro", d: "IP e Data criptografados com AES-GCM (Lei 12.965).", icon: Globe },
              { t: "3. Uso", d: "Orçamentos salvos só para você.", icon: Database },
              { t: "4. Purga", d: "Limpeza automática após 180 dias.", icon: Trash2 }
            ].map((step, i) => (
              <div key={i} className="space-y-3 text-center md:text-left">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sky-500 mx-auto md:mx-0">
                  <step.icon size={18} />
                </div>
                <h4 className="text-white text-[10px] font-black uppercase tracking-widest">{step.t}</h4>
                <p className="text-[9px] text-zinc-600 leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Documentos Oficiais ── */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
             <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Documentação Completa</p>
             <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">A parte jurídica, sem exageros.</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button 
              onClick={() => navegar("/politica-de-privacidade")}
              className="p-10 rounded-[40px] bg-white text-black text-left group flex flex-col justify-between h-48"
            >
              <Database size={24} />
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Política de Privacidade</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">Padrão Formal ABNT <ChevronRight size={14} /></p>
              </div>
            </button>
            
            <button 
              onClick={() => navegar("/termos-de-servico")}
              className="p-10 rounded-[40px] bg-zinc-900 border border-white/5 text-white text-left group flex flex-col justify-between h-48"
            >
              <Scale size={24} />
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Termos de Serviço</h3>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">Contrato de Licença <ChevronRight size={14} /></p>
              </div>
            </button>
          </div>
        </section>

        {/* ── Dúvidas Sinceras (FAQ) ── */}
        <section className="space-y-12">
          <div className="text-center">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Respostas Diretas</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: "O que acontece se eu apagar minha conta?", a: "Eu não fico com uma 'cópia de segurança' secreta. Seus orçamentos e dados pessoais são deletados dos nossos servidores de forma definitiva em poucos segundos. Além disso, os logs técnicos de acesso são limpos automaticamente por um robô após o prazo legal de 180 dias." },
              { q: "Onde meus dados ficam fisicamente?", a: "Eles moram nos servidores da Cloudflare e Google, geralmente nos EUA ou Europa. Eles são gigantes da tecnologia que possuem uma segurança física que eu nunca conseguiria ter sozinho." },
              { q: "Meus dados podem ser usados para IA?", a: "De forma alguma. O PrintLog não treina modelos de IA com seus custos ou projetos. Seus dados são processados apenas para te dar os resultados dos orçamentos." },
              { q: "E se você desistir do projeto?", a: "Sinceramente, pretendo manter o PrintLog por anos. Mas se um dia eu parar, avisarei a todos com antecedência para que possam exportar seus dados com calma." }
            ].map((faq, i) => (
              <div key={i} className="space-y-4 p-8 rounded-3xl bg-white/[0.01] border border-white/5">
                <MessageCircle size={18} className="text-sky-500 shrink-0" />
                <h4 className="text-white font-bold text-sm">{faq.q}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contato Direto ── */}
        <motion.section 
          variants={surgir} initial="oculto" whileInView="visivel" viewport={{ once: true }}
          className="p-16 rounded-[48px] bg-white/[0.02] border border-white/5 text-center space-y-10"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 flex items-center justify-center text-sky-400">
            <Shield size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Transparência é Tudo.</h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Se você leu até aqui, percebeu que não tem segredo. Eu cuido do código e da segurança para você cuidar das suas impressões. Se sobrar alguma dúvida, me chama.
            </p>
          </div>
          <a 
            href="mailto:privacidade@printlog.com.br"
            className="inline-flex px-10 py-5 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-sky-400 transition-all active:scale-95"
          >
            Falar comigo <ArrowRight size={14} className="inline ml-2" />
          </a>
        </motion.section>

      </main>

      <footer className="py-24 border-t border-white/5 bg-[#030303] text-center space-y-4">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
          PrintLog © 2026 // Em conformidade com a LGPD (Lei 13.709/2018). <br />
          Dados protegidos com criptografia e transparência por um desenvolvedor solo.
        </p>
        <div className="flex justify-center gap-1 text-sky-500 opacity-20">
          <Heart size={10} fill="currentColor" />
        </div>
      </footer>
    </div>
  );
}
