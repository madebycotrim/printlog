/// <reference types="@cloudflare/workers-types" />

/**
 * Middleware Global - PrintLog V2
 * Resetado para diagnóstico de erro 500.
 */
export const onRequest: PagesFunction<any> = async (context) => {
    return context.next();
};
