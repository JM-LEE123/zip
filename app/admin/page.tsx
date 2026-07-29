'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Search, ShieldCheck } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { MobileShell } from '@/components/mobile-shell'
import { TopBar } from '@/components/top-bar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminGrants, formatPoints } from '@/lib/mock-data'
import { canManagePoints } from '@/lib/domain'

interface GrantRow {
  id: string
  name: string
  studentId: string
  email: string
  amount: number
  reason: string
  date: string
}

function buildIdempotencyKey(target: string, amount: string, reason: string) {
  return `grant:${target.trim().toLowerCase()}:${amount.trim()}:${reason.trim().toLowerCase()}`
}

function formatStamp(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(
    2,
    '0',
  )} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function AdminPage() {
  const router = useRouter()
  const { toast, user, ledger, grantPoints } = useApp()

  const [query, setQuery] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [grants, setGrants] = useState<GrantRow[]>(adminGrants)

  const totalGranted = useMemo(
    () => ledger.filter((entry) => entry.balanceEffect > 0).reduce((sum, entry) => sum + entry.amount, 0),
    [ledger],
  )

  if (!canManagePoints(user.role)) {
    return (
      <MobileShell>
        <TopBar title="Admin" onBack={() => router.push('/mypage')} />
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <Card className="gap-2 p-5">
            <p className="text-base font-bold text-foreground">Admin access required.</p>
            <p className="text-sm text-muted-foreground">Point grants are restricted to administrators.</p>
          </Card>
        </div>
      </MobileShell>
    )
  }

  function handleGrant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const amt = Number(amount)
    const idempotencyKey = buildIdempotencyKey(query, amount, reason)
    const result = grantPoints({
      targetLabel: query,
      amount: amt,
      reason: reason.trim() || 'Admin grant',
      idempotencyKey,
    })

    if (!result.ok) {
      toast(result.message, 'warn')
      return
    }

    if (!result.replay) {
      const now = new Date()
      setGrants((rows) => [
        {
          id: result.entry?.id ?? `g-${Date.now()}`,
          name: query.includes('@') ? query.split('@')[0] : query,
          studentId: query.includes('@') ? '-' : query,
          email: query.includes('@') ? query : `${query}@jbnu.ac.kr`,
          amount: amt,
          reason: reason.trim() || 'Admin grant',
          date: formatStamp(now),
        },
        ...rows,
      ])
    }

    toast(result.message, result.replay ? 'warn' : 'success')
    setQuery('')
    setAmount('')
    setReason('')
  }

  return (
    <MobileShell>
      <TopBar title="Admin · Point Grant" onBack={() => router.push('/mypage')} />
      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4">
        <Card className="mb-5 flex items-center gap-3 border-primary/30 bg-primary/5 p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total granted</p>
            <p className="text-lg font-bold text-foreground">{formatPoints(totalGranted)}</p>
          </div>
        </Card>

        <form onSubmit={handleGrant}>
          <Card className="mb-6 flex flex-col gap-4 p-5">
            <div>
              <label htmlFor="target" className="mb-1.5 block text-sm font-medium text-foreground">
                Target user
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="target"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="app-input pl-9"
                  placeholder="student ID or email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-foreground">
                Amount
              </label>
              <input
                id="amount"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="app-input"
                placeholder="30000"
              />
            </div>
            <div>
              <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-foreground">
                Reason
              </label>
              <input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="app-input"
                placeholder="Initial grant"
              />
            </div>
            <Button type="submit" className="h-12 w-full gap-2 rounded-xl text-base font-semibold">
              <Gift className="size-5" aria-hidden />
              Grant points
            </Button>
          </Card>
        </form>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Grant history</h2>
          <span className="text-xs text-muted-foreground">{grants.length} items</span>
        </div>
        <div className="flex flex-col gap-2">
          {grants.map((grant) => (
            <Card key={grant.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {grant.name} · {grant.studentId}
                </p>
                <p className="truncate text-xs text-muted-foreground">{grant.reason}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{grant.date}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-mint">+{formatPoints(grant.amount)}</span>
            </Card>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}
