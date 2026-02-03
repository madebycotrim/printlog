-- ==================================================================
-- SCHEMA MESTRE V6: FULL UPGRADE (PT-BR)
-- Versão Corrigida - Inclui criado_em em todas as tabelas
-- ==================================================================

-- 1. LIMPEZA TOTAL
DROP TRIGGER IF EXISTS atualizar_percentual_filamento;
DROP TRIGGER IF EXISTS atualizar_timestamp_filamentos;
DROP TRIGGER IF EXISTS atualizar_timestamp_impressoras;
DROP TRIGGER IF EXISTS atualizar_timestamp_projetos;
DROP TRIGGER IF EXISTS atualizar_timestamp_insumos;
DROP VIEW IF EXISTS dashboard_consumo;
DROP VIEW IF EXISTS custos_projetos;
DROP VIEW IF EXISTS alertas_estoque_baixo;
DROP VIEW IF EXISTS uso_impressoras;
DROP TABLE IF EXISTS filamentos_log;
DROP TABLE IF EXISTS sistema_log;
DROP TABLE IF EXISTS impressoras_log;
DROP TABLE IF EXISTS assinaturas;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS insumos_log;
DROP TABLE IF EXISTS insumos;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS projetos;
DROP TABLE IF EXISTS configuracoes_calculadora;
DROP TABLE IF EXISTS impressoras;
DROP TABLE IF EXISTS filamentos;

-- ==================================================================
-- RECRIACAO DAS TABELAS
-- ==================================================================

-- 1. Filamentos
CREATE TABLE filamentos (
    id TEXT PRIMARY KEY, 
    usuario_id TEXT NOT NULL, 
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
    tags TEXT DEFAULT '[]',
    percentual_restante REAL,
    dias_desde_abertura INTEGER,
    versao INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP, -- Adicionado para integridade
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletado_em DATETIME
);

-- 2. Filamentos Log
CREATE TABLE filamentos_log (
    id TEXT PRIMARY KEY, 
    filamento_id TEXT NOT NULL, 
    data TEXT NOT NULL, 
    tipo TEXT NOT NULL CHECK(tipo IN ('falha', 'manual', 'abertura', 'consumo', 'ajuste')),
    quantidade REAL DEFAULT 0, 
    observacao TEXT,
    usuario_id TEXT NOT NULL,    
    impressora_id TEXT, 
    nome_modelo TEXT, 
    custo REAL DEFAULT 0,
    projeto_id TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filamento_id) REFERENCES filamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL,
    FOREIGN KEY (impressora_id) REFERENCES impressoras(id) ON DELETE SET NULL
);

-- 3. Impressoras
CREATE TABLE impressoras (
    id TEXT PRIMARY KEY, 
    usuario_id TEXT NOT NULL, 
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
    historico TEXT,
    versao INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP, -- Adicionado para consistência
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletado_em DATETIME
);

-- 4. Impressoras Log
CREATE TABLE impressoras_log (
    id TEXT PRIMARY KEY,
    impressora_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    data TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('manutencao', 'ajuste', 'uso', 'observacao')),
    observacao TEXT,
    horas_operacao REAL,
    custo REAL DEFAULT 0,
    projeto_id TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (impressora_id) REFERENCES impressoras(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL
);

