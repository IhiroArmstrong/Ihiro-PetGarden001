import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Match TEST_TRACKER / Playwright (`127.0.0.1:5173`); default Vite `localhost` is IPv6-only on macOS.
    host: '127.0.0.1',
    port: 5173,
  },
});
