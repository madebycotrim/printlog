/// <reference types="@cloudflare/workers-types" />

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const cepParam = url.searchParams.get('cep') || '';
  const cepLimpo = cepParam.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    return new Response(JSON.stringify({ sucesso: false, erro: 'CEP deve conter 8 dígitos numéricos.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Consulta BrasilAPI v2 (com fallback para v1 se necessário)
    let resposta = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`, {
      headers: { 'User-Agent': 'PrintLog-Edge/1.0' },
      signal: controller.signal,
    });

    if (!resposta.ok) {
      resposta = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`, {
        headers: { 'User-Agent': 'PrintLog-Edge/1.0' },
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (!resposta.ok) {
      return new Response(JSON.stringify({ sucesso: false, erro: 'CEP não encontrado ou indisponível.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const dados = await resposta.json() as any;

    const resultado = {
      sucesso: true,
      cep: dados.cep || cepLimpo,
      logradouro: dados.street || dados.logradouro || '',
      bairro: dados.neighborhood || dados.bairro || '',
      cidade: dados.city || dados.localidade || '',
      estado: dados.state || dados.uf || '',
      ibge: dados.ibge || '',
      ddd: dados.ddd || '',
    };

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return new Response(JSON.stringify({ sucesso: false, erro: 'Falha ao consultar serviço de CEP.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
};
