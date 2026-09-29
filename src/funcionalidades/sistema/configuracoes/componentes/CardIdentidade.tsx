import { Store, Image as ImageIcon, Type } from "lucide-react";
import { CampoDashboard, CabecalhoCard } from "./Compartilhados";

interface PropsCardIdentidade {
  nomeEstudio: string;
  definirNomeEstudio: (v: string) => void;
  sloganEstudio: string;
  definirSloganEstudio: (v: string) => void;
  logoEstudio: string;
  definirLogoEstudio: (v: string) => void;
  eProOuSuperior?: boolean;
  pendente?: boolean;
}

export function CardIdentidade({
  nomeEstudio,
  definirNomeEstudio,
  sloganEstudio,
  definirSloganEstudio,
  logoEstudio,
  definirLogoEstudio,
  pendente,
}: PropsCardIdentidade) {
  return (
    <div className="rounded-2xl border border-borda-sutil bg-card p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-premium transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />

      <div className="flex items-center justify-between">
        <CabecalhoCard
          titulo="Identidade Visual"
          descricao="Personalize a marca do seu estúdio (100% gratuito)"
          icone={Store}
          corIcone="text-indigo-500"
          pendente={pendente}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative items-end">
        <div className="md:col-span-3">
          <CampoDashboard
            label="Nome do Estúdio"
            valor={nomeEstudio}
            aoMudar={definirNomeEstudio}
            icone={Type}
            placeholder="Ex: MalleVi 3D"
          />
        </div>
        <div className="md:col-span-4">
          <CampoDashboard
            label="Slogan"
            valor={sloganEstudio}
            aoMudar={definirSloganEstudio}
            icone={Type}
            placeholder="Ex: Criando suas ideias"
          />
        </div>
        <div className="md:col-span-4">
          <CampoDashboard
            label="URL da Logo"
            valor={logoEstudio}
            aoMudar={definirLogoEstudio}
            icone={ImageIcon}
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-1 h-11 w-full flex items-center justify-center">
          {logoEstudio ? (
            <div
              className="h-11 w-full bg-muted/30 border border-borda-sutil rounded-lg flex items-center justify-center overflow-hidden p-1 tooltip-trigger"
              title="Preview da Logo"
            >
              <img
                src={logoEstudio}
                alt="Logo do Estúdio"
                className="max-h-full w-auto object-contain"
              />
            </div>
          ) : (
            <div
              className="h-11 w-full bg-muted/20 border border-dashed border-borda-sutil rounded-lg flex items-center justify-center"
              title="Preview da Logo"
            >
              <ImageIcon size={16} className="text-muted-foreground opacity-50" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
