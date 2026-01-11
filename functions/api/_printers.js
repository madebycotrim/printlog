import { enviarJSON, paraNumero, corsHeaders } from './[[path]]';

export async function gerenciarImpressoras({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId).all();
            return enviarJSON(results || []);
        }

        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID da impressora necessário." }, 400);

            await db.prepare("DELETE FROM printers WHERE id = ? AND user_id = ?").bind(id, userId).run();
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (['POST', 'PUT'].includes(method)) {
            const p = await request.json();
            const id = p.id || idFromPath || crypto.randomUUID();

            const historico = typeof p.historico === 'string'
                ? p.historico
                : JSON.stringify(p.historico || p.history || []);

            await db.prepare(`INSERT INTO printers (id, user_id, nome, marca, modelo, status, potencia, preco, rendimento_total, horas_totais, ultima_manutencao_hora, intervalo_manutencao, historico) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, marca=excluded.marca, modelo=excluded.modelo, status=excluded.status, 
                potencia=excluded.potencia, preco=excluded.preco, rendimento_total=excluded.rendimento_total,
                horas_totais=excluded.horas_totais, ultima_manutencao_hora=excluded.ultima_manutencao_hora, 
                intervalo_manutencao=excluded.intervalo_manutencao, historico=excluded.historico`)
                .bind(
                    id,
                    userId,
                    p.nome || p.name,
                    p.marca || p.brand || "",
                    p.modelo || p.model || "",
                    p.status || 'idle',
                    paraNumero(p.potencia || p.power),
                    paraNumero(p.preco || p.price),
                    paraNumero(p.rendimento_total || p.yieldTotal),
                    paraNumero(p.horas_totais || p.totalHours),
                    paraNumero(p.ultima_manutencao_hora || p.lastMaintenanceHour),
                    paraNumero(p.intervalo_manutencao || p.maintenanceInterval, 300),
                    historico
                ).run();

            return enviarJSON({ id, ...p, success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao processar impressoras", details: error.message }, 500);
    }
}