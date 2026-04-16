import { useState, useEffect } from "react";
import { Save, Check, X } from "lucide-react";
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

export function PaginaConfiguracoes() {
  const { usuario, atualizarPerfil, recuperarSenha } = usarAutenticacao();
  const contextoTema = usarContextoTema();
  const beta = usarBeta();
  const { search } = useLocation();

  const [destaqueLgpd, definirDestaqueLgpd] = useState(false);

  // Redirecionamento de seção via URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    const secao = params.get("secao");

    if (secao === "privacidade") {
      const elemento = document.getElementById("secao-privacidade");
      if (elemento) {
        elemento.scrollIntoView({ behavior: "smooth", block: "start" });
        definirDestaqueLgpd(true);
        // O card pisca por 5 ciclos de 1.2s = 6s
        setTimeout(() => definirDestaqueLgpd(false), 6000);
      }
    }
  }, [search]);

  const [nome, definirNome] = useState(usuario?.nome || "");
  const [salvando, definirSalvando] = useState(false);
  const [sucesso, definirSucesso] = useState(false);
  const [enviandoEmail, definirEnviandoEmail] = useState(false);
  const [sucessoLink, definirSucessoLink] = useState(false);
  const [toastVisivel, definirToastVisivel] = useState(false);

  // Estados Operacionais Adicionados
  const [custoEnergia, definirCustoEnergia] = useState("R$ 0,95");
  const [horaMaquina, definirHoraMaquina] = useState("R$ 5,00");
  const [horaOperador, definirHoraOperador] = useState("R$ 20,00");
  const [margemLucro, definirMargemLucro] = useState("150,00%");

  // Estado Estudio
  const [participarPrototipos, definirParticiparPrototipos] = useState(beta.participarPrototipos);
  const [betaMultiEstudio, definirBetaMultiEstudio] = useState(beta.betaMultiEstudio);
  const [betaRelatorios, definirBetaRelatorios] = useState(beta.betaRelatorios);

  // Estado Inicial da Aparencia para detectar mudancas
  const [inicialAparencia, definirInicialAparencia] = useState({
    modo: contextoTema.modoTema,
    cor: contextoTema.corPrimaria,
    fonte: contextoTema.fonte,
  });

  // Detecção de Alterações Pendentes
  const perfilPendente = nome !== (usuario?.nome || "");
  const operacionalPendente =
    custoEnergia !== "R$ 0,95" || horaMaquina !== "R$ 5,00" || horaOperador !== "R$ 20,00" || margemLucro !== "150,00%";

  const aparenciaPendente =
    contextoTema.modoTema !== inicialAparencia.modo ||
    contextoTema.corPrimaria !== inicialAparencia.cor ||
    contextoTema.fonte !== inicialAparencia.fonte;

  const estudioPendente = participarPrototipos !== false || betaMultiEstudio !== false || betaRelatorios !== false;

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
      definirSucessoLink(true);
      // O link de sucesso sumira apos 8 segundos para voltar o botao
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

    // Reset Operacional (Voltando para os defaults do sistema)
    definirCustoEnergia("R$ 0,95");
    definirHoraMaquina("R$ 5,00");
    definirHoraOperador("R$ 20,00");
    definirMargemLucro("150,00%");

    // Reset Estudio
    definirParticiparPrototipos(false);
    definirBetaMultiEstudio(false);
    definirBetaRelatorios(false);

    // Reset Aparencia (Usando os valores capturados no mount)
    contextoTema.definirModoTema(inicialAparencia.modo);
    contextoTema.definirCorPrimaria(inicialAparencia.cor);
    contextoTema.definirFonte(inicialAparencia.fonte);
  };

  const lidarComSalvar = async () => {
    definirSalvando(true);
    definirSucesso(false);
    try {
      await atualizarPerfil({ nome });

      // Atualiza o estado "Original" para as novas configuracoes salvas
      definirInicialAparencia({
        modo: contextoTema.modoTema,
        cor: contextoTema.corPrimaria,
        fonte: contextoTema.fonte,
      });

      // Atualiza o Beta Program
      beta.definirParticiparPrototipos(participarPrototipos);
      beta.definirBetaMultiEstudio(betaMultiEstudio);
      beta.definirBetaRelatorios(betaRelatorios);

      definirSucesso(true);
      definirToastVisivel(true);
      setTimeout(() => {
        definirSucesso(false);
        definirToastVisivel(false);
      }, 4000);
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Configuracoes" }, "Erro ao salvar configurações", erro);
      toast.error("Falha ao salvar configurações.");
      definirToastVisivel(true); // Keep the custom toast visible for error
      setTimeout(() => definirToastVisivel(false), 4000); // Hide the custom toast after 4 seconds
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
          <CardPerfil
            usuario={usuario}
            nome={nome}
            definirNome={definirNome}
            sucessoEmail={sucessoLink}
            lidarComTrocaSenha={lidarComTrocaSenha}
            pendente={perfilPendente}
          />
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
          <CardAparencia pendente={aparenciaPendente} />
          <CardMetricas />
        </div>

        <CardEstudio
          participarPrototipos={participarPrototipos}
          definirParticiparPrototipos={definirParticiparPrototipos}
          betaMultiEstudio={betaMultiEstudio}
          definirBetaMultiEstudio={definirBetaMultiEstudio}
          betaRelatorios={betaRelatorios}
          definirBetaRelatorios={definirBetaRelatorios}
          pendente={estudioPendente}
        />

        <div id="secao-privacidade">
          <CardPrivacidade destaque={destaqueLgpd} />
        </div>

        <div className="pt-4 pb-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p></p>
          <p className="text-[10px] text-gray-400 dark:text-zinc-600 text-center md:text-right leading-relaxed">
            Plataforma em conformidade com a Lei Federal nº 13.709/2018 (LGPD).
            <br />
            Dados criptografados e processados sob rigorosos padrões de segurança.
          </p>
        </div>
      </div>

      {toastVisivel && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
          {sucesso ? (
            <div className="rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 shadow-xl backdrop-blur-md px-4 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Check size={16} strokeWidth={3} />
              </div>
              <div className="pr-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Configurações salvas</p>
                <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 mt-0.5 leading-tight">
                  Suas preferências foram atualizadas com sucesso.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/20 bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
              <Check size={16} />
              E-mail enviado com sucesso!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
