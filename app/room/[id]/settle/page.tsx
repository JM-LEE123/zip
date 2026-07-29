'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Camera, Info, Receipt } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { TopBar } from '@/components/top-bar'
import { Card, CardTitle } from '@/components/ui/card'
import { BottomBar, BigButton } from '@/components/bottom-bar'
import { useApp } from '@/components/app-provider'
import {
  calculateEstimatedPerPersonDeposit,
  calculateFinalPerPersonBurden,
  isCountedAsConfirmedParticipant,
} from '@/lib/domain'
import { formatPoints, formatWon, getRoomById } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function SettlePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { rooms, requestSettlement, toast } = useApp()
  const room = rooms.find((r) => r.id === params.id) ?? getRoomById(params.id)

  const [view, setView] = useState<'host' | 'member'>('host')
  const [fare, setFare] = useState(13500)

  if (!room) return null

  const confirmed = room.members.filter((m) => isCountedAsConfirmedParticipant(m.status)).length
  const deposit = calculateEstimatedPerPersonDeposit(room.estimatedFare, confirmed)
  const finalShare = calculateFinalPerPersonBurden(fare, confirmed)
  const diff = finalShare - deposit

  function request() {
    const result = requestSettlement(room.id, fare)
    if (!result.ok) {
      toast(result.message, 'warn')
      return
    }

    toast(result.message, 'success')
    router.push(`/room/${room.id}/settle/complete?fare=${fare}`)
  }

  return (
    <MobileShell withTabBar={false}>
      <TopBar title="Settlement request" subtitle={`${room.origin} → ${room.destination}`} />

      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs font-semibold">
          {[
            { v: 'host', label: 'Host view' },
            { v: 'member', label: 'Member view' },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setView(o.v as 'host' | 'member')}
              className={cn(
                'flex-1 rounded-full py-2 transition-colors',
                view === o.v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        {view === 'host' ? (
          <>
            <div>
              <h2 className="text-lg font-extrabold">Enter actual fare</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                The next screen will move the group into SETTLEMENT_PENDING.
              </p>
            </div>

            <Card className="gap-2">
              <label className="text-sm font-bold">Actual total fare</label>
              <div className="relative">
                <input
                  inputMode="numeric"
                  value={fare}
                  onChange={(e) => setFare(Number(e.target.value.replace(/\D/g, '')) || 0)}
                  className="app-input pr-10 text-lg font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  원
                </span>
              </div>
              <button
                type="button"
                onClick={() => toast('Receipt upload remains a placeholder in this sprint.')}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground"
              >
                <Camera className="size-4" />
                Attach receipt
              </button>
            </Card>

            <SettlePreview fare={fare} confirmed={confirmed} finalShare={finalShare} deposit={deposit} diff={diff} />

            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              No-show participants are still counted by the confirmed settlement count in this sprint.
            </p>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-extrabold">Review settlement</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Settlement uses the same ceiling-based calculation as the deposit preview.
              </p>
            </div>

            <Card className="gap-2">
              <Row label="Actual total fare" value={formatWon(fare)} />
              <Row label="Confirmed participants" value={`${confirmed} people`} />
              <div className="border-t border-border pt-2">
                <Row label="Final per-person burden" value={formatPoints(finalShare)} emphasize />
              </div>
              <Row label="Deposit amount" value={formatPoints(deposit)} />
              <Row
                label={diff >= 0 ? 'Additional deduction' : 'Refund'}
                value={`${diff >= 0 ? '-' : '+'} ${formatPoints(Math.abs(diff))}`}
                tone={diff >= 0 ? 'warn' : 'mint'}
              />
            </Card>

            <div className="flex items-center gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-xs leading-relaxed text-foreground/80">
              <Receipt className="size-4 shrink-0 text-warn" />
              The next step will record the final settlement and clear reserved deposits.
            </div>
          </>
        )}
      </div>

      <BottomBar className="flex flex-col gap-2">
        <BigButton onClick={request}>
          Request settlement
        </BigButton>
      </BottomBar>
    </MobileShell>
  )
}

function SettlePreview({
  fare,
  confirmed,
  finalShare,
  deposit,
  diff,
}: {
  fare: number
  confirmed: number
  finalShare: number
  deposit: number
  diff: number
}) {
  return (
    <Card className="gap-2 bg-secondary/40">
      <CardTitle>Settlement preview</CardTitle>
      <Row label="Actual total fare" value={formatWon(fare)} />
      <Row label="Confirmed participants" value={`${confirmed} people`} />
      <Row label="Final per-person burden" value={formatPoints(finalShare)} emphasize />
      <Row label="Deposit amount" value={formatPoints(deposit)} />
      <div className="border-t border-border pt-2">
        <Row
          label={diff >= 0 ? 'Additional deduction' : 'Refund'}
          value={`${diff >= 0 ? '-' : '+'} ${formatPoints(Math.abs(diff))}`}
          tone={diff >= 0 ? 'warn' : 'mint'}
        />
      </div>
    </Card>
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
