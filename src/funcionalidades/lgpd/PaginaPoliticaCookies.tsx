import { ArrowLeft, Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Política de Cookies - Versão 2.0 (Conformidade Integral LGPD)
 * Estrutura baseada nas diretrizes da ANPD e normas ABNT de documentação.
 */
export default function PaginaPoliticaCookies() {
  const navegar = useNavigate();
  const dataAtualizacao = "14 de maio de 2026";

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-12 px-4 font-serif selection:bg-sky-500/30">
      {/* Botão de Retorno */}
      <div className="max-w-[210mm] mx-auto mb-8 no-print">
        <button
          onClick={() => navegar(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-sky-600 transition-all font-sans text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Voltar ao Sistema
        </button>
      </div>

      {/* Documento Estilo A4 */}
      <article className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] p-[20mm] md:p-[30mm] text-zinc-800 leading-relaxed text-justify relative overflow-hidden">
        
        {/* Selo de Autenticidade (Marca d'água discreta) */}
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none">
          <Cookie size={200} />
        </div>

        <header className="mb-12 border-b-2 border-zinc-100 pb-8">
          <h1 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tight">
            Política de Cookies
          </h1>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Documento Interno: PL-COOK-2026-V2 · Atualizado em: {dataAtualizacao}
          </p>
        </header>

        <section className="space-y-8 text-sm">
          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">1. DISPOSIÇÕES GERAIS</h2>
            <p className="mb-4">
              Esta Política de Cookies explica como o <strong>PrintLog</strong> utiliza cookies e tecnologias semelhantes para reconhecê-lo quando você visita nosso sistema. Ela explica o que são essas tecnologias e por que as usamos, bem como seus direitos de controlar o uso que fazemos delas, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <div className="p-4 bg-sky-50 rounded-lg border-l-4 border-sky-500 font-sans italic text-zinc-600">
              <strong>Em resumo:</strong> Usamos pequenos arquivos de texto para fazer o sistema funcionar corretamente e lembrar de você na próxima vez.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">2. O QUE SÃO COOKIES?</h2>
            <p className="mb-4">
              Cookies são pequenos arquivos de dados colocados em seu computador ou dispositivo móvel quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem, ou funcionarem de forma mais eficiente, bem como para fornecer informações de relatórios.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">3. COMO UTILIZAMOS OS COOKIES</h2>
            <p className="mb-4">
              O PrintLog utiliza cookies estritamente necessários para garantir a operação e a segurança da plataforma.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Cookies Essenciais:</strong> Necessários para que o sistema funcione, incluindo manter o estado da sua sessão e autenticação de segurança.</li>
              <li><strong>Cookies de Preferência:</strong> Armazenam informações sobre o comportamento ou aparência do sistema, como suas preferências de idioma ou tema visual.</li>
              <li><strong>Cookies Analíticos:</strong> Utilizamos para entender como a plataforma é utilizada de forma agregada, sem identificar pessoalmente o usuário.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">4. CONTROLE DOS COOKIES</h2>
            <p className="mb-4">
              O Titular dos dados pode alterar as configurações do seu navegador para recusar cookies. Contudo, observe que ao bloquear os <strong>Cookies Essenciais</strong>, partes essenciais do sistema PrintLog não funcionarão corretamente, especialmente os mecanismos de autenticação (login).
            </p>
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg font-sans text-xs text-zinc-500">
              <strong>Nota Técnica:</strong> Nós fornecemos um painel de gerenciamento de consentimento na sua primeira visita para que você controle as preferências de rastreamento.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">5. DISPOSIÇÕES FINAIS</h2>
            <p>
              Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças operacionais ou legais. Recomendamos revisitar esta página para as informações mais recentes.
            </p>
          </div>
        </section>

        <footer className="mt-20 pt-12 border-t border-zinc-100 text-[10px] text-zinc-400 font-mono text-center">
          <p>ESTE DOCUMENTO POSSUI VALIDADE JURÍDICA E TÉCNICA · PRINTLOG © 2026</p>
          <p className="mt-1">REPRODUÇÃO PROIBIDA · EM CONFORMIDADE COM A LEI 13.709/2018</p>
        </footer>
      </article>

      {/* Rodapé Adicional */}
      <div className="max-w-[210mm] mx-auto mt-8 text-center text-[10px] text-zinc-400 font-sans uppercase tracking-[0.2em] no-print">
        Fim do Documento · Página 1 de 1
      </div>
    </div>
  );
}
