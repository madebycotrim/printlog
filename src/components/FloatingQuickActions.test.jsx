import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FloatingQuickActions from './FloatingQuickActions';
import * as wouter from 'wouter';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: vi.fn(),
}));

describe('FloatingQuickActions Accessibility', () => {
  const mockOnNewFilament = vi.fn();
  const mockOnNewPrinter = vi.fn();
  const mockOnNewSupply = vi.fn();
  const mockOnScan = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    wouter.useLocation.mockReturnValue(['/dashboard', vi.fn()]);
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 0));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders trigger button with accessible name', () => {
    render(
      <FloatingQuickActions
        onNewFilament={mockOnNewFilament}
        onNewPrinter={mockOnNewPrinter}
        onNewSupply={mockOnNewSupply}
        onScan={mockOnScan}
      />
    );

    const trigger = screen.getByRole('button', { name: /abrir ações rápidas|fechar ações rápidas/i });
    expect(trigger).toBeInTheDocument();
  });

  it('menu is hidden/inert when closed', () => {
    render(
      <FloatingQuickActions
        onNewFilament={mockOnNewFilament}
        onNewPrinter={mockOnNewPrinter}
        onNewSupply={mockOnNewSupply}
        onScan={mockOnScan}
      />
    );

    // We can't use getByRole for hidden elements easily if they are inert/hidden
    // But since we are asserting inert, let's find it by some other means or query logic
    // Actually, inert elements are NOT accessible to getByRole unless hidden: true is passed

    // Using querySelector to find the dialog div directly via class or ref if we could
    // But testing-library prefers roles.

    // We can find it by text content inside it?
    // Or just check that it is indeed inert.

    // Find by text inside the menu which is "Ações Rápidas"
    // Since it's hidden/inert, we must use hidden: true
    const menuTitle = screen.getByText('Ações Rápidas', { selector: 'span' });
    const dialog = menuTitle.closest('div[role="dialog"]');

    expect(dialog).not.toBeNull();
    // Check the property directly because we set it via ref callback
    expect(dialog.inert).toBe(true);
  });

  it('toggles aria-expanded on trigger', () => {
    render(
      <FloatingQuickActions
        onNewFilament={mockOnNewFilament}
        onNewPrinter={mockOnNewPrinter}
        onNewSupply={mockOnNewSupply}
        onScan={mockOnScan}
      />
    );

    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-label', 'Fechar ações rápidas');
  });

  it('manages focus when opening and closing', async () => {
    render(
      <FloatingQuickActions
        onNewFilament={mockOnNewFilament}
        onNewPrinter={mockOnNewPrinter}
        onNewSupply={mockOnNewSupply}
        onScan={mockOnScan}
      />
    );

    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });
    trigger.focus();

    // Open menu
    fireEvent.click(trigger);

    await waitFor(() => {
        const firstAction = screen.getByRole('menuitem', { name: /novo projeto/i });
        expect(document.activeElement).toBe(firstAction);
    });

    // Close menu via trigger - simulate user focusing trigger first to click it
    trigger.focus();
    fireEvent.click(trigger);

    await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
    });
  });

  it('closes on Escape and restores focus', async () => {
     render(
      <FloatingQuickActions
        onNewFilament={mockOnNewFilament}
        onNewPrinter={mockOnNewPrinter}
        onNewSupply={mockOnNewSupply}
        onScan={mockOnScan}
      />
    );

    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });
    fireEvent.click(trigger);

    // Wait for open
    await waitFor(() => {
        const firstAction = screen.getByRole('menuitem', { name: /novo projeto/i });
        expect(document.activeElement).toBe(firstAction);
    });

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(document.activeElement).toBe(trigger);
    });
  });
});
