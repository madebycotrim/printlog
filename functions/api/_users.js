import { sendJSON } from './[[path]]';
import axios from 'axios'; // Certifique-se de que axios está instalado

export async function handleUsers({ request, db, userId, pathArray, env }) {
    const method = request.method;

    // Rota: GET /api/users/backup
    if (method === 'GET') {
        // Correção do índice: pathArray[0] = 'users', pathArray[1] = 'backup'
        const action = pathArray[1]; 

        if (action === 'backup') {
            try {
                const results = await db.batch([
                    db.prepare("SELECT id, nome, material, cor_hex, peso_atual FROM filaments WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT id, nome, modelo FROM printers WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT id, label, data, created_at FROM projects WHERE user_id = ?").bind(userId)
                ]);

                return sendJSON({
                    success: true,
                    metadata: {
                        operator_id: userId,
                        generated_at: new Date().toISOString(),
                        status: "MANIFESTO_GERADO"
                    },
                    data: {
                        filaments: results[0].results || [],
                        printers: results[1].results || [],
                        settings: results[2].results[0] || {},
                        projects: (results[3].results || []).map(p => ({
                            ...p,
                            data: JSON.parse(p.data || "{}")
                        }))
                    }
                });
            } catch (err) {
                return sendJSON({ error: "Falha na extração do Manifesto", details: err.message }, 500);
            }
        }
        return sendJSON({ error: "Ação não identificada", debug_path: pathArray }, 404);
    }

    // Rota: DELETE /api/users
    if (method === 'DELETE') {
        try {
            // 1. PROTOCOLO DE EXPURGO NO BANCO DE DADOS (D1)
            // Removemos todos os dados do usuário antes de apagar a conta
            await db.batch([
                db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
            ]);

            // 2. EXCLUSÃO DA CONTA NO CLERK (AUTENTICAÇÃO) VIA AXIOS
            const clerkSecretKey = env.CLERK_SECRET_KEY;

            if (!clerkSecretKey) {
                throw new Error("Chave secreta CLERK_SECRET_KEY não encontrada no ambiente.");
            }

            // Chamada para a API do Clerk usando Axios
            await axios.delete(`https://api.clerk.com/v1/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${clerkSecretKey}`,
                    'Content-Type': 'application/json'
                }
            });

            // 3. RETORNO DE SUCESSO TOTAL
            return sendJSON({
                success: true,
                protocol: "EXPURGO_TOTAL_COMPLETE",
                message: "Dados do banco e conta de autenticação removidos com sucesso."
            });

        } catch (err) {
            // Captura erro específico do Axios ou do Banco
            const errorDetail = err.response?.data?.errors?.[0]?.message || err.message;
            console.error("ERRO CRÍTICO NO EXPURGO:", errorDetail);
            
            return sendJSON({
                error: "Falha crítica no protocolo de exclusão",
                details: errorDetail
            }, 500);
        }
    }

    return sendJSON({ error: "Método não autorizado" }, 405);
}
