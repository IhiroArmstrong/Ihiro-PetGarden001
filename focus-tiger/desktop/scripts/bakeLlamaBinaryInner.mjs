/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */
import { getLlama } from 'node-llama-cpp';

const stamp = {
  mode: 'electron-run-as-node',
  electron: process.versions.electron,
  node: process.versions.node,
  modules: process.versions.modules
};

async function load(build) {
  return getLlama({ gpu: false, build });
}

try {
  try {
    await load('never');
    console.log(JSON.stringify({ ...stamp, stage: 'already-present', ok: true }));
  } catch (err) {
    const message = String(err?.message || err);
    console.log(JSON.stringify({ ...stamp, stage: 'compile', ok: false, message }));
    await load('force');
  }
  const llama = await load('never');
  if (!llama || typeof llama !== 'object') {
    throw new Error('getLlama(build:never) did not return the binding after pack-time compile');
  }
  console.log(JSON.stringify({ ...stamp, stage: 'node-mode-verified', ok: true, llamaType: typeof llama }));
} catch (err) {
  console.error(JSON.stringify({
    ...stamp,
    stage: 'node-mode-failed',
    ok: false,
    message: String(err?.message || err),
    name: err?.name || ''
  }));
  process.exit(1);
}
