/**
 * Tradutor Universal do DOM para PrintLog
 * 
 * Permite tradução em tempo real de qualquer texto em qualquer página ou componente,
 * mesmo que o componente possua texto fixo (hardcoded) no JSX.
 * 
 * Utiliza WeakMap para armazenar o texto original de cada TextNode, garantindo
 * reversibilidade perfeita para pt-BR e preservando referências do Virtual DOM do React.
 */

import { DICIONARIO_GLOBAL, EntradaDicionario, IdiomaDestino } from "./dicionarios";

export { DICIONARIO_GLOBAL };
export type { EntradaDicionario, IdiomaDestino };

// Tags e elementos que NUNCA devem ser tocados
const TAGS_IGNORADAS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "SVG",
  "PATH",
  "DEFS",
  "MASK",
  "G",
  "USE",
  "RECT",
  "CIRCLE",
  "ELLIPSE",
  "LINE",
  "svg",
  "path",
  "defs",
  "mask",
  "g",
  "use",
  "rect",
  "circle",
  "ellipse",
  "line",
]);

interface PadraoDinamico {
  regex: RegExp;
  en: (match: RegExpMatchArray) => string;
  es: (match: RegExpMatchArray) => string;
}

const PADROES_DINAMICOS: PadraoDinamico[] = [
  // Sessões ativas
  {
    regex: /^(\d+)\s+ativas?$/i,
    en: (m) => `${m[1]} ACTIVE`,
    es: (m) => `${m[1]} ${m[1] === "1" ? "ACTIVA" : "ACTIVAS"}`,
  },
  // Interações
  {
    regex: /^últimas?\s+(\d+)\s+interações?$/i,
    en: (m) => `Last ${m[1]} interactions`,
    es: (m) => `Últimas ${m[1]} interacciones`,
  },
  // Falha registrada com descarte
  {
    regex: /^Falha registrada\. Descontado (\d+(?:[.,]\d+)?)\s*g de material\.?$/i,
    en: (m) => `Failure recorded. Deducted ${m[1]}g of material.`,
    es: (m) => `Fallo registrado. Se descontaron ${m[1]}g de material.`,
  },
  // Abatimento de gramas
  {
    regex: /^(\d+(?:[.,]\d+)?)\s*g\s+abatidos?\s+do\s+estoque!?$/i,
    en: (m) => `${m[1]}g deducted from stock!`,
    es: (m) => `¡${m[1]}g deducidos del stock!`,
  },
  // Dias restantes
  {
    regex: /^(\d+)\s+dias?\s+restantes?$/i,
    en: (m) => `${m[1]} ${m[1] === "1" ? "day" : "days"} remaining`,
    es: (m) => `${m[1]} ${m[1] === "1" ? "día" : "días"} restantes`,
  },
  // Expirado há X dias
  {
    regex: /^Expirado há (\d+)\s+dias?$/i,
    en: (m) => `Expired ${m[1]} ${m[1] === "1" ? "day" : "days"} ago`,
    es: (m) => `Expirado hace ${m[1]} ${m[1] === "1" ? "día" : "días"}`,
  },
  // Paginação
  {
    regex: /^Página (\d+) de (\d+)$/i,
    en: (m) => `Page ${m[1]} of ${m[2]}`,
    es: (m) => `Página ${m[1]} de ${m[2]}`,
  },
  // Exportação em formato
  {
    regex: /^Exportação em (\w+) concluída com sucesso!?$/i,
    en: (m) => `Export in ${m[1]} completed successfully!`,
    es: (m) => `¡Exportación en ${m[1]} completada con éxito!`,
  },
  // Download de arquivo
  {
    regex: /^Arquivo (\w+) baixado com sucesso!?$/i,
    en: (m) => `File ${m[1]} downloaded successfully!`,
    es: (m) => `¡Archivo ${m[1]} descargado con éxito!`,
  },
  // Limite de itens/impressoras
  {
    regex: /^Você atingiu o limite de (\d+)\s+(.+)\s+no plano Gratuito$/i,
    en: (m) => `You have reached the limit of ${m[1]} ${m[2]} on the Free plan`,
    es: (m) => `Ha alcanzado el límite de ${m[1]} ${m[2]} en el plan Gratuito`,
  },
  // Limite de X atingido
  {
    regex: /^Limite de\s*(.+)\s*atingido$/i,
    en: (m) => `Limit of ${m[1]} reached`,
    es: (m) => `Límite de ${m[1]} alcanzado`,
  },
  // Quantidade de peças
  {
    regex: /^(\d+)\s+peças?$/i,
    en: (m) => `${m[1]} ${m[1] === "1" ? "part" : "parts"}`,
    es: (m) => `${m[1]} ${m[1] === "1" ? "pieza" : "piezas"}`,
  },
  // Vagas restantes
  {
    regex: /^(\d+)\s+vagas?\s+restantes?$/i,
    en: (m) => `${m[1]} ${m[1] === "1" ? "spot" : "spots"} remaining`,
    es: (m) => `${m[1]} ${m[1] === "1" ? "cupo" : "cupos"} restantes`,
  },
  // Combobox Criar / Usar
  {
    regex: /^Criar "([^"]+)"$/i,
    en: (m) => `Create "${m[1]}"`,
    es: (m) => `Crear "${m[1]}"`,
  },
  {
    regex: /^Usar "([^"]+)"$/i,
    en: (m) => `Use "${m[1]}"`,
    es: (m) => `Usar "${m[1]}"`,
  },
  // Diâmetro do Bico
  {
    regex: /^Bico\s+(\d+(?:[.,]\d+)?)\s*mm$/i,
    en: (m) => `Nozzle ${m[1]}mm`,
    es: (m) => `Boquilla ${m[1]}mm`,
  },
  // Sessão inativa
  {
    regex: /^Sua sessão irá expirar em (\d+)\s+minuto\(s\) por inatividade\.?$/i,
    en: (m) => `Your session will expire in ${m[1]} minute(s) due to inactivity.`,
    es: (m) => `Su sesión expirará en ${m[1]} minuto(s) por inactividad.`,
  },
  // Clientes / Filamentos exportados no arquivo
  {
    regex: /^\.\.\.\s*e mais (\d+)\s+(.+)\s+exportados? no arquivo (.+)\.?$/i,
    en: (m) => `... and ${m[1]} more ${m[2]} exported in the ${m[3]} file.`,
    es: (m) => `... y ${m[1]} más ${m[2]} exportados en el archivo ${m[3]}.`,
  },
  // Tempo atrás (horas, minutos)
  {
    regex: /^(\d+)\s+horas?\s+atrás$/i,
    en: (m) => `${m[1]} ${m[1] === "1" ? "hour" : "hours"} ago`,
    es: (m) => `hace ${m[1]} ${m[1] === "1" ? "hora" : "horas"}`,
  },
  {
    regex: /^(\d+)\s+minutos?\s+atrás$/i,
    en: (m) => `${m[1]} ${m[1] === "1" ? "minute" : "minutes"} ago`,
    es: (m) => `hace ${m[1]} ${m[1] === "1" ? "minuto" : "minutos"}`,
  },
];

