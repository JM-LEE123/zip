import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const up = readFileSync(new URL('../db/migrations/001_init.up.sql', import.meta.url), 'utf8')
const down = readFileSync(new URL('../db/migrations/001_init.down.sql', import.meta.url), 'utf8')
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')

for (const table of [
  'CREATE TABLE users',
  'CREATE TABLE trip_groups',
  'CREATE TABLE trip_participants',
  'CREATE TABLE fare_estimates',
  'CREATE TABLE match_recommendations',
  'CREATE TABLE settlements',
  'CREATE TABLE point_ledger',
  'CREATE TABLE reports',
  'CREATE TABLE blocks',
]) {
  assert.ok(up.includes(table), `missing ${table}`)
}

assert.ok(up.includes("CHECK (target_capacity BETWEEN 2 AND 4)"), 'missing capacity check')
assert.ok(up.includes("CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'CONFIRMED', 'IN_PROGRESS', 'SETTLEMENT_PENDING', 'COMPLETED', 'CANCELLED', 'EXPIRED'))"), 'missing trip status check')
assert.ok(up.includes("CHECK (status IN ('APPLIED', 'APPROVED', 'DEPOSITED', 'CHECKED_IN', 'NO_SHOW', 'COMPLETED', 'CANCELLED'))"), 'missing participant status check')
assert.ok(up.includes('UNIQUE'), 'missing uniqueness constraints')
assert.ok(up.includes('point_ledger'), 'missing point ledger table')
assert.ok(up.includes('idempotency_key text NOT NULL UNIQUE'), 'missing idempotency key uniqueness')
assert.ok(up.includes('balance_effect integer NOT NULL'), 'missing balance effect column')

for (const drop of [
  'DROP TABLE IF EXISTS blocks',
  'DROP TABLE IF EXISTS reports',
  'DROP TABLE IF EXISTS point_ledger',
  'DROP TABLE IF EXISTS settlements',
  'DROP TABLE IF EXISTS match_recommendations',
  'DROP TABLE IF EXISTS fare_estimates',
  'DROP TABLE IF EXISTS trip_participants',
  'DROP TABLE IF EXISTS trip_groups',
  'DROP TABLE IF EXISTS users',
]) {
  assert.ok(down.includes(drop), `missing ${drop}`)
}

for (const envName of ['DATABASE_URL', 'DATABASE_URL_PREVIEW', 'DATABASE_URL_PRODUCTION']) {
  assert.ok(envExample.includes(envName), `missing ${envName}`)
}

console.log('schema checks passed')
