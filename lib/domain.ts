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
  return groupStatus === 'OPEN'
}

export function canConfirmGroup(confirmedParticipantCount: number) {
  return confirmedParticipantCount >= MIN_CONFIRMED_PARTICIPANTS
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
