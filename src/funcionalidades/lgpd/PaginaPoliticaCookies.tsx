import { useEffect } from "react";
import { ArrowLeft, Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Política de Cookies - SaaS PrintLog
 * Versão Solo Founder: Focada exclusivamente em transparência de cookies funcionais e de infraestrutura.
 * Sem dependências de links externos e sem necessidade de banners intrusivos.
 */
export default function PaginaPoliticaCookies() {
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
          <Cookie size={200} />
        </div>

        <header className="mb-12 border-b-2 border-zinc-100 pb-8">
          <h1 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tight">
            Declaração de Cookies Essenciais
          </h1>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            Documento Ref: PL-COOK-2026-V3 · Vigência: {dataAtualizacao}
          </p>
        </header>

        <section className="space-y-8 text-sm">
          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">1. O que são Cookies?</h2>
            <p className="mb-4">
              Cookies são pequenos arquivos de texto ou fragmentos de dados armazenados localmente no seu navegador ou dispositivo quando você acessa uma plataforma digital. Eles auxiliam na segurança, na autenticação de identidade e na manutenção de suas preferências de interface ativas.
            </p>
            <div className="p-4 bg-sky-50 rounded-lg border-l-4 border-sky-500 font-sans italic text-zinc-700">
              <strong>Em resumo:</strong> O PrintLog utiliza cookies exclusivamente para que o sistema funcione com segurança, rapidez e para lembrar se você já realizou o login.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">2. Filosofia de Uso no PrintLog</h2>
            <p className="mb-4">
              Visando o respeito integral à sua privacidade e uma experiência limpa de navegação (UX), o PrintLog adota uma política restritiva: **não utilizamos cookies de rastreamento comportamental de terceiros para fins publicitários** (como redes de anúncios ou pixels de remarketing).
            </p>
            <p className="mb-4">
              Por operarmos unicamente com cookies técnicos, funcionais e de segurança, a plataforma está legalmente dispensada da necessidade de exibição de banners intrusivos de consentimento, mantendo sua tela livre de interrupções.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">3. Inventário de Cookies Utilizados</h2>
            <p className="mb-4">
              Abaixo encontra-se a relação transparente e auditada de todos os registros mantidos no seu dispositivo para viabilizar a operação técnica do SaaS:
            </p>
            <div className="overflow-x-auto mb-4 border border-zinc-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700">
                    <th className="p-3 font-bold uppercase">Chave / Nome</th>
                    <th className="p-3 font-bold uppercase">Provedor</th>
                    <th className="p-3 font-bold uppercase">Tipo / Duração</th>
                    <th className="p-3 font-bold uppercase">Finalidade Técnica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-600">
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">cf_clearance</td>
                    <td className="p-3">Cloudflare</td>
                    <td className="p-3">Cookie (365 dias)</td>
                    <td className="p-3">Segurança. Validação antibot na camada de firewall e rede.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">cf.turnstile.u</td>
                    <td className="p-3">Cloudflare</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Segurança. Turnstile antibot para proteção contra acessos automatizados.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">firebase:authUser:...</td>
                    <td className="p-3">Google Firebase</td>
                    <td className="p-3">IndexedDB / Storage</td>
                    <td className="p-3">Autenticação. Mantém a sessão do usuário ativa e conectada de forma segura.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog:tema</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Preferência. Armazena o modo visual (tema, cores e fontes) escolhido pelo usuário.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog:estudios</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Funcional. Mantém a lista de estúdios locais criados pelo usuário.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog:id_estudio_ativo</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Funcional. Registra qual estúdio/ambiente de gerenciamento está ativo.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog_anos_vida_util</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Preferência. Armazena as configurações de vida útil dos equipamentos.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog_ultima_impressora</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Preferência. Lembra o ID do último equipamento selecionado no simulador.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog_sidebar_colapsada</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Layout. Salva o estado de abertura/colapso da barra lateral do menu.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog:beta_preferencias</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Funcional. Lembra as preferências e flags de participação em recursos beta do sistema.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-zinc-900 font-medium">printlog_consentimento_cookies</td>
                    <td className="p-3">printlog.com.br</td>
                    <td className="p-3">Local Storage</td>
                    <td className="p-3">Preferência. Armazena as escolhas e aceites do usuário referentes a cookies.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">4. Gerenciamento e Revogação</h2>
            <p className="mb-4">
              Qualquer usuário possui autonomia para limpar, bloquear ou remover esses registros diretamente nas configurações nativas do seu próprio navegador de internet (geralmente localizadas nos menus de "Privacidade e Segurança").
            </p>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 font-sans text-xs text-zinc-700">
              <strong>⚠️ Alerta Técnico de Operação:</strong> A desativação ou bloqueio dos registros listados na Seção 3 impedirá o funcionamento correto do ecossistema do PrintLog, quebrando funções de persistência de login e segurança de autenticação.
            </div>
          </div>
        </section>

        <footer className="mt-20 pt-12 border-t border-zinc-100 text-[10px] text-zinc-600 font-mono text-center space-y-1">
          <p>DECLARAÇÃO TÉCNICA REVISADA · PRINTLOG © {new Date().getFullYear()}</p>
          <p>EM TOTAL CONFORMIDADE COM AS DIRETRIZES DE COOKIES DA LGPD (LEI Nº 13.709/2018)</p>
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