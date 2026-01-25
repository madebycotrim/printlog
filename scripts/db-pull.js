import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuração
const DB_NAME = 'printlog_db';
const DUMP_FILE = 'prod_dump.sql';
// O diretório onde o Miniflare guarda o D1. 
// O caminho pode variar, mas baseado na estrutura verificada: .wrangler/state/v3/d1/miniflare-D1DatabaseObject/
const BASE_D1_PATH = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');

console.log('🔄 Iniciando sincronização do banco de dados (Remote -> Local)...');

try {
    // 1. Exportar dados da produção
    console.log(`📥 Baixando dados de '${DB_NAME}' (Remote)...`);
    execSync(`npx wrangler d1 export ${DB_NAME} --remote --output=./${DUMP_FILE}`, { stdio: 'inherit' });

    // 2. Limpar banco local (Apagar arquivos .sqlite)
    // Precisamos encontrar o arquivo correto. O nome parece ser um hash, então vamos apagar todos os .sqlite nessa pasta para garantir.
    // (Assumindo que só tem um banco principal ou que queremos resetar tudo no dev)
    if (fs.existsSync(BASE_D1_PATH)) {
        console.log('🧹 Limpando banco de dados local...');
        const files = fs.readdirSync(BASE_D1_PATH);
        for (const file of files) {
            if (file.endsWith('.sqlite') || file.endsWith('.sqlite-shm') || file.endsWith('.sqlite-wal')) {
                fs.unlinkSync(path.join(BASE_D1_PATH, file));
                console.log(`   - Deletado: ${file}`);
            }
        }
    } else {
        console.log('ℹ️  Nenhum banco local encontrado para limpar (o diretório não existe).');
    }

    // 3. Importar dados para o local
    console.log(`📤 Importando dados para '${DB_NAME}' (Local)...`);
    execSync(`npx wrangler d1 execute ${DB_NAME} --local --file=./${DUMP_FILE}`, { stdio: 'inherit' });

    console.log('✅ Sincronização concluída com sucesso!');
    console.log('🚀 Agora você pode rodar "npm run dev" com os dados atualizados.');

} catch (error) {
    console.error('❌ Erro durante a sincronização:', error.message);
    process.exit(1);
}
