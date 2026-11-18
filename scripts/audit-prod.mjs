#!/usr/bin/env node
//
// `npm audit` of the production dependencies that fails on any high or critical
// advisory, except the ones listed in ALLOWED below. `npm audit` itself can't skip
// a single advisory, and these have no fix the project can take yet.
//
// Runs as `npm run audit:prod`, locally and in CI's "Audit production dependencies"
// job. It reads the lockfile only, so it needs no `npm ci`, and no packages.
//
import { spawnSync } from 'node:child_process'

// Advisory ID -> why it is accepted. Remove an entry once the fix is in; the
// script says when an entry no longer matches anything.
const ALLOWED = {
  'GHSA-mrhx-c7xc-m3w5':
    'Zod < 4.6.6 can exhaust memory validating oversized collections. Fixed only in Zod 4; ' +
    '@vee-validate/zod 4.15 needs Zod 3 (spec: move to VeeValidate 5 + Zod 4 once v5 is stable). ' +
    'Zod only validates form input in the admin’s own browser tab.',
  'GHSA-fc5q-39xc-vjpf':
    'picomatch <= 4.0.7 has a ReDoS on crafted glob patterns, and 4.0.7 is the newest release. ' +
    'Vue Router 5 depends on it only for its file-based routing build plugin, which this project ' +
    'does not use (spec: routes are defined per feature), so it is not in the browser bundle. ' +
    'npm’s only suggestion is going back to Vue Router 4.',
}

const BLOCKING = new Set(['high', 'critical'])

const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  // npm is npm.cmd on Windows
  shell: process.platform === 'win32',
})

let report
try {
  report = JSON.parse(result.stdout)
} catch {
  console.error(result.stderr || result.stdout || result.error?.message)
  console.error('FATAL: npm audit did not return a report.')
  process.exit(1)
}
if (report.error) {
  console.error(`FATAL: npm audit failed: ${report.error.summary ?? JSON.stringify(report.error)}`)
  process.exit(1)
}

// A package's `via` lists its own advisories as objects, and the packages it is
// vulnerable through as names. Those names have their own entry with the advisory.
const advisories = new Map()
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vulnerability.via) {
    if (typeof via === 'string' || !BLOCKING.has(via.severity)) continue
    const id = via.url?.match(/GHSA(-[a-z0-9]{4}){3}$/i)?.[0] ?? String(via.source)
    advisories.set(id, via)
  }
}

const allowed = [...advisories].filter(([id]) => id in ALLOWED)
const blocking = [...advisories].filter(([id]) => !(id in ALLOWED))
const unused = Object.keys(ALLOWED).filter((id) => !advisories.has(id))

for (const [id, { name, title }] of allowed) {
  console.log(`allowed  ${id}  ${name}: ${title}\n         ${ALLOWED[id]}`)
}
for (const id of unused) {
  console.log(
    `notice   ${id} is in ALLOWED but no longer reported. Remove it from scripts/audit-prod.mjs.`,
  )
}
for (const [id, { name, severity, title, url, range }] of blocking) {
  console.error(`${severity.padEnd(8)} ${id}  ${name} ${range}: ${title}\n         ${url}`)
}

if (blocking.length > 0) {
  console.error(
    `\n${blocking.length} high or critical advisor${blocking.length === 1 ? 'y' : 'ies'} in the production dependencies.` +
      ' Update the package (npm update <name>), or, if there is no fix, add it to ALLOWED with the reason.',
  )
  process.exit(1)
}
console.log(
  `No high or critical advisories in the production dependencies (${allowed.length} allowed).`,
)
