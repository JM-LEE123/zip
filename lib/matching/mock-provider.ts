import type { RouteEstimateInput, RouteEstimateProvider, RouteEstimateResult } from './types'

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function buildRouteKey(input: RouteEstimateInput) {
  return `${input.origin.trim().toLowerCase()}::${input.destination.trim().toLowerCase()}::${input.departureLabel.trim().toLowerCase()}::${input.allowNearby ? 'nearby' : 'strict'}`
}

function buildEstimate(input: RouteEstimateInput, fallbackUsed: boolean): RouteEstimateResult {
  const routeKey = buildRouteKey(input)
  const seed = hashString(routeKey)

  const distanceMeters = clamp(4200 + (seed % 6400), 4200, 10600)
  const detourMinutes = input.allowNearby ? 3 + (seed % 4) : 0
  const durationSeconds = clamp(Math.round(distanceMeters / 8.5) + detourMinutes * 60, 840, 2100)
  const estimatedTotal = clamp(
    Math.round(3800 + distanceMeters * 0.55 + durationSeconds * 0.2),
    4500,
    16000,
  )

  return {
    providerName: 'MockDistanceProvider',
    providerBasis: fallbackUsed ? 'fallback:heuristic-v1' : 'mock-heuristic-v1',
    distanceMeters,
    durationSeconds,
    estimatedTotal,
    normalizedRoute: {
      origin: input.origin.trim(),
      destination: input.destination.trim(),
      departureLabel: input.departureLabel.trim(),
      allowNearby: input.allowNearby,
      routeKey,
      detourPolicy: input.allowNearby ? 'nearby' : 'strict',
      detourMinutes,
      fallbackUsed,
    },
    calculatedAt: new Date().toISOString(),
  }
}

export class MockDistanceProvider implements RouteEstimateProvider {
  readonly name = 'MockDistanceProvider'

  estimateRoute(input: RouteEstimateInput): RouteEstimateResult {
    if (!input.origin.trim() || !input.destination.trim()) {
      throw new Error('route input requires origin and destination')
    }

    return buildEstimate(input, false)
  }
}

export function createFallbackRouteEstimate(input: RouteEstimateInput) {
  return buildEstimate(input, true)
}
