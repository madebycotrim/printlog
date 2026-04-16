import { InputHTMLAttributes, forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">{label}</label>}
      <div className="relative flex items-center">
        <input
          ref={ref}
          className={`w-full h-10 bg-transparent border-0 border-b-[3px] outline-none transition-all duration-300 placeholder:text-gray-400/50 dark:placeholder:text-zinc-700 font-normal text-sm text-gray-900 dark:text-white 
                            ${
                              error
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-100 dark:border-white/10 focus:border-gray-300 dark:focus:border-white/20"
                            } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";
