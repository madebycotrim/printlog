import { useState } from "react";
import * as LucideIcons from "lucide-react";

const ICONES_DISPONIVEIS = [
  // Básicos e Caixas
  "Box", "Package", "PackageOpen", "Archive", "Inbox",
  // Ferramentas e Manutenção
  "Wrench", "Scissors", "PenTool", "Ruler", "Tape", 
  "Pipette", "Hammer", "Brush", "PaintBucket", "Eraser",
  // 3D, Eletrônicos e Peças
  "Layers", "Zap", "Cpu", "Battery", "Plug", 
  "Monitor", "CircuitBoard", "Database", "Disc", "Server",
  // Fixação e Adesivos
  "Paperclip", "Link", "Pin", "Sticker", "StickyNote",
  // Limpeza e Químicos
  "Droplet", "FlaskConical", "Beaker", "Wind", "Thermometer",
  // Outros/Gerais
  "Tags", "Tag", "Barcode", "QrCode", "Magnet"
];

interface PropriedadesSeletorIcone {
  valor?: string;
  aoMudar: (valor: string) => void;
  corTema?: string;
}

export function SeletorIcone({ valor, aoMudar, corTema = "sky-500" }: PropriedadesSeletorIcone) {
  const [aberto, setAberto] = useState(false);
  
  const IconeSelecionado = valor && (LucideIcons as any)[valor] 
    ? (LucideIcons as any)[valor] 
    : LucideIcons.Package;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="h-10 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
      >
        <IconeSelecionado size={24} strokeWidth={2} />
      </button>

      {aberto && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setAberto(false)} 
          />
          <div className="absolute top-16 left-0 z-50 w-64 max-h-[300px] overflow-y-auto custom-scrollbar p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl grid grid-cols-4 gap-2">
            {ICONES_DISPONIVEIS.map((nomeIcone) => {
              const Icone = (LucideIcons as any)[nomeIcone];
              if (!Icone) return null;
              
              const selecionado = valor === nomeIcone;
              
              return (
                <button
                  key={nomeIcone}
                  type="button"
                  onClick={() => {
                    aoMudar(nomeIcone);
                    setAberto(false);
                  }}
                  className={`p-3 flex flex-col items-center justify-center rounded-xl transition-all ${
                    selecionado 
                      ? `bg-${corTema}/10 text-${corTema} shadow-sm border border-${corTema}/20` 
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                  }`}
                  title={nomeIcone}
                >
                  <Icone size={20} strokeWidth={selecionado ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
