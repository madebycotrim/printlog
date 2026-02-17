import React from 'react';
import { ArrowLeft, Shield, Lock, Database, Eye, Download, Trash2, Mail, CheckCircle2, Clock, Scale } from 'lucide-react';
import { Link } from 'wouter';

export default function SecurityPrivacy() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-inter selection:bg-sky-500/30 selection:text-sky-200">
            {/* Header */}
            <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20">
                            <Shield className="text-sky-400" size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Segurança e Privacidade</h1>
                    </div>
                    <Link href="/">
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer">
                            <ArrowLeft size={16} />
                            Voltar para a página inicial
                        </div>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-6 py-12 text-center space-y-4">
                <h2 className="text-4xl font-bold text-zinc-100">
                    No PrintLog, a proteção dos seus dados é nossa prioridade
                </h2>
                <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                    Conheça como mantemos suas informações seguras e resguardamos sua privacidade.
                </p>
            </section>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 pb-20 space-y-16">
                {/* Your Data Belongs to You */}
                <section className="space-y-8">
                    <h3 className="text-3xl font-bold text-zinc-100 text-center">Seus dados pertencem a você</h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 space-y-4 hover:border-sky-500/30 transition-all duration-300">
                            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 w-fit">
                                <Database className="text-sky-400" size={24} />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-100">Dados completamente isolados</h4>
                            <p className="text-zinc-400 leading-relaxed">
                                Cada conta possui dados separados e inacessíveis por outros usuários. Utilizamos Row-Level Security (RLS) no banco de dados para garantir o isolamento completo.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 space-y-4 hover:border-sky-500/30 transition-all duration-300">
                            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 w-fit">
                                <Eye className="text-sky-400" size={24} />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-100">Sem acesso administrativo a relatórios individuais</h4>
                            <p className="text-zinc-400 leading-relaxed">
                                A equipe do PrintLog não possui acesso aos seus relatórios, vendas, produtos ou informações estratégicas do seu negócio.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 space-y-4 hover:border-sky-500/30 transition-all duration-300">
                            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 w-fit">
                                <Shield className="text-sky-400" size={24} />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-100">Dados nunca utilizados para fins comerciais</h4>
                            <p className="text-zinc-400 leading-relaxed">
                                Suas informações não são vendidas, compartilhadas ou utilizadas para publicidade direcionada ou qualquer outro fim comercial.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Technical Protection */}
                <section className="space-y-8">
                    <h3 className="text-3xl font-bold text-zinc-100 text-center">Proteção técnica</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Feature 1 */}
                        <div className="flex gap-4 items-start p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 transition-all">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
                                <Lock className="text-emerald-400" size={20} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-zinc-100">Criptografia SSL/TLS</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Todas as conexões são protegidas com criptografia SSL de ponta a ponta, garantindo que seus dados não possam ser interceptados.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex gap-4 items-start p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 transition-all">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
                                <Database className="text-emerald-400" size={20} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-zinc-100">Armazenamento seguro</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Utilizamos infraestrutura de nível empresarial com servidores seguros e políticas de acesso rigorosas.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex gap-4 items-start p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 transition-all">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
                                <CheckCircle2 className="text-emerald-400" size={20} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-zinc-100">Controle de acesso autenticado</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Sistema de autenticação robusto com verificação de e-mail e proteção contra senhas comprometidas.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="flex gap-4 items-start p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 transition-all">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
                                <Clock className="text-emerald-400" size={20} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-zinc-100">Backups automáticos</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Realizamos backups automáticos regulares para garantir a recuperação dos seus dados em caso de incidentes.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LGPD Compliance */}
                <section className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Shield className="text-indigo-400" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-100">Conformidade com LGPD</h3>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                        O sistema foi desenvolvido em conformidade com a Lei Geral de Proteção de Dados (LGPD), garantindo seus direitos sobre os dados pessoais armazenados.
                    </p>
                </section>

                {/* Transparency */}
                <section className="space-y-8">
                    <h3 className="text-3xl font-bold text-zinc-100 text-center">Transparência</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl space-y-3">
                            <h4 className="text-xl font-bold text-zinc-100">Sem compartilhamento com terceiros</h4>
                            <p className="text-zinc-400 leading-relaxed">
                                Seus dados pessoais e informações de negócio nunca são compartilhados com empresas terceiras, parceiros ou anunciantes.
                            </p>
                        </div>

                        <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl space-y-3">
                            <h4 className="text-xl font-bold text-zinc-100">Métricas anônimas para melhoria</h4>
                            <p className="text-zinc-400 leading-relaxed">
                                Podemos utilizar métricas globais anônimas e agregadas (como número total de usuários) apenas para melhorar o produto. Essas métricas não identificam você individualmente.
                            </p>
                        </div>
                    </div>
                </section>

                {/* User Rights */}
                <section className="space-y-8">
                    <h3 className="text-3xl font-bold text-zinc-100 text-center">Direitos do usuário</h3>
                    <p className="text-center text-zinc-400 max-w-2xl mx-auto">
                        Em conformidade com a LGPD, você possui os seguintes direitos sobre seus dados:
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Right 1 */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 space-y-4 text-center hover:border-sky-500/30 transition-all">
                            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 w-fit mx-auto">
                                <Download className="text-sky-400" size={24} />
                            </div>
                            <h4 className="font-bold text-zinc-100">Exportar dados</h4>
                            <p className="text-sm text-zinc-400">
                                Baixe todos os seus dados em formato CSV a qualquer momento.
                            </p>
                        </div>

                        {/* Right 2 */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 space-y-4 text-center hover:border-sky-500/30 transition-all">
                            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 w-fit mx-auto">
                                <Trash2 className="text-red-400" size={24} />
                            </div>
                            <h4 className="font-bold text-zinc-100">Excluir conta</h4>
                            <p className="text-sm text-zinc-400">
                                Solicite a exclusão completa da sua conta e dados associados.
                            </p>
                        </div>

                        {/* Right 3 */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 space-y-4 text-center hover:border-sky-500/30 transition-all">
                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 w-fit mx-auto">
                                <Mail className="text-emerald-400" size={24} />
                            </div>
                            <h4 className="font-bold text-zinc-100">Contato</h4>
                            <p className="text-sm text-zinc-400">
                                Entre em contato para qualquer solicitação sobre seus dados.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2FA Coming Soon */}
                <section className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                            Em breve
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-100">Autenticação em Dois Fatores (2FA)</h3>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                        Estamos desenvolvendo a autenticação em dois fatores para adicionar uma camada extra de segurança à sua conta. Você poderá utilizar aplicativos como Google Authenticator para proteger ainda mais seu acesso.
                    </p>
                </section>

                {/* Legal Documents */}
                <section className="space-y-8">
                    <h3 className="text-3xl font-bold text-zinc-100 text-center">Documentos legais</h3>
                    <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Privacy Policy Card */}
                        <Link href="/privacy-policy">
                            <div className="block group cursor-pointer">
                                <div className="p-8 bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border border-indigo-500/20 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <Shield className="text-indigo-400" size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-zinc-100 mb-1">Política de Privacidade</h4>
                                            <p className="text-sm text-zinc-400">Detalhes completos sobre proteção de dados</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Terms of Service Card */}
                        <Link href="/terms-of-service">
                            <div className="block group cursor-pointer">
                                <div className="p-8 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                            <Scale className="text-emerald-400" size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-zinc-100 mb-1">Termos de Uso</h4>
                                            <p className="text-sm text-zinc-400">Condições de utilização da plataforma</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-900 py-10">
                <div className="max-w-6xl mx-auto px-6 text-center text-zinc-600 text-sm">
                    &copy; {new Date().getFullYear()} PrintLog. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
