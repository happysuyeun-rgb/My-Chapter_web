# 차곡 Payment & Pricing UI Requirements

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **TARGET / UI REQUIREMENTS ONLY**
- Depends on: `_docs/SERVICE_POLICY.md`, `_docs/PRICING_POLICY.md`
- Implementation: **DO NOT IMPLEMENT YET**
- Payment / Auth / Ownership: Phase 15B / 16 이후 착수

이 문서는 차곡의 향후 Pricing/Payment UI 요구사항을 정의한다.

현재 Local MVP에는 결제를 연결하지 않는다.  
이 문서는 **결제 구현 전에 UX 계약을 먼저 고정하기 위한 기준**이다.

---

## 1. UX Goal

가격 UI는 사용자가 다음 4가지를 즉시 이해하게 해야 한다.

1. 책을 만들어보는 것은 무료다.
2. 결제는 PDF 완성본이 필요할 때만 한다.
3. 가격은 책 1권당 ₩14,900이다.
4. 한 번 결제한 같은 책은 다시 결제하지 않는다.

핵심 메시지:

> **먼저 만들어보고, 완성본이 필요할 때 결제하세요.**

가격표보다 "언제 돈을 내는지"가 더 명확해야 한다.

---

## 2. Target Screens / States

기존 S01~S16 이후 가격/결제 화면을 별도 영역으로 정의한다.

| ID | Screen / State | Route / Surface | Status |
|---|---|---|---|
| P01 | Pricing | `/pricing` | TARGET |
| P02 | Export Paywall | Workspace modal/panel | TARGET |
| P03 | Checkout | `/__checkout?file=...` 후보 | TARGET |
| P04 | Payment Processing | Checkout state | TARGET |
| P05 | Payment Success | Checkout completion | TARGET |
| P06 | Payment Failure | Checkout error state | TARGET |
| P07 | Already Unlocked | Workspace Export state | TARGET |
| P08 | Purchase / Entitlement Info | Library/Book menu | LATER |

라우트는 구현 Phase에서 서버 구조에 맞춰 최종 확정한다.

---

## 3. P01 Pricing Page

### 3.1 Purpose

- 가격 구조 설명
- Free와 Book Pass 차이 설명
- 구독 강요가 아님을 명확히 전달
- 사용자가 책 제작을 시작하도록 유도

### 3.2 Hero

권장:

**제목**
> 먼저 책을 만들어보세요.

**설명**
> 원고 입력부터 디자인·표지·미리보기까지 무료입니다.  
> 완성 PDF가 필요할 때 책 1권당 ₩14,900만 결제하세요.

Primary CTA:
- **무료로 책 만들기**

Secondary CTA:
- 내 서재

로그인/결제가 아직 필요하지 않은 사용자를 가격표에서 막지 않는다.

### 3.3 Pricing Cards

초기에는 카드 2개만 노출한다.

#### Free

~~~text
Free
₩0

책을 완성해보기 위한 모든 기본 제작 기능

✓ 원고 Import
✓ 구조 정리
✓ Practical / Minimal
✓ 표지
✓ 본문 편집
✓ 전체 Preview

— PDF 다운로드 제외

[무료로 시작]
~~~

#### Book Pass

~~~text
Book Pass
₩14,900 / 책 1권

완성된 이 책을 실제 파일로 가져가세요.

✓ 워터마크 없는 PDF
✓ 같은 책 재출력
✓ 본문 수정 후 재출력
✓ 표지 변경 후 재출력
✓ Theme 변경 후 재출력
✓ 상업적 이용 가능

[책 만들기 시작]
~~~

Pricing 화면에서 Creator를 실제 판매 카드처럼 노출하지 않는다.

필요하면 맨 아래 작은 문구:

> 여러 권을 만드는 Creator 플랜은 추후 제공 예정입니다.

초기에는 이 문구도 없어도 된다.

---

## 4. Pricing Page Design Rules

- 4개 요금제 표 금지
- "BEST", "MOST POPULAR" 같은 억지 강조 금지
- 월 환산 가격 금지
- 숨겨진 수수료 금지
- 가짜 할인 정가 금지
- Book Pass 카드를 시각적 Primary로 둘 수 있음
- 그러나 Free를 의도적으로 불편하게 보이게 만들지 않음

모바일에서는:

