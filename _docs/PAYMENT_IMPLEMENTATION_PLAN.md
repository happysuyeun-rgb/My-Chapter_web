# 차곡 Payment Implementation Plan

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **TARGET / EXECUTION PLAN — IMPLEMENTATION HOLD**
- Depends on:
  - `_docs/SERVICE_POLICY.md` v1.1
  - `_docs/PRICING_POLICY.md` v1.1
  - `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md` v1.1
  - `_docs/PAYMENT_SCREEN_DESIGN.md` v1.0
  - `_docs/PAYMENT_SCREEN_SPEC.md` v1.0
  - `_docs/PAYMENT_DATA_SPEC.md` v1.1
  - `_docs/PAYMENT_API_SPEC.md` v1.1
  - `_docs/QA_ACCEPTANCE.md` v1.2
  - `_docs/IMPLEMENTATION_STATUS_2026-10-16.md`
- Implementation: **DO NOT START PAYMENT CODE YET**

이 문서는 차곡의 Book Pass 결제를 실제로 구현하게 되는 시점에 **무엇을 어떤 순서로 만들고, 어떤 Gate를 통과해야 다음 단계로 갈 수 있는지** 정의한다.

이 문서 작성 자체는 Phase 15B / Phase 16 / Payment 구현 승인이 아니다.

---

## 1. Current Position

현재:

~~~text
Local MVP                  ✅ COMPLETE
Phase 15A                  ✅ COMPLETE
Service Policy             ✅ CURRENT
Pricing Policy             ✅ CURRENT
Payment UX / Screen Specs  ✅ DOCUMENTED
Payment Data / API Specs   ✅ DOCUMENTED
Phase 15B                  ⏸ HOLD
Phase 16                   ⏸ HOLD
Payment Implementation     ⏸ HOLD
~~~

현재 제품 우선순위:

~~~text
Portfolio Case Study
→ Representative Demo
→ 사용자 3~5명 검증
~~~

위 검증에서 실제 외부 서비스/계정/클라우드/결제 필요가 확인될 때 본 계획을 실행한다.

---

## 2. Non-Negotiable Architecture Rules

Payment 구현 때문에 다음을 바꾸지 않는다.

- Content SoT = `book.html`
- Core Book identity = `file`
- Commerce identity = 별도 stable `book_id`
- Editor = KEEP / WRAP
- Viewer = KEEP
- Paged.js = KEEP
- PDF Engine = KEEP / WRAP
- Existing user book migration = NO
- Structured Book JSON = NOT NOW
- Local recovery key migration 없이 rename 금지

Payment는 Core Engine 바깥의 **Service / Commerce layer**로 추가한다.

---

## 3. Overall Execution Sequence

~~~text
G0. User Validation Gate
 ↓
G1. Phase 15B — Real Auth Runtime
 ↓
G2. Phase 16A — Stable book_id + Ownership
 ↓
G3. Phase 16B — Cloud Metadata / Storage / RLS
 ↓
G4. Deployment / Authorized PDF Export Boundary
 ↓
G5. Payment Provider + Legal / Tax / Ops Decision
 ↓
G6. Commerce Data Schema
 ↓
G7. Commerce Server API
 ↓
G8. Checkout / Paywall UI Integration
 ↓
G9. Reconciliation / Refund / Support Operations
 ↓
G10. Full Commerce QA
 ↓
G11. Staged Launch
 ↓
G12. Post-Launch Measurement
~~~

각 Gate가 닫히기 전 다음 Gate 구현을 시작하지 않는다.

---

# G0 — User Validation Gate

## Goal

결제를 붙일 가치가 있는지 먼저 검증한다.

## Before Coding

최소 확인:

- 사용자가 원고 → Preview까지 혼자 진행 가능한가
- 결과 PDF를 실제 사용하고 싶은가
- PDF Export 직전 ₩14,900 제안이 이해되는가
- 같은 책 재출력 포함이 구매 이유가 되는가
- 계정/클라우드 저장이 실제 필요로 나타나는가

## Exit Criteria

다음 중 하나 이상이 명확해야 Phase 15B 착수 검토:

- 실제 외부 사용자 테스트를 위해 계정 필요
- 구매 내역/entitlement 복구를 위해 사용자 식별 필요
- 다기기/클라우드 서재 수요 확인
- Book Pass 구매 의향 또는 가격 거부 이유를 실제 사용자에게서 확인

## STOP

제품 검증 없이 "결제 기능이 있으니 있어 보여서" 구현하지 않는다.

---

# G1 — Phase 15B Real Auth Runtime

