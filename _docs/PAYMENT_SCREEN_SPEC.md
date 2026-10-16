# 차곡 Payment Screen Specification

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **TARGET / SCREEN SPEC ONLY**
- Depends on:
  - `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md` v1.1
  - `_docs/PAYMENT_SCREEN_DESIGN.md` v1.0
  - `_docs/PRICING_POLICY.md` v1.1
- Implementation: **DO NOT IMPLEMENT YET**
- Scope: P01~P11

이 문서는 Payment 관련 각 화면의 **목적, 상태, CTA, 진입/이탈 조건, validation, analytics, acceptance**를 정의한다.

---

## 1. Shared State Model

### Entitlement

~~~text
UNKNOWN
LOCKED
ACTIVE
PENDING
REFUNDED
REVOKED
~~~

### Payment

~~~text
IDLE
ORDER_CREATING
READY
PROCESSING
VERIFYING
SUCCESS
FAILURE
PENDING
CANCELLED
~~~

### PDF

~~~text
IDLE
GENERATING
SUCCESS
FAILURE
~~~

UI는 이 세 상태를 섞지 않는다.

예:

~~~text
Payment = SUCCESS
Entitlement = ACTIVE
PDF = FAILURE
~~~

이면 "결제 성공 + PDF 생성 실패" 상태다.

---

## 2. P01 Pricing

- **Purpose:** Free / Book Pass 구조 설명
- **Entry:** Landing / Footer / Paywall 정책 링크
- **Primary CTA:** 무료로 책 만들기
- **Secondary CTA:** 내 서재
- **Data:** canonical Book Pass price
- **State:** DEFAULT / PRICE_LOADING / PRICE_ERROR
- **Validation:** UI 가격 = canonical price
- **Analytics:** `pricing_view`, `pricing_start_free_click`
- **Exit:** Wizard / Library
- **Acceptance:**
  - Free와 Book Pass만 판매 카드로 노출
  - Creator 판매 카드 없음
  - ₩14,900 정확
  - Mobile 1열 / Desktop 2열

---

## 3. P02 Export Paywall

- **Purpose:** PDF Export 가치와 가격 안내
- **Entry:** LOCKED book에서 Export
- **Primary CTA:** ₩14,900 결제하고 PDF 만들기
- **Secondary CTA:** 미리보기로 돌아가기
- **Tertiary:** 가격 정책 보기
- **Required Data:** book identity, title, author, entitlement, canonical price
- **State:** DEFAULT / ENTITLEMENT_CHECKING / PRICE_CHANGED / ERROR
- **Guard:**
  - ACTIVE → Paywall 금지
  - UNKNOWN → Paywall 금지
  - LOCKED → 표시
- **Analytics:** `export_paywall_view`, `export_paywall_purchase_click`
- **Acceptance:**
  - 작업 상태 보존
  - 닫기 후 Preview 복귀
  - Duplicate면 별도 LOCKED
  - 페이지 수와 가격 연동 인상 없음

---

## 4. P03 Checkout

- **Purpose:** 구매 대상/가격/고지 최종 확인
- **Entry:** P02 primary
- **Primary CTA:** ₩14,900 결제하기
- **Secondary:** 책으로 돌아가기 / 취소
- **Required Data:**
  - stable book identity
  - display title
  - canonical price
  - order id
  - purchaser identity
  - legal consent state
- **State:** LOADING / READY / ORDER_CREATING / PRICE_CHANGED / ERROR
- **Validation:**
  - server canonical price
  - correct book ownership
  - legal required consent
  - duplicate ACTIVE entitlement check
- **Analytics:** `checkout_view`, `checkout_submit`
- **Acceptance:**
  - client amount 무시
  - ACTIVE이면 결제 중단하고 P07
  - price drift면 재동의
  - back/cancel 후 작업 보존

---

## 5. P04 Payment Processing

- **Purpose:** 거래 진행/검증 상태 표시
- **Entry:** PG submit 후
- **CTA:** 기본적으로 없음
- **Fallback CTA:** 결제 상태 다시 확인
- **State:** PROCESSING / VERIFYING / PENDING
- **Required Data:** order id, payment provider transaction ref
- **Rules:**
  - 중복 submit 금지
  - refresh-safe
  - callback replay-safe
