import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Estilos
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E4E7',
        paddingBottom: 20
    },
    logo: {
        width: 100,
        height: 40,
        objectFit: 'contain'
    },
    titleDetails: {
        flexDirection: 'col',
        alignItems: 'flex-end'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#09090B',
        marginBottom: 4
    },
    subtitle: {
        fontSize: 10,
        color: '#71717A'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    grid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20
    },
    column: {
        flex: 1
    },
    label: {
        fontSize: 8,
        color: '#71717A',
        textTransform: 'uppercase',
        marginBottom: 2,
        fontWeight: 'bold'
    },
    value: {
        fontSize: 10,
        color: '#09090B'
    },
    table: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E4E4E7',
        borderRadius: 4
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E4E4E7',
        padding: 8,
        alignItems: 'center'
    },
    tableHeader: {
        backgroundColor: '#F4F4F5'
    },
    tableCell: {
        fontSize: 9,
        color: '#09090B'
    },
    totalSection: {
        marginTop: 20,
        alignItems: 'flex-end'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginBottom: 5
    },
    totalLabel: {
        fontSize: 10,
        color: '#71717A'
    },
    totalValue: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#09090B'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#A1A1AA',
        borderTopWidth: 1,
        borderTopColor: '#E4E4E7',
        paddingTop: 10
    }
});

const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

export const DocumentoOrcamento = ({ projeto, cliente, user }) => {
    const data = projeto.data || {};
    const ent = data.entradas || {};
    const res = data.resultados || {};

    // Calcula totais
    const precoBase = res.precoSugerido || 0;
    const desconto = res.precoSugerido - (res.precoComDesconto || 0);
    const final = res.precoComDesconto || 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        {/* <Image src="/logo-colorida.png" style={styles.logo} /> */}
                        {/* Imagem pode ser problemática se não tiver path absoluto ou base64, usando Texto por enquanto */}
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>PRINTLOG</Text>
                    </View>
                    <View style={styles.titleDetails}>
                        <Text style={styles.title}>ORÇAMENTO</Text>
                        <Text style={styles.subtitle}>#{String(projeto.id).slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.subtitle}>{new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.grid}>
                    <View style={styles.column}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#27272A' }}>CLIENTE</Text>
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>NOME / EMPRESA</Text>
                            <Text style={styles.value}>{cliente?.nome || ent.clienteNome || "Cliente Final"}</Text>
                            {cliente?.empresa && <Text style={{ fontSize: 9, color: '#52525B' }}>{cliente.empresa}</Text>}
                        </View>
                        <View>
                            <Text style={styles.label}>CONTATO</Text>
                            <Text style={styles.value}>{cliente?.email || "-"}</Text>
                            <Text style={styles.value}>{cliente?.telefone || "-"}</Text>
                        </View>
                    </View>
                    <View style={styles.column}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#27272A' }}>FORNECEDOR</Text>
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>NOME</Text>
                            <Text style={styles.value}>{user?.fullName || "Oficina de Impressão 3D"}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>EMAIL</Text>
                            <Text style={styles.value}>{user?.primaryEmailAddress?.emailAddress || "-"}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { flex: 3 }]}>DESCRIÇÃO</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>QTD</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>UNITÁRIO</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>TOTAL</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <View style={{ flex: 3 }}>
                            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{ent.nomeProjeto || "Projeto Personalizado"}</Text>
                            <Text style={{ fontSize: 8, color: '#52525B', marginTop: 2 }}>
                                Impressão 3D • {ent.material?.material || "PLA"} • {Math.round(ent.material?.pesoModelo)}g • {Math.round(ent.tempo?.impressaoHoras)}h{ent.tempo?.impressaoMinutos}m
                            </Text>
                        </View>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{ent.qtdPecas || 1}</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(final / (ent.qtdPecas || 1))}</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(final)}</Text>
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.value}>{formatCurrency(precoBase)}</Text>
                    </View>
                    {desconto > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Desconto</Text>
                            <Text style={[styles.value, { color: '#EF4444' }]}>- {formatCurrency(desconto)}</Text>
                        </View>
                    )}
                    <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#E4E4E7', paddingTop: 5, marginTop: 5 }]}>
                        <Text style={[styles.totalLabel, { fontSize: 12, fontWeight: 'bold', color: '#09090B' }]}>TOTAL</Text>
                        <Text style={[styles.totalValue, { fontSize: 16 }]}>{formatCurrency(final)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Este orçamento é válido por 7 dias. Obrigado pela preferência!
                </Text>
            </Page>
        </Document>
    );
};
