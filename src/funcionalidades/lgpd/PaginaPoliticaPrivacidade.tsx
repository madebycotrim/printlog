import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/compartilhado/estilos/documentos-abnt.css";

/**
 * Política de Privacidade - Padrão ABNT e Linguagem Simples.
 * Conformidade: LGPD (Lei 13.709/2018) e Recomendações ANPD.
 */
export default function PaginaPoliticaPrivacidade() {
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
          POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS
        </h1>

        <p className="abnt-texto">
          Olá! Bem-vindo ao <strong>PrintLog</strong>. Esta política explica, de forma clara e direta, como cuidamos das suas informações quando você utiliza nosso sistema de gestão para estúdios de impressão 3D. Estamos comprometidos em proteger sua privacidade conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <h2 className="abnt-subtitulo">1. QUEM É O RESPONSÁVEL PELOS SEUS DADOS?</h2>
        <p className="abnt-texto">
          O <strong>PrintLog</strong> (projeto de software de titularidade de pessoa física) é o "Controlador" dos seus dados. Isso significa que decidimos como suas informações são usadas para que você possa acessar o sistema.
        </p>
        <p className="abnt-texto">
          <strong>Importante:</strong> Se você cadastrar dados dos <em>seus</em> clientes no sistema, você é o responsável (Controlador) por esses dados, e nós somos apenas a ferramenta que os processa (Operador).
        </p>

        <h2 className="abnt-subtitulo">2. QUAIS INFORMAÇÕES COLETAMOS E PARA QUÊ?</h2>
        <p className="abnt-texto">
          Coletamos apenas o mínimo necessário para o sistema funcionar bem:
        </p>
        <ul className="abnt-lista">
          <li><strong>Dados de Cadastro:</strong> Nome completo e e-mail. (Para identificar você e permitir o login).</li>
          <li><strong>Dados Técnicos:</strong> Endereço IP e registros de acesso. (Exigência da lei Marco Civil da Internet para segurança).</li>
          <li><strong>Cookies:</strong> Pequenos arquivos para lembrar suas preferências. (Você pode desligar os cookies de desempenho se desejar).</li>
        </ul>

        <h2 className="abnt-subtitulo">3. COM QUEM COMPARTILHAMOS OS DADOS?</h2>
        <p className="abnt-texto">
          Não vendemos seus dados para ninguém. Compartilhamos apenas com serviços de tecnologia essenciais (como Cloudflare para o banco de dados e Google para o login), que seguem padrões internacionais de segurança.
        </p>

        <h2 className="abnt-subtitulo">4. POR QUANTO TEMPO GUARDAMOS SEUS DADOS?</h2>
        <p className="abnt-texto">
          Guardamos suas informações enquanto sua conta estiver ativa. Se você decidir sair, apagaremos tudo, exceto o que a lei nos obriga a guardar (como registros de acesso por 6 meses).
        </p>

        <h2 className="abnt-subtitulo">5. QUAIS SÃO OS SEUS DIREITOS?</h2>
        <p className="abnt-texto">
          A LGPD garante que você tenha controle total. Você pode nos pedir para:
        </p>
        <ul className="abnt-lista">
          <li>Confirmar se estamos usando seus dados;</li>
          <li>Corrigir informações erradas;</li>
          <li>Apagar seus dados permanentemente;</li>
          <li>Exportar seus dados para levar para outro lugar.</li>
        </ul>

        <h2 className="abnt-subtitulo">6. SEGURANÇA</h2>
        <p className="abnt-texto">
          Tratamos seus dados como se fossem nossos. Usamos criptografia e ferramentas modernas para evitar qualquer tipo de vazamento ou acesso não autorizado.
        </p>

        <h2 className="abnt-subtitulo">7. CONTATO (DPO)</h2>
        <p className="abnt-texto">
          Se tiver qualquer dúvida ou quiser exercer um de seus direitos, mande um e-mail para nosso responsável por dados: <strong>privacidade@printlog.com.br</strong>. Responderemos em até 15 dias úteis.
        </p>

        <div className="abnt-rodape">
          <p>Documento atualizado em: {dataVersao}</p>
          <p>PrintLog - Gestão Inteligente para Impressão 3D</p>
          <p>Em conformidade com a Lei nº 13.709/2018 (LGPD)</p>
        </div>
      </article>
    </div>
  );
}
