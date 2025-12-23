// src/features/calculadora/logic/localHistory.js

const STORAGE_KEY = "calculadora_history_v2";

/* Helper para ID único */
function gerarId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9);
}

/* Parse seguro para evitar crash */
function parseSeguro(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ========================================================
   FUNÇÃO: LER (getHistory / readHistory)
   ======================================================== */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = parseSeguro(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((reg) => ({
      id: reg.id ?? reg.client_id ?? gerarId(),
      client_id: reg.client_id ?? reg.id,
      label: reg.label ?? "Projeto sem nome",
      timestamp: reg.timestamp ?? new Date(reg.created_at || Date.now()).toLocaleString(),
      created_at: reg.created_at ?? Date.now(),
      data: {
        entradas: reg.data?.inputs ?? reg.data?.entradas ?? {},
        resultados: reg.data?.results ?? reg.data?.resultados ?? {},
      },
    }));
  } catch (err) {
    console.error("Erro ao ler histórico:", err);
    return [];
  }
}

/* ========================================================
   FUNÇÃO: SOBRESCREVER (writeHistory / gravarHistorico)
   ======================================================== */
export function writeHistory(novaLista = []) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    return novaLista;
  } catch (err) {
    console.error("Erro ao gravar histórico:", err);
    return [];
  }
}

/* ========================================================
   FUNÇÃO: ADICIONAR (addHistoryEntry)
   ======================================================== */
export function addHistoryEntry({ label = "", entradas = {}, resultados = {} } = {}) {
  try {
    const atual = getHistory();

    const novoRegistro = {
      id: gerarId(),
      client_id: gerarId(),
      label: label || "Projeto sem nome",
      created_at: Date.now(),
      timestamp: new Date().toLocaleString('pt-BR'),
      data: {
        entradas: entradas,
        resultados: resultados,
      },
    };

    const novaLista = [novoRegistro, ...atual].slice(0, 100);
    writeHistory(novaLista);
    return novoRegistro;
  } catch (err) {
    console.error("Erro ao adicionar ao histórico:", err);
    return null;
  }
}

/* ========================================================
   FUNÇÃO: REMOVER (removeHistoryEntry)
   ======================================================== */
export function removeHistoryEntry(id) {
    try {
        const history = getHistory();
        const updated = history.filter(item => item.id !== id && item.client_id !== id);
        writeHistory(updated);
        return true;
    } catch (err) {
        console.error("Erro ao remover item:", err);
        return false;
    }
}

/* ========================================================
   FUNÇÃO: LIMPAR (clearHistory)
   ======================================================== */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Erro ao limpar histórico:", err);
  }
}

/* ========================================================
   ALIASES PARA COMPATIBILIDADE TOTAL
   Resolve os erros: 'readHistory', 'writeHistory', 'lerHistorico', etc.
   ======================================================== */
export const readHistory = getHistory;
export const lerHistorico = getHistory;
export const gravarHistorico = writeHistory;

export const adicionarAoHistorico = addHistoryEntry;
export const addHistoryRow = addHistoryEntry;

export const limparHistorico = clearHistory;

export const deleteHistoryEntry = removeHistoryEntry;
export const removeHistoryRow = removeHistoryEntry;