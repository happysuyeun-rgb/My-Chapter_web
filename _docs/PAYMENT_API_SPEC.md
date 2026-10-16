# 차곡 Payment API Specification

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **TARGET / COMMERCE API CONTRACT**
- Depends on:
  - `_docs/PAYMENT_DATA_SPEC.md` v1.0
  - `_docs/PAYMENT_SCREEN_SPEC.md` v1.0
  - `_docs/PRICING_POLICY.md` v1.1
- Implementation: **DO NOT IMPLEMENT YET**
- Provider: **TBD**
- Route namespace: logical target only; deployment architecture에서 최종 확정

이 문서는 Book Pass 결제에 필요한 **provider-agnostic server API 계약**을 정의한다.

현재 `preview-server.mjs`에 아래 API를 추가하라는 뜻이 아니다.

---

## 1. API Principles

1. 모든 결제/entitlement 판정은 서버를 신뢰 경계로 한다.
2. client가 보낸 가격을 신뢰하지 않는다.
3. client가 보낸 user_id를 신뢰하지 않는다.
4. session 사용자와 book ownership을 서버에서 확인한다.
5. ACTIVE entitlement가 있으면 중복 결제 order를 만들지 않는다.
6. create-order는 idempotent해야 한다.
7. provider callback만으로 성공을 확정하지 않는다.
8. provider webhook은 signature 검증 + dedup 처리한다.
9. payment success와 PDF generation success는 별도 API/상태다.
10. API가 실패해도 기존 Book content를 destructive하게 변경하지 않는다.

---

## 2. Target Namespace

논리 namespace:

~~~text
/api/commerce/*
~~~

최종 Vercel/worker/server architecture에 따라 실제 path는 달라질 수 있다.

Core Local Engine route:

~~~text
/__pdf
/__edit
/__blocks
...
~~~

와 Payment API namespace를 분리한다.

---

## 3. Common Auth / Ownership Rule

Commerce API는 기본적으로 로그인 사용자만 호출한다.

서버가 session에서:

~~~text
user_id
~~~

를 얻는다.

Request body의 user_id는 사용하지 않는다.

Book 관련 요청은:

~~~text
book_id
→ ownership check
→ authorized
~~~

순서로 검증한다.

Guest → Account migration이 끝나지 않은 책은 Checkout을 시작하지 않는다.

---

## 4. Common Response Shape

권장 logical shape:

~~~json
{
  "ok": true,
  "data": {}
}
~~~

Error:

~~~json
{
  "ok": false,
  "error": {
    "code": "COMMERCE_ERROR_CODE",
    "message": "사용자 표시용 메시지"
  }
}
~~~

실제 framework 표준이 있으면 구현 시 맞춘다.

---

## 5. Error Codes

초기 최소 normalized codes:

| Code | HTTP | Meaning |
|---|---:|---|
| AUTH_REQUIRED | 401 | 로그인 필요 |
| BOOK_NOT_FOUND | 404 | 책 없음 |
| BOOK_FORBIDDEN | 403 | 소유권 없음 |
| PRICE_UNAVAILABLE | 503 | canonical price 조회 실패 |
| PRICE_CHANGED | 409 | 사용자가 본 가격과 현재 가격 불일치 |
| ENTITLEMENT_ACTIVE | 409 | 이미 구매 완료 |
| ENTITLEMENT_UNKNOWN | 503 | 권리 상태 확인 실패 |
| ORDER_NOT_FOUND | 404 | 주문 없음 |
| ORDER_EXPIRED | 409 | 주문 만료 |
| ORDER_STATE_INVALID | 409 | 상태 전이 불가 |
| PAYMENT_FAILED | 402 | 결제 실패 |
| PAYMENT_PENDING | 202 | 결제 확인 중 |
| PAYMENT_VERIFICATION_FAILED | 409 | 결제 검증 실패 |
| DUPLICATE_PAYMENT | 409 | 중복 거래 감지 |
| REFUND_NOT_ALLOWED | 409 | 환불 처리 불가 상태 |
| PROVIDER_UNAVAILABLE | 503 | PG 장애 |
| INTERNAL_ERROR | 500 | 서버 오류 |

Provider-specific code는 내부 mapping 후 필요할 때만 보조 필드로 둔다.

---

## 6. API-COMMERCE-01 Canonical Price

### Method / Path

~~~text
GET /api/commerce/products/book-pass
~~~

### Purpose

Pricing/Paywall/Checkout의 현재 canonical price 제공.

### Auth

Public read 가능 후보. 구현 시 abuse/cache 정책 결정.

### Response

~~~json
{
  "ok": true,
  "data": {
    "productCode": "BOOK_PASS",
    "displayName": "Book Pass",
    "currency": "KRW",
    "amount": 14900,
    "priceVersion": "2026-10-16-v1",
    "active": true
  }
}
~~~

### Rules

- client hardcoded price보다 서버 응답 우선.
- inactive면 Checkout 금지.
- cache 가능하나 Checkout 생성 시 다시 검증.

---

## 7. API-COMMERCE-02 Entitlement Check

### Method / Path

~~~text
GET /api/commerce/books/:bookId/entitlement
~~~

### Purpose

현재 사용자의 해당 책 PDF Export 권리 확인.

### Auth

Required.

### Validation

- session user
- book ownership

### Response — Locked

~~~json
{
  "ok": true,
  "data": {
    "bookId": "uuid",
    "state": "LOCKED"
  }
}
~~~

### Response — Active

~~~json
{
  "ok": true,
  "data": {
    "bookId": "uuid",
    "state": "ACTIVE",
    "entitlementId": "uuid",
    "grantedAt": "ISO"
  }
}
~~~

### Failure

조회 자체 실패 시 LOCKED로 위장하지 않는다.

~~~text
ENTITLEMENT_UNKNOWN
~~~

---

## 8. API-COMMERCE-03 Create Order

### Method / Path

~~~text
POST /api/commerce/orders
~~~

### Headers

~~~text
Idempotency-Key: <opaque unique value>
~~~

### Request

~~~json
{
  "bookId": "uuid",
  "productCode": "BOOK_PASS"
}
~~~

금액/user_id를 Request에서 신뢰하지 않는다.

### Server Flow

1. session 확인
2. book ownership 확인
3. existing ACTIVE entitlement 확인
4. product active 확인
5. canonical amount 결정
6. idempotency check
7. order 생성
8. provider payment initialization 필요 시 생성

### Response

~~~json
{
  "ok": true,
  "data": {
    "orderId": "uuid",
    "bookId": "uuid",
    "productCode": "BOOK_PASS",
    "currency": "KRW",
    "amount": 14900,
    "status": "READY",
    "checkout": {
      "provider": "TBD",
      "clientPayload": {}
    }
  }
}
~~~

### Error

- ENTITLEMENT_ACTIVE
- PRICE_UNAVAILABLE
- BOOK_FORBIDDEN
- AUTH_REQUIRED

---

## 9. API-COMMERCE-04 Order Status

### Method / Path

~~~text
GET /api/commerce/orders/:orderId
~~~

### Purpose

refresh / redirect failure / pending recovery.

### Auth

Required. order owner only.

### Response

~~~json
{
  "ok": true,
  "data": {
    "orderId": "uuid",
    "bookId": "uuid",
    "status": "PAID",
    "paymentStatus": "SUCCEEDED",
    "entitlementState": "ACTIVE",
    "currency": "KRW",
    "amount": 14900
  }
}
~~~

### Notes

Purchase Recovery의 핵심 API 후보.

---

## 10. API-COMMERCE-05 Verify Payment

Provider에 따라 필요할 경우:

~~~text
POST /api/commerce/orders/:orderId/verify
~~~

### Request

Provider가 client redirect에서 전달한 최소 reference.

~~~json
{
  "providerPaymentRef": "opaque"
}
~~~

### Server Flow

1. session/order owner 확인
2. order amount/currency 확인
3. provider server API로 실제 거래 조회
4. provider transaction/order ref 일치
5. amount/currency 일치
6. 이미 처리된 거래인지 확인
7. payment SUCCEEDED
8. order PAID
9. entitlement grant
10. audit event

### Response — Success

~~~json
{
  "ok": true,
  "data": {
    "orderId": "uuid",
    "paymentStatus": "SUCCEEDED",
    "entitlementState": "ACTIVE"
  }
}
~~~

### Response — Pending

HTTP 202 가능:

~~~json
{
  "ok": true,
  "data": {
    "orderId": "uuid",
    "paymentStatus": "PENDING"
  }
}
~~~

---

## 11. API-COMMERCE-06 Provider Webhook

### Method / Path

~~~text
POST /api/commerce/webhooks/:provider
~~~

### Auth

사용자 session이 아니라 Provider signature.

### Flow

1. signature 검증
2. provider event id 추출
3. dedup
4. normalized event mapping
5. order/payment 조회
6. valid transition 확인
7. payment/order update
8. entitlement grant/revoke
9. audit event
10. 2xx response

### Rules

- raw body signature 검증 요구사항은 provider 문서 우선.
- signature 실패 → 4xx, state mutation 없음.
- duplicate event → state 중복 변경 없이 2xx 가능.
- webhook endpoint에 사용자-facing HTML 반환하지 않는다.

---

## 12. API-COMMERCE-07 Purchase Recovery

별도 endpoint가 필요하면:

~~~text
POST /api/commerce/books/:bookId/recover-purchase
~~~

하지만 기본적으로는:

~~~text
GET entitlement
+ GET recent orders
~~~

조합으로 충분할 수 있다.

### Purpose

redirect/local state loss 후 server record 기준 복구.

### Rule

"recover"가 entitlement transfer를 의미하면 안 된다.

같은 user + same stable book_id만 복구.

---

## 13. API-COMMERCE-08 Purchase History

### Method / Path

~~~text
GET /api/commerce/purchases
~~~

### Auth

Required.

### Query

~~~text
?cursor=
?limit=
~~~

### Response

~~~json
{
  "ok": true,
  "data": {
    "items": [
      {
        "orderId": "uuid",
        "bookId": "uuid",
        "productCode": "BOOK_PASS",
        "amount": 14900,
        "currency": "KRW",
        "status": "PAID",
        "entitlementState": "ACTIVE",
        "purchasedAt": "ISO",
        "receiptUrl": null
      }
    ],
    "nextCursor": null
  }
}
~~~

책 제목은 UI 조합 단계에서 Book metadata와 join할 수 있다. Commerce record에 제목을 SoT로 중복 저장하지 않는다.

---

## 14. API-COMMERCE-09 Refund Request — Later / Support

초기 셀프서비스 환불 API는 만들지 않아도 된다.

Support/Admin controlled logical operation:

~~~text
POST /api/commerce/orders/:orderId/refund
~~~

### Auth

Admin/support restricted.

### Request

~~~json
{
  "reason": "technical_failure"
}
~~~

### Server Flow

1. order/payment state 확인
2. provider refund 요청
3. refund record 생성
4. success 확인
5. order/payment normalized update
6. entitlement revoke
7. audit event

### Rule

Provider refund 성공 전에 entitlement를 먼저 revoke할지 여부는 구현 트랜잭션 전략에서 확정한다.

사용자 UI에는 요청/처리 상태만 노출.

---

## 15. API-COMMERCE-10 Receipt / Purchase Info

Provider receipt URL을 직접 노출할 수 있다면 Purchase History response에 포함.

별도 endpoint 후보:

~~~text
GET /api/commerce/orders/:orderId/receipt
~~~

### Rule

- order owner only
- Provider secret 정보 제거
- receipt unavailable이면 명시적 상태

---

## 16. API-EXPORT Integration

현재 Local:

~~~text
GET /__pdf?file=...
~~~

는 CURRENT Core Engine route다.

SaaS Payment 연결 후 Export authorization은 별도 service boundary가 필요하다.

권장 logical flow:

~~~text
Client
  ↓
Commerce Entitlement Check
  ↓ ACTIVE
Authorized Export API
  ↓
PDF Worker / Existing PDF Engine
~~~

중요:

현재 `/__pdf` route를 즉시 결제-aware하게 수정하지 않는다.

Phase 16 이후 API authorization 구조를 설계한 뒤 WRAP한다.

---

## 17. Authorized Export Target — Conceptual

최종 후보:

~~~text
POST /api/books/:bookId/pdf
~~~

or

~~~text
GET /api/books/:bookId/pdf
~~~

정확한 method는 worker/queue architecture에 따라 결정.

Server requirements:

- session user
- ownership
- ACTIVE entitlement
- book storage resolve
- PDF job
- success/failure

Free/LOCKED는 402/403 성격 중 제품 표준을 구현 시 결정한다.

기존 Local `/__pdf` route 계약을 깨지 않는다.

---

## 18. Idempotency

적용 대상:

- create order
- payment verify
- webhook state transition
- refund
- entitlement grant

### Create Order

client가 생성한 opaque idempotency key 사용.

같은 user + same key:

- 동일 request → 같은 order 반환
- 다른 request payload → 409 후보

### Entitlement Grant

동일 source order에서 entitlement를 두 번 grant하지 않는다.

---

## 19. Concurrency

대표 race:

### Double Click

동일 idempotency key → order 하나.

### Two Tabs

ACTIVE entitlement / in-flight order를 서버에서 재확인.

### Verify + Webhook Simultaneous

transaction/unique constraint + idempotent transition으로 한 번만 grant.

### Refund + Export Concurrent

authorization check 시 entitlement 현재 상태를 기준으로 처리.

정확한 DB transaction isolation은 구현 시 결정.

---

## 20. State Transition Guard

### Order

~~~text
CREATED → READY → PROCESSING → PAID
                       ├→ FAILED
                       ├→ CANCELLED
                       └→ EXPIRED
PAID → REFUNDED
~~~

### Payment

~~~text
CREATED → PROCESSING → VERIFYING → SUCCEEDED
                    ├→ FAILED
                    ├→ CANCELLED
                    └→ PENDING → VERIFYING
SUCCEEDED → REFUNDED / CHARGEDBACK
~~~

### Entitlement

~~~text
PENDING → ACTIVE
ACTIVE → REFUNDED / REVOKED
~~~

역행 전이는 기본 금지.

---

## 21. Price Change Handling

Paywall은 14,900을 봤지만 order 생성 시 canonical price가 바뀌었다면:

- order를 조용히 새 가격으로 결제시키지 않는다.
- API는 PRICE_CHANGED 또는 새 canonical quote를 반환.
- UI는 최종 금액 재확인.

Response 후보:

~~~json
{
  "ok": false,
  "error": {
    "code": "PRICE_CHANGED",
    "message": "가격이 변경되어 최종 결제금액을 다시 확인해주세요."
  },
  "data": {
    "currency": "KRW",
    "amount": 15900,
    "priceVersion": "..."
  }
}
~~~

---

## 22. Security Requirements

- HTTPS only
- provider secret server-only
- webhook signature validation
- ownership validation
- canonical amount server-side
- no card PAN/CVC storage
- CSRF strategy는 Auth architecture에 맞춰 결정
- rate limiting
- audit logging
- safe error messages
- no stack trace/provider secret to client
- session/user from trusted auth layer

---

## 23. Observability

최소 structured log:

- request_id
- route
- user_id (internal safe id)
- book_id
- order_id
- payment_id
- normalized status transition
- provider event id
- latency
- error code

금지:

- 원고 본문
- 카드번호
- access token
- provider secret
- full webhook payload 무제한 저장

---

## 24. API → Screen Mapping

| API | Screen |
|---|---|
| Product Price | P01, P02, P03 |
| Entitlement Check | P02, P07 |
| Create Order | P03 |
| Order Status | P04, P06, P09 |
| Verify Payment | P04, P05 |
| Webhook | background |
| Purchase History | P08 |
| Recovery | P09 |
| Refund status | P10 |
| Authorized Export | P05, P07 |

---

## 25. API → Data Mapping

| API | Primary Data |
|---|---|
| Product Price | Product/Price |
| Entitlement Check | Entitlement |
| Create Order | Order + Price snapshot |
| Order Status | Order + Payment + Entitlement summary |
| Verify Payment | Payment + Order + Entitlement + Audit |
| Webhook | Payment + Refund + Entitlement + Audit |
| Purchase History | Order + Entitlement |
| Refund | Refund + Payment + Entitlement + Audit |
| Authorized Export | Ownership + Entitlement + Book resolve |

---

## 26. Current vs Target

| API | State |
|---|---|
| `/__pdf?file=` | CURRENT Local Engine |
| `/api/commerce/products/book-pass` | TARGET |
| entitlement check | TARGET |
| create order | TARGET |
| order status | TARGET |
| payment verify | TARGET |
| provider webhook | TARGET |
| purchase history | TARGET |
| refund | TARGET / Support |
| authorized SaaS PDF export | TARGET / post-Phase16 |

---

## 27. Provider Selection Impact

Payment Provider가 결정되면 다음만 provider-specific appendix로 추가한다.

- checkout initialize payload
- client SDK fields
- server verify call
- webhook signature
- provider event mapping
- receipt/refund API
- sandbox/test mode

Core Commerce API/Entitlement model은 Provider에 종속되지 않게 유지한다.

---

## 28. Implementation Gate

이 API를 지금 만들지 않는다.

선행:

1. Phase 15B Auth Runtime
2. Phase 16 Ownership
3. stable `book_id`
4. DB/RLS boundary
5. deployment architecture
6. Payment Provider
7. legal checkout/retention
8. secrets management
9. refund/support process

---

## 29. Done Criteria

Payment API Spec v1.0 완료 기준:

- canonical price API
- entitlement API
- idempotent order API
- server payment verification
- webhook contract
- purchase recovery/history
- refund/revoke
- authorized export boundary
- error/status model
- security/observability
- provider-agnostic architecture
