-- ==================================================================
-- SCHEMA MESTRE V3: RESET TOTAL (COM PERDA DE DADOS)
-- ==================================================================
-- ATENCAO: ESTE SCRIPT APAGA TUDO. USE COM CUIDADO.

-- 1. LIMPEZA TOTAL (DROP TABLES & VIEWS)
-- DROP VIEW IF EXISTS filament_logs;  -- (Removido para evitar erro se for tabela)
DROP TABLE IF EXISTS filament_logs; 
DROP TABLE IF EXISTS failures;      
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS supply_events;
DROP TABLE IF EXISTS supplies;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS calculator_settings;
DROP TABLE IF EXISTS printers;
DROP TABLE IF EXISTS filaments;

-- ==================================================================
-- RECRIACAO DAS TABELAS (ESTRUTURA FINAL)
-- ==================================================================

-- 1. Filamentos
CREATE TABLE filaments (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    org_id TEXT,
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

-- 2. Logs de Histórico de Filamentos (Unificado: Falhas + Ajustes + Aberturas)
-- Substitui antiga tabela 'failures'
CREATE TABLE filament_logs (
    id TEXT PRIMARY KEY, 
    filament_id TEXT NOT NULL, 
    date TEXT NOT NULL, 
    type TEXT NOT NULL CHECK(type IN ('falha', 'manual', 'abertura', 'consumo', 'ajuste')),
    amount REAL DEFAULT 0, 
    obs TEXT,
    user_id TEXT NOT NULL,    
    printer_id TEXT, 
    model_name TEXT, 
    cost REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Impressoras
CREATE TABLE printers (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    org_id TEXT,
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

-- 4. Configurações da Calculadora
CREATE TABLE calculator_settings (
    user_id TEXT PRIMARY KEY, 
    org_id TEXT,
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

-- 5. Projetos
CREATE TABLE projects (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    org_id TEXT,
    label TEXT NOT NULL, 
    data TEXT, 
    tags TEXT DEFAULT '[]', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tarefas (Todos)
CREATE TABLE todos (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    org_id TEXT,
    text TEXT NOT NULL, 
    done INTEGER DEFAULT 0, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Insumos (Supplies)
CREATE TABLE supplies (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    org_id TEXT,
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

-- 8. Histórico de Insumos (Supply Events)
CREATE TABLE supply_events (
    id TEXT PRIMARY KEY, 
    supply_id TEXT NOT NULL, 
    org_id TEXT,
    user_id TEXT, 
    type TEXT CHECK(type IN ('create', 'update', 'manual', 'abertura', 'delete')), 
    old_stock REAL, 
    new_stock REAL, 
    quantity_change REAL, 
    cost REAL, 
    notes TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Clientes
CREATE TABLE clients (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    org_id TEXT,
    name TEXT NOT NULL, 
    email TEXT, 
    phone TEXT, 
    document TEXT, 
    notes TEXT, 
    address TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Assinaturas (Billing)
CREATE TABLE subscriptions (
    org_id TEXT PRIMARY KEY, 
    plan_id TEXT NOT NULL, 
    status TEXT, 
    current_period_end TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Logs de Auditoria
CREATE TABLE activity_logs (
    id TEXT PRIMARY KEY, 
    org_id TEXT NOT NULL, 
    user_id TEXT NOT NULL, 
    action TEXT NOT NULL, 
    details TEXT, 
    metadata TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
