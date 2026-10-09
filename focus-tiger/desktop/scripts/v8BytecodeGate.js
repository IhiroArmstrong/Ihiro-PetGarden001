/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * V8 bytecode is tied to the exact V8 that will load it.
 * Compiling with system Node and shipping into Electron bricks startup.
 */

/**
 * @param {{ electron?: string }} versions
 */
export function bytecodeCompileRefusal(versions) {
  if (versions && typeof versions.electron === 'string' && versions.electron) {
    return null;
  }
  return 'Refusing to compile V8 bytecode outside Electron. Run: npm run bytecode:compile';
}
