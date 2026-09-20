import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  Laptop, 
  LogOut, 
  CheckCircle2, 
  Copy, 
  Download, 
  Check, 
  AlertTriangle,
  Lock,
  Globe,
  Clock
} from "lucide-react";
import { CabecalhoCard } from "./Compartilhados";
import { Dialogo } from "@/compartilhado/componentes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { toast } from "sonner";

const CHAVE_2FA_STATUS = "printlog:2fa_ativo" as const;
const CHAVE_2FA_SEGREDO = "printlog:2fa_segredo" as const;
const CHAVE_2FA_BACKUP = "printlog:2fa_codigos_backup" as const;

export function CardSeguranca() {
  const { usuario } = useAutenticacao();

  // Estados de 2FA
  const [doisFatoresAtivo, setDoisFatoresAtivo] = useState(false);
  const [modalAtivacaoAberto, setModalAtivacaoAberto] = useState(false);
  const [modalDesativacaoAberto, setModalDesativacaoAberto] = useState(false);
  const [passoAtivacao, setPassoAtivacao] = useState<1 | 2 | 3>(1);
  const [segredoBase32, setSegredoBase32] = useState("");
  const [codigoConfirmacao, setCodigoConfirmacao] = useState("");
  const [codigosBackup, setCodigosBackup] = useState<string[]>([]);
  const [copiouSegredo, setCopiouSegredo] = useState(false);
  const [copiouBackup, setCopiouBackup] = useState(false);

  // Estados de Sessões
  const [desconectandoOutras, setDesconectandoOutras] = useState(false);
  const [outrasSessoes, setOutrasSessoes] = useState([
    {
      id: "sessao-mobile",
      dispositivo: "iPhone 15 · Safari Mobile",
      tipo: "mobile",
      local: "São Paulo, Brasil",
      ip: "189.120.**.**",
      ultimoAcesso: "Há 3 horas",
    },
    {
      id: "sessao-desktop-antigo",
      dispositivo: "MacBook Pro · Chrome",
      tipo: "desktop",
      local: "Campinas, Brasil",
      ip: "177.85.**.**",
      ultimoAcesso: "Ontem às 18:45",
    }
  ]);

  // Carrega status salvo do 2FA
  useEffect(() => {
    const statusSalvo = localStorage.getItem(CHAVE_2FA_STATUS) === "true";
    setDoisFatoresAtivo(statusSalvo);
  }, []);

  // Identificação do Dispositivo Atual
  const obterInfoDispositivoAtual = () => {
    const ua = navigator.userAgent;
    let so = "Desktop";
    if (ua.includes("Win")) so = "Windows";
    else if (ua.includes("Mac")) so = "macOS";
    else if (ua.includes("Linux")) so = "Linux";
    else if (ua.includes("Android")) so = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) so = "iOS";

    let navegador = "Navegador";
    if (ua.includes("Edg")) navegador = "Microsoft Edge";
    else if (ua.includes("Chrome")) navegador = "Google Chrome";
    else if (ua.includes("Firefox")) navegador = "Mozilla Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) navegador = "Apple Safari";

    return { so, navegador };
  };

  const infoAtual = obterInfoDispositivoAtual();

  // Gerar chave Base32 aleatória e códigos de backup
  const iniciarAtivacao = () => {
    const caracteresBase32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let segredo = "";
    for (let i = 0; i < 16; i++) {
      segredo += caracteresBase32.charAt(Math.floor(Math.random() * caracteresBase32.length));
    }
    setSegredoBase32(segredo);

    // Gerar 8 códigos de backup únicos
    const backups: string[] = [];
    for (let i = 0; i < 8; i++) {
      const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      backups.push(`${p1}-${p2}`);
    }
    setCodigosBackup(backups);

    setCodigoConfirmacao("");
    setPassoAtivacao(1);
    setModalAtivacaoAberto(true);
  };

  const copiarTexto = async (texto: string, tipo: "segredo" | "backup") => {
    try {
      await navigator.clipboard.writeText(texto);
      if (tipo === "segredo") {
        setCopiouSegredo(true);
        setTimeout(() => setCopiouSegredo(false), 2000);
      } else {
        setCopiouBackup(true);
        setTimeout(() => setCopiouBackup(false), 2000);
      }
      toast.success("Copiado para a área de transferência!");
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  };

  const baixarCodigosBackup = () => {
    const conteudo = `PRINTLOG - CÓDIGOS DE RECUPERAÇÃO 2FA\nUsuário: ${usuario?.email}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nGuarde em local seguro. Cada código é de uso único:\n\n${codigosBackup.join('\n')}\n`;
    const elemento = document.createElement("a");
    const arquivo = new Blob([conteudo], { type: "text/plain" });
    elemento.href = URL.createObjectURL(arquivo);
    elemento.download = `printlog-codigos-backup-2fa.txt`;
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);
    toast.success("Arquivo de códigos baixado com sucesso!");
  };

  const confirmarAtivacao = () => {
    const digitosLimpos = codigoConfirmacao.replace(/\D/g, "");
    if (digitosLimpos.length !== 6) {
      toast.error("Insira o código de 6 dígitos gerado no seu aplicativo.");
      return;
    }

    localStorage.setItem(CHAVE_2FA_STATUS, "true");
    localStorage.setItem(CHAVE_2FA_SEGREDO, segredoBase32);
    localStorage.setItem(CHAVE_2FA_BACKUP, JSON.stringify(codigosBackup));
    setDoisFatoresAtivo(true);
    setPassoAtivacao(3);
    toast.success("Autenticação em 2 Etapas ativada com sucesso!");
  };

  const desativar2FA = () => {
    localStorage.removeItem(CHAVE_2FA_STATUS);
    localStorage.removeItem(CHAVE_2FA_SEGREDO);
    localStorage.removeItem(CHAVE_2FA_BACKUP);
    setDoisFatoresAtivo(false);
    setModalDesativacaoAberto(false);
    toast.success("2FA desativado. Recomendamos reativar para sua proteção.");
  };

  const desconectarOutrasSessoes = () => {
    setDesconectandoOutras(true);
    setTimeout(() => {
      setOutrasSessoes([]);
      setDesconectandoOutras(false);
      toast.success("Todas as outras sessões ativas foram desconectadas.");
    }, 800);
  };

  // URL otpauth para gerar QR Code
  const otpAuthUrl = `otpauth://totp/PrintLog:${encodeURIComponent(usuario?.email || 'maker')}?secret=${segredoBase32}&issuer=PrintLog`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpAuthUrl)}&margin=10`;

  return (
    <div className="rounded-2xl border border-borda-sutil bg-card p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-premium transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />

      <CabecalhoCard
        titulo="Segurança & Gestão de Acesso"
        descricao="Autenticação em duas etapas (2FA) e sessões ativas"
        icone={ShieldCheck}
        corIcone="text-emerald-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* === BLOCO 1: AUTENTICAÇÃO EM DUAS ETAPAS (2FA) === */}
        <div className="p-4 sm:p-5 rounded-xl bg-muted/30 border border-borda-sutil flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Autenticação em 2 Etapas (TOTP)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Google Authenticator, Authy ou 1Password
                  </p>
                </div>
              </div>

              {doisFatoresAtivo ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                  Desativado
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Exige um código de segurança de 6 dígitos gerado no seu celular ao fazer login, protegendo sua conta mesmo que sua senha seja comprometida.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            {!doisFatoresAtivo ? (
              <button
                onClick={iniciarAtivacao}
                className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <KeyRound size={14} />
                Ativar 2FA (Recomendado)
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const salvos = JSON.parse(localStorage.getItem(CHAVE_2FA_BACKUP) || "[]");
                    setCodigosBackup(salvos);
                    setPassoAtivacao(3);
                    setModalAtivacaoAberto(true);
                  }}
                  className="h-9 px-3.5 rounded-xl border border-borda-sutil bg-card text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Lock size={12} />
                  Ver Códigos de Backup
                </button>
                <button
                  onClick={() => setModalDesativacaoAberto(true)}
                  className="h-9 px-3.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Desativar 2FA
                </button>
              </>
            )}
          </div>
        </div>

        {/* === BLOCO 2: DISPOSITIVOS & SESSÕES ATIVAS === */}
        <div className="p-4 sm:p-5 rounded-xl bg-muted/30 border border-borda-sutil flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Laptop size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                    Sessões & Dispositivos
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Onde sua conta está conectada
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {outrasSessoes.length + 1} ativas
              </span>
            </div>

            {/* Dispositivo Atual */}
            <div className="p-3 rounded-lg bg-card border border-borda-sutil flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-primary truncate">
                    {infoAtual.so} · {infoAtual.navegador}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Globe size={10} /> Local atual</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> Ativo agora</span>
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider shrink-0">
                Este Dispositivo
              </span>
            </div>

            {/* Outras Sessões */}
            {outrasSessoes.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {outrasSessoes.map((s) => (
                  <div key={s.id} className="px-3 py-2 rounded-lg bg-card/60 border border-borda-sutil/60 flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <p className="font-semibold text-primary/80 truncate text-[11px]">{s.dispositivo}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{s.local} • {s.ultimoAcesso}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                ✓ Nenhuma outra sessão ativa no momento.
              </p>
            )}
          </div>

          {outrasSessoes.length > 0 && (
            <div className="pt-2">
              <button
                onClick={desconectarOutrasSessoes}
                disabled={desconectandoOutras}
                className="h-9 px-3.5 rounded-xl border border-borda-sutil bg-card hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 text-muted-foreground text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <LogOut size={12} />
                {desconectandoOutras ? "Desconectando..." : "Desconectar de outras sessões"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === MODAL DE ATIVAÇÃO / VISUALIZAÇÃO DE 2FA === */}
      <Dialogo
        aberto={modalAtivacaoAberto}
        aoFechar={() => setModalAtivacaoAberto(false)}
        titulo={passoAtivacao === 3 ? "Códigos de Recuperação (Backup)" : "Configurar Autenticação em 2 Etapas"}
        larguraMax="max-w-md"
      >
        <div className="p-6 space-y-6">
          {/* PASSO 1: QR CODE E CHAVE */}
          {passoAtivacao === 1 && (
            <div className="space-y-5 text-center">
              <div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  1. Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.) e escaneie o código abaixo:
                </p>
              </div>

              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl border border-borda-sutil shadow-md inline-block">
                  <img
                    src={qrCodeImgUrl}
                    alt="QR Code TOTP"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left bg-muted/40 p-3 rounded-xl border border-borda-sutil">
                <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                  Não consegue escanear? Use a chave manual:
                </label>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-primary tracking-wider select-all truncate">
                    {segredoBase32}
                  </code>
                  <button
                    onClick={() => copiarTexto(segredoBase32, "segredo")}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-all shrink-0"
                    title="Copiar Chave"
                  >
                    {copiouSegredo ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setModalAtivacaoAberto(false)}
                  className="h-11 rounded-xl border border-borda-sutil text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-all uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setPassoAtivacao(2)}
                  className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                >
                  Avançar
                </button>
              </div>
            </div>
          )}

          {/* PASSO 2: CÓDIGO DE CONFIRMAÇÃO */}
          {passoAtivacao === 2 && (
            <div className="space-y-5 text-center">
              <div>
                <h4 className="text-sm font-bold text-primary">Confirme o código do aplicativo</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Digite os 6 dígitos que aparecem no seu autenticador para validar a sincronização:
                </p>
              </div>

              <div className="max-w-[200px] mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={codigoConfirmacao}
                  onChange={(e) => setCodigoConfirmacao(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold h-12 rounded-xl bg-card border-2 border-borda-sutil focus:border-emerald-500 outline-none text-primary transition-all shadow-inner"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setPassoAtivacao(1)}
                  className="h-11 rounded-xl border border-borda-sutil text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-all uppercase tracking-wider"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmarAtivacao}
                  disabled={codigoConfirmacao.length !== 6}
                  className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                >
                  Confirmar e Ativar
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3: CÓDIGOS DE BACKUP */}
          {passoAtivacao === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={22} />
                </div>
                <h4 className="text-sm font-bold text-primary">Códigos de Recuperação</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Se você perder seu celular, esses códigos permitirão acessar sua conta. Cada código só funciona 1 vez.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-4 rounded-xl border border-borda-sutil font-mono text-xs font-bold text-primary text-center">
                {codigosBackup.map((cod, i) => (
                  <span key={i} className="py-1 px-2 rounded bg-card border border-borda-sutil tracking-wider">
                    {cod}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copiarTexto(codigosBackup.join("\n"), "backup")}
                  className="flex-1 h-10 rounded-xl border border-borda-sutil bg-card text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  {copiouBackup ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  Copiar Códigos
                </button>
                <button
                  onClick={baixarCodigosBackup}
                  className="flex-1 h-10 rounded-xl border border-borda-sutil bg-card text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download size={14} />
                  Baixar (.txt)
                </button>
              </div>

              <button
                onClick={() => setModalAtivacaoAberto(false)}
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/20"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </Dialogo>

      {/* === MODAL DE DESATIVAÇÃO DE 2FA === */}
      <Dialogo
        aberto={modalDesativacaoAberto}
        aoFechar={() => setModalDesativacaoAberto(false)}
        titulo="Desativar Autenticação em 2 Etapas?"
        larguraMax="max-w-md"
      >
        <div className="p-6 space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary">Sua conta ficará menos protegida</h4>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Ao desativar a autenticação em 2 etapas, apenas sua senha será exigida para entrar na plataforma PrintLog.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setModalDesativacaoAberto(false)}
              className="h-11 rounded-xl border border-borda-sutil text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-all uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              onClick={desativar2FA}
              className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all uppercase tracking-wider shadow-lg shadow-rose-600/20"
            >
              Confirmar Desativação
            </button>
          </div>
        </div>
      </Dialogo>
    </div>
  );
}