interface PadraoDinamicoReverso {
  regex: RegExp;
  pt: (match: RegExpMatchArray) => string;
}

const PADROES_DINAMICOS_REVERSOS: PadraoDinamicoReverso[] = [
  // Interações
  {
    regex: /^(?:Last|Últimas?)\s+(\d+)\s+inter(?:actions|acciones)$/i,
    pt: (m) => `Últimas ${m[1]} interações`,
  },
  // Falha registrada com descarte
  {
    regex: /^(?:Failure recorded\. Deducted|Fallo registrado\. Se descontaron)\s+(\d+(?:[.,]\d+)?)\s*g\s+(?:of material|de material)\.?$/i,
    pt: (m) => `Falha registrada. Descontado ${m[1]}g de material.`,
  },
  // Abatimento de gramas
  {
    regex: /^¡?(\d+(?:[.,]\d+)?)\s*g\s+(?:deducted from|deducidos del)\s+stock!?$/i,
    pt: (m) => `${m[1]}g abatidos do estoque!`,
  },
  // Dias restantes
  {
    regex: /^(\d+)\s+(?:day|days|día|días)\s+(?:remaining|restantes)$/i,
    pt: (m) => `${m[1]} ${m[1] === "1" ? "dia restante" : "dias restantes"}`,
  },
  // Expirado há X dias
  {
    regex: /^(?:Expired\s+(\d+)\s+(?:day|days)\s+ago|Expirado\s+hace\s+(\d+)\s+(?:día|días))$/i,
    pt: (m) => `Expirado há ${m[1] || m[2]} ${(m[1] || m[2]) === "1" ? "dia" : "dias"}`,
  },
  // Paginação
  {
    regex: /^(?:Page|Página)\s+(\d+)\s+(?:of|de)\s+(\d+)$/i,
    pt: (m) => `Página ${m[1]} de ${m[2]}`,
  },
  // Exportação em formato
  {
    regex: /^¡?Export(?:ación)?\s+(?:in|en)\s+(\w+)\s+(?:completed successfully|completada con éxito)!?$/i,
    pt: (m) => `Exportação em ${m[1]} concluída com sucesso!`,
  },
  // Download de arquivo
  {
    regex: /^¡?(?:File|Archivo)\s+(\w+)\s+(?:downloaded successfully|descargado con éxito)!?$/i,
    pt: (m) => `Arquivo ${m[1]} baixado com sucesso!`,
  },
  // Limite de itens/impressoras
  {
    regex: /^(?:You have reached the limit of|Ha alcanzado el límite de)\s+(\d+)\s+(.+)\s+(?:on the Free plan|en el plan Gratuito)$/i,
    pt: (m) => `Você atingiu o limite de ${m[1]} ${m[2]} no plano Gratuito`,
  },
  // Limite de X atingido
  {
    regex: /^(?:Limit of|Límite de)\s+(.+)\s+(?:reached|alcanzado)$/i,
    pt: (m) => `Limite de ${m[1]} atingido`,
  },
  // Quantidade de peças
  {
    regex: /^(\d+)\s+(?:part|parts|pieza|piezas)$/i,
    pt: (m) => `${m[1]} ${m[1] === "1" ? "peça" : "peças"}`,
  },
  // Vagas restantes
  {
    regex: /^(\d+)\s+(?:spot|spots|cupo|cupos)\s+(?:remaining|restantes)$/i,
    pt: (m) => `${m[1]} ${m[1] === "1" ? "vaga restante" : "vagas restantes"}`,
  },
  // Combobox Criar / Usar
  {
    regex: /^(?:Create|Crear)\s+"([^"]+)"$/i,
    pt: (m) => `Criar "${m[1]}"`,
  },
  {
    regex: /^(?:Use|Usar)\s+"([^"]+)"$/i,
    pt: (m) => `Usar "${m[1]}"`,
  },
  // Diâmetro do Bico
  {
    regex: /^(?:Nozzle|Boquilla)\s+(\d+(?:[.,]\d+)?)\s*mm$/i,
    pt: (m) => `Bico ${m[1]}mm`,
  },
  // Sessão inativa
  {
    regex: /^(?:Your session will expire in|Su sesión expirará en)\s+(\d+)\s+minute\(s\)\s+(?:due to inactivity|por inactividad)\.?$/i,
    pt: (m) => `Sua sessão irá expirar em ${m[1]} minuto(s) por inatividade.`,
  },
  // Clientes / Filamentos exportados no arquivo
  {
    regex: /^\.\.\.\s*(?:and|y)\s+(\d+)\s+(?:more|más)\s+(.+)\s+exported in the\s+(.+)\s+file\.?$/i,
    pt: (m) => `... e mais ${m[1]} ${m[2]} exportados no arquivo ${m[3]}`,
  },
  // Tempo atrás (horas, minutos)
  {
    regex: /^(?:(\d+)\s+(?:hour|hours)\s+ago|hace\s+(\d+)\s+(?:hora|horas))$/i,
    pt: (m) => `${m[1] || m[2]} ${(m[1] || m[2]) === "1" ? "hora" : "horas"} atrás`,
  },
  {
    regex: /^(?:(\d+)\s+(?:minute|minutes)\s+ago|hace\s+(\d+)\s+(?:minuto|minutos))$/i,
    pt: (m) => `${m[1] || m[2]} ${(m[1] || m[2]) === "1" ? "minuto" : "minutos"} atrás`,
  },
];

