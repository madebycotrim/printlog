-- ==================================================================
-- SCHEMA MESTRE: RESET TOTAL E CRIAÇÃO (SEM ORG_ID)
-- ==================================================================

-- A. REMOVE TABELAS ANTIGAS (ORDEM INVERSA DE DEPENDÊNCIA SE HOUVESSE FK)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS supply_events;
DROP TABLE IF EXISTS supplies;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS calculator_settings;
DROP TABLE IF EXISTS printers;
DROP TABLE IF EXISTS failures;
DROP TABLE IF EXISTS filament_logs;
DROP TABLE IF EXISTS filaments;

-- ==================================================================
-- SCHEMA COMPLETO DO PRINTLOG (ATUALIZADO)
-- ==================================================================

-- 1. Filamentos
CREATE TABLE IF NOT EXISTS filaments (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    nome TEXT NOT NULL, 
    marca TEXT, 
    material TEXT, 
    cor_hex TEXT, 
    diametro REAL DEFAULT 1.75,
    peso_total REAL, 
    peso_atual REAL, 
    preco REAL, 
    data_abertura TEXT, 
    favorito INTEGER DEFAULT 0, 
    tags TEXT DEFAULT '[]'
);

-- 2. Logs de Histórico de Filamentos
CREATE TABLE IF NOT EXISTS filament_logs (
    id TEXT PRIMARY KEY, 
    filament_id TEXT, 
    date TEXT, 
    type TEXT, 
    amount REAL, 
    obs TEXT
);

-- 3. Falhas (Global)
CREATE TABLE IF NOT EXISTS failures (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    date TEXT, 
    filament_id TEXT, 
    printer_id TEXT, 
    model_name TEXT, 
    weight_wasted REAL, 
    cost_wasted REAL, 
    reason TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Impressoras
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

-- 5. Configurações da Calculadora
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

-- 6. Projetos
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    label TEXT NOT NULL, 
    data TEXT, 
    tags TEXT DEFAULT '[]', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tarefas (Todos)
CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    text TEXT NOT NULL, 
    done INTEGER DEFAULT 0, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Insumos (Supplies)
CREATE TABLE IF NOT EXISTS supplies (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    name TEXT NOT NULL, 
    price REAL, 
    unit TEXT, 
    min_stock REAL, 
    current_stock REAL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    category TEXT DEFAULT 'Outros', 
    description TEXT, 
    updated_at DATETIME
);

-- 9. Histórico de Insumos (Supply Events)
CREATE TABLE IF NOT EXISTS supply_events (
    id TEXT PRIMARY KEY, 
    supply_id TEXT NOT NULL, 
    user_id TEXT, 
    type TEXT CHECK(type IN ('create', 'update', 'manual', 'abertura', 'delete')), 
    old_stock REAL, 
    new_stock REAL, 
    quantity_change REAL, 
    cost REAL, 
    notes TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Clientes
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    name TEXT NOT NULL, 
    email TEXT, 
    phone TEXT, 
    document TEXT, 
    notes TEXT, 
    address TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Assinaturas (Billing)
CREATE TABLE IF NOT EXISTS subscriptions (
    user_id TEXT PRIMARY KEY, 
    plan_id TEXT NOT NULL, 
    status TEXT, 
    current_period_end TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Logs de Auditoria
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    action TEXT NOT NULL, 
    details TEXT, 
    metadata TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
