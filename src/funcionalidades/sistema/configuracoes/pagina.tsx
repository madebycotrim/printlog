import { useState, useEffect, useCallback } from "react";

import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { toast } from "react-hot-toast";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { Carregamento } from "@/compartilhado/componentes";

import { CardPerfil } from "./componentes/CardPerfil";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardPlanoPremium } from "./componentes/CardPlanoPremium";
import { CardAparencia } from "./componentes/CardAparencia";
import { CardMetricas } from "./componentes/CardMetricas";
import { CardPrivacidade } from "./componentes/CardPrivacidade";
import { CardEstudio } from "./componentes/CardEstudio";
import { CardIdentidade } from "./componentes/CardIdentidade";

import { useContextoTema } from "@/configuracoes/tema/tema_provider";
import { useBeta } from "@/compartilhado/contextos/ContextoBeta";
import { useArmazemConfiguracoes } from "./estado/armazemConfiguracoes";
import { ehAdmin } from "@/compartilhado/constantes/admin";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";

export function PaginaConfiguracoes() {
  const { usuario, atualizarPerfil, recuperarSenha, enviarEmailVerificacao } = useAutenticacao();
  const contextoTema = useContextoTema();
  const beta = useBeta();
  const config = useArmazemConfiguracoes();
  const { search } = useLocation();

  const [destaqueLgpd, definirDestaqueLgpd] = useState(false);

  /**
   * ESTADO LOCAL (DRAFTS)
   * Usamos estado local para que o usuário possa editar e "Descartar" se quiser.
   * Os valores iniciais vêm do nosso novo Armazém de Configurações (Zustand + Persist).
   */
  const [nome, definirNome] = useState(usuario?.nome || "");
  const [custoEnergia, definirCustoEnergia] = useState(config.custoEnergia);
  const [horaMaquina, definirHoraMaquina] = useState(config.horaMaquina);
  const [horaOperador, definirHoraOperador] = useState(config.horaOperador);
  const [margemLucro, definirMargemLucro] = useState(config.margemLucro);
  const [plano, definirPlano] = useState<PlanoUsuario>(config.plano);
  const [nomeEstudio, definirNomeEstudio] = useState(config.nomeEstudio);
  const [sloganEstudio, definirSloganEstudio] = useState(config.sloganEstudio);
  const [logoEstudio, definirLogoEstudio] = useState(config.logoEstudio);

  // Estados de UI
  const [salvando, definirSalvando] = useState(false);
  const [sucesso, definirSucesso] = useState(false);
  const [enviandoEmail, definirEnviandoEmail] = useState(false);
  const [sucessoLink, definirSucessoLink] = useState(false);

  // Estado Estudio
  const [participarPrototipos, definirParticiparPrototipos] = useState(beta.participarPrototipos);
  const [betaMultiEstudio, definirBetaMultiEstudio] = useState(beta.betaMultiEstudio);
  const [betaOrcamentosMagicos, definirBetaOrcamentosMagicos] = useState(beta.betaOrcamentosMagicos);
  const [betaEstoqueInteligente, definirBetaEstoqueInteligente] = useState(beta.betaEstoqueInteligente);
  const [betaSimuladorMargem, definirBetaSimuladorMargem] = useState(beta.betaSimuladorMargem);
  const [templateOrcamento, definirTemplateOrcamento] = useState(beta.templateOrcamento);
  const [limiteAlertaEstoque, definirLimiteAlertaEstoque] = useState(beta.limiteAlertaEstoque);

  // Estado Inicial da Aparencia para detectar mudancas
  const [inicialAparencia, definirInicialAparencia] = useState({
    modo: contextoTema.modoTema,
    cor: contextoTema.corPrimaria,
    fonte: contextoTema.fonte,
  });

  const [inicializado, definirInicializado] = useState(false);

  // Sincroniza o estado local quando os dados persistidos são carregados no armazém
  useEffect(() => {
    if (config.carregando) return;

    definirCustoEnergia(config.custoEnergia);
    definirHoraMaquina(config.horaMaquina);
    definirHoraOperador(config.horaOperador);
    definirMargemLucro(config.margemLucro);
    definirPlano(config.plano);
    definirNomeEstudio(config.nomeEstudio);
    definirSloganEstudio(config.sloganEstudio);
    definirLogoEstudio(config.logoEstudio);
    
    if (usuario?.nome) {
      definirNome(usuario.nome);
    }
    
    definirInicializado(true);
  }, [config.carregando, config.custoEnergia, config.horaMaquina, config.horaOperador, config.margemLucro, config.plano, config.nomeEstudio, config.sloganEstudio, config.logoEstudio, usuario?.nome]);

  // Redirecionamento de seção via URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    const secao = params.get("secao");

    if (secao === "privacidade") {
      const elemento = document.getElementById("secao-privacidade");
      if (elemento) {
        elemento.scrollIntoView({ behavior: "smooth", block: "start" });
        definirDestaqueLgpd(true);
        setTimeout(() => definirDestaqueLgpd(false), 6000);
      }
    }
  }, [search]);

  // Lê o plano diretamente do armazém (fonte de verdade: Cloudflare D1)
  const eProOuSuperior = config.plano === "PRO" || config.plano === "FUNDADOR";


  // Detecção de Alterações Pendentes
  const perfilPendente = nome !== (usuario?.nome || "");
  const operacionalPendente =
    custoEnergia !== config.custoEnergia || 
    horaMaquina !== config.horaMaquina || 
    horaOperador !== config.horaOperador || 
    margemLucro !== config.margemLucro ||
    plano !== config.plano;

  const identidadePendente =
    nomeEstudio !== config.nomeEstudio ||
    sloganEstudio !== config.sloganEstudio ||
    logoEstudio !== config.logoEstudio;

  const aparenciaPendente =
    contextoTema.modoTema !== inicialAparencia.modo ||
    contextoTema.corPrimaria !== inicialAparencia.cor ||
    contextoTema.fonte !== inicialAparencia.fonte;

  const estudioPendente = 
    participarPrototipos !== beta.participarPrototipos || 
    betaMultiEstudio !== beta.betaMultiEstudio || 
    betaOrcamentosMagicos !== beta.betaOrcamentosMagicos ||
    betaEstoqueInteligente !== beta.betaEstoqueInteligente ||
    betaSimuladorMargem !== beta.betaSimuladorMargem ||
    templateOrcamento !== beta.templateOrcamento ||
    limiteAlertaEstoque !== beta.limiteAlertaEstoque;

  const totalAlteracoes = [perfilPendente, operacionalPendente, identidadePendente, aparenciaPendente, estudioPendente].filter(
    Boolean,
  ).length;
  const temAlteracoes = totalAlteracoes > 0;

  const lidarComTrocaSenha = async () => {
    if (!usuario?.email) return;
    definirEnviandoEmail(true);
    definirSucessoLink(false);
    try {
      await recuperarSenha(usuario.email);
      toast.success("E-mail de redefinição enviado com sucesso!");
      definirSucessoLink(true);
      setTimeout(() => definirSucessoLink(false), 8000);
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Configuracoes" }, "Erro ao enviar e-mail", erro);
      toast.error("Erro ao enviar e-mail de redefinicao.");
    } finally {
      definirEnviandoEmail(false);
    }
  };

  const lidarComVerificacaoEmail = async () => {
    try {
      await enviarEmailVerificacao();
      toast.success("E-mail de verificação enviado!");
    } catch (erro) {
      toast.error("Erro ao enviar e-mail de verificação.");
    }
  };



  const lidarComSalvar = useCallback(async () => {
    definirSalvando(true);
    definirSucesso(false);
    try {
      // 1. Salvar Perfil no Firebase
      await atualizarPerfil({ 
        nome, 
        fotoUrl: nome !== usuario?.nome ? "" : undefined 
      });

      // 2. Atualiza o estado local do armazém e persiste no D1
      config.definirCustoEnergia(custoEnergia);
      config.definirHoraMaquina(horaMaquina);
      config.definirHoraOperador(horaOperador);
      config.definirMargemLucro(margemLucro);
      config.definirPlano(plano);
      config.definirIdentidadeEstudio(nomeEstudio, sloganEstudio, logoEstudio);
      await config.salvarNoD1(usuario!.uid);

      // 3. Atualizar Estado Inicial de Aparência
      definirInicialAparencia({
        modo: contextoTema.modoTema,
        cor: contextoTema.corPrimaria,
        fonte: contextoTema.fonte,
      });

      // 4. Salvar Programas Beta
      beta.definirParticiparPrototipos(participarPrototipos);
      beta.definirBetaMultiEstudio(betaMultiEstudio);
      beta.definirBetaOrcamentosMagicos(betaOrcamentosMagicos);
      beta.definirBetaEstoqueInteligente(betaEstoqueInteligente);
      beta.definirBetaSimuladorMargem(betaSimuladorMargem);
      beta.definirTemplateOrcamento(templateOrcamento);
      beta.definirLimiteAlertaEstoque(limiteAlertaEstoque);

      definirSucesso(true);
      // Removido o toast.success para não poluir a tela a cada auto-save
      setTimeout(() => {
        definirSucesso(false);
      }, 3000);
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Configuracoes" }, "Erro ao salvar configurações", erro);
      toast.error("Falha ao salvar configurações.");
    } finally {
      definirSalvando(false);
    }
  }, [
    atualizarPerfil, nome, usuario, config, custoEnergia, horaMaquina, horaOperador,
    margemLucro, plano, nomeEstudio, sloganEstudio, logoEstudio, contextoTema,
    beta, participarPrototipos, betaMultiEstudio, betaOrcamentosMagicos,
    betaEstoqueInteligente, betaSimuladorMargem, templateOrcamento, limiteAlertaEstoque
  ]);

  // Efeito de Auto-save com Debounce de 1 segundo para evitar loops e excesso de requisições
  useEffect(() => {
    if (!inicializado || salvando) return;

    if (temAlteracoes) {
      const timer = setTimeout(() => {
        lidarComSalvar();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [temAlteracoes, inicializado, salvando, lidarComSalvar]);

  useDefinirCabecalho({
    titulo: "Configurações",
    subtitulo: salvando 
      ? "Salvando alterações em background..." 
      : sucesso 
        ? "Todas as alterações foram salvas automaticamente" 
        : "Gestão operacional e proteção de dados (LGPD)",
    ocultarBusca: true,
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {enviandoEmail && (
        <Carregamento texto={"Enviando E-mail de Segurança..."} />
      )}
      <div className="relative mx-auto w-full max-w-6xl space-y-6">
        {config.plano !== "FREE" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.0 }}>
            <CardPlanoPremium
              plano={config.plano}
              cicloPagamento={config.cicloPagamento}
              vencimentoPlano={config.vencimentoPlano}
              emailVerificado={usuario?.emailVerified || false}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.0 }}>
            <CardPerfil
              usuario={usuario}
              nome={nome}
              definirNome={definirNome}
              sucessoEmail={sucessoLink}
              lidarComTrocaSenha={lidarComTrocaSenha}
              lidarComVerificacaoEmail={lidarComVerificacaoEmail}
              pendente={perfilPendente}
              esconderFerramentasAdmin={!ehAdmin(usuario?.email)}
              planoSelecionado={plano}
              aoMudarPlano={definirPlano}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.08 }}>
            <CardOperacional
              custoEnergia={custoEnergia}
              definirCustoEnergia={definirCustoEnergia}
              horaMaquina={horaMaquina}
              definirHoraMaquina={definirHoraMaquina}
              horaOperador={horaOperador}
              definirHoraOperador={definirHoraOperador}
              margemLucro={margemLucro}
              definirMargemLucro={definirMargemLucro}
              pendente={operacionalPendente}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.16 }}>
            <CardAparencia pendente={aparenciaPendente} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.24 }}>
            <CardMetricas />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.12 }}>
          <CardIdentidade
            nomeEstudio={nomeEstudio}
            definirNomeEstudio={definirNomeEstudio}
            sloganEstudio={sloganEstudio}
            definirSloganEstudio={definirSloganEstudio}
            logoEstudio={logoEstudio}
            definirLogoEstudio={definirLogoEstudio}
            eProOuSuperior={eProOuSuperior}
            pendente={identidadePendente}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.32 }}>
          <CardEstudio
            participarPrototipos={participarPrototipos}
            definirParticiparPrototipos={definirParticiparPrototipos}
            betaMultiEstudio={betaMultiEstudio}
            definirBetaMultiEstudio={definirBetaMultiEstudio}
            betaOrcamentosMagicos={betaOrcamentosMagicos}
            definirBetaOrcamentosMagicos={definirBetaOrcamentosMagicos}
            betaEstoqueInteligente={betaEstoqueInteligente}
            definirBetaEstoqueInteligente={definirBetaEstoqueInteligente}
            betaSimuladorMargem={betaSimuladorMargem}
            definirBetaSimuladorMargem={definirBetaSimuladorMargem}
            templateOrcamento={templateOrcamento}
            definirTemplateOrcamento={definirTemplateOrcamento}
            limiteAlertaEstoque={limiteAlertaEstoque}
            definirLimiteAlertaEstoque={definirLimiteAlertaEstoque}
            pendente={estudioPendente}
          />
        </motion.div>

        <motion.div id="secao-privacidade" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 }}>
          <CardPrivacidade destaque={destaqueLgpd} />
        </motion.div>

        <div className="pt-4 pb-8 border-t border-borda-sutil flex flex-col md:flex-row justify-between items-center gap-4">
          <p></p>
          <p className="text-[10px] text-muted-foreground opacity-60 text-center md:text-right leading-relaxed">
            Plataforma em conformidade com a Lei Federal nº 13.709/2018 (LGPD).
            <br />
            Dados criptografados e processados sob rigorosos padrões de segurança.
          </p>
        </div>
      </div>

    </div>
  );
}
