export type NeonDatabaseTarget = 'development' | 'preview' | 'production'

export function getNeonDatabaseTarget(env: NodeJS.ProcessEnv = process.env): NeonDatabaseTarget {
  const vercelEnv = env.VERCEL_ENV
  if (vercelEnv === 'preview') return 'preview'
  if (vercelEnv === 'production') return 'production'
  return 'development'
}

export function getNeonDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  const target = getNeonDatabaseTarget(env)

  if (target === 'production') {
    return env.DATABASE_URL_PRODUCTION ?? env.DATABASE_URL ?? ''
  }

  if (target === 'preview') {
    return env.DATABASE_URL_PREVIEW ?? env.DATABASE_URL ?? ''
  }

  return env.DATABASE_URL ?? ''
}

export function assertNeonDatabaseConfigured(env: NodeJS.ProcessEnv = process.env) {
  const url = getNeonDatabaseUrl(env)
  if (!url) {
    throw new Error('Neon database URL is not configured for the active environment.')
  }

  return {
    target: getNeonDatabaseTarget(env),
    configured: true as const,
  }
}
