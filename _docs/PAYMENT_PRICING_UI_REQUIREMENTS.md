# 차곡 Payment & Pricing UI Requirements

- Product: 차곡 (Chagok)
- Version: **v1.1**
- Date: 2026-10-16
- Status: **TARGET / UI REQUIREMENTS ONLY**
- Depends on: `_docs/SERVICE_POLICY.md`, `_docs/PRICING_POLICY.md`
- Implementation: **DO NOT IMPLEMENT YET**
- Payment / Auth / Ownership: Phase 15B / 16 이후 착수

이 문서는 차곡의 향후 Pricing/Payment UI 요구사항을 정의한다.

현재 Local MVP에는 결제를 연결하지 않는다.

---

## 1. UX Goal

사용자가 즉시 이해해야 하는 것:

1. 책을 만들어보는 것은 무료다.
2. 결제는 PDF 완성본이 필요할 때만 한다.
3. 기준 가격은 책 1권당 ₩14,900이다.
4. 한 번 구매한 같은 책은 수정 후 재출력 때문에 다시 결제하지 않는다.
5. Duplicate/새 책은 별도 Book Pass다.

핵심 메시지:

> **먼저 만들어보고, 완성본이 필요할 때 결제하세요.**

---

## 2. Target Screens / States

| ID | Screen / State | Route / Surface | Status |
|---|---|---|---|
| P01 | Pricing | `/pricing` | TARGET |
| P02 | Export Paywall | Workspace modal/panel | TARGET |
| P03 | Checkout | `/__checkout?file=...` 후보 | TARGET |
| P04 | Payment Processing | Checkout state | TARGET |
| P05 | Payment Success | Checkout completion | TARGET |
| P06 | Payment Failure / Pending | Checkout state | TARGET |
| P07 | Already Unlocked | Workspace Export state | TARGET |
| P08 | Purchase / Entitlement Info | Account/Library/Book menu | TARGET |
| P09 | Purchase Recovery | Account/Checkout state | TARGET |
| P10 | Refunded / Revoked | Purchase state | TARGET |
| P11 | Paid Book Delete Warning | Library delete/purge | TARGET |

라우트는 구현 Phase에서 최종 확정한다.

---

## 3. P01 Pricing Page

### Hero

**제목**
> 먼저 책을 만들어보세요.

**설명**
> 원고 입력부터 디자인·표지·미리보기까지 무료입니다.  
> 완성 PDF가 필요할 때 책 1권당 ₩14,900만 결제하세요.

Primary:
- 무료로 책 만들기

Secondary:
- 내 서재

### Cards

초기 판매 카드는 2개만 노출한다.

#### Free

~~~text
Free
₩0

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

✓ 워터마크 없는 PDF
✓ 같은 책 수정 후 재출력
✓ 표지/Theme 변경 후 재출력
✓ 상업적 이용 가능

[책 만들기 시작]
~~~

Creator는 Launch 판매 카드로 노출하지 않는다.

---

## 4. Pricing Design Rules

- 4개 요금제 표 금지
- 가짜 "BEST / MOST POPULAR" 금지
- 월 환산 가격 금지
- 숨겨진 필수 비용 금지
- 가짜 상시 할인 금지
- Free를 의도적으로 불편하게 만들지 않음
- Mobile: 1열
- Desktop: 2열

가격은 서버 canonical price와 일치해야 한다.

---

## 5. P02 Export Paywall

### Trigger

Free/LOCKED 상태에서 PDF Export를 시도할 때만 노출한다.

Preview 자체는 무료 유지.

### Copy

**Title**
> 이 책을 완성할까요?

**Body**
> ₩14,900 한 번 결제하면  
> 이 책은 수정 후에도 추가 결제 없이 PDF를 다시 만들 수 있어요.

Benefits:

- 워터마크 없는 PDF
- 같은 책 재출력
- 상업적 이용 가능

Primary:
> **₩14,900 결제하고 PDF 만들기**

Secondary:
> 미리보기로 돌아가기

Text link:
> 가격 정책 보기

---

## 6. Paywall Context and Rules

가능하면 표시:

- 책 제목
- 저자
- Cover thumbnail
- 페이지 수는 안정적으로 계산되는 경우에만 참고 정보로 표시

금지:

- 페이지 수에 따라 가격이 달라지는 인상
- 뒤로 가기 시 작업 초기화
- 결제 실패 후 원고 처음부터 재시작
- 결제 버튼 연타로 중복 주문
- entitlement 확인 실패를 Free로 단정

---

## 7. P03 Checkout

### Summary

~~~text
차곡 Book Pass

[책 제목]

이 책의 PDF Export Unlock

최종 결제금액
₩14,900
~~~

포함:

- 같은 책 PDF Export
- 수정 후 재출력
- 워터마크 없음
- 상업적 이용 가능

### Required Information

Payment go-live 전 확정:

- 구매자 식별
- 결제수단
- 이메일/영수증
- 세금/증빙
- 이용약관
- 개인정보 처리
- 디지털 콘텐츠 공급/환불 고지

법률 검토 전 임의의 "환불 불가" 문구를 넣지 않는다.

### CTA

> **₩14,900 결제하기**

---

## 8. Price Drift at Checkout

Paywall에서 본 가격과 Checkout canonical price가 달라졌다면 조용히 금액을 바꾸지 않는다.

예:

> 가격이 변경되어 최종 결제금액을 다시 확인해주세요.

Requirements:

- Checkout 진입 시 server canonical price 조회
- 최종 금액 재동의
- 이전 client amount를 신뢰하지 않음

---

## 9. P04 Payment Processing

Copy:

> 결제를 확인하고 있어요.  
> 창을 닫지 마세요.

Requirements:

- CTA disabled
- 중복 요청 방지
- spinner/progress
- refresh 후 거래 상태 재조회
- client callback만으로 성공 확정 금지
- server verification 전 entitlement grant 금지

---

## 10. P05 Payment Success

**Title**
> 이 책의 PDF가 열렸어요.

**Body**
> 이제 이 책은 수정 후에도 추가 결제 없이 PDF를 다시 만들 수 있어요.

Primary:
- PDF 만들기

Secondary:
- 책으로 돌아가기

Optional:
- 구매 정보/영수증 보기

Success 이후:

1. server purchase verification
2. entitlement = ACTIVE
3. 원래 책으로 복귀
4. Export UI 갱신
5. PDF 생성

---

## 11. P06 Payment Failure / Pending

### Failure

> 결제가 완료되지 않았어요.  
> 결제수단을 확인하고 다시 시도해주세요.

Actions:

- 다시 결제
- 책으로 돌아가기

### Pending

> 결제 확인에 시간이 걸리고 있어요.  
> 잠시 후 다시 확인해주세요.

Actions:

- 결제 상태 다시 확인
- 서재로 이동

거래 상태를 확인하기 전에 실패로 단정하지 않는다.

---

## 12. PDF Generation Failure After Purchase

결제 성공과 PDF 생성 성공은 별도 상태다.

~~~text
결제는 완료됐어요.
PDF 생성 중 문제가 발생했습니다.

이 책은 이미 잠금 해제되어 있어요.
다시 생성해도 추가 결제되지 않습니다.
~~~

Primary:
- PDF 다시 만들기

Secondary:
- 책으로 돌아가기

다시 Paywall을 보여주지 않는다.

---

## 13. P07 Already Unlocked

Before:

> PDF 만들기  
> Book Pass ₩14,900

After:

> **PDF 만들기**  
> 이 책은 PDF 사용 가능

"Pro" badge는 사용하지 않는다.

---

## 14. P08 Purchase / Entitlement Info

최소 표시:

- 구매 책
- 결제일
- 최종 결제금액
- 거래/주문 식별자 일부 또는 영수증 링크
- 상태: ACTIVE / REFUNDED / REVOKED / PENDING
- PDF 사용 가능 여부

구매 기록과 책 콘텐츠 삭제는 같은 개념이 아니다.

세무/법률상 보존해야 하는 결제 기록은 콘텐츠 삭제와 분리해서 취급한다.

---

## 15. P09 Purchase Recovery

다음 상황에서 "구매 복원/결제 상태 확인"이 가능해야 한다.