// Dicionários reversos e diretos em memória para performance máxima O(1)
const DICIONARIO_REVERSO_EN = new Map<string, string>();
const DICIONARIO_REVERSO_ES = new Map<string, string>();
const DICIONARIO_REVERSO_EN_LOWER = new Map<string, string>();
const DICIONARIO_REVERSO_ES_LOWER = new Map<string, string>();
const DICIONARIO_GLOBAL_LOWER = new Map<string, EntradaDicionario>();

for (const [pt, traducoes] of Object.entries(DICIONARIO_GLOBAL)) {
  const ptLimpo = pt.trim();
  if (!ptLimpo) continue;

  DICIONARIO_GLOBAL_LOWER.set(ptLimpo.toLowerCase(), traducoes);

  const en = traducoes.en?.trim();
  const es = traducoes.es?.trim();

  if (en && en !== ptLimpo) {
    DICIONARIO_REVERSO_EN.set(en, ptLimpo);
    DICIONARIO_REVERSO_EN_LOWER.set(en.toLowerCase(), ptLimpo);
  }
  if (es && es !== ptLimpo) {
    DICIONARIO_REVERSO_ES.set(es, ptLimpo);
    DICIONARIO_REVERSO_ES_LOWER.set(es.toLowerCase(), ptLimpo);
  }
}

