/// <reference types="@cloudflare/workers-types" />

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const cnpjParam = url.searchParams.get('cnpj') || '';
  const cnpjLimpo = cnpjParam.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) {
    return new Response(JSON.stringify({ sucesso: false, erro: 'CNPJ deve conter 14 dígitos numéricos.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
      headers: { 'User-Agent': 'PrintLog-Edge/1.0' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resposta.ok) {
      return new Response(JSON.stringify({ sucesso: false, erro: 'CNPJ não encontrado na base oficial.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const dados = await resposta.json() as any;

    const resultado = {
      sucesso: true,
      cnpj: dados.cnpj || cnpjLimpo,
      razaoSocial: dados.razao_social || '',
      nomeFantasia: dados.nome_fantasia || dados.razao_social || '',
      cnaeDescricao: dados.cnae_fiscal_descricao || '',
      situacaoCadastral: dados.descricao_situacao_cadastral || 'ATIVA',
      dataInicioAtividade: dados.data_inicio_atividade || '',
      email: dados.email || '',
      telefone: dados.ddd_telefone_1 ? `(${dados.ddd_telefone_1.slice(0, 2)}) ${dados.ddd_telefone_1.slice(2)}` : '',
      endereco: {
        cep: dados.cep || '',
        logradouro: dados.logradouro || '',
        numero: dados.numero || '',
        complemento: dados.complemento || '',
        bairro: dados.bairro || '',
        municipio: dados.municipio || '',
        uf: dados.uf || '',
      },
    };

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=43200, s-maxage=43200',
      },
    });
  } catch {
    return new Response(JSON.stringify({ sucesso: false, erro: 'Falha ao consultar CNPJ.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
};
