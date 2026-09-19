/// <reference types="@cloudflare/workers-types" />

export interface InfoBandeiraTarifaria {
  id: 'verde' | 'amarela' | 'vermelha1' | 'vermelha2' | 'escassez';
  nome: string;
  corHex: string;
  adicionalReaisKwh: number;
  adicionalCentavosKwh: number;
  descricao: string;
  ativa: boolean;
}

const TABELA_BANDEIRAS: InfoBandeiraTarifaria[] = [
  {
    id: 'verde',
    nome: 'Bandeira Verde',
    corHex: '#10b981',
    adicionalReaisKwh: 0.0,
    adicionalCentavosKwh: 0,
    descricao: 'Condições favoráveis de geração hidrelétrica. Sem acréscimo tarifário.',
    ativa: false,
  },
  {
    id: 'amarela',
    nome: 'Bandeira Amarela',
    corHex: '#f59e0b',
    adicionalReaisKwh: 0.01885,
    adicionalCentavosKwh: 1.885,
    descricao: 'Condições de geração menos favoráveis. Acréscimo de R$ 0,019/kWh.',
    ativa: true, // Padrão prudente de planejamento tarifário no Brasil
  },
  {
    id: 'vermelha1',
    nome: 'Bandeira Vermelha - Patamar 1',
    corHex: '#ef4444',
    adicionalReaisKwh: 0.04463,
    adicionalCentavosKwh: 4.463,
    descricao: 'Condições de geração mais custosas (termelétricas). Acréscimo de R$ 0,045/kWh.',
    ativa: false,
  },
  {
    id: 'vermelha2',
    nome: 'Bandeira Vermelha - Patamar 2',
    corHex: '#b91c1c',
    adicionalReaisKwh: 0.07877,
    adicionalCentavosKwh: 7.877,
    descricao: 'Condições críticas de reservatórios. Acréscimo de R$ 0,079/kWh.',
    ativa: false,
  },
  {
    id: 'escassez',
    nome: 'Escassez Hídrica',
    corHex: '#6b21a8',
    adicionalReaisKwh: 0.142,
    adicionalCentavosKwh: 14.2,
    descricao: 'Severa seca hidrológica. Acréscimo de R$ 0,142/kWh.',
    ativa: false,
  },
];

export const onRequestGet: PagesFunction = async () => {
  const agora = new Date();
  const mesAtual = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return new Response(JSON.stringify({
    sucesso: true,
    mesReferencia: mesAtual,
    bandeiraPadrao: 'amarela',
    bandeiras: TABELA_BANDEIRAS,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=43200, s-maxage=43200',
    },
  });
};
