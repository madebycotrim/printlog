import { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  Users, 
  Crown, 
  Zap, 
  RefreshCw, 
  Copy, 
  Check, 
  Search,
  Sparkles,
  Layers,
  Clock
} from "lucide-react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { ehAdmin, EMAIL_DONO } from "@/compartilhado/constantes/admin";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { toast } from "sonner";
import { Carregamento } from "@/compartilhado/componentes";
import { EstadoVazio } from "@/compartilhado/componentes";
import { formatarData } from "@/compartilhado/utilitarios/formatadores";

interface UsuarioAdmin {
  id_usuario: string;
  email?: string;
  nome_estudio: string;
  plano: PlanoUsuario;
  ciclo_pagamento?: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL" | "VITALICIO";
  vencimento_plano?: string;
  atualizado_em: string;
}

const obterStatusVencimento = (dataStr?: string, ciclo?: string) => {
  if (ciclo === "VITALICIO") return { texto: "Vitalício", cor: "text-blue-500", bg: "bg-blue-500/10" };
  if (!dataStr) return { texto: "Sem data", cor: "text-zinc-400", bg: "bg-zinc-500/10" };
  
  const hoje = new Date();
  const venc = new Date(dataStr);
  const diffDias = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 3600 * 24));

  if (diffDias < 0) return { texto: `Expirou há ${Math.abs(diffDias)}d`, cor: "text-rose-500", bg: "bg-rose-500/10" };
  if (diffDias <= 7) return { texto: `Expira em ${diffDias}d`, cor: "text-amber-500", bg: "bg-amber-500/10" };
  return { texto: `Expira: ${formatarData(venc)}`, cor: "text-emerald-500", bg: "bg-emerald-500/10" };
};

/**
 * Console de Administração - Acesso exclusivo do Dono (Bootstrap da plataforma).
 * Gerenciamento centralizado de todos os usuários cadastrados e seus planos.
 */
