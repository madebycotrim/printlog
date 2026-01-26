import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FloatingQuickActions from './FloatingQuickActions';
import { useLocation } from 'wouter';
import { useTour } from '../contexts/TourContext';

// Mock dependencies
vi.mock('wouter', () => ({
    useLocation: vi.fn(),
}));

vi.mock('../contexts/TourContext', () => ({
    useTour: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Calculator: () => <span data-testid="icon-calculator">Calculator</span>,
    Package: () => <span data-testid="icon-package">Package</span>,
    Printer: () => <span data-testid="icon-printer">Printer</span>,
    Box: () => <span data-testid="icon-box">Box</span>,
    HelpCircle: () => <span data-testid="icon-help">HelpCircle</span>,
    Zap: () => <span data-testid="icon-zap">Zap</span>,
    X: () => <span data-testid="icon-x">X</span>,
}));

describe('FloatingQuickActions', () => {
    const mockSetLocation = vi.fn();
    const mockStartTour = vi.fn();
    const mockOnNewFilament = vi.fn();
    const mockOnNewPrinter = vi.fn();
    const mockOnNewSupply = vi.fn();

    beforeEach(() => {
        // Default mocks
        useLocation.mockReturnValue(['/', mockSetLocation]);
        useTour.mockReturnValue({ startTour: mockStartTour });
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the trigger button with correct accessibility attributes when closed', () => {
        render(
            <FloatingQuickActions
                onNewFilament={mockOnNewFilament}
                onNewPrinter={mockOnNewPrinter}
                onNewSupply={mockOnNewSupply}
            />
        );

        const button = screen.getByLabelText('Abrir ações rápidas');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).toHaveAttribute('aria-controls', 'quick-actions-menu');
    });

    it('opens the menu when clicked and updates accessibility attributes', () => {
        render(
            <FloatingQuickActions
                onNewFilament={mockOnNewFilament}
                onNewPrinter={mockOnNewPrinter}
                onNewSupply={mockOnNewSupply}
            />
        );

        const button = screen.getByLabelText('Abrir ações rápidas');
        fireEvent.click(button);

        expect(button).toHaveAttribute('aria-label', 'Fechar ações rápidas');
        expect(button).toHaveAttribute('aria-expanded', 'true');

        const menu = screen.getByRole('dialog');
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute('aria-label', 'Ações Rápidas');
        expect(menu).toHaveAttribute('aria-modal', 'true');
    });

    it('has a close button inside the menu with correct aria-label', () => {
        render(
            <FloatingQuickActions
                onNewFilament={mockOnNewFilament}
                onNewPrinter={mockOnNewPrinter}
                onNewSupply={mockOnNewSupply}
            />
        );

        // Open menu
        fireEvent.click(screen.getByLabelText('Abrir ações rápidas'));

        const closeButton = screen.getByLabelText('Fechar menu');
        expect(closeButton).toBeInTheDocument();
    });

    it('does not render on pages other than / and /dashboard', () => {
        useLocation.mockReturnValue(['/other-page', mockSetLocation]);

        render(
            <FloatingQuickActions
                onNewFilament={mockOnNewFilament}
                onNewPrinter={mockOnNewPrinter}
                onNewSupply={mockOnNewSupply}
            />
        );

        expect(screen.queryByLabelText(/ações rápidas/i)).not.toBeInTheDocument();
    });
});
