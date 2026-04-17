# 🖨️ PrintLog V2

> Plataforma de gestão de impressão 3D para estúdios profissionais.

[![CI](https://github.com/madebycotrim/printlog-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/madebycotrim/printlog-v2/actions/workflows/ci.yml)

---

## 🛠️ Tech Stack

| Camada       | Tecnologia            |
| ------------ | --------------------- |
| Framework    | React 19 + TypeScript |
| Build        | Vite 7                |
| Estilização  | TailwindCSS 4         |
| Estado       | Zustand               |
| Formulários  | React Hook Form + Zod |
| Autenticação | Firebase Auth         |
| Gráficos     | Recharts              |
| Animações    | Framer Motion         |
| Testes       | Vitest                |

---

## 📁 Arquitetura Híbrida

```
src/
├── funcionalidades/              ← Módulos de domínio do negócio
│   ├── autenticacao/             # Login, cadastro, recuperação
│   ├── comercial/
│   │   ├── clientes/             # CRM de clientes
│   │   └── financeiro/           # Lançamentos financeiros
│   ├── geral/
│   │   ├── painel/               # Dashboard principal
│   │   ├── calculadora/          # Calculadora de custos
│   │   └── desperdicio/          # Relatório de desperdício
│   ├── producao/
│   │   ├── projetos/             # Kanban de pedidos
│   │   ├── impressoras/          # Parque de máquinas
│   │   ├── materiais/            # Filamentos e estoque
│   │   ├── insumos/              # Insumos operacionais
│   │   ├── historico/            # Histórico de produção
│   │   └── manutencao/           # Manutenção preditiva
│   ├── sistema/
│   │   ├── configuracoes/        # Preferências do sistema
│   │   └── central-maker/        # FAQ e suporte
│   ├── landing_page/             # Site público
│   ├── lgpd/                     # Privacidade e titulares
│   └── beta/                     # Funcionalidades experimentais
│
├── compartilhado/                ← Recursos usados por 2+ features
│   ├── componentes/              # UI genérica reutilizável
│   ├── constantes/               # Constantes de negócio
│   ├── contextos/                # React Contexts globais
│   ├── estado/                   # Stores Zustand globais
│   ├── hooks/                    # Hooks compartilhados
│   ├── servicos/                 # Firebase, notificações, etc.
│   ├── tipos/                    # Enums e interfaces globais
│   └── utilitarios/              # Formatadores, logger, etc.
│
├── configuracoes/                ← Rotas, tema, ambiente
├── principal/                    ← Entry point (index.tsx)
└── testes/
    ├── fabricas/                  # Fábricas de dados de teste
    └── unitarios/                # Testes unitários
```

### Regras de Isolamento

1. Cada feature tem seu `index.ts` com exportações públicas
2. Features **nunca** importam diretamente de outras features
3. Comunicação entre features ocorre via `compartilhado/`
4. Só vai para `compartilhado/` o que é usado por 2+ features

---

## 🚀 Início Rápido

```bash
# 1. Clonar o repositório
git clone https://github.com/madebycotrim/printlog-v2.git
cd printlog-v2

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.exemplo .env
# Preencher com suas credenciais Firebase

# 4. Iniciar em desenvolvimento
npm run dev
```

---

## 📜 Scripts Disponíveis

| Script                      | Descrição                   |
| --------------------------- | --------------------------- |
| `npm run dev`               | Servidor de desenvolvimento |
| `npm run build`             | Build de produção           |
| `npm run preview`           | Preview do build            |
| `npm run lint`              | Verificação ESLint          |
| `npm run test`              | Executar testes (Vitest)    |
| `npx prettier --write src/` | Formatar código             |

---

## 📐 Padrões de Commit

Usamos **Conventional Commits** com validação automática via Husky + commitlint:

```
feat: adicionar filtro por status no kanban
fix: corrigir cálculo de saldo financeiro
refactor: mover servicoPerformance para feature do painel
docs: atualizar diagrama de arquitetura
test: adicionar testes para calculadora de custos
chore: atualizar dependências do Vite
```

---

## 🔧 Path Aliases

| Alias               | Mapa para              |
| ------------------- | ---------------------- |
| `@/`                | `src/`                 |
| `@funcionalidades/` | `src/funcionalidades/` |
| `@compartilhado/`   | `src/compartilhado/`   |
| `@configuracoes/`   | `src/configuracoes/`   |
| `@principal/`       | `src/principal/`       |
| `@testes/`          | `src/testes/`          |

---

## 📋 Nomenclatura PT-BR

Todo código de domínio segue nomenclatura em português brasileiro:

- **Variáveis**: `camelCase` → `pedidoAtivo`, `precoFilamento`
- **Funções**: `camelCase` verbo + substantivo → `calcularCusto()`
- **Interfaces**: `PascalCase` → `PedidoImpressao`
- **Enums**: `PascalCase` + `UPPER_SNAKE` → `StatusPedido.EM_PRODUCAO`
- **Diretórios**: plural PT-BR → `/servicos`, `/utilitarios`

---

## 📄 Licença

Projeto privado — todos os direitos reservados.
