export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
};

export const sendJSON = (data, status = 200) =>
    Response.json(data, {
        status,
        headers: corsHeaders
    });

export const toNum = (val, fallback = 0) => {
    if (val === null || val === undefined || val === '') return fallback;
    const n = Number(val);
    return isNaN(n) ? fallback : n;
};

export async function initSchema(db) {
    // Usando batch para garantir que todas as tabelas e índices sejam criados de uma vez
    return await db.batch([
        // Filamentos
        db.prepare(`CREATE TABLE IF NOT EXISTS filaments (
            id TEXT PRIMARY KEY, 
            user_id TEXT NOT NULL, 
            nome TEXT NOT NULL, 
            marca TEXT, 
            material TEXT, 
            cor_hex TEXT, 
            peso_total REAL, 
            peso_atual REAL, 
            preco REAL, 
            data_abertura TEXT, 
            favorito INTEGER DEFAULT 0
        )`),
        db.prepare(`CREATE INDEX IF NOT EXISTS idx_filaments_user ON filaments(user_id)`),

        // Impressoras
        db.prepare(`CREATE TABLE IF NOT EXISTS printers (
            id TEXT PRIMARY KEY, 
            user_id TEXT NOT NULL, 
            nome TEXT NOT NULL, 
            marca TEXT, 
            modelo TEXT, 
            status TEXT DEFAULT 'idle', 
            potencia REAL DEFAULT 0, 
            preco REAL DEFAULT 0, 
            rendimento_total REAL DEFAULT 0, 
            horas_totais REAL DEFAULT 0, 
            ultima_manutencao_hora REAL DEFAULT 0, 
            intervalo_manutencao REAL DEFAULT 300, 
            historico TEXT
        )`),
        db.prepare(`CREATE INDEX IF NOT EXISTS idx_printers_user ON printers(user_id)`),

        // Configurações da Calculadora (1:1 com usuário)
        db.prepare(`CREATE TABLE IF NOT EXISTS calculator_settings (
            user_id TEXT PRIMARY KEY, 
            custo_kwh REAL DEFAULT 0, 
            valor_hora_humana REAL DEFAULT 0, 
            custo_hora_maquina REAL DEFAULT 0, 
            taxa_setup REAL DEFAULT 0, 
            consumo_impressora_kw REAL DEFAULT 0, 
            margem_lucro REAL DEFAULT 0, 
            imposto REAL DEFAULT 0, 
            taxa_falha REAL DEFAULT 0, 
            desconto REAL DEFAULT 0, 
            whatsapp_template TEXT
        )`),

        // Projetos / Orçamentos
        db.prepare(`CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY, 
            user_id TEXT NOT NULL, 
            label TEXT NOT NULL, 
            status TEXT DEFAULT 'pending', 
            total_budget REAL DEFAULT 0,
            details TEXT, 
            data TEXT, 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`),
        db.prepare(`CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`)
    ]);
}