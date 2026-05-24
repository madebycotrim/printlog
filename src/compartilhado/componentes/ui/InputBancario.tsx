import { InputHTMLAttributes, forwardRef, ChangeEvent } from "react";

export const formatarParaExibicao = (val: string | number | readonly string[] | undefined) => {
    if (val === undefined || val === null || val === "") return "";
    const numerico = typeof val === 'number' ? val : parseFloat(val as string);
    if (isNaN(numerico)) return val as string;
    return numerico.toFixed(2);
};

export const InputBancario = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ onChange, value, ...props }, ref) => {

    const lidarComMudanca = (e: ChangeEvent<HTMLInputElement>) => {
      const apenasNumeros = e.target.value.replace(/\D/g, "");
      const valorCentavos = apenasNumeros ? parseInt(apenasNumeros, 10) : 0;
      const valorDecimal = (valorCentavos / 100).toFixed(2);
      
      e.target.value = valorDecimal;
      onChange?.(e);
    };

    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        pattern="^[0-9]*[.,]?[0-9]*$"
        value={formatarParaExibicao(value)}
        onChange={lidarComMudanca}
        {...props}
      />
    );
  }
);

InputBancario.displayName = "InputBancario";
