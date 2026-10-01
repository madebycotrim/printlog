/// <reference types="@cloudflare/workers-types" />
import { aplicarHeadersCors } from "../utilitarios/cors";
import { escaparHtml } from "../utilitarios/sanitizacao";
import { verificarRateLimit } from "../utilitarios/rate-limit";

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

  // Prevenção de Abuso e Esgotamento de Cota Resend
  const ip = request.headers.get("cf-connecting-ip") || usuarioId;
  const limitCheck = verificarRateLimit(`${usuarioId}:${ip}`, "email-conclusao", 15, 60_000);
  if (!limitCheck.permitido) {
    headers.set("Content-Type", "application/json");
    headers.set("Retry-After", String(limitCheck.segundosParaReset));
    return new Response(
      JSON.stringify({ error: "Limite de envios de e-mail atingido. Aguarde alguns instantes." }),
      { status: 429, headers }
    );
  }

  try {
    const corpo = await request.json() as any;
    const { emailCliente } = corpo;
    // Sanitização rigorosa contra CRLF injection em headers/assuntos de e-mail
    const nomeCliente = escaparHtml(corpo.nomeCliente ? String(corpo.nomeCliente).replace(/[\r\n]+/g, " ").trim() : "");
    const nomeProjeto = escaparHtml(corpo.nomeProjeto ? String(corpo.nomeProjeto).replace(/[\r\n]+/g, " ").trim() : "");

    if (!emailCliente || typeof emailCliente !== "string") {
      return new Response(JSON.stringify({ error: "Faltam campos obrigatórios." }), {
        status: 400,
        headers,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailCliente.trim())) {
      return new Response(JSON.stringify({ error: "E-mail de cliente inválido." }), {
        status: 400,
        headers,
      });
    }

    const resendApiKey = env.RESEND_API_KEY;

    // Assunto seguro e sem quebras de linha
    const subject = `Seu pedido 3D ficou pronto! 🚀 - ${nomeProjeto || "Projeto"}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #10b981;">Oba${nomeCliente ? ", " + nomeCliente : ""}! Boas notícias.</h2>
        <p>A impressão 3D do seu projeto <strong>${nomeProjeto || "encomendado"}</strong> acabou de ser concluída com sucesso!</p>
        <p>Já estamos preparando tudo com muito cuidado para a entrega ou retirada.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #666; font-size: 14px;">Em breve você receberá as instruções de rastreio ou retirada.</p>
        <p style="color: #999; font-size: 12px; margin-top: 32px;">Notificação enviada via PrintLog.</p>
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
        from: `PrintLog <onboarding@resend.dev>`,
        to: emailCliente.trim(),
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
};

export const onRequestOptions: PagesFunction = async (context) => {
  const headers = aplicarHeadersCors(new Headers(), context.request, "POST, OPTIONS");
  return new Response(null, { headers });
};
