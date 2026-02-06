import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import QuickActionsDock from './FloatingQuickActions';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/dashboard', vi.fn()],
}));

describe('QuickActionsDock', () => {
  it('has accessible attributes', () => {
    render(
      <QuickActionsDock
        onNewFilament={() => {}}
        onNewPrinter={() => {}}
        onNewSupply={() => {}}
        onScan={() => {}}
      />
    );

    // Check trigger button accessibility
    // We expect the button to have an accessible name "Ações rápidas"
    const triggerBtn = screen.getByRole('button', { name: /ações rápidas/i });
    expect(triggerBtn).toBeInTheDocument();
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
    expect(triggerBtn).toHaveAttribute('aria-controls', 'quick-actions-menu');

    // Open menu
    fireEvent.click(triggerBtn);

    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');

    // Check menu accessibility
    const menu = screen.getByRole('dialog', { name: /ações rápidas/i });
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute('aria-modal', 'true');
    expect(menu).toHaveAttribute('id', 'quick-actions-menu');

    // Check close button accessibility
    const closeBtn = screen.getByRole('button', { name: /fechar menu/i });
    expect(closeBtn).toBeInTheDocument();
  });
});
