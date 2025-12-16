import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

/**
 * Custom render function with all providers
 * Use this for components that need theme or other context
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Render without any providers
 * Use this for simple components that don't need context
 */
export { render } from '@testing-library/react';
