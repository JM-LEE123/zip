import { MockDistanceProvider, createFallbackRouteEstimate } from './mock-provider'
import type { RouteEstimateInput, RouteEstimateProvider, RouteEstimateResult } from './types'

const defaultProvider = new MockDistanceProvider()

export interface RouteEstimateSummary {
  providerName: string
  providerBasis: string
  distanceKm: number
  durationMin: number
  estimatedFare: number
  normalizedRoute: RouteEstimateResult['normalizedRoute']
  detourMinutes: number
  calculatedAt: string
}

export function estimateRouteAndFare(
  input: RouteEstimateInput,
  provider: RouteEstimateProvider = defaultProvider,
): RouteEstimateResult {
  try {
    const result = provider.estimateRoute(input)
    if (isPromiseLike(result)) {
      return createFallbackRouteEstimate(input)
    }
    return result
  } catch {
    return createFallbackRouteEstimate(input)
  }
}

function isPromiseLike(value: unknown): value is Promise<RouteEstimateResult> {
  return Boolean(value) && typeof value === 'object' && typeof (value as Promise<RouteEstimateResult>).then === 'function'
}

export function buildRouteSummary(result: RouteEstimateResult) {
  return {
    providerName: result.providerName,
    providerBasis: result.providerBasis,
    distanceKm: Number((result.distanceMeters / 1000).toFixed(1)),
    durationMin: Math.max(1, Math.round(result.durationSeconds / 60)),
    estimatedFare: result.estimatedTotal,
    normalizedRoute: result.normalizedRoute,
    detourMinutes: result.normalizedRoute.detourMinutes,
    calculatedAt: result.calculatedAt,
  }
}
