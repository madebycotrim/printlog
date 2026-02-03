import { enviarJSON } from './_utils';

export async function gerarRelatorios({ request, db, userId }) {
    const url = new URL(request.url);
    const tipo = url.searchParams.get('tipo'); // ?tipo=dashboard

    try {
        switch (tipo) {
            case 'dashboard':
                return await relatorioDashboard(db);
            case 'custos-projetos':
                return await relatorioCustosProjetos(db);
            case 'estoque-baixo':
                return await relatorioEstoqueBaixo(db);
            case 'uso-impressoras':
                return await relatorioUsoImpressoras(db);
            default:
                return enviarJSON({ error: 'Tipo de relatório inválido' }, 400);
        }
    } catch (error) {
        return enviarJSON({ error: "Erro gerando relatório", details: error.message }, 500);
    }
}

async function relatorioDashboard(db) {
    // Últimos 30 dias de movimentação
    const { results } = await db.prepare("SELECT * FROM dashboard_consumo ORDER BY dia DESC LIMIT 30").all();
    return enviarJSON(results || []);
}

async function relatorioCustosProjetos(db) {
    const { results } = await db.prepare("SELECT * FROM custos_projetos ORDER BY criado_em DESC LIMIT 50").all();
    return enviarJSON(results || []);
}

async function relatorioEstoqueBaixo(db) {
    const { results } = await db.prepare("SELECT * FROM alertas_estoque_baixo").all();
    return enviarJSON(results || []);
}

async function relatorioUsoImpressoras(db) {
    const { results } = await db.prepare("SELECT * FROM uso_impressoras").all();
    return enviarJSON(results || []);
}
