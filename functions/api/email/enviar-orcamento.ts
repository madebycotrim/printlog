export async function onRequestPost(context: any) {
  const { request, env } = context;

  // CORS handling
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    const data = await request.json();
    const { emailDestino, nomeCliente, nomeEstudio, linkMagico, valorTotal, nomeProjeto } = data;

    if (!emailDestino || !linkMagico || !nomeEstudio) {
      return new Response(JSON.stringify({ error: "Faltam campos obrigatórios." }), {
        status: 400,
        headers,
      });
    }

    const resendApiKey = env.RESEND_API_KEY;

    const subject = `Seu orçamento de impressão 3D está pronto - ${nomeEstudio}`;
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
        // IMPORTANTE: O "from" deve ser um domínio verificado no Resend.
        // Enquanto o domínio não estiver verificado, o Resend usa "onboarding@resend.dev" para testes.
        from: `${nomeEstudio} via PrintLog <onboarding@resend.dev>`,
        to: emailDestino,
        subject: subject,
        html: htmlBody,
      }),
    });

    const resendData = await resendResponse.json();

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

export async function onRequestOptions() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(null, { headers });
}
