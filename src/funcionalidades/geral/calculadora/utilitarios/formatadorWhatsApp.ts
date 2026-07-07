import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

export interface OpcoesMensagemWhatsApp {
  precoSugeridoCentavos: number;
  incluirLink: boolean;
  urlLinkMagico?: string;
  nomeEstudio?: string;
}

export function gerarMensagemWhatsApp({
  precoSugeridoCentavos,
  incluirLink,
  urlLinkMagico,
  nomeEstudio = "Meu Estúdio 3D",
}: OpcoesMensagemWhatsApp): string {
  const valorFormatado = centavosParaReais(precoSugeridoCentavos);
  
  let baseTemplate = `Olá, tudo bem? 👋\n\nAqui está o orçamento do seu projeto:\n\n*Serviço:* Impressão 3D de Alta Qualidade 🖨️\n*Estúdio:* ${nomeEstudio}\n*Investimento:* R$ ${valorFormatado}\n\n_Prazo de produção e entrega sob consulta._`;
  
  if (incluirLink && urlLinkMagico) {
    baseTemplate += `\n\nVocê pode conferir os detalhes e *assinar digitalmente* o orçamento acessando este link seguro:\n${urlLinkMagico}`;
  } else {
    baseTemplate += "\n\nO *PDF* com todos os detalhes está em anexo!";
  }

  baseTemplate += "\n\nFico à disposição para fecharmos! 🚀";
  
  return baseTemplate;
}

export function abrirWhatsAppComMensagem(mensagem: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}
