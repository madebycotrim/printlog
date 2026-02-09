import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from './Login';
import * as AuthContext from '../../../contexts/AuthContext';

// Mock dependencies
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
}));

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock assets
vi.mock('../../../assets/logo-branca.png', () => ({ default: 'logo.png' }));

describe('LoginPage', () => {
  beforeEach(() => {
    AuthContext.useAuth.mockReturnValue({
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      isSignedIn: false,
      isLoaded: true,
    });
  });

  it('renders login form elements', () => {
    render(<LoginPage />);

    // Check for inputs by placeholder (current state)
    expect(screen.getByPlaceholderText(/seu@office.com/i)).toBeInTheDocument();
    // Using regex for placeholder to be flexible
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: /Entrar na Oficina/i })).toBeInTheDocument();
  });

  it('inputs are accessible via labels', () => {
    render(<LoginPage />);

    // This is expected to FAIL currently because inputs are not associated with labels
    // Once fixed, we should be able to find inputs by their label text
    const emailInput = screen.getByLabelText(/E-mail de acesso/i);
    const passwordInput = screen.getByLabelText(/Sua senha/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('password toggle button has accessible name', () => {
    render(<LoginPage />);

    // This is expected to FAIL currently
    // We expect a button that toggles password visibility.
    // Initially showPassword is false, so we see Eye icon. The label should be "Exibir senha".
    const toggleButton = screen.getByLabelText(/Exibir senha/i);
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    // Now showPassword is true, so we see EyeOff icon. The label should be "Ocultar senha".
    expect(screen.getByLabelText(/Ocultar senha/i)).toBeInTheDocument();
  });
});
