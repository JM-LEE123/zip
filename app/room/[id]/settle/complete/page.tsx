'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { Card, CardTitle } from '@/components/ui/card'
import { BottomBar, BigButton } from '@/components/bottom-bar'
import { useApp } from '@/components/app-provider'
import { calculateEstimatedPerPersonDeposit, calculateFinalPerPersonBurden, isCountedAsConfirmedParticipant } from '@/lib/domain'
import { formatPoints, formatWon, getRoomById } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function SettleCompletePage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  )
}

function Content() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const { rooms, completeSettlement, toast } = useApp()
  const room = rooms.find((r) => r.id === params.id) ?? getRoomById(params.id)
  const fare = Number(search.get('fare')) || room?.pendingSettlement?.actualTotal || 13500

  if (!room) return null

  const confirmed = room.members.filter((m) => isCountedAsConfirmedParticipant(m.status)).length
  const deposit = room.pendingSettlement?.estimatedDeposit ?? calculateEstimatedPerPersonDeposit(room.estimatedFare, confirmed)
  const finalShare = room.pendingSettlement?.finalBurden ?? calculateFinalPerPersonBurden(fare, confirmed)
  const delta = room.pendingSettlement?.delta ?? finalShare - deposit
  const isPending = room.status === 'SETTLEMENT_PENDING'
  const isCompleted = room.status === 'COMPLETED'

  const timeline = [
    { label: 'Admin deposit grant', amount: 30000 },
    { label: 'Deposit hold', amount: -4000 },
    { label: delta >= 0 ? 'Additional deduction' : 'Refund', amount: delta >= 0 ? -delta : Math.abs(delta) },
    { label: 'Final settlement', amount: -finalShare },
  ]

  function finish() {
    const result = completeSettlement(room.id)
    if (!result.ok) {
      toast(result.message, 'warn')
      return
    }

    toast(result.message, 'success')
  }

  return (
    <MobileShell withTabBar={false}>
      <div className="flex flex-1 flex-col px-6 pb-32 pt-14">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-mint text-mint-foreground shadow-lg shadow-mint/30 animate-in zoom-in">
            <CheckCircle2 className="size-11" strokeWidth={2.4} />
          </span>
          <h1 className="mt-6 text-2xl font-extrabold">
            {isCompleted ? 'Settlement complete' : 'Settlement pending'}
          </h1>
        </div>

        <Card className="mt-8 gap-2">
          <div className="flex items-center justify-center gap-2 pb-2 text-sm font-bold">
            <span>{room?.origin ?? 'Origin'}</span>
            <ArrowRight className="size-4 text-muted-foreground" />
            <span>{room?.destination ?? 'Destination'}</span>
          </div>
          <Row label="Actual total fare" value={formatWon(fare)} />
          <Row label="Confirmed participants" value={`${confirmed} people`} />
          <div className="border-t border-border pt-2">
            <Row label="Final per-person burden" value={formatPoints(finalShare)} emphasize />
          </div>
          <Row label="Deposit amount" value={formatPoints(deposit)} />
          <Row
            label={delta >= 0 ? 'Additional deduction' : 'Refund'}
            value={`${delta >= 0 ? '-' : '+'} ${formatPoints(Math.abs(delta))}`}
            tone={delta >= 0 ? 'warn' : 'mint'}
          />
        </Card>

        <div className="mt-4">
          <CardTitle className="mb-3">Settlement history</CardTitle>
          <ol className="relative flex flex-col gap-4 border-l-2 border-border pl-5">
            {timeline.map((item, index) => (
              <li key={index} className="relative">
                <span
                  className={cn(
                    'absolute -left-[27px] top-0.5 size-3 rounded-full ring-4 ring-background',
                    item.amount >= 0 ? 'bg-mint' : 'bg-warn',
                  )}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className={cn('text-sm font-bold', item.amount >= 0 ? 'text-mint' : 'text-warn')}>
                    {item.amount >= 0 ? '+' : ''}
                    {formatPoints(item.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <BottomBar>
        {isCompleted ? (
          <Link href="/home" className="block">
            <BigButton>Back to home</BigButton>
          </Link>
        ) : (
          <BigButton onClick={finish} disabled={!isPending}>
            Complete settlement
          </BigButton>
        )}
      </BottomBar>
    </MobileShell>
  )
}

function Row({
  label,
  value,
  emphasize,
  tone,
}: {
  label: string
  value: string
  emphasize?: boolean
  tone?: 'warn' | 'mint'
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-semibold',
          emphasize && 'text-base font-extrabold text-foreground',
          tone === 'warn' && 'font-bold text-warn',
          tone === 'mint' && 'font-bold text-mint',
        )}
      >
        {value}
      </span>
    </div>
  )
}
