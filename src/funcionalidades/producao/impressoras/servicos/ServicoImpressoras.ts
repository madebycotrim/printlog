import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";

const MOCK_IMPRESSORAS: Impressora[] = [
    
];

class ServicoImpressorasLocal {
    async buscarImpressoras(): Promise<Impressora[]> {
        await new Promise((resolver) => setTimeout(resolver, 400));
        return [...MOCK_IMPRESSORAS];
    }

    async salvarImpressora(impressora: Impressora): Promise<Impressora> {
        await new Promise((resolver) => setTimeout(resolver, 500));
        const ehNova = !impressora.id;

        if (ehNova) {
            impressora.id = Date.now().toString();
            impressora.dataCriacao = new Date();
        }

        impressora.dataAtualizacao = new Date();

        return { ...impressora };
    }

    async excluirImpressora(_id: string): Promise<void> {
        await new Promise((resolver) => setTimeout(resolver, 600));
    }
}

export const servicoImpressoras = new ServicoImpressorasLocal();
