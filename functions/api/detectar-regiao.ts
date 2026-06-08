/// <reference types="@cloudflare/workers-types" />

export const onRequest: PagesFunction = async (context) => {
    try {
        // Cloudflare fornece a UF diretamente no objeto cf do request em produção
        const regionCode = context.request.cf?.regionCode;
        
        if (regionCode) {
            return new Response(JSON.stringify({ region: regionCode }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Caso local de desenvolvimento, fazemos o fetch pelo servidor (contornando o CSP do navegador)
        const resposta = await fetch('http://ip-api.com/json/?fields=status,region');
        const dados = await resposta.json() as any;

        if (dados.status === 'success' && dados.region) {
            return new Response(JSON.stringify({ region: dados.region }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ region: "SP" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ region: "SP" }), {
            headers: { "Content-Type": "application/json" }
        });
    }
};
