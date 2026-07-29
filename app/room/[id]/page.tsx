'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Coins,
  Clock,
  Flag as FlagIcon,
  MapPin,
  Navigation,
  ShieldAlert,
  Share2,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { BottomBar, BigButton } from '@/components/bottom-bar'
import { Card, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { MobileShell } from '@/components/mobile-shell'
import { RouteMap } from '@/components/route-map'
import { StatusBadge } from '@/components/status-badge'
import { TopBar } from '@/components/top-bar'
import { useApp } from '@/components/app-provider'
import { getGroupStatusLabel, isCountedAsConfirmedParticipant } from '@/lib/domain'
import { formatPoints, formatWon, getRoomById } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const {
    rooms,
    user,
    applyToRoom,
    approveParticipant,
    closeRoom,
    joinedRoomIds,
    toast,
  } = useApp()

  const room = rooms.find((r) => r.id === params.id) ?? getRoomById(params.id)
  const [view, setView] = useState<'member' | 'host'>('member')
  const [closeOpen, setCloseOpen] = useState(false)

  if (!room) {
    return (
      <MobileShell withTabBar={false}>
        <TopBar title="방 정보" />
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
          찾을 수 없는 그룹입니다.
        </div>
      </MobileShell>
    )
  }

  const closed = room.status !== 'OPEN'
  const joined = joinedRoomIds.includes(room.id)
  const confirmedCount = room.members.filter((m) => isCountedAsConfirmedParticipant(m.status)).length
  const myMember = room.members.find((m) => m.id === user.id)
  const isHost = room.members.some((m) => m.id === user.id && m.role === 'host')
  const route = room.routeEstimate

  function handleApply() {
    const result = applyToRoom(room.id)
    if (!result) return

    if (result === 'approved') {
      router.push(`/room/${room.id}/confirm?result=approved`)
      return
    }

    router.push(`/room/${room.id}/confirm?result=applied`)
  }

  function handleApprove(participantId: string) {
    if (approveParticipant(room.id, participantId)) {
      toast('신청을 승인했습니다.', 'success')
    }
  }

  function handleClose() {
    const result = closeRoom(room.id)
    if (!result) return

    setCloseOpen(false)
    if (result === 'CLOSED') {
      router.push(`/room/${room.id}/confirm?result=closed`)
      return
    }

    router.push(`/room/${room.id}/confirm?result=expired`)
  }

  return (
    <MobileShell withTabBar={false}>
      <TopBar
        title="그룹 상세"
        right={
          <>
            <button
              type="button"
              aria-label="공유"
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <Share2 className="size-5" />
            </button>
            <button
              type="button"
              aria-label="신고"
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <FlagIcon className="size-5" />
            </button>
          </>
        }
      />

      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs font-semibold">
          {[
            { v: 'member', label: '참여자 화면' },
            { v: 'host', label: '방장 화면' },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setView(o.v as 'member' | 'host')}
              className={cn(
                'flex-1 rounded-full py-2 transition-colors',
                view === o.v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={room.status === 'OPEN' ? 'mint' : room.status === 'EXPIRED' ? 'warn' : 'brand'}>
            {getGroupStatusLabel(room.status)}
          </StatusBadge>
          <StatusBadge tone="warn" icon={Clock}>
            출발까지 {room.minutesUntilDepart}분
          </StatusBadge>
          <StatusBadge tone="muted" icon={Users}>
            {room.members.length}/{room.maxSeats}
          </StatusBadge>
        </div>

        <Card className="gap-3 p-0">
          <RouteMap origin={room.origin} destination={room.destination} className="h-40 rounded-b-none" />
          <div className="flex flex-col gap-2 p-4">
            <Line icon={MapPin} tone="text-info" label="출발지" value={room.origin} />
            <Line icon={FlagIcon} tone="text-warn" label="도착지" value={room.destination} />
            <Line icon={Clock} tone="text-foreground" label="출발 시간" value={room.departLabel} />
          </div>
        </Card>

        <Card className="gap-3">
          <CardTitle>참여자</CardTitle>
          <div className="flex flex-col gap-2">
            {room.members.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
                <Avatar name={m.displayName} index={i} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{maskName(m.displayName)}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.role === 'host' ? '방장' : '참여자'} · {participantLabel(m.status)}
                  </p>
                </div>
                {m.role === 'host' ? (
                  <StatusBadge tone="brand" className="ml-auto">
                    방장
                  </StatusBadge>
                ) : m.status === 'APPLIED' && isHost && room.status === 'OPEN' ? (
                  <button
                    type="button"
                    onClick={() => handleApprove(m.id)}
                    className="ml-auto rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    승인
                  </button>
                ) : (
                  <StatusBadge tone={m.status === 'APPLIED' ? 'muted' : 'mint'} className="ml-auto">
                    {participantLabel(m.status)}
                  </StatusBadge>
                )}
              </div>
            ))}

            {Array.from({ length: Math.max(room.maxSeats - room.members.length, 0) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <UserPlus className="size-4" />
                </span>
                참여자 모집 중
              </div>
            ))}
          </div>
        </Card>

        <Card className="gap-2">
          <CardTitle>요금 정보</CardTitle>
          <InfoRow label="예상 총액" value={formatWon(room.estimatedFare)} />
          <InfoRow label="확정 참여자 수" value={`${confirmedCount}명`} />
          <InfoRow label="1인 예상 분담금" value={formatPoints(room.perPersonPoints)} emphasize />
        </Card>

        <Card className="gap-2 border-info/30 bg-info-soft">
          <CardTitle>경로 / 요금 추정</CardTitle>
          <InfoRow label="제공자" value={route.providerName} />
          <InfoRow label="근거" value={route.providerBasis} />
          <InfoRow label="이동 거리" value={`${route.distanceKm.toFixed(1)}km`} />
          <InfoRow label="예상 소요" value={`${route.durationMin}분`} />
          <InfoRow label="계산 시각" value={new Date(route.calculatedAt).toLocaleString('ko-KR')} />
        </Card>

        <Card className="gap-2 border-info/30 bg-info-soft">
          <div className="flex items-center gap-1.5 text-sm font-bold text-info">
            <Sparkles className="size-4" />
            추천 근거
          </div>
          <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
            <li className="flex items-center gap-2">
              <Navigation className="size-4 text-info" />
              출발지와의 거리 {room.reason.fromOriginMeters}m
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-info" />
              목적지와의 차이 {room.reason.toDestMeters}m
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-info" />
              예상 우회 시간 {room.reason.detourMinutes}분
            </li>
          </ul>
        </Card>

        <Card className="gap-2 border-warn/30 bg-warn-soft">
          <div className="flex items-center gap-1.5 text-sm font-bold text-warn">
            <ShieldAlert className="size-4" />
            모집 규칙
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">
            모집이 닫히면 새로운 신청과 승인을 받지 않습니다. 최소 인원이 부족하면 그룹은 만료됩니다.
          </p>
        </Card>
      </div>

      <BottomBar>
        {view === 'host' ? (
          <BigButton tone="warn" onClick={() => setCloseOpen(true)} disabled={closed || !isHost}>
            {closed ? '이미 마감됨' : '모집 마감하기'}
          </BigButton>
        ) : joined ? (
          <BigButton tone="mint" onClick={() => router.push(`/room/${room.id}/confirm?result=${myMember?.status === 'APPROVED' ? 'approved' : 'applied'}`)}>
            신청 상태 보기
          </BigButton>
        ) : (
          <BigButton onClick={handleApply} disabled={closed}>
            <Coins className="size-5" />
            {room.approval === 'auto' ? '바로 참여 신청' : '참여 신청하기'}
          </BigButton>
        )}
      </BottomBar>

      <Modal open={closeOpen} onClose={() => setCloseOpen(false)}>
        <h2 className="text-lg font-extrabold">모집을 마감할까요?</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          마감하면 새 신청과 승인은 중단됩니다. 최소 인원이 부족하면 만료 처리됩니다.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <BigButton tone="warn" onClick={handleClose}>
            모집 마감
          </BigButton>
          <BigButton tone="outline" onClick={() => setCloseOpen(false)}>
            취소
          </BigButton>
        </div>
      </Modal>
    </MobileShell>
  )
}

function maskName(name: string) {
  if (name.length <= 1) return name
  return name[0] + '*'.repeat(name.length - 1)
}

function participantLabel(status: string) {
  switch (status) {
    case 'APPLIED':
      return '신청 대기'
    case 'APPROVED':
      return '승인 완료'
    case 'DEPOSITED':
      return '예치 완료'
    case 'CHECKED_IN':
      return '탑승 확인'
    case 'NO_SHOW':
      return '노쇼'
    case 'COMPLETED':
      return '완료'
    case 'CANCELLED':
      return '취소'
    default:
      return status
  }
}

function Line({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={cn('size-4', tone)} />
      <span className="w-16 text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function InfoRow({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', emphasize && 'text-base font-extrabold text-foreground')}>
        {value}
      </span>
    </div>
  )
}
