# 차곡 Payment Data Specification

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **TARGET / COMMERCE DATA CONTRACT**
- Depends on:
  - `_docs/SERVICE_POLICY.md` v1.1
  - `_docs/PRICING_POLICY.md` v1.1
  - `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md` v1.1
  - `_docs/PAYMENT_SCREEN_SPEC.md` v1.0
- Implementation: **DO NOT IMPLEMENT YET**
- Phase Gate: Phase 15B Auth Runtime → Phase 16 Ownership → Payment implementation

이 문서는 차곡의 향후 Book Pass 결제를 위한 **논리 데이터 계약**을 정의한다.

중요:

- 현재 Local MVP 파일 구조를 바꾸지 않는다.
- `book.html` SoT를 바꾸지 않는다.
- Core Engine의 `file` identity를 결제 identity로 승격하지 않는다.
- 이 문서는 DB vendor/schema migration을 확정하지 않는다.
- 실제 table/column type, index, RLS는 Phase 16 / Payment 기술 구현에서 최종 확정한다.

---

## 1. Commerce Data Principles

1. **가격, 주문, 결제, entitlement를 분리한다.**
2. 하나의 결제 성공이 곧바로 PDF 생성 성공을 의미하지 않는다.
3. Book Pass 권리는 제목 문자열이나 현재 `file` path가 아니라 **stable book identity**에 연결한다.
4. 사용자가 Book 제목/본문/표지/Theme을 수정해도 entitlement는 유지한다.
5. Duplicate는 새로운 stable book identity를 가진다.
6. 환불/취소/chargeback은 과거 결제 기록을 삭제하지 않고 상태를 변경한다.
7. 모든 금액은 주문 시점의 **price snapshot**을 보존한다.
8. Payment Provider 응답 원문 전체를 무제한 저장하지 않는다. 필요한 식별자/검증 필드만 저장한다.
9. 원고/책 제목 같은 실제 콘텐츠를 결제 analytics/audit에 불필요하게 복제하지 않는다.
10. provider webhook은 idempotent하게 처리한다.

---

## 2. Relationship Overview

~~~text
User
  └─ owns → Book (service-layer stable identity)
               ├─ has → Entitlement
               │          └─ source → Order / Payment
               └─ may have → many Orders

Product / Price
  └─ snapshot into → Order

Order
  ├─ has many → Payment Attempts
  ├─ may result in → Entitlement
  └─ may have → Refund / Reversal events

Commerce Audit Event
  └─ records important state transitions
~~~

---

## 3. Identity Layers

### 3.1 Core Engine Identity — CURRENT

~~~text
file = books/<folder>/book.html
~~~

역할:

- Local Engine route key
- Editor / Viewer / PDF 호출
- Core Book lookup

결제 SoT가 아니다.

### 3.2 Service Book Identity — TARGET

필요한 개념:

~~~text
book_id
~~~

요구사항:

- immutable
- 사용자 책 프로젝트 하나에 하나
- 제목 변경에 영향 없음
- 폴더 rename에 영향 없음
- `file` path 변경에 영향 없음
- Duplicate 시 새로운 `book_id`
- ownership과 연결 가능
- entitlement FK 역할

추천 표현:

~~~text
book_id: UUID
~~~

실제 DB type은 구현 시 확정.

### 3.3 Entitlement Identity

~~~text
entitlement_id
~~~

Book Pass 구매 권리 하나를 식별.

한 책에 ACTIVE entitlement는 실질적으로 하나만 존재하도록 설계하되, 환불/재구매 이력을 위해 과거 entitlement record를 지우지 않는다.

### 3.4 Order Identity

~~~text
order_id
~~~

차곡 내부 주문 식별자.

Provider transaction id와 분리한다.

---

## 4. Product / Price Model

초기 상품은 하나만 판매한다.

~~~text
product_code = BOOK_PASS
currency = KRW
canonical_price = 14900
~~~

단, 코드에 가격을 여러 곳 하드코딩하지 않는다.

### Logical Product Record

| Field | Required | Meaning |
|---|---:|---|
| product_code | Y | `BOOK_PASS` |
| display_name | Y | Book Pass |
| currency | Y | KRW |
| canonical_amount | Y | 현재 판매 기준금액 |
| active | Y | 신규 주문 가능 여부 |
| effective_from | Y | 가격 효력 시작 |
| effective_until | N | 종료 시각 |
| policy_version | Y | 어떤 Pricing Policy 기준인지 |

가격 변경 시 과거 record를 덮어쓰는 대신 새 price version을 만들 수 있어야 한다.

---

## 5. Order Model

### Purpose

"사용자가 특정 책에 대해 Book Pass를 구매하려고 했다"는 상거래 의도를 기록한다.

### Logical Fields

