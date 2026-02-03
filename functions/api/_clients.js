import { enviarJSON, corsHeaders } from './_utils';

export async function gerenciarClientes(ctx) {
    const { request, db, tenantId, pathArray } = ctx;
    const client_id = pathArray[1];
    const method = request.method;

    // Listar Clientes
    if (method === "GET" && !client_id) {
        try {
            const { results } = await db.prepare(
                `SELECT * FROM clientes WHERE deletado_em IS NULL ORDER BY nome ASC`
            ).all();
            return enviarJSON(results || []);
        } catch (error) {
            // Se a tabela não existir, retorna array vazio (primeiro acesso)
            if (error.message.includes('no such table')) {
                return enviarJSON([]);
            }
            throw error;
        }
    }

    // Criar Cliente
    if (method === "POST") {
        const data = await request.json();
        const id = crypto.randomUUID();

        await db.prepare(
            `INSERT INTO clientes (id, usuario_id, nome, email, telefone, documento, observacoes, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            id,
            tenantId,
            data.name || data.nome,
            data.email || null,
            data.phone || data.telefone || null,
            data.document || data.documento || null,
            data.notes || data.observacoes || null,
            data.address || data.endereco || null
        ).run();

        return enviarJSON({ message: "Cliente criado com sucesso!", id }, 201);
    }

    // Atualizar Cliente
    if (method === "PUT" && client_id) {
        const data = await request.json();
        await db.prepare(
            `UPDATE clientes SET nome = ?, email = ?, telefone = ?, documento = ?, observacoes = ?, endereco = ? WHERE id = ?`
        ).bind(
            data.name || data.nome,
            data.email || null,
            data.phone || data.telefone || null,
            data.document || data.documento || null,
            data.notes || data.observacoes || null,
            data.address || data.endereco || null,
            client_id
        ).run();

        return enviarJSON({ message: "Cliente atualizado com sucesso!" });
    }

    // Deletar Cliente (Soft Delete)
    if (method === "DELETE" && client_id) {
        await db.prepare(
            `UPDATE clientes SET deletado_em = ? WHERE id = ?`
        ).bind(new Date().toISOString(), client_id).run();

        return enviarJSON({ message: "Cliente removido com sucesso!" });
    }

    return enviarJSON({ error: "Método não permitido" }, 405);
}
