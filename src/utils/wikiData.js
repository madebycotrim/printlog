// src/utils/wikiData.js
import {
    Factory, AlertTriangle, Users, CheckCircle,
    Coins, Store, Wrench, ShieldCheck, Thermometer,
    Zap, MousePointer2, Settings, ShieldAlert, 
    Layers, PenTool, Flame
} from 'lucide-react';

export const WIKI_DATA = [

    /* ======================================================
       PASSO ZERO (CALIBRAÇÃO E SETUP)
    ====================================================== */
    {
        id: '1',
        title: "Calibração Inicial",
        category: "Configuração",
        type: "setup",
        icon: Settings,
        color: "sky",
        topics: [
            {
                id: "set1",
                title: "Nivelamento de Mesa",
                content: "O segredo está na resistência do papel. O bico deve 'beliscar' o papel sem travar. Mesa mal nivelada é a causa de 90% das desistências de quem está começando.",
                level: "Iniciante",
                updated: "JAN/2026",
                gcode: "G28 ; Home\nG1 Z0.2 ; Altura de papel"
            },
            {
                id: "set2",
                title: "E-Steps (Extrusão)",
                content: "Se você pede 10cm de filamento e a máquina puxa 9cm, suas peças serão fracas. Calibrar os passos do motor garante que a quantidade de plástico seja exata.",
                level: "Intermediário",
                updated: "FEV/2026"
            },
            {
                id: "set3",
                title: "Torre de Temperatura",
                content: "Não confie no rótulo do filamento. Imprima uma torre de temperatura para cada marca nova. Isso evita fiapos e garante o brilho perfeito.",
                level: "Essencial",
                updated: "MAR/2026"
            }
        ]
    },

    /* ======================================================
       PRODUÇÃO (DICAS DE OFICINA)
    ====================================================== */
    {
        id: '2',
        title: "Fluxo de Produção",
        category: "Dia a Dia",
        type: "setup",
        icon: Factory,
        color: "zinc",
        topics: [
            {
                id: "pr1",
                title: "Agrupar por Cores",
                content: "Agrupe várias peças da mesma cor no mesmo fatiamento. Menos trocas de rolo significam menos chances de erro e economia de tempo de aquecimento da mesa.",
                level: "Iniciante",
                updated: "JAN/2026"
            },
            {
                id: "pr2",
                title: "Cuidado com Peças Longas",
                content: "Impressões de +12h são arriscadas. Se possível, divida o modelo em partes e use pinos de encaixe. É melhor colar duas partes do que perder 20 horas de trabalho.",
                level: "Segurança",
                updated: "JAN/2026"
            },
            {
                id: "pr3",
                title: "Manutenção Preventiva",
                content: "Limpe os trilhos e lubrifique os eixos a cada 100 horas de uso. Um parafuso solto por vibração pode destruir uma impressão de quilos de filamento.",
                level: "Essencial",
                updated: "FEV/2026"
            }
        ]
    },

    /* ======================================================
       SOCORRO! (RESOLVENDO ERROS)
    ====================================================== */
    {
        id: "3",
        title: "Socorro! Deu Erro",
        category: "Problemas",
        type: "critico",
        icon: AlertTriangle,
        color: "rose",
        topics: [
            {
                id: "e1",
                title: "Bico Entupido",
                content: "Se a extrusora estala ou não sai plástico, seu bico está sujo. Tente o 'Cold Pull' (puxada a frio) ou troque o bico. Nunca use agulhas com o bico frio!",
                level: "Urgente",
                updated: "JAN/2026",
                gcode: "M104 S240 ; Aquecer bem para limpeza"
            },
            {
                id: "e3",
                title: "Peça Soltando (Warping)",
                content: "Cantos levantando? Mesa suja. Lave com detergente neutro e água. O álcool as vezes espalha a gordura em vez de tirar.",
                level: "Fácil",
                updated: "MAR/2026"
            },
            {
                id: "e4",
                title: "Layer Shift (Degrau)",
                content: "Se a peça deu um 'pulo' pro lado, verifique se os cabos não prenderam em algum lugar ou se a correia está frouxa demais.",
                level: "Mecânica",
                updated: "FEV/2026"
            }
        ]
    },

    /* ======================================================
       QUÍMICA DOS FILAMENTOS
    ====================================================== */
    {
        id: "4",
        title: "Segredos dos Materiais",
        category: "Química",
        type: "setup",
        icon: Thermometer,
        color: "amber",
        topics: [
            {
                id: "mat1",
                title: "PLA: O Rei da Facilidade",
                content: "Ideal para bonecos e protótipos. Mas cuidado: ele deforma dentro de um carro no sol! Use apenas para decoração interna.",
                level: "Iniciante",
                updated: "MAR/2026"
            },
            {
                id: "mat2",
                title: "TPU (Flexível)",
                content: "Para imprimir 'borracha', reduza a velocidade para 20mm/s e desligue a retração. O TPU dobra dentro do extrusor se você for rápido demais.",
                level: "Intermediário",
                updated: "FEV/2026"
            },
            {
                id: "mat3",
                title: "PETG: O Tanque de Guerra",
                content: "Resiste ao sol e impactos. Dica: Ele gruda demais no vidro! Use cola bastão para criar uma película protetora ou ele pode arrancar pedaços da sua mesa.",
                level: "Intermediário",
                updated: "JAN/2026"
            }
        ]
    },

    /* ======================================================
       DESENHO PARA IMPRESSÃO (DESIGN)
    ====================================================== */
    {
        id: "5",
        title: "Modelagem Maker",
        category: "Criação",
        type: "setup",
        icon: PenTool,
        color: "purple",
        topics: [
            {
                id: "des1",
                title: "Regra dos 45 Graus",
                content: "Tente desenhar suas peças com inclinações de até 45°. Assim, a impressora consegue fazer as paredes sem precisar de suportes, economizando plástico.",
                level: "Design",
                updated: "MAR/2026"
            },
            {
                id: "des2",
                title: "Tolerância de Encaixe",
                content: "Se for fazer uma tampa, deixe uma folga de 0.2mm entre as peças. Na impressão 3D, se desenhar o tamanho exato, elas não vão encaixar.",
                level: "Técnico",
                updated: "FEV/2026"
            }
        ]
    },

    /* ======================================================
       NEGÓCIOS E MARKETPLACE
    ====================================================== */
    {
        id: "6",
        title: "Vendas e Marketplaces",
        category: "Negócios",
        type: "lucro",
        icon: Store,
        color: "emerald",
        topics: [
            {
                id: "m1",
                title: "Foto Profissional",
                content: "Não tire foto da peça na impressora suja. Use um fundo branco ou preto liso. O cliente compra com os olhos e uma foto ruim desvaloriza seu trabalho.",
                level: "Vendas",
                updated: "JAN/2026"
            },
            {
                id: "m3",
                title: "O Perigo dos Personagens",
                content: "Vender Mario, Marvel ou Disney em marketplaces pode causar o banimento da sua conta. Foque em peças úteis ou modelos com licença comercial (Tribes/Patreon).",
                level: "Jurídico",
                updated: "MAR/2026"
            },
            {
                id: "f1",
                title: "Cálculo de Preço",
                content: "Preço = (Luz + Filamento + Depreciação da Máquina) + Seu Tempo + Margem de Erro. Se não cobrar pela sua hora, você está pagando para trabalhar.",
                level: "Financeiro",
                updated: "FEV/2026"
            }
        ]
    },

    /* ======================================================
       ALTA PERFORMANCE (EXPERIENTES)
    ====================================================== */
    {
        id: "7",
        title: "Tuning e Velocidade",
        category: "Técnico",
        type: "setup",
        icon: Zap,
        color: "orange",
        topics: [
            {
                id: "t1",
                title: "Firmware Klipper",
                content: "O Klipper usa o poder de um Raspberry Pi ou computador para processar os movimentos. Permite dobrar a velocidade da sua impressora sem perder detalhes.",
                level: "Veterano",
                updated: "MAR/2026"
            },
            {
                id: "t3",
                title: "Linear Advance",
                content: "Ajuste a pressão do bico para que as quinas das peças não fiquem 'arredondadas' ou com excesso de plástico. É o toque final para peças técnicas perfeitas.",
                level: "Avançado",
                updated: "JAN/2026"
            }
        ]
    },

    /* ======================================================
       SEGURANÇA E SAÚDE
    ====================================================== */
    {
        id: "8",
        title: "Segurança na Oficina",
        category: "Saúde",
        type: "critico",
        icon: Flame,
        color: "red",
        topics: [
            {
                id: "s1",
                title: "Fumaça Tóxica (VOCs)",
                content: "ABS e Resina soltam gases que fazem mal à saúde. Nunca deixe essas impressoras no seu quarto ou lugares sem ventilação. Use filtros de carvão ativado.",
                level: "Segurança",
                updated: "MAR/2026"
            },
            {
                id: "s2",
                title: "Risco de Incêndio",
                content: "Sempre verifique se os conectores da placa mãe não estão derretendo. Instale um sensor de fumaça acima das impressoras. Segurança vem antes do lucro.",
                level: "Crítico",
                updated: "FEV/2026",
                gcode: "M81 ; Desligar fonte (se suportado)"
            }
        ]
    }
];