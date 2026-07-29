'use client'

import { useRouter } from 'next/navigation'
import {
  Bell,
  ChevronRight,
  FileText,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { MobileShell } from '@/components/mobile-shell'
import { TopBar } from '@/components/top-bar'
import { TabBar } from '@/components/tab-bar'
import { Card } from '@/components/ui/card'
import { formatPoints } from '@/lib/mock-data'
import { canManagePoints } from '@/lib/domain'

export default function MyPage() {
  const router = useRouter()
  const { user, toast } = useApp()

  const genderLabel = user.gender === 'female' ? '여성' : user.gender === 'male' ? '남성' : '미선택'

  const menu = [
    { icon: Bell, label: '알림 설정', onClick: () => toast('알림 설정은 준비 중입니다.') },
    { icon: ShieldCheck, label: '개인정보 보호', onClick: () => toast('개인정보 보호 안내를 준비 중입니다.') },
    { icon: FileText, label: '약관 · 정책', onClick: () => toast('약관 페이지는 준비 중입니다.') },
  ]

  return (
    <MobileShell>
      <TopBar
        title="마이페이지"
        back={false}
        right={
          canManagePoints(user.role) ? (
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              관리자
            </button>
          ) : null
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
        <Card className="mb-4 flex items-center gap-4 p-5">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-foreground">{user.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="size-3.5" aria-hidden />
              {user.universityEmail} · {genderLabel}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{user.phoneNumber}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.universityEmail}</p>
          </div>
        </Card>

        <Card
          className="mb-6 cursor-pointer p-5 transition-colors hover:bg-card/70"
          onClick={() => router.push('/points')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-mint/15 text-mint">
                <Wallet className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">보유 포인트</p>
                <p className="text-lg font-bold text-foreground">{formatPoints(user.points)}</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          </div>
          {user.deposited > 0 && (
            <p className="mt-3 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn-foreground">
              예치 중 {formatPoints(user.deposited)} · 정산 후 반환예정
            </p>
          )}
        </Card>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {menu.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted ${
                index !== menu.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="flex items-center gap-3 text-sm text-foreground">
                <item.icon className="size-4 text-muted-foreground" aria-hidden />
                {item.label}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
          로그아웃
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">TaxiTa v0.1 · 대학생 카풀 플랫폼</p>
      </div>
      <TabBar />
    </MobileShell>
  )
}
