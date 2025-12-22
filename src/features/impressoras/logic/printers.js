import { parseNumber, generateUUID } from "../../../lib/format";

const KEY = "layerforge_printers_data";

// Helper interno para garantir que o que vai para o LocalStorage é sempre número puro
const safeNum = (v) => {
    const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
    return isNaN(n) ? 0 : n;
};

// --- LEITURA ---
export const getPrinters = () => {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(KEY);
        const parsed = data ? JSON.parse(data) : [];
        // Garantia de que sempre retornaremos um array
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Erro ao ler LocalStorage", e);
        return [];
    }
};

// --- SALVAR (Cria/Edita) ---
export const savePrinter = (printer) => {
    const list = getPrinters();
    
    // Higienização completa dos dados antes de salvar
    const safePrinter = {
        ...printer,
        name: printer.name?.trim() || "Nova Unidade",
        brand: printer.brand || "Genérica",
        model: printer.model || "FDM",
        power: safeNum(printer.power),
        price: safeNum(printer.price), // Adicionado tratamento financeiro
        yieldTotal: safeNum(printer.yieldTotal), // Adicionado tratamento financeiro
        maintenanceInterval: safeNum(printer.maintenanceInterval) || 300,
        totalHours: safeNum(printer.totalHours),
        lastMaintenanceHour: safeNum(printer.lastMaintenanceHour),
        history: Array.isArray(printer.history) ? printer.history : []
    };

    if (safePrinter.id) {
        // ATUALIZAR
        const index = list.findIndex(p => p.id === safePrinter.id);
        if (index > -1) {
            // Merge inteligente: preserva campos que não estão no form (como createdAt)
            list[index] = { ...list[index], ...safePrinter };
        }
    } else {
        // CRIAR
        const newPrinter = {
            ...safePrinter,
            id: generateUUID(),
            status: "idle",
            createdAt: new Date().toISOString(),
            lastMaintenanceHour: 0 // Nova máquina começa do zero
        };
        list.push(newPrinter);
    }

    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
};

// --- DELETAR ---
export const deletePrinter = (id) => {
    const list = getPrinters().filter(p => p.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
};

// --- RESETAR MANUTENÇÃO (Após o DiagnosticsModal) ---
export const resetMaintenance = (printerId) => {
    const list = getPrinters();
    const index = list.findIndex(p => p.id === printerId);
    
    if (index > -1) {
        // Sincroniza a última manutenção com a hora atual do horímetro
        list[index].lastMaintenanceHour = list[index].totalHours;
        
        // Adiciona uma entrada no histórico para auditoria
        const entry = {
            date: new Date().toISOString(),
            type: "PREVENTIVE",
            hour: list[index].totalHours
        };
        list[index].history = [entry, ...(list[index].history || [])];

        // Libera o status se estava travado
        if (list[index].status === 'maintenance' || list[index].status === 'error') {
            list[index].status = 'idle';
        }

        localStorage.setItem(KEY, JSON.stringify(list));
    }
    return list;
};

// --- ATUALIZAR STATUS ---
export const updateStatus = (printerId, newStatus) => {
    const list = getPrinters();
    const index = list.findIndex(p => p.id === printerId);
    
    if (index > -1) {
        list[index].status = newStatus;
        localStorage.setItem(KEY, JSON.stringify(list));
    }
    return list;
};