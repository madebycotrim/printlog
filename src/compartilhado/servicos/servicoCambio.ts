/**
 * Serviço de Câmbio e Cotações Oficiais (AwesomeAPI / Banco Central do Brasil).
 * Gerencia a conversão dinâmica e precisa entre BRL (R$), USD ($) e EUR (€).
 * Regra 6.0: Moeda sempre mantida em centavos inteiros (Math.round).
 */

export type MoedaSuportada = "BRL" | "USD" | "EUR";

export interface TaxasCambio {
  USDBRL: number; // Quantos R$ vale 1 USD (ex: 5.22)
  EURBRL: number; // Quantos R$ vale 1 EUR (ex: 5.93)
  atualizadoEm: number;
  origem: "online" | "cache" | "contingencia";
}

// Taxas de contingência estáveis caso a rede esteja indisponível
const TAXAS_CONTINGENCIA: TaxasCambio = {
  USDBRL: 5.25,
  EURBRL: 5.92,
  atualizadoEm: Date.now(),
  origem: "contingencia",
};

const CHAVE_STORAGE_CAMBIO = "printlog_taxas_cambio_v1";
const TEMPO_VALIDADE_CACHE_MS = 30 * 60 * 1000; // 30 minutos

class ServicoCambio {
  private taxas: TaxasCambio;
  private ouvintes: Set<() => void> = new Set();
  private buscando: boolean = false;

  constructor() {
    this.taxas = this.carregarCacheInicial();
    // Inicia atualização em segundo plano se estiver no navegador
    if (typeof window !== "undefined") {
      this.atualizarTaxas().catch((err) => {
        console.warn("[ServicoCambio] Falha ao sincronizar taxas iniciais:", err);
      });
    }
  }

