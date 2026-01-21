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
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeInDown: {
                    "0%": { opacity: "0", transform: "translateY(-20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(30px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                slideInLeft: {
                    "0%": { opacity: "0", transform: "translateX(-30px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.9)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
                bounce: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                shake: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-8px)" },
                    "20%, 40%, 60%, 80%": { transform: "translateX(8px)" },
                },
                checkmark: {
                    "0%": { strokeDashoffset: "100" },
                    "100%": { strokeDashoffset: "0" },
                },
                errorX: {
                    "0%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
                    "50%": { transform: "scale(1.2) rotate(180deg)" },
                    "100%": { transform: "scale(1) rotate(180deg)", opacity: "1" },
                },
                successPulse: {
                    "0%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)" },
                    "70%": { boxShadow: "0 0 0 10px rgba(16, 185, 129, 0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)" },
                },
                errorPulse: {
                    "0%": { boxShadow: "0 0 0 0 rgba(244, 63, 94, 0.7)" },
                    "70%": { boxShadow: "0 0 0 10px rgba(244, 63, 94, 0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(244, 63, 94, 0)" },
                },
                slideDown: {
                    "from": { opacity: "0", transform: "translateY(-10px)" },
                    "to": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "fade-in-up": "fadeInUp 0.4s ease-out",
                "fade-in-down": "fadeInDown 0.4s ease-out",
                "slide-in-right": "slideInRight 0.4s ease-out",
                "slide-in-left": "slideInLeft 0.4s ease-out",
                "scale-in": "scaleIn 0.3s ease-out",
                "shimmer": "shimmer 1.5s ease-in-out infinite",
                "bounce": "bounce 1s ease-in-out infinite",
                "shake": "shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
                "success-pulse": "successPulse 0.6s ease-out",
                "error-pulse": "errorPulse 0.6s ease-out",
                "slide-down": "slideDown 0.3s ease-out",
                "check-mark": "checkmark 0.4s ease-out forwards",
                "error-x": "errorX 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            },
        },
    },
    plugins: [],
};