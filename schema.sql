-- PrintLog V2

CREATE TABLE IF NOT EXISTS consentimentos_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    versao_termos VARCHAR(20) NOT NULL,
    ip_origem VARCHAR(45),
    data_aceite TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_revogacao TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    anonimizado BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos_impressao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    id_cliente UUID REFERENCES clientes(id),
    descricao TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'a_fazer',
    valor_centavos BIGINT NOT NULL,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_conclusao TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    id_cliente UUID REFERENCES clientes(id), -- Vínculo opcional com cliente
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    valor_centavos BIGINT NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    -- Colunas LGPD Obrigatórias (Regra 9.0)
    id_consentimento UUID REFERENCES consentimentos_usuario(id),
    base_legal VARCHAR(50) NOT NULL DEFAULT 'obrigacao_legal',
    finalidade_coleta TEXT NOT NULL DEFAULT 'Registro de fluxo de caixa para fins fiscais e gerenciais',
    prazo_retencao_meses INTEGER NOT NULL DEFAULT 60, -- Lei 9.430/1996
    anonimizado BOOLEAN DEFAULT FALSE,
    data_anonimizacao TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS impressoras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    nome VARCHAR(255) NOT NULL,
    marca VARCHAR(255),
    modelo_base VARCHAR(255),
    tecnologia VARCHAR(20) NOT NULL CHECK (tecnologia IN ('FDM', 'SLA', 'DLP', 'LCD')),
    status VARCHAR(50) NOT NULL DEFAULT 'livre',
    valor_compra_centavos BIGINT,
    taxa_hora_centavos BIGINT,
    horimetro_total_minutos INTEGER DEFAULT 0,
    intervalo_revisao_minutos INTEGER,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_aposentadoria TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS historico_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    id_impressora UUID REFERENCES impressoras(id),
    data TIMESTAMPTZ NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Preventiva', 'Corretiva', 'Melhoria')),
    descricao TEXT NOT NULL,
    custo_centavos BIGINT DEFAULT 0,
    tempo_parada_minutos INTEGER
);

CREATE TABLE IF NOT EXISTS pecas_desgaste (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    id_impressora UUID REFERENCES impressoras(id),
    nome VARCHAR(255) NOT NULL,
    minutos_uso_atual INTEGER DEFAULT 0,
    vida_util_estimada_minutos INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('FDM', 'SLA')),
    nome VARCHAR(255) NOT NULL,
    tipo_material VARCHAR(50) NOT NULL,
    cor VARCHAR(50),
    preco_centavos BIGINT NOT NULL,
    peso_gramas INTEGER NOT NULL,
    estoque_unidades INTEGER NOT NULL DEFAULT 1,
    peso_restante_gramas FLOAT NOT NULL,
    arquivado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historico_uso_materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL,
    id_material UUID REFERENCES materiais(id),
    id_pedido UUID REFERENCES pedidos_impressao(id),
    data TIMESTAMPTZ DEFAULT NOW(),
    nome_peca VARCHAR(255),
    quantidade_gasta_gramas FLOAT NOT NULL,
    tempo_impressao_minutos INTEGER,
    status VARCHAR(50) NOT NULL CHECK (status IN ('SUCESSO', 'FALHA', 'CANCELADO', 'MANUAL'))
);

-- Índices
CREATE INDEX idx_consentimentos_usuario ON consentimentos_usuario(id_usuario);
CREATE INDEX idx_clientes_usuario ON clientes(id_usuario);
CREATE INDEX idx_pedidos_usuario ON pedidos_impressao(id_usuario);
CREATE INDEX idx_lancamentos_usuario ON lancamentos_financeiros(id_usuario);
CREATE INDEX idx_impressoras_usuario ON impressoras(id_usuario);
CREATE INDEX idx_manutencao_usuario ON historico_manutencao(id_usuario);
CREATE INDEX idx_pecas_usuario ON pecas_desgaste(id_usuario);
CREATE INDEX idx_materiais_usuario ON materiais(id_usuario);
CREATE INDEX idx_uso_materiais_usuario ON historico_uso_materiais(id_usuario);