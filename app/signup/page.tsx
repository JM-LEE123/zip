'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Info } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { TopBar } from '@/components/top-bar'
import { BottomBar, BigButton } from '@/components/bottom-bar'
import { useApp } from '@/components/app-provider'
import { submitSignupProfile } from './actions'
import { cn } from '@/lib/utils'

const genders = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'none', label: '선택 안 함' },
] as const

export default function SignupPage() {
  const router = useRouter()
  const { toast, updateProfile } = useApp()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<(typeof genders)[number]['value']>('female')
  const [universityEmail, setUniversityEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const canSubmit = phoneNumber && name && universityEmail && agree && !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return
    setIsSubmitting(true)
    setFieldErrors({})

    const result = await submitSignupProfile({
      phoneNumber,
      name,
      gender,
      universityEmail,
    })

    if (!result.ok) {
      setFieldErrors(result.errors)
      toast('입력값을 다시 확인해 주세요.', 'warn')
      setIsSubmitting(false)
      return
    }

    updateProfile(result.profile)
    toast('가입이 완료되었어요. 환영합니다!', 'success')
    setIsSubmitting(false)
    router.push('/home')
  }

  return (
    <MobileShell withTabBar={false} className="bg-background">
      <TopBar title="회원가입" subtitle="TaxiTa 쉐어를 쓰기 위한 기본 프로필" />

      <div className="flex flex-1 flex-col gap-5 px-5 py-6 pb-32">
        <Field label="전화번호" error={fieldErrors.phoneNumber}>
          <input
            inputMode="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="예: 010-1234-5678"
            className="app-input"
          />
        </Field>

        <Field label="이름" error={fieldErrors.name}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해 주세요"
            className="app-input"
          />
        </Field>

        <Field label="성별" error={fieldErrors.gender}>
          <div className="grid grid-cols-3 gap-2">
            {genders.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender(g.value)}
                className={cn(
                  'rounded-xl border py-3 text-sm font-semibold transition-colors',
                  gender === g.value
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="대학 이메일" error={fieldErrors.universityEmail}>
          <input
            type="email"
            value={universityEmail}
            onChange={(e) => setUniversityEmail(e.target.value)}
            placeholder="예: minji@jbnu.ac.kr"
            className="app-input"
          />
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            대학 이메일은 가입 확인용 입력값입니다. MVP에서는 별도 인증을 하지 않습니다.
          </p>
        </Field>

        <button
          type="button"
          onClick={() => setAgree((a) => !a)}
          className="mt-1 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
        >
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors',
              agree
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background',
            )}
          >
            {agree ? <Check className="size-4" /> : null}
          </span>
          <span className="text-sm font-medium">개인정보 수집 및 이용에 동의합니다.</span>
        </button>
      </div>

      <BottomBar>
        <BigButton onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? '확인 중...' : '가입하고 시작하기'}
        </BigButton>
      </BottomBar>
    </MobileShell>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>
      {children}
      {error ? <p className="mt-2 text-xs font-medium text-warn">{error}</p> : null}
    </div>
  )
}
