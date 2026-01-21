import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export const TOUR_STEPS = {
    '/dashboard': [
        {
            element: '[data-tour="dashboard-overview"]',
            popover: {
                title: 'Bem-vindo ao PrintLog!',
                description: 'Este é o seu painel de controle. Aqui você tem uma visão geral rápida de toda a sua operação de impressão 3D.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '[data-tour="dashboard-kpi"]',
            popover: {
                title: 'Indicadores Chave',
                description: 'Acompanhe seu progresso financeiro e operacional em tempo real.',
                side: "bottom"
            }
        },
        {
            element: '[data-tour="dashboard-widgets"]',
            popover: {
                title: 'Widgets Úteis',
                description: 'Acesse rapidamente suas anotações e projetos recentes.',
                side: "top"
            }
        }
    ],
    '/impressoras': [
        {
            element: '[data-tour="printer-add-btn"]',
            popover: {
                title: 'Adicione suas Máquinas',
                description: 'Comece clicando aqui para cadastrar sua primeira impressora 3D.',
                side: "bottom",
                align: 'end'
            }
        },
        {
            element: '[data-tour="printer-list"]',
            popover: {
                title: 'Sua Frota',
                description: 'Aqui aparecerão todas as suas máquinas. Você poderá ver o status, horas de uso e saúde de cada uma.',
                side: "top"
            }
        }
    ],
    '/calculadora': [
        {
            element: '[data-tour="calc-project-name"]',
            popover: {
                title: 'Nome do Projeto',
                description: 'Comece dando um nome para o seu orçamento.',
                side: "bottom",
                align: 'start'
            }
        },
        {
            element: '[data-tour="calc-material"]',
            popover: {
                title: '1. Matéria-Prima',
                description: 'Selecione o material e o peso da peça. O custo é calculado automaticamente baseada no seu estoque.',
                side: "right",
                align: 'start'
            }
        },
        {
            element: '[data-tour="calc-print-time"]',
            popover: {
                title: '2. Tempo',
                description: 'Insira o tempo de impressão e de acabamento para calcular custos de energia e mão de obra.',
                side: "right",
                align: 'start'
            }
        },
        {
            element: '[data-tour="calc-channels"]',
            popover: {
                title: '3. Canais de Venda',
                description: 'Vai vender no Mercado Livre ou Shopee? Inclua as taxas aqui.',
                side: "left",
                align: 'start'
            }
        },
        {
            element: '[data-tour="calc-extra"]',
            popover: {
                title: '4. Custos Extras',
                description: 'Não esqueça da embalagem, frete e outros consumíveis.',
                side: "left",
                align: 'start'
            }
        },
        {
            element: '[data-tour="calc-profit"]',
            popover: {
                title: '5. Lucro e Estratégia',
                description: 'Defina sua margem de lucro e veja o preço final sugerido.',
                side: "top"
            }
        },
        {
            element: '[data-tour="calc-results"]',
            popover: {
                title: 'Resumo Financeiro',
                description: 'Aqui você vê o RESULTADO REAL: Custo x Lucro Líquido.',
                side: "left",
                align: 'start'
            }
        }
    ]
};

export default function TourGuide() {
    const [location] = useLocation();
    const driverRef = useRef(null);

    useEffect(() => {
        // Inicializa o driver apenas uma vez
        driverRef.current = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: "Entendi!",
            nextBtnText: "Próximo",
            prevBtnText: "Anterior",
            progressText: "{{current}} de {{total}}",

            // Customização Visual para bater com o tema Dark do PrintLog
            popoverClass: 'driverjs-theme',

            steps: [] // Steps serão definidos dinamicamente
        });

        return () => {
            if (driverRef.current) {
                driverRef.current.destroy();
            }
        };
    }, []);

    // Função exposta globalmente ou via Context (se quiséssemos complicar, mas vamos manter simples por enquanto)
    // Para simplificar, vamos verificar o localStorage e a rota atual

    useEffect(() => {
        const tourKey = `hasSeenTour-${location}`;
        const hasSeen = localStorage.getItem(tourKey);

        // Se já viu, ignora. Se não tem steps pra essa rota, ignora.
        const steps = TOUR_STEPS[location];

        if (!hasSeen && steps && steps.length > 0) {
            // Pequeno delay para garantir que a UI carregou
            const timer = setTimeout(() => {
                if (driverRef.current) {
                    driverRef.current.setSteps(steps);
                    driverRef.current.drive();

                    // Marca como visto ao iniciar/terminar?
                    // Vamos marcar como visto para não encher o saco
                    localStorage.setItem(tourKey, 'true');
                }
            }, 1000); // 1s delay

            return () => clearTimeout(timer);
        }
    }, [location]);

    // Renderless component
    return null;
}
