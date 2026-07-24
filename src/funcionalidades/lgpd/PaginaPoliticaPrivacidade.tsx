import { useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Política de Privacidade - SaaS PrintLog
 * Otimizada para conversão, transparência LGPD e baixa manutenção (Dev Solo)
 */
export default function PaginaPoliticaPrivacidade() {
  const navegar = useNavigate();
  
  // Injeção de metatag robots: noindex para evitar punição de conteúdo duplicado no Google
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Automatiza a formatação da data para o padrão local (ex: "25 de maio de 2026")
  const dataAtualizacao = new Intl.DateTimeFormat('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date('2026-05-25'));

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-12 px-4 font-serif selection:bg-sky-500/30 relative overflow-x-hidden">
      
      {/* Premium Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%)'
        }}
      />

      <div className="relative z-10">
        {/* Botão de Retorno */}
      <div className="max-w-[210mm] mx-auto mb-8 no-print">
        <button
          onClick={() => navegar(-1)}
          className="flex items-center gap-2 text-zinc-600 hover:text-sky-600 transition-all font-sans text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Voltar ao Sistema
        </button>
      </div>

      {/* Documento Estilo A4 */}
      <article className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] p-[20mm] md:p-[30mm] text-zinc-800 leading-relaxed text-justify relative overflow-hidden">
        
        {/* Selo de Autenticidade (Marca d'água discreta) */}
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none text-zinc-900">
          <Shield size={200} />
        </div>

        <header className="mb-12 border-b-2 border-zinc-100 pb-8">
          <h1 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tight">
            Política de Privacidade
          </h1>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            Documento Ref: PL-PRIV-2026-V3 · Vigência: {dataAtualizacao}
          </p>
        </header>

        <section className="space-y-8 text-sm">
          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">1. Introdução</h2>
            <p className="mb-4">
              Esta Política de Privacidade descreve como o <strong>PrintLog</strong>, uma plataforma SaaS (Software as a Service) de gestão de custos de impressão 3D, coleta, utiliza, armazena e protege seus dados pessoais ao utilizar nosso serviço online, em total conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).
            </p>
            <div className="p-4 bg-sky-50 rounded-lg border-l-4 border-sky-500 font-sans italic text-zinc-700">
              <strong>Em resumo:</strong> Levamos sua privacidade a sério. Coletamos apenas o essencial para autenticação e funcionamento do sistema. Seus dados de custos, clientes e orçamentos permanecem estritamente privados e nunca são compartilhados ou vendidos.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">2. Sobre o PrintLog e Responsáveis</h2>
            <p className="mb-4">
              O PrintLog é um <strong>SaaS</strong> desenvolvido de forma independente, oferecendo ferramentas para cálculo de custos, gestão de materiais e geração de orçamentos para impressão 3D.
            </p>
            <div className="mb-2 text-left bg-zinc-50 p-4 rounded text-xs space-y-1">
              <p><strong>Controlador dos Dados:</strong> PrintLog (Desenvolvedor Independente)</p>
              <p><strong>Contato de Privacidade:</strong> suporte@printlog.com.br</p>
              <p><strong>Operadores Técnicos (Parceiros):</strong> Cloudflare (hospedagem, banco de dados e segurança de rede), Google Firebase (autenticação) e Stripe (processamento de pagamentos).</p>
            </div>
            <p className="mt-4 text-xs text-zinc-600">
              O PrintLog atua como <strong>Controlador</strong> decidindo sobre o tratamento. Nossos parceiros atuam como <strong>Operadores</strong>, processando dados apenas conforme nossas instruções técnicas.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">3. Dados Coletados e Finalidades</h2>
            <p className="mb-4">
              Coletamos e processamos apenas os dados estritamente necessários para a prestação do serviço:
            </p>
            
            <h3 className="font-semibold text-zinc-800 mb-2 text-xs uppercase tracking-wide">3.1. Dados de Identificação</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Nome e E-mail:</strong> Para criação de conta, autenticação e comunicações críticas do sistema.</li>
              <li><strong>Foto de perfil (opcional):</strong> Importada apenas para personalização visual caso utilize login via Google.</li>
            </ul>

            <h3 className="font-semibold text-zinc-800 mb-2 text-xs uppercase tracking-wide">3.2. Dados de Negócio (Impressão 3D)</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Parâmetros e Custos:</strong> Dados sobre materiais, consumo, energia e configurações de maquinário inseridos por você.</li>
              <li><strong>Orçamentos:</strong> Projetos, informações de clientes finais e valores gerados no sistema.</li>
            </ul>
            <p className="text-xs text-zinc-600 italic">
              <strong>Garantia de Sigilo:</strong> Seus dados de negócio são armazenados na nuvem para garantir seu acesso multiplataforma. Nós não acessamos, analisamos ou utilizamos suas margens de lucro, preços ou carteira de clientes para nenhum fim.
            </p>

            <h3 className="font-semibold text-zinc-800 mb-2 mt-4 text-xs uppercase tracking-wide">3.3. Dados Financeiros (Plano Maker Pro)</h3>
            <p className="mb-4 text-xs text-zinc-600">
              Informações de assinatura e histórico de faturas. O PrintLog <strong>não armazena</strong> dados do seu cartão de crédito. Todo o processamento financeiro é roteado diretamente e de forma segura pelo nosso gateway parceiro certificado PCI-DSS.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">4. Base Legal para o Tratamento</h2>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Execução de contrato (Art. 7º, V):</strong> Para prestação do serviço SaaS de gestão.</li>
              <li><strong>Legítimo interesse (Art. 7º, IX):</strong> Para segurança, prevenção de fraudes e auditoria de logs.</li>
              <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> Retenção de logs de acesso (Marco Civil da Internet) e notas fiscais.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">5. Seus Direitos (LGPD)</h2>
            <p className="mb-4">
              Como titular, você tem direito a acesso, correção, anonimização, portabilidade e exclusão de seus dados.
            </p>
            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 font-sans text-xs text-zinc-700">
              <strong>💡 Como exercer seus direitos:</strong><br />
              Todas as exclusões e exportações podem ser feitas diretamente no painel da sua conta. Para solicitações específicas, envie um e-mail para <strong>suporte@printlog.com.br</strong>. Prazo de resposta legal: até 15 dias úteis.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">6. Segurança e Isolamento de Dados</h2>
            <p className="mb-4">
              Implementamos medidas robustas para proteger seus segredos industriais e dados pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Isolamento Multi-tenant:</strong> Arquitetura de banco de dados projetada para garantir que seus custos de materiais, margens de lucro e projetos sejam tecnicamente invisíveis e inacessíveis para qualquer outro usuário.</li>
              <li><strong>Criptografia:</strong> Tráfego de dados protegido (HTTPS/TLS) e criptografia em repouso nos servidores (AES-256).</li>
              <li><strong>Backups:</strong> Rotinas automatizadas de redundância para evitar perda de dados.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">7. Cookies Essenciais</h2>
            <p className="mb-4">
              Para simplificar sua experiência e respeitar sua privacidade, o PrintLog utiliza <strong>exclusivamente cookies estritamente necessários</strong> (cookies de sessão e tokens de segurança) para manter você logado e proteger o sistema. 
            </p>
            <p className="mb-4">
              Não utilizamos cookies de rastreamento de terceiros para fins de publicidade direcionada, o que dispensa a necessidade de banners intrusivos de consentimento na sua tela.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">8. Retenção e Exclusão</h2>
            <p className="mb-4">
              Manteremos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta (via painel ou e-mail), procederemos com a <strong>eliminação irreversível</strong> de todos os seus projetos, custos e dados de cadastro, retendo apenas os logs mínimos exigidos pelo Marco Civil da Internet (6 meses) e dados fiscais (5 anos).
            </p>
          </div>

        </section>

        <footer className="mt-20 pt-12 border-t border-zinc-100 text-[10px] text-zinc-600 font-mono text-center space-y-1">
          <p>POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS · PRINTLOG © {new Date().getFullYear()}</p>
          <p>EM TOTAL CONFORMIDADE COM A LEI GERAL DE PROTEÇÃO DE DADOS (LEI Nº 13.709/2018)</p>
          <p className="text-[9px] text-zinc-600 mt-2">Última atualização: {dataAtualizacao}</p>
        </footer>
      </article>

      <div className="max-w-[210mm] mx-auto mt-8 text-center text-[10px] text-zinc-600 font-sans uppercase tracking-[0.2em] no-print">
        Fim do Documento
      </div>
      </div>
    </div>
  );
}
