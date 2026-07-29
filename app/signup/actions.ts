'use server'

import { validateProfileInput, type ProfileInput } from '@/lib/profile'

export async function submitSignupProfile(input: Partial<ProfileInput>) {
  const result = validateProfileInput(input)
  if (!result.ok) {
    return result
  }

  return {
    ok: true as const,
    profile: result.profile,
  }
}