export function PaginaAdmin() {
  const { usuario } = useAutenticacao();
  const [usuarios, definirUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [busca, definirBusca] = useState("");
  const [filtroPlano, definirFiltroPlano] = useState<string>("TODOS");
  const [salvando, definirSalvando] = useState<string | null>(null);
  const [itemCopiado, definirItemCopiado] = useState<string | null>(null);

  const acessoPermitido = ehAdmin(usuario?.email);

  const buscarUsuarios = useCallback(async () => {
    definirCarregando(true);
    try {
      const dados = await servicoBaseApi.get<UsuarioAdmin[]>("/api/admin/usuarios");
      definirUsuarios(dados);
    } catch {
      toast.error("Erro ao carregar lista de usuários da base.");
    } finally {
      definirCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (acessoPermitido) {
      buscarUsuarios();
    }
  }, [acessoPermitido, buscarUsuarios]);

  const copiarTexto = async (texto: string, chave: string, mensagem: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      definirItemCopiado(chave);
      toast.success(mensagem);
      setTimeout(() => definirItemCopiado(null), 2000);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const mudarPlano = async (idUsuario: string, novoPlano: PlanoUsuario) => {
    definirSalvando(idUsuario);
    try {
      const novoCiclo = novoPlano === "FUNDADOR" ? "VITALICIO" : undefined;
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, novoPlano, novoCiclo });
      toast.success(`Plano atualizado para ${novoPlano}!`);
      buscarUsuarios();
    } catch {
      toast.error("Falha ao atualizar plano.");
    } finally {
      definirSalvando(null);
    }
  };

  const mudarCiclo = async (idUsuario: string, novoCiclo: string) => {
    definirSalvando(idUsuario);
    try {
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, novoCiclo });
      toast.success("Ciclo de pagamento atualizado!");
      buscarUsuarios();
    } catch {
      toast.error("Falha ao atualizar ciclo.");
    } finally {
      definirSalvando(null);
    }
  };

  const renovarPlano = async (idUsuario: string) => {
    definirSalvando(idUsuario);
    try {
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, acao: "RENOVAR" });
      toast.success("Plano renovado com sucesso!");
      buscarUsuarios();
    } catch {
      toast.error("Falha ao renovar plano.");
    } finally {
      definirSalvando(null);
    }
  };

  useDefinirCabecalho({
    titulo: "Console do Dono",
    subtitulo: "Bootstrap — Monitoramento e Gestão de Usuários da Plataforma",
    placeholderBusca: "Buscar e-mail, ID ou estúdio...",
    aoBuscar: (t) => definirBusca(t),
  });

  if (!acessoPermitido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/5">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white">
          Acesso Restrito ao Dono
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
          Este Console é restrito exclusivamente ao e-mail administrador configurado nas variáveis da Cloudflare (<code>EMAIL_DONO</code>).
        </p>
      </div>
    );
  }

  // Filtragem combinada por busca e plano
  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    const bateBusca = 
      !busca ||
      u.id_usuario.toLowerCase().includes(termo) ||
      (u.email && u.email.toLowerCase().includes(termo)) ||
      (u.nome_estudio && u.nome_estudio.toLowerCase().includes(termo));

    const batePlano = filtroPlano === "TODOS" || u.plano === filtroPlano;

    return bateBusca && batePlano;
  });

  const totalUsuarios = usuarios.length;
  const totalFundadores = usuarios.filter((u) => u.plano === "FUNDADOR").length;
  const totalPro = usuarios.filter((u) => u.plano === "PRO").length;
  const totalFree = usuarios.filter((u) => u.plano === "FREE").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* BARRA SUPERIOR DE AÇÕES & STATUS DO DONO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-borda-sutil shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primaria/10 border border-primaria/20 flex items-center justify-center text-primaria">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Console Master
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Dono Ativo
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
              Conectado como: <strong className="text-zinc-700 dark:text-zinc-300">{usuario?.email || EMAIL_DONO}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={buscarUsuarios}
          disabled={carregando}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-primaria bg-muted hover:bg-muted/80 border border-borda-sutil transition-all active:scale-95 disabled:opacity-50"
          title="Recarregar base de dados"
        >
          <RefreshCw size={14} className={carregando ? "animate-spin text-primaria" : ""} />
          Atualizar Dados
        </button>
      </div>

      {/* METRICAS DO BOOTSTRAP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Usuários */}
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-500 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Makers</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">{totalUsuarios}</p>
          </div>
        </div>

        {/* Fundadores */}
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
            <Crown size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Fundadores</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400 leading-tight">{totalFundadores}</span>
              <span className="text-xs text-zinc-400 font-bold">/ 51</span>
            </div>
          </div>
        </div>

        {/* Makers Pro */}
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Makers Pro</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-tight">{totalPro}</p>
          </div>
        </div>

        {/* Makers Free */}
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-400 shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Makers Free</p>
            <p className="text-2xl font-black text-zinc-700 dark:text-zinc-300 leading-tight">{totalFree}</p>
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pílulas de filtro por plano */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-borda-sutil overflow-x-auto custom-scrollbar">
          {[
            { id: "TODOS", rotulo: "Todos", contagem: totalUsuarios },
            { id: "FUNDADOR", rotulo: "Fundador", contagem: totalFundadores },
            { id: "PRO", rotulo: "Pro", contagem: totalPro },
            { id: "FREE", rotulo: "Free", contagem: totalFree },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => definirFiltroPlano(item.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                ${filtroPlano === item.id 
                  ? "bg-primaria text-white shadow-sm" 
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-muted"}
              `}
            >
              <span>{item.rotulo}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${filtroPlano === item.id ? "bg-white/20 text-white" : "bg-muted text-zinc-400"}`}>
                {item.contagem}
              </span>
            </button>
          ))}
        </div>

        {/* Input de busca rápida local */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => definirBusca(e.target.value)}
            placeholder="Filtrar por e-mail, ID ou estúdio..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-card border border-borda-sutil placeholder:text-zinc-400 focus:outline-none focus:border-primaria transition-all"
          />
        </div>
      </div>

      {/* LISTAGEM PRINCIPAL */}
      <div className="rounded-2xl border border-borda-sutil overflow-hidden bg-card shadow-sm">
        {carregando ? (
          <div className="p-20 flex justify-center">
            <Carregamento texto="Carregando usuários cadastrados..." />
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <EstadoVazio 
            titulo="Nenhum usuário encontrado" 
            descricao="Não há registros correspondentes aos filtros selecionados." 
            icone={Users} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borda-sutil bg-muted/40 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  <th className="px-5 py-3.5">Usuário (E-mail & ID)</th>
                  <th className="px-5 py-3.5">Estúdio</th>
                  <th className="px-5 py-3.5">Plano / Vencimento</th>
                  <th className="px-5 py-3.5">Última Atividade</th>
                  <th className="px-5 py-3.5 text-right">Ações do Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda-sutil text-xs">
                {usuariosFiltrados.map((u) => {
                  const ehODono = u.email && EMAIL_DONO && u.email.toLowerCase().trim() === EMAIL_DONO.toLowerCase().trim();
                  const statusVenc = obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento);

                  return (
                    <tr 
                      key={u.id_usuario} 
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* E-MAIL E ID */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-white select-all">
                              {u.email || <span className="text-zinc-400 italic font-normal">Sem e-mail registrado</span>}
                            </span>
                            
                            {u.email && (
                              <button
                                onClick={() => copiarTexto(u.email!, `email-${u.id_usuario}`, "E-mail copiado!")}
                                className="p-1 rounded text-zinc-400 hover:text-primaria hover:bg-muted transition-colors"
                                title="Copiar e-mail"
                              >
                                {itemCopiado === `email-${u.id_usuario}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            )}

                            {ehODono && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primaria/10 text-primaria border border-primaria/20">
                                Você / Dono
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <span>UID:</span>
                            <span className="font-mono">{u.id_usuario.slice(0, 14)}...</span>
                            <button
                              onClick={() => copiarTexto(u.id_usuario, `uid-${u.id_usuario}`, "ID do usuário copiado!")}
                              className="p-0.5 rounded text-zinc-400 hover:text-primaria transition-colors"
                              title="Copiar UID completo"
                            >
                              {itemCopiado === `uid-${u.id_usuario}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* ESTÚDIO */}
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {u.nome_estudio ? u.nome_estudio : <span className="text-zinc-400 italic text-[11px]">Não configurado</span>}
                        </span>
                      </td>

                      {/* PLANO E VENCIMENTO */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider
                              ${u.plano === 'FUNDADOR' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 
                                u.plano === 'PRO' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 
                                'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20'}
                            `}>
                              {u.plano === 'FUNDADOR' ? <Crown size={11} /> : u.plano === 'PRO' ? <Zap size={11} /> : <Users size={11} />}
                              {u.plano}
                            </span>

                            {u.plano !== "FREE" && (
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {u.ciclo_pagamento || "MENSAL"}
                              </span>
                            )}
                          </div>

                          {u.plano !== "FREE" && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusVenc.cor} ${statusVenc.bg}`}>
                              {statusVenc.texto}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ÚLTIMA ATIVIDADE */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                          <Clock size={12} className="text-zinc-400" />
                          <span className="text-[11px] font-medium">{formatarData(u.atualizado_em)}</span>
                        </div>
                      </td>

                      {/* AÇÕES DE GESTÃO */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end items-center gap-2">
                          
                          {/* Botão de Renovar */}
                          {u.plano === "PRO" && (
                            <button
                              disabled={salvando === u.id_usuario}
                              onClick={() => renovarPlano(u.id_usuario)}
                              className="px-2.5 py-1.5 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                              title="Renovar ciclo"
                            >
                              {salvando === u.id_usuario ? "..." : "Renovar"}
                            </button>
                          )}

                          {/* Seletor de Ciclo */}
                          {u.plano !== "FREE" && (
                            <select
                              disabled={salvando === u.id_usuario}
                              value={u.ciclo_pagamento || "MENSAL"}
                              onChange={(e) => mudarCiclo(u.id_usuario, e.target.value)}
                              className="bg-card text-[9px] font-black tracking-widest uppercase text-zinc-600 dark:text-zinc-300 border border-borda-sutil rounded-lg px-2 py-1.5 hover:border-primaria transition-colors outline-none cursor-pointer"
                            >
                              <option value="MENSAL">Mensal</option>
                              <option value="TRIMESTRAL">Trimestral</option>
                              <option value="SEMESTRAL">Semestral</option>
                              <option value="ANUAL">Anual</option>
                              <option value="VITALICIO">Vitalício</option>
                            </select>
                          )}

                          {/* Botões de Alteração de Plano */}
                          <div className="flex gap-1">
                            {(["FREE", "PRO", "FUNDADOR"] as PlanoUsuario[]).map((p) => (
                              <button
                                key={p}
                                disabled={salvando === u.id_usuario || u.plano === p}
                                onClick={() => mudarPlano(u.id_usuario, p)}
                                className={`
                                  px-2.5 py-1.5 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all
                                  ${u.plano === p 
                                    ? "bg-muted text-zinc-400 cursor-default opacity-50" 
                                    : "bg-card border border-borda-sutil text-zinc-600 dark:text-zinc-300 hover:border-primaria hover:text-primaria"}
                                `}
                              >
                                {salvando === u.id_usuario && u.plano !== p ? "..." : p}
                              </button>
                            ))}
                          </div>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AVISO DO BOOTSTRAP */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
        <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="space-y-0.5 text-xs">
          <h4 className="font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Console de Bootstrap — Acesso Confidencial
          </h4>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 leading-relaxed font-medium">
            Esta visualização consolida todos os usuários cadastrados no banco D1 da Cloudflare. As mudanças de plano e ciclo entram em vigor instantaneamente para as contas selecionadas.
          </p>
        </div>
      </div>
    </div>
  );
}
