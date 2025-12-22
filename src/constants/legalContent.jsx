import React from "react";
import { ShieldCheck, Lock, EyeOff, Database, Cpu, AlertTriangle } from "lucide-react";

export const TERMS_CONTENT = (
    <div className="space-y-6">
        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Database size={14} className="text-sky-500" />
                1. Escopo do Serviço
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog é uma plataforma de gestão desenvolvida para makers, estúdios e
                farms de impressão 3D que desejam organizar custos, processos e histórico
                de produção. As ferramentas oferecidas têm caráter informativo e
                analítico, auxiliando na tomada de decisão.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Todos os cálculos apresentados são baseados exclusivamente nos dados
                inseridos pelo usuário, como valores de filamento, energia, tempo de
                máquina e manutenção. A responsabilidade final sobre preços, margens de
                lucro, viabilidade comercial e estratégias de venda é sempre do usuário.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} className="text-sky-500" />
                2. Disponibilidade e Evolução da Plataforma
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog está em constante evolução. Funcionalidades podem ser
                ajustadas, aprimoradas ou descontinuadas com o objetivo de melhorar a
                experiência e a estabilidade do sistema. Buscamos sempre manter
                compatibilidade e continuidade, mas não garantimos disponibilidade
                ininterrupta do serviço.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">
                3. Propriedade Intelectual
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Toda a identidade visual, layout, fluxos de navegação, textos, algoritmos
                de cálculo e estrutura do PrintLog são protegidos por direitos autorais.
                Não é permitido copiar, reproduzir, modificar ou realizar engenharia
                reversa da plataforma, total ou parcialmente, sem autorização expressa.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-sky-500" />
                4. Uso Responsável da Plataforma
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O usuário compromete-se a utilizar o PrintLog de forma ética e
                responsável. Não é permitido o uso de bots, scripts automatizados ou
                qualquer prática que possa comprometer a estabilidade, segurança ou
                desempenho da plataforma.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Em situações de uso abusivo ou que coloquem o sistema em risco, medidas
                preventivas poderão ser aplicadas, incluindo a suspensão temporária ou
                definitiva da conta.
            </p>
        </section>
    </div>
);

export const PRIVACY_CONTENT = (
    <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <ShieldCheck className="text-emerald-500" size={24} />
            <div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                    Privacidade é parte do projeto
                </p>
                <p className="text-xs text-zinc-500">
                    Sua farm, seus dados, seu controle.
                </p>
            </div>
        </div>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} className="text-sky-500" />
                1. Coleta e Proteção de Dados
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Coletamos apenas as informações necessárias para o funcionamento do
                PrintLog, como dados de conta, parâmetros de cálculo e históricos de uso.
                Não solicitamos informações sensíveis que não tenham relação direta com a
                operação da plataforma.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Dados críticos, como custos, margens e informações financeiras, são
                protegidos por criptografia de nível industrial (AES-256) antes mesmo de
                serem armazenados.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <EyeOff size={14} className="text-sky-500" />
                2. Compartilhamento de Informações
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog não vende, não compartilha e não comercializa dados de usuários
                com terceiros. Suas informações não são repassadas a fornecedores,
                parceiros comerciais ou anunciantes.
            </p>
        </section>

        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">
                3. Comunicação e E-mails
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Utilizamos seu e-mail exclusivamente para comunicações essenciais, como
                alertas do sistema, notificações importantes e recuperação de acesso.
                Você não receberá spam ou mensagens promocionais indesejadas.
            </p>
        </section>
    </div>
);
