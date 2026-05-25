import { Dialogo } from "@/compartilhado/componentes";
import { MotivoBaixaInsumo, Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { FormularioBaixaInsumo } from "./gerenciamento/FormularioBaixaInsumo";

interface ModalBaixaInsumoProps {
  aberto: boolean;
  insumo: Insumo | null;
  aoFechar: () => void;
  aoConfirmar: (idInsumo: string, quantidade: number, motivo: MotivoBaixaInsumo, observacao?: string) => void;
}

export function ModalBaixaInsumo({ aberto, insumo, aoFechar, aoConfirmar }: ModalBaixaInsumoProps) {
  if (!aberto || !insumo) return null;

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Dar Baixa em Estoque" larguraMax="max-w-md">
      <div className="p-6 bg-white dark:bg-[#18181b]">
        <FormularioBaixaInsumo 
          insumo={insumo} 
          aoCancelar={aoFechar} 
          aoConfirmar={aoConfirmar} 
        />
      </div>
    </Dialogo>
  );
}