- **Analytics:** `payment_pending` when applicable
- **Acceptance:**
  - client callback만으로 Success 금지
  - timeout을 failure로 단정하지 않음

---

## 6. P05 Payment Success

- **Purpose:** 구매 완료 및 다음 행동
- **Entry:** server verification success
- **Precondition:** entitlement ACTIVE
- **Primary CTA:** PDF 만들기
- **Secondary:** 책으로 돌아가기
- **Optional:** 구매 정보 / 영수증
- **Analytics:** `payment_success`
- **Acceptance:**
  - 같은 책 Paywall 재노출 없음
  - 동일 책 재출력 추가 결제 없음
  - PDF 생성 실패 시 P05 성공 사실 유지

---

## 7. P06 Payment Failure / Pending

### Failure

- **Entry:** 확정 실패/취소
- **Primary:** 다시 결제
- **Secondary:** 책으로 돌아가기
- **Analytics:** `payment_failure`

### Pending

- **Entry:** 거래 상태 미확정
- **Primary:** 결제 상태 다시 확인
- **Secondary:** 서재로 이동
- **Analytics:** `payment_pending`

### Acceptance

- Failure와 Pending 카피/CTA 분리
- 작업물 손실 없음
- Pending인데 재결제 버튼을 바로 강제하지 않음

---

## 8. P07 Already Unlocked

- **Purpose:** 구매 완료 책의 Export 상태
- **Entry:** Workspace/Preview
- **Precondition:** entitlement ACTIVE
- **Primary CTA:** PDF 만들기
- **Label:** PDF 사용 가능
- **Analytics:** `pdf_export_after_purchase`, `repeat_pdf_export`
- **Acceptance:**
  - 가격 결제 CTA 없음
  - Pro/Premium badge 없음
  - Theme/title 수정 후에도 ACTIVE 유지

---

## 9. P08 Purchase / Entitlement Info

- **Purpose:** 구매 상태 확인
- **Entry:** Library / Account / Book menu
- **Data:** title, purchase date, final amount, masked order id, receipt URL, status
- **State:** ACTIVE / PENDING / REFUNDED / REVOKED
- **CTA:** 영수증 보기 / 닫기
- **Acceptance:**
  - 결제 기록과 콘텐츠 삭제 상태를 분리
  - status별 PDF 사용 가능 여부 일치

---

## 10. P09 Purchase Recovery

- **Purpose:** redirect 실패/local state 유실 후 구매 복구
- **Entry:** Account / Checkout / entitlement mismatch
- **Primary CTA:** PDF 만들기
- **Secondary:** 책으로 돌아가기
- **Precondition:** server-verified order
- **Analytics:** `purchase_recovered`
- **Acceptance:**
  - 같은 stable book identity만 복원
  - 다른 새 책으로 이전 금지
  - localStorage만으로 복구 판정 금지

---

## 11. P10 Refunded / Revoked

- **Purpose:** 환불/취소 후 권리 상태 고지
- **Entry:** purchase info / Export
- **State:** REFUNDED / REVOKED
- **CTA:** 구매 정보 보기 / 다시 구매 / 문의
- **Analytics:** `entitlement_revoked`
- **Acceptance:**
  - 향후 Export 잠금
  - 기존 로컬 PDF 원격 삭제 시도 금지
  - 정상 재구매 경로 제공 가능

---

## 12. P11 Paid Book Delete Warning

### Trash

- **Message:** 휴지통 복원 시 entitlement 유지
- **Primary:** 휴지통으로 이동
- **Secondary:** 취소

### Permanent Delete

- **Message:** 콘텐츠 복구 제한 + Book Pass 이전 불가
- **Primary:** 영구 삭제
- **Secondary:** 취소
- **Analytics:** `paid_book_delete_warning_view`

### Acceptance

- 유료 책 여부를 숨기지 않음
- stable identity가 복원되는 경우 entitlement 유지
- 영구 삭제를 Book Pass transfer로 오해시키지 않음

