'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  currentUser as initialUser,
  recommendedRooms,
  pointHistory as initialHistory,
  type CurrentUser,
  type PointTx,
  type Room,
} from '@/lib/mock-data'
import {
  canAcceptApplication,
  canHostCloseRecruitment,
  isCountedAsConfirmedParticipant,
} from '@/lib/domain'
import { Toaster } from '@/components/ui/toast'

interface AppState {
  user: CurrentUser
  rooms: Room[]
  history: PointTx[]
  joinedRoomIds: string[]
  toast: (message: string, tone?: 'default' | 'success' | 'warn') => void
  updateProfile: (profile: Pick<CurrentUser, 'phoneNumber' | 'name' | 'gender' | 'universityEmail'>) => void
  depositAndJoin: (room: Room) => boolean
  closeRoom: (roomId: string) => boolean
  addHistory: (tx: Omit<PointTx, 'id' | 'date'>) => void
  settleAdjust: (delta: number) => void
}

const AppContext = createContext<AppState | null>(null)

let txCounter = 100

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(initialUser)
  const [rooms, setRooms] = useState<Room[]>(recommendedRooms)
  const [history, setHistory] = useState<PointTx[]>(initialHistory)
  const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([])
  const [toasts, setToasts] = useState<
    { id: number; message: string; tone: 'default' | 'success' | 'warn' }[]
  >([])

  const toast = useCallback(
    (message: string, tone: 'default' | 'success' | 'warn' = 'default') => {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t, { id, message, tone }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
    },
    [],
  )

  const addHistory = useCallback((tx: Omit<PointTx, 'id' | 'date'>) => {
    setHistory((h) => [
      { ...tx, id: `t${txCounter++}`, date: '2026.07.29' },
      ...h,
    ])
  }, [])

  const updateProfile = useCallback(
    (profile: Pick<CurrentUser, 'phoneNumber' | 'name' | 'gender' | 'universityEmail'>) => {
      setUser((u) => ({
        ...u,
        ...profile,
      }))
    },
    [],
  )

  const depositAndJoin = useCallback(
    (room: Room) => {
      if (room.members.some((m) => m.id === initialUser.id)) {
        toast('이미 참여한 방이에요.', 'warn')
        return false
      }

      const participantCount = room.members.filter((m) =>
        isCountedAsConfirmedParticipant(m.status),
      ).length
      if (
        !canAcceptApplication({
          groupStatus: room.status,
          currentParticipantCount: participantCount,
          maxSeats: room.maxSeats,
        })
      ) {
        toast('모집이 마감되었거나 정원이 가득 찬 방에는 참여할 수 없어요.', 'warn')
        return false
      }

      setUser((u) => ({
        ...u,
        points: u.points - room.perPersonPoints,
        deposited: u.deposited + room.perPersonPoints,
      }))
      setRooms((rs) =>
        rs.map((r) =>
          r.id === room.id
            ? {
                ...r,
                members: r.members.some((m) => m.id === initialUser.id)
                  ? r.members
                  : [
                      ...r.members,
                      {
                        id: initialUser.id,
                        displayName: initialUser.name,
                        role: 'member',
                        status: 'DEPOSITED',
                        checkedIn: false,
                      },
                    ],
              }
            : r,
        ),
      )
      setJoinedRoomIds((ids) =>
        ids.includes(room.id) ? ids : [...ids, room.id],
      )
      addHistory({ label: '방 참여 예치', amount: -room.perPersonPoints })
      return true
    },
    [addHistory, toast],
  )

  const closeRoom = useCallback(
    (roomId: string) => {
      let updated = false
      setRooms((rs) =>
        rs.map((r) => {
          if (r.id !== roomId) return r
          if (!canHostCloseRecruitment(r.status)) return r
          updated = true
          return { ...r, status: 'CLOSED' }
        }),
      )
      if (!updated) {
        toast('이미 마감된 방이거나 마감할 수 없는 상태예요.', 'warn')
      }
      return updated
    },
    [toast],
  )

  const settleAdjust = useCallback(
    (delta: number) => {
      // delta > 0: 추가 차감, delta < 0: 반환
      setUser((u) => ({
        ...u,
        points: u.points - Math.max(delta, 0) + Math.max(-delta, 0),
        deposited: 0,
      }))
      addHistory({
        label: delta >= 0 ? '최종 정산 추가 차감' : '정산 차액 반환',
        amount: -delta,
      })
    },
    [addHistory],
  )

  const value = useMemo(
    () => ({
      user,
      rooms,
      history,
      joinedRoomIds,
      toast,
      updateProfile,
      depositAndJoin,
      closeRoom,
      addHistory,
      settleAdjust,
    }),
    [user, rooms, history, joinedRoomIds, toast, updateProfile, depositAndJoin, closeRoom, addHistory, settleAdjust],
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