~~~text
Free
↓
Book Pass
~~~

1열 스택.

Desktop에서는 2열 카드.

---

## 5. P02 Export Paywall

### 5.1 Trigger

Free entitlement 상태에서 사용자가:

- PDF Export
- PDF 다운로드
- Export Complete로 진입

을 시도할 때 노출한다.

Preview 자체에서는 결제를 강제하지 않는다.

### 5.2 Recommended Modal Copy

**Title**
> 이 책을 완성할까요?

**Body**
> ₩14,900 한 번 결제하면  
> 이 책의 PDF를 계속 다시 만들고 다운로드할 수 있어요.

Benefits:

- 워터마크 없는 PDF
- 수정 후 재출력
- 상업적 이용 가능

Primary CTA:
> **₩14,900 결제하고 PDF 만들기**

Secondary:
> 미리보기로 돌아가기

Tertiary text link:
> 가격 정책 보기

### 5.3 Context

Paywall에 현재 책을 보여준다.

- Book title
- Author
- Cover thumbnail (가능하면)
- 현재 페이지 수 (안정적으로 계산되는 경우에만)

단, 페이지 수에 따라 가격이 달라지는 인상을 주지 않는다.

---

## 6. Paywall Rules

Paywall은 다음을 하지 않는다.

- 작업물을 잃게 하지 않음
- Checkout 때문에 Workspace state를 초기화하지 않음
- 뒤로 가면 Preview 상태가 유지됨
- 결제 실패 후 다시 원고 처음부터 시작시키지 않음
- 결제 버튼 연타로 중복 주문을 만들지 않음

Paywall은 **저장된 작업 위에 얹히는 구매 단계**다.

---

## 7. P03 Checkout

### 7.1 Layout

Checkout 핵심 정보:

~~~text
차곡 Book Pass

[책 제목]

책 1권 PDF Export Unlock

결제금액
₩14,900
~~~

포함 혜택:

- 이 책의 PDF Export
- 같은 책 재출력
- 워터마크 없음
- 상업적 이용 가능

### 7.2 Required Information

실제 PG 연동 전 확정할 항목:

- 결제수단
- 구매자 식별
- 이메일/영수증 수신
- 세금/증빙
- 이용약관
- 개인정보 처리
- 디지털 콘텐츠 공급/환불 고지
- 최종 결제금액

법률 검토가 끝나기 전 임의의 "환불 불가" 체크박스를 넣지 않는다.

### 7.3 CTA

Primary:

> **₩14,900 결제하기**

버튼 옆/아래:

> 결제가 완료되면 이 책의 PDF Export가 잠금 해제됩니다.

---

## 8. P04 Payment Processing

결제 진행 중에는 명확한 단일 상태를 보여준다.

~~~text
결제를 확인하고 있어요.
창을 닫지 마세요.
~~~

Requirements:

- 결제 CTA disabled
- 중복 요청 방지
- spinner/progress
- 브라우저 refresh 시 거래 상태 재조회 가능하도록 설계
- 결제 완료 여부를 client callback만 믿지 않음
- 서버 검증 전 entitlement를 확정하지 않음

마지막 두 항목은 구현 Phase의 보안 요구사항이다.

---

## 9. P05 Payment Success

### 9.1 Copy

**Title**
> 이 책의 PDF가 열렸어요.

**Body**
> 이제 이 책은 다시 결제하지 않고 PDF를 만들 수 있어요.

Primary:
> **PDF 만들기**

Secondary:
> 책으로 돌아가기

Optional:
> 영수증 보기

### 9.2 Behavior

Success 이후:

1. purchase server verification
2. entitlement = unlocked
3. Workspace 복귀 또는 PDF 생성
4. Export CTA 상태 갱신

가능하면 사용자가 Checkout을 시작했던 책으로 정확히 돌아간다.

---

## 10. P06 Payment Failure

실패 상태는 결제 실패와 PDF 생성 실패를 구분한다.

### Payment Failure

~~~text
결제가 완료되지 않았어요.
결제수단을 확인하고 다시 시도해주세요.
~~~

Actions:

- 다시 결제
- 책으로 돌아가기

### Payment Verification Pending

~~~text
결제 확인에 시간이 걸리고 있어요.
잠시 후 다시 확인해주세요.
~~~

Actions:

- 결제 상태 다시 확인
- 서재로 이동

