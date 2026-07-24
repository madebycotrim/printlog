import { useState, useEffect } from "react";
import { useVocalizador } from "@/compartilhado/hooks/useVocalizador";
import { Type, Accessibility, Volume2, VolumeX, Eye, MousePointer, RotateCcw, BookOpen } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/ui";
import { toast } from "sonner";

function BotaoAlternador({ ativo, aoAlternar, rotulo }: { ativo: boolean; aoAlternar: () => void; rotulo: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={rotulo}
      onClick={aoAlternar}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        ativo
          ? "bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
          : "bg-zinc-700 dark:bg-zinc-800 border-zinc-600 dark:border-zinc-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          ativo ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}



/**
 * Suite Completa de Acessibilidade Web (WCAG 2.1 AA / LBI - Lei nº 13.146/2015).
 * Suporta os atalhos globais Alt + A (Modal) e Alt + V (Vocalização).
 */
export function ModalAcessibilidade({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const { falando, vocalizar, parar } = useVocalizador();
  const [tamanhoFonte, setTamanhoFonte] = useState<"normal" | "grande" | "extragrande">(() => {
    return (localStorage.getItem("printlog_tamanho_fonte") as any) || "normal";
  });

  const [altoContraste, setAltoContraste] = useState<boolean>(() => {
    return localStorage.getItem("printlog_alto_contraste") === "true";
  });

  const [escalaCinza, setEscalaCinza] = useState<boolean>(() => {
    return localStorage.getItem("printlog_escala_cinza") === "true";
  });

  const [destacarLinks, setDestacarLinks] = useState<boolean>(() => {
    return localStorage.getItem("printlog_destacar_links") === "true";
  });

  const [cursorAmpliado, setCursorAmpliado] = useState<boolean>(() => {
    return localStorage.getItem("printlog_cursor_ampliado") === "true";
  });

  const [reduzirMovimentos, setReduzirMovimentos] = useState<boolean>(() => {
    return localStorage.getItem("printlog_reduzir_movimentos") === "true";
  });

  const [fonteDislexia, setFonteDislexia] = useState<boolean>(() => {
    return localStorage.getItem("printlog_fonte_dislexia") === "true";
  });

  // 1. Tamanho da Fonte
  useEffect(() => {
    localStorage.setItem("printlog_tamanho_fonte", tamanhoFonte);
    if (tamanhoFonte === "grande") {
      document.documentElement.style.fontSize = "18px";
    } else if (tamanhoFonte === "extragrande") {
      document.documentElement.style.fontSize = "20px";
    } else {
      document.documentElement.style.fontSize = "16px";
    }
  }, [tamanhoFonte]);

  // 2. Alto Contraste
  useEffect(() => {
    localStorage.setItem("printlog_alto_contraste", String(altoContraste));
    if (altoContraste) {
      document.documentElement.classList.add("contrast-125", "saturate-200");
    } else {
      document.documentElement.classList.remove("contrast-125", "saturate-200");
    }
  }, [altoContraste]);

  // 3. Escala de Cinza
  useEffect(() => {
    localStorage.setItem("printlog_escala_cinza", String(escalaCinza));
    if (escalaCinza) {
      document.documentElement.classList.add("grayscale");
    } else {
      document.documentElement.classList.remove("grayscale");
    }
  }, [escalaCinza]);

  // 4. Destaque de Links
  useEffect(() => {
    localStorage.setItem("printlog_destacar_links", String(destacarLinks));
    if (destacarLinks) {
      document.documentElement.classList.add("destacar-links-acessibilidade");
    } else {
      document.documentElement.classList.remove("destacar-links-acessibilidade");
    }
  }, [destacarLinks]);

  // 5. Cursor Ampliado
  useEffect(() => {
    localStorage.setItem("printlog_cursor_ampliado", String(cursorAmpliado));
    if (cursorAmpliado) {
      document.documentElement.classList.add("cursor-ampliado-acessibilidade");
    } else {
      document.documentElement.classList.remove("cursor-ampliado-acessibilidade");
    }
  }, [cursorAmpliado]);

  // 6. Reduzir Movimentos (Motion Safe)
  useEffect(() => {
    localStorage.setItem("printlog_reduzir_movimentos", String(reduzirMovimentos));
    if (reduzirMovimentos) {
      document.documentElement.classList.add("reduzir-movimentos");
    } else {
      document.documentElement.classList.remove("reduzir-movimentos");
    }
  }, [reduzirMovimentos]);

  // 7. Fonte para Dislexia / Leitura Ampliada
  useEffect(() => {
    localStorage.setItem("printlog_fonte_dislexia", String(fonteDislexia));
    if (fonteDislexia) {
      document.documentElement.classList.add("fonte-dislexia-ativa");
    } else {
      document.documentElement.classList.remove("fonte-dislexia-ativa");
    }
  }, [fonteDislexia]);

  // Resetar tudo
  const resetarAcessibilidade = () => {
    setTamanhoFonte("normal");
    setAltoContraste(false);
    setEscalaCinza(false);
    setDestacarLinks(false);
    setCursorAmpliado(false);
    setReduzirMovimentos(false);
    setFonteDislexia(false);
    parar();
    toast.success("Configurações de acessibilidade restauradas para o padrão.");
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Central de Acessibilidade"
      subtitulo="WCAG 2.1 AA • Lei nº 13.146/2015 (LBI)"
      icone={Accessibility}
      corBase="violet"
      larguraMax="max-w-lg"
    >
      <div className="p-6 space-y-6">
        {/* Opção 1: Tamanho da Fonte */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-400 tracking-wider">
            <Type size={14} className="text-violet-500" />
            <span>Tamanho do Texto</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "normal", rotulo: "Padrão (100%)" },
              { id: "grande", rotulo: "Grande (112%)" },
              { id: "extragrande", rotulo: "Extra (125%)" },
            ].map((opcao) => (
              <button
                key={opcao.id}
                onClick={() => setTamanhoFonte(opcao.id as any)}
                className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  tamanhoFonte === opcao.id
                    ? "bg-violet-500/10 border-violet-500/40 text-violet-500 dark:text-violet-400 shadow-sm"
                    : "bg-muted/40 border-borda-sutil text-zinc-400 hover:text-primary hover:border-zinc-500/30"
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        {/* Opção 2: Ajustes Visuais e Daltônicos */}
        <div className="space-y-3 pt-3 border-t border-borda-sutil">
          <div className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2 mb-2">
            <Eye size={14} className="text-violet-500" />
            <span>Ajustes Visuais</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Alto Contraste */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-borda-sutil">
              <span className="text-[11px] font-bold text-primary dark:text-white">Alto Contraste</span>
              <BotaoAlternador
                ativo={altoContraste}
                aoAlternar={() => setAltoContraste(!altoContraste)}
                rotulo="Alto Contraste"
              />
            </div>

            {/* Escala de Cinza */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-borda-sutil">
              <span className="text-[11px] font-bold text-primary dark:text-white">Escala de Cinza</span>
              <BotaoAlternador
                ativo={escalaCinza}
                aoAlternar={() => setEscalaCinza(!escalaCinza)}
                rotulo="Escala de Cinza"
              />
            </div>
          </div>
        </div>

        {/* Opção 3: Conforto e Leitura Nítida */}
        <div className="space-y-3 pt-3 border-t border-borda-sutil">
          <div className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-violet-500" />
            <span>Conforto & Leitura Nítida</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fonte Nítida para Dislexia */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-borda-sutil">
              <span className="text-[11px] font-bold text-primary dark:text-white">Leitura Dislexia</span>
              <BotaoAlternador
                ativo={fonteDislexia}
                aoAlternar={() => setFonteDislexia(!fonteDislexia)}
                rotulo="Leitura Dislexia"
              />
            </div>

            {/* Reduzir Movimentos */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-borda-sutil">
              <span className="text-[11px] font-bold text-primary dark:text-white">Reduzir Animações</span>
              <BotaoAlternador
                ativo={reduzirMovimentos}
                aoAlternar={() => setReduzirMovimentos(!reduzirMovimentos)}
                rotulo="Reduzir Animações"
              />
            </div>
          </div>
        </div>

        {/* Opção 4: Navegação e Cursor */}
        <div className="space-y-3 pt-3 border-t border-borda-sutil">
          <div className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2 mb-2">
            <MousePointer size={14} className="text-violet-500" />
            <span>Navegação & Foco</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Destaque de Links */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-borda-sutil">
              <span className="text-[11px] font-bold text-primary dark:text-white">Realçar Links</span>
              <BotaoAlternador
                ativo={destacarLinks}
                aoAlternar={() => setDestacarLinks(!destacarLinks)}
                rotulo="Realçar Links"
              />
            </div>

            {/* Cursor Ampliado */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-borda-sutil">
              <span className="text-[11px] font-bold text-primary dark:text-white">Cursor Ampliado</span>
              <BotaoAlternador
                ativo={cursorAmpliado}
                aoAlternar={() => setCursorAmpliado(!cursorAmpliado)}
                rotulo="Cursor Ampliado"
              />
            </div>
          </div>
        </div>

        {/* Opção 5: Leitura por Áudio (Vocalização) */}
        <div className="space-y-3 pt-3 border-t border-borda-sutil">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-500 flex items-center justify-center">
                {falando ? <VolumeX size={16} className="animate-pulse" /> : <Volume2 size={16} />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-primary dark:text-white">Vocalizar Tela</span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Leitura do título e resumo em Português</span>
              </div>
            </div>
            <button
              onClick={() => vocalizar()}
              className={`px-3 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                falando
                  ? "bg-rose-500 text-white"
                  : "bg-violet-500 text-white hover:bg-violet-600 shadow-md"
              }`}
            >
              {falando ? "Parar" : "Ouvir Tela"}
            </button>
          </div>
        </div>



        {/* Rodapé com Restaurar */}
        <div className="pt-3 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest border-t border-borda-sutil">
          <span>PrintLog • Acessibilidade Universal</span>
          <button
            onClick={resetarAcessibilidade}
            className="flex items-center gap-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
