import { User, Mail, Lock } from "lucide-react";
import { CabecalhoCard, CampoDashboard } from "./Compartilhados";
import { Usuario } from "@/compartilhado/tipos/modelos";
import { Avatar } from "@/compartilhado/componentes/Avatar";

/**
 * Propriedades para o componente CardPerfil.
 */
interface PropsCardPerfil {
    /** Objeto do usuário autenticado */
    usuario: Usuario | null;
    /** Nome atual para edição no campo */
    nome: string;
    /** Função para atualizar o nome no estado pai */
    definirNome: (n: string) => void;
    /** Indica se o email de redefinição foi enviado com sucesso */
    sucessoEmail: boolean;
    /** Função para disparar o processo de troca de senha */
    lidarComTrocaSenha: () => void;
    /** Indica se há uma operação pendente (carregando) */
    pendente?: boolean;
}

/**
 * Componente para exibição e edição do perfil do usuário.
 */
export function CardPerfil({ usuario, nome, definirNome, sucessoEmail, lidarComTrocaSenha, pendente }: PropsCardPerfil) {
    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.03] to-zinc-500/[0.01] dark:from-zinc-500/[0.05] dark:to-zinc-500/[0.02] pointer-events-none" />
            <CabecalhoCard titulo="Perfil Maker" descricao="Sua conta de acesso e segurança" icone={User} corIcone="text-[var(--cor-primaria)]" pendente={pendente} />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="flex flex-col items-center justify-center shrink-0 w-32 rounded-xl p-4 bg-gray-50/70 dark:bg-white/[0.02]">
                    <Avatar 
                        nome={nome} 
                        // Se o nome mudou, ocultamos a foto para mostrar o "novo avatar" (preview de cor/iniciais)
                        fotoUrl={nome !== usuario?.nome ? null : usuario?.fotoUrl} 
                        tamanho="w-20 h-20" 
                        className="text-3xl"
                    />
                </div>

                <div className="flex-1 space-y-4 w-full">
                    <CampoDashboard label="Nome no Perfil" valor={nome} aoMudar={definirNome} placeholder="Seu nome maker" icone={User} />

                    <div className="w-full">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500 ml-1">E-mail de Acesso</label>
                        <div className="h-11 w-full bg-transparent border-b-2 border-gray-200 dark:border-white/10 flex items-center gap-3">
                            <Mail size={16} className="text-gray-400" />
                            <span className="truncate text-sm font-semibold text-gray-700 dark:text-zinc-300 flex-1">
                                {usuario?.email}
                            </span>
                            {usuario?.provedorGoogle && (
                                <svg className="shrink-0 w-4 h-4" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {!sucessoEmail && (
                <button
                    onClick={lidarComTrocaSenha}
                    className="mt-auto h-11 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.12em] transition-all shadow-sm active:scale-[0.98]"
                >
                    <Lock size={14} className="text-[var(--cor-primaria)]" />
                    Gerar Link de Redefinição
                </button>
            )}

            {sucessoEmail && (
                <div className="mt-auto p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/[0.04] flex flex-col items-center text-center gap-2 animate-in zoom-in-95 duration-300">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                        <Mail size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">E-mail de Segurança Enviado</p>
                        <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500/60 mt-0.5">Verifique sua caixa de entrada e spam para redefinir sua credencial.</p>
                    </div>
                </div>
            )}

            <p className="mt-4 text-[9px] text-zinc-400/50 dark:text-zinc-500/30 text-center px-6 leading-tight italic uppercase tracking-wider">
                Finalidade: Seus dados de perfil são utilizados para identificação e acesso à plataforma, conforme Art. 7º, V da LGPD.
            </p>
        </div>
    );
}
