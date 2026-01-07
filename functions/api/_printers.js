import { sendJSON, toNum, corsHeaders } from './_utils';

export async function handlePrinters(method, url, idFromPath, db, userId, request) {
    if (method === 'GET') {
        const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId).all();
        return sendJSON(results || []);
    }
    if (method === 'DELETE') {
        const id = idFromPath || url.searchParams.get('id');
        await db.prepare("DELETE FROM printers WHERE id = ? AND user_id = ?").bind(id, userId).run();
        return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (['POST', 'PUT'].includes(method)) {
        const p = await request.json();
        const id = p.id || idFromPath || crypto.randomUUID();
        const historico = JSON.stringify(p.historico || []);
        await db.prepare(`INSERT INTO printers (id, user_id, nome, marca, modelo, status, potencia, preco, rendimento_total, horas_totais, ultima_manutencao_hora, intervalo_manutencao, historico) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
            nome=excluded.nome, marca=excluded.marca, modelo=excluded.modelo, status=excluded.status, potencia=excluded.potencia, preco=excluded.preco, rendimento_total=excluded.rendimento_total,
            horas_totais=excluded.horas_totais, ultima_manutencao_hora=excluded.ultima_manutencao_hora, intervalo_manutencao=excluded.intervalo_manutencao, historico=excluded.historico`)
            .bind(id, userId, p.nome || p.name, p.marca || "", p.modelo || "", p.status || 'idle', toNum(p.potencia), toNum(p.preco), toNum(p.rendimento_total), toNum(p.horas_totais), toNum(p.ultima_manutencao_hora), toNum(p.intervalo_manutencao, 300), historico).run();
        return sendJSON({ id, ...p });
    }
}