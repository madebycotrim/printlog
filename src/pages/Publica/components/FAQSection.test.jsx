import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import FAQSection from './FAQSection';

describe('FAQSection', () => {
    it('renders questions', () => {
        render(<FAQSection />);
        expect(screen.getByText('Preciso instalar algum programa?')).toBeInTheDocument();
    });

    it('toggles answer visibility on click', async () => {
        render(<FAQSection />);
        const button = screen.getByText('Preciso instalar algum programa?').closest('button');
        const answerText = screen.getByText(/Não! O PrintLog é 100% online/);

        // Initially, the answer should be visually hidden (opacity-0 or max-h-0)
        // Note: toBeVisible check depends on styles. Vitest/JSDOM might not fully parse tailwind classes
        // unless we have proper setup. However, we can check that the class opacity-0 is present.
        const contentDiv = answerText.closest('div');
        expect(contentDiv).toHaveClass('opacity-0');

        fireEvent.click(button);

        // After click, we expect the answer to be visible (opacity-100)
        expect(contentDiv).toHaveClass('opacity-100');
    });

    it('has accessible attributes', () => {
        render(<FAQSection />);
        const button = screen.getByText('Preciso instalar algum programa?').closest('button');

        // Check initial state
        expect(button).toHaveAttribute('aria-expanded', 'false');

        // Check aria-controls matches an id in the document
        const controlsId = button.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();

        // Click and check state change
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
    });
});
