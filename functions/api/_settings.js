import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

export async function gerenciarConfiguracoes({ request, db, userId, tenantId }) {
    const method = request.method;

    try {
        if (method === 'GET') {
            // Cache de 60 segundos para configurações
            const data = await cacheQuery(
                `settings:${tenantId}`,
                60000,
                async () => {
                    // Nota: A tabela usa user_id como PK, que agora armazena o tenantId (Org ou User)
                    return await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(tenantId).first();
                }
            );
            return enviarJSON(data || {});
        }

        if (['POST', 'PUT'].includes(method)) {
            const rawData = await request.json();

            // Validação
            const validation = validateInput(rawData, schemas.settings);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const s = sanitizeFields(rawData, schemas.settings);

            // Armazenamos o tenantId tanto no user_id (PK legada) quanto no org_id (nova coluna)
            await db.prepare(`INSERT INTO calculator_settings (
                    user_id, org_id, custo_kwh, valor_hora_humana, custo_hora_maquina, taxa_setup, 
                    consumo_impressora_kw, margem_lucro, imposto, taxa_falha, desconto, whatsapp_template
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET 
                    custo_kwh=excluded.custo_kwh, valor_hora_humana=excluded.valor_hora_humana, 
                    custo_hora_maquina=excluded.custo_hora_maquina, taxa_setup=excluded.taxa_setup, 
                    consumo_impressora_kw=excluded.consumo_impressora_kw, margem_lucro=excluded.margem_lucro, 
                    imposto=excluded.imposto, taxa_falha=excluded.taxa_falha, desconto=excluded.desconto,
                    whatsapp_template=excluded.whatsapp_template`)
                .bind(tenantId, tenantId, paraNumero(s.custo_kwh), paraNumero(s.valor_hora_humana), paraNumero(s.custo_hora_maquina), paraNumero(s.taxa_setup),
                    paraNumero(s.consumo_impressora_kw), paraNumero(s.margem_lucro), paraNumero(s.imposto), paraNumero(s.taxa_falha),
                    paraNumero(s.desconto), String(s.whatsapp_template || "")).run();

            // Invalida cache após atualização
            invalidateCache(`settings:${tenantId}`);

            return enviarJSON({ success: true, message: "Configurações salvas." });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao salvar configurações", details: error.message }, 500);
    }
}