| Field | Required | Meaning |
|---|---:|---|
| order_id | Y | 내부 주문 ID |
| user_id | Y | 구매 사용자 |
| book_id | Y | 구매 대상 책 |
| product_code | Y | `BOOK_PASS` |
| currency | Y | KRW |
| amount | Y | 결제 시점 금액 snapshot |
| price_version | Y | 가격정책/price record 참조 |
| status | Y | 주문 상태 |
| idempotency_key | Y | 중복 order 방지 |
| created_at | Y | 생성 시각 |
| updated_at | Y | 최종 갱신 |
| expires_at | N | 미결제 주문 만료 |
| completed_at | N | 최종 결제 완료 |
| cancelled_at | N | 취소 완료 |
| metadata | N | 최소한의 운영용 정보 |

### Order Status

~~~text
CREATED
READY
PROCESSING
PAID
FAILED
CANCELLED
EXPIRED
REFUNDED
PARTIALLY_REFUNDED   # 초기에는 사용하지 않아도 됨
~~~

초기 Book Pass는 단일 상품/단일 금액이므로 PARTIAL REFUND는 기본 흐름에서 제외 가능.

### Rules

- 같은 user/book에 ACTIVE entitlement가 있으면 새 결제 order를 생성하지 않는다.
- 동일 idempotency key 재요청은 새 order를 만들지 않는다.
- `amount`는 client가 보낸 값을 신뢰하지 않고 서버 canonical price에서 결정한다.
- order는 과거 기록이므로 삭제보다 상태 전이를 우선한다.

---

## 6. Payment Attempt Model

한 Order에 여러 결제 attempt가 생길 수 있다.

예:

- 카드 승인 실패 후 재시도
- provider redirect 재진입
- pending 후 재검증

### Fields

| Field | Required | Meaning |
|---|---:|---|
| payment_id | Y | 내부 payment attempt ID |
| order_id | Y | 연결 주문 |
| provider | Y | 결제 Provider 식별 |
| provider_payment_id | N | Provider 거래 ID |
| provider_order_ref | N | Provider 주문 reference |
| amount | Y | 검증 대상 금액 |
| currency | Y | KRW |
| status | Y | 결제 상태 |
| approved_at | N | 승인 시각 |
| failed_at | N | 실패 시각 |
| failure_code | N | 정규화된 실패 코드 |
| failure_message | N | 사용자/운영용 최소 메시지 |
| created_at | Y | 생성 |
| updated_at | Y | 갱신 |

### Payment Status

~~~text
CREATED
PROCESSING
VERIFYING
SUCCEEDED
FAILED
CANCELLED
PENDING
REFUNDED
CHARGEDBACK
~~~

Provider의 모든 세부 status를 제품 모델로 그대로 노출하지 않는다.

Provider status → Chagok normalized status mapping이 필요하다.

---

## 7. Entitlement Model

### Purpose

"이 사용자가 이 책 프로젝트의 PDF Export를 사용할 수 있는가?"에 답한다.

### Fields

| Field | Required | Meaning |
|---|---:|---|
| entitlement_id | Y | 권리 ID |
| user_id | Y | 소유 사용자 |
| book_id | Y | 특정 책 |
| product_code | Y | BOOK_PASS |
| source_order_id | Y | 최초 권리 발생 order |
| status | Y | 현재 권리 상태 |
| granted_at | Y | 활성화 시각 |
| revoked_at | N | revoke 시각 |
| revoke_reason | N | refund/cancel/chargeback/admin |
| created_at | Y | 생성 |
| updated_at | Y | 갱신 |

### Entitlement Status

~~~text
PENDING
ACTIVE
REFUNDED
REVOKED
~~~

UI의 LOCKED/UNKNOWN은 서버 데이터 row status라기보다 **조회 결과/클라이언트 상태**다.

- entitlement 없음 → LOCKED
- entitlement 조회 실패 → UNKNOWN
- status ACTIVE → ACTIVE

### Grant Rule

다음 모두 확인된 뒤 ACTIVE:

1. order 대상 book/user가 올바름
2. payment server verification 성공
3. amount/currency 일치
4. order가 이미 refund/revoke 대상이 아님
5. 동일 provider transaction replay 아님

### Revoke Rule

다음 확정 후 revoke:

- 정상 환불
- 결제 취소
- chargeback
- 운영자 명시 revoke

기존 사용자가 이미 다운로드한 PDF 파일을 원격 삭제하는 기능은 없다.

---

## 8. Purchase / Entitlement Lifecycle

~~~text
LOCKED
  ↓ create order
ORDER CREATED
  ↓ checkout
PAYMENT PROCESSING
  ├─ fail → LOCKED
  ├─ pending → LOCKED/PENDING UI
  └─ verified success
         ↓
    ENTITLEMENT ACTIVE
         ↓
   PDF Export allowed

