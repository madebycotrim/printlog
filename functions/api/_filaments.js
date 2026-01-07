import { sendJSON, toNum, corsHeaders } from './_utils';

export async function handleFilaments(method, url, idFromPath, db, userId, request) {
    if (method === 'GET') {
        const { results } = await db.prepare("SELECT * FROM filaments WHERE user_id = ? ORDER BY favorito DESC, nome ASC").bind(userId).all();
        return sendJSON(results || []);
    }
    if (method === 'DELETE') {
        const id = idFromPath || url.searchParams.get('id');
        await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?").bind(id, userId).run();
        return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const f = await request.json();
        const id = f.id || idFromPath || crypto.randomUUID();

        if (method === 'PATCH') {
            await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ? AND user_id = ?")
                .bind(toNum(f.peso_atual), id, userId).run();
            return sendJSON({ success: true });
        }

        await db.prepare(`INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
            nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
            peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, favorito=excluded.favorito, preco=excluded.preco`)
            .bind(id, userId, f.nome, f.marca, f.material, f.cor_hex, toNum(f.peso_total), toNum(f.peso_atual), toNum(f.preco), f.data_abertura, f.favorito ? 1 : 0).run();
        return sendJSON({ id, ...f });
    }
}