import { enviarJSON, corsHeaders } from './_utils';

export async function gerenciarClientes(ctx) {
    const { request, db, tenantId, pathArray } = ctx;
    const client_id = pathArray[1];
    const method = request.method;

    // Listar Clientes
    if (method === "GET" && !client_id) {
        try {
            const { results } = await db.prepare(
                `SELECT * FROM clients ORDER BY name ASC`
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
            `INSERT INTO clients (id, user_id, name, email, phone, document, notes, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            id,
            tenantId,
            data.name,
            data.email || null,
            data.phone || null,
            data.document || null,
            data.notes || null,
            data.address || null
        ).run();

        return enviarJSON({ message: "Cliente criado com sucesso!", id }, 201);
    }

    // Atualizar Cliente
    if (method === "PUT" && client_id) {
        const data = await request.json();
        await db.prepare(
            `UPDATE clients SET name = ?, email = ?, phone = ?, document = ?, notes = ?, address = ? WHERE id = ?`
        ).bind(
            data.name,
            data.email || null,
            data.phone || null,
            data.document || null,
            data.notes || null,
            data.address || null,
            client_id
        ).run();

        return enviarJSON({ message: "Cliente atualizado com sucesso!" });
    }

    // Deletar Cliente
    if (method === "DELETE" && client_id) {
        await db.prepare(
            `DELETE FROM clients WHERE id = ?`
        ).bind(client_id).run();

        return enviarJSON({ message: "Cliente removido com sucesso!" });
    }

    return enviarJSON({ error: "Método não permitido" }, 405);
}
