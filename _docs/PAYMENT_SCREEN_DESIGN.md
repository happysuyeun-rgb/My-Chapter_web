# 차곡 Payment Screen Design

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **TARGET / SCREEN DESIGN ONLY**
- Depends on:
  - `_docs/SERVICE_POLICY.md` v1.1
  - `_docs/PRICING_POLICY.md` v1.1
  - `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md` v1.1
- Implementation: **DO NOT IMPLEMENT YET**
- Scope: P01~P11

이 문서는 Pricing / Paywall / Checkout / Purchase 상태의 **실제 화면 배치, 정보 우선순위, CTA 구조와 반응형 원칙**을 정의한다.

현재 Local MVP에는 결제를 연결하지 않는다.

---

## 1. Global Payment UI Principles

1. **결제는 제작 흐름의 마지막 단계**다.
2. 사용자는 Preview까지 무료로 확인할 수 있다.
3. 가격은 항상 **₩14,900 / 책 1권**으로 명확히 표시한다.
4. 한 번 구매한 같은 책은 수정 후 재출력 때문에 다시 결제하지 않는다.
5. 다른 책 / Duplicate는 별도 Book Pass다.
6. 결제 성공과 PDF 생성 성공은 별개 상태로 표현한다.
7. 결제 실패 때문에 작업물이 사라지면 안 된다.
8. Checkout은 책 제목/금액/혜택을 한 화면에서 재확인하게 한다.
9. “Pro”, “Premium” 같은 구독형 어휘를 Book Pass에 쓰지 않는다.
10. Payment 구현 전에는 이 문서를 UI 계약으로만 사용한다.

---

# 2. P01 Pricing

## 목적

- Free와 Book Pass 차이를 이해시킨다.
- “언제 결제하는가”를 설명한다.
- 사용자가 결제 전에 책 만들기를 시작하도록 유도한다.

## Target Route

`/pricing`

## Desktop Wireframe

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ 차곡                                         [내 서재] [새 책 만들기] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                  먼저 책을 만들어보세요.                             │
│                                                                      │
│        원고 입력부터 디자인 · 표지 · 미리보기까지 무료입니다.       │
│        완성 PDF가 필요할 때 책 1권당 ₩14,900만 결제하세요.          │
│                                                                      │
│                         [ 무료로 책 만들기 ]                         │
│                                                                      │
├───────────────────────────────┬──────────────────────────────────────┤
│ FREE                          │ BOOK PASS                            │
│ ₩0                            │ ₩14,900 / 책 1권                    │
│                               │                                      │
│ 원고 Import                   │ 워터마크 없는 PDF                    │
│ 구조 정리                     │ 같은 책 수정 후 재출력               │
│ Practical / Minimal           │ 표지/Theme 변경 후 재출력            │
│ 표지                          │ 상업적 이용 가능                     │
│ 본문 편집                     │                                      │
│ 전체 Preview                  │ [ 책 만들기 시작 ]                   │
│                               │                                      │
│ PDF 다운로드 제외            │ 한 번 산 같은 책은 추가 결제 없음    │
│ [ 무료로 시작 ]              │                                      │
└───────────────────────────────┴──────────────────────────────────────┘
│                                                                      │
│ FAQ / 가격 정책 / 이용 안내                                         │
└──────────────────────────────────────────────────────────────────────┘
~~~

## Mobile

~~~text
┌──────────────────────────────┐
│ 차곡                  [서재] │
├──────────────────────────────┤
│ 먼저 책을 만들어보세요.     │
│ Preview까지 무료             │
│ PDF 완성 ₩14,900             │
│                              │
│ [ 무료로 책 만들기 ]        │
│                              │
│ FREE                         │
│ ₩0                           │
│ ...                          │
│ [ 무료로 시작 ]             │
│                              │
│ BOOK PASS                    │
│ ₩14,900 / 책 1권            │
│ ...                          │
│ [ 책 만들기 시작 ]          │
└──────────────────────────────┘
~~~

## Rules

