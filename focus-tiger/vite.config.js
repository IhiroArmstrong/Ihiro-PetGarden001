/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(rootDir, 'package.json'), 'utf8')
);

const buildId =
  process.env.FT_BUILD_ID ||
  (process.env.GITHUB_SHA ? String(process.env.GITHUB_SHA).slice(0, 12) : '') ||
  `local-${Date.now()}`;

const versionManifest = {
  version: String(pkg.version || '0.0.0'),
  buildId
};

const versionJsonBody = `${JSON.stringify(versionManifest, null, 2)}\n`;

/**
 * Emit / serve version.json and inject build id for soft-update checks.
 */
function focusTigerVersionPlugin() {
  return {
    name: 'focus-tiger-version-json',
    config() {
      return {
        define: {
          'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(
            versionManifest.buildId
          ),
          'import.meta.env.VITE_APP_VERSION': JSON.stringify(
            versionManifest.version
          )
        }
      };
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = String(req.url || '').split('?')[0];
        if (pathname !== '/version.json') {
          next();
          return;
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(versionJsonBody);
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: versionJsonBody
      });
    }
  };
}

export default defineConfig({
  plugins: [focusTigerVersionPlugin()],
  server: {
    // Match TEST_TRACKER / Playwright (`127.0.0.1:5173`); default Vite `localhost` is IPv6-only on macOS.
    host: '127.0.0.1',
    port: 5173
  }
});
