import { useState, useEffect, useCallback } from "react";

import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { toast } from "sonner";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { Carregamento } from "@/compartilhado/componentes";

import { CardPerfil } from "./componentes/CardPerfil";
import { CardAparencia } from "./componentes/CardAparencia";
import { CardMetricas } from "./componentes/CardMetricas";
import { CardPrivacidade } from "./componentes/CardPrivacidade";
import { CardIdentidade } from "./componentes/CardIdentidade";
import { CardSeguranca } from "./componentes/CardSeguranca";
import { CardIdioma } from "./componentes/CardIdioma";

import { useContextoTema } from "@/configuracoes/tema/tema_provider";
import { useArmazemConfiguracoes } from "./estado/armazemConfiguracoes";

export function PaginaConfiguracoes() {
  const { usuario, atualizarPerfil, recuperarSenha, enviarEmailVerificacao } = useAutenticacao();
  const contextoTema = useContextoTema();
  const config = useArmazemConfiguracoes();
  const { search } = useLocation();

  const [destaqueLgpd, definirDestaqueLgpd] = useState(false);

  /**
   * ESTADO LOCAL (DRAFTS)
   * Usamos estado local para que o usuário possa editar e "Descartar" se quiser.
   * Os valores iniciais vêm do nosso novo Armazém de Configurações (Zustand + Persist).
   */
  const [nome, definirNome] = useState(usuario?.nome || "");
  const [nomeEstudio, definirNomeEstudio] = useState(config.nomeEstudio);
  const [sloganEstudio, definirSloganEstudio] = useState(config.sloganEstudio);
  const [logoEstudio, definirLogoEstudio] = useState(config.logoEstudio);

  // Estados de UI
  const [salvando, definirSalvando] = useState(false);
  const [sucesso, definirSucesso] = useState(false);
  const [enviandoEmail, definirEnviandoEmail] = useState(false);
  const [sucessoLink, definirSucessoLink] = useState(false);

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

    definirNomeEstudio(config.nomeEstudio);
    definirSloganEstudio(config.sloganEstudio);
    definirLogoEstudio(config.logoEstudio);
    
    if (usuario?.nome) {
      definirNome(usuario.nome);
    }
    
    definirInicializado(true);
  }, [config.carregando, config.plano, config.nomeEstudio, config.sloganEstudio, config.logoEstudio, usuario?.nome]);

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

  const identidadePendente =
    nomeEstudio !== config.nomeEstudio ||
    sloganEstudio !== config.sloganEstudio ||
    logoEstudio !== config.logoEstudio;

  const aparenciaPendente =
    contextoTema.modoTema !== inicialAparencia.modo ||
    contextoTema.corPrimaria !== inicialAparencia.cor ||
    contextoTema.fonte !== inicialAparencia.fonte;

  const totalAlteracoes = [perfilPendente, identidadePendente, aparenciaPendente].filter(
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
      config.definirIdentidadeEstudio(nomeEstudio, sloganEstudio, logoEstudio);
      await config.salvarNoD1(usuario!.uid);

      // 3. Atualizar Estado Inicial de Aparência
      definirInicialAparencia({
        modo: contextoTema.modoTema,
        cor: contextoTema.corPrimaria,
        fonte: contextoTema.fonte,
      });

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
    atualizarPerfil, nome, usuario, config, nomeEstudio, sloganEstudio, logoEstudio, contextoTema,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.0 }} className="h-full">
            <CardPerfil
              usuario={usuario}
              nome={nome}
              definirNome={definirNome}
              sucessoEmail={sucessoLink}
              lidarComTrocaSenha={lidarComTrocaSenha}
              lidarComVerificacaoEmail={lidarComVerificacaoEmail}
              pendente={perfilPendente}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.08 }} className="h-full">
            <CardAparencia pendente={aparenciaPendente} />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.10 }}>
          <CardIdioma />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.14 }}>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.16 }}>
          <CardMetricas />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.22 }}>
          <CardSeguranca />
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
