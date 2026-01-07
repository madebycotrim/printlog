import { sendJSON, toNum } from './_utils';

export async function handleSettings(method, db, userId, request) {
    if (method === 'GET') {
        const data = await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId).first();
        return sendJSON(data || {});
    }
    if (['POST', 'PUT'].includes(method)) {
        const s = await request.json();
        await db.prepare(`INSERT INTO calculator_settings (user_id, custo_kwh, valor_hora_humana, custo_hora_maquina, taxa_setup, consumo_impressora_kw, margem_lucro, imposto, taxa_falha, desconto, whatsapp_template) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET 
            custo_kwh=excluded.custo_kwh, valor_hora_humana=excluded.valor_hora_humana, custo_hora_maquina=excluded.custo_hora_maquina, taxa_setup=excluded.taxa_setup, consumo_impressora_kw=excluded.consumo_impressora_kw, 
            margem_lucro=excluded.margem_lucro, imposto=excluded.imposto, taxa_falha=excluded.taxa_falha, desconto=excluded.desconto, whatsapp_template=excluded.whatsapp_template`)
            .bind(userId, toNum(s.custo_kwh), toNum(s.valor_hora_humana), toNum(s.custo_hora_maquina), toNum(s.taxa_setup), toNum(s.consumo_impressora_kw), toNum(s.margem_lucro), toNum(s.imposto), toNum(s.taxa_falha), toNum(s.desconto), String(s.whatsapp_template || "")).run();
        return sendJSON({ success: true });
    }
}