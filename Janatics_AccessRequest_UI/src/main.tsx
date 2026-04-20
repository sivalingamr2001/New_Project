import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { AppProvider } from "@/providers/app-provider.tsx"
import { AuthProvider } from "@/providers/auth-provider.tsx"
import { ThemeProvider } from "@/providers/theme-provider.tsx"
import { TooltipProvider } from "./shared/components/ui/tooltip.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </AppProvider>
  </StrictMode>
)
