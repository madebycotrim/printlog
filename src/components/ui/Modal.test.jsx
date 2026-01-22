import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Modal from './Modal';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    X: () => <span data-testid="icon-x">X</span>,
    Loader2: () => <span data-testid="icon-loader">Loader</span>,
    Cpu: () => <span data-testid="icon-cpu">Cpu</span>,
    Fingerprint: () => <span data-testid="icon-fingerprint">Fingerprint</span>,
}));

describe('Modal', () => {
    const mockOnClose = vi.fn();

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders correctly with accessibility attributes', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
                subtitle="Test Subtitle"
            >
                <p>Modal Content</p>
            </Modal>
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

        const title = screen.getByText('Test Modal');
        expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('has a close button with correct aria-label', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <p>Content</p>
            </Modal>
        );

        const closeButton = screen.getByLabelText('Fechar modal');
        expect(closeButton).toBeInTheDocument();

        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
        render(
            <Modal
                isOpen={false}
                onClose={mockOnClose}
                title="Test Modal"
            >
                <p>Content</p>
            </Modal>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
