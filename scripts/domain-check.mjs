import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const ts = require('typescript')

function loadDomainModule() {
  const source = readFileSync(new URL('../lib/domain.ts', import.meta.url), 'utf8')
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

const domain = loadDomainModule()

assert.equal(
  JSON.stringify(domain.GROUP_STATUSES),
  JSON.stringify([
    'DRAFT',
    'OPEN',
    'CLOSED',
    'CONFIRMED',
    'IN_PROGRESS',
    'SETTLEMENT_PENDING',
    'COMPLETED',
    'CANCELLED',
    'EXPIRED',
  ]),
)

assert.equal(
  JSON.stringify(domain.PARTICIPANT_STATUSES),
  JSON.stringify(['APPLIED', 'APPROVED', 'DEPOSITED', 'CHECKED_IN', 'NO_SHOW', 'COMPLETED', 'CANCELLED']),
)

assert.equal(domain.isValidTargetCapacity(2), true)
assert.equal(domain.isValidTargetCapacity(4), true)
assert.equal(domain.isValidTargetCapacity(1), false)
assert.equal(domain.isValidTargetCapacity(5), false)

assert.equal(
  domain.canAcceptApplication({
    groupStatus: 'OPEN',
    currentParticipantCount: 2,
    maxSeats: 4,
  }),
  true,
)
assert.equal(
  domain.canAcceptApplication({
    groupStatus: 'CLOSED',
    currentParticipantCount: 2,
    maxSeats: 4,
  }),
  false,
)
assert.equal(
  domain.canAcceptApplication({
    groupStatus: 'OPEN',
    currentParticipantCount: 4,
    maxSeats: 4,
  }),
  false,
)

assert.equal(domain.canHostCloseRecruitment('OPEN'), true)
assert.equal(domain.canHostCloseRecruitment('CONFIRMED'), false)
assert.equal(domain.canApproveParticipant('OPEN', 'APPLIED'), true)
assert.equal(domain.canApproveParticipant('OPEN', 'APPROVED'), false)
assert.equal(domain.canApproveParticipant('CLOSED', 'APPLIED'), false)
assert.equal(domain.canDepositParticipant('OPEN', 'APPROVED'), true)
assert.equal(domain.canDepositParticipant('CLOSED', 'APPROVED'), true)
assert.equal(domain.canDepositParticipant('EXPIRED', 'APPROVED'), false)
assert.equal(domain.canDepositParticipant('OPEN', 'APPLIED'), false)
assert.equal(domain.canStartRide('CONFIRMED'), true)
assert.equal(domain.canStartRide('OPEN'), false)
assert.equal(domain.canRequestSettlement('IN_PROGRESS'), true)
assert.equal(domain.canRequestSettlement('CONFIRMED'), false)
assert.equal(domain.canCompleteSettlement('SETTLEMENT_PENDING'), true)
assert.equal(domain.canCompleteSettlement('COMPLETED'), false)
assert.equal(domain.canManagePoints('admin'), true)
assert.equal(domain.canManagePoints('user'), false)

assert.equal(domain.canConfirmGroup(2), true)
assert.equal(domain.canConfirmGroup(1), false)
assert.equal(domain.isCountedAsConfirmedParticipant('APPLIED'), false)
assert.equal(domain.isCountedAsConfirmedParticipant('APPROVED'), true)
assert.equal(domain.isRecruitmentOpen('OPEN'), true)
assert.equal(domain.isRecruitmentOpen('CLOSED'), false)
assert.equal(typeof domain.getGroupStatusLabel('OPEN'), 'string')
assert.equal(domain.resolveRecruitmentClosureStatus(2), 'CLOSED')
assert.equal(domain.resolveRecruitmentClosureStatus(1), 'EXPIRED')

assert.equal(domain.calculateEstimatedPerPersonDeposit(18000, 3), 6000)
assert.equal(domain.calculateFinalPerPersonBurden(15001, 3), 5001)

const settlement = domain.calculateSettlementDelta({
  estimatedTotal: 18000,
  actualTotal: 15001,
  confirmedParticipantCount: 3,
  settlementParticipantCount: 3,
})

assert.equal(
  JSON.stringify(settlement),
  JSON.stringify({
    estimatedDeposit: 6000,
    finalBurden: 5001,
    delta: -999,
  }),
)

assert.throws(() => domain.calculateEstimatedPerPersonDeposit(1000, 0), /positive integer/)
assert.throws(() => domain.calculateFinalPerPersonBurden(1000, 0), /positive integer/)

console.log('domain checks passed')
