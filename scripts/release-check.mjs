import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const ts = require('typescript')

function loadDbEnvModule() {
  const source = readFileSync(new URL('../lib/db/env.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  })

  const module = { exports: {} }
  runInNewContext(outputText, {
    module,
    exports: module.exports,
    require,
    console,
    process,
  })

  return module.exports
}

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')
const projectJson = JSON.parse(readFileSync(new URL('../.vercel/project.json', import.meta.url), 'utf8'))
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const dbEnv = loadDbEnvModule()

for (const envName of [
  'DATABASE_URL',
  'DATABASE_URL_PREVIEW',
  'DATABASE_URL_PRODUCTION',
  'MAP_PROVIDER_KEY',
  'AI_API_KEY',
]) {
  assert.ok(envExample.includes(envName), `missing ${envName} in .env.example`)
}

assert.equal(typeof projectJson.projectId, 'string')
assert.equal(typeof projectJson.orgId, 'string')
assert.equal(typeof projectJson.projectName, 'string')

for (const scriptName of ['build', 'lint', 'test:domain', 'test:matching', 'test:profile', 'test:schema']) {
  assert.equal(typeof packageJson.scripts?.[scriptName], 'string', `missing script ${scriptName}`)
}

assert.equal(
  dbEnv.getNeonDatabaseTarget({ VERCEL_ENV: 'production' }),
  'production',
)
assert.equal(
  dbEnv.getNeonDatabaseTarget({ VERCEL_ENV: 'preview' }),
  'preview',
)
assert.equal(
  dbEnv.getNeonDatabaseTarget({}),
  'development',
)

assert.equal(
  dbEnv.getNeonDatabaseUrl({
    VERCEL_ENV: 'production',
    DATABASE_URL_PRODUCTION: 'postgres://prod',
    DATABASE_URL: 'postgres://fallback',
  }),
  'postgres://prod',
)
assert.equal(
  dbEnv.getNeonDatabaseUrl({
    VERCEL_ENV: 'preview',
    DATABASE_URL_PREVIEW: 'postgres://preview',
    DATABASE_URL: 'postgres://fallback',
  }),
  'postgres://preview',
)
assert.equal(
  dbEnv.getNeonDatabaseUrl({
    DATABASE_URL: 'postgres://dev',
  }),
  'postgres://dev',
)

assert.doesNotThrow(() => dbEnv.assertNeonDatabaseConfigured({
  VERCEL_ENV: 'preview',
  DATABASE_URL_PREVIEW: 'postgres://preview',
}))

assert.throws(
  () => dbEnv.assertNeonDatabaseConfigured({ VERCEL_ENV: 'production' }),
  /not configured/i,
)

console.log('release checks passed')
