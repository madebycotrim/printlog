
/**
 * Tenta identificar um item pelo código (ID) nos arrays fornecidos.
 * Retorna { type, item } ou null.
 * 
 * @param {string} code - O código lido (espera-se que seja um ID)
 * @param {object} context - { filaments, printers, supplies }
 */
export const identifyItem = (code, { filaments = [], printers = [], supplies = [] }) => {
    if (!code) return null;

    // Normalizar codigo (trim)
    const searchId = String(code).trim();

    // 1. Check Filaments
    // Filamentos podem ter ID numérico ou string, dependendo do backend.
    // Vamos converter para string para comparar.
    const filament = filaments.find(f => String(f.id) === searchId);
    if (filament) return { type: 'filament', item: filament };

    // 2. Check Printers
    const printer = printers.find(p => String(p.id) === searchId);
    if (printer) return { type: 'printer', item: printer };

    // 3. Check Supplies
    const supply = supplies.find(s => String(s.id) === searchId);
    if (supply) return { type: 'supply', item: supply };

    return null;
};