"실패"로 단정하기 전에 실제 거래 상태를 확인한다.

---

## 11. PDF Generation Failure After Successful Purchase

결제 성공과 PDF 생성은 별도 상태다.

예:

~~~text
결제는 완료됐어요.
PDF 생성 중 문제가 발생했습니다.

구매한 이 책은 이미 잠금 해제되어 있어요.
다시 생성해도 추가 결제되지 않습니다.
~~~

Primary:
- PDF 다시 만들기

Secondary:
- 책으로 돌아가기

절대 다시 Paywall을 보여주지 않는다.

---

## 12. P07 Already Unlocked State

Book Pass 구매 이후 Export 영역:

Before:

> PDF 만들기  
> Book Pass ₩14,900

After:

> **PDF 만들기**  
> 이 책은 Book Pass로 잠금 해제됨

Optional status badge:

> PDF Unlock

"Pro" badge는 사용하지 않는다. 사용자가 구독한 것이 아니기 때문이다.

---

## 13. Library Card / Book Menu

Book Pass 상태가 Library에서 보일 필요가 있다면 작은 상태만 표시한다.

예:

- **PDF 사용 가능**
- 또는 작은 download/unlock icon

과도한 결제 배지는 책 자체보다 강조하지 않는다.

추후 메뉴:

- PDF 만들기
- 구매 정보

구매 정보는 Phase 16 이후 ownership/payment history 설계와 함께 확정한다.

---

## 14. Duplicate Book Behavior

구매한 책을 Duplicate하면:

Original:
> PDF Unlock

Duplicate:
> Free / PDF Locked

Duplicate 생성 시 필요하면 짧게 안내:

> 복제본은 새 책으로 생성되어 PDF Export는 별도 Book Pass가 필요합니다.

복제 전에 구매를 다시 요구하지 않는다.

---

## 15. Title / Content Changes

구매 후 다음 변경으로 Paywall이 다시 생기면 안 된다.

- 제목
- 부제
- 저자
- 본문
- 목차
- 표지
- Theme
- 페이지 수 변화

Entitlement는 콘텐츠 hash나 제목이 아니라 **책 프로젝트의 stable purchase identity**에 연결한다.

---

## 16. Auth Interaction

현재 Local MVP는 결제가 없다.

향후 실제 Payment를 붙일 때는 구매 entitlement 복구를 위해 사용자 식별이 필요하다.

권장 Target:

~~~text
Guest book
  ↓
Export Paywall
  ↓
구매 시점에 로그인/계정 확인
  ↓
Checkout
  ↓
Book ownership + entitlement
~~~

그러나 Auth를 앞단 강제벽으로 만들지 않는다.

사용자는 구매 직전까지 원고 제작과 Preview를 경험할 수 있어야 한다.

정확한 Guest→Account migration은 Phase 15B/16에서 설계한다.

---

## 17. Pricing Entry Points

가격 페이지 진입점 후보:

- Landing header/footer "가격"
- Export Paywall "가격 정책 보기"
- FAQ
- 결제 전 Checkout

초기 Landing Hero Primary CTA는 계속:

> 새 책 만들기

가격 보기가 Hero보다 우선하면 안 된다.

---

## 18. Loading / Disabled / Error States

### Pricing Loading

가격은 가능한 한 정적 정책값으로 빠르게 노출.

결제 provider 상태를 기다리느라 Pricing 전체를 막지 않는다.

### Checkout Disabled

예:

- 거래 생성 중
- 이미 결제 진행 중
- 구매 검증 중

### Entitlement Unknown

네트워크 문제로 entitlement를 확인할 수 없으면:

> 구매 상태를 확인할 수 없습니다.

재확인 CTA 제공.

바로 Free로 간주해 Paywall을 띄우지 않는다.

---

## 19. Accessibility

- 가격은 색만으로 구분하지 않음
- CTA 텍스트에 금액 포함
- focus 상태 명확
- modal keyboard trap / ESC 정책 명확
- screen reader에서 가격과 단위를 한 문장으로 읽을 수 있어야 함
- disabled CTA 이유가 필요한 경우 텍스트 제공
- 성공/실패 메시지는 시각 효과만으로 전달하지 않음

---

## 20. Responsive

검수 기준:

- Mobile: 390px
- Tablet: 768px
- Desktop: 1440px

