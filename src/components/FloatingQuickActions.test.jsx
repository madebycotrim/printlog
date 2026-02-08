import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FloatingQuickActions from './FloatingQuickActions';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/dashboard', vi.fn()],
}));

describe('FloatingQuickActions', () => {
  const mockHandlers = {
    onNewFilament: vi.fn(),
    onNewPrinter: vi.fn(),
    onNewSupply: vi.fn(),
    onScan: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<FloatingQuickActions {...mockHandlers} />);
    // Note: Initially the button has no aria-label, so we might need to find by role "button" and verify it exists
    const buttons = screen.getAllByRole('button');
    // There should be at least one button (the trigger)
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens menu when trigger is clicked', async () => {
    render(<FloatingQuickActions {...mockHandlers} />);

    // Find the trigger button. Since we haven't added aria-label yet, we might need to find by the icon or just pick the last button
    // Or we can query by the absence of text.
    // However, for this TDD step, we know the button is there.
    // Let's rely on the fact we are going to add aria-label "Abrir ações rápidas"
    // But since this test runs BEFORE the implementation changes, it might fail if we look for the new aria-label.
    // So I will write the test assuming the DESIRED state (TDD).

    // This test is expected to fail initially or I should write it to pass after my changes.
    // I will write it for the improved version.

    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });
    fireEvent.click(trigger);

    expect(await screen.findByText('Ações Rápidas')).toBeInTheDocument();

    // Check if close button is focused (part of our plan)
    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('closes menu on Escape key', async () => {
    render(<FloatingQuickActions {...mockHandlers} />);
    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });
    fireEvent.click(trigger);

    await screen.findByText('Ações Rápidas');

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
        // Verify state change by checking the trigger button's aria-label
        // When closed, it should say "Abrir ações rápidas"
        expect(screen.getByRole('button', { name: /abrir ações rápidas/i })).toBeInTheDocument();

        // Also verify the menu container has aria-hidden="true"
        // Note: checking the text visibility directly can be flaky with some jsdom configurations regarding Tailwind classes
        // so checking the attribute logic is safer.
        const menuText = screen.queryByText('Ações Rápidas');
        // The text might still be in the DOM but the container should be hidden
        const menuContainer = menuText.closest('div[aria-hidden]');
        expect(menuContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
