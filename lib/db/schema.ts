import type { GroupStatus, ParticipantStatus, RecruitmentCloseMethod } from '@/lib/domain'
import type { Gender } from '@/lib/profile'

export type UUID = string
export type IsoTimestamp = string

export interface UserRow {
  id: UUID
  phoneNumber: string
  name: string
  gender: Gender
  universityEmail: string
  points: number
  createdAt: IsoTimestamp
  updatedAt: IsoTimestamp
}

export interface TripGroupRow {
  id: UUID
  hostUserId: UUID
  origin: string
  destination: string
  departureTime: IsoTimestamp
  recruitmentCloseMethod: RecruitmentCloseMethod
  targetCapacity: 2 | 3 | 4
  status: GroupStatus
  allowNearby: boolean
  createdAt: IsoTimestamp
  updatedAt: IsoTimestamp
  closedAt: IsoTimestamp | null
  confirmedAt: IsoTimestamp | null
  cancelledAt: IsoTimestamp | null
  expiredAt: IsoTimestamp | null
}

export interface TripParticipantRow {
  id: UUID
  tripGroupId: UUID
  userId: UUID
  role: 'host' | 'member'
  status: ParticipantStatus
  appliedAt: IsoTimestamp
  approvedAt: IsoTimestamp | null
  depositedAt: IsoTimestamp | null
  checkedInAt: IsoTimestamp | null
  noShowAt: IsoTimestamp | null
  completedAt: IsoTimestamp | null
  cancelledAt: IsoTimestamp | null
}

export interface FareEstimateRow {
  id: UUID
  tripGroupId: UUID
  providerName: string
  providerBasis: string
  distanceMeters: number
  durationSeconds: number
  estimatedTotal: number
  normalizedRoute: Record<string, unknown>
  calculatedAt: IsoTimestamp
}

export interface MatchRecommendationRow {
  id: UUID
  requesterUserId: UUID
  matchedTripGroupId: UUID | null
  normalizedRoute: Record<string, unknown>
  score: number
  recommendationReason: string
  calculatedAt: IsoTimestamp
}

export interface SettlementRow {
  id: UUID
  tripGroupId: UUID
  estimatedTotal: number
  actualTotal: number
  settlementParticipantCount: number
  estimatedPerPerson: number
  finalPerPerson: number
  deltaPerPerson: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  settledAt: IsoTimestamp | null
  createdAt: IsoTimestamp
  updatedAt: IsoTimestamp
}

export interface PointLedgerRow {
  id: UUID
  userId: UUID
  actorUserId: UUID | null
  relatedTripGroupId: UUID | null
  reason: string
  idempotencyKey: string
  amount: number
  balanceEffect: number
  resultingBalance: number
  createdAt: IsoTimestamp
}

export interface ReportRow {
  id: UUID
  reporterUserId: UUID
  targetUserId: UUID | null
  targetTripGroupId: UUID | null
  category: string
  reason: string
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED'
  createdAt: IsoTimestamp
  resolvedAt: IsoTimestamp | null
}

export interface BlockRow {
  id: UUID
  blockerUserId: UUID
  blockedUserId: UUID
  reason: string
  createdAt: IsoTimestamp
  liftedAt: IsoTimestamp | null
}