- Book Pass 카드가 시각적 Primary여도 Free를 의도적으로 약하게 만들지 않는다.
- Creator는 카드로 노출하지 않는다.
- “월 ₩x 환산” 금지.
- 가짜 할인/카운트다운 금지.
- 가격 정책 링크는 보조 영역.

---

# 3. P02 Export Paywall

## Surface

Workspace / Preview의 modal 또는 side panel.

## Trigger

LOCKED 상태에서 사용자가 PDF Export를 시도할 때.

## Desktop Wireframe

~~~text
┌─────────────────────────────────────────────┐
│ 이 책을 완성할까요?                   [×]  │
│                                             │
│ [표지]  내 전자책 제목                     │
│         이서아                              │
│                                             │
│ ₩14,900 한 번 결제하면                     │
│ 이 책은 수정 후에도 추가 결제 없이         │
│ PDF를 다시 만들 수 있어요.                 │
│                                             │
│ ✓ 워터마크 없는 PDF                        │
│ ✓ 같은 책 수정 후 재출력                   │
│ ✓ 상업적 이용 가능                         │
│                                             │
│ [ ₩14,900 결제하고 PDF 만들기 ]            │
│ [ 미리보기로 돌아가기 ]                    │
│                                             │
│ 가격 정책 보기                             │
└─────────────────────────────────────────────┘
~~~

## Mobile

- Full-screen sheet 허용.
- Primary CTA는 하단 sticky 가능.
- keyboard와 무관한 modal이므로 viewport safe area 확보.
- ESC는 Desktop에서 닫기, Mobile에서는 Close 버튼 명시.

## Rules

- 가격을 페이지 수 옆에 배치하지 않는다.
- 작업 중 상태를 reset하지 않는다.
- entitlement UNKNOWN이면 paywall을 띄우지 않는다.

---

# 4. P03 Checkout

## 목적

최종 결제금액과 구매 대상을 재확인한다.

## Wireframe

~~~text
┌───────────────────────────────────────────────────────────┐
│ ← 돌아가기                   차곡 Book Pass               │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ 주문 내용                                                  │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [표지]  내 전자책 제목                               │ │
│ │         이 책의 PDF Export Unlock                    │ │
│ │                                                       │ │
│ │ 워터마크 없는 PDF                                    │ │
│ │ 같은 책 수정 후 재출력                               │ │
│ │ 상업적 이용 가능                                     │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ 결제수단                                                  │
│ [ Payment Provider UI 영역 ]                             │
│                                                           │
│ 약관/개인정보/디지털콘텐츠 고지                           │
│ [ ] 필요한 동의                                          │
│                                                           │
│ 최종 결제금액                              ₩14,900         │
│                                                           │
│ [                ₩14,900 결제하기                 ]       │
│                                                           │
│ 결제가 완료되면 이 책의 PDF Export가 잠금 해제됩니다.   │
└───────────────────────────────────────────────────────────┘
~~~

## Rules

- client에서 전달받은 가격을 그대로 표시하지 않는다.
- Checkout 진입 시 canonical price를 확인한다.
- 가격 변경 시 재동의 상태로 전환한다.
- 주문 대상 책을 항상 식별 가능하게 표시한다.

---

# 5. P04 Payment Processing

## Wireframe

~~~text
┌──────────────────────────────────────┐
│                                      │
│              ◌                       │
│       결제를 확인하고 있어요.        │
│       창을 닫지 마세요.              │
│                                      │
│       주문번호: ••••1234             │
│                                      │
└──────────────────────────────────────┘
~~~

## Rules

- Payment CTA disabled.
- 중복 submit 금지.
- refresh 후 상태 재조회 가능한 구조.
- 10초 이상 걸리면 “결제 상태 다시 확인” 안내 후보.
- client callback만으로 success UI를 확정하지 않는다.

---

# 6. P05 Payment Success

## Wireframe

