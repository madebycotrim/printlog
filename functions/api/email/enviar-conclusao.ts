/// <reference types="@cloudflare/workers-types" />
import { aplicarHeadersCors } from "../utilitarios/cors";
import { escaparHtml } from "../utilitarios/sanitizacao";

interface Env {
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
  const { request, env, data } = context;

  // CORS handling seguro e restritivo
  const headers = aplicarHeadersCors(new Headers(), request, "POST, OPTIONS");

  // Bloqueio de Segurança: Apenas operadores autenticados podem disparar e-mails de conclusão
  const usuarioId = data?.uid;
  if (!usuarioId) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers,
    });
  }

  try {
    const corpo = await request.json() as any;
    const { emailCliente } = corpo;
    const nomeCliente = escaparHtml(corpo.nomeCliente);
    const nomeProjeto = escaparHtml(corpo.nomeProjeto);

    if (!emailCliente) {
      return new Response(JSON.stringify({ error: "Faltam campos obrigatórios." }), {
        status: 400,
        headers,
      });
    }

    const resendApiKey = env.RESEND_API_KEY;

    const subject = `Seu pedido está pronto! - ${nomeProjeto || "Projeto"}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #10b981;">Olá${nomeCliente ? ", " + nomeCliente : ""}! 🎉</h2>
        <p>Temos uma ótima notícia: seu projeto de impressão 3D <strong>${nomeProjeto || "encomendado"}</strong> acaba de ser finalizado!</p>
        <p>Ele já passou por todas as etapas de produção, qualidade e pós-processamento, e está pronto para entrega ou retirada.</p>
        <p>Entre em contato conosco para combinar a entrega.</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          Este é um e-mail automático gerado pelo sistema PrintLog.
        </p>
      </div>
    `;

    // Se o usuário ainda não colocou a chave da API no env, apenas "fingimos" que enviou para não quebrar o dev
    if (!resendApiKey || resendApiKey === "") {
      console.log("-----------------------------------------");
      console.log("🚀 MODO OFFLINE (Sem RESEND_API_KEY configurada)");
      console.log(`Simulando envio de e-mail de conclusão para: ${emailCliente}`);
      console.log(`Assunto: ${subject}`);
      console.log("-----------------------------------------");
      return new Response(JSON.stringify({ success: true, mock: true }), { headers });
    }

    // Chama a API do Resend Oficial
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // IMPORTANTE: O "from" deve ser um domínio verificado no Resend.
        // Enquanto o domínio não estiver verificado, o Resend usa "onboarding@resend.dev" para testes.
        from: `PrintLog <onboarding@resend.dev>`,
        to: emailCliente,
        subject: subject,
        html: htmlBody,
      }),
    });

    const resendData = (await resendResponse.json()) as any;

    if (!resendResponse.ok) {
      console.error("Erro do Resend:", resendData);
      throw new Error(resendData.message || "Falha ao enviar e-mail pelo Resend");
    }

    return new Response(JSON.stringify({ success: true, data: resendData }), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Erro interno ao enviar e-mail:", error);
    return new Response(JSON.stringify({ error: error.message || "Erro desconhecido" }), {
      status: 500,
      headers,
    });
  }
}

export const onRequestOptions: PagesFunction = async (context) => {
  const headers = aplicarHeadersCors(new Headers(), context.request, "POST, OPTIONS");
  return new Response(null, { headers });
};
