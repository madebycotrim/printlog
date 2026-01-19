import React, { useState, useId } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentId = useId();

    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="w-full py-6 flex items-center justify-between text-left group hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none rounded-lg px-2 -mx-2"
            >
                <span className={`text-sm md:text-base font-bold uppercase tracking-wide ${isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {question}
                </span>
                <ChevronDown
                    size={20}
                    className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-500' : ''}`}
                    aria-hidden="true"
                />
            </button>
            <div
                id={contentId}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-zinc-500 text-sm leading-relaxed pr-8">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const faqs = [
        {
            q: "Preciso instalar algum programa?",
            a: "Não! O PrintLog é 100% online. Você acessa pelo navegador do seu computador, tablet ou celular, sem precisar baixar nada."
        },
        {
            q: "Funciona com qualquer impressora?",
            a: "Sim. O sistema é agnóstico a marcas. Se você sabe o consumo da sua máquina (watts) e o preço do filamento, o PrintLog funciona perfeitamente para você."
        },
        {
            q: "Meus dados ficam seguros?",
            a: "Com certeza. Utilizamos criptografia de ponta e servidores seguros para garantir que apenas você tenha acesso às informações da sua oficina e seus clientes."
        },
        {
            q: "Como funciona o cálculo de energia?",
            a: "Você insere a potência média da sua impressora (ex: 350W) e o custo do kWh da sua cidade. O sistema calcula automaticamente o gasto baseado no tempo de impressão."
        },
        {
            q: "Posso cancelar quando quiser?",
            a: "Sim. Se você estiver no plano Pro, pode cancelar a assinatura a qualquer momento através do seu painel, sem multas ou taxas escondidas."
        }
    ];

    return (
        <section className="py-24 px-8 relative z-10 bg-[#050506]">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 mb-4">
                        <HelpCircle size={24} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                        Dúvidas <span className="text-zinc-700">Frequentes.</span>
                    </h2>
                    <p className="text-zinc-500 text-lg">
                        Tudo o que você precisa saber antes de começar.
                    </p>
                </div>

                <div className="bg-[#0a0a0c] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl animate-fade-in-up">
                    {faqs.map((item, i) => (
                        <FAQItem key={i} question={item.q} answer={item.a} />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-zinc-600 text-sm mb-4">Ainda tem dúvidas?</p>
                    <a
                        href="mailto:suporte@printlog.com.br"
                        className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-400 font-bold uppercase text-xs tracking-widest transition-colors"
                    >
                        <MessageCircle size={16} /> Falar com Suporte
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
