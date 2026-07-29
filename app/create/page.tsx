'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Calendar, Coins, Flag, Info, LocateFixed, MapPin, Route, Clock } from 'lucide-react'
import { BottomBar, BigButton } from '@/components/bottom-bar'
import { MobileShell } from '@/components/mobile-shell'
import { TabBar } from '@/components/tab-bar'
import { useApp } from '@/components/app-provider'
import { isValidTargetCapacity } from '@/lib/domain'
import { formatPoints, formatWon } from '@/lib/mock-data'
import { buildRouteSummary, estimateRouteAndFare } from '@/lib/matching/service'
import type { RouteEstimateSummary } from '@/lib/matching/service'
import { cn } from '@/lib/utils'

const departOptions = ['오늘 21:50', '오늘 22:30', '오늘 23:10'] as const

export default function CreateRoomPage() {
  const router = useRouter()
  const { toast, createRoom } = useApp()

  const [origin, setOrigin] = useState('전주캠퍼스')
  const [destination, setDestination] = useState('전북대 정문')
  const [departLabel, setDepartLabel] = useState<(typeof departOptions)[number]>(departOptions[1])
  const [maxSeats, setMaxSeats] = useState<2 | 3 | 4>(3)
  const [approval, setApproval] = useState<'auto' | 'host'>('auto')
  const [recruitmentCloseMethod, setRecruitmentCloseMethod] = useState<'departure-time' | 'host'>(
    'departure-time',
  )
  const [allowNearby, setAllowNearby] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  let routeEstimate: RouteEstimateSummary
  try {
    routeEstimate = buildRouteSummary(
      estimateRouteAndFare({
        origin,
        destination,
        departureLabel: departLabel,
        allowNearby,
      }),
    )
  } catch {
    routeEstimate = {
      providerName: 'MockDistanceProvider',
      providerBasis: 'fallback:heuristic-v1',
      distanceKm: 0,
      durationMin: 0,
      estimatedFare: 0,
      normalizedRoute: {
        origin,
        destination,
        departureLabel: departLabel,
        allowNearby,
        routeKey: '',
        detourPolicy: allowNearby ? 'nearby' : 'strict',
        fallbackUsed: true,
      },
      calculatedAt: new Date().toISOString(),
    }
  }
  const perPerson = Math.ceil(routeEstimate.estimatedFare / maxSeats)

  function handleCreate() {
    if (isSubmitting) return
    if (!origin.trim() || !destination.trim()) {
      toast('출발지와 도착지를 입력해 주세요.', 'warn')
      return
    }
    if (!isValidTargetCapacity(maxSeats)) {
      toast('모집 인원은 2명에서 4명 사이여야 합니다.', 'warn')
      return
    }

    setIsSubmitting(true)
    const room = createRoom({
      origin,
      destination,
      departLabel,
      maxSeats,
      approval,
      allowNearby,
      recruitmentCloseMethod,
    })

    setIsSubmitting(false)
    router.push(`/room/${room.id}`)
  }

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
        <h1 className="text-lg font-extrabold">그룹 만들기</h1>
        <p className="text-sm text-muted-foreground">출발지, 도착지, 모집 마감 방식을 먼저 정합니다.</p>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-5 py-6">
        <Field label="출발지">
          <div className="relative">
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="app-input pr-11"
              placeholder="예: 전주캠퍼스"
            />
            <button
              type="button"
              aria-label="현재 위치 사용"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
            >
              <LocateFixed className="size-4" />
            </button>
          </div>
        </Field>

        <Field label="도착지">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="app-input"
            placeholder="예: 전북대 정문"
          />
        </Field>

        <Field label="출발 시간">
          <div className="grid grid-cols-3 gap-2">
            {departOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDepartLabel(option)}
                className={cn(
                  'rounded-xl border py-3 text-sm font-semibold transition-colors',
                  departLabel === option
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </Field>

        <Field label="모집 인원">
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMaxSeats(n as 2 | 3 | 4)}
                className={cn(
                  'rounded-xl border py-3 text-sm font-bold transition-colors',
                  maxSeats === n
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {n}명
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">최소 2명, 최대 4명까지만 모집할 수 있습니다.</p>
        </Field>

        <Field label="참여 승인 방식">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'auto', label: '자동 승인' },
              { value: 'host', label: '방장 승인' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setApproval(option.value as 'auto' | 'host')}
                className={cn(
                  'rounded-xl border py-3 text-sm font-semibold transition-colors',
                  approval === option.value
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="모집 마감 방식">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'departure-time', label: '출발 시각' },
              { value: 'host', label: '방장 수동' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRecruitmentCloseMethod(option.value as 'departure-time' | 'host')}
                className={cn(
                  'rounded-xl border py-3 text-sm font-semibold transition-colors',
                  recruitmentCloseMethod === option.value
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="button"
          onClick={() => setAllowNearby((v) => !v)}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold">근처 목적지 허용</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {destination} 주변 목적지까지 같이 탈 수 있도록 허용합니다.
            </p>
          </div>
          <span
            className={cn(
              'relative h-7 w-12 shrink-0 rounded-full transition-colors',
              allowNearby ? 'bg-primary' : 'bg-border',
            )}
          >
            <span
              className={cn(
                'absolute top-1 size-5 rounded-full bg-card shadow transition-transform',
                allowNearby ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </span>
        </button>

        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="mb-3 text-sm font-bold">예상 요금</p>
          <div className="flex flex-col gap-2 text-sm">
            <Row icon={Route} label="예상 거리" value={`${routeEstimate.distanceKm.toFixed(1)}km`} />
            <Row icon={Clock} label="예상 소요 시간" value={`${routeEstimate.durationMin}분`} />
            <Row icon={Coins} label="예상 총액" value={formatWon(routeEstimate.estimatedFare)} />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-card px-4 py-3">
            <span className="text-sm font-semibold">{maxSeats}명 기준 1인 예상 분담금</span>
            <span className="text-lg font-extrabold text-foreground">{formatPoints(perPerson)}</span>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            예상 요금은 데모 값입니다. 실제 정산 금액은 이후 단계에서 확정됩니다.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            추정 제공자: {routeEstimate.providerName} · {routeEstimate.providerBasis}
          </p>
        </div>
      </div>

      <BottomBar>
        <BigButton onClick={handleCreate} disabled={isSubmitting}>
          {isSubmitting ? '만드는 중...' : '조건으로 그룹 만들기'}
        </BigButton>
      </BottomBar>

      <TabBar />
    </MobileShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>
      {children}
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
