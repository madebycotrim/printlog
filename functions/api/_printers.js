import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { construirQueryComSoftDelete, softDelete } from './_helpers';

/**
 * API DE GERENCIAMENTO DE IMPRESSORAS
 * CRUD completo de impressoras 3D com suporte a histórico e manutenção
 */
export async function gerenciarImpressoras({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        // ==========================================
        // GET: BUSCAR TODAS AS IMPRESSORAS
        // ==========================================
        if (method === 'GET') {
            const query = construirQueryComSoftDelete("SELECT * FROM impressoras", "impressoras");
            const { results } = await db.prepare(query).all();
            return enviarJSON(results || []);
        }

        // ==========================================
        // DELETE: REMOVER IMPRESSORA
        // ==========================================
        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID da impressora necessário." }, 400);

            await softDelete(db, 'impressoras', id);
            return enviarJSON({ success: true, message: "Impressora removida com sucesso." });
        }

        // ==========================================
        // POST/PUT: CRIAR OU ATUALIZAR IMPRESSORA
        // ==========================================
        if (['POST', 'PUT'].includes(method)) {
            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            // Verifica se é criação nova
            const existing = await db.prepare("SELECT 1 FROM impressoras WHERE id = ?").bind(id).first();

            const validation = validateInput(rawData, schemas.printer);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const da = sanitizeFields(rawData, schemas.printer);

            // Garante que o histórico seja armazenado como string JSON
            const historico = typeof rawData.historico === 'string'
                ? rawData.historico
                : JSON.stringify(rawData.historico || rawData.history || []);

            // Upsert usando versao
            await db.prepare(`INSERT INTO impressoras (id, usuario_id, nome, marca, modelo, status, potencia, preco, rendimento_total, horas_totais, ultima_manutencao_hora, intervalo_manutencao, historico, versao) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, marca=excluded.marca, modelo=excluded.modelo, status=excluded.status, 
                potencia=excluded.potencia, preco=excluded.preco, rendimento_total=excluded.rendimento_total,
                horas_totais=excluded.horas_totais, ultima_manutencao_hora=excluded.ultima_manutencao_hora, 
                intervalo_manutencao=excluded.intervalo_manutencao, historico=excluded.historico,
                versao=versao+1`)
                .bind(
                    id,
                    userId,
                    da.nome,
                    da.marca || "",
                    da.modelo || "",
                    da.status || 'idle',
                    paraNumero(da.potencia),
                    paraNumero(da.preco),
                    paraNumero(rawData.rendimento_total),
                    paraNumero(da.horas_totais),
                    paraNumero(rawData.ultima_manutencao_hora),
                    paraNumero(da.intervalo_manutencao, 300),
                    historico
                ).run();

            return enviarJSON({ id, ...da, success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao processar impressoras", details: error.message }, 500);
    }
}
