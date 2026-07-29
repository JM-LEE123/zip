export interface RouteEstimateInput {
  origin: string
  destination: string
  departureLabel: string
  allowNearby: boolean
}

export interface NormalizedRoute {
  origin: string
  destination: string
  departureLabel: string
  allowNearby: boolean
  routeKey: string
  detourPolicy: 'strict' | 'nearby'
  detourMinutes: number
  fallbackUsed: boolean
}

export interface RouteEstimateResult {
  providerName: string
  providerBasis: string
  distanceMeters: number
  durationSeconds: number
  estimatedTotal: number
  normalizedRoute: NormalizedRoute
  calculatedAt: string
}

export interface RouteEstimateProvider {
  readonly name: string
  estimateRoute(input: RouteEstimateInput): Promise<RouteEstimateResult> | RouteEstimateResult
}
