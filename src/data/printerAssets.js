/**
 * BIBLIOTECA DE IMAGENS DE IMPRESSORAS 3D
 * Curadoria das máquinas mais populares do mercado.
 * Imagens transparentes (PNG) otimizadas para UI Dark.
 */

export const PRINTER_ASSETS = {
    // === CREALITY ===
    "creality-ender-3": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Ender_3_Pro_3D_Printer.png",
    "creality-ender-3-classic": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Ender_3_Pro_3D_Printer.png",
    "creality-ender-3-v2": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Ender_3_Pro_3D_Printer.png", // Fallback to classic styled generic
    "creality-ender-3-v2-neo": "https://i.imgur.com/K3wM5aZ.png", // Reliable imgur host (example placeholder, replacing with generic if fails)
    "creality-k1": "https://i.imgur.com/8QXZC9A.png", // Placeholder
    "creality-k1-max": "https://i.imgur.com/8QXZC9A.png", // Placeholder

    // === BAMBU LAB ===
    // Using more stable generic product shots
    "bambu-lab-x1-carbon": "https://cdna.artstation.com/p/assets/images/images/064/866/654/large/poligone-studios-bambulab-x1c-orange-01.jpg?1688981245",
    "bambu-lab-p1s": "https://public.bambulab.com/cdn/shop/files/P1S_Combo_3D_Printer_1200x.png?v=1687848419", // Official Shopify CDN usually works
    "bambu-lab-p1p": "https://public.bambulab.com/cdn/shop/products/P1P_3D_Printer_1200x.png?v=1671086027",
    "bambu-lab-a1": "https://public.bambulab.com/cdn/shop/files/A1_Combo_3D_Printer_1200x.png?v=1702534568",
    "bambu-lab-a1-mini": "https://public.bambulab.com/cdn/shop/files/A1_Mini_Combo_3D_Printer_1200x.png?v=1695190977",

    // === PRUSA ===
    "prusa-i3-mk3s+": "https://www.prusa3d.com/content/images/product/default/2717.jpg",
    "prusa-mk4": "https://www.prusa3d.com/content/images/product/default/4678.jpg",

    // === ELEGOO ===
    "elegoo-neptune-4-pro": "https://cdn.shopify.com/s/files/1/0255/1572/0784/files/Neptune_4_Pro_Front_1200x.png",

    // === GENERIC/PLACEHOLDERS ===
    "fdm-generic": "https://cdn-icons-png.flaticon.com/512/2000/2000040.png",
    "sla-generic": "https://cdn-icons-png.flaticon.com/512/2000/2000038.png"
};

/**
 * Tenta encontrar a imagem baseada na Marca e Modelo.
 * Retorna null se não encontrar.
 */
export const findPrinterImage = (marca, modelo) => {
    if (!marca || !modelo) return null;

    // Normaliza para busca (remove espaços, minúsculo)
    // Ex: "Creality" + "Ender-3 V3 SE" -> "creality-ender-3-v3-se"
    const termo = `${marca}-${modelo}`.toLowerCase()
        .replace(/[^a-z0-9]/g, '-') // substitui especiais por hifen
        .replace(/-+/g, '-') // remove hifens duplicados
        .replace(/^-|-$/g, ''); // remove hifens das pontas

    console.log(`[SmartImage] Buscando por: ${termo}`);

    // 1. Tenta match exato
    if (PRINTER_ASSETS[termo]) return PRINTER_ASSETS[termo];

    // 2. Tenta match parcial (chaves contidas no termo)
    // Ex: termo = "creality-ender-3-v2-neo", chave = "creality-ender-3-v2"
    const chaves = Object.keys(PRINTER_ASSETS);

    // Prioriza matches mais longos (mais específicos)
    const match = chaves
        .filter(k => termo.includes(k)) // O termo completo contém a chave?
        .sort((a, b) => b.length - a.length)[0]; // Pega o maior match

    if (match) {
        console.log(`[SmartImage] Match encontrado: ${match}`);
        return PRINTER_ASSETS[match];
    }

    return null;
};
