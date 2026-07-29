import { estimateRouteAndFare, buildRouteSummary, type RouteEstimateSummary } from './matching/service'
import { type GroupStatus } from './domain'
import { type Gender } from './profile'

export type RoomStatus = GroupStatus
export type MemberRole = 'host' | 'member'
export type ApprovalMode = 'auto' | 'host'
export type ParticipantStatus = 'APPLIED' | 'APPROVED' | 'DEPOSITED' | 'CHECKED_IN' | 'NO_SHOW' | 'COMPLETED' | 'CANCELLED'
export type RecruitmentCloseMethod = 'departure-time' | 'host'

export interface RoomMember {
  id: string
  /** 개인정보 보호를 위해 이름은 일부만 노출합니다. */
  displayName: string
  role: MemberRole
  status: ParticipantStatus
  checkedIn: boolean
}

export interface RecommendReason {
  fromOriginMeters: number
  toDestMeters: number
  detourMinutes: number
}

export interface PendingSettlement {
  actualTotal: number
  settlementParticipantCount: number
  confirmedParticipantCount: number
  estimatedDeposit: number
  finalBurden: number
  delta: number
  idempotencyKey: string
  requestedByUserId: string
  requestedAt: string
}

export interface Room {
  id: string
  origin: string
  destination: string
  departLabel: string
  minutesUntilDepart: number
  maxSeats: number
  members: RoomMember[]
  status: RoomStatus
  recruitmentCloseMethod: RecruitmentCloseMethod
  perPersonPoints: number
  estimatedFare: number
  distanceKm: number
  durationMin: number
  approval: ApprovalMode
  allowNearby: boolean
  routeEstimate: RouteEstimateSummary
  reason: RecommendReason
  pendingSettlement?: PendingSettlement | null
}

export interface PointTx {
  id: string
  label: string
  amount: number
  date: string
}

export interface PointLedgerEntry {
  id: string
  userId: string
  actorUserId: string | null
  relatedTripGroupId: string | null
  reason: string
  idempotencyKey: string
  amount: number
  balanceEffect: number
  resultingBalance: number
  createdAt: string
}

export interface CurrentUser {
  id: string
  role: 'user' | 'admin'
  phoneNumber: string
  name: string
  gender: Gender
  universityEmail: string
  points: number
  deposited: number
}

export const currentUser: CurrentUser = {
  id: 'u-me',
  role: 'admin',
  phoneNumber: '010-1234-5678',
  name: '민지',
  gender: 'female',
  universityEmail: 'minji@jbnu.ac.kr',
  points: 27000,
  deposited: 0,
}

const avatarColors = ['bg-primary', 'bg-mint', 'bg-info', 'bg-accent']
export function avatarColor(index: number) {
  return avatarColors[index % avatarColors.length]
}

function createRouteEstimate({
  origin,
  destination,
  departLabel,
  allowNearby,
}: {
  origin: string
  destination: string
  departLabel: string
  allowNearby: boolean
}) {
  const result = estimateRouteAndFare({
    origin,
    destination,
    departureLabel: departLabel,
    allowNearby,
  })

  return buildRouteSummary(result)
}

function createRoomSeed(room: Omit<Room, 'routeEstimate' | 'estimatedFare' | 'distanceKm' | 'durationMin'> & {
  routeInput: {
    origin: string
    destination: string
    departLabel: string
    allowNearby: boolean
  }
}) : Room {
  const routeEstimate = createRouteEstimate(room.routeInput)
  return {
    ...room,
    perPersonPoints: Math.ceil(routeEstimate.estimatedFare / room.maxSeats),
    estimatedFare: routeEstimate.estimatedFare,
    distanceKm: routeEstimate.distanceKm,
    durationMin: routeEstimate.durationMin,
    routeEstimate,
    reason: {
      ...room.reason,
      detourMinutes: routeEstimate.detourMinutes,
    },
  }
}

