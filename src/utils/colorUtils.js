/**
 * Determines the "Color Family" of a given hex code for grouping purposes.
 * @param {string} hex - The hex color code (e.g., "#ff0000" or "ff0000")
 * @returns {string} The color family name (e.g., "Vermelhos", "Azuis", "Escuros")
 */
export const getColorFamily = (hex) => {
    if (!hex) return "Sem Cor";

    // Normalize hex
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // HSL Conversion for better categorization
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // Achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / d + 2; break;
            case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
    }

    const hue = h * 360;
    const sat = s * 100;
    const light = l * 100;

    // Special Cases (Neutrals)
    if (light < 15) return "Pretos & Escuros";
    if (light > 95) return "Brancos";
    if (sat < 15) return "Cinzas & Pratas";

    // Color Families based on Hue
    if ((hue >= 0 && hue < 15) || (hue >= 340 && hue <= 360)) return "Vermelhos";
    if (hue >= 15 && hue < 40) return "Laranjas & Marrons";
    if (hue >= 40 && hue < 70) return "Amarelos";
    if (hue >= 70 && hue < 160) return "Verdes";
    if (hue >= 160 && hue < 260) return "Azuis & Celestes";
    if (hue >= 260 && hue < 300) return "Roxos & Violetas";
    if (hue >= 300 && hue < 340) return "Rosas & Magentas";

    return "Outros";
};

// Map typical family names to tailwind colors for UI headers
export const FAMILY_COLORS = {
    "Vermelhos": "text-red-500",
    "Laranjas & Marrons": "text-orange-500",
    "Amarelos": "text-yellow-400",
    "Verdes": "text-emerald-500",
    "Azuis & Celestes": "text-sky-500",
    "Roxos & Violetas": "text-violet-500",
    "Rosas & Magentas": "text-pink-500",
    "Pretos & Escuros": "text-zinc-500",
    "Brancos": "text-zinc-200",
    "Cinzas & Pratas": "text-zinc-400",
    "Outros": "text-zinc-500"
};
