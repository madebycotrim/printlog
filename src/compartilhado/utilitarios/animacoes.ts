/**
 * Utilitários centralizados de animações para garantir consistência visual no sistema.
 * Utilizamos configurações baseadas em molas (springs) para movimentos fluidos.
 */

// Transições de Física de Mola Premium
export const transicaoMolaSuave = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

export const transicaoMolaRapida = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  mass: 0.5,
};

// Variantes para Páginas (Fade and Slide)
export const variantesPagina = {
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
export const variantesContainerLista = {
  inicial: { opacity: 0 },
  animar: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const variantesItemLista = {
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
export const variantesOverlay = {
  inicial: { opacity: 0, backdropFilter: "blur(0px)" },
  animar: { opacity: 1, backdropFilter: "blur(8px)", transition: { duration: 0.3 } },
  sair: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.2 } },
};

export const variantesModal = {
  inicial: { opacity: 0, scale: 0.95, y: 20 },
  animar: { opacity: 1, scale: 1, y: 0, transition: transicaoMolaSuave },
  sair: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};
