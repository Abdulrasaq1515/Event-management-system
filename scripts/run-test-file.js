#!/usr/bin/env node
const { execSync } = require('child_process')

const file = process.argv[2] || process.env.TEST_FILE
if (!file) {
  console.error('Usage: node scripts/run-test-file.js <path/to/test.file.ts>')
  process.exit(2)
}

try {
  const cmd = `npx vitest run ${file}`
  console.log(cmd)
  const out = execSync(cmd, { stdio: 'inherit' })
  process.exit(0)
} catch (err) {
  process.exit(err.status || 1)
}
