// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
    theme: {
        extend: {
            colors: {
                // se quiser tokens customizados, adicione aqui
                brand: {
                    500: "#0284c7",
                    600: "#0369a1",
                },
            },
            fontSize: {
                // tokens tipográficos reutilizáveis
                xs: ["0.72rem", { lineHeight: "1" }],     // badges / labels
                sm: ["0.78rem", { lineHeight: "1.1" }],   // legendas
                base: ["0.86rem", { lineHeight: "1.2" }], // corpo
                lg: ["0.92rem", { lineHeight: "1.1" }],   // subtítulos
                price: ["2.4rem", { lineHeight: "1" }],   // preço principal
            },
            spacing: {
                // se quiser espaçamentos reutilizáveis
                "btn-x": "0.625rem", // 10px -> exemplo para pads
            },
            borderRadius: {
                "xl-2": "1rem",
            },
            keyframes: {
                scan: {
                    from: { transform: "translateY(-100%)" },
                    to: { transform: "translateY(200%)" },
                },
            },
            animation: {
                scan: "scan 2s linear infinite",
            },
        },
    },
    plugins: [],
};
