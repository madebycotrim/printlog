import { sendJSON, toNum, corsHeaders } from './_utils';

export async function handleFilaments(method, url, idFromPath, db, userId, request) {
    try {
        // 1. LISTAR FILAMENTOS
        if (method === 'GET') {
            const { results } = await db.prepare(
                "SELECT * FROM filaments WHERE user_id = ? ORDER BY favorito DESC, nome ASC"
            ).bind(userId).all();

            return sendJSON(results || []);
        }

        // 2. DELETAR FILAMENTO
        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return sendJSON({ error: "ID não fornecido" }, 400);

            await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?")
                .bind(id, userId)
                .run();

            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // 3. ATUALIZAÇÃO PARCIAL (PATCH) - Ex: Atualizar apenas peso ou favorito
        if (method === 'PATCH') {
            const f = await request.json();
            const id = idFromPath || f.id;

            if (!id) return sendJSON({ error: "ID não fornecido" }, 400);

            // Se for atualização de peso
            if (f.peso_atual !== undefined) {
                await db.prepare(
                    "UPDATE filaments SET peso_atual = MAX(0, ?) WHERE id = ? AND user_id = ?"
                ).bind(toNum(f.peso_atual), id, userId).run();
            }

            if (f.favorito !== undefined) {
                await db.prepare(
                    "UPDATE filaments SET favorito = ? WHERE id = ? AND user_id = ?"
                ).bind(f.favorito ? 1 : 0, id, userId).run();
            }

            return sendJSON({ success: true });
        }

        // 4. CRIAR OU ATUALIZAR COMPLETO (POST/PUT)
        if (['POST', 'PUT'].includes(method)) {
            const f = await request.json();
            const id = f.id || idFromPath || crypto.randomUUID();

            if (!f.nome) return sendJSON({ error: "Nome do filamento é obrigatório" }, 400);

            await db.prepare(`
                INSERT INTO filaments (
                    id, user_id, nome, marca, material, cor_hex, 
                    peso_total, peso_atual, preco, data_abertura, favorito
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                ON CONFLICT(id) DO UPDATE SET 
                    nome=excluded.nome, 
                    marca=excluded.marca, 
                    material=excluded.material, 
                    cor_hex=excluded.cor_hex,
                    peso_total=excluded.peso_total, 
                    peso_atual=excluded.peso_atual, 
                    favorito=excluded.favorito, 
                    preco=excluded.preco,
                    data_abertura=excluded.data_abertura
            `).bind(
                id,
                userId,
                f.nome,
                f.marca || "",
                f.material || "",
                f.cor_hex || "#000000",
                toNum(f.peso_total),
                toNum(f.peso_atual),
                toNum(f.preco),
                f.data_abertura || new Date().toISOString().split('T')[0],
                f.favorito ? 1 : 0
            ).run();

            return sendJSON({ id, ...f, success: true });
        }

        return sendJSON({ error: "Método não permitido" }, 405);

    } catch (err) {
        return sendJSON({ error: "Erro interno em filaments", details: err.message }, 500);
    }
}