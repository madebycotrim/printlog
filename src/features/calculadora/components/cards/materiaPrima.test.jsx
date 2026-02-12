import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useCalculatorStore } from '../../../../stores/calculatorStore';
import { useFilamentos } from '../../../filamentos/logic/consultasFilamento';
import MaterialModule from './materiaPrima';

// Mock dependencies
vi.mock('../../../../stores/calculatorStore', () => ({
  useCalculatorStore: vi.fn(),
}));

vi.mock('../../../filamentos/logic/consultasFilamento', () => ({
  useFilamentos: vi.fn(),
}));

// Mock UnifiedInput to ensure it passes props correctly
// Actually, we want to test that UnifiedInput renders the props we pass.
// So we should mock it or use the real one. Using the real one is better integration test.
// But let's mock the complex internals like Tooltip.

vi.mock('../../../../components/ui/Tooltip', () => ({
  Tooltip: ({ text }) => <div data-testid="tooltip">{text}</div>,
}));

// Mock ModalSelecaoFilamento as it's not the focus
vi.mock('../../../filamentos/components/ModalSelecaoFilamento', () => ({
  default: () => <div data-testid="modal-selecao" />,
}));

describe('MaterialModule Accessibility', () => {
  const mockAtualizarCampo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useCalculatorStore.mockReturnValue({
      dadosFormulario: {
        material: {
          custoRolo: "100",
          pesoModelo: "1000",
          idFilamentoSelecionado: "manual",
          slots: [
            // One manual slot for testing
            { id: 'manual', name: 'Test Material', weight: '50', priceKg: '100', unit: 'g' }
          ]
        }
      },
      atualizarCampo: mockAtualizarCampo,
    });

    useFilamentos.mockReturnValue({
      data: [], // No filaments in stock for this test
      isLoading: false,
    });
  });

  it('renders input fields', () => {
    render(<MaterialModule />);
    // Check if inputs are rendered by value
    expect(screen.getByDisplayValue('Test Material')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('renders accessible names for inputs (fails until fixed)', () => {
    render(<MaterialModule />);

    const nameInput = screen.getByDisplayValue('Test Material');
    // We expect this to fail initially or succeed if we fix it.
    // For TDD, we assert what we WANT.
    // Since I haven't fixed it yet, this test will fail if I run it now.
    // But I will run it to confirm failure.

    // Note: UnifiedInput renders the input. We need to check if the input element has aria-label.
    // Since we didn't mock UnifiedInput, it renders the real component.

    // Check Name Input
    expect(nameInput).toHaveAttribute('aria-label', 'Nome do material');

    // Check Weight Input
    const weightInput = screen.getByDisplayValue('50');
    expect(weightInput).toHaveAttribute('aria-label', 'Peso em g');

    // Check Price Input
    const priceInput = screen.getByDisplayValue('100');
    expect(priceInput).toHaveAttribute('aria-label', 'Preço por Kg');
  });

  it('renders accessible names for buttons (fails until fixed)', () => {
    render(<MaterialModule />);

    // Remove Button
    // Finding by title is a fallback. We prefer finding by role="button" and name="Remover".
    // But currently it only has title.
    const removeBtn = screen.getByTitle('Remover');
    expect(removeBtn).toHaveAttribute('aria-label', 'Remover item');

    // Import Button
    const importBtn = screen.getByTitle('Importar do Estoque');
    expect(importBtn).toHaveAttribute('aria-label', 'Importar do Estoque');

    // Add Manual Button
    const addBtn = screen.getByTitle('Adicionar Manualmente');
    expect(addBtn).toHaveAttribute('aria-label', 'Adicionar Manualmente');
  });
});
