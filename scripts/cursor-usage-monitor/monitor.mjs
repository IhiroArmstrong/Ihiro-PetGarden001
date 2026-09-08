#!/usr/bin/env node
/**
 * Cursor usage CSV monitor — reads Dashboard exports, checks thresholds, sends webhooks.
 *
 * Usage:
 *   node monitor.mjs [--config path/to/config.json] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_CONFIG = {
  csvSource: {
    localPath: null,
    url: null,
    urlHeaders: {}
  },
  thresholds: {
    singleRecordTokens: 1_000_000,
    hourlyCostUsd: 5,
    hourlyWindowMs: 3_600_000,
    hourlyAlertCooldownMs: 3_600_000
  },
  webhook: {
    url: 'https://example.com/webhook/placeholder',
    timeoutMs: 15_000
  },
  stateFile: './state.json',
  costField: 'costToYou'
}

function parseArgs(argv) {
  const args = { configPath: null, dryRun: false }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') {
      args.dryRun = true
    } else if (arg === '--config' && argv[i + 1]) {
      args.configPath = argv[i + 1]
      i += 1
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return args
}

function printHelp() {
  console.log(`Cursor Usage Monitor

Usage:
  node monitor.mjs [--config path/to/config.json] [--dry-run]

Options:
  --config   Path to JSON config (default: ./config.json, else config.example.json)
  --dry-run  Evaluate thresholds and print alerts without webhook or state writes
  --help     Show this message
`)
}

function loadConfig(configPath) {
  const candidates = configPath
    ? [path.resolve(configPath)]
    : [
        path.join(__dirname, 'config.json'),
        path.join(__dirname, 'config.example.json')
      ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, 'utf8')
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        csvSource: { ...DEFAULT_CONFIG.csvSource, ...parsed.csvSource },
        thresholds: { ...DEFAULT_CONFIG.thresholds, ...parsed.thresholds },
        webhook: { ...DEFAULT_CONFIG.webhook, ...parsed.webhook }
      }
    }
  }

  throw new Error(
    `No config file found. Copy config.example.json to config.json and edit it.\nTried: ${candidates.join(', ')}`
  )
}

function resolveStatePath(config) {
  const stateFile = config.stateFile || DEFAULT_CONFIG.stateFile
  if (path.isAbsolute(stateFile)) return stateFile
  return path.resolve(__dirname, stateFile)
}

function loadState(statePath) {
  if (!fs.existsSync(statePath)) {
    return {
      lastProcessedTimestamp: null,
      lastHourlyAlert: null
    }
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'))
    return {
      lastProcessedTimestamp: parsed.lastProcessedTimestamp ?? null,
      lastHourlyAlert: parsed.lastHourlyAlert ?? null
    }
  } catch (err) {
    throw new Error(`Failed to read state file ${statePath}: ${err.message}`)
  }
}

function saveState(statePath, state) {
  const dir = path.dirname(statePath)
  fs.mkdirSync(dir, { recursive: true })
  const tmp = `${statePath}.tmp-${process.pid}`
  fs.writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  fs.renameSync(tmp, statePath)
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      values.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  values.push(current)
  return values
}

function parseCost(value) {
  if (!value) return 0
  const trimmed = String(value).trim()
  if (!trimmed || /^included$/i.test(trimmed)) return 0
  const cleaned = trimmed.replace(/[$,]/g, '')
  const num = Number.parseFloat(cleaned)
  return Number.isFinite(num) ? num : 0
}

function parseCursorCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length === 0) return []

  const headers = parseCsvLine(lines[0]).map((h) => h.trim())
  const records = []

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i])
    const record = {}
    headers.forEach((header, idx) => {
      record[header] = values[idx] ?? ''
    })

    const dateStr = record.Date || record.date || ''
    const model = (record.Model || record.model || '').trim()
    if (!dateStr || !model) continue

    const date = new Date(dateStr)
    const timestamp = Number.isNaN(date.getTime()) ? 0 : date.getTime()
    const totalTokens = Number.parseInt(record['Total Tokens'] || record.totalTokens || '0', 10) || 0
    const apiCost = parseCost(record.Cost || record['API Cost'] || '0')
    const costToYou = parseCost(record['Cost to you'] || record.costToYou || '0')

    records.push({
      date: dateStr,
      timestamp,
      model,
      totalTokens,
      apiCost,
      costToYou,
      raw: record
    })
  }

  return records.sort((a, b) => a.timestamp - b.timestamp)
}

async function loadCsvText(config) {
  const { localPath, url, urlHeaders } = config.csvSource

  if (url) {
    const response = await fetch(url, {
      headers: urlHeaders || {}
    })
    if (!response.ok) {
      throw new Error(`Failed to download CSV (${response.status} ${response.statusText})`)
    }
    return response.text()
  }

  if (localPath) {
    const resolved = path.resolve(localPath)
    if (!fs.existsSync(resolved)) {
      throw new Error(`CSV file not found: ${resolved}`)
    }
    return fs.readFileSync(resolved, 'utf8')
  }

  throw new Error('Configure csvSource.localPath or csvSource.url in config.json')
}

function pickCost(record, costField) {
  if (costField === 'apiCost') return record.apiCost
  if (costField === 'max') return Math.max(record.costToYou, record.apiCost)
  return record.costToYou || record.apiCost
}

function formatUsd(amount) {
  return `$${amount.toFixed(4)}`
}

function formatTokens(count) {
  return count.toLocaleString('en-US')
}

async function sendWebhook(webhookConfig, payload, dryRun) {
  if (dryRun) {
    console.log('[dry-run] webhook payload:', JSON.stringify(payload, null, 2))
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), webhookConfig.timeoutMs || 15_000)

  try {
    const response = await fetch(webhookConfig.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Webhook failed (${response.status}): ${body.slice(0, 300)}`)
    }
  } finally {
    clearTimeout(timeout)
  }
}

function buildAlertPayload(type, details) {
  return {
    source: 'cursor-usage-monitor',
    type,
    timestamp: new Date().toISOString(),
    message: details.message,
    details
  }
}

function evaluateAlerts({ records, config, state, dryRun }) {
  const alerts = []
  const lastProcessedMs = state.lastProcessedTimestamp
    ? Date.parse(state.lastProcessedTimestamp)
    : null

  const newRecords =
    lastProcessedMs == null || Number.isNaN(lastProcessedMs)
      ? records
      : records.filter((r) => r.timestamp > lastProcessedMs)

  const tokenThreshold = config.thresholds.singleRecordTokens

  for (const record of newRecords) {
    if (record.totalTokens > tokenThreshold) {
      const cost = pickCost(record, config.costField)
      alerts.push({
        kind: 'single_record_tokens',
        record,
        payload: buildAlertPayload('single_record_tokens', {
          message: `Single request exceeded token threshold: ${formatTokens(record.totalTokens)} tokens (${record.model})`,
          date: record.date,
          model: record.model,
          totalTokens: record.totalTokens,
          costUsd: cost,
          thresholdTokens: tokenThreshold
        })
      })
    }
  }

  const now = Date.now()
  const windowMs = config.thresholds.hourlyWindowMs
  const windowStart = now - windowMs
  const recordsInWindow = records.filter(
    (r) => r.timestamp >= windowStart && r.timestamp <= now
  )
  const hourlyTotal = recordsInWindow.reduce(
    (sum, r) => sum + pickCost(r, config.costField),
    0
  )
  const hourlyThreshold = config.thresholds.hourlyCostUsd

  if (hourlyTotal > hourlyThreshold) {
    const prevAlert = state.lastHourlyAlert
    const cooldownMs = config.thresholds.hourlyAlertCooldownMs
    const hasNewSpendSinceLastAlert =
      prevAlert == null || hourlyTotal > prevAlert.sum + 0.0001
    const cooldownExpired =
      prevAlert == null || now - Date.parse(prevAlert.at) >= cooldownMs
    const hasNewRecordsInWindow = newRecords.some(
      (r) => r.timestamp >= windowStart && r.timestamp <= now
    )

    if (
      hasNewRecordsInWindow &&
      (hasNewSpendSinceLastAlert || cooldownExpired)
    ) {
      alerts.push({
        kind: 'hourly_cost',
        hourlyTotal,
        recordsInWindow: recordsInWindow.length,
        payload: buildAlertPayload('hourly_cost', {
          message: `Rolling ${Math.round(windowMs / 60_000)}m spend exceeded threshold: ${formatUsd(hourlyTotal)}`,
          windowStart: new Date(windowStart).toISOString(),
          windowEnd: new Date(now).toISOString(),
          totalCostUsd: hourlyTotal,
          thresholdUsd: hourlyThreshold,
          recordCount: recordsInWindow.length
        })
      })
    }
  }

  return { alerts, newRecords, hourlyTotal, recordsInWindow: recordsInWindow.length }
}

async function main() {
  const args = parseArgs(process.argv)
  const configPathUsed = args.configPath
    ? path.resolve(args.configPath)
    : fs.existsSync(path.join(__dirname, 'config.json'))
      ? path.join(__dirname, 'config.json')
      : path.join(__dirname, 'config.example.json')

  const config = loadConfig(args.configPath)
  const statePath = resolveStatePath(config)
  const state = loadState(statePath)

  console.log(`[cursor-usage-monitor] config: ${configPathUsed}`)
  console.log(`[cursor-usage-monitor] state: ${statePath}`)
  if (args.dryRun) console.log('[cursor-usage-monitor] dry-run mode (no webhook/state writes)')

  const csvText = await loadCsvText(config)
  const records = parseCursorCsv(csvText)
  console.log(`[cursor-usage-monitor] parsed ${records.length} record(s)`)

  if (records.length === 0) {
    console.log('[cursor-usage-monitor] no records to process')
    return
  }

  const { alerts, newRecords, hourlyTotal, recordsInWindow } = evaluateAlerts({
    records,
    config,
    state,
    dryRun: args.dryRun
  })

  console.log(
    `[cursor-usage-monitor] new records since checkpoint: ${newRecords.length}; rolling window spend: ${formatUsd(hourlyTotal)} (${recordsInWindow} rows)`
  )

  for (const alert of alerts) {
    console.log(`[cursor-usage-monitor] ALERT ${alert.kind}: ${alert.payload.message}`)
    await sendWebhook(config.webhook, alert.payload, args.dryRun)
  }

  if (alerts.length === 0) {
    console.log('[cursor-usage-monitor] no alerts triggered')
  }

  const maxTimestamp = Math.max(...records.map((r) => r.timestamp))
  const nextState = {
    lastProcessedTimestamp: new Date(maxTimestamp).toISOString(),
    lastHourlyAlert: state.lastHourlyAlert
  }

  const hourlyAlert = alerts.find((a) => a.kind === 'hourly_cost')
  if (hourlyAlert) {
    nextState.lastHourlyAlert = {
      at: new Date().toISOString(),
      sum: hourlyAlert.hourlyTotal
    }
  }

  if (!args.dryRun) {
    saveState(statePath, nextState)
    console.log(
      `[cursor-usage-monitor] checkpoint updated: ${nextState.lastProcessedTimestamp}`
    )
  }
}

main().catch((err) => {
  console.error(`[cursor-usage-monitor] ERROR: ${err.message}`)
  process.exit(1)
})