~~~text
┌──────────────────────────────────────────────┐
│                  ✓                           │
│                                              │
│          이 책의 PDF가 열렸어요.             │
│                                              │
│ 이제 이 책은 수정 후에도 추가 결제 없이     │
│ PDF를 다시 만들 수 있어요.                  │
│                                              │
│ [              PDF 만들기              ]    │
│ [              책으로 돌아가기          ]    │
│                                              │
│ 구매 정보 / 영수증                          │
└──────────────────────────────────────────────┘
~~~

## Rules

- Success = payment verified + entitlement ACTIVE.
- 바로 PDF 생성으로 이어질 수 있음.
- PDF 생성이 실패해도 entitlement는 유지.

---

# 7. P06 Payment Failure / Pending

## Failure

~~~text
┌──────────────────────────────────────┐
│              !                       │
│      결제가 완료되지 않았어요.       │
│                                      │
│ 결제수단을 확인하고 다시 시도해주세요.│
│                                      │
│ [ 다시 결제 ]                       │
│ [ 책으로 돌아가기 ]                 │
└──────────────────────────────────────┘
~~~

## Pending

~~~text
┌──────────────────────────────────────┐
│              ◌                       │
│   결제 확인에 시간이 걸리고 있어요.  │
│                                      │
│ [ 결제 상태 다시 확인 ]             │
│ [ 서재로 이동 ]                     │
└──────────────────────────────────────┘
~~~

## Rules

- failure와 pending을 혼합하지 않는다.
- 원본 작업물은 유지.
- 문의 경로는 실제 CS 채널 확정 후 추가.

---

# 8. PDF Generation Failure After Purchase

이 상태는 Payment Failure와 별도다.

~~~text
┌──────────────────────────────────────────┐
│ 결제는 완료됐어요.                      │
│                                          │
│ PDF 생성 중 문제가 발생했습니다.        │
│ 이 책은 이미 잠금 해제되어 있어요.      │
│ 다시 생성해도 추가 결제되지 않습니다.   │
│                                          │
│ [ PDF 다시 만들기 ]                     │
│ [ 책으로 돌아가기 ]                     │
└──────────────────────────────────────────┘
~~~

다시 Paywall을 보여주지 않는다.

---

# 9. P07 Already Unlocked

Workspace Export 영역:

~~~text
┌──────────────────────────────────────┐
│ PDF                                 │
│                                      │
│ 이 책은 PDF 사용 가능               │
│ Book Pass 구매 완료                  │
│                                      │
│ [ PDF 만들기 ]                      │
└──────────────────────────────────────┘
~~~

- “Pro” badge 금지.
- 결제 금액을 매번 다시 강조하지 않아도 됨.

---

# 10. P08 Purchase / Entitlement Info

## Wireframe

~~~text
┌──────────────────────────────────────────────┐
│ 구매 정보                                   │
│                                              │
│ 책             내 전자책 제목               │
│ 상태           PDF 사용 가능                │
│ 결제일         2026.10.16                   │
│ 결제금액       ₩14,900                       │
│ 주문번호       ••••1234                     │
│                                              │
│ [ 영수증 보기 ]                              │
│ [ 닫기 ]                                     │
└──────────────────────────────────────────────┘
~~~

상태 표현:

- ACTIVE → PDF 사용 가능
- PENDING → 확인 중
- REFUNDED → 환불됨
- REVOKED → 사용 권한 종료

---

# 11. P09 Purchase Recovery

~~~text
┌──────────────────────────────────────────────┐
│ 구매 내역을 확인했어요.                     │
│                                              │
│ 이 책의 PDF 사용 권한을 복원했습니다.       │
│                                              │
│ [ PDF 만들기 ]                              │
│ [ 책으로 돌아가기 ]                         │
└──────────────────────────────────────────────┘
~~~

다른 책으로 권리를 이동한 것처럼 보이면 안 된다.

---

# 12. P10 Refunded / Revoked

