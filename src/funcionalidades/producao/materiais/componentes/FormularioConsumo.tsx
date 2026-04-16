import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Scale, FileText, AlertCircle, Info } from "lucide-react";
import { RegistroUso } from "../tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoAreaTexto } from "@/compartilhado/componentes/CampoAreaTexto";
import { Combobox } from "@/compartilhado/componentes/Combobox";

const esquemaConsumo = z
  .object({
    nomePeca: z.string().min(3, "Informe o motivo ou peça"),
    quantidadeGastaGramas: z.coerce.number().positive("Quantidade deve ser maior que zero"),
    status: z.enum(["SUCESSO", "FALHA", "CANCELADO", "MANUAL"]),
  })
  .required();

type ConsumoFormData = {
  nomePeca: string;
  quantidadeGastaGramas: number;
  status: "SUCESSO" | "FALHA" | "CANCELADO" | "MANUAL";
};

interface PropriedadesFormularioConsumo {
  aoSalvar: (dados: Omit<RegistroUso, "id" | "data">) => Promise<void>;
  aoCancelar: () => void;
  pesoDisponivel: number;
}

const OPCOES_STATUS = [
  { valor: "MANUAL", rotulo: "Ajuste Manual" },
  { valor: "FALHA", rotulo: "Falha de Impressão" },
  { valor: "CANCELADO", rotulo: "Cancelamento" },
];

export function FormularioConsumo({ aoSalvar, aoCancelar, pesoDisponivel }: PropriedadesFormularioConsumo) {
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConsumoFormData>({
    resolver: zodResolver(esquemaConsumo) as any,
    defaultValues: {
      status: "MANUAL",
    },
  });

  const quantidadeGasta = watch("quantidadeGastaGramas");
  const excesso = quantidadeGasta > pesoDisponivel;
  const statusAtual = watch("status");

  const aoSubmeter = async (dados: any) => {
    try {
      setSalvando(true);
      await aoSalvar(dados as ConsumoFormData);
      aoCancelar();
    } catch (erro) {
      // Erro tratado no hook
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(aoSubmeter)} className="space-y-6">
      <div className="space-y-6">
        <CampoAreaTexto
          rotulo="Motivo do Abatimento"
          icone={FileText}
          rows={2}
          placeholder="Ex: Teste de calibração / Perda por falta de energia"
          erro={errors.nomePeca?.message}
          {...register("nomePeca")}
        />

        <div className="grid grid-cols-2 gap-5">
          <div className="relative">
            <CampoTexto
              type="number"
              step="0.1"
              rotulo="Quantidade"
              icone={Scale}
              placeholder="0.0"
              erro={errors.quantidadeGastaGramas?.message}
              {...register("quantidadeGastaGramas")}
              className={excesso ? "text-rose-600" : ""}
            />
            <span className="absolute right-0 top-[38px] text-[10px] uppercase font-black text-gray-400 dark:text-zinc-600">
              Gramas
            </span>
          </div>

          <Combobox
            titulo="Origem / Status"
            opcoes={OPCOES_STATUS}
            valor={statusAtual}
            aoAlterar={(val) => setValue("status", val as any)}
            icone={Info}
            placeholder="Origem..."
          />
        </div>

        {excesso && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl animate-in shake duration-300">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tight">
              Atenção: A quantidade informada excede o peso disponível no rolo ({pesoDisponivel}g).
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={aoCancelar}
          className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          style={{ backgroundColor: "var(--cor-primaria)" }}
          className="flex-[2] py-3 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save size={18} />
          {salvando ? "Salvando..." : "Confirmar Abatimento"}
        </button>
      </div>
    </form>
  );
}
