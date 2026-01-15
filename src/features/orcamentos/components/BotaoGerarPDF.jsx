import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown, Loader2 } from 'lucide-react';
import { DocumentoOrcamento } from './DocumentoOrcamento';
import { useUser } from '@clerk/clerk-react';

export default function BotaoGerarPDF({ projeto, cliente }) {
    const { user } = useUser();

    // Se não tiver projeto ou dados, não renderiza
    if (!projeto) return null;

    const fileName = `Orcamento_${projeto.data?.label || 'PrintLog'}_${new Date().toISOString().slice(0, 10)}.pdf`;

    return (
        <PDFDownloadLink
            document={<DocumentoOrcamento projeto={projeto} cliente={cliente} user={user} />}
            fileName={fileName}
        >
            {({ blob, url, loading, error }) => (
                <button
                    disabled={loading}
                    className="p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                    title="Baixar Orçamento (PDF)"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                </button>
            )}
        </PDFDownloadLink>
    );
}