---

## 13. Common Error Rules

### Canonical Price Unavailable

> 가격을 불러오지 못했어요. 잠시 후 다시 시도해주세요.

결제 진행 금지.

### Entitlement Unknown

> 구매 상태를 확인할 수 없습니다.

Paywall 강제 금지.

### Order Create Failed

> 결제를 시작하지 못했어요.

작업 상태 유지.

### Verification Error

Pending으로 분류 가능하면 Pending 우선.

### PDF Error After Purchase

Payment 상태와 분리해서 처리.

---

## 14. CTA Priority

| Screen | Primary | Secondary |
|---|---|---|
| P01 | 무료로 책 만들기 | 내 서재 |
| P02 | ₩14,900 결제하고 PDF 만들기 | 미리보기로 돌아가기 |
| P03 | ₩14,900 결제하기 | 책으로 돌아가기 |
| P04 | 없음 | 상태 다시 확인 |
| P05 | PDF 만들기 | 책으로 돌아가기 |
| P06 Failure | 다시 결제 | 책으로 돌아가기 |
| P06 Pending | 결제 상태 다시 확인 | 서재로 이동 |
| P07 | PDF 만들기 | 없음 |
| P08 | 영수증 보기 | 닫기 |
| P09 | PDF 만들기 | 책으로 돌아가기 |
| P10 | 구매 정보/다시 구매 | 문의 |
| P11 | 삭제 action | 취소 |

한 화면에 Primary CTA 두 개를 동급으로 두지 않는다.

---

## 15. Responsive Acceptance

### 390

- pricing 1열
- paywall full-screen sheet 가능
- checkout summary 1열
- amount no-wrap
- sticky CTA가 content를 가리지 않음

### 768

- pricing 1열 또는 2열
- checkout max-width 내 중앙 정렬

### 1440

- pricing 2열
- checkout 720~840
- paywall 520~620

---

## 16. Accessibility Acceptance

- keyboard로 모든 CTA 도달
- focus visible
- modal focus trap
- ESC close 정책 일관
- error text 제공
- status icon + text
- price semantic label
- reduced motion에서도 상태 이해 가능

---

## 17. Analytics Mapping

| Event | Screen |
|---|---|
| pricing_view | P01 |
| pricing_start_free_click | P01 |
| export_paywall_view | P02 |
| export_paywall_purchase_click | P02 |
| checkout_view | P03 |
| checkout_submit | P03 |
| payment_success | P05 |
| payment_failure | P06 |
| payment_pending | P04/P06 |
| purchase_recovered | P09 |
| entitlement_revoked | P10 |
| paid_book_delete_warning_view | P11 |
| pdf_export_after_purchase | P07 |
| repeat_pdf_export | P07 |

실제 원고/책 제목은 analytics property로 보내지 않는다.

---

## 18. Screen → Policy Traceability

| Screen | Primary Policy |
|---|---|
| P01 | Pricing §1~3 |
| P02 | Pricing §9 |
| P03 | Pricing §13~16 |
| P04 | Payment UI §9 / Integrity |
| P05 | Pricing §7 ACTIVE |
| P06 | Pricing §16 |
| P07 | Pricing §4~7 |
| P08 | Pricing §13~16 |
| P09 | Pricing §15 |
| P10 | Pricing §7.6 |
| P11 | Pricing §7.2~7.3 |

---

## 19. Implementation Gate

이 Screen Spec은 구현을 승인하지 않는다.

구현 전:

1. Phase 15B Auth Runtime
2. Phase 16 Ownership
3. stable `book_id`
4. order/payment/entitlement model
5. Payment provider
6. server-side verification
7. refund/revoke lifecycle
8. legal checkout copy
9. Asset License Audit

이 Gate가 열리기 전에는 화면 목업/문서만 유지한다.

---

## 20. Done Criteria

Payment Screen Specification 완료 조건:

- P01~P11 purpose/state/CTA/entry-exit 정의
- shared state model 정의
- error / responsive / accessibility 정의
- analytics mapping 정의
- policy traceability 정의
- implementation HOLD 명시
