export const CORES_MAIS_VENDIDAS = [
    "#000000", // Preto
    "#ffffff", // Branco
    "#9ca3af", // Cinza
    "#ef4444", // Vermelho
    "#3b82f6", // Azul
    "#22c55e", // Verde
    "#eab308", // Amarelo
    "#f97316", // Laranja
    "#a855f7", // Roxo
    "#ffd700", // Dourado
];

export const MATERIAIS_HIGROSCOPICOS = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA', 'PVA', 'BVOH', 'PA6', 'PA12'];

export const CORES_RESINA = [
    "#6b7280", // Cinza (Standard)
    "#000000", // Preto
    "#ffffff", // Branco
    "#e2e8f0", // Transparente (Clear)
    "#f5d0a9", // Skin/Beige
    "#22c55e", // Verde Translúcido
    "#ef4444", // Vermelho Translúcido
    "#3b82f6", // Azul Translúcido
];

export const OPCOES_MARCAS_FDM = [{
    group: "Fabricantes FDM",
    items: ["3D Lab", "3DFila", "3DX Filamentos", "3N3", "Anycubic", "Bambu Lab", "Brasfila", "Cliever", "ColorFabb", "Creality", "Elegoo", "eSun", "F3D", "Fillamentum", "Geeetech", "GTMax3D", "Hatchbox", "Kingroon", "MatterHackers", "National 3D", "Overture", "Polymaker", "Printalot", "Prusament", "Sunlu", "Tríade 3D", "Voxelab", "Voolt3D"].map(m => ({ value: m, label: m }))
}];

export const OPCOES_MARCAS_RESINA = [{
    group: "Fabricantes Resina",
    items: [
        "Anycubic", "Creality", "Elegoo", "eSUN", "Loja 3D", "Nova3D", "Phrozen",
        "Quanton 3D", "Redelease (R3D)", "Resione", "Siraya Tech", "Smooth 3D",
        "3D Lab", "3DFila", "Voolt3D"
    ].sort().map(m => ({ value: m, label: m }))
}];

export const OPCOES_TIPOS = {
    FDM: [
        {
            group: "PLA",
            items: [
                "PLA", "PLA Silk", "PLA Matte", "PLA High Speed", "PLA Tough",
                "PLA Glitter", "PLA Glow in the Dark", "PLA Wood (Madeira)",
                "PLA Stone (Mármore)", "PLA CF (Carbon Fiber)"
            ].map(t => ({ value: t, label: t }))
        },
        {
            group: "PETG",
            items: [
                "PETG", "PETG Transparente", "PETG CF (Carbon Fiber)"
            ].map(t => ({ value: t, label: t }))
        },
        {
            group: "ABS",
            items: ["ABS", "ABS+"].map(t => ({ value: t, label: t }))
        },
        {
            group: "ASA",
            items: ["ASA"].map(t => ({ value: t, label: t }))
        },
        {
            group: "TPU / Flexíveis",
            items: [
                "TPU", "TPU High Flow", "TPU 95A", "TPE", "Filamento Flexível"
            ].map(t => ({ value: t, label: t }))
        },
        {
            group: "Nylon (Poliamida)",
            items: [
                "Nylon (PA6)", "Nylon (PA12)", "Nylon CF (Carbon Fiber)", "Nylon GF (Glass Fiber)"
            ].map(t => ({ value: t, label: t }))
        },
        {
            group: "PC (Policarbonato)",
            items: ["PC (Policarbonato)", "PC-ABS"].map(t => ({ value: t, label: t }))
        },
        {
            group: "Suporte",
            items: ["HIPS", "PVA", "BVOH"].map(t => ({ value: t, label: t }))
        },
        {
            group: "Outros Engenharia",
            items: [
                "PP (Polipropileno)", "POM (Acetal)", "PEEK", "Resistência Química"
            ].map(t => ({ value: t, label: t }))
        },
        {
            group: "Especiais",
            items: [
                "Metal Fill", "Filamento Cerâmico", "Magnético", "Condutivo",
                "Antichamas", "Reciclado (rPLA/rPETG)", "Biodegradável Especial"
            ].map(t => ({ value: t, label: t }))
        }
    ],
    SLA: [
        {
            group: "Uso Geral",
            items: ["Standard", "Estéticas"].map(t => ({ value: t, label: t }))
        },
        {
            group: "Engenharia",
            items: ["Tough / Durable", "Flexível", "High Temp", "Engenharia"].map(t => ({ value: t, label: t }))
        },
        {
            group: "Especiais",
            items: ["Castable", "Biocompatível"].map(t => ({ value: t, label: t }))
        }
    ]
};

export const MATERIAIS_RESINA_FLAT = OPCOES_TIPOS.SLA.flatMap(group => group.items.map(i => i.value));
export const MATERIAIS_FDM_FLAT = OPCOES_TIPOS.FDM.flatMap(group => group.items.map(i => i.value));