## Goal

현재 Auth UI/client foundation을 실제 Chagok Web Auth Runtime과 연결한다.

## Work

1. 전용 Chagok Web Supabase 프로젝트 확정
2. Project URL / publishable key
3. 회원가입
4. 로그인
5. session refresh
6. logout
7. safe returnTo
8. Auth 오류 UX
9. configured mode Runtime QA

## Safety

- 앱용 MyChapter Supabase project ref 사용 금지
- Local blank CONFIG fallback 보존
- Book ownership은 아직 만들지 않음

## Exit Criteria

- 회원가입/로그인/session/logout PASS
- 잘못된 프로젝트 연결 없음
- returnTo external redirect 차단
- 기존 Local MVP 회귀 없음

---

# G2 — Phase 16A Stable Book Identity + Ownership

## Goal

Core `file` path와 별개로 서비스 계층의 immutable `book_id`를 만든다.

## Required Data

~~~text
book_id
user_id
core_file_ref
ownership_state
created_at
updated_at
~~~

## Rules

- book title 변경 → book_id 유지
- file/folder rename → book_id 유지
- Duplicate → new book_id
- 사용자 A는 사용자 B book_id 접근 불가
- Core `file` identity는 유지

## Guest → Account Migration

정의 필요:

- Local Guest book을 언제 계정 소유로 승격할지
- stable book_id를 언제 발급할지
- 중복 migration 방지
- migration 실패 시 Local 원본 보존

## Exit Criteria

- Auth User → Own Book lookup PASS
- cross-user read/write 차단
- Duplicate identity PASS
- Local Core regression 없음

---

# G3 — Phase 16B Cloud Metadata / Storage / RLS

## Goal

외부 서비스에서 책을 안전하게 저장/조회할 수 있게 한다.

## Work

- book metadata schema
- storage boundary
- RLS / authorization
- upload/download paths
- trash/restore state
- account deletion boundary
- retention policy 적용

## Rules

- `book.html` semantics 유지
- Local Engine을 DB JSON model로 재작성하지 않음
- Storage object URL을 public permanent URL로 두지 않음

## Exit Criteria

- user ownership RLS PASS
- cross-user object access 차단
- trash/restore identity 유지
- protected Core flow 회귀 없음

---

# G4 — Deployment + Authorized PDF Export Boundary

## Goal

Payment 전에 PDF Export를 서버 권한 경계 뒤로 옮긴다.

## Critical Risk

현재 Local:

~~~text
GET /__pdf?file=...
~~~

SaaS에서 이 route가 외부에 그대로 노출되면 Paywall 우회가 가능하다.

## Target

~~~text
Session
→ Ownership
→ Entitlement
→ Authorized Export
→ Existing PDF Engine / Worker
~~~

## Required

- direct `/__pdf?file=` 외부 우회 차단
- public PDF cache URL 차단
- signed URL 사용 시 짧은 만료
- Preview resource가 완성 PDF download path가 되지 않음
- LOCKED / UNKNOWN → PDF 획득 불가

## Exit Criteria

**QA-PAY-01 Direct PDF bypass PASS**

이 Gate가 실패하면 Payment 출시 금지.

---

# G5 — Payment Provider + Legal / Tax / Ops Decision

## Provider Selection Criteria

비교 항목:

- 국내 KRW 결제 지원
- 카드/간편결제
- 서버 승인/검증 API
- webhook
- 환불 API
- receipt/영수증
- sandbox
- 수수료
- 정산
- 장애 대응
- 문서 품질
- SaaS/디지털 콘텐츠 적합성

Provider 결정 전 SDK를 코드에 넣지 않는다.

## Legal / Ops Gate

Payment go-live 전에 확정:

- 이용약관
- 개인정보처리방침
- 디지털 콘텐츠 공급/청약철회 고지
- 환불 기준
- 부가세 표시 방식
- 영수증/현금영수증
- 사업자 정보
- 고객지원 채널
- 장애/환불 문의 처리
- 데이터/거래기록 보존 기간

## Exit Criteria

- Provider 선정 문서
- 법적 Checkout copy 승인
- 운영 환불/CS flow 정의

---

# G6 — Commerce Data Schema

## Goal

`PAYMENT_DATA_SPEC.md`를 실제 DB schema로 변환한다.

## Tables / Logical Entities

- products / prices
- orders
- payment_attempts
- entitlements
- refunds
- commerce_audit_events
- webhook_events

## Required Constraints

