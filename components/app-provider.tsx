'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  canAcceptApplication,
  canApproveParticipant,
  canCompleteSettlement,
  canDepositParticipant,
  canHostCloseRecruitment,
  canManagePoints,
  canRequestSettlement,
  canStartRide,
  calculateEstimatedPerPersonDeposit,
  calculateFinalPerPersonBurden,
  isCountedAsConfirmedParticipant,
  MIN_CONFIRMED_PARTICIPANTS,
  resolveRecruitmentClosureStatus,
} from '@/lib/domain'
import {
  currentUser as initialUser,
  recommendedRooms,
  pointHistory as initialHistory,
  pointLedgerSeed,
  type ApprovalMode,
  type CurrentUser,
  type PendingSettlement,
  type PointLedgerEntry,
  type PointTx,
  type RecruitmentCloseMethod,
  type Room,
  type RoomMember,
} from '@/lib/mock-data'
import { buildRouteSummary, estimateRouteAndFare } from '@/lib/matching/service'
import { Toaster } from '@/components/ui/toast'

type ApplyResult = 'applied' | 'approved' | false
type CloseResult = 'CLOSED' | 'EXPIRED' | false

interface CreateRoomInput {
  origin: string
  destination: string
  departLabel: string
  maxSeats: 2 | 3 | 4
  approval: ApprovalMode
  allowNearby: boolean
  recruitmentCloseMethod: RecruitmentCloseMethod
}

interface AppState {
  user: CurrentUser
  rooms: Room[]
  history: PointTx[]
  ledger: PointLedgerEntry[]
  joinedRoomIds: string[]
  toast: (message: string, tone?: 'default' | 'success' | 'warn') => void
  updateProfile: (profile: Pick<CurrentUser, 'phoneNumber' | 'name' | 'gender' | 'universityEmail'>) => void
  createRoom: (input: CreateRoomInput) => Room
  applyToRoom: (roomId: string) => ApplyResult
  approveParticipant: (roomId: string, participantId: string) => boolean
  closeRoom: (roomId: string) => CloseResult
  depositAndJoin: (room: Room) => boolean
  depositForRoom: (roomId: string, idempotencyKey?: string) => {
    ok: boolean
    replay: boolean
    amount?: number
    confirmed?: boolean
    entry?: PointLedgerEntry
    message: string
  }
  startRide: (roomId: string) => { ok: boolean; replay: boolean; message: string }
  requestSettlement: (roomId: string, actualTotal: number, idempotencyKey?: string) => {
    ok: boolean
    replay: boolean
    pending?: PendingSettlement | null
    message: string
  }
  completeSettlement: (roomId: string, idempotencyKey?: string) => {
    ok: boolean
    replay: boolean
    entry?: PointLedgerEntry
    message: string
  }
  grantPoints: (input: {
    targetLabel: string
    amount: number
    reason: string
    idempotencyKey: string
  }) => { ok: boolean; replay: boolean; entry?: PointLedgerEntry; message: string }
  addHistory: (tx: Omit<PointTx, 'id' | 'date'>) => void
  settleAdjust: (delta: number) => void
}

const AppContext = createContext<AppState | null>(null)

let txCounter = 100

