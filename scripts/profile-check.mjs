import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const ts = require('typescript')

function loadProfileModule() {
  const source = readFileSync(new URL('../lib/profile.ts', import.meta.url), 'utf8')
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

const profile = loadProfileModule()

const valid = profile.validateProfileInput({
  phoneNumber: '01012345678',
  name: '  민지  ',
  gender: 'female',
  universityEmail: 'MINJI@JBNU.AC.KR',
})

assert.equal(valid.ok, true)
assert.equal(JSON.stringify(valid.profile), JSON.stringify({
  phoneNumber: '010-1234-5678',
  name: '민지',
  gender: 'female',
  universityEmail: 'minji@jbnu.ac.kr',
}))

const invalid = profile.validateProfileInput({
  phoneNumber: '123',
  name: '',
  gender: 'female',
  universityEmail: 'not-an-email',
})

assert.equal(invalid.ok, false)
assert.equal(Boolean(invalid.errors.phoneNumber), true)
assert.equal(Boolean(invalid.errors.name), true)
assert.equal(Boolean(invalid.errors.universityEmail), true)

console.log('profile checks passed')
