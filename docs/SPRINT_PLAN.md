# TaxiTa MVP Sprint Plan

- 기준 문서: `docs/PRD.md`, `AGENTS.md`
- 최초 작성일: 2026-07-29
- 운영 방식: 각 항목은 완료 시 `[x]`로 바꾸고, 스프린트별 `검증 기록`에 실행한 명령, 테스트, 리뷰 결과를 남긴다.
- MVP 원칙: PRD에 없는 결제, 택시 호출/배차, 사용자 직접 충전/현금화, 자동 참여/자동 승인/자동 정산은 구현하지 않는다.

## 상태 표기

| 표기 | 의미 |
| --- | --- |
| `[ ]` | 미착수 |
| `[~]` | 진행 중. Markdown 체크박스 표준은 아니므로 필요할 때만 임시로 사용 |
| `[x]` | 완료. 완료 기준과 검증 기록이 함께 채워져야 함 |
| `[!]` | 보류. 승인 필요 항목 또는 외부 의존성 때문에 진행 불가 |

## 문서 업데이트 규칙

- 작업 시작 시 해당 스프린트의 첫 항목을 `[~]`로 표시한다.
- 기능 단위가 완료되면 `[x]`로 변경하고, 같은 스프린트의 `검증 기록`에 근거를 남긴다.
- PRD의 오픈 이슈나 법무/운영/제공자 승인이 필요한 사항은 `승인 필요 결정`에 추가한다.
- 상태 머신, 포인트, 정산, 권한, 개인정보 노출 규칙이 바뀌면 관련 스프린트 체크리스트와 `MVP 불변조건 체크리스트`를 함께 갱신한다.
- 배포 전에는 `Sprint 11`의 릴리즈 체크리스트를 모두 통과해야 한다.

## 전체 개발 순서

1. Sprint 0: 기준 정리, 인코딩/현황 점검, 작업 게이트 설정
2. Sprint 1: 도메인 모델, 상태 머신, 테스트 기반 구축
3. Sprint 2: 인증/프로필 완료 게이트, 개인정보 최소 노출
4. Sprint 3: Neon PostgreSQL 스키마, 저장소 계층, 감사 기반
5. Sprint 4: 모집방 생성, 모집 마감, 참여 신청/승인
6. Sprint 5: 지도/경로/요금 provider adapter와 견적 저장
7. Sprint 6: 매칭 점수, 근거 저장, AI 설명 fallback
8. Sprint 7: 관리자 포인트 지급, 원장, 잔액, 멱등성
9. Sprint 8: 예치/확정 플로우, 그룹 확정, 집결 전 개인정보 공개 단계
10. Sprint 9: 이동/집결, 노쇼, 실제 요금 입력, 최종 정산
11. Sprint 10: 신고/차단, 알림, 운영자 검토 흐름
12. Sprint 11: 보안/회귀/접근성/Preview 릴리즈 준비

## 스프린트별 PRD 범위와 Required Skill

| Sprint | 주요 PRD 범위 | Required skill |
| --- | --- | --- |
| 0 | 문서 기준, 오픈 이슈, 검증 게이트 | `$taxita-domain-engineering`, `$taxita-quality-gates` |
| 1 | 상태 정의, 계산식, MVP 불변조건 | `$taxita-domain-engineering`, `$taxita-quality-gates` |
| 2 | 회원가입, 프로필, 권한, 개인정보 최소 노출 | `$taxita-api-and-auth`, `$taxita-mobile-ui`, `$vercel-react-best-practices`, `$web-design-guidelines` |
| 3 | 데이터 모델, migrations, transactions, audit | `$taxita-neon-data`, `$taxita-api-and-auth` |
| 4 | 방 생성, 모집 마감, 참여 신청/승인, state transition | `$taxita-domain-engineering`, `$taxita-api-and-auth`, `$taxita-mobile-ui` |
| 5 | 지도 provider, 경로/요금 견적, provider fallback | `$taxita-matching-engine`, `$taxita-neon-data` |
| 6 | 매칭 점수, detour, AI recommendation reason | `$taxita-matching-engine`, `$taxita-domain-engineering` |
| 7 | 관리자 포인트 지급, ledger, idempotency | `$taxita-settlement-safety`, `$taxita-neon-data`, `$taxita-api-and-auth` |
| 8 | 예치, 참여 확정, 그룹 확정, 개인정보 공개 단계 | `$taxita-settlement-safety`, `$taxita-domain-engineering`, `$taxita-mobile-ui` |
| 9 | 실제 요금, 노쇼, 최종 정산, 환불/추가 차감 | `$taxita-settlement-safety`, `$taxita-neon-data`, `$taxita-quality-gates` |
| 10 | 신고, 차단, 알림, 운영자 검토 | `$taxita-domain-engineering`, `$taxita-api-and-auth`, `$taxita-mobile-ui` |
| 11 | 보안/회귀/접근성/빌드/Preview readiness | `$taxita-quality-gates`, `$taxita-release-readiness`, `$deploy-to-vercel` |

