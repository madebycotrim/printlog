# 📘 Documentação Técnica - PrintLog

> **Versão:** 1.0.2
> **Status:** Em Desenvolvimento
> **Tecnologia:** React + Vite + Cloudflare Pages (Functions) + D1 Database
> **Idioma Oficial:** Português do Brasil (PT-BR)

---

## 1. Visão Geral do Sistema

O **PrintLog** é uma plataforma "tudo-em-um" para gestão profissional de estúdios de impressão 3D. Ele centraliza o fluxo de trabalho desde o orçamento inicial até a entrega do produto final, passando pelo controle rigoroso de estoque e manutenção de máquinas.

O sistema foi projetado para resolver as dores comuns de *makers* e empresas de impressão 3D: precificação imprecisa, falta de controle de estoque de filamentos (restos de carretel) e desconhecimento do lucro real.

---

## 2. Funcionalidades do Sistema

Esta seção detalha **tudo** o que o sistema é capaz de fazer, dividido por módulos.

### 📊 2.1. Dashboard (Painel de Controle)
O centro de comando do estúdio.
- **Widgets Personalizáveis:** O usuário pode arrastar e soltar widgets para organizar sua visão preferida.
- **Resumo da Frota:** Status em tempo real de todas as impressoras (Imprimindo, Livre, Manutenção, Offline).
- **Indicadores Financeiros:** Receita do mês, lucro líquido estimado e custos operacionais visíveis de imediato.
- **Alertas Inteligentes:** Notificações automáticas para:
  - Estoque baixo de filamento/resina.
  - Manutenções preventivas vencidas.
  - Projetos atrasados ou próximos do prazo.
- **Previsão do Tempo (Local):** Integração para mostrar umidade e temperatura local (crítico para filamentos como Nylon e PETG).

### 🧮 2.2. Calculadora de Precificação 3D
O coração financeiro do sistema. Diferente de planilhas simples, ela considera custos ocultos.
- **Cálculo de Custo Real:**
  - **Material:** Peso exato (g) x Preço do kg.
  - **Energia:** Potência da máquina (W) x Horas x Custo kWh.
  - **Depreciação:** Custo da máquina diluído pela vida útil esperada.
  - **Mão de Obra:** Tempo de fatiamento e pós-processamento.
- **Taxas Extras:** Adiciona automaticamente margem de erro (ex: 10% para falhas), impostos e taxas de cartão.
- **Sugestão de Preço de Venda:** Calcula o preço final baseando-se na margem de lucro desejada.
- **Salvar Orçamento:** Permite salvar o cálculo como um "Projeto" em fase de orçamento.

### 📦 2.3. Gestão de Filamentos (Estoque Inteligente)
Controle granular de cada carretel.
- **Rastreabilidade:** Cada rolo tem um ID único.
- **Cálculo de Restante:** Ao registrar uma impressão, o sistema desconta o peso usado. O usuário sabe exatamente se o resto do carretel dá para a próxima peça.
- **Leitura de QR Code:** Suporte a webcam/câmera para ler etiquetas de carretéis e dar baixa rápida.
- **Gestão de Validade/Umidade:** Registra data de abertura e alertas para secagem de filamentos higroscópicos.
- **Classificação:** Por Material (PLA, ABS, PETG, Resina), Marca, Cor e Diâmetro.

### 🧪 2.4. Gestão de Insumos
Controle de materiais consumíveis que não são filamentos.
- **Itens:** Álcool isopropílico, colas, bicos, lixas, verniz.
- **Controle de Nível:** Barra visual de estoque (ex: garrafa de álcool em 50%).
- **Alerta de Reposição:** Notifica quando o estoque atinge o mínimo definido.

### 🖨️ 2.5. Gestão de Impressoras (Frota)
Gerenciamento do ciclo de vida das máquinas.
- **Histórico de Manutenção:** Registro de trocas de peças, lubrificação e nivelamento.
- **ROI (Retorno sobre Investimento):** Calcula quanto a impressora já gerou de lucro vs. seu custo de aquisição.
- **Contador de Horas:** Horímetro virtual que soma o tempo de todos os projetos impressos nela.
- **Configurações Específicas:** Área de impressão, diâmetro do bico, potência média.

### 📁 2.6. Gestão de Projetos e Pedidos
Fluxo de trabalho completo (Workflow).
- **Vistas:** Alternância entre Lista e Kanban (Quadros: Novo, Em Produção, Acabamento, Concluído).
- **Vínculos:** Cada projeto liga-se a um Cliente e consome X gramas de Filamento Y na Impressora Z.
- **Prazos:** Definição de data de entrega com contagem regressiva e etiquetas de urgência.
- **Arquivos:** (Futuro) Associação de arquivos STL/GCODE ao projeto.

### 💰 2.7. Módulo Financeiro
Contabilidade simplificada para o maker.
- **Fluxo de Caixa:** Entradas (Vendas) e Saídas (Compra de Material/Manutenção).
- **Gráficos:** Evolução mensal de faturamento e lucro.
- **Distribuição de Custos:** Gráfico de pizza mostrando onde o dinheiro está indo (Energia vs. Material vs. Manutenção).
- **Lista de Transações:** Histórico detalhado exportável.

