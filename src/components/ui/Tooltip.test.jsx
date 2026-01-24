import React from 'react';
import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';
import { describe, it, expect } from 'vitest';

describe('Tooltip', () => {
    it('renders and is accessible via keyboard', () => {
        const helpText = "Helpful information";
        render(<Tooltip text={helpText} />);

        // This query expects the element to have role="button" and aria-label="Helpful information"
        const trigger = screen.getByRole('button', { name: helpText });

        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveAttribute('tabIndex', '0');

        // Check for visual focus ring classes
        expect(trigger.className).toContain('focus-visible:ring-2');
        expect(trigger.className).toContain('focus-visible:ring-sky-500');
    });
});
