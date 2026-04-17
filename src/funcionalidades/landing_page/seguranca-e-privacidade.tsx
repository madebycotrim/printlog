import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

const surgir = {
  oculto: { opacity: 0, y: 30 },
  visivel: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  },
};

export function SegurancaPrivacidade() {
  const navigate = useNavigate();
  const { usuario } = usarAutenticacao();

  const lidarComAcaoPrivacidade = () => {
    const destino = "/configuracoes?secao=privacidade";
    if (usuario) {
      navigate(destino);
    } else {
      navigate("/login", { state: { from: destino } });
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-300 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 10px); }
        }
        .animate-drift {
          animation: drift 10s ease-in-out infinite;
        }
      `}</style>
      {/* ── Background Effects ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050507]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        <div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse animate-drift"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse animate-drift"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 max-w-4xl space-y-24">
        {/* ── Header ── */}
        <motion.nav
          variants={surgir}
          initial="oculto"
          whileInView="visivel"
          viewport={{ once: true }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
            aria-label="Voltar ao site"
          >
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-all">
              <ArrowLeft size={14} />
            </div>
            Voltar ao site
          </button>
        </motion.nav>

        <motion.header
          variants={surgir}
          initial="oculto"
          whileInView="visivel"
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400 mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Segurança e Privacidade</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
            No PrintLog, a proteção dos seus
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
              dados é nossa prioridade.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Conheça como mantemos suas informações seguras e resguardamos sua privacidade com tecnologias de ponta e
            políticas transparentes, em total conformidade com a LGPD (Lei nº 13.709/2018).
          </p>
        </motion.header>

        {/* ── Content ── */}
        <div className="space-y-16">
          {/* 1. Seus dados pertencem a você */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm relative overflow-hidden group hover:border-sky-500/20 transition-colors"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-sky-500/10 transition-colors" />
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Icon name="lock" className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white pt-2">Seus dados pertencem a você</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Dados completamente isolados</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Cada conta possui dados separados e inacessíveis por outros usuários. Utilizamos tecnologias de
                  isolamento (<em>Row Level Security</em>) na infraestrutura da{" "}
                  <strong className="text-sky-300">Cloudflare</strong> para garantir isolamento completo.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Sem acesso administrativo</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  O responsável pelo projeto PrintLog não possui acesso aos seus relatórios, vendas, produtos ou
                  informações estratégicas do seu negócio. O acesso administrativo é restrito a metadados técnicos.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ── 2. Controlador vs Operador ── */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm hover:border-emerald-500/20 transition-colors"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Icon name="shield-check" className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nosso papel jurídico com seus dados</h2>
                <p className="text-zinc-500 text-sm mt-1">Conforme LGPD Art. 5º, VI e VII</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-sky-500/5 border border-sky-500/15">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-sky-500/20 text-sky-300 mb-3">
                  Controladora
                </span>
                <h3 className="text-white font-semibold mb-2">Dados do titular da conta</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Para <strong>seus dados de cadastro</strong> (nome, e-mail, senha), a PrintLog é a{" "}
                  <strong className="text-sky-300">Controladora</strong>. Ou seja, nós definimos as finalidades e formas
                  de tratamento dessas informações.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 mb-3">
                  Operadora
                </span>
                <h3 className="text-white font-semibold mb-2">Dados dos seus clientes</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Para dados que você insere dos <strong>seus clientes finais</strong> (pedidos, contatos), você é o{" "}
                  <strong className="text-emerald-300">Controlador</strong>. A PrintLog apenas armazena e processa a seu
                  mando — não usa esses dados para fins próprios.
                </p>
              </div>
            </div>
          </motion.section>


          {/* ── 3. Proteção Técnica ── */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">Proteção técnica</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Rede Cloudflare",
                  desc: "Infraestrutura global com criptografia de ponta a ponta (TLS 1.2+), proteção contra ataques DDoS e segurança automatizada.",
                  icon: "lock",
                },
                {
                  title: "Armazenamento Blindado",
                  desc: "Dados armazenados na infraestrutura Cloudflare com criptografia AES-256 em repouso e TLS 1.2+ em trânsito.",
                  icon: "server",
                },
                {
                  title: "Google Firebase Auth",
                  desc: "Autenticação processada pelo Google Firebase (região southamerica-east1 — São Paulo), com padrões internacionais de identidade (ISO 27001, SOC 2).",
                  icon: "shield-check",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon name={item.icon} className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 4. Retenção de dados ── */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">
              Prazos de retenção e descarte
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  prazo: "30 dias",
                  cor: "emerald",
                  dado: "Dados cadastrais e de negócio",
                  detalhe: "Excluídos até 30 dias corridos após o encerramento da conta.",
                },
                {
                  prazo: "6 meses",
                  cor: "amber",
                  dado: "Logs de acesso (IP, data/hora)",
                  detalhe: "Retenção obrigatória — Art. 15 do Marco Civil da Internet (Lei nº 12.965/2014).",
                },
                {
                  prazo: "5 anos",
                  cor: "amber",
                  dado: "Registros de aceite de termos",
                  detalhe: "Prazo prescricional civil para defesa em litígio (Art. 206 do Código Civil).",
                },
                {
                  prazo: "5 anos",
                  cor: "amber",
                  dado: "Logs de auditoria e segurança",
                  detalhe: "Prazo de segurança para análise histórica e defesa em litígio (Art. 206 CC).",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <span
                    className={`mt-0.5 shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-${item.cor}-500/10 text-${item.cor}-400 border border-${item.cor}-500/20`}
                  >
                    {item.prazo}
                  </span>
                  <div>
                    <p className="text-white text-sm font-semibold">{item.dado}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{item.detalhe}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 5. Cookies ── */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">Política de Cookies</h2>
            <div className="space-y-3">
              {[
                {
                  tipo: "Necessários (técnicos)",
                  desc: "Cookie de sessão, cookie de segurança (CSRF) e cookie de preferências (tema claro/escuro). Essenciais ao funcionamento — não requerem consentimento.",
                  cor: "emerald",
                  tag: "Sempre ativos",
                },
                {
                  tipo: "Analíticos (desempenho)",
                  desc: "Métricas de uso agregadas para melhoria da plataforma. Atualmente não utilizados. Quando implementados, serão opcionais e exigirão consentimento.",
                  cor: "zinc",
                  tag: "Opcionais",
                },
                {
                  tipo: "Rastreamento / Ads",
                  desc: "O PrintLog não utiliza cookies de rastreamento comportamental, pixels de publicidade ou fingerprinting de qualquer natureza.",
                  cor: "red",
                  tag: "Não utilizados",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <span
                    className={`mt-0.5 shrink-0 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap bg-${item.cor}-500/10 text-${item.cor}-400 border border-${item.cor}-500/20`}
                  >
                    {item.tag}
                  </span>
                  <div>
                    <p className="text-white text-sm font-semibold">{item.tipo}</p>
                    <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 6. Transferência Internacional ── */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <Icon name="globe" className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Transferência Internacional de Dados</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Fundamento legal: Art. 33, II da LGPD (Lei nº 13.709/2018)
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              A PrintLog utiliza fornecedores com certificações internacionais de segurança. O tratamento de dados em
              suas infraestruturas é regulado pelos próprios Termos de Serviço e políticas de privacidade de cada
              fornecedor, descritos abaixo.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Cloudflare */}
              <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  <h3 className="text-white font-semibold text-sm">Cloudflare, Inc. (EUA)</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Infraestrutura principal de armazenamento e CDN. Sediada nos EUA, portanto sujeita a transferência
                  internacional.
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-indigo-400 shrink-0" />
                    Termos de Serviço e políticas de segurança certificados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-indigo-400 shrink-0" />
                    Certificações ISO 27001 e SOC 2
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-indigo-400 shrink-0" />
                    Criptografia AES-256 e TLS 1.2+
                  </li>
                </ul>
              </div>

              {/* Firebase */}
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <h3 className="text-white font-semibold text-sm">Google Firebase Auth (Brasil)</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Autenticação configurada preferencialmente na região{" "}
                  <strong className="text-amber-300 font-mono text-[10px]">southamerica-east1</strong> (São Paulo). O
                  processamento primário ocorre no Brasil, mas dados podem transitar por servidores internacionais do
                  Google em situações específicas.
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-amber-400 shrink-0" />
                    Termos de Serviço e políticas de segurança certificados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-amber-400 shrink-0" />
                    Certificações ISO 27001 e SOC 2
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* ── 7. Incidentes de Segurança ── */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
            className="p-6 rounded-2xl bg-red-500/5 border border-red-500/15"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <Icon name="shield-exclamation" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Em caso de Incidente de Segurança</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                  Mantemos práticas de monitoramento contínuo da infraestrutura. Na ocorrência de uma violação de dados
                  que configure <strong className="text-white">risco relevante ao titular</strong> — conforme critérios
                  do Art. 48 da LGPD e da Resolução ANPD nº 15/2024 —, comprometemo-nos a:
                </p>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-1 rounded-full bg-red-400 shrink-0" />
                    <span>
                      Notificar a <strong className="text-white">ANPD</strong> em até 3 dias úteis após o{" "}
                      <strong className="text-white">conhecimento</strong> do incidente, conforme Art. 48, §1º da LGPD e
                      Resolução ANPD nº 15/2024.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-1 rounded-full bg-red-400 shrink-0" />
                    <span>
                      Comunicar os <strong className="text-white">usuários afetados</strong> por e-mail cadastrado e
                      notificação na plataforma, com informações claras sobre a natureza do ocorrido e as ações
                      recomendadas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-1 rounded-full bg-red-400 shrink-0" />
                    <span>
                      Manter <strong className="text-white">registro interno</strong> do incidente contendo data de
                      ocorrência, categoria dos dados envolvidos e histórico das ações adotadas.
                    </span>
                  </li>
                </ul>
                <p className="text-xs text-zinc-500 mt-4 leading-relaxed border-t border-white/5 pt-3">
                  <strong className="text-zinc-400">Nota:</strong> Nem todo evento técnico constitui um incidente
                  notificável. A obrigação de comunicação se aplica exclusivamente a violações que envolvam dados
                  pessoais com potencial de causar dano relevante ao titular — tentativas de acesso bloqueadas, falhas
                  sem exposição de dados ou eventos sem risco real não geram essa obrigação.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ── 8. Transparência ── */}
          <motion.div
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-4">Transparência</h2>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Privacidade comercial absoluta</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Seus dados pessoais e informações estratégicas nunca são vendidos, alugados ou compartilhados com
                      terceiros para fins comerciais ou publicitários.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Métricas anônimas</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Podemos utilizar métricas globais anônimas e agregadas (como número total de usuários) apenas para
                      melhoria do produto. Dados anonimizados não são dados pessoais (Art. 12, LGPD).
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Canal do DPO</h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      O Encarregado pelo Tratamento de Dados Pessoais (DPO), nos termos do Art. 41 da LGPD, é o
                      responsável pelo desenvolvimento e operação da Plataforma PrintLog, acessível pelo canal oficial.
                      Solicitações serão respondidas em até 15 (quinze) dias úteis.
                    </p>
                    <a
                      href="mailto:privacidade@printlog.com.br"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                      aria-label="Enviar e-mail para o encarregado de proteção de dados"
                    >
                      <Icon name="mail" className="w-3 h-3" />
                      privacidade@printlog.com.br
                    </a>
                  </div>
                </li>
              </ul>
            </section>

            {/* ── 9. Direitos LGPD ── */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-4">
                Direitos (LGPD Art. 18)
              </h2>
              <div className="grid gap-4">
                <button
                  onClick={lidarComAcaoPrivacidade}
                  className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-sky-500/60 hover:bg-sky-500/5 transition-all group text-left w-full cursor-pointer"
                  aria-label="Ir para configurações para exportar meus dados"
                >
                  <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2 group-hover:text-sky-400 transition-colors">
                    <Icon name="download" className="w-4 h-4 text-zinc-400 group-hover:text-sky-400" />
                    Exportar meus dados
                  </h4>
                  <p className="text-zinc-500 text-xs">
                    Portabilidade dos seus dados em formato estruturado (JSON/CSV) — Art. 18, V da LGPD. Acesse as
                    configurações da conta para solicitar.
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-sky-400">
                    Ir para Configurações →
                  </span>
                </button>

                <button
                  onClick={lidarComAcaoPrivacidade}
                  className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 transition-all group text-left w-full cursor-pointer"
                  aria-label="Ir para configurações para excluir minha conta"
                >
                  <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                    <Icon name="trash" className="w-4 h-4 text-zinc-400 group-hover:text-red-400" />
                    Excluir minha conta
                  </h4>
                  <p className="text-zinc-500 text-xs">
                    Eliminação total dos seus dados pessoais — Art. 18, VI da LGPD. Após a exclusão, seus dados pessoais
                    são removidos em até 30 dias, salvo retenções legais obrigatórias.
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-red-400">
                    Ir para Configurações →
                  </span>
                </button>
              </div>
            </section>
          </motion.div>

          {/* ── 10. Em breve: 2FA ── */}
          <motion.section
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true, amount: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-8"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Icon name="finger-print" className="w-8 h-8" />
              </div>
              <div className="text-center md:text-left">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-500 text-white mb-2">
                  Em breve
                </span>
                <h3 className="text-xl font-bold text-white mb-2">Autenticação em Dois Fatores (2FA)</h3>
                <p className="text-zinc-400 text-sm max-w-xl">
                  Estamos desenvolvendo a autenticação em dois fatores para adicionar uma camada extra de segurança à
                  sua conta. Você poderá utilizar aplicativos como Google Authenticator ou receber código por e-mail.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ── Footer Links ── */}
          <motion.footer
            variants={surgir}
            initial="oculto"
            whileInView="visivel"
            viewport={{ once: true }}
            className="border-t border-white/5 pt-10 mt-10 text-center"
          >
            <p className="text-xs text-zinc-600 mb-6">Documentos legais completos:</p>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a
                href="/politica-de-privacidade"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Política de Privacidade
              </a>
              <span className="text-zinc-800">•</span>
              <a href="/termos-de-uso" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Termos de Uso
              </a>
            </div>
            <p className="text-xs text-zinc-600">
              © 2026 PrintLog. Todos os direitos reservados. — Conformidade LGPD (Lei nº 13.709/2018)
            </p>
          </motion.footer>
        </div>
      </div>
    </div>
  );
}

function Icon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactElement> = {
    lock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ),
    server: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    ),
    "shield-check": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    "shield-exclamation": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
      />
    ),
    globe: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    download: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    ),
    trash: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    ),
    "eye-off": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
      />
    ),
    "finger-print": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
      />
    ),
    mail: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name] || null}
    </svg>
  );
}
