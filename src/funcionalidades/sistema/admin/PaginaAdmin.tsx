import { useState, useEffect } from "react";
import { ShieldCheck, Users, Crown, Zap, Search } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { ehAdmin } from "@/compartilhado/constantes/admin";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { toast } from "react-hot-toast";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";

interface UsuarioAdmin {
  id_usuario: string;
  email?: string;
  nome_estudio: string;
  plano: PlanoUsuario;
  ciclo_pagamento?: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL" | "VITALICIO";
  vencimento_plano?: string;
  atualizado_em: string;
}

const mascararEmail = (email?: string) => {
  if (!email) return "";
  const [nome, dominio] = email.split('@');
  if (!dominio) return email;
  const mascara = nome.length > 2 ? `${nome[0]}***${nome[nome.length - 1]}` : `${nome[0]}***`;
  return `${mascara}@${dominio}`;
};

const obterStatusVencimento = (dataStr?: string, ciclo?: string) => {
  if (ciclo === "VITALICIO") return { texto: "Nunca expira", cor: "text-blue-500", bg: "bg-blue-500/10" };
  if (!dataStr) return { texto: "Sem data", cor: "text-gray-400", bg: "bg-gray-500/10" };
  
  const hoje = new Date();
  const venc = new Date(dataStr);
  const diffDias = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 3600 * 24));

  if (diffDias < 0) return { texto: `Expirado há ${Math.abs(diffDias)} dias`, cor: "text-red-500", bg: "bg-red-500/10" };
  if (diffDias <= 7) return { texto: `Expira em ${diffDias} dias`, cor: "text-amber-500", bg: "bg-amber-500/10" };
  return { texto: `Expira: ${venc.toLocaleDateString('pt-BR')}`, cor: "text-emerald-500", bg: "bg-emerald-500/10" };
};

/**
 * Página de Administração - Gestão do Clube dos 50 (Fundadores).
 * Acesso restrito via e-mail definido no .env da Cloudflare.
 */
