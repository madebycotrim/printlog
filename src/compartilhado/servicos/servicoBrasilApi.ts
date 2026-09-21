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
    // Falha de rede ou servidor
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
    // Falha de rede ou servidor
  }

  return {
    sucesso: false,
    cnpj,
    razaoSocial: '',
    nomeFantasia: '',
    cnaeDescricao: '',
    situacaoCadastral: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: '' },
    erro: 'Não foi possível consultar o CNPJ na base oficial.',
  };
}
