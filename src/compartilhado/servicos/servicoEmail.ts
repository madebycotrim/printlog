import toast from "react-hot-toast";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";

interface DadosEmailPedido {
  nomeCliente: string;
  emailCliente: string;
  nomeProjeto: string;
}

/**
 * Serviço responsável pelo disparo de e-mails transacionais.
 * Atualmente funciona como um "stub" (simulador), mas está preparado
 * para receber a integração real via SDK do Resend ou SendGrid.
 */
export const servicoEmail = {
  enviarEmailPedidoPronto: async (dados: DadosEmailPedido): Promise<boolean> => {
    try {
      if (!dados.emailCliente) {
         registrar.info(
           { rastreioId: "crm", servico: "servicoEmail" },
           `E-mail ignorado: Cliente ${dados.nomeCliente} não tem e-mail cadastrado.`
         );
         return false;
      }

      // Chama a API Cloudflare que por sua vez chama o Resend
      const resposta = await servicoBaseApi.post<any>('/api/email/enviar-conclusao', dados);

      if (resposta?.mock) {
        registrar.info(
          { rastreioId: "crm", servico: "servicoEmail" },
          `E-mail simulado localmente para ${dados.emailCliente} (Sem API Key configurada)`
        );
      } else {
        registrar.info(
          { rastreioId: "crm", servico: "servicoEmail" },
          `E-mail real disparado via Resend para ${dados.emailCliente}`
        );
      }

      // Feedback visual da automação disparada
      toast.success(`Notificação enviada p/ ${dados.emailCliente}!`, {
        icon: '✉️',
        duration: 4000
      });

      return true;
    } catch (erro) {
      registrar.error(
        { rastreioId: "crm", servico: "servicoEmail" },
        `Falha ao disparar e-mail para ${dados.emailCliente}`,
        erro
      );
      return false;
    }
  }
};