## Sprint 0 - 기준 정리와 작업 게이트

목표: PRD와 AGENTS를 구현 가능한 백로그로 고정하고, 앞으로 변경 사항을 안전하게 추적할 수 있게 한다.

- [ ] `docs/PRD.md` 한글 인코딩이 편집기와 터미널에서 정상 표시되는지 확인하고, 필요 시 별도 승인 후 인코딩을 정리한다.
- [ ] 현재 구현이 mock/prototype인지, 실제 durable backend가 있는지 파일 단위로 현황을 기록한다.
- [ ] PRD 요구사항 ID와 스프린트 항목 간 추적표를 만든다.
- [ ] 스프린트별 필수 skill 라우팅을 작업 티켓 템플릿에 반영한다.
- [ ] `npm run lint`, `npm run build` 실행 가능 여부를 확인하고 제한 사항을 기록한다.
- [ ] 릴리즈 전 금지 작업 목록을 팀 규칙으로 고정한다: Production 배포, Vercel 프로젝트 연결, 환경변수 변경, production data operation은 명시 승인 없이는 금지.

완료 기준:

- [ ] PRD/AGENTS 기반의 추적 가능한 스프린트 문서가 존재한다.
- [ ] 승인 필요 결정이 별도 목록으로 관리된다.
- [ ] 현재 repo 상태와 검증 명령의 사용 가능 여부가 기록되어 있다.

검증 기록:

- 작성 예정.

## Sprint 1 - 도메인 모델과 상태 머신

목표: UI와 DB 구현 전에 TaxiTa 핵심 불변조건을 TypeScript 타입, validation, 상태 전이 규칙으로 고정한다.

- [ ] 그룹 상태를 `DRAFT`, `OPEN`, `CLOSED`, `CONFIRMED`, `IN_PROGRESS`, `SETTLEMENT_PENDING`, `COMPLETED`, `CANCELLED`, `EXPIRED`로 정의한다.
- [ ] 참여자 상태를 `APPLIED`, `APPROVED`, `DEPOSITED`, `CHECKED_IN`, `NO_SHOW`, `COMPLETED`, `CANCELLED`로 정의한다.
- [ ] 그룹 정원 2-4명, 최소 확정 2명, 모집 마감 후 신청/승인 거절 규칙을 도메인 함수로 구현한다.
- [ ] AI 결과가 신청, 승인, 확정, 정산, 사용자 상태 변경을 수행하지 못하게 경계를 정의한다.
- [ ] 예치금 `ceil(estimated_total / confirmed_participant_count)`와 최종 부담금 `ceil(actual_total / settlement_participant_count)` 계산 함수를 만든다.
- [ ] 상태 전이, 정원, 마감, 금액 계산에 대한 focused unit tests를 추가한다.

완료 기준:

- [ ] 도메인 상태와 전이 규칙이 client mock string에 의존하지 않는다.
- [ ] 실패해야 하는 상태 전이 테스트가 포함되어 있다.
- [ ] 금액 계산 반올림과 노쇼 기준 인원 정책 테스트가 포함되어 있다.

검증 기록:

- 작성 예정.

## Sprint 2 - 인증, 프로필 완료 게이트, 개인정보 보호

