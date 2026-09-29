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
]);

interface PadraoDinamico {
  regex: RegExp;
  en: (match: RegExpMatchArray) => string;
  es: (match: RegExpMatchArray) => string;
}

const PADROES_DINAMICOS: PadraoDinamico[] = [
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
   * Define o idioma ativo e traduz ou restaura o DOM
   */
  public definirIdioma(idioma: string) {
    this.idiomaAtivo = idioma;

    if (idioma === "pt-BR") {
      this.ativo = false;
      this.restaurar();
    } else if (idioma === "en-US" || idioma === "es-ES") {
      this.ativo = true;
      this.traduzirTudo();
    }
  }

  /**
   * Restaura todos os textos e atributos para a versão original em português
   */
  public restaurar() {
    if (!document.body) return;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let no: Node | null;
    while ((no = walker.nextNode())) {
      if (this.mapaNosOriginais.has(no)) {
        const textoOriginal = this.mapaNosOriginais.get(no)!;
        if (no.textContent !== textoOriginal) {
          no.textContent = textoOriginal;
        }
      }
    }

    // Restaura placeholders, titles e aria-labels
    const elementosComInput = document.querySelectorAll<HTMLElement>("input, textarea, button, a, [aria-label]");
    elementosComInput.forEach((el) => {
      const originais = this.mapaAttrOriginais.get(el);
      if (originais) {
        const elInput = el as HTMLInputElement | HTMLTextAreaElement;
        if (originais.placeholder && elInput.placeholder !== undefined) {
          elInput.placeholder = originais.placeholder;
        }
        if (originais.title && el.title !== undefined) {
          el.title = originais.title;
        }
        if (originais.ariaLabel) {
          el.setAttribute("aria-label", originais.ariaLabel);
        }
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
          if (
            pai.closest("#btn-seletor-idioma") ||
            pai.closest('[data-seletor-idioma="true"]') ||
            pai.closest('[data-sonner-toaster]')
          ) return NodeFilter.FILTER_REJECT;
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
      original = atual;
      this.mapaNosOriginais.set(no, original);
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
        guardados.placeholder = elInput.placeholder;
      }
      if (el.title) {
        guardados.title = el.title;
      }
      const aria = el.getAttribute("aria-label");
      if (aria) {
        guardados.ariaLabel = aria;
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

    // 2. Busca case-insensitive no texto completo original
    const minusculoCompleto = textoAparado.toLowerCase();
    for (const [pt, traducoes] of Object.entries(DICIONARIO_GLOBAL)) {
      if (pt.toLowerCase() === minusculoCompleto) {
        const subst = traducoes[subChave];
        const formatada = textoAparado === textoAparado.toUpperCase() && textoAparado.length > 2
          ? subst.toUpperCase()
          : subst;
        return textoOriginal.replace(textoAparado, formatada);
      }
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

    // 5. Busca case-insensitive no conteúdo sem prefixo/sufixo
    const minusculo = conteudo.toLowerCase();
    for (const [pt, traducoes] of Object.entries(DICIONARIO_GLOBAL)) {
      if (pt.toLowerCase() === minusculo) {
        const subst = traducoes[subChave];
        const formatada = conteudo === conteudo.toUpperCase() && conteudo.length > 2
          ? subst.toUpperCase()
          : subst;
        return textoOriginal.replace(textoAparado, `${prefixoAjustado}${formatada}${sufixo}`);
      }
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
  if (!idioma || idioma === "pt-BR") {
    try {
      const salvo = typeof localStorage !== "undefined" ? localStorage.getItem("printlog_idioma") : null;
      if (salvo && (salvo === "en-US" || salvo === "es-ES")) {
        idioma = salvo;
      }
    } catch {
      // Ignora erro
    }
  }
  if (!idioma || idioma === "pt-BR") return texto;
  const subChave: "en" | "es" = idioma.startsWith("es") ? "es" : "en";
  return tradutorUniversalDOM.traduzirTexto(texto, subChave);
}
