import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

export async function gerenciarFilamentos({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            // Cache de 30 segundos para lista de filamentos
            const results = await cacheQuery(
                `filaments:${userId}`,
                30000,
                async () => {
                    const { results } = await db.prepare("SELECT * FROM filaments WHERE user_id = ? ORDER BY favorito DESC, nome ASC").bind(userId).all();
                    return results || [];
                }
            );
            return enviarJSON(results);
        }

        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do filamento necessário." }, 400);

            await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?").bind(id, userId).run();
            invalidateCache(`filaments:${userId}`);

            return enviarJSON({ success: true, message: "Filamento removido com sucesso." });
        }

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            if (method === 'PATCH') {
                // Atualização parcial (apenas peso ou favorito)
                if (rawData.peso_atual !== undefined) {
                    await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ? AND user_id = ?")
                        .bind(paraNumero(rawData.peso_atual), id, userId).run();
                }
                if (rawData.favorito !== undefined) {
                    await db.prepare("UPDATE filaments SET favorito = ? WHERE id = ? AND user_id = ?")
                        .bind(rawData.favorito ? 1 : 0, id, userId).run();
                }

                invalidateCache(`filaments:${userId}`);
                return enviarJSON({ success: true, message: "Filamento atualizado." });
            }

            // Validação completa para Criar/Editar
            const validation = validateInput(rawData, schemas.filament);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const da = sanitizeFields(rawData, schemas.filament);
            // Campos extras que não estão na validação mas salvamos
            const tags = JSON.stringify(rawData.tags || []);

            await db.prepare(`INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito, tags) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
                peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, preco=excluded.preco, 
                favorito=excluded.favorito, tags=excluded.tags`)
                .bind(id, userId, da.nome, da.marca, da.material, da.cor_hex, paraNumero(da.peso_total),
                    paraNumero(da.peso_atual), paraNumero(da.preco), rawData.data_abertura, da.favorito ? 1 : 0, tags).run();

            invalidateCache(`filaments:${userId}`);
            return enviarJSON({ id, ...da, success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao processar filamentos", details: error.message }, 500);
    }
}