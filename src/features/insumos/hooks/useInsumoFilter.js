import { useMemo } from "react";
import { normalizeString } from "../../../utils/stringUtils";

export const useInsumoFilter = (supplies, deferredBusca, filters) => {
    return useMemo(() => {
        try {
            const lista = supplies || [];
            const termo = normalizeString(deferredBusca);

            if (!lista.length) {
                return {
                    groupedItems: {},
                    stats: { totalValor: 0, baixoEstoque: 0, zerados: 0, custoReposicao: 0, totalItems: 0 },
                    filteredList: []
                };
            }

            // 1. Inicializa as estatísticas
            let stats = {
                totalValor: 0,
                baixoEstoque: 0,
                zerados: 0,
                custoReposicao: 0,
                totalItems: 0
            };

            // 2. Filtragem e Preparação
            let filtrados = lista.map(item => ({
                ...item,
                _searchStr: normalizeString(`${item.name} ${item.description || ""} ${item.brand || ""} ${item.supplier || ""}`)
            })).filter(item => {
                // Filtro de Busca
                if (termo && !item._searchStr.includes(termo)) return false;

                // Filtro de Categoria
                const itemCategory = normalizeString(item.category || item.categoria || 'outros');
                if (filters.categories?.length > 0 && !filters.categories.includes(itemCategory)) return false;

                // Filtro de Baixo Estoque
                if (filters.lowStock) {
                    const current = Number(item.currentStock || item.estoque_atual || 0);
                    const min = Number(item.minStock || item.estoque_minimo || 0);
                    if (current >= min) return false;
                }

                return true;
            });

            // 3. Ordenação
            filtrados.sort((a, b) => {
                const getPrice = (i) => Number(i.price || i.preco || 0);
                const getStock = (i) => Number(i.currentStock || i.estoque_atual || 0);
                const getName = (i) => (i.name || "").toLowerCase();

                switch (filters.sortOption) {
                    case 'price_desc':
                        return getPrice(b) - getPrice(a);
                    case 'price_asc':
                        return getPrice(a) - getPrice(b);
                    case 'stock_desc':
                        return getStock(b) - getStock(a);
                    case 'stock_asc':
                        return getStock(a) - getStock(b);
                    case 'name':
                    default:
                        return getName(a).localeCompare(getName(b));
                }
            });

            // 4. Agrupamento e Estatísticas Final
            const grupos = filtrados.reduce((acc, item) => {
                // Estatísticas
                const qtd = Number(item.currentStock || item.estoque_atual || 0);
                const preco = Number(item.price || item.preco || 0);
                const min = Number(item.minStock || item.estoque_minimo || 0);

                stats.totalItems += 1;
                stats.totalValor += (qtd * preco);
                if (qtd < min) stats.baixoEstoque += 1;
                if (qtd === 0) stats.zerados += 1;
                if (qtd < min) stats.custoReposicao += ((min - qtd) * preco);

                // Agrupamento Dinâmico
                const rawCategory = item.category || item.categoria || 'Outros';
                const label = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();

                if (!acc[label]) acc[label] = [];
                acc[label].push(item);
                return acc;
            }, {});

            // 5. Ordenar Grupos
            const gruposOrdenados = Object.keys(grupos).sort().reduce((obj, key) => {
                obj[key] = grupos[key];
                return obj;
            }, {});

            return {
                groupedItems: gruposOrdenados,
                stats,
                filteredList: filtrados
            };

        } catch (error) {
            console.error("CRASH IN USE_INSUMO_FILTER", error);
            return {
                groupedItems: {},
                stats: { totalValor: 0, baixoEstoque: 0, zerados: 0, custoReposicao: 0, totalItems: 0 },
                filteredList: []
            };
        }
    }, [supplies, deferredBusca, filters]);
};
