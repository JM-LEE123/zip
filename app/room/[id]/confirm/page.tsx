'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Clock, Sparkles, UserCheck } from 'lucide-react'
import { BottomBar, BigButton } from '@/components/bottom-bar'
import { Card } from '@/components/ui/card'
import { MobileShell } from '@/components/mobile-shell'
import { useApp } from '@/components/app-provider'
import { calculateEstimatedPerPersonDeposit, canDepositParticipant, getGroupStatusLabel } from '@/lib/domain'
import { formatPoints, getRoomById } from '@/lib/mock-data'

export default function ConfirmPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, rooms, toast, depositForRoom } = useApp()
  const room = rooms.find((r) => r.id === params.id) ?? getRoomById(params.id)
  const result = searchParams.get('result') ?? 'applied'

  if (!room) {
    return (
      <MobileShell withTabBar={false}>
        <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground">
          Group not found.
        </div>
      </MobileShell>
    )
  }

  const participant = room.members.find((m) => m.id === user.id)
  const confirmedCount = room.members.filter((m) => m.status === 'APPROVED' || m.status === 'DEPOSITED').length
  const depositAmount = calculateEstimatedPerPersonDeposit(room.estimatedFare, Math.max(confirmedCount, 1))
  const canDeposit = Boolean(participant && canDepositParticipant(room.status, participant.status))
  const isDeposited = participant?.status === 'DEPOSITED'
  const isConfirmed = room.status === 'CONFIRMED'

  function handleDeposit() {
    const idempotencyKey = `deposit:${room.id}:${user.id}`
    const outcome = depositForRoom(room.id, idempotencyKey)

    if (!outcome.ok) {
      toast(outcome.message, 'warn')
      return
    }

    toast(outcome.message, 'success')
    router.replace(`/room/${room.id}/confirm?result=${outcome.confirmed ? 'confirmed' : 'deposited'}`)
  }

  const headline =
    result === 'confirmed'
      ? 'Group confirmed'
      : result === 'deposited'
        ? 'Deposit complete'
        : result === 'approved'
          ? 'Application approved'
          : result === 'closed'
            ? 'Recruitment closed'
            : result === 'expired'
              ? 'Group expired'
              : 'Application received'

  const subline =
    result === 'confirmed'
      ? 'The group now meets the minimum deposit threshold.'
      : result === 'deposited'
        ? 'Your deposit has been recorded.'
        : result === 'approved'
          ? 'You can review the deposit amount before confirming.'
          : result === 'closed'
            ? 'Recruitment has ended. Please wait for the next step.'
            : result === 'expired'
              ? 'The group did not reach the minimum participant threshold.'
              : 'Your request is waiting for host review.'

  return (
    <MobileShell withTabBar={false}>
      <div className="flex flex-1 flex-col px-6 pb-32 pt-16 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-mint text-mint-foreground shadow-lg shadow-mint/30 animate-in zoom-in">
          {result === 'expired' ? <Clock className="size-10" strokeWidth={3} /> : <Check className="size-10" strokeWidth={3} />}
        </span>

        <h1 className="mt-6 text-2xl font-extrabold">{headline}</h1>
        <p className="mt-2 text-sm font-semibold text-mint">{subline}</p>

        <Card className="mt-8 w-full gap-3 text-left">
          <Breakdown label="User" value={user.name} />
          <Breakdown label="Status" value={getGroupStatusLabel(room.status)} />
          <Breakdown label="Deposit amount" value={formatPoints(depositAmount)} />
          <div className="border-t border-border pt-3">
            <Breakdown label="Your state" value={isDeposited ? 'DEPOSITED' : participant?.status ?? 'UNKNOWN'} emphasize />
          </div>
        </Card>

        <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary/50 px-4 py-3 text-sm font-semibold text-secondary-foreground">
          <span>{room.origin}</span>
          <ArrowRight className="size-4" />
          <span>{room.destination}</span>
        </div>

        <div className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-left">
          <UserCheck className="size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            The deposit step records your points and unlocks confirmed-group status once the minimum is met.
          </p>
        </div>

        <Card className="mt-4 w-full gap-2 border-info/30 bg-info-soft text-left">
          <div className="flex items-center gap-1.5 text-sm font-bold text-info">
            <Sparkles className="size-4" />
            Deposit preview
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">
            Deposit is calculated as `ceil(estimated_total / confirmed_participant_count)`.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confirmed participants</span>
            <span className="font-semibold">{confirmedCount} people</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Can deposit</span>
            <span className="font-semibold">{canDeposit ? 'Yes' : 'No'}</span>
          </div>
        </Card>
      </div>

      <BottomBar>
        {isConfirmed ? (
          <Link href={`/room/${room.id}/gathering`} className="block">
            <BigButton>Go to gathering</BigButton>
          </Link>
        ) : canDeposit ? (
          <BigButton onClick={handleDeposit}>Pay deposit</BigButton>
        ) : (
          <Link href={`/room/${room.id}`} className="block">
            <BigButton tone="outline">Back to room</BigButton>
          </Link>
        )}
      </BottomBar>
    </MobileShell>
  )
}

function Breakdown({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasize ? 'text-lg font-extrabold text-foreground' : 'text-sm font-semibold'}>
        {value}
      </span>
    </div>
  )
}
