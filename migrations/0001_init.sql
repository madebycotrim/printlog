-- Migration number: 0001 	 2024-05-22T00:00:00.000Z

CREATE TABLE IF NOT EXISTS filaments (
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
    favorito INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS printers (
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
);

CREATE TABLE IF NOT EXISTS calculator_settings (
    user_id TEXT PRIMARY KEY,
    custo_kwh REAL,
    valor_hora_humana REAL,
    custo_hora_maquina REAL,
    taxa_setup REAL,
    consumo_impressora_kw REAL,
    margem_lucro REAL,
    imposto REAL,
    taxa_falha REAL,
    desconto REAL,
    whatsapp_template TEXT,
    theme TEXT DEFAULT 'dark',
    primary_color TEXT DEFAULT 'sky'
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,
    data TEXT,
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
