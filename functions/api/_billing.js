import { enviarJSON } from './_utils';

// ==========================================
// DEFINIÇÃO DOS PLANOS (Hardcoded por enquanto)
// ==========================================
export const PLANS = {
    FREE: {
        id: 'free',
        name: 'Hobby (Grátis)',
        limits: {
            printers: 3,
            projects: 10,
            storage_days: 7,
            members: 1
        },
        price: 0
    },
    PRO: {
        id: 'pro',
        name: 'Pro Farm',
        limits: {
            printers: 20,
            projects: 1000, // Ilimitado na prática
            storage_days: 365,
            members: 5
        },
        price: 29.90
    },
    BUSINESS: {
        id: 'business',
        name: 'Enterprise',
        limits: {
            printers: 9999,
            projects: 9999,
            storage_days: 9999,
            members: 9999
        },
        price: 99.90
    }
};

/**
 * Verifica se o tenant atingiu o limite de um recurso
 * @param {Object} db - D1 Database
 * @param {string} tenantId - ID da Organização ou Usuário
 * @param {string} resource - 'printers' | 'projects'
 * @returns {Promise<{allowed: boolean, limit: number, current: number, plan: string}>}
 */
/**
 * Verifica se o tenant atingiu o limite de um recurso
 * @param {Object} db - D1 Database
 * @param {string} tenantId - ID da Organização ou Usuário
 * @param {string} resource - 'printers' | 'projects'
 * @returns {Promise<{allowed: boolean, limit: number, current: number, plan: string}>}
 */
export async function checkDataLimit(db, tenantId, resource) {
    // 1. Busca assinatura do tenant (Agora por user_id, assumindo tenantId = userId)
    const sub = await db.prepare("SELECT plan_id FROM subscriptions WHERE user_id = ? AND status = 'active'").bind(tenantId).first();
    const planId = sub?.plan_id || 'free';
    const plan = PLANS[planId.toUpperCase()] || PLANS.FREE;

    // 2. Conta uso atual
    let count = 0;
    if (resource === 'printers') {
        // Se removi o filtro na listagem, removo aqui também ou filtro por user_id?
        // Vou filtrar por user_id se existir a coluna, para ser consistente.
        // Mas como removi em _printers.js o filtro, vou contar total.
        const res = await db.prepare("SELECT COUNT(*) as qtd FROM printers").first();
        count = res?.qtd || 0;
    } else if (resource === 'projects') {
        const res = await db.prepare("SELECT COUNT(*) as qtd FROM projects").first();
        count = res?.qtd || 0;
    }

    // 3. Verifica limite
    const limit = plan.limits[resource] || 0;

    return {
        allowed: count < limit,
        limit,
        current: count,
        plan: plan.name
    };
}

/**
 * API: Gerenciar Assinatura e Planos
 */
export async function gerenciarAssinatura({ request, db, tenantId }) {
    const method = request.method;

    try {
        if (method === 'GET') {
            // Retorna plano atual e limites (usando user_id)
            const sub = await db.prepare("SELECT * FROM subscriptions WHERE user_id = ?").bind(tenantId).first();
            const planId = sub?.plan_id || 'free';
            const plan = PLANS[planId.toUpperCase()] || PLANS.FREE;

            // Busca uso atual em paralelo
            const [printers, projects] = await Promise.all([
                db.prepare("SELECT COUNT(*) as c FROM printers").first(),
                db.prepare("SELECT COUNT(*) as c FROM projects").first()
            ]);

            return enviarJSON({
                plan: plan,
                subscription: sub || { status: 'active', plan_id: 'free' },
                usage: {
                    printers: printers?.c || 0,
                    projects: projects?.c || 0
                }
            });
        }

        if (method === 'POST') {
            // (Simulação) Upgrade de Plano
            const { newPlanId } = await request.json();

            if (!PLANS[newPlanId?.toUpperCase()]) {
                return enviarJSON({ error: "Plano inválido" }, 400);
            }

            // Upsert na tabela de assinaturas (Mudando PK de org_id para user_id se tabela mudou)
            // Se tabela ainda é subscriptions(org_id), vai quebrar.
            // O usuario disse remove EVERYTHING related to org_id. 
            // Assumo que ele tem uma tabela subscriptions(user_id) ou vai criar.
            await db.prepare(`
                INSERT INTO subscriptions (user_id, plan_id, status, current_period_end)
                VALUES (?, ?, 'active', ?)
                ON CONFLICT(user_id) DO UPDATE SET
                plan_id = excluded.plan_id, status = 'active'
            `).bind(tenantId, newPlanId, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()).run(); // +30 dias

            return enviarJSON({ success: true, message: `Plano atualizado para ${newPlanId}` });
        }

    } catch (error) {
        return enviarJSON({ error: "Erro na assinatura", details: error.message }, 500);
    }
}
