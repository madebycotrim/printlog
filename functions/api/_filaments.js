import { enviarJSON, paraNumero, corsHeaders } from './[[path]]';

export async function gerenciarFilamentos({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            const { results } = await db.prepare("SELECT * FROM filaments WHERE user_id = ? ORDER BY favorito DESC, nome ASC").bind(userId).all();
            return enviarJSON(results || []);
        }

        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do filamento necessário." }, 400);

            await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?").bind(id, userId).run();
            return enviarJSON({ success: true, message: "Filamento removido com sucesso." });
        }

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const f = await request.json();
            const id = f.id || idFromPath || crypto.randomUUID();

            if (method === 'PATCH') {
                await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ? AND user_id = ?")
                    .bind(paraNumero(f.peso_atual), id, userId).run();
                return enviarJSON({ success: true, message: "Estoque atualizado." });
            }

            await db.prepare(`INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
                peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, favorito=excluded.favorito, preco=excluded.preco`)
                .bind(id, userId, f.nome, f.marca, f.material, f.cor_hex, paraNumero(f.peso_total),
                    paraNumero(f.peso_atual), paraNumero(f.preco), f.data_abertura, f.favorito ? 1 : 0).run();
            return enviarJSON({ id, ...f, success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao processar filamentos", details: error.message }, 500);
    }
}