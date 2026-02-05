import {
    SprayCan, Droplet, Paintbrush,
    Fan, CircleDot, Target, Wrench, Cable, Ruler,
    Usb, Thermometer, CircuitBoard, Zap,
    Package, Link, Hammer, Layers, PackageSearch
} from "lucide-react";

/**
 * Determines the smart icon and theme color for a material based on its name and category.
 * @param {string} name - The name of the material/supply.
 * @param {string} category - The category ID or label.
 * @returns {{hex: string, tailwind: string, label: string, icon: object}} Theme object with icon.
 */
export const getMaterialTheme = (name = "", category = "") => {
    const nameLower = name.toLowerCase();
    const categoryLower = category.toLowerCase();

    // 1. Smart Icon Detection based on Name
    let smartIcon = null;

    // Liquids / Chemicals
    if (nameLower.includes('álcool') || nameLower.includes('alcool') || nameLower.includes('limpa') || nameLower.includes('spray')) smartIcon = SprayCan;
    else if (nameLower.includes('cola') || nameLower.includes('adesivo') || nameLower.includes('graxa') || nameLower.includes('leo') || nameLower.includes('lubrificante')) smartIcon = Droplet;
    else if (nameLower.includes('tinta') || nameLower.includes('pincel') || nameLower.includes('primer') || nameLower.includes('resina')) smartIcon = Paintbrush;

    // Hardware / Mechanical
    else if (nameLower.includes('ventoinha') || nameLower.includes('cooler') || nameLower.includes('fan')) smartIcon = Fan;
    else if (nameLower.includes('rolamento') || nameLower.includes('eixo') || nameLower.includes('polia')) smartIcon = CircleDot;
    else if (nameLower.includes('bico') || nameLower.includes('nozzle')) smartIcon = Target;
    else if (nameLower.includes('parafuso') || nameLower.includes('porca') || nameLower.includes('arruela')) smartIcon = Wrench;
    else if (nameLower.includes('tubo') || nameLower.includes('ptfe') || nameLower.includes('mangueira')) smartIcon = Cable;
    else if (nameLower.includes('guia') || nameLower.includes('linear')) smartIcon = Ruler;

    // Electronics
    else if (nameLower.includes('sd') || nameLower.includes('cartão') || nameLower.includes('memória')) smartIcon = Usb;
    else if (nameLower.includes('usb') || nameLower.includes('pendrive')) smartIcon = Usb;
    else if (nameLower.includes('sensor') || nameLower.includes('termistor') || nameLower.includes('termopar')) smartIcon = Thermometer;
    else if (nameLower.includes('placa') || nameLower.includes('driver') || nameLower.includes('display') || nameLower.includes('tela')) smartIcon = CircuitBoard;
    else if (nameLower.includes('motor') || nameLower.includes('fonte')) smartIcon = Zap;
    else if (nameLower.includes('cabo') || nameLower.includes('fio') || nameLower.includes('conector')) smartIcon = Cable;

    // 2. Visual Theme based on Category
    // Includes Fallback Icons if smartIcon isn't found
    if (categoryLower.includes('embalagem')) return { hex: "#fbbf24", tailwind: "amber", label: category || "Embalagem", icon: smartIcon || Package };
    if (categoryLower.includes('fixação') || categoryLower.includes('fixacao')) return { hex: "#94a3b8", tailwind: "slate", label: category || "Fixação", icon: smartIcon || Link };
    if (categoryLower.includes('eletrônica') || categoryLower.includes('eletronica')) return { hex: "#8b5cf6", tailwind: "violet", label: category || "Eletrônica", icon: smartIcon || Zap };
    if (categoryLower.includes('acabamento')) return { hex: "#ec4899", tailwind: "pink", label: category || "Acabamento", icon: smartIcon || Hammer };
    if (categoryLower.includes('químico') || categoryLower.includes('quimico')) return { hex: "#10b981", tailwind: "emerald", label: category || "Químico", icon: smartIcon || Layers };

    // Default
    return { hex: "#f97316", tailwind: "orange", label: category || "Geral", icon: smartIcon || PackageSearch };
};