export function PaginaAdmin() {
  const { usuario } = usarAutenticacao();
  const [usuarios, definirUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [busca, definirBusca] = useState("");
  const [salvando, definirSalvando] = useState<string | null>(null);

  // Segurança em nível de componente (além da API)
  const acessoPermitido = ehAdmin(usuario?.email);

  useEffect(() => {
    if (acessoPermitido) {
      buscarUsuarios();
    }
  }, [acessoPermitido]);

  const buscarUsuarios = async () => {
    definirCarregando(true);
    try {
      const dados = await servicoBaseApi.get<UsuarioAdmin[]>("/api/admin/usuarios");
      definirUsuarios(dados);
    } catch (erro) {
      toast.error("Erro ao carregar lista de usuários.");
    } finally {
      definirCarregando(false);
    }
  };

  const mudarPlano = async (idUsuario: string, novoPlano: PlanoUsuario) => {
    definirSalvando(idUsuario);
    try {
      // Se for Fundador, sugerimos ciclo Vitalício automaticamente
      const novoCiclo = novoPlano === "FUNDADOR" ? "VITALICIO" : undefined;
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, novoPlano, novoCiclo });
      toast.success("Plano atualizado!");
      buscarUsuarios(); // Recarrega a lista
    } catch (erro) {
      toast.error("Falha ao atualizar plano.");
    } finally {
      definirSalvando(null);
    }
  };

  const mudarCiclo = async (idUsuario: string, novoCiclo: string) => {
    definirSalvando(idUsuario);
    try {
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, novoCiclo });
      toast.success("Ciclo atualizado!");
      buscarUsuarios(); // Recarrega a lista
    } catch (erro) {
      toast.error("Falha ao atualizar ciclo.");
    } finally {
      definirSalvando(null);
    }
  };

  const renovarPlano = async (idUsuario: string) => {
    definirSalvando(idUsuario);
    try {
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, acao: "RENOVAR" });
      toast.success("Plano renovado!");
      buscarUsuarios(); // Recarrega a lista
    } catch (erro) {
      toast.error("Falha ao renovar plano.");
    } finally {
      definirSalvando(null);
    }
  };

  usarDefinirCabecalho({
    titulo: "Gestão Master",
    subtitulo: "Administração de Fundadores e Planos Premium",
    ocultarBusca: true,
  });

  if (!acessoPermitido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">Acesso Negado</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-500 max-w-md">
          Esta página é restrita ao dono da plataforma. Se você acredita que deveria ter acesso, contate a engenharia.
        </p>
      </div>
    );
  }

  const usuariosFiltrados = usuarios.filter(u => 
    u.id_usuario.toLowerCase().includes(busca.toLowerCase()) || 
    u.nome_estudio?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER DA PÁGINA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
            <Crown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fundadores</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {usuarios.filter(u => u.plano === "FUNDADOR").length} / 51
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Makers Pro</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {usuarios.filter(u => u.plano === "PRO").length}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-500/10 flex items-center justify-center text-gray-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Usuários</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{usuarios.length}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por Email, ID ou Nome do Estúdio..."
          value={busca}
          onChange={(e) => definirBusca(e.target.value)}
          className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 outline-none focus:border-sky-500/50 transition-all font-medium text-sm"
        />
      </div>

      {/* LISTAGEM */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden bg-white dark:bg-[#121214]">
        {carregando ? (
          <div className="p-20 flex justify-center">
             <Carregamento texto="Carregando base de usuários..." />
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <EstadoVazio 
            titulo="Nenhum usuário" 
            descricao="Nenhum registro encontrado para esta busca." 
            icone={Users} 
          />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail / ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Estúdio</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status Atual</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Ações de Plano & Ciclo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id_usuario} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                        {u.email ? mascararEmail(u.email) : (u.id_usuario.length > 20 ? u.id_usuario.slice(0, 15) + '...' : u.id_usuario)}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">ID: {u.id_usuario.slice(0, 6)}... | Ativ: {new Date(u.atualizado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">{u.nome_estudio || "---"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex gap-1.5 items-center">
                        <div className={`
                          inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                          ${u.plano === 'FUNDADOR' ? 'bg-sky-500/10 text-sky-500' : u.plano === 'PRO' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-500/10 text-gray-400'}
                        `}>
                          {u.plano === 'FUNDADOR' ? <Crown size={10} /> : u.plano === 'PRO' ? <Zap size={10} /> : <Users size={10} />}
                          {u.plano}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 px-1 uppercase tracking-widest">
                          {u.ciclo_pagamento || "MENSAL"}
                        </span>
                      </div>
                      
                      {u.plano !== "FREE" && (
                        <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento).cor} ${obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento).bg}`}>
                          {obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento).texto}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* Botão de Renovar */}
                      {u.plano === "PRO" && (
                         <button
                           disabled={salvando === u.id_usuario}
                           onClick={() => renovarPlano(u.id_usuario)}
                           className="px-2 py-1.5 rounded-lg text-[8px] font-black tracking-tighter uppercase transition-all bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                         >
                           {salvando === u.id_usuario ? '...' : 'RENOVAR'}
                         </button>
                      )}

                      {/* Seletor de Ciclo */}
                      {u.plano !== "FREE" && (
                        <select
                          disabled={salvando === u.id_usuario}
                          value={u.ciclo_pagamento || "MENSAL"}
                          onChange={(e) => mudarCiclo(u.id_usuario, e.target.value)}
                          className="bg-transparent text-[9px] font-black tracking-widest uppercase text-gray-500 dark:text-zinc-400 outline-none cursor-pointer border border-gray-100 dark:border-white/5 rounded-lg px-2 py-1.5 hover:border-sky-500 transition-colors"
                        >
                          <option value="MENSAL">Mensal</option>
                          <option value="TRIMESTRAL">Trimestral</option>
                          <option value="SEMESTRAL">Semestral</option>
                          <option value="ANUAL">Anual</option>
                          <option value="VITALICIO">Vitalício</option>
                        </select>
                      )}

                      {/* Botões de Plano */}
                      <div className="flex gap-1">
                        {(['FREE', 'PRO', 'FUNDADOR'] as PlanoUsuario[]).map(p => (
                          <button
                            key={p}
                            disabled={salvando === u.id_usuario || u.plano === p}
                            onClick={() => mudarPlano(u.id_usuario, p)}
                            className={`
                              px-3 py-1.5 rounded-lg text-[8px] font-black tracking-tighter uppercase transition-all
                              ${u.plano === p ? 'bg-gray-100 dark:bg-white/10 text-gray-400 cursor-default' : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-zinc-400 hover:border-sky-500 hover:text-sky-500'}
                            `}
                          >
                            {salvando === u.id_usuario && u.plano !== p ? '...' : p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-8 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
         <ShieldCheck className="text-amber-500 shrink-0" size={20} />
         <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Aviso de Segurança Master</h4>
            <p className="text-[11px] text-amber-700/70 dark:text-amber-500/50 leading-relaxed font-medium">
              As alterações realizadas nesta página impactam diretamente a precificação e acessos dos usuários. 
              As vagas de <strong>Fundador</strong> são limitadas a 51 por estratégia comercial. 
              Toda alteração é auditada e vinculada ao seu e-mail administrativo.
            </p>
         </div>
      </div>
    </div>
  );
}
