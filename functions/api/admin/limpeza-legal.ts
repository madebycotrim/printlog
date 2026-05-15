/**
 * Endpoint Administrativo: Limpeza Legal de Logs (Marco Civil)
 * Finalidade: Apagar registros de acesso com mais de 180 dias.
 * Base Legal: Art. 15 do Marco Civil da Internet (exige retenção por 6 meses).
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    // 1. Executa a limpeza baseada no padrão SQLite para datas ISO8601
    // Apaga tudo que for menor que a data de hoje menos 180 dias.
    const resultado = await env.DB.prepare(
      "DELETE FROM logs_acesso WHERE data_acesso < date('now', '-180 days')"
    ).run();

    console.info(`[Limpeza Legal] Executada com sucesso. Registros removidos: ${resultado.meta.changes}`);

    return new Response(JSON.stringify({
      sucesso: true,
      mensagem: "Limpeza de logs executada.",
      detalhes: {
        registros_removidos: resultado.meta.changes,
        data_referencia: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (erro) {
    console.error("[Limpeza Legal] Erro ao processar limpeza:", erro);
    
    return new Response(JSON.stringify({
      sucesso: false,
      erro: "Falha ao processar a limpeza de logs no banco de dados."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
