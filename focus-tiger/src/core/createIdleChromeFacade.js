import { NarrowIdleShell } from '../ui/NarrowIdleShell.js';
import { WideIdleMoreMenu } from '../ui/WideIdleMoreMenu.js';
import { IdleChromeFacade } from './IdleChromeFacade.js';

/**
 * Product wiring: construct both presentation adapters + facade.
 *
 * @param {{
 *   root?: HTMLElement,
 *   getHudStateEl?: () => HTMLElement | null
 * }} [options]
 * @returns {IdleChromeFacade}
 */
export function createIdleChromeFacade(options = {}) {
  const narrow = new NarrowIdleShell({
    root: options.root,
    getHudStateEl: options.getHudStateEl
  });
  const wide = new WideIdleMoreMenu();
  return new IdleChromeFacade({ narrow, wide });
}
