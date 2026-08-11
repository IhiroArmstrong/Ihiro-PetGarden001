#!/usr/bin/env node
/**
 * Refresh last_heartbeat on this session's lock.
 *   cd focus-tiger && npm run session-lock:heartbeat
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { touchSessionHeartbeat } from './session-lock-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

const r = touchSessionHeartbeat(REPO_ROOT)
console.log(`[session-lock:heartbeat] ${r.ok ? 'OK' : 'FAIL'} — ${r.detail}`)
process.exit(r.ok ? 0 : 1)