class MotorTradutorUniversalDOM {
  private idiomaAtivo: string = "pt-BR";
  private mapaNosOriginais = new WeakMap<Node, string>();
  private mapaUltimasTraducoes = new WeakMap<Node, string>();
  private mapaAttrOriginais = new WeakMap<Element, Record<string, string>>();
  private observer: MutationObserver | null = null;
  private agendamentoId: number | null = null;
  private ativo: boolean = false;
  private processandoMutacao: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const salvo = localStorage.getItem("printlog_idioma");
        if (salvo && (salvo === "en-US" || salvo === "es-ES")) {
          this.idiomaAtivo = salvo;
          this.ativo = true;
        } else if (!salvo && typeof navigator !== "undefined") {
          const nav = navigator.language?.toLowerCase() || "";
          if (nav.startsWith("es")) {
            this.idiomaAtivo = "es-ES";
            this.ativo = true;
          } else if (nav.startsWith("en")) {
            this.idiomaAtivo = "en-US";
            this.ativo = true;
          }
        }
      } catch {
        // Fallback seguro em ambientes restritos
      }
      this.iniciarObserver();
    }
  }

  public getIdiomaAtivo(): string {
    return this.idiomaAtivo;
  }

  /**
   * Define o idioma ativo e traduz ou restaura o DOM com múltiplas passagens
   * garantindo que re-renderizações assíncronas do React sejam capturadas.
   */
  public definirIdioma(idioma: string) {
    this.idiomaAtivo = idioma;

    if (idioma === "pt-BR") {
      this.ativo = false;
      this.restaurar();
      if (typeof window !== "undefined") {
        requestAnimationFrame(() => this.restaurar());
        setTimeout(() => this.restaurar(), 40);
        setTimeout(() => this.restaurar(), 120);
        setTimeout(() => this.restaurar(), 250);
        setTimeout(() => this.restaurar(), 500);
      }
    } else if (idioma === "en-US" || idioma === "es-ES") {
      this.ativo = true;
      this.traduzirTudo();
      if (typeof window !== "undefined") {
        requestAnimationFrame(() => this.traduzirTudo());
        setTimeout(() => this.traduzirTudo(), 40);
        setTimeout(() => this.traduzirTudo(), 120);
        setTimeout(() => this.traduzirTudo(), 250);
        setTimeout(() => this.traduzirTudo(), 500);
      }
    }
  }

  /**
   * Restaura todos os textos e atributos para a versão original em português,
   * utilizando tanto o mapa de nós originais quanto o dicionário reverso EN/ES -> PT.
   */
  public restaurar() {
    if (typeof document === "undefined" || !document.body) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const pai = node.parentElement;
          if (!pai || TAGS_IGNORADAS.has(pai.tagName)) return NodeFilter.FILTER_REJECT;
          if (pai.isContentEditable) return NodeFilter.FILTER_REJECT;
          if (pai.closest("#btn-seletor-idioma, [data-seletor-idioma='true'], [data-sonner-toaster]")) return NodeFilter.FILTER_REJECT;
          const texto = node.textContent?.trim();
          if (!texto || texto.length < 2) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let no: Node | null;
    while ((no = walker.nextNode())) {
      const atual = no.textContent || "";
      let textoParaRestaurar = "";

      if (this.mapaNosOriginais.has(no)) {
        const salvo = this.mapaNosOriginais.get(no)!;
        textoParaRestaurar = this.reverterParaPortugues(salvo);
      } else {
        textoParaRestaurar = this.reverterParaPortugues(atual);
      }

      if (textoParaRestaurar && textoParaRestaurar !== atual) {
        no.textContent = textoParaRestaurar;
        this.mapaNosOriginais.set(no, textoParaRestaurar);
        this.mapaUltimasTraducoes.delete(no);
      }
    }

    // Restaura placeholders, titles e aria-labels
    const elementosComInput = document.querySelectorAll<HTMLElement>("input, textarea, button, a, [aria-label]");
    elementosComInput.forEach((el) => {
      const originais = this.mapaAttrOriginais.get(el);
      const elInput = el as HTMLInputElement | HTMLTextAreaElement;

      if (elInput.placeholder !== undefined && elInput.placeholder) {
        const val = originais?.placeholder || elInput.placeholder;
        const revertido = this.reverterParaPortugues(val);
        if (elInput.placeholder !== revertido) elInput.placeholder = revertido;
      }

      if (el.title !== undefined && el.title) {
        const val = originais?.title || el.title;
        const revertido = this.reverterParaPortugues(val);
        if (el.title !== revertido) el.title = revertido;
      }

      const aria = el.getAttribute("aria-label");
      if (aria) {
        const val = originais?.ariaLabel || aria;
        const revertido = this.reverterParaPortugues(val);
        if (el.getAttribute("aria-label") !== revertido) el.setAttribute("aria-label", revertido);
      }
    });
  }

  /**
   * Traduz todos os nós de texto e placeholders do DOM para o idioma ativo
   */
  public traduzirTudo() {
    if (!this.ativo || !document.body) return;

    const idiomaChave: IdiomaDestino = this.idiomaAtivo === "es-ES" ? "es-ES" : "en-US";
    const subChave = idiomaChave === "es-ES" ? "es" : "en";

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const pai = node.parentElement;
          if (!pai || TAGS_IGNORADAS.has(pai.tagName)) return NodeFilter.FILTER_REJECT;
          if (pai.isContentEditable) return NodeFilter.FILTER_REJECT;
          if (pai.closest("#btn-seletor-idioma, [data-seletor-idioma='true'], [data-sonner-toaster]")) return NodeFilter.FILTER_REJECT;
          const texto = node.textContent?.trim();
          if (!texto || texto.length < 2) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let no: Node | null;
    while ((no = walker.nextNode())) {
      this.processarNoTexto(no, subChave);
    }

    // Traduz atributos comuns como placeholders, titles e aria-labels
    const elementos = document.querySelectorAll<HTMLElement>("input[placeholder], textarea[placeholder], button[title], a[title], [aria-label]");
    elementos.forEach((el) => {
      this.processarAtributos(el, subChave);
    });
  }

  /**
   * Traduz um nó de texto individual preservando pontuação e espaços
   */
  private processarNoTexto(no: Node, subChave: "en" | "es") {
    let original = this.mapaNosOriginais.get(no);
    const atual = no.textContent || "";
    const ultimaTrad = this.mapaUltimasTraducoes.get(no);

    // Se o nó ainda não foi mapeado OU o React renderizou um novo texto diferente da nossa tradução
    if (!original || (atual && atual !== ultimaTrad && atual !== original)) {
      // Normaliza para português caso o nó tenha sido criado já em inglês/espanhol
      original = this.reverterParaPortugues(atual);
      this.mapaNosOriginais.set(no, original);
    } else {
      // Garante que o texto guardado no mapa de originais esteja sempre em português
      const verificadoPt = this.reverterParaPortugues(original);
      if (verificadoPt !== original) {
        original = verificadoPt;
        this.mapaNosOriginais.set(no, original);
      }
    }

    const traduzido = this.traduzirTexto(original, subChave);
    if (traduzido !== original && no.textContent !== traduzido) {
      this.mapaUltimasTraducoes.set(no, traduzido);
      no.textContent = traduzido;
    }
  }

  /**
   * Traduz placeholders, titles e aria-labels de elementos
   */
  private processarAtributos(el: HTMLElement, subChave: "en" | "es") {
    let guardados = this.mapaAttrOriginais.get(el);
    if (!guardados) {
      guardados = {};
      const elInput = el as HTMLInputElement | HTMLTextAreaElement;
      if (elInput.placeholder) {
        guardados.placeholder = this.reverterParaPortugues(elInput.placeholder);
      }
      if (el.title) {
        guardados.title = this.reverterParaPortugues(el.title);
      }
      const aria = el.getAttribute("aria-label");
      if (aria) {
        guardados.ariaLabel = this.reverterParaPortugues(aria);
      }
      this.mapaAttrOriginais.set(el, guardados);
    }

    const elInput = el as HTMLInputElement | HTMLTextAreaElement;
    if (guardados.placeholder && elInput.placeholder !== undefined) {
      const traduzido = this.traduzirTexto(guardados.placeholder, subChave);
      if (elInput.placeholder !== traduzido) {
        elInput.placeholder = traduzido;
      }
    }

    if (guardados.title && el.title !== undefined) {
      const traduzido = this.traduzirTexto(guardados.title, subChave);
      if (el.title !== traduzido) {
        el.title = traduzido;
      }
    }

    if (guardados.ariaLabel) {
      const traduzido = this.traduzirTexto(guardados.ariaLabel, subChave);
      if (el.getAttribute("aria-label") !== traduzido) {
        el.setAttribute("aria-label", traduzido);
      }
    }
  }

  /**
   * Reverte um texto do inglês ou espanhol de volta para o português brasileiro nativo.
   * Utiliza o dicionário reverso e os padrões dinâmicos inversos preservando prefixos,
   * sufixos e formatação de maiúsculas.
   */
  public reverterParaPortugues(textoOriginal: string): string {
    if (!textoOriginal) return textoOriginal;
    const textoAparado = textoOriginal.trim();
    if (!textoAparado) return textoOriginal;

    // Se já é uma chave em português no dicionário global, preserva imediatamente
    if (DICIONARIO_GLOBAL[textoAparado]) {
      return textoOriginal;
    }

    // 1. Busca direta completa no mapa reverso EN ou ES
    const ptDireto = DICIONARIO_REVERSO_EN.get(textoAparado) || DICIONARIO_REVERSO_ES.get(textoAparado);
    if (ptDireto) {
      const formatada = textoAparado === textoAparado.toUpperCase() && textoAparado.length > 2
        ? ptDireto.toUpperCase()
        : ptDireto;
      return textoOriginal.replace(textoAparado, formatada);
    }

    // 2. Busca case-insensitive completa
    const minusculoCompleto = textoAparado.toLowerCase();
    const ptLower = DICIONARIO_REVERSO_EN_LOWER.get(minusculoCompleto) || DICIONARIO_REVERSO_ES_LOWER.get(minusculoCompleto);
    if (ptLower) {
      const formatada = textoAparado === textoAparado.toUpperCase() && textoAparado.length > 2
        ? ptLower.toUpperCase()
        : ptLower;
      return textoOriginal.replace(textoAparado, formatada);
    }

    // 3. Extração de prefixos e sufixos
    let prefixo = "";
    let sufixo = "";
    let conteudo = textoAparado;

    const matchPrefixo = conteudo.match(/^(\d+(?:\.\d+)*\.?|Ej:?\s*|Ex:?\s*|[+•\->."“'()=\s–—*~#]+)\s*/i);
    if (matchPrefixo && matchPrefixo[0].length < conteudo.length) {
      prefixo = matchPrefixo[0];
      conteudo = conteudo.substring(prefixo.length).trim();
    }

    const matchSufixo = conteudo.match(/\s*([:\-!?>."”')]+|\.{3})$/);
    if (matchSufixo && matchSufixo[0].length < conteudo.length) {
      sufixo = matchSufixo[0];
      conteudo = conteudo.substring(0, conteudo.length - sufixo.length).trim();
    }

    // Ajusta prefixo Ej: de volta para Ex:
    let prefixoAjustado = prefixo;
    if (/^Ej:?\s*/i.test(prefixo)) {
      prefixoAjustado = prefixo.replace(/^Ej:?/i, "Ex:");
    }

    // 4. Busca direta no conteúdo sem prefixo/sufixo
    const ptConteudo = DICIONARIO_REVERSO_EN.get(conteudo) || DICIONARIO_REVERSO_ES.get(conteudo);
    if (ptConteudo) {
      const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
        ? ptConteudo.toUpperCase()
        : ptConteudo;
      return textoOriginal.replace(textoAparado, `${prefixoAjustado}${formatada}${sufixo}`);
    }

    // 5. Busca case-insensitive no conteúdo sem prefixo/sufixo
    const minusculoConteudo = conteudo.toLowerCase();
    const ptConteudoLower = DICIONARIO_REVERSO_EN_LOWER.get(minusculoConteudo) || DICIONARIO_REVERSO_ES_LOWER.get(minusculoConteudo);
    if (ptConteudoLower) {
      const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
        ? ptConteudoLower.toUpperCase()
        : ptConteudoLower;
      return textoOriginal.replace(textoAparado, `${prefixoAjustado}${formatada}${sufixo}`);
    }

    // 6. Padrões dinâmicos reversos
    for (const padrao of PADROES_DINAMICOS_REVERSOS) {
      const match = conteudo.match(padrao.regex);
      if (match) {
        const traducao = padrao.pt(match);
        const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
          ? traducao.toUpperCase()
          : traducao;
        return textoOriginal.replace(textoAparado, `${prefixoAjustado}${formatada}${sufixo}`);
      }
    }

    return textoOriginal;
  }

  /**
   * Aplica matching inteligente: busca exata, case insensitive e tratamento de prefixos/sufixos
   * NUNCA substitui termos parciais dentro de frases para evitar misturas bizarras (ex: "Back ao site" ou "+ New Cadastro")
   */
  public traduzirTexto(textoOriginal: string, subChave: "en" | "es"): string {
    if (!textoOriginal) return textoOriginal;
    const textoAparado = textoOriginal.trim();
    if (!textoAparado) return textoOriginal;

    // 1. Busca direta no texto completo original (caso a chave já contenha prefixos/sufixos como "(-) Custo...")
    const diretoCompleto = DICIONARIO_GLOBAL[textoAparado];
    if (diretoCompleto) {
      const traducao = diretoCompleto[subChave];
      const formatada = textoAparado === textoAparado.toUpperCase() && textoAparado.length > 2
        ? traducao.toUpperCase()
        : traducao;
      return textoOriginal.replace(textoAparado, formatada);
    }

    // 2. Busca case-insensitive no texto completo original (O(1))
    const minusculoCompleto = textoAparado.toLowerCase();
    const tradLowerCompleto = DICIONARIO_GLOBAL_LOWER.get(minusculoCompleto);
    if (tradLowerCompleto) {
      const subst = tradLowerCompleto[subChave];
      const formatada = textoAparado === textoAparado.toUpperCase() && textoAparado.length > 2
        ? subst.toUpperCase()
        : subst;
      return textoOriginal.replace(textoAparado, formatada);
    }

    // 3. Identificar e extrair decoradores/prefixos e sufixos comuns (ex: "+ ", "-> ", "...", ":", "(-) ", "1. ", "Ex: ")
    let prefixo = "";
    let sufixo = "";
    let conteudo = textoAparado;

    // Prefixo tipo "+ ", "• ", "- ", "> ", ". ", "(-) ", "(=) ", "1. ", "3.2. ", "Ex: ", etc.
    const matchPrefixo = conteudo.match(/^(\d+(?:\.\d+)*\.?|Ex:?\s*|[+•\->."“'()=\s–—*~#]+)\s*/i);
    if (matchPrefixo && matchPrefixo[0].length < conteudo.length) {
      prefixo = matchPrefixo[0];
      conteudo = conteudo.substring(prefixo.length).trim();
    }

    // Sufixo tipo " ->", "...", ":", "!", "?", ".", quotes, etc.
    const matchSufixo = conteudo.match(/\s*([:\-!?>."”')]+|\.{3})$/);
    if (matchSufixo && matchSufixo[0].length < conteudo.length) {
      sufixo = matchSufixo[0];
      conteudo = conteudo.substring(0, conteudo.length - sufixo.length).trim();
    }

    // Ajusta prefixo de exemplo caso o idioma seja espanhol
    let prefixoAjustado = prefixo;
    if (subChave === "es" && /^Ex:?\s*/i.test(prefixo)) {
      prefixoAjustado = prefixo.replace(/^Ex:?/i, "Ej:");
    }

    // 4. Busca direta exata no conteúdo sem prefixo/sufixo
    const direto = DICIONARIO_GLOBAL[conteudo];
    if (direto) {
      const traducao = direto[subChave];
      const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
        ? traducao.toUpperCase()
        : traducao;
      return textoOriginal.replace(textoAparado, `${prefixoAjustado}${formatada}${sufixo}`);
    }

    // 5. Busca case-insensitive no conteúdo sem prefixo/sufixo (O(1))
    const minusculo = conteudo.toLowerCase();
    const tradLowerConteudo = DICIONARIO_GLOBAL_LOWER.get(minusculo);
    if (tradLowerConteudo) {
      const subst = tradLowerConteudo[subChave];
      const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
        ? subst.toUpperCase()
        : subst;
      return textoOriginal.replace(textoAparado, `${prefixoAjustado}${formatada}${sufixo}`);
    }

    // 6. Tratamento de padrões dinâmicos com variáveis e números intercalados
    for (const padrao of PADROES_DINAMICOS) {
      const match = conteudo.match(padrao.regex);
      if (match) {
        const traducao = subChave === "es" ? padrao.es(match) : padrao.en(match);
        const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
          ? traducao.toUpperCase()
          : traducao;
        return textoOriginal.replace(textoAparado, `${prefixoAjustado}${formatada}${sufixo}`);
      }
    }

    // 7. Se não encontrou correspondência no dicionário, JAMAIS quebra ou mutila a frase.
    // Retorna o texto original como um bloco íntegro.
    return textoOriginal;
  }

  /**
   * Monitora adições e alterações ao DOM (navegação, re-renders do React, modais)
   */
  private iniciarObserver() {
    this.observer = new MutationObserver(() => {
      if (!this.ativo || this.processandoMutacao) return;

      if (this.agendamentoId !== null) {
        cancelAnimationFrame(this.agendamentoId);
      }

      this.agendamentoId = requestAnimationFrame(() => {
        this.processandoMutacao = true;
        this.traduzirTudo();
        this.processandoMutacao = false;
        this.agendamentoId = null;
      });
    });

    const config: MutationObserverInit = {
      childList: true,
      subtree: true,
      characterData: true,
    };

    if (document.body) {
      this.observer.observe(document.body, config);
    } else {
      window.addEventListener("DOMContentLoaded", () => {
        this.observer?.observe(document.body, config);
      });
    }
  }
}

export const tradutorUniversalDOM = new MotorTradutorUniversalDOM();

/**
 * Função utilitária global para tradução síncrona dentro de componentes React
 * Garante que qualquer texto passado para cabeçalho, empty state ou widget
 * seja renderizado no idioma correto sem depender do DOM mutation observer.
 */
export function traduzirTextoGlobal(texto?: string | null): string {
  if (!texto) return texto || "";
  let idioma = tradutorUniversalDOM.getIdiomaAtivo();
  if (!idioma) {
    try {
      const salvo = typeof localStorage !== "undefined" ? localStorage.getItem("printlog_idioma") : null;
      if (salvo && (salvo === "en-US" || salvo === "es-ES" || salvo === "pt-BR")) {
        idioma = salvo;
      }
    } catch {
      // Ignora erro
    }
  }
  if (!idioma || idioma === "pt-BR") {
    return tradutorUniversalDOM.reverterParaPortugues(texto);
  }
  const subChave: "en" | "es" = idioma.startsWith("es") ? "es" : "en";
  return tradutorUniversalDOM.traduzirTexto(texto, subChave);
}