### 👥 2.8. CRM de Clientes
Base de dados de compradores.
- **Perfil do Cliente:** Dados de contato, endereço e preferências.
- **Histórico de Pedidos:** Lista de tudo que o cliente já comprou.
- **Valor Vitalício (LTV):** Quanto o cliente já gastou no total com a empresa.

### ⚙️ 2.9. Configurações e Sistema
Personalização global.
- **Parâmetros de Custo:** Definição global do valor do kWh e hora de trabalho.
- **Backup e Dados:** Exportação de todos os dados em JSON/CSV (Lei de Liberdade Econômica/LGPD).
- **Temas:** Suporte a Modo Claro/Escuro (Dark Mode).

---

## 3. Stack Tecnológico

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Estilização:** Tailwind CSS 4 + Lucide React (Ícones)
- **Roteamento:** Wouter (Leve e rápido)
- **Gerenciamento de Estado:** Zustand (Global) + TanStack Query (Server State)
- **Utilitários:** Axios (HTTP), Date-fns (Datas), JSPDF (Relatórios PDF)

### Backend (Serverless)
- **Runtime:** Cloudflare Pages Functions
- **Linguagem:** JavaScript (Node.js compatível)
- **Autenticação:** Firebase Auth + JWT (Jose)
- **Banco de Dados:** Cloudflare D1 (SQLite Distribuído)

---

## 4. Padrões de Desenvolvimento (Convenção PT-BR)

Para facilitar a manutenção técnica pela SEEDF e manter a consistência do código, **todo o projeto deve seguir estritamente a nomenclatura oficial em Português do Brasil**.

### 📐 Regras de Nomenclatura (Obrigatório)

| Categoria | Regra | Exemplo Correto ✅ | Exemplo Incorreto ❌ |
| :--- | :--- | :--- | :--- |
| **Variáveis** | camelCase em PT | `const totalUsuarios = 10` | `const totalUsers = 10` |
| **Funções** | Verbo + Substantivo (PT) | `calcularOrcamento()` | `calculateBudget()` |
| **Componentes** | PascalCase em PT | `<Botaosalvar />` | `<SaveButton />` |
| **Hooks** | prefixo 'use' + PT | `useAutenticacao()` | `useAuth()` |
| **Banco de Dados** | snake_case em PT | `table: usuarios`, `col: data_criacao` | `table: users`, `col: created_at` |
| **Rotas (URL)** | kebab-case em PT | `/meus-projetos` | `/my-projects` |
| **Commits** | Conventional Commits (PT) | `feat: adiciona filtro de data` | `feat: add date filter` |

### 📝 Comentários e Documentação
Todo comentário de código, JSDoc e documentação deve ser escrito em **Português**.
```javascript
/**
 * Calcula o custo total de uma impressão com base no tempo e material.
 * @param {number} tempoHoras - Tempo em horas
 * @param {number} pesoGramas - Peso em gramas
 */
function calcularCusto(tempoHoras, pesoGramas) { ... }
```

---

## 5. Arquitetura de Backend (API)

A API roda no Cloudflare Workers e deve expor rotas em Português.

**Arquivo de Entrada:** `functions/api/[[path]].js`

### Roteamento da API (Padronização PT-BR)
As rotas da API devem ser claras e em português.

| Rota (Endpoint) | Controlador Responsável | Descrição |
| :--- | :--- | :--- |
| `/api/filamentos` | `_filaments_v2.js` | Gestão de filamentos |
| `/api/impressoras` | `_printers.js` | Gestão de impressoras |
| `/api/projetos` | `_projects.js` | Gestão de projetos/pedidos |
| `/api/clientes` | `_clients.js` | Gestão de clientes |
| `/api/configuracoes` | `_settings.js` | Configurações globais do sistema |

---

## 6. Banco de Dados (Schema)

O banco de dados (SQLite) já segue majoritariamente o padrão PT-BR.

### Tabelas Principais (Snake Case PT-BR)

1. **`filamentos`**
   - Colunas: `id`, `usuario_id`, `peso_total`, `cor_hex`, `tipo`.
   - *Gatilho:* `atualizar_percentual_filamento`.

2. **`impressoras`**
   - Colunas: `id`, `nome`, `marca`, `custo_hora`.

3. **`projetos`**
   - Colunas: `id`, `nome_projeto`, `cliente_id`, `prazo_entrega`.

4. **`movimentacoes_log`** (Sugerido para unificar logs)
   - Unifica logs de filamentos e impressoras.

---

## 7. Guia de Instalação e Execução

### Instalação
```bash
# 1. Clonar repositório
git clone [URL]

# 2. Instalar dependências
npm install
```

### Comandos de Desenvolvimento
```bash
# Rodar Frontend + Backend (Mock) localmente
npm run dev

# Rodar com tunelamento HTTPS (acesso externo)
npm run dev:live
```

### Deploy
O deploy é automatizado via Wrangler:
```bash
npm run deploy
```

---

## 8. Segurança e Boas Práticas

1. **Row Level Security (Lógico):** `WHERE usuario_id = ?` obrigatório em todas as queries.
2. **Validação de Tipos:** Garantir que números sejam salvos como números e datas como string ISO ou timestamp.
3. **Tratamento de Erros:** As mensagens de erro para o frontend devem ser tratadas e em português (ex: "Usuário não encontrado" ao invés de "User not found").

---
*Documentação Oficial - PrintLog Team.*
