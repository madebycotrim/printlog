import { RegistroUso } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";

// Simulando persistência sintética para desenvolvimento
const MODELO_DADOS_USO: Record<string, RegistroUso[]> = {};

class ServicoUsoMateriais {
    /**
     * Registra um novo uso de material (seja por pedido, falha ou manual).
     * Implementa a Regra 5.0 (v9.0): Alerta de estoque baixo (< 200g - ALERTA_ESTOQUE_FILAMENTO_GRAMAS).
     */
    async registrarUso(idMaterial: string, dados: Omit<RegistroUso, "id" | "data">): Promise<RegistroUso> {
        await new Promise((resolver) => setTimeout(resolver, 400));

        const novoUso: RegistroUso = {
            ...dados,
            id: crypto.randomUUID(),
            data: new Date().toISOString(),
        };

        if (!MODELO_DADOS_USO[idMaterial]) {
            MODELO_DADOS_USO[idMaterial] = [];
        }
        MODELO_DADOS_USO[idMaterial].unshift(novoUso);

        registrar.info({ rastreioId: crypto.randomUUID(), idMaterial, quantidade: dados.quantidadeGastaGramas }, "Consumo de material registrado");

        return novoUso;
    }

    async buscarHistorico(idMaterial: string): Promise<RegistroUso[]> {
        await new Promise((resolver) => setTimeout(resolver, 300));
        return MODELO_DADOS_USO[idMaterial] || [];
    }

    /**
     * Verifica se o material atingiu o nível crítico de 200g (Regra 5.0).
     */
    deveAlertarEstoqueBaixo(pesoRestanteGramas: number): boolean {
        return pesoRestanteGramas < 200;
    }
}

export const servicoUsoMateriais = new ServicoUsoMateriais();
