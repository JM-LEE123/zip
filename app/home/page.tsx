'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, Coins, Info, Plus, Sparkles } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { TabBar } from '@/components/tab-bar'
import { RoomCard } from '@/components/room-card'
import { BrandLogo } from '@/components/brand-logo'
import { EmptyState } from '@/components/empty-state'
import { Card } from '@/components/ui/card'
import { useApp } from '@/components/app-provider'
import { formatPoints } from '@/lib/mock-data'
import { recommendMatchRooms, explainMatchFallback } from '@/lib/matching/matcher'
import { cn } from '@/lib/utils'

const filters = ['전체', '추천 우선', '같은 목적지', '출발 임박']

export default function HomePage() {
  const { user, rooms } = useApp()
  const [active, setActive] = useState('추천 우선')
  const [origin, setOrigin] = useState('전주캠퍼스')
  const [destination, setDestination] = useState('전북대 정문')
  const [departureLabel, setDepartureLabel] = useState('오늘 22:30')
  const [allowNearbyDestination, setAllowNearbyDestination] = useState(true)

  const recommendations = useMemo(() => {
    return recommendMatchRooms(
      rooms,
      {
        requesterUserId: user.id,
        origin,
        destination,
        departureLabel,
        allowNearbyDestination,
      },
      {
        maxDetourMinutes: allowNearbyDestination ? 6 : 0,
      },
    )
  }, [rooms, user.id, origin, destination, departureLabel, allowNearbyDestination])

  const recommendationByRoomId = new Map(
    recommendations.map((item) => [item.matchedTripGroupId, item]),
  )

  const recommendedRooms = recommendations
    .map((item) => rooms.find((room) => room.id === item.matchedTripGroupId))
    .filter((room): room is (typeof rooms)[number] => Boolean(room))

  const visibleRooms =
    active === '출발 임박'
      ? [...rooms].sort((a, b) => a.minutesUntilDepart - b.minutesUntilDepart)
      : active === '같은 목적지'
        ? rooms.filter((room) => room.destination === destination)
        : active === '추천 우선'
          ? recommendedRooms
          : rooms

  const fallbackRecommendation =
    recommendations.length > 0
      ? null
      : explainMatchFallback({
          requesterUserId: user.id,
          origin,
          destination,
          departureLabel,
          allowNearbyDestination,
        })

  return (
    <MobileShell>
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <BrandLogo size="sm" />
        <button
          type="button"
          aria-label="알림"
          className="relative flex size-10 items-center justify-center rounded-full bg-card shadow-sm"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-warn" />
        </button>
      </header>

      <div className="px-5">
        <h1 className="text-xl font-extrabold">안녕하세요 {user.name}님</h1>
      </div>

      <div className="px-5 pt-3">
        <Link
          href="/points"
          className="block rounded-2xl bg-foreground p-4 text-background shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Coins className="size-5" />
              </span>
              <div>
                <p className="text-xs text-background/70">보유 포인트</p>
                <p className="text-lg font-extrabold">{formatPoints(user.points)}</p>
              </div>
            </div>
            <span className="rounded-full bg-background/15 px-3 py-1 text-xs font-semibold">
              내역 보기
            </span>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-background/70">
            <Info className="size-3.5" />
            포인트는 관리자 지급 방식으로만 운영됩니다.
          </p>
        </Link>
      </div>

      <section className="mt-6 px-5">
        <Card className="gap-4 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold">매칭 추천 입력</p>
              <p className="text-xs text-muted-foreground">입력값과 그룹 경로를 비교해 eligible open group만 보여줍니다.</p>
            </div>
          </div>

          <div className="grid gap-3">
            <Field label="출발지">
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="app-input" />
            </Field>
            <Field label="도착지">
              <input value={destination} onChange={(e) => setDestination(e.target.value)} className="app-input" />
            </Field>
            <Field label="출발 시간">
              <div className="grid grid-cols-3 gap-2">
                {['오늘 21:50', '오늘 22:30', '오늘 23:10'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setDepartureLabel(time)}
                    className={cn(
                      'rounded-xl border py-2 text-sm font-semibold transition-colors',
                      departureLabel === time
                        ? 'border-primary bg-primary/15 text-foreground'
                        : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <button
            type="button"
            onClick={() => setAllowNearbyDestination((v) => !v)}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold">근처 목적지 허용</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {allowNearbyDestination ? '허용 중' : '허용 안 함'}
              </p>
            </div>
            <span
              className={cn(
                'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                allowNearbyDestination ? 'bg-primary' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 size-5 rounded-full bg-card shadow transition-transform',
                  allowNearbyDestination ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </span>
          </button>
        </Card>
      </section>

      <section className="mt-6 flex-1 px-5">
        <h2 className="text-lg font-extrabold">추천 그룹</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          조건에 맞는 모집 중 그룹을 점수순으로 보여줍니다.
        </p>

        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                active === f
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {visibleRooms.length > 0 ? (
            visibleRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                recommendation={recommendationByRoomId.get(room.id)}
              />
            ))
          ) : (
            <EmptyState
              label={
                fallbackRecommendation
                  ? fallbackRecommendation.recommendationReason
                  : '조건에 맞는 그룹이 없습니다.'
              }
            />
          )}
        </div>

        <Link
          href="/create"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-primary/10 py-4 text-base font-bold text-foreground transition-transform active:scale-[0.98]"
        >
          <Plus className="size-5" />
          새 그룹 만들기
        </Link>
      </section>

      <TabBar />
    </MobileShell>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>
      {children}
    </div>
  )
}
