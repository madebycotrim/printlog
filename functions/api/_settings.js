import { sendJSON, toNum } from './_utils';

// Objeto com valores padrão para evitar erros no Frontend
const DEFAULT_SETTINGS = {
    custo_kwh: 0,
    valor_hora_humana: 0,
    custo_hora_maquina: 0,
    taxa_setup: 0,
    consumo_impressora_kw: 0,
    margem_lucro: 0,
    imposto: 0,
    taxa_falha: 0,
    desconto: 0,
    whatsapp_template: ""
};

export async function handleSettings(method, db, userId, request) {

    // 1. Buscar Configurações
    if (method === 'GET') {
        try {
            const data = await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?")
                .bind(userId)
                .first();

            // Retorna os dados do banco ou os valores padrão caso não exista
            return sendJSON(data || { ...DEFAULT_SETTINGS, user_id: userId });
        } catch (err) {
            return sendJSON({ error: "Erro ao buscar configurações" }, 500);
        }
    }

    // 2. Salvar ou Atualizar (Upsert)
    if (['POST', 'PUT'].includes(method)) {
        try {
            const s = await request.json();

            // Validação básica: se não houver dados no JSON
            if (!s) return sendJSON({ error: "Corpo da requisição vazio" }, 400);

            await db.prepare(`
                INSERT INTO calculator_settings (
                    user_id, custo_kwh, valor_hora_humana, custo_hora_maquina, 
                    taxa_setup, consumo_impressora_kw, margem_lucro, 
                    imposto, taxa_falha, desconto, whatsapp_template
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                ON CONFLICT(user_id) DO UPDATE SET 
                    custo_kwh=excluded.custo_kwh, 
                    valor_hora_humana=excluded.valor_hora_humana, 
                    custo_hora_maquina=excluded.custo_hora_maquina, 
                    taxa_setup=excluded.taxa_setup, 
                    consumo_impressora_kw=excluded.consumo_impressora_kw, 
                    margem_lucro=excluded.margem_lucro, 
                    imposto=excluded.imposto, 
                    taxa_falha=excluded.taxa_falha, 
                    desconto=excluded.desconto, 
                    whatsapp_template=excluded.whatsapp_template
            `).bind(
                userId,
                toNum(s.custo_kwh),
                toNum(s.valor_hora_humana),
                toNum(s.custo_hora_maquina),
                toNum(s.taxa_setup),
                toNum(s.consumo_impressora_kw),
                toNum(s.margem_lucro),
                toNum(s.imposto),
                toNum(s.taxa_falha),
                toNum(s.desconto),
                String(s.whatsapp_template || "")
            ).run();

            return sendJSON({ success: true, message: "Configurações salvas com sucesso" });
        } catch (err) {
            return sendJSON({ error: "Erro ao processar JSON ou salvar no banco", details: err.message }, 400);
        }
    }

    // 3. Fallback para outros métodos
    return sendJSON({ error: "Método não permitido" }, 405);
}