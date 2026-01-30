export const CORES_MAIS_VENDIDAS = [
    "#000000", "#ffffff", "#9ca3af", "#ef4444", "#3b82f6",
    "#22c55e", "#eab308", "#f97316", "#a855f7", "#ec4899",
    "#1e3a8a", "#ffd700", "#06b6d4",
    "#14b8a6", "#6366f1", "#84cc16", "#f43f5e"
];

export const OPCOES_MARCAS = [{
    group: "Fabricantes",
    items: ["3D Lab", "3DFila", "3DX Filamentos", "3N3", "Anycubic", "Bambu Lab", "Brasfila", "Cliever", "ColorFabb", "Creality", "Elegoo", "eSun", "F3D", "Fillamentum", "Geeetech", "GTMax3D", "Hatchbox", "Kingroon", "MatterHackers", "National 3D", "Overture", "Polymaker", "Printalot", "Prusament", "Sunlu", "Tríade 3D", "Voxelab", "Voolt3D"].map(m => ({ value: m, label: m }))
}];

export const OPCOES_TIPOS = [
    {
        group: "Materiais",
        items: [
            // PLA e variações
            "PLA",
            "PLA+",
            "PLA Pro",
            "PLA Silk",
            "PLA Matte",
            "PLA High Speed",
            "PLA Tough",

            // PETG e derivados
            "PETG",
            "PETG Pro",
            "PETG CF",

            // ABS / ASA
            "ABS",
            "ASA",

            // Flexíveis
            "TPU",
            "TPU 85A",
            "TPU 90A",
            "TPU 95A",
            "TPE",

            // Técnicos
            "Nylon (PA)",
            "PA6",
            "PA66",
            "PA12",
            "Nylon CF",
            "Nylon GF",
            "PC",
            "PC ABS",
            "POM",

            // Compostos e especiais
            "Carbon Fiber (CF)",
            "Glass Fiber (GF)",
            "Madeira",
            "Bambu",
            "Cortiça",
            "Mármore",
            "Metal Filled",
            "Ceramic Filled",

            // Visuais / efeitos
            "Silk",
            "Glow in the Dark",
            "Translúcido",
            "Multicolor",
            "Gradient",
            "Sparkle",
            "Glitter",

            // Suporte
            "PVA",
            "HIPS",
            "BVOH"
        ].map(t => ({ value: t, label: t }))
    }
];
