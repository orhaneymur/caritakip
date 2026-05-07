"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// React 19 ve Next.js 15+ ile next-themes kullanırken ortaya çıkan zararsız 
// script uyarısını gizlemek için console.error'ı yamalıyoruz (monkey patch).
if (typeof console !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag while rendering React component")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
