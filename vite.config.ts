/// <reference types="vitest" />

<<<<<<< HEAD
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  server: {
    https: {
      key: fs.readFileSync("./localhost-key.pem"),
      cert: fs.readFileSync("./localhost.pem"),
    },
    port: 8100,
  },
=======
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  server: {
    port: 8100,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem'))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
>>>>>>> RamaKevin
});
