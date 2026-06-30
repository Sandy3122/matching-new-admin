import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// When building for production the app is served from the matchingJodi
// Firebase hosting under the "/newadmin/" path. In dev it stays at root.
// Override with VITE_BASE_PATH if you deploy under a different path.
export default defineConfig(({ command }) => ({
  base: command === "build" ? process.env.VITE_BASE_PATH || "/newadmin/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