목표: 그룹 생성, 참여, 포인트 작업 전에 서버에서 사용자 신원과 프로필 완료 상태를 검증한다.

- [ ] 사용자 profile 필드를 정의한다: phone number, name, gender, university email.
- [ ] MVP에서는 phone/university email verification을 구현하지 않는다는 UX 문구와 서버 정책을 분리한다.
- [ ] 프로필 미완료 사용자의 그룹 생성, 참여 신청, 포인트 작업을 서버에서 차단한다.
- [ ] 사용자/host/admin 권한 확인 helper를 route handler 또는 server action 경계에 둔다.
- [ ] 정확한 주소, 전화번호, 포인트 잔액, 정산 상세가 lifecycle 단계와 권한에 맞게만 노출되도록 policy를 정의한다.
- [ ] 모바일 우선 signup/profile 화면에 loading, empty, error, disabled 상태를 반영한다.

완료 기준:

- [ ] client가 보낸 user id, role, balance를 신뢰하는 코드 경로가 없다.
- [ ] 프로필 게이트가 UI뿐 아니라 서버에서도 검증된다.
- [ ] 개인정보 노출 단계가 테스트 또는 정책 테이블로 확인 가능하다.

검증 기록:

- 작성 예정.

## Sprint 3 - Neon PostgreSQL 스키마와 저장소 계층

목표: MVP의 durable state를 Neon PostgreSQL에 저장할 수 있는 스키마, migration, typed repository를 만든다.

- [ ] users/profile 테이블을 설계한다.
- [ ] trip_groups 테이블에 host, origin, destination, departure time, recruitment close method, target capacity, status를 저장한다.
- [ ] trip_participants 테이블에 participant state, role, timestamps, cancellation/no-show fields를 저장한다.
- [ ] fare_estimates, match_recommendations, settlements, point_ledger, reports, blocks 테이블을 설계한다.
- [ ] point_ledger는 append-only audit record로 actor, reason, related trip, idempotency key, amount, balance effect를 포함한다.
- [ ] settlement와 point mutation에 필요한 transaction boundary를 repository/API 레벨에서 설계한다.
- [ ] Preview/Production database 분리와 server-only `DATABASE_URL` 환경변수 이름을 문서화한다. 값은 출력하지 않는다.

완료 기준:

- [ ] schema가 PRD의 주요 entity를 모두 표현한다.
- [ ] ledger mutation은 row 수정/삭제 없이 보정 entry로 처리할 수 있다.
- [ ] unique idempotency key 또는 동등한 중복 방지 제약이 설계되어 있다.

검증 기록:

- 작성 예정.

## Sprint 4 - 모집방 생성과 참여 lifecycle

목표: 사용자가 2-4명 목표의 공유 택시 그룹을 만들고, 참여자가 신청/승인/마감 흐름을 거치게 한다.

- [ ] 그룹 생성 입력을 서버에서 검증한다: origin, destination, departure time, recruitment close method, target capacity 2-4.
- [ ] host가 수동으로 모집을 닫을 수 있게 한다.
- [ ] departure time 도달 시 모집을 닫고, 마감 후 신규 신청과 승인을 거절한다.
- [ ] 참여 신청은 `APPLIED`, 승인은 `APPROVED`로 상태를 분리한다.
- [ ] 자동 승인과 host 승인 정책을 MVP 범위 내에서 명확히 적용한다.
- [ ] 최소 2명 조건 미달 시 `EXPIRED`, 조건 충족 후 예치 흐름 완료 시 `CONFIRMED`로 전이한다.
- [ ] UI는 destination, time, capacity, estimated share, policy를 irreversible action 전에 보여준다.

완료 기준:

- [ ] capacity 초과, 마감 후 신청/승인, profile 미완료 참여가 서버에서 거절된다.
- [ ] 그룹 상태와 참여자 상태가 PRD 상태명으로 저장된다.
- [ ] 닫힌/가득 찬/만료된 그룹의 disabled 상태와 error message가 구현되어 있다.

검증 기록:

- 작성 예정.

## Sprint 5 - 지도, 경로, 요금 provider adapter

목표: 지도 제공자를 교체 가능하게 추상화하고, 출발/도착 기반 견적을 저장한다.