  /**
   * Recupera taxas do cache do navegador ou fallback imediato
   */
  private carregarCacheInicial(): TaxasCambio {
    if (typeof window === "undefined") return { ...TAXAS_CONTINGENCIA };

    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE_CAMBIO);
      if (salvo) {
        const parsed = JSON.parse(salvo) as TaxasCambio;
        const aindaValido = Date.now() - (parsed.atualizadoEm || 0) < TEMPO_VALIDADE_CACHE_MS;
        if (parsed.USDBRL > 0 && parsed.EURBRL > 0 && aindaValido) {
          return { ...parsed, origem: "cache" };
        }
      }
    } catch (e) {
      console.warn("[ServicoCambio] Falha ao ler cache de câmbio:", e);
    }

    return { ...TAXAS_CONTINGENCIA };
  }

  /**
   * Consulta as cotações oficiais via backend Cloudflare Edge (/api/cambio)
   * com fallback direto para AwesomeAPI e contingência estática.
   */
  public async atualizarTaxas(): Promise<TaxasCambio> {
    if (this.buscando) return this.taxas;
    this.buscando = true;

    // 1. Tenta via Cloudflare Pages Function nativo (/api/cambio) - Same Origin ('self'), imune a CSP
    const controladorEdge = new AbortController();
    const timeoutEdge = setTimeout(() => controladorEdge.abort(), 3500);

    try {
      const resposta = await fetch("/api/cambio", {
        signal: controladorEdge.signal,
        headers: { Accept: "application/json" },
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        const usdBrl = parseFloat(dados?.USDBRL);
        const eurBrl = parseFloat(dados?.EURBRL);

        if (usdBrl > 0 && eurBrl > 0) {
          this.taxas = {
            USDBRL: usdBrl,
            EURBRL: eurBrl,
            atualizadoEm: Date.now(),
            origem: "online",
          };

          try {
            localStorage.setItem(CHAVE_STORAGE_CAMBIO, JSON.stringify(this.taxas));
          } catch {
            // LocalStorage indisponível
          }

          this.notificarOuvintes();
          this.buscando = false;
          return this.taxas;
        }
      }
    } catch {
      // Fallback para AwesomeAPI direto abaixo
    } finally {
      clearTimeout(timeoutEdge);
    }

    // 2. Fallback direto para AwesomeAPI (permitido no CSP em public/_headers)
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), 3500);

    try {
      const resposta = await fetch(
        "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL",
        { signal: controlador.signal }
      );

      if (resposta.ok) {
        const dados = await resposta.json();
        const usdBrl = parseFloat(dados?.USDBRL?.bid);
        const eurBrl = parseFloat(dados?.EURBRL?.bid);

        if (usdBrl > 0 && eurBrl > 0) {
          this.taxas = {
            USDBRL: usdBrl,
            EURBRL: eurBrl,
            atualizadoEm: Date.now(),
            origem: "online",
          };

          try {
            localStorage.setItem(CHAVE_STORAGE_CAMBIO, JSON.stringify(this.taxas));
          } catch {
            // LocalStorage indisponível
          }

          this.notificarOuvintes();
          this.buscando = false;
          return this.taxas;
        }
      }
    } catch (erro) {
      console.warn("[ServicoCambio] AwesomeAPI direto falhou, tentando BCB SGS:", erro);
    } finally {
      clearTimeout(timeoutId);
    }

    // 3. Fallback direto para Banco Central do Brasil SGS Oficial (permitido no CSP)
    try {
      const [resUSD, resEUR] = await Promise.all([
        fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json"),
        fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.21619/dados/ultimos/1?formato=json"),
      ]);

      if (resUSD.ok && resEUR.ok) {
        const [dadosUSD, dadosEUR] = (await Promise.all([
          resUSD.json(),
          resEUR.json(),
        ])) as any[];

        const usdBrl = parseFloat(dadosUSD?.[0]?.valor);
        const eurBrl = parseFloat(dadosEUR?.[0]?.valor);

        if (usdBrl > 0 && eurBrl > 0) {
          this.taxas = {
            USDBRL: usdBrl,
            EURBRL: eurBrl,
            atualizadoEm: Date.now(),
            origem: "online",
          };

          try {
            localStorage.setItem(CHAVE_STORAGE_CAMBIO, JSON.stringify(this.taxas));
          } catch {
            // LocalStorage indisponível
          }

          this.notificarOuvintes();
          this.buscando = false;
          return this.taxas;
        }
      }
    } catch (erro) {
      console.warn("[ServicoCambio] Utilizando taxas de contingência/cache:", erro);
    } finally {
      this.buscando = false;
    }

    return this.taxas;
  }

  /**
   * Retorna as taxas vigentes atuais
   */
  public getTaxas(): TaxasCambio {
    return this.taxas;
  }

  /**
   * Inscreve um ouvinte para re-renderização quando as taxas forem atualizadas
   */
  public inscrever(ouvinte: () => void): () => void {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  }

  private notificarOuvintes() {
    this.ouvintes.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error("[ServicoCambio] Erro ao notificar ouvinte:", e);
      }
    });
  }

  /**
   * Converte centavos de uma moeda para outra mantendo sempre inteiro.
   */
  public converterCentavos(
    centavos: number,
    de: MoedaSuportada,
    para: MoedaSuportada
  ): number {
    if (!centavos || de === para) return Math.round(centavos);

    const { USDBRL, EURBRL } = this.taxas;

    // 1. Converter moeda de origem para centavos de Real (BRL)
    let emCentavosBrl = centavos;
    if (de === "USD") {
      emCentavosBrl = centavos * USDBRL;
    } else if (de === "EUR") {
      emCentavosBrl = centavos * EURBRL;
    }

    // 2. Converter centavos de Real (BRL) para moeda de destino
    let resultado = emCentavosBrl;
    if (para === "USD") {
      resultado = emCentavosBrl / USDBRL;
    } else if (para === "EUR") {
      resultado = emCentavosBrl / EURBRL;
    }

    return Math.round(resultado);
  }
}

export const servicoCambio = new ServicoCambio();

import { useState, useEffect } from "react";

export function useCambio() {
  const [taxas, setTaxas] = useState<TaxasCambio>(servicoCambio.getTaxas());

  useEffect(() => {
    return servicoCambio.inscrever(() => {
      setTaxas({ ...servicoCambio.getTaxas() });
    });
  }, []);

  return {
    taxas,
    atualizarTaxas: () => servicoCambio.atualizarTaxas(),
    converterCentavos: (c: number, de: MoedaSuportada, para: MoedaSuportada) =>
      servicoCambio.converterCentavos(c, de, para),
  };
}
