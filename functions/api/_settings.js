import { enviarJSON, paraNumero } from './[[path]]';

export async function gerenciarConfiguracoes({ request, db, userId }) {
    const method = request.method;

    try {
        if (method === 'GET') {
            const data = await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId).first();
            return enviarJSON(data || {});
        }

        if (['POST', 'PUT'].includes(method)) {
            const s = await request.json();
            await db.prepare(`INSERT INTO calculator_settings (
                    user_id, custo_kwh, valor_hora_humana, custo_hora_maquina, taxa_setup, 
                    consumo_impressora_kw, margem_lucro, imposto, taxa_falha, desconto, whatsapp_template
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET 
                    custo_kwh=excluded.custo_kwh, valor_hora_humana=excluded.valor_hora_humana, 
                    custo_hora_maquina=excluded.custo_hora_maquina, taxa_setup=excluded.taxa_setup, 
                    consumo_impressora_kw=excluded.consumo_impressora_kw, margem_lucro=excluded.margem_lucro, 
                    imposto=excluded.imposto, taxa_falha=excluded.taxa_falha, desconto=excluded.desconto,
                    whatsapp_template=excluded.whatsapp_template`)
                .bind(userId, paraNumero(s.custo_kwh), paraNumero(s.valor_hora_humana), paraNumero(s.custo_hora_maquina), paraNumero(s.taxa_setup),
                    paraNumero(s.consumo_impressora_kw), paraNumero(s.margem_lucro), paraNumero(s.imposto), paraNumero(s.taxa_falha),
                    paraNumero(s.desconto), String(s.whatsapp_template || "")).run();
            return enviarJSON({ success: true, message: "Configurações salvas." });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao salvar configurações", details: error.message }, 500);
    }
}