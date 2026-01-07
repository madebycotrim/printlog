import { sendJSON, toNum, corsHeaders } from './_utils';

export async function handlePrinters(method, url, idFromPath, db, userId, request) {
    try {
        // 1. LISTAR TODAS AS IMPRESSORAS DO MAKER
        if (method === 'GET') {
            const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ?")
                .bind(userId)
                .all();
            
            // Transforma o texto do histórico de volta para uma lista ou objeto real
            const parsedResults = (results || []).map(r => ({
                ...r,
                historico: JSON.parse(r.historico || "[]")
            }));
            
            return sendJSON(parsedResults);
        }

        // 2. REMOVER UMA IMPRESSORA
        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return sendJSON({ error: "Não encontramos o ID da impressora" }, 400);

            await db.prepare("DELETE FROM printers WHERE id = ? AND user_id = ?")
                .bind(id, userId)
                .run();
                
            // Retorno padrão para sucesso na remoção (sem conteúdo)
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // 3. ADICIONAR OU ATUALIZAR MÁQUINA (UPSERT)
        if (['POST', 'PUT'].includes(method)) {
            let p;
            try {
                p = await request.json();
            } catch (e) {
                return sendJSON({ error: "Os dados enviados parecem estar com algum erro" }, 400);
            }

            const id = p.id || idFromPath || crypto.randomUUID();
            const nome = p.nome || p.name;

            if (!nome) return sendJSON({ error: "Você precisa dar um nome para a sua impressora!" }, 400);

            await db.prepare(`
                INSERT INTO printers (
                    id, user_id, nome, marca, modelo, status, potencia, 
                    preco, rendimento_total, horas_totais, 
                    ultima_manutencao_hora, intervalo_manutencao, historico
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                ON CONFLICT(id) DO UPDATE SET 
                    nome=excluded.nome, 
                    marca=excluded.marca, 
                    modelo=excluded.modelo, 
                    status=excluded.status, 
                    potencia=excluded.potencia, 
                    preco=excluded.preco, 
                    rendimento_total=excluded.rendimento_total,
                    horas_totais=excluded.horas_totais, 
                    ultima_manutencao_hora=excluded.ultima_manutencao_hora, 
                    intervalo_manutencao=excluded.intervalo_manutencao, 
                    historico=excluded.historico
            `).bind(
                id, 
                userId, 
                nome, 
                p.marca || "", 
                p.modelo || "", 
                p.status || 'idle', 
                toNum(p.potencia), 
                toNum(p.preco), 
                toNum(p.rendimento_total), 
                toNum(p.horas_totais), 
                toNum(p.ultima_manutencao_hora), 
                toNum(p.intervalo_manutencao, 300), 
                JSON.stringify(p.historico || [])
            ).run();

            return sendJSON({ id, ...p, success: true });
        }

        return sendJSON({ error: "Essa ação não é permitida por aqui" }, 405);

    } catch (err) {
        return sendJSON({ error: "Tivemos um problema interno ao carregar as impressoras", details: err.message }, 500);
    }
}