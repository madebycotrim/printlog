import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Termos de Uso - Padrão ABNT e Linguagem Simples.
 * Natureza Jurídica: Contrato de Licenciamento de Software.
 */
export default function PaginaTermosUso() {
  const navegar = useNavigate();
  const dataVersao = "14 de maio de 2026 (Versão 1.1)";

  return (
    <div className="folha-a4-container">
      {/* Botões de Ação (não saem na impressão) */}
      <div className="fixed top-6 left-6 no-print z-50">
        <button
          onClick={() => navegar(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-white/10 text-white rounded-xl hover:bg-zinc-800 transition-all backdrop-blur-md shadow-xl"
        >
          <ArrowLeft size={16} />
          Voltar ao Site
        </button>
      </div>

      {/* Folha A4 Simulada */}
      <article className="folha-a4">
        <h1 className="abnt-titulo">
          TERMOS DE USO E LICENÇA DE SOFTWARE
        </h1>

        <p className="abnt-texto">
          Este documento é um contrato entre você e o <strong>PrintLog</strong>. Ao criar uma conta e usar nosso sistema, você concorda com as regras abaixo. Leia com atenção.
        </p>

        <h2 className="abnt-subtitulo">1. O QUE É O PRINTLOG?</h2>
        <p className="abnt-texto">
          O PrintLog é um software de gestão para quem trabalha com impressão 3D (makers e estúdios). Ele ajuda a calcular custos, gerenciar materiais, clientes e orçamentos. Ao usar o sistema, você não está comprando o software, mas sim "alugando" o direito de usá-lo (Licença de Uso).
        </p>

        <h2 className="abnt-subtitulo">2. QUEM PODE USAR?</h2>
        <p className="abnt-texto">
          Qualquer pessoa com mais de 18 anos ou empresas legalmente constituídas. Você deve fornecer informações verdadeiras no cadastro e é o único responsável pela segurança da sua senha.
        </p>

        <h2 className="abnt-subtitulo">3. REGRAS DE BOA CONDUTA</h2>
        <p className="abnt-texto">
          Você se compromete a usar o sistema de forma honesta. É proibido:
        </p>
        <ul className="abnt-lista">
          <li>Tentar copiar o código ou o design do sistema;</li>
          <li>Usar robôs para extrair dados;</li>
          <li>Usar o sistema para fins ilegais;</li>
          <li>Emprestar ou vender sua conta para outras pessoas.</li>
        </ul>

        <h2 className="abnt-subtitulo">4. RESPONSABILIDADES</h2>
        <p className="abnt-texto">
          Nós nos esforçamos para que o sistema esteja sempre no ar, mas não podemos garantir que ele nunca terá falhas técnicas. O PrintLog é uma ferramenta de apoio; a decisão final sobre seus lucros, preços e gestão do seu estúdio é sempre sua.
        </p>

        <h2 className="abnt-subtitulo">5. GRATUIDADE E PLANOS</h2>
        <p className="abnt-texto">
          Atualmente o PrintLog é gratuito. Se no futuro decidirmos criar planos pagos, avisaremos você com pelo menos 30 dias de antecedência para que você decida se quer continuar ou não.
        </p>

        <h2 className="abnt-subtitulo">6. PROPRIEDADE INTELECTUAL</h2>
        <p className="abnt-texto">
          Tudo o que você vê no PrintLog (design, logomarca, códigos e ideias) pertence ao criador do sistema. Você tem o direito de usar a ferramenta, mas não se torna dono dela.
        </p>

        <h2 className="abnt-subtitulo">7. CANCELAMENTO</h2>
        <p className="abnt-texto">
          Você pode cancelar sua conta a qualquer momento direto pelo painel. Nós também podemos suspender contas que desrespeitem estas regras ou que tentem prejudicar o sistema.
        </p>

        <h2 className="abnt-subtitulo">8. DÚVIDAS</h2>
        <p className="abnt-texto">
          Caso precise de ajuda ou tenha dúvidas sobre este contrato, entre em contato via: <strong>suporte@printlog.com.br</strong>.
        </p>

        <div className="abnt-rodape">
          <p>Documento atualizado em: {dataVersao}</p>
          <p>PrintLog - Gestão Inteligente para Impressão 3D</p>
          <p>Regido pelas leis da República Federativa do Brasil</p>
        </div>
      </article>
    </div>
  );
}