- order_id unique
- payment_id unique
- entitlement_id unique
- provider transaction unique
- provider event unique
- idempotency key unique
- 동일 book/user의 ACTIVE entitlement 중복 방지

## Money

~~~text
currency = KRW
amount = integer won
~~~

float 금지.

## Entitlement Origin

~~~text
PURCHASE
ADMIN_GRANT
COMPENSATION
~~~

## Migration

- empty Commerce schema로 시작
- 기존 Local 사용자 책에 가짜 purchase row 생성 금지
- 기존 책이 SaaS로 승격될 때 ownership/book_id만 먼저 부여
- Book Pass는 실제 구매/보상 시만 생성

## Exit Criteria

- migration dry-run
- rollback plan
- RLS/security review
- constraint tests PASS

---

# G7 — Commerce Server API

## Build Order

1. canonical price
2. entitlement check
3. create order
4. order status
5. provider verification
6. webhook
7. purchase history
8. purchase recovery
9. refund/support operation
10. authorized export integration

## Server Rules

- client amount 신뢰 금지
- request user_id 신뢰 금지
- session user 기준
- ownership 검증
- idempotency
- provider transaction replay 방지
- webhook signature 검증
- provider status normalization
- safe errors

## Exit Criteria

- API contract tests
- duplicate request tests
- ownership negative tests
- provider sandbox verification
- webhook replay tests

---

# G8 — Pricing / Paywall / Checkout UI Integration

## Build Order

1. P01 Pricing
2. P02 Export Paywall
3. P03 Checkout
4. P04 Processing
5. P05 Success
6. P06 Failure/Pending
7. P07 Already Unlocked
8. P08 Purchase Info
9. P09 Purchase Recovery
10. P10 Refunded/Revoked
11. P11 Paid Book Delete Warning

## Rules

- Preview 무료 유지
- Payment 앞문 금지
- ACTIVE entitlement에는 Paywall 금지
- UNKNOWN entitlement를 LOCKED로 간주 금지
- Checkout 취소/실패 후 작업 상태 보존
- Success 이후 PDF 실패와 결제 실패 구분

## Responsive

- 390
- 768
- 1440

## Exit Criteria

- Screen Spec acceptance PASS
- accessibility minimum PASS
- no duplicate purchase CTA

---

# G9 — Reconciliation / Refund / Support Operations

## Reconciliation

탐지:

- SUCCEEDED payment + no ACTIVE entitlement
- PENDING/PROCESSING stale
- REFUNDED/CHARGEDBACK + ACTIVE entitlement
- order/payment status mismatch
- webhook missed

## Repair

- safe auto-repair
- risky case → admin review
- 모든 repair audit

## Refund

- idempotency key
- provider refund result 확인
- entitlement revoke
- purchase state update
- audit

## Compensation Grant

정상 구매와 분리:

~~~text
source_type = COMPENSATION
grant_reason = required
~~~

## Exit Criteria

- orphan recovery simulation PASS
- repeated refund call PASS
- admin grant audit PASS
- chargeback revoke PASS

---

# G10 — Commerce Full QA

## P0 Launch Gates

1. Direct PDF bypass 불가
2. client price tamper 불가
3. cross-user book purchase/access 불가
4. duplicate click → single valid order
5. verify + webhook race 안전
6. payment succeeded → entitlement eventually ACTIVE
7. refund/chargeback → entitlement revoke
8. purchase recovery PASS
9. PDF failure after purchase → 재결제 없음
10. Duplicate book → original ACTIVE / duplicate LOCKED

## Regression

- Landing
- Library
- Wizard
- Editor
- Autosave/Recovery
- Cover
- Preview
- PDF Engine
- protected books
- Local fallback if retained

## Security Review

- secrets client 노출 없음
- webhook signature
- authorization
- signed URL
- logs에 token/원고 없음
- rate limit / abuse limits

## Exit Criteria

- P0 = 0
- P1 = 0 for payment-critical path
- all provider sandbox flows PASS

---

# G11 — Staged Launch

## Stage 1 — Internal

- 운영자 테스트 계정
- sandbox → real low-risk payment
- 실제 ₩14,900 주문
- receipt/refund test
- PDF export

## Stage 2 — Limited Beta

- 소수 사용자
- Book Pass 하나만
- coupon engine 없음
- Creator 없음

## Stage 3 — Public

조건:

- payment success rate 안정
- PDF post-purchase success 안정
- orphan reconciliation 정상
- refund/support flow 확인
- direct bypass 0
- no critical ownership leak

## Feature Flag

Payment UI는 feature flag 또는 server config로 즉시 OFF 가능해야 한다.