- [ ] Naver Map 또는 Kakao Mobility 중 MVP 우선 provider 결정을 승인받는다.
- [ ] geocoding, route estimate, fare estimate를 typed provider interface 뒤에 둔다.
- [ ] raw provider response를 client에 노출하지 않는다.
- [ ] estimated distance, duration, total fare, calculation timestamp, provider basis를 저장한다.
- [ ] provider 실패, rate limit, incomplete response에 deterministic fallback을 정의한다.
- [ ] route/fare estimate 테스트는 provider mock으로 작성한다.

완료 기준:

- [ ] provider 교체가 app/domain 코드 변경을 최소화하는 구조다.
- [ ] client bundle에 map-provider key나 raw response가 포함되지 않는다.
- [ ] 견적 근거가 매칭과 정산 전 예치 안내에 재사용 가능하다.

검증 기록:

- 작성 예정.

## Sprint 6 - 매칭 점수와 AI 설명

목표: eligible open group만 점수화하고, AI는 계산된 근거를 설명하는 역할로 제한한다.

- [ ] 추천 대상은 `OPEN`, 여유 좌석 1개 이상, departure time 유효, detour policy 허용 그룹으로 제한한다.
- [ ] 출발지 근접, 목적지 동일/근접, 시간 차이, capacity, detour threshold를 configurable score로 계산한다.
- [ ] matched group id, normalized route calculation, calculation time, score, human-readable reason을 저장하거나 반환한다.
- [ ] 같은 목적지와 허용된 nearby destination을 구분해 표시한다.
- [ ] AI 설명은 stored input과 provider calculation 결과만 사용한다.
- [ ] AI 실패/빈 응답/rate limit 시 deterministic reason fallback을 제공한다.
- [ ] 추천 결과는 자동 신청/승인/확정을 수행하지 않는다.

완료 기준:

- [ ] 추천 카드의 모든 수치와 설명은 저장 데이터 또는 provider 계산 근거에서 나온다.
- [ ] AI가 근거 없는 거리, 가격, availability를 생성할 수 없다.
- [ ] 추천 선택 후에도 사용자의 명시적 참여 신청이 필요하다.

검증 기록:

- 작성 예정.

## Sprint 7 - 관리자 포인트와 원장

목표: 관리자 지급 포인트만 지원하고, 모든 잔액 변화를 append-only ledger로 감사 가능하게 만든다.

- [ ] admin role 검증을 서버에서 수행한다.
- [ ] 관리자 지급 입력을 검증한다: 대상 사용자, 금액, 지급 사유.
- [ ] 지급, 예치, 환불, 추가 차감, 정산 ledger type을 정의한다.
- [ ] 모든 point mutation에 actor, reason, related trip, idempotency key, amount, balance effect를 기록한다.
- [ ] retryable mutation은 같은 idempotency key로 재시도 시 기존 결과를 반환한다.
- [ ] 사용자는 직접 충전, 구매, 환전, 현금 환불을 할 수 없도록 UI와 서버에서 차단한다.

완료 기준:

- [ ] ledger row를 수정/삭제하지 않고 보정 entry로만 정정 가능하다.
- [ ] 잔액 업데이트와 ledger insert가 같은 transaction에서 처리된다.
- [ ] 중복 요청으로 잔액이 두 번 변하지 않는 테스트가 있다.

검증 기록:

- 작성 예정.

## Sprint 8 - 예치, 그룹 확정, 집결 전 공개 범위

목표: 참여자가 예상 부담금을 확인하고 포인트를 예치한 뒤, 조건이 충족된 그룹만 확정한다.

- [ ] 예치 전 destination, departure time, capacity, estimated share, cancellation/no-show policy를 표시한다.
- [ ] 예치금은 `ceil(estimated_total / confirmed_participant_count)` 기준으로 계산한다.
- [ ] 포인트 부족 시 관리자 지급 요청 흐름으로 안내한다.
- [ ] 예치 완료 참여자를 `DEPOSITED`로 전이한다.
- [ ] 최소 2명 이상 eligible participant가 예치 완료해야 그룹을 `CONFIRMED`로 전이한다.
- [ ] 확정 전에는 정확한 주소, phone number, settlement details 노출을 최소화한다.
- [ ] 확정 후 필요한 범위에서 group gathering/chat entry를 연다.

