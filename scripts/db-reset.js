import fs from 'fs';
import path from 'path';

const BASE_D1_PATH = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');

console.log('🧹 Iniciando limpeza do banco de dados local...');

if (fs.existsSync(BASE_D1_PATH)) {
    const files = fs.readdirSync(BASE_D1_PATH);
    let deletedCount = 0;

    for (const file of files) {
        if (file.endsWith('.sqlite') || file.endsWith('.sqlite-shm') || file.endsWith('.sqlite-wal')) {
            try {
                fs.unlinkSync(path.join(BASE_D1_PATH, file));
                console.log(`   - Deletado: ${file}`);
                deletedCount++;
            } catch (err) {
                console.error(`   ❌ Erro ao deletar ${file}: ${err.message}`);
            }
        }
    }

    if (deletedCount > 0) {
        console.log('✅ Banco de dados local resetado com sucesso!');
    } else {
        console.log('ℹ️  Nenhum arquivo de banco de dados encontrado para deletar.');
    }
} else {
    console.log('ℹ️  Diretório do banco de dados não encontrado (o banco já pode estar vazio).');
}
