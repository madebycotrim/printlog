/**
 * CÁLCULO DE ROI E ESTATÍSTICAS FINANCEIRAS
 * Extraído para testes unitários.
 */

export const calcularEstatisticasGlobais = (projects = []) => {
    let receitaTotal = 0;
    let custoTotal = 0;
    let lucroTotal = 0;
    let custoEnergia = 0;
    let custoMaterial = 0;

    const projetosValidos = projects.filter(p => p.data?.status === 'finalizado' || p.data?.status === 'entregue');

    projetosValidos.forEach(p => {
        const res = p.data?.resultados || {};
        const itemReceita = Number(res.precoComDesconto || res.precoSugerido || 0);
        const itemLucro = Number(res.lucroBrutoUnitario || 0);
        const itemCusto = Number(res.custoUnitario || 0);
        const itemEnergia = Number(res.custoEnergia || 0);
        const itemMaterial = Number(res.custoMaterial || 0);

        const qtd = Number(res.quantidadePecas || 1);

        receitaTotal += itemReceita * qtd;
        custoTotal += itemCusto * qtd;
        lucroTotal += itemLucro * qtd;
        custoEnergia += itemEnergia * qtd;
        custoMaterial += itemMaterial * qtd;
    });

    return { receitaTotal, custoTotal, lucroTotal, custoEnergia, custoMaterial };
};

export const calcularRoiPorImpressora = (projects = [], printers = []) => {
    const map = {}; // printerId -> { revenue, profit, prints }

    projects.forEach(p => {
        const status = p.data?.status;
        if (status !== 'finalizado' && status !== 'entregue') return;

        // Normalização de IDs
        const pId = p.data?.entradas?.printerId || p.data?.printerId || p.data?.entradas?.idImpressoraSelecionada;

        // Vamos garantir que estamos lidando com strings para evitar problemas de "1" vs 1
        const printerIdStr = String(pId || "");

        if (!printerIdStr) return;

        if (!map[printerIdStr]) map[printerIdStr] = { revenue: 0, profit: 0, prints: 0 };

        const res = p.data?.resultados || {};
        const qtd = Number(res.quantidadePecas || 1);

        map[printerIdStr].revenue += (Number(res.precoComDesconto || 0) * qtd);
        map[printerIdStr].profit += (Number(res.lucroBrutoUnitario || 0) * qtd);
        map[printerIdStr].prints += qtd;
    });

    return printers.map(imp => {
        // Busca usando string
        const idStr = String(imp.id);
        const dadosProj = map[idStr] || { revenue: 0, profit: 0, prints: 0 };
        const custoAq = Number(imp.preco || 0);
        const roi = custoAq > 0 ? (dadosProj.profit / custoAq) * 100 : 0;

        return {
            ...imp,
            stats: dadosProj,
            roi
        };
    }).sort((a, b) => b.stats.profit - a.stats.profit);
};