export const recommendedRooms: Room[] = [
  createRoomSeed({
    id: 'room-1',
    origin: '전주캠퍼스',
    destination: '전북대 정문',
    departLabel: '오늘 22:30',
    minutesUntilDepart: 12,
    maxSeats: 4,
    status: 'OPEN',
    recruitmentCloseMethod: 'departure-time',
    perPersonPoints: 4500,
    approval: 'auto',
    allowNearby: true,
    members: [
      { id: 'u1', displayName: '민지', role: 'host', status: 'APPROVED', checkedIn: false },
      { id: 'u2', displayName: '준호', role: 'member', status: 'APPROVED', checkedIn: false },
    ],
    routeInput: {
      origin: '전주캠퍼스',
      destination: '전북대 정문',
      departLabel: '오늘 22:30',
      allowNearby: true,
    },
    reason: { fromOriginMeters: 120, toDestMeters: 230, detourMinutes: 3 },
  }),
  createRoomSeed({
    id: 'room-2',
    origin: '전주캠퍼스',
    destination: '전북대 정문',
    departLabel: '오늘 23:10',
    minutesUntilDepart: 52,
    maxSeats: 4,
    status: 'OPEN',
    recruitmentCloseMethod: 'host',
    perPersonPoints: 6200,
    approval: 'host',
    allowNearby: false,
    members: [
      { id: 'u3', displayName: '서연', role: 'host', status: 'APPROVED', checkedIn: false },
      { id: 'u4', displayName: '도윤', role: 'member', status: 'APPROVED', checkedIn: false },
      { id: 'u5', displayName: '하은', role: 'member', status: 'APPROVED', checkedIn: false },
    ],
    routeInput: {
      origin: '전주캠퍼스',
      destination: '전북대 정문',
      departLabel: '오늘 23:10',
      allowNearby: false,
    },
    reason: { fromOriginMeters: 260, toDestMeters: 150, detourMinutes: 5 },
  }),
  createRoomSeed({
    id: 'room-3',
    origin: '전주캠퍼스',
    destination: '전북대 정문',
    departLabel: '오늘 21:50',
    minutesUntilDepart: 8,
    maxSeats: 4,
    status: 'OPEN',
    recruitmentCloseMethod: 'departure-time',
    perPersonPoints: 3800,
    approval: 'auto',
    allowNearby: true,
    members: [{ id: 'u6', displayName: '지우', role: 'host', status: 'APPROVED', checkedIn: false }],
    routeInput: {
      origin: '전주캠퍼스',
      destination: '전북대 정문',
      departLabel: '오늘 21:50',
      allowNearby: true,
    },
    reason: { fromOriginMeters: 340, toDestMeters: 420, detourMinutes: 6 },
  }),
]

export const myRooms = {
  hosted: [recommendedRooms[0]],
  joined: [recommendedRooms[1]],
}

export const pointHistory: PointTx[] = [
  { id: 't1', label: '관리자 지급', amount: 30000, date: '2026.07.20' },
  { id: 't2', label: '참여 예치', amount: -4000, date: '2026.07.22' },
  { id: 't3', label: '정산 차액 반환', amount: 1000, date: '2026.07.22' },
]

export const pointLedgerSeed: PointLedgerEntry[] = [
  {
    id: 'pl1',
    userId: 'u-me',
    actorUserId: 'admin-1',
    relatedTripGroupId: null,
    reason: '관리자 지급',
    idempotencyKey: 'seed-grant-1',
    amount: 30000,
    balanceEffect: 30000,
    resultingBalance: 30000,
    createdAt: '2026-07-20T14:22:00.000Z',
  },
  {
    id: 'pl2',
    userId: 'u-me',
    actorUserId: 'u-me',
    relatedTripGroupId: 'room-1',
    reason: '참여 예치',
    idempotencyKey: 'seed-deposit-1',
    amount: -4000,
    balanceEffect: -4000,
    resultingBalance: 26000,
    createdAt: '2026-07-22T10:05:00.000Z',
  },
  {
    id: 'pl3',
    userId: 'u-me',
    actorUserId: 'u-me',
    relatedTripGroupId: 'room-1',
    reason: '정산 차액 반환',
    idempotencyKey: 'seed-refund-1',
    amount: 1000,
    balanceEffect: 1000,
    resultingBalance: 27000,
    createdAt: '2026-07-22T12:00:00.000Z',
  },
]

export const adminGrants = [
  { id: 'g1', name: '민지', studentId: '20213456', email: 'minji@jbnu.ac.kr', amount: 30000, reason: '초기 사용성 지급', date: '07.20 14:22' },
  { id: 'g2', name: '준호', studentId: '20198765', email: 'junho@jbnu.ac.kr', amount: 10000, reason: '테스트 참여 보상', date: '07.21 10:05' },
  { id: 'g3', name: '서연', studentId: '20221122', email: 'seoyeon@jbnu.ac.kr', amount: 5000, reason: '운영자 직접 지급', date: '07.21 18:40' },
]

export function formatPoints(n: number) {
  return `${n.toLocaleString('ko-KR')}P`
}

export function formatWon(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

export function getRoomById(id: string): Room | undefined {
  return recommendedRooms.find((r) => r.id === id)
}