OFF 시:

- 신규 결제 차단
- 기존 ACTIVE entitlement 사용 정책은 별도 유지
- 구매 데이터 삭제 금지

---

# G12 — Post-Launch Metrics

최소 측정:

- Preview → Paywall
- Paywall → Checkout
- Checkout → Payment success
- Payment success → PDF success
- Repeat PDF export
- 2번째 책 생성
- 환불률
- payment failure rate
- orphan/reconciliation rate
- support 문의 유형
- 가격 거부 이유

## Pricing Decision

₩14,900은 출시 기준값이다.

변경은 위 데이터로 판단한다.

Creator ₩24,900/month는 반복 제작 수요가 확인될 때만 검토한다.

---

## 4. Rollback Strategy

### UI Rollback

Payment CTA feature flag OFF.

### Provider Rollback

- 신규 order 생성 중지
- 진행 중 order 상태 조회 유지
- webhook 수신은 즉시 끄지 않음
- 기존 결제 기록 보존

### DB Rollback

Commerce migration은 reversible change와 irreversible change를 구분한다.

금지:

- 결제 기록 destructive delete
- entitlement를 임의로 모두 reset
- Core book content rollback과 Commerce rollback을 하나로 묶음

### PDF Rollback

Authorized Export wrapper에 장애가 있어도 Core PDF Engine 자체를 재작성하지 않는다.

---

## 5. Observability

필수 식별자:

- request_id
- user_id
- book_id
- order_id
- payment_id
- entitlement_id
- provider_event_id

필수 alert 후보:

- payment SUCCEEDED + entitlement missing
- refund SUCCEEDED + entitlement ACTIVE
- webhook signature failure spike
- duplicate payment spike
- PDF post-purchase failure spike
- authorized export 5xx spike

민감정보는 로그에 넣지 않는다.

---

## 6. Test Environment Strategy

### Local

- Core Engine regression
- mocked Commerce state 가능

### Provider Sandbox

- order
- success
- failure
- pending
- webhook
- refund

### Staging

- Auth + Ownership + Commerce + PDF integration
- production-like secrets separated

### Production

- 소액/실결제 smoke는 운영정책 하에서만 수행
- sandbox secret 혼용 금지

---

## 7. Definition of Payment Ready

Payment 구현이 "완료"된 것으로 보는 기준:

~~~text
Auth Runtime PASS
+ Ownership PASS
+ stable book_id PASS
+ Cloud/RLS PASS
+ Authorized PDF Export PASS
+ Provider Verification PASS
+ Entitlement PASS
+ Reconciliation PASS
+ Refund/Revoke PASS
+ UI PASS
+ P0/P1 Payment QA = 0
+ Legal/Ops Gate PASS
~~~

하나라도 빠지면 Public Payment Ready가 아니다.

---

## 8. Explicit Non-Goals for First Payment Launch

초기에는 하지 않는다.

- Creator subscription
- annual plan
- team/seat billing
- lifetime plan
- AI credit pack
- multiple currencies
- complex coupon system
- affiliate
- enterprise invoice workflow
- tax automation platform
- 자체 카드정보 저장

Book Pass 1개를 안전하게 파는 데 집중한다.

---

## 9. Phase Ownership Summary

| Phase | Owns |
|---|---|
| 15B | Auth Runtime |
| 16A | stable book_id + Ownership |
| 16B | Cloud metadata / Storage / RLS |
| Deployment | Authorized Export / Worker boundary |
| Payment | Product/Price / Order / Payment / Entitlement / Refund |
| Ops | Reconciliation / Support / Incident / Refund handling |

경계를 섞지 않는다.

---

## 10. Final STOP Rules

아래 상황에서는 Payment 구현/출시를 멈춘다.

- Phase 15B Auth 불안정
- cross-user ownership 접근 가능
- stable book_id 없이 file path로 결제권리 연결
- direct PDF bypass 가능
- client amount로 결제금액 결정
- webhook signature 미검증
- 결제 성공 후 entitlement 복구 경로 없음
- 환불 후 entitlement ACTIVE 유지
- 보호 책/Core Engine 변경 필요
- legal/ops gate 미완료

---

## 11. Current Action

이 문서 작성 후에도 현재 즉시 행동은 변하지 않는다.

~~~text
NEXT:
Portfolio Case Study
→ Representative Demo
→ 사용자 3~5명 검증

HOLD:
Phase 15B
Phase 16
Payment implementation
~~~

본 문서는 **나중에 결제를 붙일 때 순서를 잃지 않기 위한 실행 설계**다.
