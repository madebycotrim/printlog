import { Transition, Variants } from "framer-motion";

// Transições de Física de Mola Premium
export const transicaoMolaSuave: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

export const transicaoMolaRapida: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  mass: 0.5,
};

// Variantes para Páginas (Fade and Slide)
export const variantesPagina: Variants = {
  inicial: { opacity: 0, y: 15 },
  animar: { 
    opacity: 1, 
    y: 0, 
    transition: transicaoMolaSuave 
  },
  sair: { 
    opacity: 0, 
    y: -10, 
    transition: { duration: 0.2, ease: "easeInOut" } 
  },
};

// Variantes para Listas em Cascata (Stagger)
export const variantesContainerLista: Variants = {
  inicial: { opacity: 0 },
  animar: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const variantesItemLista: Variants = {
  inicial: { opacity: 0, y: 15, scale: 0.98 },
  animar: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: transicaoMolaRapida 
  },
  sair: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// Variantes para Modais e Overlays
export const variantesOverlay: Variants = {
  inicial: { opacity: 0, backdropFilter: "blur(0px)" },
  animar: { opacity: 1, backdropFilter: "blur(8px)", transition: { duration: 0.3 } },
  sair: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.2 } },
};

export const variantesModal: Variants = {
  inicial: { opacity: 0, scale: 0.95, y: 20 },
  animar: { opacity: 1, scale: 1, y: 0, transition: transicaoMolaSuave },
  sair: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};
