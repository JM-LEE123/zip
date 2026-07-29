'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MessageCircle, MapPin, ShieldCheck, Check, Clock } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { TopBar } from '@/components/top-bar'
import { Card, CardTitle } from '@/components/ui/card'
import { BottomBar, BigButton } from '@/components/bottom-bar'
import { StatusBadge } from '@/components/status-badge'
import { Avatar } from '@/components/avatar'
import { useApp } from '@/components/app-provider'
import { getRoomById } from '@/lib/mock-data'

export default function GatheringPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { rooms, toast, startRide } = useApp()
  const room = rooms.find((r) => r.id === params.id) ?? getRoomById(params.id)

  const [seconds, setSeconds] = useState(8 * 60 + 24)
  const [arrived, setArrived] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  if (!room) return null

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const participants = [...room.members.map((m) => ({ name: m.displayName, role: m.role, checkedIn: m.role === 'host' }))]

  function handleProceed() {
    const result = startRide(room.id)
    if (!result.ok) {
      toast(result.message, 'warn')
      return
    }

    toast(result.message, 'success')
    router.push(`/room/${room.id}/settle`)
  }

  return (
    <MobileShell withTabBar={false}>
      <TopBar title="GATHERING" subtitle={`${room.origin} → ${room.destination}`} />

      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        <div className="flex flex-col items-center rounded-3xl bg-foreground px-6 py-8 text-background">
          <StatusBadge tone="brand" className="mb-4">
            IN_PROGRESS
          </StatusBadge>
          <p className="text-sm text-background/70">Arrival countdown</p>
          <p className="mt-1 font-mono text-5xl font-extrabold tabular-nums">
            {mm}:{ss}
          </p>
        </div>

        <Card className="gap-2">
          <CardTitle>Pickup point</CardTitle>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-5 text-info" />
            <p className="text-sm font-semibold leading-relaxed">
              Meet near {room.origin} and wait for the vehicle.
            </p>
          </div>
        </Card>

        <Card className="gap-3">
          <CardTitle>Participants</CardTitle>
          <div className="flex flex-col gap-2">
            {participants.map((p, i) => {
              const isMe = i === 1
              const checked = isMe ? arrived : p.checkedIn
              return (
                <div key={i} className="flex items-center gap-3">
                  <Avatar name={p.name} index={i} size="sm" />
                  <span className="text-sm font-semibold">
                    {maskName(p.name)}
                    {isMe ? ' (me)' : ''}
                  </span>
                  {checked ? (
                    <StatusBadge tone="mint" className="ml-auto" icon={Check}>
                      arrived
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="muted" className="ml-auto" icon={Clock}>
                      waiting
                    </StatusBadge>
                  )}
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => toast('Chat is a placeholder in this sprint.')}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-bold"
          >
            <MessageCircle className="size-4" />
            Open chat
          </button>
        </Card>

        <Card className="gap-1.5 border-info/30 bg-info-soft">
          <div className="flex items-center gap-1.5 text-sm font-bold text-info">
            <ShieldCheck className="size-4" />
            Safety note
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">
            Personal details stay hidden until the group reaches the confirmed stage.
          </p>
        </Card>
      </div>

      <BottomBar className="flex flex-col gap-2">
        <BigButton tone={arrived ? 'mint' : 'primary'} onClick={() => setArrived(true)}>
          {arrived ? (
            <>
              <Check className="size-5" />
              Arrived
            </>
          ) : (
            'Mark arrived'
          )}
        </BigButton>
        <BigButton tone="outline" onClick={handleProceed}>
          Start settlement
        </BigButton>
      </BottomBar>
    </MobileShell>
  )
}

function maskName(name: string) {
  if (name.length <= 1) return name
  return name[0] + '*'.repeat(name.length - 1)
}
