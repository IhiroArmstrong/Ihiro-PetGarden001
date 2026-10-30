/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import phaseASummary from '../../../fixtures/mindflow-nebula-step2-phase-a-summary.json' with { type: 'json' };
import { readMindflowNebulaStep2PhaseAPassed } from './mindflowNebulaStep2PhaseAEval.js';

/**
 * Phase B/C runtime gate — false until lab summary JSON is updated with pass.
 */
export function isMindflowNebulaStep2PhaseAPassed() {
  return readMindflowNebulaStep2PhaseAPassed(phaseASummary);
}
