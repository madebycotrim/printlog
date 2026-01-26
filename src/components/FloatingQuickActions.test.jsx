import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FloatingQuickActions from './FloatingQuickActions';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: vi.fn(() => ['/dashboard', vi.fn()]),
}));

// Mock TourContext
vi.mock('../contexts/TourContext', () => ({
  useTour: () => ({
    startTour: vi.fn(),
  }),
}));

describe('FloatingQuickActions', () => {
  const mockProps = {
    onNewFilament: vi.fn(),
    onNewPrinter: vi.fn(),
    onNewSupply: vi.fn(),
  };

  it('renders trigger button with correct aria-label', () => {
    render(<FloatingQuickActions {...mockProps} />);

    // We can specifically look for the button with the expected label
    const triggerButton = screen.getByRole('button', { name: 'Abrir ações rápidas' });

    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveAttribute('aria-haspopup', 'true');
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens menu on click and changes aria-label', () => {
    render(<FloatingQuickActions {...mockProps} />);
    const triggerButton = screen.getByRole('button', { name: 'Abrir ações rápidas' });

    fireEvent.click(triggerButton);

    expect(triggerButton).toHaveAttribute('aria-label', 'Fechar ações rápidas');
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');

    // Check if menu content is visible
    // Note: checking visibility with opacity classes usually works with toBeVisible if loaded styles are processed,
    // but in JSDOM/Vitest without full CSS processing, it might rely on inline styles or specific attributes.
    // However, the class name change is what we rely on in code.
    // Let's check if the container has the open classes.
    const menuTitle = screen.getByText('Ações Rápidas');
    expect(menuTitle).toBeInTheDocument();

    // Since we are not testing CSS application in JSDOM perfectly, checking the state change via aria-expanded is a good proxy.
    // Also we can check if the overlay is present (it is conditionally rendered with &&)
    // The overlay has class 'fixed inset-0 ...'
    // We can try to find it.
    // But simplistic check: The logic sets isOpen=true.
  });

  it('closes menu on Escape key', () => {
    render(<FloatingQuickActions {...mockProps} />);
    const triggerButton = screen.getByRole('button', { name: 'Abrir ações rápidas' });

    fireEvent.click(triggerButton);
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('close button inside menu works and has aria-label', () => {
     render(<FloatingQuickActions {...mockProps} />);
     const triggerButton = screen.getByRole('button', { name: 'Abrir ações rápidas' });
     fireEvent.click(triggerButton);

     const closeButton = screen.getByRole('button', { name: 'Fechar menu' });
     expect(closeButton).toBeInTheDocument();

     fireEvent.click(closeButton);
     expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
  });
});
