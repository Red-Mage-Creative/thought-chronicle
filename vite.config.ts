import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Define environment variables for different environments
  define: {
    // Default API URL for development
    __BUILDSHIP_API_URL__: JSON.stringify(
      process.env.VITE_BUILDSHIP_API_URL || 'https://xn93r8.buildship.run'
    ),
  },
}));
