import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./estilos-impressao.css";

export function TermosUso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#050507] text-zinc-900 dark:text-zinc-300 font-sans selection:bg-sky-500/30 selection:text-sky-900 dark:selection:text-sky-200 transition-colors duration-300 print:bg-white print:text-black">

      <div className="relative z-10 container mx-auto px-6 py-20 max-w-4xl print:py-0 print:px-0 print:max-w-none print:w-full print-container">
        {/* — Navegação — */}
        <nav className="flex items-center justify-between mb-16 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
            aria-label="Voltar para a página anterior"
          >
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 group-hover:bg-zinc-200 dark:group-hover:bg-white/10 transition-all">
              <ArrowLeft size={14} />
            </div>
            Voltar ao site
          </button>
          <button
            onClick={() => window.print()}
            className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline underline-offset-4"
            aria-label="Imprimir documento"
          >
            IMPRIMIR (CTRL+P)
          </button>
        </nav>

        <div className="bg-white dark:bg-transparent shadow-sm dark:shadow-none ring-1 ring-zinc-200 dark:ring-0 p-8 sm:p-12 md:p-16 rounded-sm text-base leading-relaxed print:p-0 print:shadow-none print:ring-0 print-no-shadow print-abnt-text print:w-full print-container">
          <header className="mb-12 text-center print:mb-8 print:w-full">
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-black dark:text-white mb-4 print:text-black print-abnt-title">
              TERMOS DE USO E LICENÇA DE SOFTWARE
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium print:text-zinc-700">
              Última atualização: 23 de fevereiro de 2026 (v1.0).
            </p>
          </header>

          <article className="space-y-6 text-justify leading-[1.5]">
            <p className="indent-[1.25cm]">
              Este instrumento de "Termos de Uso" (doravante "Termo") constitui um acordo legal, vinculante e exequível, celebrado entre a <strong>PrintLog, projeto de software de titularidade de pessoa física, doravante "Plataforma"</strong>, e você, pessoa física ou jurídica, ao se cadastrar e utilizar os serviços (doravante "Licenciado" ou "Usuário").
            </p>
            <p className="indent-[1.25cm]">
              O acesso, cadastro e uso da Plataforma implicam a aceitação das condições aqui estabelecidas, sem prejuízo dos direitos previstos em lei, especialmente os do Código de Defesa do Consumidor (CDC). Caso o Usuário não concorde com qualquer disposição deste Termo, deverá abster-se imediatamente de utilizar o sistema.
            </p>

            {/* ── SEÇÃO 1 ── */}
            <div className="pt-6 print:pt-4">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                1. DEFINIÇÕES CONCEITUAIS E NATUREZA DO SERVIÇO
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>1.1. Objeto e Natureza Jurídica:</strong> O presente Termo regulamenta o licenciamento temporário, precário, não exclusivo, revogável e intransferível de uso do software PrintLog. A Plataforma é fornecida no modelo <em>Software as a Service</em> (SaaS), hospedada na nuvem.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>1.2. Inexistência de Cessão:</strong> A utilização da Plataforma não implica subordinação, representação, ou transferência de códigos-fonte, propriedade intelectual ou banco de dados estruturais da Licenciante ao Licenciado.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>1.3. PrintLog:</strong> Plataforma de gestão desenhada especificamente para estúdios de impressão 3D, que oferece ferramentas para controle de fatiamentos, custos de filamentos, tempos de máquina, gestão de clientes e emissão de orçamentos.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>1.4. Validade Técnica:</strong> A versão atual da Plataforma é disponibilizada sem prazo determinado de suporte, reservando-se a Licenciante o direito de comunicar formalmente o encerramento de suporte a versões legadas com antecedência mínima de 30 (trinta) dias, em estrita observância ao Art. 8º da Lei nº 9.609/1998.
              </p>
            </div>

            {/* Sessão 2 - ACESSO, CADASTRO E AUTENTICAÇÃO */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                2. ACESSO, CADASTRO E AUTENTICAÇÃO
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>2.1. Requisitos de Capacidade:</strong> Para utilizar a Plataforma, o Usuário assegura ter capacidade civil plena ou estar legitimamente representado, sendo responsável por quaisquer atos praticados em nome da pessoa jurídica cadastrada.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>2.2. Veracidade dos Dados:</strong> O Usuário compromete-se a fornecer informações precisas, atualizadas e completas durante o cadastro, sendo responsável pela veracidade dos dados informados.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>2.3. Autenticação e Sigilo:</strong> As credenciais de acesso (login e senha) são pessoais e intransferíveis. O Usuário é o único responsável pela guarda e confidencialidade de suas credenciais, devendo notificar a PrintLog imediatamente em caso de acesso não autorizado, suspeita de vazamento de senha ou quebra de segurança.
              </p>

            </div>

            {/* Sessão 3 - RESPONSABILIDADES DO USUÁRIO */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                3. RESPONSABILIDADES DO USUÁRIO
              </h2>
              <p className="mb-3 indent-[1.25cm]">
                São deveres inalienáveis do Usuário, sob pena de rescisão e responsabilização legal:
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>3.1. Uso Lícito:</strong> Utilizar a Plataforma para fins estritamente lícitos e ligados à gestão do próprio estúdio de impressão 3D, respeitando a legislação brasileira em vigor, a moral e os bons costumes.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>3.2. Dados de Clientes Finais:</strong> O Usuário compreende que atua como Controlador dos dados pessoais de seus próprios clientes inseridos na Plataforma, de acordo com a Lei Geral de Proteção de Dados (LGPD - nº 13.709/2018). É dever do Usuário recolher o consentimento ou garantir outra base legal antes de qualificar seus clientes na Plataforma.
              </p>
              <div className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5]">
                <strong>3.3. Proibições Técnicas:</strong> É terminantemente proibido:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Realizar engenharia reversa, descompilação ou desmontagem da Plataforma;</li>
                  <li>Utilizar <em>crawlers</em>, robôs, <em>scripts</em> ou ferramentas automatizadas de extração de dados;</li>
                  <li>Sublicenciar, revender, alugar, ou ceder os direitos de uso do software a terceiros;</li>
                  <li>Transmitir vírus, malwares ou executar ataques de negação de serviço (DDoS).</li>
                </ul>
              </div>

            </div>

            {/* Sessão 4 - LIMITAÇÃO DE RESPONSABILIDADE E EXCLUSÃO DE GARANTIAS */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                4. LIMITAÇÃO DE RESPONSABILIDADE E EXCLUSÃO DE GARANTIAS
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>4.1. Plataforma "As Is":</strong> O sistema é fornecido no estado em que se encontra (<em>"as is"</em> e <em>"as available"</em>), sem garantias expressas ou implícitas de adequação a fins particulares, escalabilidade ilimitada ou infalibilidade comercial.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>4.2. Inexistência de Garantia de Lucros:</strong> A PrintLog é exclusivamente uma ferramenta de gestão e controle, não assegurando incremento de vendas, clientes ou receitas para o estúdio do Usuário.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>4.3. Isenção de Danos Indiretos:</strong> A Licenciante não poderá ser responsabilizada, em nenhuma hipótese, por lucros cessantes, perda de receita, perda de dados causadas por negligência do Usuário (como exclusão acidental de informações de clientes), falhas de conexão de internet do Usuário, ou indisponibilidades de provedores de infraestrutura em nuvem contratados cujos Termos de Serviço regulam o tratamento de dados em suas infraestruturas (Ex: Cloudflare ou Google Firebase).
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>4.4. Limite de Indenização:</strong> Enquanto a Plataforma for disponibilizada gratuitamente, a responsabilidade civil da PrintLog será limitada aos danos diretos e comprovados causados por dolo ou culpa grave da Licenciante, excluídos danos indiretos, nos termos do Art. 51, I do CDC e sem prejuízo das hipóteses de responsabilidade objetiva previstas na legislação consumerista. Caso venha a existir cobrança, o limite será o valor efetivamente pago pelo Usuário nos últimos 12 (doze) meses.
              </p>

            </div>

            {/* Sessão 5 - NÍVEIS DE SERVIÇO (SLA) E DISPONIBILIDADE */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                5. NÍVEIS DE SERVIÇO (SLA) E DISPONIBILIDADE
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>5.1. Esforço Operacional:</strong> A PrintLog empregará os melhores esforços técnicos para manter o sistema operacional com uma disponibilidade estimada de 99% (noventa e nove por cento), calculada em base mensal. Durante o período de gratuidade, eventuais indisponibilidades não geram direito a compensação financeira ou indenizatória.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>5.2. Exclusões Funcionais:</strong> Interrupções decorrentes de manutenções preventivas programadas (notificadas com antecedência), eventos de força maior, instabilidades em provedores terceiros ou na infraestrutura do próprio Usuário não serão qualificadas como violação de disponibilidade.
              </p>
            </div>

            {/* Sessão 6 - PROPRIEDADE INTELECTUAL E DIREITOS AUTORAIS */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                6. PROPRIEDADE INTELECTUAL E DIREITOS AUTORAIS
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>6.1. Titularidade:</strong> Todo o conteúdo estrutural da Plataforma, incluindo códigos, <em>layout</em>, bases de dados organizacionais, algoritmos de cálculo, <em>design tokens</em>, logomarcas, marcas registradas e nomes de domínio, pertencem irrestritamente à Licenciante, amparados pelas Leis nº 9.609/1998 (Lei do Software) e nº 9.279/1996 (Propriedade Industrial).
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>6.2. Uso de Brand:</strong> Nenhuma disposição contida neste Termo garante ao Licenciado direito de usar patentes, marcas ou <em>trade dress</em> da PrintLog sem prévia autorização por escrito.
              </p>
            </div>

            {/* Sessão 7 - EVOLUÇÃO DA PLATAFORMA E POLÍTICA COMERCIAL */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                7. EVOLUÇÃO DA PLATAFORMA E POLÍTICA COMERCIAL
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>7.1. Mudanças de Escopo:</strong> A PrintLog reserva-se o direito de realizar atualizações contínuas de interface, adições de módulos ou remoção de funcionalidades legadas, visando a melhoria do software.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>7.2. Gratuidade e Política Comercial:</strong> A plataforma PrintLog é atualmente disponibilizada de forma gratuita. O responsável reserva-se o direito de, no futuro, introduzir planos pagos ou assinaturas. Quaisquer mudanças que impliquem cobrança serão comunicadas com antecedência mínima de 30 (trinta) dias. Usuários ativos na data da comunicação terão garantido o direito de permanecer no plano gratuito vigente por no mínimo 30 (trinta) dias adicionais após o início da cobrança para novos usuários, como período de carência.
              </p>
            </div>

            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                8. TRATAMENTO DE DADOS E PRIVACIDADE
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>8.1. Política de Privacidade:</strong> O tratamento de dados pessoais é regido pela Política de Privacidade da PrintLog, documento autônomo que constitui parte integrante deste Termo, cujo consentimento é coletado de forma destacada no ato do cadastro, nos termos do Art. 7º, IX do Marco Civil da Internet.
              </p>
            </div>

            {/* Sessão 9 - SUSPENSÃO DOS SERVIÇOS, RESCISÃO E EXCLUSÃO DA CONTA */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                9. SUSPENSÃO DOS SERVIÇOS, RESCISÃO E EXCLUSÃO DA CONTA
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>9.1. Direito de Rescisão:</strong> O Usuário poderá, a qualquer tempo, encerrar este Termo por meio do cancelamento e exclusão de sua conta nos recursos da própria Plataforma.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>9.2. Suspensão por Descumprimento:</strong> A PrintLog reserva-se o direito de suspender o acesso do Usuário em caso de identificação de uso indevido ou descumprimento contratual, mediante aviso prévio de no mínimo 30 (trinta) dias, garantindo ao Usuário o direito de contestação ou correção da irregularidade. A suspensão imediata e sem aviso prévio ocorrerá exclusivamente em casos de fraude comprovada, atividade ilícita flagrante ou risco crítico à segurança da Plataforma.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>9.3. Efeitos do Encerramento:</strong> Após a rescisão, o direito de utilizar a Plataforma cessa imediatamente. A PrintLog excluirá (ou anonimizará) os dados pessoais e de negócio em até 30 (trinta) dias corridos, ressalvadas as parcelas necessárias ao cumprimento de obrigações legais de guarda.
              </p>
            </div>

            {/* Sessão 10 - DISPOSIÇÕES GERAIS E FORO APLICÁVEL */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                10. DISPOSIÇÕES GERAIS E FORO APLICÁVEL
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5]">
                <strong>10.1. Modificações do Termo:</strong> Este Termo pode ser modificado mediante aviso prévio de no mínimo 30 (trinta) dias, comunicado por e-mail ou notificação na Plataforma. O uso contínuo após as alterações constitui validação das novas regras.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 indent-0">
                <strong>10.2. Nulidade Parcial:</strong> Se qualquer cláusula deste instrumento for julgada nula ou inválida, as demais disposições permanecerão vigentes garantindo o sentido econômico e funcional da outorga original.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 indent-0">
                <strong>10.3. Tolerância:</strong> A tolerância ou condescendência na aplicação imediata das sanções cabíveis ou na exigência de cumprimento de obrigações não significa renúncia ao direito legal ("<em>waiver</em>").
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>10.4. Foro:</strong> Fica eleito preferencialmente o foro da Comarca do domicílio do titular do projeto (ou, na proteção legal consumerista stricto sensu se aplicável, o domicílio do Usuário) no Brasil, renunciando ambas as partes a qualquer outro, por mais privilegiado que seja, para dirimir eventuais litígios judiciais relativos a este contrato.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300 leading-[1.5] indent-0">
                <strong>10.5. Suporte:</strong> Para dúvidas sobre este Termo ou exercício de direitos, o Usuário poderá entrar em contato com o responsável pela Plataforma pelo canal oficial: suporte@printlog.com.br.
              </p>
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm font-medium print:border-zinc-300">
              <p className="mt-2 text-sky-600 dark:text-sky-400 print:text-black">suporte@printlog.com.br</p>
            </div>
          </article>
        </div>

        <footer className="mt-12 text-center print:hidden">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar ao site
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Este documento está em conformidade com a LGPD (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).
            <br />© 2026 PrintLog. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>

  );
}
