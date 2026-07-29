export type Gender = 'female' | 'male' | 'none'

export interface ProfileInput {
  phoneNumber: string
  name: string
  gender: Gender
  universityEmail: string
}

export interface UserProfile extends ProfileInput {
  id: string
}

export interface ProfileValidationResult {
  ok: true
  profile: ProfileInput
}

export interface ProfileValidationError {
  ok: false
  errors: Record<string, string>
}

export type ProfileValidationOutcome = ProfileValidationResult | ProfileValidationError

const phonePattern = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
const universityEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('01')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return value.trim()
}

export function normalizeProfileInput(input: ProfileInput): ProfileInput {
  return {
    phoneNumber: normalizePhoneNumber(input.phoneNumber),
    name: input.name.trim(),
    gender: input.gender,
    universityEmail: input.universityEmail.trim().toLowerCase(),
  }
}

export function validateProfileInput(input: Partial<ProfileInput>): ProfileValidationOutcome {
  const errors: Record<string, string> = {}

  const phoneNumber = input.phoneNumber?.trim() ?? ''
  const name = input.name?.trim() ?? ''
  const universityEmail = input.universityEmail?.trim() ?? ''

  if (!phoneNumber) {
    errors.phoneNumber = '전화번호를 입력해 주세요.'
  } else if (!phonePattern.test(phoneNumber.replace(/\s+/g, ''))) {
    errors.phoneNumber = '전화번호 형식이 올바르지 않아요.'
  }

  if (!name) {
    errors.name = '이름을 입력해 주세요.'
  }

  if (!input.gender || !['female', 'male', 'none'].includes(input.gender)) {
    errors.gender = '성별을 선택해 주세요.'
  }

  if (!universityEmail) {
    errors.universityEmail = '대학 이메일을 입력해 주세요.'
  } else if (!universityEmailPattern.test(universityEmail)) {
    errors.universityEmail = '이메일 형식이 올바르지 않아요.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    profile: normalizeProfileInput({
      phoneNumber,
      name,
      gender: input.gender as Gender,
      universityEmail,
    }),
  }
}