- 결제 후 redirect 실패
- 브라우저 종료
- 기기 변경
- 로그인 재진입
- local state 유실

UI 예:

> 구매 내역을 확인했어요.  
> 이 책의 PDF 사용 권한을 복원했습니다.

Requirements:

- server-verified order 기준
- 같은 stable book identity 기준
- 다른 새 책으로 entitlement 이전 금지

---

## 16. P10 Refunded / Revoked

환불·결제취소·chargeback 확정 후:

~~~text
이 Book Pass는 환불/취소되어 PDF 사용 권한이 종료됐어요.
~~~

Actions:

- 구매 정보 보기
- 다시 구매 가능 여부 표시
- 문의하기

이미 사용자가 보유한 과거 PDF 파일을 원격으로 삭제하려고 하지 않는다.

서비스 내 향후 Export entitlement만 revoke한다.

---

## 17. P11 Paid Book Delete Warning

구매한 책을 휴지통으로 이동하는 일반 삭제:

> 휴지통으로 이동해도 이 책의 PDF 사용 권한은 유지됩니다.

영구 삭제:

> 이 책을 영구 삭제하면 작업물을 복구할 수 없을 수 있습니다.  
> Book Pass는 다른 새 책으로 이전되지 않습니다.

가능하면 확인 UI에:

- 책 제목
- PDF 사용 가능 상태
- 삭제 영향

을 함께 표시한다.

---

## 18. Duplicate Behavior

구매한 책을 Duplicate하면:

- Original = ACTIVE
- Duplicate = LOCKED

필요 시 안내:

> 복제본은 새 책으로 생성됩니다. PDF Export는 별도 Book Pass가 필요합니다.

복제 자체를 막지 않는다.

---

## 19. Title / Content Changes

다음 변경으로 Paywall이 다시 생기면 안 된다.

- 제목
- 부제
- 저자
- 본문
- 목차/구조
- 표지
- Theme
- 페이지 수

Entitlement는 콘텐츠 hash나 제목이 아니라 stable purchase identity에 연결한다.

---

## 20. Auth Interaction

Target:

~~~text
Guest book
  ↓
Preview
  ↓
Export Paywall
  ↓
구매 시점에 로그인/계정 확인
  ↓
Checkout
  ↓
Book Ownership + entitlement
~~~

Auth를 제작 시작 전에 강제하지 않는다.

정확한 Guest→Account migration은 Phase 15B/16에서 설계한다.

---

## 21. Account Deletion Warning

향후 계정 삭제 화면에서 유료 entitlement가 있으면 별도 경고한다.

표시 후보:

- 구매한 책 수
- 최종 PDF Export 권장
- 계정/콘텐츠 삭제 후 복구 제한
- 법적 보존이 필요한 구매 기록은 별도 보존될 수 있다는 고지

정확한 문구는 개인정보처리방침/이용약관 확정 후 반영한다.

---

## 22. Pricing Entry Points

후보:

- Landing header/footer "가격"
- Export Paywall "가격 정책 보기"
- FAQ
- Checkout

Landing Hero Primary는 계속:
> 새 책 만들기

가격 보기가 제품 시작보다 우선하지 않는다.

---

## 23. Loading / Disabled / Error

### Entitlement Unknown

네트워크 문제로 entitlement를 확인할 수 없으면:

> 구매 상태를 확인할 수 없습니다.

재확인 CTA 제공.

바로 LOCKED/Free로 간주해 Paywall을 띄우지 않는다.

### Checkout Disabled

- order 생성 중
- 결제 진행 중
- verification 중

이유가 필요한 경우 사용자에게 설명한다.

---

## 24. Accessibility

- 가격을 색만으로 구분하지 않음
- CTA에 금액 포함
- focus 상태 명확
- modal keyboard trap / ESC 정책 명확
- screen reader에서 가격과 단위를 한 문장으로 읽을 수 있어야 함
- 성공/실패는 시각 효과만으로 전달하지 않음

---

## 25. Responsive

검수:

- Mobile 390
- Tablet 768
- Desktop 1440

확인:

