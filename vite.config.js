import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Security headers for development server
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  build: {
    // Enable source maps for production debugging (consider disabling for extra security)
    sourcemap: false,
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          utils: ["axios"],
        },
      },
    },
  },
  // Environment variable handling
  envPrefix: "VITE_",
  // Define configuration
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
