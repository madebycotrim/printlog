/// <reference types="@cloudflare/workers-types" />
import { aplicarHeadersCors } from "../utilitarios/cors";
import { escaparHtml, ehUrlSegura } from "../utilitarios/sanitizacao";
import { verificarRateLimit } from "../utilitarios/rate-limit";

interface Env {
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
  const { request, env, data } = context;

  // CORS handling seguro e restritivo
  const headers = aplicarHeadersCors(new Headers(), request, "POST, OPTIONS");

  // Bloqueio de Segurança: Apenas operadores autenticados podem disparar e-mails de orçamento
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
  const limitCheck = verificarRateLimit(`${usuarioId}:${ip}`, "email-orcamento", 15, 60_000);
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
    const { emailDestino, linkMagico } = corpo;

    // Sanitização estrita contra CRLF injection em headers/From/Subject
    const nomeCliente = escaparHtml(corpo.nomeCliente ? String(corpo.nomeCliente).replace(/[\r\n]+/g, " ").trim() : "");
    const nomeEstudioRaw = (corpo.nomeEstudio ? String(corpo.nomeEstudio).replace(/[\r\n]+/g, " ").trim() : "");
    const nomeEstudio = escaparHtml(nomeEstudioRaw);
    const nomeEstudioFrom = nomeEstudioRaw.replace(/[<>"'\\]/g, ""); // Seguro para o header From
    const nomeProjeto = escaparHtml(corpo.nomeProjeto ? String(corpo.nomeProjeto).replace(/[\r\n]+/g, " ").trim() : "");
    const valorTotal = escaparHtml(corpo.valorTotal ? String(corpo.valorTotal).replace(/[\r\n]+/g, " ").trim() : "");

    if (!emailDestino || !linkMagico || !nomeEstudioRaw) {
      return new Response(JSON.stringify({ error: "Faltam campos obrigatórios." }), {
        status: 400,
        headers,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof emailDestino !== "string" || !emailRegex.test(emailDestino.trim())) {
      return new Response(JSON.stringify({ error: "E-mail de destino inválido." }), {
        status: 400,
        headers,
      });
    }

    // Valida que o link mágico aponte estritamente para rotas de orçamento do PrintLog
    const validarLinkOrcamento = (link: string, reqUrl: string): boolean => {
      if (typeof link !== "string" || !link.trim() || !ehUrlSegura(link)) return false;
      const limpa = link.trim();
      if (limpa.startsWith("/o/") || limpa.startsWith("/orcamento/")) return true;

      try {
        const urlObj = new URL(limpa);
        const reqObj = new URL(reqUrl);
        if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") return false;
        if (!urlObj.pathname.startsWith("/o/") && !urlObj.pathname.startsWith("/orcamento")) return false;

        const host = urlObj.hostname.toLowerCase();
        const allowedHosts = [
          reqObj.hostname.toLowerCase(),
          "printlog.com.br",
          "www.printlog.com.br",
          "localhost",
          "127.0.0.1",
        ];
        return allowedHosts.includes(host) || host.endsWith(".pages.dev");
      } catch {
        return false;
      }
    };

    if (!validarLinkOrcamento(linkMagico, request.url)) {
      return new Response(JSON.stringify({ error: "Link de orçamento inválido ou não autorizado." }), {
        status: 400,
        headers,
      });
    }

    const resendApiKey = env.RESEND_API_KEY;

    const subject = `Seu orçamento de impressão 3D está pronto - ${nomeEstudioFrom || "PrintLog"}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0ea5e9;">Olá${nomeCliente ? ", " + nomeCliente : ""}!</h2>
        <p>Seu orçamento de impressão 3D para <strong>${nomeProjeto || "seu projeto"}</strong> foi finalizado por <strong>${nomeEstudio}</strong>.</p>
        ${valorTotal ? `<p style="font-size: 18px;">Valor estimado: <strong>${valorTotal}</strong></p>` : ""}
        <p>Você pode visualizar todos os detalhes e aprovar o orçamento clicando no botão abaixo:</p>
        <div style="margin: 30px 0;">
          <a href="${linkMagico}" style="background-color: #0ea5e9; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Visualizar Orçamento Seguro</a>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          Este é um e-mail automático gerado pela plataforma PrintLog em nome de ${nomeEstudio}.
        </p>
      </div>
    `;

    // Se o usuário ainda não colocou a chave da API no env, apenas "fingimos" que enviou para não quebrar o dev
    if (!resendApiKey || resendApiKey === "") {
      console.log("-----------------------------------------");
      console.log("🚀 MODO OFFLINE (Sem RESEND_API_KEY configurada)");
      console.log(`Simulando envio de e-mail para: ${emailDestino}`);
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
        from: `${nomeEstudioFrom || "Ateliê"} via PrintLog <onboarding@resend.dev>`,
        to: emailDestino.trim(),
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
