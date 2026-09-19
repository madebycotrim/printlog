/**
 * Serviço de Integração com a BrasilAPI via Cloudflare Functions (Edge).
 * Fornece consulta de CEP e consulta de CNPJ com preenchimento automático.
 */

export interface RespostaCepBrasilApi {
  sucesso: boolean;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  ibge?: string;
  ddd?: string;
  erro?: string;
}

export interface RespostaCnpjBrasilApi {
  sucesso: boolean;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnaeDescricao: string;
  situacaoCadastral: string;
  dataInicioAtividade?: string;
  email?: string;
  telefone?: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
  };
  erro?: string;
}

export async function consultarCep(cep: string): Promise<RespostaCepBrasilApi> {
  const limpo = cep.replace(/\D/g, '');
  if (limpo.length !== 8) {
    return { sucesso: false, cep, logradouro: '', bairro: '', cidade: '', estado: '', erro: 'CEP incompleto' };
  }

  try {
    const res = await fetch(`/api/consulta-cep?cep=${limpo}`);
    if (res.ok) {
      return (await res.json()) as RespostaCepBrasilApi;
    }
  } catch {
    // Fallback silencioso
  }

  // Fallback direto via BrasilAPI pública caso o proxy local esteja desligado
  try {
    const fallback = await fetch(`https://brasilapi.com.br/api/cep/v2/${limpo}`);
    if (fallback.ok) {
      const d = (await fallback.json()) as any;
      return {
        sucesso: true,
        cep: d.cep || limpo,
        logradouro: d.street || '',
        bairro: d.neighborhood || '',
        cidade: d.city || '',
        estado: d.state || '',
        ddd: d.ddd,
      };
    }
  } catch {
    // Falha em ambos
  }

  return { sucesso: false, cep, logradouro: '', bairro: '', cidade: '', estado: '', erro: 'Não foi possível encontrar o CEP.' };
}

export async function consultarCnpj(cnpj: string): Promise<RespostaCnpjBrasilApi> {
  const limpo = cnpj.replace(/\D/g, '');
  if (limpo.length !== 14) {
    return {
      sucesso: false,
      cnpj,
      razaoSocial: '',
      nomeFantasia: '',
      cnaeDescricao: '',
      situacaoCadastral: '',
      endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: '' },
      erro: 'CNPJ incompleto',
    };
  }

  try {
    const res = await fetch(`/api/consulta-cnpj?cnpj=${limpo}`);
    if (res.ok) {
      return (await res.json()) as RespostaCnpjBrasilApi;
    }
  } catch {
    // Fallback silencioso
  }

  // Fallback direto via BrasilAPI pública
  try {
    const fallback = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${limpo}`);
    if (fallback.ok) {
      const d = (await fallback.json()) as any;
      return {
        sucesso: true,
        cnpj: d.cnpj || limpo,
        razaoSocial: d.razao_social || '',
        nomeFantasia: d.nome_fantasia || d.razao_social || '',
        cnaeDescricao: d.cnae_fiscal_descricao || '',
        situacaoCadastral: d.descricao_situacao_cadastral || 'ATIVA',
        email: d.email || '',
        telefone: d.ddd_telefone_1 ? `(${d.ddd_telefone_1.slice(0, 2)}) ${d.ddd_telefone_1.slice(2)}` : '',
        endereco: {
          cep: d.cep || '',
          logradouro: d.logradouro || '',
          numero: d.numero || '',
          complemento: d.complemento || '',
          bairro: d.bairro || '',
          municipio: d.municipio || '',
          uf: d.uf || '',
        },
      };
    }
  } catch {
    // Falha
  }

  return {
    sucesso: false,
    cnpj,
    razaoSocial: '',
    nomeFantasia: '',
    cnaeDescricao: '',
    situacaoCadastral: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: '' },
    erro: 'Não foi possível encontrar os dados do CNPJ.',
  };
}
