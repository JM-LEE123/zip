import { estimateRouteAndFare, buildRouteSummary, type RouteEstimateSummary } from './service'
import { canAcceptApplication, isRecruitmentOpen, type GroupStatus } from '../domain'
import type { Room } from '../mock-data'

export interface MatchRequest {
  requesterUserId: string
  origin: string
  destination: string
  departureLabel: string
  allowNearbyDestination: boolean
}

export interface MatchPolicy {
  maxDetourMinutes: number
  maxDistanceDeltaKm: number
  maxDurationDeltaMin: number
  minScore: number
}

export interface MatchRecommendation {
  requesterUserId: string
  matchedTripGroupId: string
  normalizedRoute: RouteEstimateSummary['normalizedRoute']
  score: number
  recommendationReason: string
  calculatedAt: string
  routeSummary: RouteEstimateSummary
}

export const DEFAULT_MATCH_POLICY: MatchPolicy = {
  maxDetourMinutes: 6,
  maxDistanceDeltaKm: 2.2,
  maxDurationDeltaMin: 12,
  minScore: 45,
}

function countSeatsLeft(room: Room) {
  return room.maxSeats - room.members.length
}

function scoreRoom({
  requestRoute,
  roomRoute,
  seatsLeft,
  roomStatus,
}: {
  requestRoute: RouteEstimateSummary
  roomRoute: RouteEstimateSummary
  seatsLeft: number
  roomStatus: GroupStatus
}) {
  const distanceDeltaKm = Math.abs(requestRoute.distanceKm - roomRoute.distanceKm)
  const durationDeltaMin = Math.abs(requestRoute.durationMin - roomRoute.durationMin)
  const fareDelta = Math.abs(requestRoute.estimatedFare - roomRoute.estimatedFare)
  const detourDelta = Math.abs(requestRoute.detourMinutes - roomRoute.detourMinutes)

  const statusBonus = isRecruitmentOpen(roomStatus) ? 10 : 0
  const capacityBonus = seatsLeft >= 2 ? 8 : 4
  const detourPenalty = detourDelta * 7
  const distancePenalty = distanceDeltaKm * 12
  const durationPenalty = durationDeltaMin * 3
  const farePenalty = fareDelta / 300
  const baseScore = 100 + statusBonus + capacityBonus - detourPenalty - distancePenalty - durationPenalty - farePenalty

  return Math.max(0, Math.round(baseScore))
}

function explainRecommendation({
  room,
  requestRoute,
  roomRoute,
  seatsLeft,
}: {
  room: Room
  requestRoute: RouteEstimateSummary
  roomRoute: RouteEstimateSummary
  seatsLeft: number
}) {
  const pieces = [
    `거리 차이 ${Math.abs(requestRoute.distanceKm - roomRoute.distanceKm).toFixed(1)}km`,
    `시간 차이 ${Math.abs(requestRoute.durationMin - roomRoute.durationMin)}분`,
    `예상 우회 ${roomRoute.detourMinutes}분`,
    `잔여 ${seatsLeft}석`,
  ]

  if (room.allowNearby) {
    pieces.push('근처 목적지 허용')
  }

  return pieces.join(' · ')
}

export function recommendMatchRooms(
  rooms: Room[],
  request: MatchRequest,
  policy: Partial<MatchPolicy> = {},
): MatchRecommendation[] {
  const resolvedPolicy = { ...DEFAULT_MATCH_POLICY, ...policy }
  const requestRoute = buildRouteSummary(
    estimateRouteAndFare({
      origin: request.origin,
      destination: request.destination,
      departureLabel: request.departureLabel,
      allowNearby: request.allowNearbyDestination,
    }),
  )

  const recommendations = rooms
    .filter((room) => {
      if (!canAcceptApplication({
        groupStatus: room.status,
        currentParticipantCount: room.members.length,
        maxSeats: room.maxSeats,
      })) {
        return false
      }

      const distanceDeltaKm = Math.abs(requestRoute.distanceKm - room.routeEstimate.distanceKm)
      const durationDeltaMin = Math.abs(requestRoute.durationMin - room.routeEstimate.durationMin)
      const detourDelta = Math.abs(requestRoute.detourMinutes - room.routeEstimate.detourMinutes)

      if (countSeatsLeft(room) <= 0) return false
      if (room.minutesUntilDepart <= 0) return false
      if (distanceDeltaKm > resolvedPolicy.maxDistanceDeltaKm) return false
      if (durationDeltaMin > resolvedPolicy.maxDurationDeltaMin) return false
      if (!request.allowNearbyDestination && detourDelta > 0) return false
      if (request.allowNearbyDestination && detourDelta > resolvedPolicy.maxDetourMinutes) return false
      return true
    })
    .map((room) => {
      const seatsLeft = countSeatsLeft(room)
      const score = scoreRoom({
        requestRoute,
        roomRoute: room.routeEstimate,
        seatsLeft,
        roomStatus: room.status,
      })

      return {
        requesterUserId: request.requesterUserId,
        matchedTripGroupId: room.id,
        normalizedRoute: requestRoute.normalizedRoute,
        score,
        recommendationReason: explainRecommendation({
          room,
          requestRoute,
          roomRoute: room.routeEstimate,
          seatsLeft,
        }),
        calculatedAt: new Date().toISOString(),
        routeSummary: room.routeEstimate,
      }
    })
    .filter((item) => item.score >= resolvedPolicy.minScore)
    .sort((a, b) => b.score - a.score)

  return recommendations
}

export function explainMatchFallback(request: MatchRequest) {
  return {
    requesterUserId: request.requesterUserId,
    matchedTripGroupId: null,
    normalizedRoute: {
      origin: request.origin,
      destination: request.destination,
      departureLabel: request.departureLabel,
      allowNearby: request.allowNearbyDestination,
      routeKey: '',
      detourPolicy: request.allowNearbyDestination ? 'nearby' : 'strict',
      detourMinutes: 0,
      fallbackUsed: true,
    },
    score: 0,
    recommendationReason: '조건에 맞는 모집 중 그룹이 없습니다.',
    calculatedAt: new Date().toISOString(),
    routeSummary: buildRouteSummary(
      estimateRouteAndFare({
        origin: request.origin,
        destination: request.destination,
        departureLabel: request.departureLabel,
        allowNearby: request.allowNearbyDestination,
      }),
    ),
  }
}
