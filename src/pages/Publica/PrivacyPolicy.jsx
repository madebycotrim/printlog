import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-inter selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Header */}
            <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <Shield className="text-indigo-400" size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Política de Privacidade</h1>
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
                    <h2 className="text-2xl font-bold text-zinc-100">1. Introdução</h2>
                    <p className="leading-relaxed">
                        O <strong>PrintLog</strong> ("nós", "nosso" ou "Plataforma") está comprometido com a proteção da sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                    </p>
                </section>

                {/* Section 2 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">2. Dados Coletados</h2>
                    <p className="leading-relaxed">
                        Coletamos os seguintes tipos de dados:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li><strong className="text-zinc-300">Dados de cadastro:</strong> nome, e-mail e senha criptografada.</li>
                        <li><strong className="text-zinc-300">Dados de uso:</strong> informações sobre produtos, vendas, máquinas, filamentos e canais de venda que você cadastra na plataforma.</li>
                        <li><strong className="text-zinc-300">Dados técnicos:</strong> logs de acesso, endereço IP e informações do dispositivo para fins de segurança.</li>
                    </ul>
                </section>

                {/* Section 3 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">3. Finalidade do Tratamento</h2>
                    <p className="leading-relaxed">
                        Utilizamos seus dados para:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li>Fornecer e manter os serviços da plataforma;</li>
                        <li>Autenticar seu acesso de forma segura;</li>
                        <li>Enviar comunicações essenciais sobre sua conta;</li>
                        <li>Melhorar a experiência do usuário;</li>
                        <li>Cumprir obrigações legais e regulatórias.</li>
                    </ul>
                </section>

                {/* Section 4 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">4. Compartilhamento de Dados</h2>
                    <p className="leading-relaxed">
                        Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais. Seus dados podem ser compartilhados apenas:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li>Com provedores de infraestrutura essenciais para o funcionamento do serviço;</li>
                        <li>Quando exigido por lei ou ordem judicial;</li>
                        <li>Para proteger nossos direitos legais.</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">5. Armazenamento e Segurança</h2>
                    <p className="leading-relaxed">
                        Seus dados são armazenados em servidores seguros com criptografia SSL/TLS. Implementamos políticas de Row-Level Security (RLS) que garantem que cada usuário tenha acesso apenas aos seus próprios dados. Realizamos backups automáticos regulares para garantir a integridade das informações.
                    </p>
                </section>

                {/* Section 6 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">6. Seus Direitos (LGPD)</h2>
                    <p className="leading-relaxed">
                        Conforme a LGPD, você tem direito a:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li><strong className="text-zinc-300">Acesso:</strong> solicitar uma cópia dos seus dados pessoais;</li>
                        <li><strong className="text-zinc-300">Correção:</strong> corrigir dados incompletos ou desatualizados;</li>
                        <li><strong className="text-zinc-300">Exclusão:</strong> solicitar a exclusão dos seus dados;</li>
                        <li><strong className="text-zinc-300">Portabilidade:</strong> exportar seus dados em formato legível;</li>
                        <li><strong className="text-zinc-300">Revogação:</strong> revogar o consentimento a qualquer momento.</li>
                    </ul>
                </section>

                {/* Section 7 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">7. Retenção de Dados</h2>
                    <p className="leading-relaxed">
                        Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, seus dados são removidos de forma permanente, exceto quando a retenção for necessária para cumprimento de obrigações legais ou resolução de disputas.
                    </p>
                </section>

                {/* Section 8 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">8. Cookies</h2>
                    <p className="leading-relaxed">
                        Utilizamos cookies essenciais para manter sua sessão autenticada. Não utilizamos cookies de rastreamento ou publicidade de terceiros.
                    </p>
                </section>

                {/* Section 9 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">9. Alterações nesta Política</h2>
                    <p className="leading-relaxed">
                        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações significativas através do e-mail cadastrado ou aviso na plataforma.
                    </p>
                </section>

                {/* Section 10 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-100">10. Contato</h2>
                    <p className="leading-relaxed">
                        Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato através do e-mail <a href="mailto:suporte@printlog.com.br" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">suporte@printlog.com.br</a>.
                    </p>
                </section>

                {/* Bottom Notice */}
                <section className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                    <p className="text-sm text-indigo-200/80 leading-relaxed">
                        Esta política é efetiva a partir de 2026. Se você tiver dúvidas sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco através do e-mail disponibilizado acima.
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
