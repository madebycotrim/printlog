-- Filamentos
CREATE TABLE IF NOT EXISTS filaments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, nome TEXT NOT NULL, marca TEXT, material TEXT, cor_hex TEXT, diametro TEXT DEFAULT '1.75', peso_total REAL, peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0, tags TEXT DEFAULT '[]');

-- Impressoras
CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, nome TEXT NOT NULL, marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0, preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0, ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300, historico TEXT);

-- Configurações
CREATE TABLE IF NOT EXISTS calculator_settings (user_id TEXT PRIMARY KEY, org_id TEXT, custo_kwh REAL, valor_hora_humana REAL, custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL, margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL, whatsapp_template TEXT, theme TEXT DEFAULT 'dark', primary_color TEXT DEFAULT 'sky');

-- Projetos
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, label TEXT NOT NULL, data TEXT, tags TEXT DEFAULT '[]', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

-- Todos
CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, text TEXT NOT NULL, done INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

-- Falhas
CREATE TABLE IF NOT EXISTS failures (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, date TEXT, filament_id TEXT, printer_id TEXT, model_name TEXT, weight_wasted REAL, cost_wasted REAL, reason TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

-- Insumos
-- Insumos
CREATE TABLE IF NOT EXISTS supplies (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, name TEXT NOT NULL, price REAL, unit TEXT, min_stock REAL, current_stock REAL, category TEXT DEFAULT 'Outros', description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME);

-- Histórico de Insumos
CREATE TABLE IF NOT EXISTS supply_events (id TEXT PRIMARY KEY, supply_id TEXT NOT NULL, org_id TEXT, user_id TEXT, type TEXT CHECK(type IN ('create', 'update', 'manual', 'abertura', 'delete')), old_stock REAL, new_stock REAL, quantity_change REAL, cost REAL, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

-- Assinaturas (Billing)
CREATE TABLE IF NOT EXISTS subscriptions (org_id TEXT PRIMARY KEY, plan_id TEXT NOT NULL, status TEXT, current_period_end TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

-- Clientes (NEW)
CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, name TEXT NOT NULL, email TEXT, phone TEXT, document TEXT, notes TEXT, address TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

-- Logs de Auditoria
CREATE TABLE IF NOT EXISTS activity_logs (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, user_id TEXT NOT NULL, action TEXT NOT NULL, details TEXT, metadata TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
