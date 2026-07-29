import Link from 'next/link'
import { ArrowRight, Clock, Navigation, Sparkles, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { AvatarStack } from '@/components/avatar'
import { formatPoints, type Room } from '@/lib/mock-data'
import { getGroupStatusLabel } from '@/lib/domain'
import type { MatchRecommendation } from '@/lib/matching/matcher'

export function RoomCard({ room, recommendation }: { room: Room; recommendation?: MatchRecommendation }) {
  const seatsLeft = room.maxSeats - room.members.length
  const statusTone =
    room.status === 'OPEN' ? 'mint' : room.status === 'EXPIRED' ? 'warn' : room.status === 'CLOSED' ? 'brand' : 'muted'

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge tone={statusTone as 'brand' | 'mint' | 'info' | 'warn' | 'muted'}>
          {getGroupStatusLabel(room.status)}
        </StatusBadge>
        {recommendation ? (
          <StatusBadge tone="info">
            추천 {recommendation.score}점
          </StatusBadge>
        ) : null}
        {room.status === 'OPEN' && seatsLeft > 0 ? (
          <StatusBadge tone="brand" icon={Users}>
            {seatsLeft}석 남음
          </StatusBadge>
        ) : null}
        <StatusBadge tone="warn" icon={Clock}>
          출발 {room.minutesUntilDepart}분 전
        </StatusBadge>
      </div>

      <div className="flex items-center gap-2 text-lg font-bold">
        <span>{room.origin}</span>
        <ArrowRight className="size-4 text-muted-foreground" />
        <span>{room.destination}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" />
          {room.departLabel} 출발
        </span>
        <AvatarStack names={room.members.map((m) => m.displayName)} max={room.maxSeats} />
      </div>

      <div className="rounded-xl bg-info-soft p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-info">
          <Sparkles className="size-3.5" />
          추천 근거
        </div>
        <ul className="flex flex-col gap-1 text-xs text-foreground/80">
          <li className="flex items-center gap-1.5">
            <Navigation className="size-3.5 text-info" />
            출발지와 {room.reason.fromOriginMeters}m
          </li>
          <li className="flex items-center gap-1.5">
            <Navigation className="size-3.5 text-info" />
            목적지와 {room.reason.toDestMeters}m
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-info" />
            예상 우회 시간 {room.reason.detourMinutes}분
          </li>
        </ul>
        <div className="mt-2 border-t border-info/10 pt-2 text-[11px] text-foreground/70">
          {room.routeEstimate.providerName} · {room.routeEstimate.distanceKm.toFixed(1)}km · {room.routeEstimate.durationMin}분
        </div>
        {recommendation ? (
          <div className="mt-2 rounded-lg bg-card/80 px-2.5 py-2 text-[11px] leading-relaxed text-foreground/80">
            {recommendation.recommendationReason}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-xs text-muted-foreground">1인 예상 분담금</p>
          <p className="text-lg font-extrabold text-foreground">{formatPoints(room.perPersonPoints)}</p>
        </div>
        <Link
          href={`/room/${room.id}`}
          className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-transform active:scale-95"
        >
          상세 보기
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </Card>
  )
}
