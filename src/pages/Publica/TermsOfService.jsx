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
                {/* Introduction */}
                <section className="space-y-4">
                    <p className="leading-relaxed text-zinc-400">
                        Última atualização: 17 de fevereiro de 2026
                    </p>
                </section>

                {/* Section 1 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">1. Aceitação dos Termos</h2>
                    <p className="leading-relaxed">
                        Ao acessar e utilizar o <strong>PrintLog</strong> ("Plataforma"), você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.
                    </p>
                </section>

                {/* Section 2 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">2. Descrição do Serviço</h2>
                    <p className="leading-relaxed">
                        O PrintLog é uma plataforma de gestão e precificação para profissionais de impressão 3D. O serviço permite calcular custos de produção, gerenciar vendas, controlar estoque de filamentos e insumos, cadastrar impressoras e analisar a rentabilidade do seu negócio.
                    </p>
                </section>

                {/* Section 3 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">3. Cadastro e Conta</h2>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li>Você deve fornecer informações verdadeiras e atualizadas no cadastro;</li>
                        <li>Você é responsável por manter a confidencialidade da sua senha;</li>
                        <li>Você é responsável por todas as atividades realizadas em sua conta;</li>
                        <li>Você deve notificar imediatamente sobre qualquer uso não autorizado.</li>
                    </ul>
                </section>

                {/* Section 4 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">4. Uso Aceitável</h2>
                    <p className="leading-relaxed">
                        Você concorda em não:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li>Violar leis ou regulamentos aplicáveis;</li>
                        <li>Tentar acessar dados de outros usuários;</li>
                        <li>Interferir no funcionamento da plataforma;</li>
                        <li>Utilizar o serviço para atividades ilegais ou fraudulentas;</li>
                        <li>Compartilhar sua conta com terceiros.</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">5. Planos e Pagamentos</h2>
                    <p className="leading-relaxed">
                        A plataforma oferece planos gratuito (Free) e pago (Pro). O plano Pro oferece funcionalidades adicionais mediante pagamento. Os valores e condições estão disponíveis na página de upgrade. Pagamentos são processados de forma segura através de parceiros autorizados.
                    </p>
                </section>

                {/* Section 6 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">6. Propriedade Intelectual</h2>
                    <p className="leading-relaxed">
                        Todo o conteúdo da plataforma, incluindo código, design, textos e marca, é propriedade do PrintLog. Os dados que você insere na plataforma permanecem de sua propriedade.
                    </p>
                </section>

                {/* Section 7 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">7. Disponibilidade do Serviço</h2>
                    <p className="leading-relaxed">
                        Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade ininterrupta. Podemos realizar manutenções programadas ou emergenciais quando necessário.
                    </p>
                </section>

                {/* Section 8 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">8. Limitação de Responsabilidade</h2>
                    <p className="leading-relaxed">
                        A plataforma é fornecida "como está". Não nos responsabilizamos por decisões de negócio tomadas com base nos cálculos e relatórios gerados. Você é responsável por verificar a precisão das informações inseridas e dos resultados obtidos.
                    </p>
                </section>

                {/* Section 9 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">9. Encerramento</h2>
                    <p className="leading-relaxed">
                        Você pode encerrar sua conta a qualquer momento através das configurações do sistema. Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.
                    </p>
                </section>

                {/* Section 10 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">10. Alterações nos Termos</h2>
                    <p className="leading-relaxed">
                        Podemos atualizar estes Termos de Uso periodicamente. Alterações significativas serão comunicadas através do e-mail cadastrado ou aviso na plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.
                    </p>
                </section>

                {/* Section 11 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">11. Lei Aplicável</h2>
                    <p className="leading-relaxed">
                        Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos tribunais competentes do Brasil.
                    </p>
                </section>

                {/* Section 12 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">12. Contato</h2>
                    <p className="leading-relaxed">
                        Para dúvidas sobre estes termos, entre em contato através do e-mail <a href="mailto:suporte@printlog.com.br" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">suporte@printlog.com.br</a>.
                    </p>
                </section>

                {/* Bottom Notice */}
                <section className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-sm text-emerald-200/80 leading-relaxed">
                        O PrintLog pode revisar estes termos de serviço a qualquer momento, sem aviso prévio. Ao usar esta plataforma, você concorda em ficar vinculado à versão atual desses termos de serviço.
                    </p>
                </section>

                {/* Back Link */}
                <div className="pt-6">
                    <Link href="/security-privacy">
                        <a className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft size={14} />
                            Voltar para Segurança e Privacidade
                        </a>
                    </Link>
                </div>
            </main>

            <footer className="border-t border-zinc-900 py-10 mt-12">
                <div className="max-w-4xl mx-auto px-6 text-center text-zinc-600 text-sm">
                    &copy; {new Date().getFullYear()} PrintLog. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
