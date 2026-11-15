/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Runs only inside the real Electron GUI process.
 * Refuses ELECTRON_RUN_AS_NODE. Does not compile (build: 'never').
 */

import { writeFileSync } from 'node:fs';
import { app } from 'electron';

export const T95_LLAMA_GUI_PROBE_FLAG = '--t95-llama-probe';

/**
 * @param {string[]} argv
 * @returns {Promise<number | null>} exit code when the flag is present
 */
export async function runT95LlamaGuiProbeIfRequested(argv) {
  if (!argv.includes(T95_LLAMA_GUI_PROBE_FLAG)) return null;
  if (process.env.ELECTRON_RUN_AS_NODE === '1') {
    const refused = {
      mode: 'refused',
      ok: false,
      guiProcessLoaded: false,
      error: 'probe refused because ELECTRON_RUN_AS_NODE is set'
    };
    writeReport(refused);
    console.error(JSON.stringify(refused));
    return 2;
  }

  const report = {
    mode: 'gui-process',
    ok: false,
    guiProcessLoaded: false,
    electronRunAsNode: process.env.ELECTRON_RUN_AS_NODE || '',
    isPackaged: app.isPackaged,
    execPath: process.execPath,
    versions: {
      electron: process.versions.electron || '',
      node: process.versions.node || '',
      modules: process.versions.modules || ''
    }
  };

  try {
    const { getLlama } = await import('node-llama-cpp');
    const llama = await getLlama({ gpu: false, build: 'never' });
    report.ok = Boolean(llama) && typeof llama === 'object';
    report.llamaType = typeof llama;
    report.guiProcessLoaded = report.ok && app.isPackaged;
    report.developerIdSigned = false;
    report.hardenedRuntimeVerified = false;
    report.notarized = false;
  } catch (err) {
    report.ok = false;
    report.guiProcessLoaded = false;
    report.error = String(err?.message || err);
    report.name = err?.name || '';
  }

  writeReport(report);
  console.log(JSON.stringify(report));
  return report.guiProcessLoaded ? 0 : 1;
}

function writeReport(report) {
  const out = process.env.FT_T95_LLAMA_PROBE_OUT;
  if (!out) return;
  writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
}
