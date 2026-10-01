#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Playwright webServer entry (`FT_E2E_PORT=5199`).
 * Same streaming server as `e2e-static-server.js` — do not fork a second copy.
 */
import { startE2eStaticServer } from './e2e-static-server.js';

startE2eStaticServer();
