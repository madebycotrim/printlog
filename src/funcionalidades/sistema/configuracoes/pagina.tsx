import { useState, useEffect } from "react";
import { Save, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { toast } from "react-hot-toast";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";

import { CardPerfil } from "./componentes/CardPerfil";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardAparencia } from "./componentes/CardAparencia";
import { CardMetricas } from "./componentes/CardMetricas";
import { CardPrivacidade } from "./componentes/CardPrivacidade";
import { CardEstudio } from "./componentes/CardEstudio";

import { usarContextoTema } from "@/configuracoes/tema/tema_provider";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { usarArmazemConfiguracoes } from "./estado/armazemConfiguracoes";

export function PaginaConfiguracoes() {
  const { usuario, atualizarPerfil, recuperarSenha } = usarAutenticacao();
  const contextoTema = usarContextoTema();
  const beta = usarBeta();
  const config = usarArmazemConfiguracoes();
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

  // Sincroniza o estado local quando os dados persistidos são carregados no armazém
  useEffect(() => {
    definirCustoEnergia(config.custoEnergia);
    definirHoraMaquina(config.horaMaquina);
    definirHoraOperador(config.horaOperador);
    definirMargemLucro(config.margemLucro);
  }, [config.custoEnergia, config.horaMaquina, config.horaOperador, config.margemLucro]);

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

  // Detecção de Alterações Pendentes
  const perfilPendente = nome !== (usuario?.nome || "");
  const operacionalPendente =
    custoEnergia !== config.custoEnergia || 
    horaMaquina !== config.horaMaquina || 
    horaOperador !== config.horaOperador || 
    margemLucro !== config.margemLucro;

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

  const totalAlteracoes = [perfilPendente, operacionalPendente, aparenciaPendente, estudioPendente].filter(
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

  const lidarComDescartar = () => {
    // Reset Perfil
    definirNome(usuario?.nome || "");

    // Reset Operacional (Voltando para os valores salvos no armazém)
    definirCustoEnergia(config.custoEnergia);
    definirHoraMaquina(config.horaMaquina);
    definirHoraOperador(config.horaOperador);
    definirMargemLucro(config.margemLucro);

    // Reset Estudio
    definirParticiparPrototipos(beta.participarPrototipos);
    definirBetaMultiEstudio(beta.betaMultiEstudio);
    definirBetaOrcamentosMagicos(beta.betaOrcamentosMagicos);
    definirBetaEstoqueInteligente(beta.betaEstoqueInteligente);
    definirBetaSimuladorMargem(beta.betaSimuladorMargem);
    definirTemplateOrcamento(beta.templateOrcamento);
    definirLimiteAlertaEstoque(beta.limiteAlertaEstoque);

    // Reset Aparencia (Usando os valores capturados no mount)
    contextoTema.definirModoTema(inicialAparencia.modo);
    contextoTema.definirCorPrimaria(inicialAparencia.cor);
    contextoTema.definirFonte(inicialAparencia.fonte);
  };

  const lidarComSalvar = async () => {
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
      toast.success("Suas preferências foram atualizadas com sucesso.");
      setTimeout(() => {
        definirSucesso(false);
      }, 4000);
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Configuracoes" }, "Erro ao salvar configurações", erro);
      toast.error("Falha ao salvar configurações.");
    } finally {
      definirSalvando(false);
    }
  };

  usarDefinirCabecalho({
    titulo: "Configurações",
    subtitulo: temAlteracoes
      ? `Você possui ${totalAlteracoes} ${totalAlteracoes === 1 ? "seção com alterações pendentes" : "seções com alterações pendentes"}`
      : "Gestão operacional e proteção de dados (LGPD)",
    ocultarBusca: true,
    acao: {
      texto: salvando ? "Salvando..." : sucesso ? "Salvo!" : temAlteracoes ? `Salvar(${totalAlteracoes})` : "Salvar",
      icone: sucesso ? Check : Save,
      aoClicar: lidarComSalvar,
      desabilitado: salvando || !temAlteracoes,
    },
    segundaAcao: temAlteracoes
      ? {
          texto: "Descartar",
          icone: X,
          aoClicar: lidarComDescartar,
          desabilitado: salvando,
        }
      : undefined,
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {(salvando || enviandoEmail) && (
        <Carregamento texto={salvando ? "Salvando Alterações..." : "Enviando E-mail de Segurança..."} />
      )}
      <div className="relative mx-auto w-full max-w-6xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.0 }}>
            <CardPerfil
              usuario={usuario}
              nome={nome}
              definirNome={definirNome}
              sucessoEmail={sucessoLink}
              lidarComTrocaSenha={lidarComTrocaSenha}
              pendente={perfilPendente}
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

        <div className="pt-4 pb-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p></p>
          <p className="text-[10px] text-gray-400 dark:text-zinc-600 text-center md:text-right leading-relaxed">
            Plataforma em conformidade com a Lei Federal nº 13.709/2018 (LGPD).
            <br />
            Dados criptografados e processados sob rigorosos padrões de segurança.
          </p>
        </div>
      </div>

    </div>
  );
}