완료 기준:

- [ ] 예치 transaction은 ledger와 participant state를 원자적으로 처리한다.
- [ ] 같은 예치 요청 재시도는 중복 ledger를 만들지 않는다.
- [ ] 그룹 확정은 최소 인원/예치 완료 조건 없이 발생하지 않는다.

검증 기록:

- 작성 예정.

## Sprint 9 - 이동, 노쇼, 실제 요금, 최종 정산

목표: 실제 택시 이용 후 요금 확인과 최종 부담금 정산을 transaction으로 완료한다.

- [ ] `IN_PROGRESS`, `SETTLEMENT_PENDING`, `COMPLETED` 전이를 구현한다.
- [ ] host 또는 지정 참여자가 actual total fare를 입력할 수 있게 한다.
- [ ] 영수증 사진 첨부는 PRD상 Should이므로 MVP 필수 여부를 결정한다.
- [ ] 참여자는 actual fare에 동의하거나 이의를 제기할 수 있다.
- [ ] 동의 완료 또는 이의 제기 기한 만료 후 settlement를 실행한다.
- [ ] 최종 부담금은 `ceil(actual_total / settlement_participant_count)`로 계산한다.
- [ ] 노쇼가 있어도 confirmed settlement participant count 기준으로 정산한다.
- [ ] 예치금 초과분은 refund ledger, 부족분은 additional deduction ledger로 기록한다.
- [ ] 정산 state change, ledger writes, balance updates를 하나의 DB transaction으로 처리한다.

완료 기준:

- [ ] 정산 retry가 원래 결과를 반환하고 중복 차감/환불하지 않는다.
- [ ] 노쇼 기준 인원 정책이 테스트로 고정되어 있다.
- [ ] participant별 거래 내역과 정산 결과가 authorized user에게만 보인다.

검증 기록:

- 작성 예정.

## Sprint 10 - 신고, 차단, 알림, 운영 검토

목표: MVP 안전 기능과 운영 확인 흐름을 갖춘다.

- [ ] 사용자 신고 기능을 구현한다: 대상 사용자 또는 trip group, 사유, 증빙, 처리 상태.
- [ ] 사용자 차단 기능을 구현하고 matching/visibility에 반영한다.
- [ ] 신고/차단은 서버에서 권한과 입력을 검증한다.
- [ ] 참여 승인, 예치 요청, 모집 마감, 집결 임박, 정산 요청/완료 알림을 정의한다.
- [ ] 알림 provider가 없어도 in-app notification 또는 deterministic fallback을 둔다.
- [ ] 운영자 검토 화면은 개인정보 최소 노출 원칙을 따른다.

완료 기준:

- [ ] 차단된 사용자 간 추천/참여/연락 노출이 제한된다.
- [ ] 신고 처리 기록은 감사 가능하게 남는다.
- [ ] 알림 실패가 상태 전이를 깨뜨리지 않는다.

검증 기록:

- 작성 예정.

## Sprint 11 - 회귀, 보안, 접근성, Preview 릴리즈 준비

목표: MVP 출시 가능 조건을 확인하고 Preview 배포 준비를 완료한다.

- [ ] 상태 머신 회귀 테스트를 실행한다.
- [ ] authorization/security review를 수행한다.
- [ ] settlement/ledger/idempotency review를 수행한다.
- [ ] 개인정보 노출 단계와 client bundle secret leakage를 점검한다.
- [ ] mobile responsive, keyboard support, visible focus, accessible error message를 점검한다.
- [ ] `npm run lint`를 실행한다. ESLint가 unavailable이면 제한 사항을 기록한다.
- [ ] `npm run build`를 실행한다.
- [ ] Preview/Production 환경변수 이름과 존재 여부를 확인한다. secret value는 출력하지 않는다.
- [ ] Vercel Preview deployment는 명시 승인 후에만 수행한다.
- [ ] Production deploy, Vercel project link, env 변경, production data operation은 별도 승인 전까지 하지 않는다.

