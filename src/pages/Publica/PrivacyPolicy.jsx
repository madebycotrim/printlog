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
                <section className="space-y-4">
                    <p className="leading-relaxed text-zinc-400">
                        Última atualização: {new Date().toLocaleDateString('pt-BR')}
                    </p>
                    <p className="leading-relaxed">
                        A sua privacidade é importante para nós. É política do <strong>PrintLog</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site PrintLog, e outros sites que possuímos e operamos.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">1. Informações que Coletamos</h2>
                    <p className="leading-relaxed text-zinc-400">
                        Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li><strong>Dados de Identificação:</strong> Nome, E-mail, Telefone.</li>
                        <li><strong>Dados Comerciais:</strong> Nome da Empresa, Endereço.</li>
                        <li><strong>Dados de Uso:</strong> Informações sobre como você utiliza nossa plataforma (projetos, clientes, impressoras).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">2. Uso das Informações</h2>
                    Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">3. Compartilhamento de Dados</h2>
                    <p className="leading-relaxed text-zinc-400">
                        Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-100">4. Seus Direitos (LGPD)</h2>
                    <p className="leading-relaxed text-zinc-400">
                        Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados. Seus direitos incluem:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                        <li>Acesso aos dados.</li>
                        <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
                        <li>Portabilidade dos dados a outro fornecedor de serviço ou produto.</li>
                    </ul>
                </section>

                <section className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                    <p className="text-sm text-indigo-200/80">
                        Esta política é efetiva a partir de {new Date().getFullYear()}. Se você tiver dúvidas sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco.
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