- Pricing 1열/2열
- 긴 혜택 copy
- ₩14,900 줄바꿈
- Checkout clipping
- modal viewport height
- mobile keyboard 시 CTA 가림
- safe area

---

## 26. Analytics

최소 이벤트:

- `pricing_view`
- `pricing_start_free_click`
- `export_paywall_view`
- `export_paywall_purchase_click`
- `checkout_view`
- `checkout_submit`
- `payment_success`
- `payment_failure`
- `payment_pending`
- `purchase_recovered`
- `entitlement_revoked`
- `paid_book_delete_warning_view`
- `pdf_export_after_purchase`
- `repeat_pdf_export`

원고 내용/책 제목 등 실제 콘텐츠는 analytics property로 보내지 않는다.

---

## 27. Security / Payment Integrity

- client만으로 결제 성공 판정 금지
- client request price만 신뢰 금지
- server canonical amount 검증
- order/payment idempotency
- callback replay protection
- entitlement grant audit trail
- refund/revoke audit trail
- stable ownership 검증
- 다른 책 entitlement 재사용 방지
- purchase recovery는 서버 기록 기준

---

## 28. Out of Scope for First Payment UI

- Creator subscription checkout
- annual billing
- team billing
- seat management
- 복잡한 coupon marketplace
- affiliate
- AI credit pack
- multiple currencies
- lifetime plan
- enterprise sales

Book Pass 하나의 결제 성공률부터 검증한다.

---

## 29. QA Acceptance

### Pricing
- Free / Book Pass 정확
- canonical ₩14,900
- Creator 판매 카드 없음

### Paywall
- Preview 무료
- LOCKED Export에서만 노출
- ACTIVE book에는 없음

### Checkout
- 올바른 책
- 올바른 canonical price
- 중복 결제 방지
- 가격 변경 시 재확인
- 취소 후 작업 상태 보존

### Success
- server verification 후 ACTIVE
- 동일 책 재결제 없음
- PDF 실패 시 entitlement 유지

### Failure / Pending
- 결제 실패와 pending 구분
- 작업 데이터 손실 없음

### Recovery
- redirect 실패/재로그인 후 구매 복원
- 다른 책으로 잘못 복원되지 않음

### Refund / Revoke
- revoke 후 향후 Export 잠금
- 구매 기록 상태 표시

### Delete
- 휴지통 복원 시 entitlement 유지
- permanent delete 경고
- entitlement transfer 없음

### Duplicate
- 원본 ACTIVE
- 복제본 LOCKED

### Responsive
- 390 / 768 / 1440 PASS

---

## 30. UI Copy Summary

### Pricing
> 먼저 책을 만들어보세요.  
> 완성 PDF가 필요할 때 책 1권당 ₩14,900만 결제하세요.

### Paywall
> 이 책을 완성할까요?  
> ₩14,900 한 번 결제하면 이 책은 수정 후에도 추가 결제 없이 PDF를 다시 만들 수 있어요.

### Checkout
> ₩14,900 결제하기

### Success
> 이 책의 PDF가 열렸어요.

### Recovery
> 이 책의 PDF 사용 권한을 복원했습니다.

### PDF Failure after Purchase
> 결제는 완료됐어요. 이 책은 이미 잠금 해제되어 있습니다.

---

## 31. Implementation Gate

실제 구현 전에 필요한 것:

1. Phase 15B Auth Runtime
2. Phase 16 Book Ownership
3. immutable service-layer book identity
4. Payment provider 결정
5. server-side payment verification
6. order / payment / entitlement ledger
7. refund/revoke lifecycle
8. 이용약관/개인정보/결제 고지
9. Asset License Audit
10. cloud/deployment architecture

현재:

~~~text
POLICY = CURRENT
UI REQUIREMENTS = TARGET DEFINED
PAYMENT IMPLEMENTATION = HOLD
~~~

---

## 32. Final Product Principle

~~~text
만들기 전에 결제시키지 않는다.
가치를 본 뒤 결제하게 한다.
한 번 산 같은 책은 다시 결제시키지 않는다.
삭제·환불·복구 같은 예외도 사용자에게 숨기지 않는다.
~~~