ACTIVE
  ├─ book title/content/theme change → ACTIVE
  ├─ trash → ACTIVE
  ├─ restore → ACTIVE
  ├─ duplicate → original ACTIVE / duplicate LOCKED
  ├─ refund → REFUNDED/REVOKED
  └─ permanent delete → purchase record retained, content may become unavailable
~~~

---

## 9. Refund / Reversal Model

환불 자체를 order/payment row 삭제로 처리하지 않는다.

### Logical Fields

| Field | Required | Meaning |
|---|---:|---|
| refund_id | Y | 내부 환불 ID |
| order_id | Y | 대상 order |
| payment_id | Y | 대상 payment |
| provider_refund_id | N | Provider refund ID |
| amount | Y | 환불 금액 |
| currency | Y | KRW |
| reason | N | 기술장애/중복/사용자 요청 등 |
| status | Y | refund 상태 |
| requested_at | Y | 요청 시각 |
| completed_at | N | 완료 시각 |

### Refund Status

~~~text
REQUESTED
PROCESSING
SUCCEEDED
FAILED
CANCELLED
~~~

초기 Book Pass는 전체 환불 위주로 운영한다.

Refund SUCCEEDED 시 entitlement revoke가 동일 트랜잭션 또는 신뢰 가능한 후속 처리로 이어져야 한다.

---

## 10. Commerce Audit Event

중요 상태 전이는 audit trail을 남긴다.

### Event Examples

~~~text
ORDER_CREATED
ORDER_EXPIRED
PAYMENT_SUCCEEDED
PAYMENT_FAILED
PAYMENT_PENDING
ENTITLEMENT_GRANTED
ENTITLEMENT_REVOKED
PURCHASE_RECOVERED
REFUND_REQUESTED
REFUND_SUCCEEDED
CHARGEBACK_RECEIVED
PAID_BOOK_DELETE_CONFIRMED
~~~

### Fields

| Field | Meaning |
|---|---|
| event_id | audit event ID |
| event_type | normalized event |
| user_id | 관련 사용자 |
| book_id | 관련 책 |
| order_id | nullable |
| payment_id | nullable |
| entitlement_id | nullable |
| actor_type | user/system/admin/provider |
| actor_id | nullable |
| occurred_at | 시각 |
| metadata | 민감정보 최소화 |

PG raw payload 전체를 audit metadata에 무제한 저장하지 않는다.

---

## 11. Webhook Event Deduplication

Provider webhook은 재전송될 수 있다.

필요한 개념:

~~~text
provider_event_id
provider
received_at
processed_at
processing_status
payload_hash (optional)
~~~

규칙:

- 동일 `provider + provider_event_id`는 한 번만 state transition 적용
- duplicate webhook은 2xx로 안전하게 종료 가능
- event ordering이 뒤집혀도 최종 상태가 역행하지 않도록 transition validation
- webhook signature 검증 실패는 상태 변경 금지

---

## 12. Price Snapshot

Order 생성 시 다음을 snapshot으로 보존한다.

~~~text
product_code
currency
amount
price_version
~~~

이유:

- 향후 가격 변경
- 프로모션
- 고객 문의
- 환불
- 회계/영수증

과거 주문은 현재 canonical price가 바뀌어도 amount가 바뀌지 않는다.

---

## 13. Coupon / Promotion — Later

초기 Book Pass launch에서는 복잡한 coupon engine을 만들지 않는다.

필요해질 경우 별도:

- promotion_id
- code
- discount_type
- discount_amount
- valid_from/to
- redemption limit

를 정의한다.

현재 Data Spec v1.0에는 구현 schema로 포함하지 않는다.

100% 테스트 coupon이 필요하면 Payment Phase에서 최소 구조로 별도 결정한다.

---

## 14. Book Duplicate Data Rule

Duplicate는 반드시 새로운 `book_id`를 가진다.

복제 대상:

- book content
- theme
- cover
- user-visible metadata

복제 금지:

- entitlement
- source_order_id
- payment history
- purchase state

~~~text
original.book_id != duplicate.book_id
original entitlement = ACTIVE
duplicate entitlement = none
~~~

---

## 15. Trash / Restore / Permanent Delete

### Trash

- book_id 유지
- ownership 유지
- entitlement 유지
- Export UI는 휴지통 상태에서는 사용 불가로 숨길 수 있음

### Restore

- 같은 book_id 복원
- entitlement ACTIVE면 그대로 복원

### Permanent Delete

- content/storage object 삭제 가능
- order/payment/refund/audit record는 법적·회계·보안 정책에 따라 별도 보존 가능
- entitlement를 다른 새 book_id에 자동 이관하지 않음
- entitlement row의 삭제/보존 방식은 개인정보/법적 retention 정책과 함께 확정

---

## 16. Account Deletion

