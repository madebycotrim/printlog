import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./estilos-impressao.css";

export function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#050507] text-zinc-900 dark:text-zinc-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-300 print:bg-white print:text-black">

      <div className="relative z-10 container mx-auto px-6 py-20 max-w-4xl print:py-0 print:px-0 print:max-w-none print:w-full print-container">

        {/* — Navegação — */}
        <nav className="flex items-center justify-between mb-16 print:hidden">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar para a página anterior"
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
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
              POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium print:text-zinc-700">
              Última atualização: 23 de fevereiro de 2026 (v1.0).
            </p>
          </header>

          <article className="space-y-6 text-justify leading-[1.5]">
            <p className="indent-[1.25cm]">
              A <strong>PrintLog, projeto de software de titularidade de pessoa física (doravante "Nós", "Controladora" ou "Plataforma")</strong> está rigidamente comprometida com a proteção da privacidade e dos dados pessoais de todos os nossos usuários. Esta Política de Privacidade formaliza as diretrizes adotadas sobre a coleta, uso, compartilhamento, armazenamento e eliminação de dados mediante a utilização de nosso sistema <em>SaaS</em> focado em gestão de estúdios de impressão 3D, conforme preceitos da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e do Marco Civil da Internet (MCI - Lei nº 12.965/2014).
            </p>
            <p className="indent-[1.25cm]">
              Ao utilizar o PrintLog, o Usuário manifesta o aceite amplo, expresso e informado às previsões deste compêndio.
            </p>

            {/* Seção 1 - Identificação do Controlador e Papéis Jurídicos */}
            <div className="pt-6 print:pt-4">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                1. IDENTIFICAÇÃO DO CONTROLADOR E PAPÉIS JURÍDICOS
              </h2>
              <p className="mb-3 indent-[1.25cm]">
                Para os fins da legislação de privacidade, faz-se estritamente necessária a distinção de papéis assumidos pela Plataforma:
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>1.1. PrintLog como CONTROLADORA:</strong> Quando a PrintLog coleta dados cadastrais e financeiros diretamente do representante legal ou da pessoa física que administra o estúdio de impressão 3D (para criar o cadastro no sistema, acesso à plataforma e gestão de faturamento do plano), nós tomamos as decisões relativas ao tratamento.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>1.2. PrintLog como OPERADORA:</strong> Quando o Usuário insere na plataforma os dados dos seus próprios clientes finais (ex: nome do consumidor que comprou a peça 3D, valor pago, endereço de entrega), a PrintLog atua exclusivamente como Operadora. Todo o processamento destes dados é efetuado estritamente pelas diretrizes do Usuário (Controlador Final). A PrintLog não utilizará dados dos clientes finais para envio de marketing, comercialização com terceiros ou ações discricionárias próprias.
              </p>
            </div>

            {/* Seção 2 - Quais dados coletamos e suas finalidades */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                2. QUAIS DADOS COLETAMOS E SUAS FINALIDADES
              </h2>
              <p className="mb-3 indent-[1.25cm]">
                Em conformidade à premissa do <em>Privacy by Design</em> e ao princípio da minimização, capturamos unicamente os dados indispensáveis.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>2.1. Dados Cadastrais do Usuário (Estúdio):</strong> Nome, Razão Social, endereço eletrônico (e-mail), senha criptografada e CPF/CNPJ.<br />
                <em>Finalidade:</em> Criação de Identidade, autenticação na plataforma, comunicação de suporte e faturamento de assinatura.<br />
                <em>Base Legal:</em> Execução de Contrato (Art. 7º, inc. V) e Cumprimento de Obrigação Legal (Art. 7º, inc. II da LGPD).
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>2.2. Dados Financeiros/Pagamento (Se aplicável via Gateway):</strong> Informações de cartão de crédito e metadados transacionais.<br />
                <em>Finalidade:</em> Efetivação do pagamento do serviço. (Dados sensíveis curados por tokenização das Gateways).<br />
                <em>Base Legal:</em> Execução de Contrato e Exercício Regular de Direitos.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>2.3. Dados Coletados Automaticamente (Logs do Marco Civil):</strong> Protocolo de Internet (Endereço IP), registro de datas e horários de conexão (<em>timestamp</em>) e navegador.<br />
                <em>Finalidade:</em> Segurança da Informação, rastreabilidade de acessos.<br />
                <em>Base Legal:</em> Cumprimento de Obrigação Legal – MCI e Legítimo Interesse.
              </p>
            </div>



            {/* Seção 3 - Política de Cookies e Rastreadores */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                3. POLÍTICA DE COOKIES E RASTREADORES
              </h2>
              <p className="mb-3 indent-[1.25cm]">
                Para otimizar e fundamentar as funcionalidades da nossa infraestrutura SaaS, fazemos uso de identificadores armazenados localmente no dispositivo (Cookies e afins):
              </p>
              <ul className="list-disc pl-11 mb-3 space-y-2">
                <li>
                  <strong>Cookies Estritamente Necessários (Técnicos):</strong> Essenciais para que o portal opere, permitindo controle de sessões, balanceamento de tráfego de rede e segurança (CSRF). Por serem intrínsecos à aplicação, o aceite decorre da execução do contrato (Art. 7º, inc. V da LGPD).
                </li>
                {/*
                  ADICIONADO: base legal explícita para cookies analíticos (Art. 7º, inc. I da LGPD).
                  O consentimento é a base mais frágil e exige referência expressa, pois pode ser
                  revogado a qualquer momento pelo titular (Art. 8º, § 5º da LGPD).
                */}
                <li>
                  <strong>Cookies Analíticos (Desempenho):</strong> Opcionais e condicionados à permissão modal do Usuário, com base no consentimento livre, informado e inequívoco (Art. 7º, inc. I da LGPD). Permitem contabilizar métricas de acesso e desempenho da Plataforma. O consentimento poderá ser revogado a qualquer momento, sem prejuízo das atividades realizadas anteriormente à revogação.
                </li>
              </ul>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>3.1. Desativação:</strong> O Usuário tem o direito soberano de gerenciar o bloqueio de cookies em seu próprio navegador, porém isentando-nos em situações de eventuais perdas e limitações operacionais provenientes da restrição técnica.
              </p>
            </div>

            {/* Seção 4 - Compartilhamento com Terceiros e Transferência Internacional */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                4. COMPARTILHAMENTO COM TERCEIROS E TRANSFERÊNCIA INTERNACIONAL
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>4.1. Operadores Homologados:</strong> O compromisso da PrintLog é operar um modelo seguro e sem comercialização de dados ("venda"). O compartilhamento está delimitado ao sub-processamento operacional indispensável perante provedores de nuvem (Ex: Cloudflare (infraestrutura e banco de dados), Google Firebase (autenticação) e serviço de envio de e-mail).
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>4.2. Padrões dos Fornecedores:</strong> A PrintLog utiliza exclusivamente fornecedores que possuem políticas de privacidade e segurança publicamente auditadas e certificadas, cujos Termos de Serviço estabelecem obrigações de confidencialidade e proteção de dados.
              </p>
              {/*
                CORRIGIDO: A referência genérica a "Standard Contractual Clauses" (SCCs) foi
                substituída pela Resolução CD/ANPD nº 19/2024, que aprovou as Cláusulas-Padrão
                Contratuais (CPCs) brasileiras e regulamentou os Arts. 33 a 36 da LGPD.
                O período de graça para adequação às CPCs encerrou em 2025, tornando a referência
                anterior insuficiente para fins de conformidade.
              */}
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>4.3. Transferência Internacional:</strong> Devido ao processamento por <em>Cloud Computing</em>, os dados podem ser processados fora do território nacional. A PrintLog utiliza os serviços da Cloudflare e do Google Firebase, ambos com políticas de privacidade e segurança próprias, certificados com ISO 27001 e SOC 2, cujos Termos de Serviço regulam o tratamento de dados em suas infraestruturas.
              </p>
            </div>

            {/* Seção 5 - Tempo de Retenção e Procedimento de Descarte */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                5. TEMPO DE RETENÇÃO E PROCEDIMENTO DE DESCARTE
              </h2>
              <p className="mb-3 indent-[1.25cm]">
                Manteremos as informações unicamente pelo ciclo temporal hábil para satisfazer as finalidades descritas, ou até o trânsito do pedido de eliminação integral solicitado pelo Titular.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>5.1. Obrigação de Guarda Legal:</strong> Mesmo após a rescisão de contrato, manteremos informações imprescindíveis para execução de defesas jurídicas e o cumprimento do Art. 15 do MCI (logs por 6 meses) e registros de aceite de termos e logs de litígio por até 5 anos (prazo prescricional civil — Art. 206 do Código Civil).
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>5.2. Descarte Técnico Seguro:</strong> Quando superada a barreira dos fins previstos, as informações serão apagadas ou submetidas ao processo de anonimização mecânica, de forma que o dado resultante não possa ser associado, direta ou indiretamente, ao seu titular.
              </p>
            </div>

            {/* Seção 6 - Segurança da Informação e Comunicação de Incidentes */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                6. SEGURANÇA DA INFORMAÇÃO E COMUNICAÇÃO DE INCIDENTES
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>6.1. Medidas de Seguridade:</strong> O acesso é protegido por
                criptografia de dados em trânsito (TLS 1.2+) e em repouso (AES-256),
                autenticação gerenciada pelo Google Firebase Auth e controle de
                isolamento por conta (<em>Row Level Security</em>) na infraestrutura
                Cloudflare.
              </p>
              {/*
                CORRIGIDO (3 pontos):
                1. Prazo conta a partir do "conhecimento de que o incidente afetou dados pessoais"
                   (Art. 6º, Resolução CD/ANPD nº 15/2024), não da "confirmação do incidente"
                   — distinção juridicamente relevante em fiscalizações.
                2. Adicionado prazo de complementação de 20 dias úteis (também previsto na
                   Resolução 15/2024).
                3. Adicionado dever de comunicação pública aos titulares por canais disponíveis
                   por no mínimo 3 meses, conforme a mesma resolução.
              */}
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>6.2. Notificação de Incidentes:</strong> Nos termos do Art. 48
                da LGPD e da Resolução CD/ANPD nº 15/2024, em caso de violação de dados
                que configure risco relevante ao titular, a Plataforma enviará
                notificação à ANPD no prazo de 3 (três) dias úteis contados do
                momento em que tomar conhecimento de que o incidente afetou dados
                pessoais, podendo as informações prestadas ser complementadas em até
                20 (vinte) dias úteis após a comunicação inicial. A comunicação aos
                Titulares impactados será realizada pelos canais de divulgação
                disponíveis da Plataforma, contemplando o escopo dos dados envolvidos
                e as medidas de contenção adotadas, sendo mantida por no mínimo
                3 (três) meses.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>6.3. Escopo da Obrigação:</strong> A obrigação de comunicação
                prevista na cláusula 6.2 aplica-se exclusivamente a incidentes que
                envolvam dados pessoais com potencial concreto de dano ao titular.
                Eventos técnicos bloqueados, tentativas de acesso frustradas ou falhas
                sem exposição de dados não caracterizam incidente notificável, nos
                termos da Resolução CD/ANPD nº 15/2024.
              </p>
            </div>

            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                7. OS DIREITOS DO TITULAR DOS DADOS
              </h2>
              <p className="mb-3 indent-[1.25cm]">
                Prestigia-se a liberdade jurídica do titular estipulada no Art. 18 da LGPD, contemplando:
              </p>
              <ul className="list-decimal pl-11 mb-3 space-y-2">
                <li><strong>Confirmação e Acesso:</strong> Evidência da operação e cópia acessível dos dados tratados.</li>
                <li><strong>Correção:</strong> Reparo de dados inexatos, desatualizados ou incompletos.</li>
                <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> Solicitação de anonimização ou bloqueio de dados desnecessários ou excessivos, bem como eliminação de dados tratados com o consentimento do titular.</li>
                <li><strong>Portabilidade:</strong> Exportação autônoma da matriz de dados em formato legível e interoperável.</li>
                <li><strong>Informação sobre Compartilhamento:</strong> Conhecimento das entidades públicas e privadas com as quais a Plataforma realizou uso compartilhado dos dados.</li>
                <li><strong>Informação sobre Negativa de Consentimento:</strong> Ser informado sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa.</li>
                <li><strong>Revogação do Consentimento:</strong> Interrupção do tratamento outrora ratificado, sem prejuízo da licitude dos tratamentos realizados anteriormente.</li>
                <li><strong>Oposição:</strong> Direito de se opor ao tratamento realizado com fundamento em outra base legal que não o consentimento, em caso de descumprimento dos preceitos da LGPD.</li>
                <li><strong>Petição à ANPD:</strong> Encaminhar reclamação à Autoridade Nacional de Proteção de Dados (<a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="hover:underline">www.gov.br/anpd</a>) caso considere que seu direito foi violado.</li>
              </ul>
            </div>

            {/* Seção 8 - Dados de Clientes dos Estúdios e Menores de Idade */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                8. DADOS DE CLIENTES DOS ESTÚDIOS E MENORES DE IDADE
              </h2>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>8.1. Clientes do Estúdio:</strong> Se o Usuário insere dados de eventuais clientes (pedidos de peças 3D), este deverá suportar perante si a anuência jurídica desses indivíduos. A PrintLog é salvaguarda apenas do processamento como ferramenta logística.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                <strong>8.2. Proteção de Menores:</strong> A plataforma não é desenhada ou direcionada para menores de idade. A observância e curadoria de dados de clientes do estúdio menores caberá inteiramente à responsabilidade de gerência do Usuário, nos termos do Art. 14 da LGPD.
              </p>
            </div>

            {/* Seção 9 - Condições Gerais e Atendimento para Exercício de Direitos */}
            <div className="pt-6 print:pt-4 print-avoid-break">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4 print:text-black print-abnt-subtitle">
                9. CONDIÇÕES GERAIS E ATENDIMENTO PARA EXERCÍCIO DE DIREITOS
              </h2>
              <p className="mb-3 indent-[1.25cm]">
                Esta Política poderá suportar revisões pontuais face a inovações legislativas, sendo o Usuário notificado por e-mail ou aviso na Plataforma em caso de alterações relevantes. O <strong>Encarregado pelo Tratamento de Dados Pessoais (DPO)</strong>, nos termos do Art. 41 da LGPD, é o responsável pelo desenvolvimento e operação da Plataforma PrintLog, acessível pelo canal oficial:{" "}
                <a
                  href="mailto:privacidade@printlog.com.br"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  privacidade@printlog.com.br
                </a>
                . O prazo para resposta às solicitações dos titulares é de até 15 (quinze) dias úteis a contar do recebimento pelo canal oficial, conforme Art. 18, § 5º da LGPD.
              </p>
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm font-medium print:border-zinc-300">
              <p className="mt-2 text-emerald-600 dark:text-emerald-400 print:text-black">
                privacidade@printlog.com.br
              </p>
            </div>
          </article>
        </div>

        <footer className="mt-12 text-center print:hidden">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar ao site
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Este documento está em conformidade com a LGPD (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e a Resolução CD/ANPD nº 19/2024.
            <br />© 2026 PrintLog. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
