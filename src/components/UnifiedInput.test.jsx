import { render, screen } from '@testing-library/react';
import { UnifiedInput } from './UnifiedInput';
import { describe, it, expect } from 'vitest';

describe('UnifiedInput', () => {
  it('associates label with input using htmlFor and id', () => {
    render(<UnifiedInput label="Email Address" type="email" />);

    // Check if the label exists
    const label = screen.getByText('Email Address');
    expect(label).toBeInTheDocument();

    // Check if the input exists and is associated
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('uses provided id if available', () => {
    render(<UnifiedInput label="Username" id="custom-id" />);

    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('sets aria-invalid when error is present', () => {
    render(<UnifiedInput label="Email" error="Invalid email" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('provides aria-labels for time inputs', () => {
    render(<UnifiedInput label="Duration" type="time" />);

    const hoursInput = screen.getByLabelText('Duration Horas');
    expect(hoursInput).toBeInTheDocument();
    expect(hoursInput).toHaveAttribute('placeholder', '00');

    const minutesInput = screen.getByLabelText('Duration Minutos');
    expect(minutesInput).toBeInTheDocument();
    expect(minutesInput).toHaveAttribute('placeholder', '00');
  });
});
