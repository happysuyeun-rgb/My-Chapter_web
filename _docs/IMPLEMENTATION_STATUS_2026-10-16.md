# 차곡 Current Implementation Status — 2026-10-16

- Product: 차곡 (Chagok)
- Date: 2026-10-16
- Status: **CURRENT STATUS OVERRIDE**
- Purpose: `_docs/IMPLEMENTATION_PLAN.md` v2.0의 Phase 15A 이전 진행 문구를 현재 상태로 보정한다.
- Rule: Implementation Plan과 본 문서가 충돌하면 **본 문서와 `_docs/README.md`를 우선**한다.

---

## 1. Current Phase Status

~~~text
Phase 0~12  ✅ COMPLETE
Phase 13    ✅ Wizard Draft Recovery
Phase 14    ✅ Editor Autosave / Recovery
Phase 15A   ✅ Local MVP Entry + Auth UI Foundation + Guest fallback
Phase 15B   ⏸ HOLD — Real Chagok Web Supabase Auth Runtime
Phase 16    ⏸ HOLD — Ownership / DB / Storage / RLS
Payment     ⏸ IMPLEMENTATION HOLD
~~~

Phase 15A는 merge와 Local E2E/회귀 QA가 끝난 상태다.

---

## 2. Current Product / Policy Baseline

완료:

- Product Spec v1.5
- Service Policy v1.1
- Pricing Policy v1.1
- Payment/Pricing UI Requirements v1.1
- Payment Screen Design v1.0
- Payment Screen Spec v1.0
- Payment Data Spec v1.1
- Payment API Spec v1.1
- Function Spec v1.2
- Screen Spec v1.2
- Core API Spec v1.2
- Core Data Spec v1.2
- QA Acceptance v1.2

Pricing:

~~~text
Free
→ 원고 입력 / 구조 / 디자인 / 표지 / 편집 / Preview

Book Pass
→ ₩14,900 / 책 1권
→ 해당 책 PDF Export entitlement
→ 같은 책 수정 후 재출력 추가 결제 없음
~~~

---

## 3. Commerce Hardening Resolved

이번 hardening에서 닫은 항목:

1. **Direct PDF bypass**
   - SaaS Payment go-live 전에 기존 Local `/__pdf?file=`와 PDF cache/static 접근을 외부에서 우회할 수 없게 해야 한다.
   - Authorized Export boundary에서 session + ownership + ACTIVE entitlement 확인.

2. **Payment → Entitlement partial failure**
   - 결제 성공 후 entitlement grant 실패를 reconciliation으로 복구.
   - orphan payment 탐지/repair + audit 필요.

3. **Admin / Compensation Grant**
   - 정상 구매와 분리된 source type.
   - PURCHASE / ADMIN_GRANT / COMPENSATION.
   - 보상 grant는 source_order_id 없이 가능, reason/audit 필수.

4. **Canonical Money / Time**
   - KRW는 정수 원 단위.
   - float 금액 금지.
   - timestamp는 UTC 저장, UI에서 로컬 변환.

5. **Receipt / Purchase Evidence**
   - order/payment/refund/entitlement 데이터 출처 구분.
   - provider receipt reference/URL을 payment 기록에 연결.

6. **Refund / Chargeback Consistency**
   - refund idempotency.
   - chargeback/revoke 상태 정합성.
   - 과거 거래 기록 삭제 금지.

---

## 4. Current Execution Order

현재 순서:

~~~text
1. Local MVP / UI / Policy / Commerce Target Specs
   ✅ COMPLETE
   ↓
2. Portfolio Case Study
   ← NEXT
   ↓
3. Representative Demo Scenario
   ↓
4. 사용자 3~5명 검증
   ↓
5. 실제 계정/Cloud 필요가 검증되면 Phase 15B
   ↓
6. Phase 16 Ownership / stable book_id / DB / Storage / RLS
   ↓
7. Deployment / Authorized PDF Export boundary
   ↓
8. Payment Provider + legal/ops gate
   ↓
9. Payment implementation
~~~

Commerce 문서가 준비됐다는 이유만으로 5~9를 앞당기지 않는다.

---

## 5. HOLD Rules

현재 금지:

- Chagok Web Supabase Runtime 연결
- Phase 16 DB/Storage/RLS 구현
- Payment provider SDK 연결
- order/payment/entitlement DB 생성
- Local `/__pdf`를 성급하게 payment-aware route로 변경
- 보호 사용자 책 수정/이동/삭제
- Core Editor/Viewer/Paged.js/PDF 재작성

---

## 6. Protected Assets

명시적 요청 없이 수정 금지:

~~~text
books/내 포트폴리오, AI로 직접 만들기/
books/서아의/
~~~

Legacy recovery key:

~~~text
mychapter:wizard-draft:v1
mychapter:editor-recovery:v1:<file>
~~~

---

## 7. Payment Implementation Plan

완료:

~~~text
_docs/PAYMENT_IMPLEMENTATION_PLAN.md v1.0
~~~

정의 완료:

- Phase 15B → Phase 16 → Authorized PDF Export → Payment 순서
- Provider / Legal / Ops Gate
- Commerce schema/API/UI build order
- Reconciliation / Refund / Compensation
- Full Commerce QA
- Rollback / Observability
- Staged Launch

이 문서가 생겼어도 Payment 구현 승인이 된 것은 아니다.

현재 제품 우선순위는 계속:

~~~text
Portfolio Case Study
→ Representative Demo
→ 사용자 3~5명 검증
~~~
