import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Política de Privacidade - Versão 2.0 (Conformidade Integral LGPD)
 * Estrutura baseada nas diretrizes da ANPD e normas ABNT de documentação.
 */
export default function PaginaPoliticaPrivacidade() {
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
          <ShieldCheck size={200} />
        </div>

        <header className="mb-12 border-b-2 border-zinc-100 pb-8">
          <h1 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Documento Interno: PL-PRIV-2026-V2 · Atualizado em: {dataAtualizacao}
          </p>
        </header>

        <section className="space-y-8 text-sm">
          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">1. DISPOSIÇÕES GERAIS</h2>
            <p className="mb-4">
              Esta Política de Privacidade descreve as práticas do <strong>PrintLog</strong> (doravante denominado "Controlador") em relação à coleta, processamento e armazenamento de dados pessoais, em estrita observância à Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
            </p>
            <div className="p-4 bg-sky-50 rounded-lg border-l-4 border-sky-500 font-sans italic text-zinc-600">
              <strong>Em resumo:</strong> Este documento é o nosso compromisso legal de que cuidaremos bem dos seus dados. Ele explica o que fazemos com o seu nome e e-mail.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">2. AGENTES DE TRATAMENTO E CONTATO</h2>
            <p className="mb-2 text-left">
              <strong>Controlador:</strong> PrintLog (Desenvolvedor Solo).<br />
              <strong>Endereço:</strong> SGAS 915 Sul, Distrito Federal 70.390-150, Brasil.<br />
              <strong>Encarregado (DPO):</strong> Responsável pela Privacidade PrintLog (privacidade@printlog.com.br).<br />
              <strong>Operadores:</strong> Cloudflare, Inc. (Infraestrutura) e Google LLC (Autenticação).
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">3. COLETA E FINALIDADE DOS DADOS</h2>
            <p className="mb-4">
              O tratamento de dados pessoais pelo PrintLog limita-se ao mínimo necessário para a prestação do serviço, fundamentando-se no <strong>Artigo 7º, inciso V</strong> (Execução de Contrato):
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Dados de Identificação:</strong> Nome e sobrenome (ou apelido) e endereço de correio eletrônico (e-mail) para fins de autenticação e suporte.</li>
              <li><strong>Dados Técnicos:</strong> Endereço IP e registros de data/hora, processados para garantir a integridade do sistema e conformidade com o Marco Civil da Internet (Art. 15).</li>
              <li><strong>Dados de Negócio:</strong> Informações de custos e orçamentos inseridos pelo usuário, processados exclusivamente para a geração de relatórios sob demanda.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">4. COMPARTILHAMENTO DE INFORMAÇÕES</h2>
            <p className="mb-4">
              Não transferiremos suas informações pessoais para terceiros sem o seu consentimento explícito, exceto em circunstâncias estritamente limitadas e legais:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Para cumprir a lei aplicável, regulamentação, ordem judicial ou outro processo legal;</li>
              <li>Para fazer cumprir nossos acordos, incluindo esta Política de Privacidade;</li>
              <li>Se o PrintLog for fundido ou adquirido por outra empresa, suas informações serão transferidas para o novo proprietário de forma segura.</li>
            </ul>
            <p className="mb-4">
              Exigimos que terceiros (nossos Operadores) utilizem as informações pessoais apenas para o propósito para o qual foram transferidas e não as mantenham por mais tempo do que é necessário para cumprir o referido propósito.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">6. DIREITOS DO TITULAR (ART. 18 LGPD)</h2>
            <p className="mb-4">
              O Titular dos dados possui o direito de solicitar a qualquer momento:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Confirmação da existência de tratamento;</li>
              <li>Acesso facilitado aos dados;</li>
              <li>Correção de dados incompletos ou inexatos;</li>
              <li>Portabilidade dos dados (conforme regulamentação da ANPD);</li>
              <li>Eliminação definitiva dos dados (Direito ao Esquecimento).</li>
            </ol>
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg font-sans text-xs text-zinc-500">
              <strong>Nota Técnica:</strong> Para exercer esses direitos ou optar por não receber comunicações, escreva diretamente para privacidade@printlog.com.br.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">7. SEGURANÇA E ARMAZENAMENTO</h2>
            <p className="mb-4">
              O Controlador adota medidas técnicas de segurança, incluindo criptografia <strong>AES-256</strong> (em repouso) e <strong>TLS 1.3</strong> (em trânsito). No entanto, dados os riscos inerentes à internet, não podemos garantir segurança absoluta contra violações altamente sofisticadas.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">8. RETENÇÃO E EXCLUSÃO</h2>
            <p className="mb-4">
              Dados pessoais e de negócio são retidos enquanto a conta do Titular permanecer ativa. Manteremos suas informações pessoais conosco por <strong>90 dias a 2 anos</strong> após a conta do usuário permanecer inativa, a fim de realizar limpeza de dados obsoletos.
            </p>
            <p className="mb-4">
              Após a solicitação de exclusão, ocorre a <strong>purga definitiva</strong> de todos os dados. Registros de acesso (IP) são mantidos por no mínimo 180 dias para cumprimento de obrigação legal. Informações anonimizadas que não identificam o usuário poderão ser armazenadas indefinidamente.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">9. DISPOSIÇÕES FINAIS E COOKIES</h2>
            <p className="mb-4">
              Para saber mais sobre como utilizamos tecnologias de rastreamento, consulte nossa <a href="/politica-de-cookies" className="text-sky-600 hover:underline">Política de Cookies</a>.
            </p>
            <p>
              Esta política pode ser atualizada periodicamente sem aviso prévio, passando a vigorar 30 dias após sua publicação. Recomendamos revisar esta página regularmente. Para qualquer controvérsia, elege-se o foro da comarca de domicílio do Controlador.
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
