export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

/**
 * Ordena um array de opções colocando os mais frequentemente usados no topo, 
 * marcados com uma estrela discreta (⋆).
 * 
 * @param opcoes As opções base do select
 * @param valoresHistorico Array de strings com os valores já cadastrados pelo usuário (ex: ['Creality', 'Voolt 3D', 'Creality'])
 * @param limite Top N itens para subir pro topo (Padrão: 3)
 */
export function ordenarOpcoesPorFrequencia(
  opcoes: OpcaoSelect[],
  valoresHistorico: string[],
  limite: number = 3
): OpcaoSelect[] {
  if (!valoresHistorico || valoresHistorico.length === 0) return opcoes;

  // 1. Contar frequência
  const frequencia: Record<string, number> = {};
  for (const val of valoresHistorico) {
    if (!val) continue;
    const v = val.trim();
    frequencia[v] = (frequencia[v] || 0) + 1;
  }

  // 2. Filtrar as opções que o usuário de fato já usou e ordenar por frequência
  const opcoesUsadas = opcoes.filter(o => frequencia[o.valor] > 0);
  opcoesUsadas.sort((a, b) => frequencia[b.valor] - frequencia[a.valor]);

  // 3. Pegar apenas o Top N
  const topOpcoes = opcoesUsadas.slice(0, limite);

  // 4. Se não houve nada usado do catálogo padrão, retorna o catálogo como está
  if (topOpcoes.length === 0) return opcoes;

  // 5. Mapear o top com a estrela discreta
  const topFormatado: OpcaoSelect[] = topOpcoes.map(o => ({
    valor: o.valor,
    rotulo: `⋆ ${o.rotulo}`
  }));

  // 6. Retornar a junção (clones com estrela + toda a lista original intacta)
  return [...topFormatado, ...opcoes];
}
