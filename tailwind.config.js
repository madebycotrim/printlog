/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    500: "#0284c7",
                    600: "#0369a1",
                },
            },
            fontSize: {
                xs: ["0.72rem", { lineHeight: "1" }],     
                sm: ["0.78rem", { lineHeight: "1.1" }],   
                base: ["0.86rem", { lineHeight: "1.2" }], 
                lg: ["0.92rem", { lineHeight: "1.1" }],   
                price: ["2.4rem", { lineHeight: "1" }],   
            },
            spacing: {
                "btn-x": "0.625rem", 
            },
            borderRadius: {
                "xl-2": "1rem",
            },
            keyframes: {
                // Animação de Scanner (existente)
                scan: {
                    from: { transform: "translateY(-100%)" },
                    to: { transform: "translateY(200%)" },
                },
                // Animação de Flutuação (Adicionada para os cards da Hero)
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-15px)" },
                }
            },
            animation: {
                scan: "scan 2s linear infinite",
                // Configuração da animação lenta para os cards
                "float-slow": "float 6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};