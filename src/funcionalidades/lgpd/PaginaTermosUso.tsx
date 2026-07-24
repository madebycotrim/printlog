import { useEffect } from "react";
import { ArrowLeft, Gavel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Termos de Serviço / EULA - SaaS PrintLog
 * Versão Max Protection (Solo Founder): Sem exposição de telefone ou endereço, 
 * com cláusula "As-Is", isenção de SLA, transferência de backups e isenção total de responsabilidade comercial.
 */
export default function PaginaTermosUso() {
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
        <div className="max-w-[210mm] mx-auto mb-8 no-print">
          <button
            onClick={() => navegar(-1)}
            className="flex items-center gap-2 text-zinc-600 hover:text-sky-600 transition-all font-sans text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Voltar ao Sistema
          </button>
        </div>

        <article className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] p-[20mm] md:p-[30mm] text-zinc-800 leading-relaxed text-justify relative overflow-hidden">
          
          <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none text-zinc-900">
            <Gavel size={200} />
          </div>

          <header className="mb-12 border-b-2 border-zinc-100 pb-8">
            <h1 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tight">
              Contrato de Licença de Uso de Software (EULA)
            </h1>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Contrato Ref: PL-TERMS-2026-V3 · Vigência: {dataAtualizacao}
            </p>
          </header>

          <section className="space-y-8 text-sm">
            <div>
              <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">1. Objeto do Contrato</h2>
              <p className="mb-4">
                O presente instrumento regula a licença de uso, em caráter não exclusivo e intransferível, da plataforma <strong>PrintLog</strong>, um ecossistema SaaS (Software as a Service) voltado ao cálculo técnico de custos, precificação de projetos e gestão operacional para manufatura aditiva.
              </p>
              <div className="p-4 bg-zinc-50 rounded-lg border-l-4 border-zinc-400 font-sans italic text-zinc-700">
                <strong>Em resumo:</strong> Ao criar uma conta, você aceita as regras de funcionamento do PrintLog. A plataforma é uma ferramenta de simulação e auxílio gerencial, não substituindo a tomada de decisão comercial do próprio usuário.
              </div>
            </div>

            <div>
              <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">2. Fornecimento "AS IS" (Como Está) e Disponibilidade</h2>
              <p className="mb-4">
                O software é fornecido no estado em que se encontra ("as is"), sem garantias expressas ou implícitas de qualquer natureza, incluindo adequação a fins comerciais específicos. O PrintLog não oferece Acordos de Nível de Serviço (SLA) de tempo de atividade (uptime) ou garantias de funcionamento ininterrupto, isentando-se de qualquer responsabilidade civil, administrativa ou comercial por indisponibilidade temporária ou prolongada da plataforma.
              </p>
              <p className="mb-4">
                Toda e qualquer responsabilidade técnica pela exportação, integridade e manutenção de cópias adicionais (backups) de seus dados de negócio (como relatórios, orçamentos, insumos e listas de materiais) é de responsabilidade integral e exclusiva do usuário, não sendo o PrintLog responsável por perda ou corrupção de dados sob nenhuma hipótese.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">3. Propriedade Intelectual e Restrições</h2>
              <p className="mb-4">
                Todo o código-fonte, arquitetura de banco de dados, fórmulas matemáticas, lógica dos algoritmos e design de interface são de propriedade intelectual exclusiva do desenvolvedor titular do PrintLog. 
              </p>
              <p className="mb-4">
                Como condição de uso da plataforma, o usuário se compromete expressamente a <strong>não</strong>:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Efetuar engenharia reversa, descompilação ou cópia da lógica de cálculo e interface;</li>
                <li>Utilizar robôs, <i>scrapers</i> ou ferramentas automatizadas de extração de dados;</li>
                <li>Burlar, desativar ou violar mecanismos de segurança da infraestrutura de rede;</li>
                <li>Compartilhar credenciais de acesso para uso coletivo de uma conta individual.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">4. Isenção Total de Responsabilidade Comercial e Física</h2>
              <p className="mb-4">
                O PrintLog opera fornecendo estimativas de simulação com base exclusivamente nos parâmetros cadastrados e imputados pelo próprio usuário. Diante disso, o desenvolvedor/licenciante isenta-se expressa e totalmente de qualquer responsabilidade civil ou financeira, incluindo mas não se limitando a:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Lucros Cessantes e Prejuízos Comerciais:</strong> Perda de receitas, lucros, contratos, dados comerciais ou interrupção de atividades decorrentes da utilização da plataforma;</li>
                <li><strong>Erros Humanos de Digitação/Cálculo:</strong> Erros, falhas ou lapsos do usuário no cadastramento de preços de insumos, pesos, taxas ou tempos de impressão que gerem orçamentos incorretos ou prejuízos nas vendas;</li>
                <li><strong>Falhas Físicas da Manufatura:</strong> Perda de insumos, falhas de impressão 3D (ex: warping, problemas de adesão de camada, bicos entupidos, quebras de filamento) ou avarias mecânicas/elétricas em impressoras reais;</li>
                <li><strong>Divergência de Medição:</strong> Diferenças entre as projeções matemáticas simuladas pela plataforma (ex: tempo estimado de impressão e peso de material) e a produção real verificada fisicamente no maquinário.</li>
              </ul>
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500 font-sans text-xs text-zinc-700 font-medium">
                <strong>⚠️ Cláusula Pro-Maker:</strong> Nós fornecemos os algoritmos de precisão matemática. A validação das configurações de fatiamento, custos reais de mercado e o risco inerente à produção física são integral e exclusivamente de sua responsabilidade.
              </div>
            </div>

            <div>
              <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">5. Planos, Cobrança e Política de Não-Surpresa</h2>
              <p className="mb-4">
                O acesso ao PrintLog pode ser disponibilizado em modalidades gratuitas ou planos pagos (assinaturas premium). 
              </p>
              <div className="mt-2 p-4 bg-sky-50 rounded border border-sky-100 text-zinc-700 space-y-2 text-xs font-sans">
                <p><strong>• Renovação e Cancelamento:</strong> Os planos pagos renovam automaticamente no ciclo contratado (mensal/anual). O cancelamento pode ser efetuado de forma autônoma pelo painel do usuário a qualquer momento, interrompendo cobranças futuras.</p>
                <p><strong>• Regra de Avaliação (Trial Sem Cartão):</strong> Caso seja oferecido um período de testes premium gratuito, o encerramento do prazo não gerará cobrança automática. O acesso aos recursos Pro será suspenso até que o usuário decida assinar um plano pago de forma ativa.</p>
                <p><strong>• Segurança Financeira:</strong> Todo o processamento financeiro ocorre via gateways de pagamento certificados (PCI-DSS), isentando o PrintLog de armazenar dados de cartões de crédito.</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">6. Rescisão e Limpeza de Dados</h2>
              <p className="mb-4">
                Este contrato vigora por prazo indeterminado. O usuário pode rescindi-lo instantaneamente excluindo sua conta pelo painel. O PrintLog reserva-se o direito de suspender ou excluir sumariamente contas de usuários que descumpram as regras de uso ou cometam fraudes, sem direito a reembolso de períodos vigentes.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider">7. Modificações, Contato Legal e Foro</h2>
              <p className="mb-4">
                Estes Termos de Uso podem ser revisados periodicamente. Alterações significativas serão notificadas diretamente no painel de controle do sistema. O uso contínuo da plataforma após as alterações constitui aceitação tácita dos novos termos.
              </p>
              <p className="mb-4">
                Toda e qualquer comunicação de suporte, requisições legais ou dúvidas sobre este contrato devem ser encaminhadas exclusivamente por escrito para o nosso canal de atendimento eletrônico.
              </p>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs text-center font-bold mb-4">
                E-mail Oficial de Suporte e Privacidade: suporte@printlog.com.br
              </div>
              <p className="mb-4">
                Este contrato digital é regido pelas leis da República Federativa do Brasil (Lei do Software nº 9.609/98). Para dirimir controvérsias judiciais, as partes elegem de forma exclusiva o foro da comarca de <strong>Brasília - DF</strong>, renunciando expressamente a qualquer outro.
              </p>
            </div>
          </section>

          <footer className="mt-20 pt-12 border-t border-zinc-100 text-[10px] text-zinc-600 font-mono text-center space-y-1">
            <p>CONTRATO DE ADESÃO DIGITAL EXCLUSIVAMENTE ACEITO VIA CLIQUE · PRINTLOG © {new Date().getFullYear()}</p>
            <p>REVISADO SEGUNDO O CÓDIGO CIVIL E A LEI DO SOFTWARE (LEI Nº 9.609/98)</p>
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
