import { ArrowLeft, Gavel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Termos de Serviço - Versão 2.0 (Contrato de Licença de Uso de Software)
 * Estrutura formal com foco em responsabilidades, propriedade intelectual e limites de garantia.
 */
export default function PaginaTermosUso() {
  const navegar = useNavigate();
  const dataAtualizacao = "14 de maio de 2026";

  return (
    <div className="bg-[#f3f4f6] min-h-screen py-12 px-4 font-serif selection:bg-sky-500/30">
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
      <article className="max-w-[210mm] mx-auto bg-white shadow-[0_0_60px_rgba(0,0,0,0.05)] p-[20mm] md:p-[30mm] text-zinc-800 leading-relaxed text-justify relative overflow-hidden">
        
        {/* Marca d'água Jurídica */}
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none text-zinc-900">
          <Gavel size={200} />
        </div>

        <header className="mb-12 border-b-2 border-zinc-100 pb-8">
          <h1 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tight">
            Termos e Condições de Uso de Software (EULA)
          </h1>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Contrato Ref: PL-TERMS-2026-V2 · Vigência: {dataAtualizacao}
          </p>
        </header>

        <section className="space-y-8 text-sm">
          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">1. OBJETO DO CONTRATO E CONTATOS</h2>
            <p className="mb-4">
              O presente instrumento regula a licença de uso, não exclusiva e intransferível, da plataforma <strong>PrintLog</strong>, uma ferramenta SaaS (Software as a Service) voltada à gestão técnica e precificação para estúdios de manufatura aditiva (Impressão 3D).
            </p>
            <p className="mb-4">
              Para suporte ou questões legais, você pode nos contatar pelo telefone (61) 99255-1904 ou pelo e-mail privacidade@printlog.com.br.
            </p>
            <div className="p-4 bg-zinc-50 rounded-lg border-l-4 border-zinc-300 font-sans italic text-zinc-600">
              <strong>Em resumo:</strong> Ao usar o PrintLog, você está aceitando as regras de como o software funciona. Ele é uma ferramenta de auxílio, não um substituto para a sua gestão financeira.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">2. ELEGIBILIDADE E CADASTRO</h2>
            <p className="mb-4">
              Para utilizar o PrintLog, o usuário declara possuir capacidade civil plena (maior de 18 anos) e obriga-se a fornecer informações verídicas no ato do cadastro. O acesso é pessoal e as credenciais (via Google Auth) são de responsabilidade exclusiva do usuário.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">3. PROPRIEDADE INTELECTUAL E ATIVIDADES PROIBIDAS</h2>
            <p className="mb-4">
              Todo o código-fonte, algoritmos de cálculo, design de interface e marcas associadas ao PrintLog são de propriedade intelectual exclusiva do Controlador. É vedada qualquer prática de engenharia reversa, descompilação ou reprodução sem autorização prévia por escrito.
            </p>
            <p className="mb-4">
              Como usuário dos Serviços, você concorda expressamente em <strong>não</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Recuperar sistematicamente dados do sistema por meios automatizados (bots, scrapers, aranhas, etc.);</li>
              <li>Contornar, desabilitar ou interferir com recursos de segurança;</li>
              <li>Fazer uso inadequado dos serviços de suporte ou enviar relatórios falsos;</li>
              <li>Usar os Serviços como parte de qualquer esforço para competir conosco fazendo engenharia reversa de nossos algoritmos.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">4. LIMITAÇÃO DE RESPONSABILIDADE</h2>
            <p className="mb-4">
              O PrintLog fornece cálculos baseados em parâmetros inseridos pelo usuário. O Controlador não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Prejuízos decorrentes de precificação inadequada baseada em dados incorretos inseridos pelo usuário;</li>
              <li>Falhas de hardware ou interrupções de serviço por parte dos provedores de infraestrutura (Cloudflare/Google);</li>
              <li>Danos causados por vírus ou invasões ao dispositivo do usuário.</li>
            </ul>
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400 font-sans italic text-zinc-600">
              <strong>Importante:</strong> Nós fornecemos a calculadora, mas quem decide o preço final e assume o risco do negócio é você.
            </div>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">5. PLANOS E PAGAMENTOS</h2>
            <p className="mb-4">
              A licença de uso pode ser gratuita ou paga (Planos Pro/Master). Planos pagos são processados via gateways de pagamento parceiros. O inadimplemento poderá resultar na suspensão do acesso às funcionalidades premium até a regularização.
            </p>
            
            {/* INATIVO: MÓDULO DE ASSINATURAS PREPARADO (Ref: AdOpt Compras e Pagamentos)
            <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-600">
              <h3 className="font-bold text-zinc-800 mb-2 uppercase text-xs">5.1. Regras de Assinatura e Período de Teste (Trial)</h3>
              <ul className="list-disc pl-6 space-y-2 text-xs">
                <li><strong>Renovação Automática:</strong> As assinaturas pagas são renovadas automaticamente na frequência escolhida pelo usuário.</li>
                <li><strong>Período de Teste Gratuito:</strong> Oferecemos um período de teste (trial) gratuito de 30 dias.</li>
                <li><strong>Fim do Teste Gratuito:</strong> No final do período de teste, a conta <strong>não será cobrada</strong>. A assinatura será suspensa e as funcionalidades premium bloqueadas até que o usuário ativamente faça o upgrade para uma versão paga.</li>
                <li><strong>Cancelamento:</strong> O cancelamento da assinatura pode ser feito a qualquer momento, diretamente pelo usuário, fazendo login em sua conta e acessando o painel de faturamento.</li>
              </ul>
            </div>
            */}
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">6. RESCISÃO E EXCLUSÃO</h2>
            <p className="mb-4">
              O usuário poderá rescindir este contrato a qualquer momento, solicitando a exclusão de sua conta. O Controlador reserva-se o direito de encerrar contas que violem estes termos ou pratiquem atividades ilícitas dentro da plataforma.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">7. COMUNICAÇÕES ELETRÔNICAS E DISPOSIÇÕES FINAIS</h2>
            <p className="mb-4">
              O uso do sistema e o envio de e-mails constituem comunicações eletrônicas. Você concorda expressamente com o uso de assinaturas eletrônicas, contratos, pedidos e com a entrega eletrônica de registros de transações iniciadas na plataforma.
            </p>
            <p className="mb-4">
              Reservamos o direito de alterar, revisar, atualizar, suspender ou descontinuar os Serviços a qualquer momento por qualquer motivo, não possuindo responsabilidade por qualquer perda de dados decorrente de inatividade.
            </p>
            <p>
              Este contrato é regido pelas leis da República Federativa do Brasil. As partes elegem o foro de domicílio do Controlador (Brasília - DF) para dirimir quaisquer dúvidas oriundas deste instrumento.
            </p>
          </div>
        </section>

        <footer className="mt-20 pt-12 border-t border-zinc-100 text-[10px] text-zinc-400 font-mono text-center">
          <p>ESTE É UM CONTRATO DE ADESÃO DIGITAL · PRINTLOG © 2026</p>
          <p className="mt-1">REVISADO SEGUNDO O CÓDIGO CIVIL E LEI DO SOFTWARE (LEI 9.609/98)</p>
        </footer>
      </article>

      {/* Rodapé Adicional */}
      <div className="max-w-[210mm] mx-auto mt-8 text-center text-[10px] text-zinc-400 font-sans uppercase tracking-[0.2em] no-print">
        Fim do Documento · Página 1 de 1
      </div>
    </div>
  );
}
