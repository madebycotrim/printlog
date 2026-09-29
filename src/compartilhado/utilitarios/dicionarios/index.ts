import { DicionarioTraducao } from "./tipos";
import { dicionarioBase } from "./dicionarioBase";
import { dicionarioLanding } from "./dicionarioLanding";
import { dicionarioPainel } from "./dicionarioPainel";
import { dicionarioCalculadora } from "./dicionarioCalculadora";
import { dicionarioProducao } from "./dicionarioProducao";
import { dicionarioComercial } from "./dicionarioComercial";
import { dicionarioSistema } from "./dicionarioSistema";

export * from "./tipos";

/**
 * Dicionário global unificado contendo todos os termos e frases
 * traduzíveis da aplicação (Landing Page, Dashboard, Calculadora,
 * Produção, Comercial, Configurações e Sistema).
 */
export const DICIONARIO_GLOBAL: DicionarioTraducao = Object.assign(
  {},
  dicionarioBase,
  dicionarioLanding,
  dicionarioPainel,
  dicionarioCalculadora,
  dicionarioProducao,
  dicionarioComercial,
  dicionarioSistema
);