-- 5. Configurações da Calculadora
CREATE TABLE configuracoes_calculadora (
    usuario_id TEXT PRIMARY KEY, 
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
    tema TEXT DEFAULT 'dark', 
    cor_primaria TEXT DEFAULT 'sky',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Projetos
CREATE TABLE projetos (
    id TEXT PRIMARY KEY, 
    usuario_id TEXT NOT NULL, 
    nome TEXT NOT NULL, 
    data TEXT, 
    tags TEXT DEFAULT '[]', 
    versao INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletado_em DATETIME
);

-- 7. Tarefas
CREATE TABLE tarefas (
    id TEXT PRIMARY KEY, 
    usuario_id TEXT NOT NULL, 
    texto TEXT NOT NULL, 
    concluida INTEGER DEFAULT 0, 
    versao INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletado_em DATETIME
);

-- 8. Insumos
CREATE TABLE insumos (
    id TEXT PRIMARY KEY, 
    usuario_id TEXT NOT NULL, 
    nome TEXT NOT NULL, 
    preco REAL, 
    unidade TEXT, 
    estoque_minimo REAL, 
    estoque_atual REAL, 
    categoria TEXT DEFAULT 'Outros', 
    marca TEXT,
    link_compra TEXT,
    descricao TEXT, 
    unidade_uso TEXT,
    rendimento_estoque REAL DEFAULT 1,
    versao INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP, 
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletado_em DATETIME
);

-- 9. Insumos Log
CREATE TABLE insumos_log (
    id TEXT PRIMARY KEY, 
    insumo_id TEXT NOT NULL, 
    usuario_id TEXT, 
    tipo TEXT CHECK(tipo IN ('criacao', 'atualizacao', 'manual', 'abertura', 'exclusao', 'consumo')), 
    estoque_anterior REAL, 
    estoque_novo REAL, 
    mudanca_quantidade REAL, 
    custo REAL, 
    observacoes TEXT, 
    projeto_id TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL
);

-- 10. Clientes
CREATE TABLE clientes (
    id TEXT PRIMARY KEY, 
    usuario_id TEXT NOT NULL, 
    nome TEXT NOT NULL, 
    email TEXT, 
    telefone TEXT, 
    documento TEXT, 
    observacoes TEXT, 
    endereco TEXT, 
    versao INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletado_em DATETIME
);

-- 11. Assinaturas
CREATE TABLE assinaturas (
    plano_id TEXT NOT NULL, 
    status TEXT, 
    fim_periodo_atual TEXT, 
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Sistema Log
CREATE TABLE sistema_log (
    id TEXT PRIMARY KEY, 
    usuario_id TEXT NOT NULL, 
    acao TEXT NOT NULL, 
    detalhes TEXT, 
    metadados TEXT, 
    ip_address TEXT,
    user_agent TEXT,
    nivel TEXT CHECK(nivel IN ('info', 'warning', 'error')) DEFAULT 'info',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================================
-- ÍNDICES
-- ==================================================================

-- Filamentos
CREATE INDEX idx_filamentos_usuario ON filamentos(usuario_id) WHERE deletado_em IS NULL;
CREATE INDEX idx_filamentos_material ON filamentos(material) WHERE deletado_em IS NULL;
CREATE INDEX idx_filamentos_favorito ON filamentos(favorito) WHERE deletado_em IS NULL;

-- Filamentos Log
CREATE INDEX idx_filamentos_log_filamento ON filamentos_log(filamento_id);
CREATE INDEX idx_filamentos_log_projeto ON filamentos_log(projeto_id);
CREATE INDEX idx_filamentos_log_data ON filamentos_log(data DESC);
CREATE INDEX idx_filamentos_log_tipo ON filamentos_log(tipo);

-- Impressoras
CREATE INDEX idx_impressoras_usuario ON impressoras(usuario_id) WHERE deletado_em IS NULL;
CREATE INDEX idx_impressoras_status ON impressoras(status) WHERE deletado_em IS NULL;

-- Impressoras Log
CREATE INDEX idx_impressoras_log_impressora ON impressoras_log(impressora_id);
CREATE INDEX idx_impressoras_log_projeto ON impressoras_log(projeto_id);
CREATE INDEX idx_impressoras_log_data ON impressoras_log(data DESC);

-- Insumos
CREATE INDEX idx_insumos_usuario ON insumos(usuario_id) WHERE deletado_em IS NULL;
CREATE INDEX idx_insumos_categoria ON insumos(categoria) WHERE deletado_em IS NULL;

-- Insumos Log
CREATE INDEX idx_insumos_log_insumo ON insumos_log(insumo_id);
CREATE INDEX idx_insumos_log_projeto ON insumos_log(projeto_id);

-- Projetos
CREATE INDEX idx_projetos_usuario ON projetos(usuario_id) WHERE deletado_em IS NULL;
CREATE INDEX idx_projetos_data ON projetos(criado_em DESC) WHERE deletado_em IS NULL;

-- Sistema Log
CREATE INDEX idx_sistema_log_usuario ON sistema_log(usuario_id);
CREATE INDEX idx_sistema_log_data ON sistema_log(criado_em DESC);
CREATE INDEX idx_sistema_log_nivel ON sistema_log(nivel);

-- ==================================================================
-- TRIGGERS
-- ==================================================================

-- Atualizar percentual restante do filamento
CREATE TRIGGER atualizar_percentual_filamento 
AFTER UPDATE OF peso_atual, peso_total ON filamentos
WHEN NEW.peso_total > 0
BEGIN
    UPDATE filamentos 
    SET percentual_restante = (NEW.peso_atual / NEW.peso_total) * 100
    WHERE id = NEW.id;
END;

-- Atualizar timestamp de modificação
CREATE TRIGGER atualizar_timestamp_filamentos
AFTER UPDATE ON filamentos
BEGIN
    UPDATE filamentos 
    SET atualizado_em = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER atualizar_timestamp_impressoras
AFTER UPDATE ON impressoras
BEGIN
    UPDATE impressoras 
    SET atualizado_em = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER atualizar_timestamp_projetos
AFTER UPDATE ON projetos
BEGIN
    UPDATE projetos 
    SET atualizado_em = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER atualizar_timestamp_insumos
AFTER UPDATE ON insumos
BEGIN
    UPDATE insumos 
    SET atualizado_em = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- ==================================================================
-- VIEWS (Relatórios)
-- ==================================================================

-- Dashboard de consumo
CREATE VIEW dashboard_consumo AS
SELECT 
    DATE(data) as dia,
    tipo,
    SUM(quantidade) as total_quantidade,
    SUM(custo) as total_custo,
    COUNT(*) as num_movimentacoes
FROM filamentos_log
GROUP BY DATE(data), tipo;

-- Custos por projeto
CREATE VIEW custos_projetos AS
SELECT 
    p.id,
    p.nome,
    p.criado_em,
    COALESCE(SUM(fl.custo), 0) as custo_filamentos,
    COALESCE(SUM(il.custo), 0) as custo_insumos,
    COALESCE(SUM(fl.custo), 0) + COALESCE(SUM(il.custo), 0) as custo_total
FROM projetos p
LEFT JOIN filamentos_log fl ON fl.projeto_id = p.id
LEFT JOIN insumos_log il ON il.projeto_id = p.id
WHERE p.deletado_em IS NULL
GROUP BY p.id, p.nome, p.criado_em;

-- Estoque baixo
CREATE VIEW alertas_estoque_baixo AS
SELECT 
    f.id,
    f.nome,
    f.material,
    f.cor_hex,
    f.peso_atual,
    f.percentual_restante
FROM filamentos f
WHERE f.deletado_em IS NULL 
  AND f.percentual_restante < 20
UNION ALL
SELECT 
    i.id,
    i.nome,
    i.categoria as material,
    NULL as cor_hex,
    i.estoque_atual as peso_atual,
    (i.estoque_atual / NULLIF(i.estoque_minimo, 0)) * 100 as percentual_restante
FROM insumos i
WHERE i.deletado_em IS NULL 
  AND i.estoque_atual < i.estoque_minimo;

-- Uso de impressoras
CREATE VIEW uso_impressoras AS
SELECT 
    imp.id,
    imp.nome,
    imp.horas_totais,
    imp.rendimento_total,
    COUNT(il.id) as num_usos,
    SUM(il.horas_operacao) as horas_em_projetos
FROM impressoras imp
LEFT JOIN impressoras_log il ON il.impressora_id = imp.id AND il.tipo = 'uso'
WHERE imp.deletado_em IS NULL
GROUP BY imp.id, imp.nome, imp.horas_totais, imp.rendimento_total;
