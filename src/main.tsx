import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "./wagmiConfig";
import "@rainbow-me/rainbowkit/styles.css";
import App from "./App.tsx";
import "./index.css";

// Suppress benign Vite HMR WebSocket connection warnings in the preview iframe environment
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reasonStr = event.reason?.message || String(event.reason || "");
    if (
      reasonStr.includes("WebSocket") ||
      reasonStr.includes("websocket") ||
      reasonStr.includes("WebSocket closed without opened")
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener("error", (event) => {
    const errorMsg = event.message || "";
    if (errorMsg.includes("WebSocket") || errorMsg.includes("websocket")) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: "#0066FF",
            accentColorForeground: "white",
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