계정 삭제는 다음 데이터군을 구분한다.

### User Content

- book content
- cover/images
- draft/recovery
- cloud storage

### Commerce Records

- order
- payment
- refund
- receipt evidence
- audit records

Commerce Records는 법적/세무/분쟁 대응을 위해 별도 보존이 필요할 수 있다.

정확한 retention 기간은 SaaS 출시 전 개인정보/전자상거래 정책에서 확정한다.

---

## 17. Ownership Boundary

Payment data는 반드시 Book Ownership 이후 설계한다.

~~~text
Auth User
   ↓
Ownership
   ↓
book_id
   ↓
Order
   ↓
Payment
   ↓
Entitlement
~~~

다른 사용자의 `book_id`에 order를 만들 수 없어야 한다.

client가 임의 user_id/book_id를 넣었다고 신뢰하지 않는다.

서버 session과 ownership DB를 기준으로 검증한다.

---

## 18. Data Access Matrix

| Data | User | Server | Provider | Admin/Support |
|---|---|---|---|---|
| canonical price | Read | Read/Manage | No | Manage |
| order | Own read | R/W | Indirect | Support read |
| payment | Own summary | R/W | Source events | Support read |
| entitlement | Own read | R/W | No | Controlled override |
| refund | Own status | R/W | Source/result | Controlled action |
| audit event | No direct raw | Write/read | Event source | Restricted |
| webhook raw/minimal event | No | Restricted | Source | Restricted |

사용자에게 Provider secret/raw payload를 노출하지 않는다.

---

## 19. Security / Privacy Rules

- 카드번호 등 PCI 민감 결제정보를 차곡 DB에 직접 저장하지 않는다.
- Provider가 제공하는 tokenized/payment reference만 사용한다.
- API secret은 client bundle에 넣지 않는다.
- order amount는 server canonical price로 계산한다.
- ownership 검증 필수.
- webhook signature 검증 필수.
- audit log에 원고 본문/민감 콘텐츠 금지.
- 개인정보 최소수집.
- 결제 로그에 access token/session token 저장 금지.

---

## 20. Index / Constraint Requirements — Logical

실제 DB 구현 시 최소 보장:

- `order_id` unique
- `payment_id` unique
- `entitlement_id` unique
- provider transaction ref unique where applicable
- webhook provider event unique
- idempotency key unique per user/action scope
- ACTIVE entitlement 중복 방지
- book_id ownership lookup efficient
- user purchase history lookup efficient

정확한 SQL/index는 Phase 16 이후 작성한다.

---

## 21. Recovery Rules

### Redirect Failure

server order/payment/entitlement가 SoT.

client local state 없이도 복구 가능해야 한다.

### Browser / Device Change

로그인 사용자 + ownership + server records로 복구.

### Duplicate Client Submit

idempotency key로 동일 order를 반환.

### Webhook Delay

checkout client success만으로 entitlement grant 금지.

server verification/webhook reconciliation으로 최종 확정.

---

## 22. Data Not Stored in Commerce Layer

다음은 Commerce data에 복제하지 않는다.

- 원고 본문
- 전체 `book.html`
- cover image binary
- image sidecar
- Editor recovery
- Wizard draft
- 페이지별 내용

Commerce는 책의 구매권리와 거래만 다룬다.

---

## 23. Current vs Target

| Data | State |
|---|---|
| Core `file` path identity | CURRENT |
| `book.html` SoT | CURRENT |
| Local PDF export | CURRENT |
| Auth session foundation | CURRENT / Local fallback |
| stable service `book_id` | TARGET / Phase 16 |
| Ownership | TARGET / Phase 16 |
| Product/price record | TARGET / Payment |
| Order | TARGET / Payment |
| Payment attempt | TARGET / Payment |
| Entitlement | TARGET / Payment |
| Refund | TARGET / Payment |
| Commerce audit | TARGET / Payment |
| Webhook dedup | TARGET / Payment |

---

## 24. Implementation Gate

이 문서를 기반으로 DB를 지금 생성하지 않는다.

선행 조건:

1. Phase 15B Auth Runtime
2. Phase 16 Ownership model
3. service-layer stable `book_id`
4. deployment architecture
5. Payment Provider 결정
6. 이용약관/개인정보/환불 고지
7. retention 정책
8. server-side secrets/runtime

그 뒤에 실제 DB schema/RLS/migration을 작성한다.

---

## 25. Done Criteria

Payment Data Spec v1.0 완료 기준:

- Book / Order / Payment / Entitlement identity 분리
- entitlement lifecycle 정의
- refund/revoke 정의
- price snapshot 정의
- idempotency/audit/webhook dedup 정의
- duplicate/trash/delete/account deletion 정의
- ownership/security boundary 정의
- Core Engine 불변 원칙 유지
