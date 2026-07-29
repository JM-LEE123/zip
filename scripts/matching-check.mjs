import assert from 'node:assert/strict'
import fs from 'node:fs'
import Module from 'node:module'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')

Module._extensions['.ts'] = function loadTypeScript(module, filename) {
  const source = fs.readFileSync(filename, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  })
  module._compile(outputText, filename)
}

const servicePath = resolve(dirname(fileURLToPath(import.meta.url)), '../lib/matching/service.ts')
const providerPath = resolve(dirname(fileURLToPath(import.meta.url)), '../lib/matching/mock-provider.ts')

const { estimateRouteAndFare, buildRouteSummary } = require(servicePath)
const { MockDistanceProvider, createFallbackRouteEstimate } = require(providerPath)
const matcherPath = resolve(dirname(fileURLToPath(import.meta.url)), '../lib/matching/matcher.ts')
const { recommendMatchRooms, explainMatchFallback } = require(matcherPath)

const estimate = estimateRouteAndFare({
  origin: '전주캠퍼스',
  destination: '전북대 정문',
  departureLabel: '오늘 22:30',
  allowNearby: true,
})

assert.equal(estimate.providerName, 'MockDistanceProvider')
assert.equal(estimate.normalizedRoute.origin, '전주캠퍼스')
assert.equal(estimate.normalizedRoute.destination, '전북대 정문')
assert.equal(estimate.normalizedRoute.fallbackUsed, false)
assert.ok(estimate.distanceMeters > 0)
assert.ok(estimate.durationSeconds > 0)
assert.ok(estimate.estimatedTotal > 0)

const summary = buildRouteSummary(estimate)
assert.equal(summary.providerBasis, 'mock-heuristic-v1')
assert.ok(summary.distanceKm > 0)
assert.ok(summary.durationMin > 0)

const provider = new MockDistanceProvider()
const providerResult = provider.estimateRoute({
  origin: '전주캠퍼스',
  destination: '전북대 정문',
  departureLabel: '오늘 23:10',
  allowNearby: false,
})
assert.equal(providerResult.providerName, 'MockDistanceProvider')
assert.equal(providerResult.normalizedRoute.detourPolicy, 'strict')

const fallback = createFallbackRouteEstimate({
  origin: '',
  destination: '',
  departureLabel: '오늘 22:30',
  allowNearby: true,
})
assert.equal(fallback.normalizedRoute.fallbackUsed, true)
assert.equal(fallback.providerBasis, 'fallback:heuristic-v1')

const roomPool = require(resolve(dirname(fileURLToPath(import.meta.url)), '../lib/mock-data.ts')).recommendedRooms
const recommendations = recommendMatchRooms(roomPool, {
  requesterUserId: 'u-me',
  origin: '전주캠퍼스',
  destination: '전북대 정문',
  departureLabel: '오늘 22:30',
  allowNearbyDestination: true,
})

assert.ok(recommendations.length > 0)
assert.equal(recommendations[0].matchedTripGroupId, 'room-1')
assert.ok(recommendations[0].score >= recommendations[recommendations.length - 1].score)

const fallbackReason = explainMatchFallback({
  requesterUserId: 'u-me',
  origin: '외부',
  destination: '외부',
  departureLabel: '오늘 21:50',
  allowNearbyDestination: false,
})
assert.equal(fallbackReason.matchedTripGroupId, null)

console.log('matching checks passed')
