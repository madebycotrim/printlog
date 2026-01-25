
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './Login';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/login', vi.fn()],
}));

// Mock useAuth
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    isSignedIn: false,
    isLoaded: true,
  }),
}));

// Mock imported assets
vi.mock('../../../assets/logo-branca.png', () => ({
  default: 'logo.png',
}));

describe('LoginPage Accessibility', () => {
  it('should have accessible inputs and buttons', () => {
    render(<LoginPage />);

    // Verify inputs are accessible by label
    expect(screen.getByLabelText(/E-mail de acesso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sua senha/i)).toBeInTheDocument();

    // Verify password toggle button has accessible name
    // Initially showPassword is false, checking for likely aria-label content
    expect(screen.getByRole('button', { name: /Exibir senha|Ocultar senha/i })).toBeInTheDocument();
  });
});
