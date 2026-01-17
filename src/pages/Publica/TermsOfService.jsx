import React from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'wouter';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-inter selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Header */}
            <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Scale className="text-emerald-400" size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Termos de Uso</h1>
                    </div>
                    <Link href="/">
                        <a className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={16} />
                            Voltar
                        </a>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                <section className="space-y-4">
                    <p className="leading-relaxed text-zinc-400">
                        Ao acessar ao site <strong>PrintLog</strong>, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">1. Licença de Uso</h2>
                    <p className="leading-relaxed text-zinc-400">
                        É concedida permissão para o uso do software PrintLog para fins pessoais e comerciais, conforme o plano contratado. Esta é a concessão de uma licença, não uma transferência de título, e sob esta licença você não pode:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li>Modificar ou copiar os materiais (código-fonte);</li>
                        <li>Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site PrintLog;</li>
                        <li>Remover quaisquer direitos autorais ou outras notações de propriedade dos materiais.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">2. Isenção de Responsabilidade</h2>
                    <p className="leading-relaxed text-zinc-400">
                        Os materiais no site da PrintLog são fornecidos 'como estão'. PrintLog não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">3. Limitações</h2>
                    <p className="leading-relaxed text-zinc-400">
                        Em nenhum caso o PrintLog ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em PrintLog.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">4. Precisão dos Materiais</h2>
                    <p className="leading-relaxed text-zinc-400">
                        Os materiais exibidos no site da PrintLog podem incluir erros técnicos, tipográficos ou fotográficos. PrintLog não garante que qualquer material em seu site seja preciso, completo ou atual. PrintLog pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio.
                    </p>
                </section>

                <section className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-sm text-emerald-200/80">
                        A PrintLog pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
                    </p>
                </section>
            </main>

            <footer className="border-t border-zinc-900 py-10 mt-12">
                <div className="max-w-4xl mx-auto px-6 text-center text-zinc-600 text-sm">
                    &copy; {new Date().getFullYear()} PrintLog. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