function createRoomId() {
  return `room-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function createHostMember(user: CurrentUser): RoomMember {
  return {
    id: user.id,
    displayName: user.name,
    role: 'host',
    status: 'APPROVED',
    checkedIn: false,
  }
}

function countConfirmedParticipants(room: Room) {
  return room.members.filter((member) => isCountedAsConfirmedParticipant(member.status)).length
}

function createDepositLabel(origin: string) {
  return `Deposit completed · ${origin}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(initialUser)
  const [rooms, setRooms] = useState<Room[]>(recommendedRooms)
  const [history, setHistory] = useState<PointTx[]>(initialHistory)
  const [ledger, setLedger] = useState<PointLedgerEntry[]>(pointLedgerSeed)
  const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([])
  const [toasts, setToasts] = useState<
    { id: number; message: string; tone: 'default' | 'success' | 'warn' }[]
  >([])
  const ledgerByKeyRef = useRef(
    new Map(pointLedgerSeed.map((entry) => [entry.idempotencyKey, entry] as const)),
  )
  const settlementByKeyRef = useRef(new Map<string, PointLedgerEntry>())

  const toast = useCallback(
    (message: string, tone: 'default' | 'success' | 'warn' = 'default') => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, message, tone }])
      setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 2600)
    },
    [],
  )

  const addHistory = useCallback((tx: Omit<PointTx, 'id' | 'date'>) => {
    setHistory((current) => [
      { ...tx, id: `t${txCounter++}`, date: new Date().toLocaleDateString('ko-KR') },
      ...current,
    ])
  }, [])

  const updateProfile = useCallback(
    (profile: Pick<CurrentUser, 'phoneNumber' | 'name' | 'gender' | 'universityEmail'>) => {
      setUser((current) => ({ ...current, ...profile }))
    },
    [],
  )

  const createRoom = useCallback(
    (input: CreateRoomInput) => {
      const room: Room = {
        id: createRoomId(),
        origin: input.origin.trim(),
        destination: input.destination.trim(),
        departLabel: input.departLabel,
        minutesUntilDepart:
          input.departLabel.includes('21:50')
            ? 8
            : input.departLabel.includes('22:30')
              ? 12
              : input.departLabel.includes('23:10')
                ? 52
                : 30,
        maxSeats: input.maxSeats,
        members: [createHostMember(user)],
        status: 'OPEN',
        recruitmentCloseMethod: input.recruitmentCloseMethod,
        perPersonPoints: 0,
        estimatedFare: 0,
        distanceKm: 0,
        durationMin: 0,
        approval: input.approval,
        allowNearby: input.allowNearby,
        routeEstimate: buildRouteSummary(
          estimateRouteAndFare({
            origin: input.origin,
            destination: input.destination,
            departureLabel: input.departLabel,
            allowNearby: input.allowNearby,
          }),
        ),
        reason: { fromOriginMeters: 120, toDestMeters: 230, detourMinutes: 3 },
        pendingSettlement: null,
      }

      room.estimatedFare = room.routeEstimate.estimatedFare
      room.distanceKm = room.routeEstimate.distanceKm
      room.durationMin = room.routeEstimate.durationMin
      room.perPersonPoints = Math.ceil(room.estimatedFare / input.maxSeats)
      room.reason = {
        ...room.reason,
        detourMinutes: room.routeEstimate.detourMinutes,
      }

      setRooms((current) => [room, ...current])
      setJoinedRoomIds((current) => (current.includes(room.id) ? current : [room.id, ...current]))
      toast('Room created.', 'success')
      return room
    },
    [toast, user],
  )

  const applyToRoom = useCallback(
    (roomId: string): ApplyResult => {
      const room = rooms.find((item) => item.id === roomId)
      if (!room) {
        toast('Group not found.', 'warn')
        return false
      }

      if (room.members.some((member) => member.id === user.id)) {
        toast('You already joined this group.', 'warn')
        return false
      }

      const confirmedCount = countConfirmedParticipants(room)
      if (
        !canAcceptApplication({
          groupStatus: room.status,
          currentParticipantCount: confirmedCount,
          maxSeats: room.maxSeats,
        })
      ) {
        toast('Recruitment is closed or the room is full.', 'warn')
        return false
      }

      const nextStatus: ApplyResult = room.approval === 'auto' ? 'approved' : 'applied'
      const nextMember: RoomMember = {
        id: user.id,
        displayName: user.name,
        role: 'member',
        status: nextStatus === 'approved' ? 'APPROVED' : 'APPLIED',
        checkedIn: false,
      }

      setRooms((current) =>
        current.map((item) =>
          item.id === roomId ? { ...item, members: [...item.members, nextMember] } : item,
        ),
      )
      setJoinedRoomIds((current) => (current.includes(roomId) ? current : [roomId, ...current]))
      toast(nextStatus === 'approved' ? 'Application approved automatically.' : 'Application submitted.', 'success')
      return nextStatus
    },
    [rooms, toast, user],
  )

  const approveParticipant = useCallback(
    (roomId: string, participantId: string) => {
      let updated = false

      setRooms((current) =>
        current.map((room) => {
          if (room.id !== roomId) return room
          if (!canHostCloseRecruitment(room.status)) return room

          const participant = room.members.find((member) => member.id === participantId)
          if (!participant || !canApproveParticipant(room.status, participant.status)) {
            return room
          }

          updated = true
          return {
            ...room,
            members: room.members.map((member) =>
              member.id === participantId ? { ...member, status: 'APPROVED' } : member,
            ),
          }
        }),
      )

      if (!updated) {
        toast('Could not approve participant.', 'warn')
      }

      return updated
    },
    [toast],
  )

  const closeRoom = useCallback(
    (roomId: string): CloseResult => {
      let result: CloseResult = false

      setRooms((current) =>
        current.map((room) => {
          if (room.id !== roomId) return room
          if (!canHostCloseRecruitment(room.status)) return room

          const confirmedCount = countConfirmedParticipants(room)
          const nextStatus = resolveRecruitmentClosureStatus(confirmedCount)
          result = nextStatus
          return { ...room, status: nextStatus }
        }),
      )

      if (!result) {
        toast('Room cannot be closed right now.', 'warn')
      } else if (result === 'CLOSED') {
        toast('Recruitment closed.', 'success')
      } else {
        toast('Not enough confirmed participants. Room expired.', 'warn')
      }

      return result
    },
    [toast],
  )

  const depositForRoom = useCallback(
    (roomId: string, idempotencyKey = `deposit:${roomId}:${user.id}`) => {
      const room = rooms.find((item) => item.id === roomId)
      if (!room) {
        return { ok: false, replay: false, message: 'Group not found.' }
      }

      const participant = room.members.find((member) => member.id === user.id)
      if (!participant || !canDepositParticipant(room.status, participant.status)) {
        return { ok: false, replay: false, message: 'Only approved participants can deposit.' }
      }

      const confirmedCount = countConfirmedParticipants(room)
      const amount = calculateEstimatedPerPersonDeposit(room.estimatedFare, confirmedCount)
      const existing = ledgerByKeyRef.current.get(idempotencyKey)
      if (existing) {
        return {
          ok: true,
          replay: true,
          amount,
          confirmed: true,
          entry: existing,
          message: 'The same deposit request has already been processed.',
        }
      }

      const availablePoints = user.points - user.deposited
      if (availablePoints < amount) {
        return { ok: false, replay: false, message: 'Insufficient available points.' }
      }

      const resultingAvailableBalance = availablePoints - amount
      const entry: PointLedgerEntry = {
        id: `pl${Date.now()}-${ledger.length + 1}`,
        userId: user.id,
        actorUserId: user.id,
        relatedTripGroupId: roomId,
        reason: 'Deposit',
        idempotencyKey,
        amount: -amount,
        balanceEffect: -amount,
        resultingBalance: resultingAvailableBalance,
        createdAt: new Date().toISOString(),
      }

      const updatedMembers = room.members.map((member) =>
        member.id === user.id ? { ...member, status: 'DEPOSITED' as const } : member,
      )
      const updatedConfirmedCount = updatedMembers.filter((member) =>
        isCountedAsConfirmedParticipant(member.status),
      ).length
      const nextStatus = updatedConfirmedCount >= MIN_CONFIRMED_PARTICIPANTS ? 'CONFIRMED' : room.status

      ledgerByKeyRef.current.set(idempotencyKey, entry)
      setLedger((current) => [...current, entry])
      setUser((current) => ({
        ...current,
        deposited: current.deposited + amount,
      }))
      setRooms((current) =>
        current.map((item) =>
          item.id === roomId
            ? {
                ...item,
                status: nextStatus,
                members: updatedMembers,
              }
            : item,
        ),
      )
      setJoinedRoomIds((current) => (current.includes(roomId) ? current : [roomId, ...current]))
      setHistory((current) => [
        {
          id: `t${txCounter++}`,
          label: createDepositLabel(room.origin),
          amount: -amount,
          date: new Date(entry.createdAt).toLocaleDateString('ko-KR'),
        },
        ...current,
      ])

      return {
        ok: true,
        replay: false,
        amount,
        confirmed: nextStatus === 'CONFIRMED',
        entry,
        message: nextStatus === 'CONFIRMED' ? 'Deposit complete. The room is confirmed.' : 'Deposit complete.',
      }
    },
    [ledger.length, rooms, user.id, user.deposited, user.points],
  )

  const depositAndJoin = useCallback(
    (room: Room) => {
      const result = applyToRoom(room.id)
      return Boolean(result)
    },
    [applyToRoom],
  )

  const startRide = useCallback(
    (roomId: string) => {
      let changed = false

      setRooms((current) =>
        current.map((room) => {
          if (room.id !== roomId) return room
          if (!canStartRide(room.status)) return room
          changed = true
          return { ...room, status: 'IN_PROGRESS' }
        }),
      )

      return {
        ok: changed,
        replay: !changed,
        message: changed ? 'Ride started.' : 'Cannot start ride from the current state.',
      }
    },
    [],
  )

  const requestSettlement = useCallback(
    (roomId: string, actualTotal: number, idempotencyKey = `settle-request:${roomId}:${actualTotal}`) => {
      const room = rooms.find((item) => item.id === roomId)
      if (!room) {
        return { ok: false, replay: false, message: 'Group not found.' }
      }

      if (!canRequestSettlement(room.status)) {
        return { ok: false, replay: false, message: 'Settlement can only be requested from IN_PROGRESS.' }
      }

      if (!Number.isFinite(actualTotal) || actualTotal < 0) {
        return { ok: false, replay: false, message: 'Enter a valid actual fare.' }
      }

      const existing = settlementByKeyRef.current.get(idempotencyKey)
      if (existing) {
        return {
          ok: true,
          replay: true,
          pending: room.pendingSettlement ?? null,
          message: 'The same settlement request has already been processed.',
        }
      }

      const confirmedCount = countConfirmedParticipants(room)
      if (confirmedCount < MIN_CONFIRMED_PARTICIPANTS) {
        return { ok: false, replay: false, message: 'Not enough confirmed participants.' }
      }

      const settlementParticipantCount = confirmedCount
      const estimatedDeposit = calculateEstimatedPerPersonDeposit(room.estimatedFare, confirmedCount)
      const finalBurden = calculateFinalPerPersonBurden(actualTotal, settlementParticipantCount)
      const pending: PendingSettlement = {
        actualTotal,
        settlementParticipantCount,
        confirmedParticipantCount: confirmedCount,
        estimatedDeposit,
        finalBurden,
        delta: finalBurden - estimatedDeposit,
        idempotencyKey,
        requestedByUserId: user.id,
        requestedAt: new Date().toISOString(),
      }

      settlementByKeyRef.current.set(idempotencyKey, {
        id: `pl${Date.now()}-${ledger.length + 1}`,
        userId: user.id,
        actorUserId: user.id,
        relatedTripGroupId: roomId,
        reason: 'Settlement request',
        idempotencyKey,
        amount: 0,
        balanceEffect: 0,
        resultingBalance: user.points,
        createdAt: pending.requestedAt,
      })

      setRooms((current) =>
        current.map((item) =>
          item.id === roomId
            ? {
                ...item,
                status: 'SETTLEMENT_PENDING',
                pendingSettlement: pending,
              }
            : item,
        ),
      )
      setHistory((current) => [
        {
          id: `t${txCounter++}`,
          label: `Settlement requested · total fare ${actualTotal.toLocaleString('ko-KR')} KRW`,
          amount: 0,
          date: new Date(pending.requestedAt).toLocaleDateString('ko-KR'),
        },
        ...current,
      ])

      return {
        ok: true,
        replay: false,
        pending,
        message: 'Settlement request created.',
      }
    },
    [ledger.length, rooms, user.id, user.points],
  )

  const completeSettlement = useCallback(
    (roomId: string, idempotencyKey = `settle-complete:${roomId}`) => {
      const room = rooms.find((item) => item.id === roomId)
      if (!room) {
        return { ok: false, replay: false, message: 'Group not found.' }
      }

      if (!canCompleteSettlement(room.status)) {
        return { ok: false, replay: false, message: 'Settlement can only be completed from SETTLEMENT_PENDING.' }
      }

      const pending = room.pendingSettlement
      if (!pending) {
        return { ok: false, replay: false, message: 'Missing settlement request data.' }
      }

      const existing = settlementByKeyRef.current.get(idempotencyKey)
      if (existing) {
        return {
          ok: true,
          replay: true,
          entry: existing,
          message: 'The same settlement completion has already been processed.',
        }
      }

      const nextBalance = user.points - pending.finalBurden
      const entry: PointLedgerEntry = {
        id: `pl${Date.now()}-${ledger.length + 1}`,
        userId: user.id,
        actorUserId: user.id,
        relatedTripGroupId: roomId,
        reason: pending.delta >= 0 ? 'Final settlement additional charge' : 'Final settlement refund',
        idempotencyKey,
        amount: -pending.finalBurden,
        balanceEffect: -pending.finalBurden,
        resultingBalance: nextBalance,
        createdAt: new Date().toISOString(),
      }

      settlementByKeyRef.current.set(idempotencyKey, entry)
      setLedger((current) => [...current, entry])
      setUser((current) => ({
        ...current,
        points: nextBalance,
        deposited: 0,
      }))
      setRooms((current) =>
        current.map((item) =>
          item.id === roomId
            ? {
                ...item,
                status: 'COMPLETED',
                pendingSettlement: null,
                members: item.members.map((member) =>
                  isCountedAsConfirmedParticipant(member.status)
                    ? { ...member, status: 'COMPLETED' as const }
                    : member,
                ),
              }
            : item,
        ),
      )
      setHistory((current) => [
        {
          id: `t${txCounter++}`,
          label:
            pending.delta >= 0
              ? `Final settlement complete · additional charge ${Math.abs(pending.delta).toLocaleString('ko-KR')} KRW`
              : `Final settlement complete · refund ${Math.abs(pending.delta).toLocaleString('ko-KR')} KRW`,
          amount: -pending.finalBurden,
          date: new Date(entry.createdAt).toLocaleDateString('ko-KR'),
        },
        ...current,
      ])

      return {
        ok: true,
        replay: false,
        entry,
        message: 'Settlement completed.',
      }
    },
    [ledger.length, rooms, user.points],
  )

  const grantPoints = useCallback(
    (input: {
      targetLabel: string
      amount: number
      reason: string
      idempotencyKey: string
    }) => {
      if (!canManagePoints(user.role)) {
        return { ok: false, replay: false, message: 'Admin access required.' }
      }

      if (!input.targetLabel.trim()) {
        return { ok: false, replay: false, message: 'Enter a target user.' }
      }

      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        return { ok: false, replay: false, message: 'Enter a valid positive grant amount.' }
      }

      const existing = ledgerByKeyRef.current.get(input.idempotencyKey)
      if (existing) {
        return { ok: true, replay: true, entry: existing, message: 'The same grant request has already been processed.' }
      }

      const resultingBalance = user.points + input.amount
      const entry: PointLedgerEntry = {
        id: `pl${Date.now()}-${ledger.length + 1}`,
        userId: user.id,
        actorUserId: user.id,
        relatedTripGroupId: null,
        reason: input.reason.trim() || `Admin grant: ${input.targetLabel.trim()}`,
        idempotencyKey: input.idempotencyKey,
        amount: input.amount,
        balanceEffect: input.amount,
        resultingBalance,
        createdAt: new Date().toISOString(),
      }

      ledgerByKeyRef.current.set(input.idempotencyKey, entry)
      setLedger((current) => [...current, entry])
      setUser((current) => ({
        ...current,
        points: resultingBalance,
      }))
      setHistory((current) => [
        {
          id: `t${txCounter++}`,
          label: `Admin grant · ${input.targetLabel.trim()}`,
          amount: input.amount,
          date: new Date(entry.createdAt).toLocaleDateString('ko-KR'),
        },
        ...current,
      ])

      return { ok: true, replay: false, entry, message: 'Grant completed.' }
    },
    [ledger.length, user.points, user.role],
  )

  const settleAdjust = useCallback((delta: number) => {
    setUser((current) => ({
      ...current,
      points: current.points - delta,
      deposited: 0,
    }))
    addHistory({
      label: delta >= 0 ? 'Settlement additional charge' : 'Settlement refund',
      amount: -delta,
    })
  }, [addHistory])

  const value = useMemo(
    () => ({
      user,
      rooms,
      history,
      ledger,
      joinedRoomIds,
      toast,
      updateProfile,
      createRoom,
      applyToRoom,
      approveParticipant,
      closeRoom,
      depositAndJoin,
      depositForRoom,
      startRide,
      requestSettlement,
      completeSettlement,
      grantPoints,
      addHistory,
      settleAdjust,
    }),
    [
      user,
      rooms,
      history,
      ledger,
      joinedRoomIds,
      toast,
      updateProfile,
      createRoom,
      applyToRoom,
      approveParticipant,
      closeRoom,
      depositAndJoin,
      depositForRoom,
      startRide,
      requestSettlement,
      completeSettlement,
      grantPoints,
      addHistory,
      settleAdjust,
    ],
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} />
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
