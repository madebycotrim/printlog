import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

export async function gerenciarConfiguracoes({ request, db, tenantId }) {
    const method = request.method;

    try {
        if (method === 'GET') {
            // Cache de 60 segundos para configurações
            const data = await cacheQuery(
                `settings:${tenantId}`,
                60000,
                async () => {
                    // Nota: A tabela usa usuario_id como PK
                    return await db.prepare("SELECT * FROM configuracoes_calculadora WHERE usuario_id = ?").bind(tenantId).first();
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

            // Armazenamos o tenantId tanto no usuario_id (PK legada) sem org_id
            await db.prepare(`INSERT INTO configuracoes_calculadora (
                    usuario_id, custo_kwh, valor_hora_humana, custo_hora_maquina, taxa_setup, 
                    consumo_impressora_kw, margem_lucro, imposto, taxa_falha, desconto, whatsapp_template
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(usuario_id) DO UPDATE SET 
                    custo_kwh=excluded.custo_kwh, valor_hora_humana=excluded.valor_hora_humana, 
                    custo_hora_maquina=excluded.custo_hora_maquina, taxa_setup=excluded.taxa_setup, 
                    consumo_impressora_kw=excluded.consumo_impressora_kw, margem_lucro=excluded.margem_lucro, 
                    imposto=excluded.imposto, taxa_falha=excluded.taxa_falha, desconto=excluded.desconto,
                    whatsapp_template=excluded.whatsapp_template`)
                .bind(tenantId, paraNumero(s.custo_kwh), paraNumero(s.valor_hora_humana), paraNumero(s.custo_hora_maquina), paraNumero(s.taxa_setup),
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