~~~text
┌──────────────────────────────────────────────┐
│ 이 Book Pass는 환불/취소되었습니다.          │
│                                              │
│ 이 책의 향후 PDF Export는 잠겨 있습니다.    │
│ 이미 사용자가 저장한 기존 PDF 파일은        │
│ 차곡이 원격 삭제하지 않습니다.              │
│                                              │
│ [ 구매 정보 보기 ]                          │
│ [ 다시 구매 ]                               │
└──────────────────────────────────────────────┘
~~~

---

# 13. P11 Paid Book Delete Warning

## Trash

~~~text
┌──────────────────────────────────────────────┐
│ 이 책을 휴지통으로 이동할까요?              │
│                                              │
│ 휴지통에서 복원하면 PDF 사용 권한도         │
│ 그대로 유지됩니다.                          │
│                                              │
│ [ 휴지통으로 이동 ] [ 취소 ]                │
└──────────────────────────────────────────────┘
~~~

## Permanent Delete

~~~text
┌──────────────────────────────────────────────┐
│ 이 책을 영구 삭제할까요?                    │
│                                              │
│ 작업물을 복구할 수 없을 수 있습니다.        │
│ Book Pass는 다른 새 책으로 이전되지 않습니다.│
│                                              │
│ 내 전자책 제목                              │
│ PDF 사용 가능                               │
│                                              │
│ [ 영구 삭제 ] [ 취소 ]                      │
└──────────────────────────────────────────────┘
~~~

---

# 14. Responsive Rules

## Desktop ≥ 1024

- Pricing: 2열 카드.
- Checkout: max-width 720~840 영역 권장.
- Paywall: modal 520~620.
- Purchase Info: modal 480~560.

## Tablet 768~1023

- Pricing: 2열 유지 가능, 좁으면 1열.
- Checkout: full content width + safe margin.
- modal은 max-width 90vw.

## Mobile < 768

- Pricing: 1열.
- Checkout: 1열.
- Summary → payment method → legal → total → CTA 순서.
- Primary CTA는 필요 시 bottom sticky.
- modal은 full-screen sheet 허용.
- 가격 줄바꿈 금지.
- safe-area 대응.

---

# 15. Accessibility

- 가격을 색만으로 구분하지 않는다.
- Primary CTA에 금액 포함.
- modal focus trap.
- ESC/Close 동작 명확.
- Payment 상태는 icon만으로 전달하지 않는다.
- screen reader에서 `₩14,900, 책 1권`으로 읽히도록 label 검토.
- disabled CTA에는 필요 시 이유 제공.

---

# 16. Visual Hierarchy

우선순위:

~~~text
책 제목 / 구매 대상
→ 최종 금액
→ 핵심 혜택
→ Primary CTA
→ Secondary CTA
→ 정책/FAQ
~~~

금지:

- 가격보다 쿠폰을 더 크게 노출
- 과도한 trust badge
- 공포성 카피
- 가짜 urgency
- 숨겨진 자동 구독 인상

---

# 17. Navigation Flow

~~~text
Landing
  └─ Pricing

Workspace Preview
  └─ PDF Export
      ├─ ACTIVE → PDF 생성
      └─ LOCKED → P02 Paywall
                   └─ P03 Checkout
                       ├─ P04 Processing
                       ├─ P05 Success → PDF
                       └─ P06 Failure/Pending

Account/Library
  ├─ P08 Purchase Info
  ├─ P09 Purchase Recovery
  └─ P11 Paid Delete Warning
~~~

---

# 18. DO NOT IMPLEMENT YET

이 문서로 다음을 시작하지 않는다.

- Payment Provider SDK
- DB table
- order ledger
- entitlement DB
- Supabase Auth Runtime
- RLS
- Cloud book ownership
- coupon engine

먼저 Phase 15B / 16 / Payment technical spec가 필요하다.

---

# 19. Design Completion Criteria

이 Screen Design이 완료된 것으로 보는 기준:

- P01~P11 배치 정의
- desktop/mobile 구조 정의
- Free vs Book Pass 계층 명확
- Paywall/Checkout/Success/Failure/Recovery/Delete 흐름 정의
- entitlement 예외 상태가 UI에 반영
- Payment 구현과 분리
