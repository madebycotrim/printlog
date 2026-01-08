import { sendJSON } from './[[path]]';
import axios from 'axios';

export async function handleUsers({ request, db, userId, pathArray, env }) {
    const method = request.method;

    // --- LÓGICA DE GET (BACKUP) ---
    if (method === 'GET') {
        // Verifica se a palavra 'backup' existe em qualquer lugar do caminho da URL
        const isBackupAction = pathArray.some(p => p.toLowerCase() === 'backup');

        if (isBackupAction) {
            try {
                // Coleta todos os dados do maker em paralelo
                const results = await db.batch([
                    db.prepare("SELECT id, nome, material, cor_hex, peso_atual FROM filaments WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT id, nome, modelo, horas_totais FROM printers WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId),
                    db.prepare("SELECT id, label, data, created_at FROM projects WHERE user_id = ?").bind(userId)
                ]);

                return sendJSON({
                    success: true,
                    metadata: {
                        operator_id: userId,
                        generated_at: new Date().toISOString(),
                        protocol: "MANIFESTO_GERADO"
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
                return sendJSON({ error: "Falha na extração dos logs", details: err.message }, 500);
            }
        }
        
        // Se cair aqui, a rota não era backup
        return sendJSON({ error: "Rota de leitura não encontrada", path: pathArray }, 404);
    }

    // --- LÓGICA DE DELETE (EXPURGO TOTAL) ---
    if (method === 'DELETE') {
        try {
            // 1. Limpeza do Banco de Dados Local (D1)
            await db.batch([
                db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
            ]);

            // 2. Exclusão da conta no Clerk via API Secret Key
            const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;
            if (!CLERK_SECRET_KEY) {
                throw new Error("Chave CLERK_SECRET_KEY não configurada no servidor.");
            }

            // Usando Axios para deletar o usuário no Clerk
            await axios.delete(`https://api.clerk.com/v1/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return sendJSON({ 
                success: true, 
                protocol: "EXPURGO_TOTAL_SUCESSO",
                message: "Dados removidos do banco e conta de acesso deletada." 
            });

        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.message || err.message;
            return sendJSON({ error: "Erro crítico no protocolo de expurgo", details: errorMsg }, 500);
        }
    }

    return sendJSON({ error: "Método HTTP não permitido" }, 405);
}
