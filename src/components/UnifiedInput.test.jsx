import { render, screen } from '@testing-library/react';
import { UnifiedInput } from './UnifiedInput';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('UnifiedInput', () => {
    it('renders input with label and associates them', () => {
        render(<UnifiedInput label="Email" type="email" />);
        // This expects the input to be associated with the label "Email"
        const input = screen.getByLabelText('Email');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'email');
    });

    it('renders with error state', () => {
        render(<UnifiedInput label="Email" error={true} />);
        const input = screen.getByLabelText('Email');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders time inputs with accessible labels', () => {
        render(<UnifiedInput label="Horário" type="time" />);
        expect(screen.getByLabelText('Horário - Horas')).toBeInTheDocument();
        expect(screen.getByLabelText('Horário - Minutos')).toBeInTheDocument();
    });

    it('renders select as combobox', () => {
        render(<UnifiedInput label="Opções" type="select" options={[]} />);
        const trigger = screen.getByRole('combobox');
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });
});
