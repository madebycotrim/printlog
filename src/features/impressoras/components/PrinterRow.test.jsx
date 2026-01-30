import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrinterRow } from './PrinterRow';

describe('PrinterRow', () => {
    const mockPrinter = {
        id: '123',
        nome: 'Printer 3000',
        marca: 'Bambu Lab',
        modelo: 'X1C',
        status: 'printing',
        horas_totais: 100,
        ultima_manutencao_hora: 0,
        intervalo_manutencao: 300,
        rendimento_total: 500
    };

    it('renders correctly and has accessible buttons', () => {
        render(<PrinterRow printer={mockPrinter} />);

        // Check for status button aria-label
        // Note: The label in obtainingConfiguracaoStatus for 'printing' is "Imprimindo"
        const statusButton = screen.getByLabelText(/Alterar status de Printer 3000: atualmente Imprimindo/i);
        expect(statusButton).toBeInTheDocument();

        // Check for action buttons aria-labels
        const diagButton = screen.getByLabelText(/Diagnóstico de Printer 3000/i);
        expect(diagButton).toBeInTheDocument();

        const editButton = screen.getByLabelText(/Editar Printer 3000/i);
        expect(editButton).toBeInTheDocument();

        const deleteButton = screen.getByLabelText(/Excluir Printer 3000/i);
        expect(deleteButton).toBeInTheDocument();
    });
});
