import { toast } from "sonner";

/**
 * Motor Inteligente de Vocalização de Tela (Text-to-Speech) em Português (pt-BR).
 * Extrai dinamicamente o contexto visual da página atual (títulos, valores principais e badges)
 * e realiza a leitura fluida via Web Speech API.
 */

class MotorVocalizador {
  private sintese: SpeechSynthesis | null = null;
  private falando: boolean = false;
  private pausado: boolean = false;
  private velocidade: number = 1.0;
  private ouvintesStatus: Array<(status: { falando: boolean; pausado: boolean }) => void> = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.sintese = window.speechSynthesis;
    }
  }

  public subscrever(callback: (status: { falando: boolean; pausado: boolean }) => void) {
    this.ouvintesStatus.push(callback);
    callback({ falando: this.falando, pausado: this.pausado });
    return () => {
      this.ouvintesStatus = this.ouvintesStatus.filter((cb) => cb !== callback);
    };
  }

  private notificar() {
    this.ouvintesStatus.forEach((cb) => cb({ falando: this.falando, pausado: this.pausado }));
  }

  /**
   * Extrai de forma inteligente o conteúdo principal da tela atual.
   */
  private extrairTextoDaTela(): string {
    const tituloPagina = document.querySelector("h1")?.innerText || document.title || "PrintLog";
    
    // Tenta encontrar subtítulos e cards de destaque
    const subtitulo = document.querySelector("h2")?.innerText || "";
    
    // Coleta cards com valores ou resumos (ex: totais de orçamento, lucro, badges)
    const cardsDestaque = Array.from(document.querySelectorAll("[data-vocalizar], .card, header"))
      .map((el) => (el as HTMLElement).innerText)
      .filter(Boolean)
      .slice(0, 3)
      .join(". ");

    let textoFinal = `Você está na página: ${tituloPagina}.`;
    if (subtitulo) textoFinal += ` ${subtitulo}.`;
    if (cardsDestaque) {
      // Limpa quebras de linha excessivas para uma leitura fluida
      const limpo = cardsDestaque.replace(/\n+/g, ", ").substring(0, 300);
      textoFinal += ` Resumo visual: ${limpo}.`;
    }

    return textoFinal;
  }

  /**
   * Inicia a vocalização inteligente da tela.
   */
  public vocalizarTela(textoCustomizado?: string) {
    if (!this.sintese) {
      toast.error("Leitura por áudio não suportada neste navegador.");
      return;
    }

    if (this.falando) {
      this.parar();
      return;
    }

    const texto = textoCustomizado || this.extrairTextoDaTela();
    const utterance = new SpeechSynthesisUtterance(texto);
    
    utterance.lang = "pt-BR";
    utterance.rate = this.velocidade;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.falando = true;
      this.pausado = false;
      this.notificar();
      toast.info("Vocalizando conteúdo da tela...", { duration: 3000 });
    };

    utterance.onend = () => {
      this.falando = false;
      this.pausado = false;
      this.notificar();
    };

    utterance.onerror = () => {
      this.falando = false;
      this.pausado = false;
      this.notificar();
    };

    this.sintese.cancel(); // Limpa qualquer fala anterior
    this.sintese.speak(utterance);
  }

  public pausarOuContinuar() {
    if (!this.sintese) return;
    if (this.sintese.speaking) {
      if (this.sintese.paused) {
        this.sintese.resume();
        this.pausado = false;
      } else {
        this.sintese.pause();
        this.pausado = true;
      }
      this.notificar();
    }
  }

  public parar() {
    if (this.sintese) {
      this.sintese.cancel();
      this.falando = false;
      this.pausado = false;
      this.notificar();
    }
  }

  public definirVelocidade(vel: number) {
    this.velocidade = vel;
  }

  public obterStatus() {
    return { falando: this.falando, pausado: this.pausado };
  }
}

export const vocalizadorVoz = new MotorVocalizador();