완료 기준:

- [ ] 모든 Must 요구사항이 구현/검증/보류 승인 중 하나로 분류되어 있다.
- [ ] open blocker가 release note에 명시되어 있다.
- [ ] Preview 배포 또는 배포 준비 evidence가 문서화되어 있다.

검증 기록:

- 작성 예정.

## MVP 불변조건 체크리스트

- [ ] 프로필 완료 전 그룹 생성, 그룹 참여, 포인트 작업 불가.
- [ ] 그룹 정원은 2-4명.
- [ ] 모집 마감 후 신규 신청과 승인을 거절.
- [ ] 최소 2명 eligible participant의 confirmation/deposit flow 없이는 그룹 확정 불가.
- [ ] 최소 인원 미달 그룹은 `EXPIRED`.
- [ ] AI는 자동 신청, 승인, 확정, 정산, 상태 변경을 수행하지 않음.
- [ ] 추천은 eligible open group과 실제 입력/계산 근거만 사용.
- [ ] nearby destination은 명시적 detour policy와 configurable threshold로만 허용.
- [ ] point ledger는 append-only audit record.
- [ ] 예치/차감/환불/정산 요청은 멱등성 보장.
- [ ] settlement state, ledger writes, balance updates는 같은 transaction.
- [ ] no-show 정산은 PRD 변경 전까지 confirmed settlement participant count 기준.
- [ ] 사용자 직접 포인트 구매/충전/현금화/실금 환불 없음.
- [ ] taxi dispatch, card payment, PG integration, automatic fare collection 없음.
- [ ] credentials와 raw provider response는 client에 노출하지 않음.
- [ ] exact address, phone number, point balance, settlement details는 lifecycle과 권한에 맞춰 제한.

## 승인 필요 결정

| ID | 결정 항목 | 필요 승인 | 상태 | 메모 |
| --- | --- | --- | --- | --- |
| D-01 | Neon DB 운영 리전, Preview/Production 분리 방식, 백업/복구 정책 | 제품/운영/인프라 | `[ ]` | PRD open issue |
| D-02 | 택시 호출 주체와 실제 기사 요금 지급 안내 방식 | 제품/운영/법무 | `[ ]` | MVP는 배차/결제 미구현 |
| D-03 | 지도/경로 provider 우선순위: Naver Map vs Kakao Mobility | 제품/제공자/인프라 | `[ ]` | API 키와 과금 정책 포함 |
| D-04 | nearby destination detour threshold와 사용자 동의 문구 | 제품/법무 | `[ ]` | 기본값은 구현 전 승인 필요 |
| D-05 | 관리자 포인트 초기 지급액, 지급 사유 taxonomy, 지급 권한 범위 | 운영/제품 | `[ ]` | user top-up 없음 |
| D-06 | 노쇼 시 초과 예치금 환불/수수료 정책 | 제품/법무/운영 | `[ ]` | 현재 원칙은 confirmed count 기준 정산 |
| D-07 | 실제 요금 이의 제기 기한과 증빙 요건 | 제품/운영/법무 | `[ ]` | 영수증 첨부 Should |
| D-08 | 초기 출시 지역, 대학, 운영 지원 범위 | 제품/운영 | `[ ]` | 캠퍼스 단위 출시 권장 |

## 작업 티켓 템플릿

```md
### 작업명

- Sprint:
- PRD/AGENTS 근거:
- Required skill:
- Scope:
- Out of scope:
- Server authorization:
- Data/privacy impact:
- State transition impact:
- Point/settlement impact:
- Tests:
- Verification:
- Release note:
```

## 스프린트 완료 기록

| Sprint | 완료일 | 담당 | 주요 변경 | 검증 | 남은 리스크 |
| --- | --- | --- | --- | --- | --- |
| 0 |  |  |  |  |  |
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |
| 4 |  |  |  |  |  |
| 5 |  |  |  |  |  |
| 6 |  |  |  |  |  |
| 7 |  |  |  |  |  |
| 8 |  |  |  |  |  |
| 9 |  |  |  |  |  |
| 10 |  |  |  |  |  |
| 11 |  |  |  |  |  |
