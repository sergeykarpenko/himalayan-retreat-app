import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";

interface Options extends Omit<RenderOptions, "wrapper"> {
  routerProps?: MemoryRouterProps;
}

export function renderWithProviders(ui: React.ReactElement, options: Options = {}) {
  const { routerProps, ...rest } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider attribute="class" defaultTheme="dark">
        <LanguageProvider>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </LanguageProvider>
      </ThemeProvider>
    ),
    ...rest,
  });
}
