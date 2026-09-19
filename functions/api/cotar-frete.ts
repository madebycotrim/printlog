/// <reference types="@cloudflare/workers-types" />

export interface OpcaoFrete {
  id: string;
  transportadora: string;
  servico: string;
  prazoDiasMin: number;
  prazoDiasMax: number;
  prazoTexto: string;
  valorCentavos: number;
  valorFormatado: string;
  destaque?: boolean;
}

function obterUfPorCep(cep: string): string {
  const num = parseInt(cep.replace(/\D/g, '').slice(0, 5), 10);
  if (isNaN(num)) return 'SP';

  if (num >= 1000 && num <= 19999) return 'SP';
  if (num >= 20000 && num <= 28999) return 'RJ';
  if (num >= 29000 && num <= 29999) return 'ES';
  if (num >= 30000 && num <= 39999) return 'MG';
  if (num >= 40000 && num <= 48999) return 'BA';
  if (num >= 49000 && num <= 49999) return 'SE';
  if (num >= 50000 && num <= 56999) return 'PE';
  if (num >= 57000 && num <= 57999) return 'AL';
  if (num >= 58000 && num <= 58999) return 'PB';
  if (num >= 59000 && num <= 59999) return 'RN';
  if (num >= 60000 && num <= 63999) return 'CE';
  if (num >= 64000 && num <= 64999) return 'PI';
  if (num >= 65000 && num <= 65999) return 'MA';
  if (num >= 66000 && num <= 68899) return 'PA';
  if (num >= 68900 && num <= 68999) return 'AP';
  if (num >= 69000 && num <= 69299) return 'AM';
  if (num >= 69300 && num <= 69399) return 'RR';
  if (num >= 69400 && num <= 69899) return 'AM';
  if (num >= 69900 && num <= 69999) return 'AC';
  if ((num >= 70000 && num <= 72799) || (num >= 73000 && num <= 73399)) return 'DF';
  if ((num >= 72800 && num <= 72999) || (num >= 73400 && num <= 76799)) return 'GO';
  if (num >= 76800 && num <= 76999) return 'RO';
  if (num >= 77000 && num <= 77999) return 'TO';
  if (num >= 78000 && num <= 78899) return 'MT';
  if (num >= 79000 && num <= 79999) return 'MS';
  if (num >= 80000 && num <= 87999) return 'PR';
  if (num >= 88000 && num <= 89999) return 'SC';
  if (num >= 90000 && num <= 99999) return 'RS';

  return 'SP';
}

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const cepDestino = (url.searchParams.get('destino') || '').replace(/\D/g, '');
  const cepOrigem = (url.searchParams.get('origem') || '01001000').replace(/\D/g, '');

  if (cepDestino.length !== 8) {
    return new Response(JSON.stringify({ sucesso: false, erro: 'CEP de destino inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const ufOrigem = obterUfPorCep(cepOrigem);
  const ufDestino = obterUfPorCep(cepDestino);

  const mesmoEstado = ufOrigem === ufDestino;
  const regiaoSudesteSul = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'];
  const mesmaRegiao = regiaoSudesteSul.includes(ufOrigem) && regiaoSudesteSul.includes(ufDestino);

  let opcoes: OpcaoFrete[] = [];

  if (mesmoEstado) {
    opcoes = [
      {
        id: 'correios-sedex',
        transportadora: 'Correios',
        servico: 'SEDEX',
        prazoDiasMin: 1,
        prazoDiasMax: 2,
        prazoTexto: '1 a 2 dias úteis',
        valorCentavos: 2390,
        valorFormatado: 'R$ 23,90',
        destaque: true,
      },
      {
        id: 'jadlog-package',
        transportadora: 'Jadlog',
        servico: '.Package',
        prazoDiasMin: 2,
        prazoDiasMax: 4,
        prazoTexto: '2 a 4 dias úteis',
        valorCentavos: 1690,
        valorFormatado: 'R$ 16,90',
      },
      {
        id: 'correios-pac',
        transportadora: 'Correios',
        servico: 'PAC',
        prazoDiasMin: 3,
        prazoDiasMax: 5,
        prazoTexto: '3 a 5 dias úteis',
        valorCentavos: 1950,
        valorFormatado: 'R$ 19,50',
      },
    ];
  } else if (mesmaRegiao) {
    opcoes = [
      {
        id: 'jadlog-package',
        transportadora: 'Jadlog',
        servico: '.Package',
        prazoDiasMin: 3,
        prazoDiasMax: 5,
        prazoTexto: '3 a 5 dias úteis',
        valorCentavos: 2490,
        valorFormatado: 'R$ 24,90',
        destaque: true,
      },
      {
        id: 'correios-pac',
        transportadora: 'Correios',
        servico: 'PAC',
        prazoDiasMin: 5,
        prazoDiasMax: 7,
        prazoTexto: '5 a 7 dias úteis',
        valorCentavos: 2890,
        valorFormatado: 'R$ 28,90',
      },
      {
        id: 'correios-sedex',
        transportadora: 'Correios',
        servico: 'SEDEX',
        prazoDiasMin: 2,
        prazoDiasMax: 3,
        prazoTexto: '2 a 3 dias úteis',
        valorCentavos: 4290,
        valorFormatado: 'R$ 42,90',
      },
    ];
  } else {
    opcoes = [
      {
        id: 'jadlog-package',
        transportadora: 'Jadlog',
        servico: '.Package',
        prazoDiasMin: 5,
        prazoDiasMax: 8,
        prazoTexto: '5 a 8 dias úteis',
        valorCentavos: 3690,
        valorFormatado: 'R$ 36,90',
        destaque: true,
      },
      {
        id: 'correios-pac',
        transportadora: 'Correios',
        servico: 'PAC',
        prazoDiasMin: 7,
        prazoDiasMax: 11,
        prazoTexto: '7 a 11 dias úteis',
        valorCentavos: 4350,
        valorFormatado: 'R$ 43,50',
      },
      {
        id: 'correios-sedex',
        transportadora: 'Correios',
        servico: 'SEDEX',
        prazoDiasMin: 2,
        prazoDiasMax: 4,
        prazoTexto: '2 a 4 dias úteis',
        valorCentavos: 6990,
        valorFormatado: 'R$ 69,90',
      },
    ];
  }

  return new Response(JSON.stringify({
    sucesso: true,
    ufOrigem,
    ufDestino,
    opcoes,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