특히:

- Pricing 카드 1열/2열 전환
- 긴 혜택 copy wrapping
- ₩14,900 가격 줄바꿈 방지
- Checkout summary clipping 방지
- modal viewport height
- keyboard open 시 CTA 가림 방지
- safe area

---

## 21. Analytics Requirements

결제 구현 시 최소 이벤트:

- `pricing_view`
- `pricing_start_free_click`
- `export_paywall_view`
- `export_paywall_purchase_click`
- `checkout_view`
- `checkout_submit`
- `payment_success`
- `payment_failure`
- `payment_pending`
- `pdf_export_after_purchase`
- `repeat_pdf_export`

Required properties 후보:

- book entitlement state
- source screen
- import method
- theme
- approximate page bucket
- new vs returning user

원고 내용/책 제목 등 민감한 실제 콘텐츠를 analytics property로 보내지 않는다.

---

## 22. Security / Payment Integrity Requirements

UI 요구사항이지만 구현 시 반드시 지킬 것:

- 클라이언트만으로 결제 성공 판정 금지
- 가격을 client request 값만 믿지 않음
- server-side amount/order verification
- idempotency / duplicate payment protection
- payment callback replay protection
- entitlement grant audit trail
- 실패 후 entitlement 회수/복구 기준
- 사용자가 다른 책의 entitlement를 임의로 재사용하지 못하도록 ownership 검증

이 구현은 Phase 15B/16 이후 Payment Phase에서 별도 기술 명세가 필요하다.

---

## 23. Out of Scope for First Payment UI

초기 결제에 넣지 않는다.

- Creator subscription checkout
- annual billing
- team billing
- seat management
- coupon marketplace
- affiliate
- complex credit packs
- AI usage purchase
- invoice admin dashboard
- multiple currencies
- lifetime plan
- enterprise sales form

Book Pass 하나의 결제 성공률부터 검증한다.

---

## 24. QA Acceptance — Pricing / Payment

실제 구현 시 최소 Acceptance:

### Pricing

- Free / Book Pass 가격 정확
- ₩14,900 한 번만 명확히 표시
- Creator가 현재 판매 상품처럼 보이지 않음

### Paywall

- Preview는 무료 유지
- Free Export에서만 paywall
- unlocked book에는 paywall 없음

### Checkout

- 올바른 책
- 올바른 가격
- 중복 결제 방지
- 취소 후 작업 상태 보존

### Success

- 결제 검증 완료 후 unlock
- 동일 책 재결제 없음
- PDF 실패 시 entitlement 유지

### Failure

- 결제 실패와 PDF 실패 구분
- 작업 데이터 손실 없음

### Duplicate

- 원본 entitlement 유지
- 복제본은 별도 locked 상태

### Responsive

- 390 / 768 / 1440 PASS

---

## 25. UI Copy Summary

### Pricing
> 먼저 책을 만들어보세요.  
> 완성 PDF가 필요할 때 책 1권당 ₩14,900만 결제하세요.

### Paywall
> 이 책을 완성할까요?  
> ₩14,900 한 번 결제하면 이 책의 PDF를 계속 다시 만들 수 있어요.

### Checkout CTA
> ₩14,900 결제하기

### Success
> 이 책의 PDF가 열렸어요.

### PDF Failure after Purchase
> 결제는 완료됐어요. 이 책은 이미 잠금 해제되어 있습니다.

---

## 26. Implementation Gate

이 UI를 실제 구현하기 전에 먼저 필요한 것:

1. Phase 15B Auth Runtime
2. Phase 16 Book Ownership
3. stable commerce entitlement identity
4. Payment provider 결정
5. server-side payment verification architecture
6. Book Pass purchase ledger
7. refund/legal checkout wording review
8. cloud/deployment architecture

따라서 현재 단계에서는:

~~~text
POLICY = 확정
UI REQUIREMENTS = 확정
PAYMENT IMPLEMENTATION = HOLD
~~~

---

## 27. Final Product Principle

결제 UI는 제작 흐름을 방해하는 앞문이 아니라 **완성물을 가져가는 마지막 단계**여야 한다.

~~~text
만들기 전에 결제시키지 않는다.
가치를 본 뒤 결제하게 한다.
한 번 산 같은 책은 다시 결제시키지 않는다.
~~~
