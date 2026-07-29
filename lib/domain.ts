export const GROUP_STATUSES = [
  'DRAFT',
  'OPEN',
  'CLOSED',
  'CONFIRMED',
  'IN_PROGRESS',
  'SETTLEMENT_PENDING',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
] as const

export type GroupStatus = (typeof GROUP_STATUSES)[number]

export const PARTICIPANT_STATUSES = [
  'APPLIED',
  'APPROVED',
  'DEPOSITED',
  'CHECKED_IN',
  'NO_SHOW',
  'COMPLETED',
  'CANCELLED',
] as const

export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number]

export const MIN_GROUP_CAPACITY = 2
export const MAX_GROUP_CAPACITY = 4
export const MIN_CONFIRMED_PARTICIPANTS = 2

export type RecruitmentCloseMethod = 'departure-time' | 'host'
export type UserRole = 'user' | 'admin'

export function canManagePoints(role: UserRole) {
  return role === 'admin'
}

export function isRecruitmentOpen(groupStatus: GroupStatus) {
  return groupStatus === 'OPEN'
}

export function getGroupStatusLabel(groupStatus: GroupStatus) {
  switch (groupStatus) {
    case 'DRAFT':
      return 'draft'
    case 'OPEN':
      return 'open'
    case 'CLOSED':
      return 'closed'
    case 'CONFIRMED':
      return 'confirmed'
    case 'IN_PROGRESS':
      return 'in progress'
    case 'SETTLEMENT_PENDING':
      return 'settlement pending'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
      return 'cancelled'
    case 'EXPIRED':
      return 'expired'
    default:
      return groupStatus
  }
}

export function isValidTargetCapacity(capacity: number) {
  return Number.isInteger(capacity) && capacity >= MIN_GROUP_CAPACITY && capacity <= MAX_GROUP_CAPACITY
}

export function canAcceptApplication({
  groupStatus,
  currentParticipantCount,
  maxSeats,
}: {
  groupStatus: GroupStatus
  currentParticipantCount: number
  maxSeats: number
}) {
  return groupStatus === 'OPEN' && currentParticipantCount < maxSeats
}

export function canHostCloseRecruitment(groupStatus: GroupStatus) {
  return isRecruitmentOpen(groupStatus)
}

export function canApproveParticipant(groupStatus: GroupStatus, participantStatus: ParticipantStatus) {
  return isRecruitmentOpen(groupStatus) && participantStatus === 'APPLIED'
}

export function canDepositParticipant(groupStatus: GroupStatus, participantStatus: ParticipantStatus) {
  return (groupStatus === 'OPEN' || groupStatus === 'CLOSED') && participantStatus === 'APPROVED'
}

export function canStartRide(groupStatus: GroupStatus) {
  return groupStatus === 'CONFIRMED'
}

export function canRequestSettlement(groupStatus: GroupStatus) {
  return groupStatus === 'IN_PROGRESS'
}

export function canCompleteSettlement(groupStatus: GroupStatus) {
  return groupStatus === 'SETTLEMENT_PENDING'
}

export function canConfirmGroup(confirmedParticipantCount: number) {
  return confirmedParticipantCount >= MIN_CONFIRMED_PARTICIPANTS
}

export function resolveRecruitmentClosureStatus(confirmedParticipantCount: number): GroupStatus {
  return canConfirmGroup(confirmedParticipantCount) ? 'CLOSED' : 'EXPIRED'
}

export function isCountedAsConfirmedParticipant(status: ParticipantStatus) {
  return status === 'APPROVED' || status === 'DEPOSITED' || status === 'CHECKED_IN' || status === 'COMPLETED'
}

function assertPositiveParticipantCount(participantCount: number, label: string) {
  if (!Number.isInteger(participantCount) || participantCount <= 0) {
    throw new RangeError(`${label} must be a positive integer`)
  }
}

export function calculateEstimatedPerPersonDeposit(
  estimatedTotal: number,
  confirmedParticipantCount: number,
) {
  assertPositiveParticipantCount(confirmedParticipantCount, 'confirmedParticipantCount')
  if (estimatedTotal < 0) throw new RangeError('estimatedTotal must be non-negative')
  return Math.ceil(estimatedTotal / confirmedParticipantCount)
}

export function calculateFinalPerPersonBurden(
  actualTotal: number,
  settlementParticipantCount: number,
) {
  assertPositiveParticipantCount(settlementParticipantCount, 'settlementParticipantCount')
  if (actualTotal < 0) throw new RangeError('actualTotal must be non-negative')
  return Math.ceil(actualTotal / settlementParticipantCount)
}

export function calculateSettlementDelta({
  estimatedTotal,
  actualTotal,
  confirmedParticipantCount,
  settlementParticipantCount,
}: {
  estimatedTotal: number
  actualTotal: number
  confirmedParticipantCount: number
  settlementParticipantCount: number
}) {
  const estimatedDeposit = calculateEstimatedPerPersonDeposit(
    estimatedTotal,
    confirmedParticipantCount,
  )
  const finalBurden = calculateFinalPerPersonBurden(actualTotal, settlementParticipantCount)

  return {
    estimatedDeposit,
    finalBurden,
    delta: finalBurden - estimatedDeposit,
  }
}
