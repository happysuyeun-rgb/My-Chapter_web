# 차곡 Pricing Policy

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **CURRENT / Pricing Baseline**
- Depends on: `_docs/SERVICE_POLICY.md`
- Implementation status: **POLICY ONLY — Payment is not implemented**
- Note: 세금·환불·전자상거래 고지 문구는 실제 결제 오픈 전에 결제대행사/사업자 상태 및 관련 법률 검토가 필요하다.

이 문서는 차곡의 **초기 과금 구조, 무료/유료 경계, Book Pass 권리, 향후 구독 확장 조건**을 정의한다.

핵심 원칙:

> **책을 만들어보는 과정은 무료. 완성 PDF를 가져가는 순간 결제한다.**

---

## 1. Pricing Strategy

차곡 초기 과금은 복잡한 다단계 구독제가 아니라 다음 2단계로 시작한다.

| Plan | Price | Role |
|---|---:|---|
| **Free** | ₩0 | 원고를 넣고 책을 완성해보는 체험 |
| **Book Pass** | **₩14,900 / 책 1권** | 해당 책의 완성 PDF Export 영구 Unlock |

향후 반복 사용 수요가 검증된 뒤에만 구독제를 추가한다.

| Future Plan | Candidate Price | Status |
|---|---:|---|
| **Creator** | **₩24,900 / 월 후보** | LATER / NOT FOR LAUNCH |

Creator 가격은 현재 판매 가격이 아니라 향후 검증용 기준값이다.

---

## 2. Why One-Time Book Pass First

차곡의 핵심 Job은 "매일 쓰는 협업툴"이 아니라 **한 권의 책을 완성하는 것**이다.

초기 사용자는 다음 행동을 할 가능성이 높다.

1. 원고를 준비한다.
2. 며칠 또는 몇 주 동안 한 권을 만든다.
3. PDF를 완성한다.
4. 일정 기간 다시 사용하지 않을 수 있다.

따라서 초기부터 월 구독을 강제하면 구매 이유보다 구독 부담이 먼저 보일 수 있다.

초기 상품은 사용자 가치 단위와 과금 단위를 맞춘다.

~~~text
가치 단위 = 한 권의 완성된 책
과금 단위 = 한 권의 PDF Export Unlock
~~~

---

## 3. Free Policy

Free 사용자는 결제 전에 핵심 제작 경험을 충분히 확인할 수 있어야 한다.

### Free에 포함

- Landing / Library
- 원고 붙여넣기
- TXT / MD / PDF / DOCX Import
- 메타데이터 입력
- 구조 확인/수정
- Practical / Minimal Theme
- 표지 이미지 적용
- 본문 편집
- Autosave / Recovery
- Single / Spread / Grid Preview
- 책 완성 상태까지 작업

### Free에서 제한

- **완성 PDF 다운로드/Export는 잠금**
- 유료 entitlement가 필요한 고급 기능은 향후 별도 정의

Free의 목적은 기능을 일부러 망가뜨린 체험판이 아니라 **구매 전 결과 품질을 충분히 판단할 수 있는 체험**이다.

---

## 4. Book Pass Policy

### 4.1 Price

~~~text
₩14,900 / 책 1권
~~~

사용자 UI에서는 가능한 한 **최종 결제금액을 명확하게 한 숫자로 표시**한다.

세금/영수증/현금영수증/사업자 증빙 방식은 실제 결제 도입 시 결제수단 및 사업자 상태에 맞춰 별도 확정한다.

### 4.2 Entitlement

Book Pass를 구매하면 **해당 책 프로젝트의 PDF Export가 영구 Unlock**된다.

포함:

- 완성 PDF Export
- 같은 책의 PDF 재생성
- 같은 책의 PDF 재다운로드
- 제목/부제/저자 수정 후 재출력
- 본문 수정 후 재출력
- 표지 교체 후 재출력
- Practical ↔ Minimal 변경 후 재출력
- 워터마크 없는 결과물
- 개인/상업적 사용

추가 결제하지 않는다.

### 4.3 What Is One Book

가격 기준에서 "한 권"은 페이지 수가 아니라 **하나의 책 프로젝트**다.

다음 변경은 같은 책으로 본다.

- 제목 수정
- 오탈자 수정
- 본문 일부 추가/삭제
- 디자인 Theme 변경
- 표지 변경
- PDF 재생성

다음은 새 책으로 본다.

- 새 프로젝트 생성
- 기존 책을 복제해 별도 책으로 운영
- 독립적인 다른 원고/출판물로 분리

즉:

~~~text
한 번 결제한 프로젝트 = 계속 Unlock
복제된 새 프로젝트 = 별도 Book Pass
~~~

### 4.4 Title Does Not Define Entitlement

책 제목이 바뀌어도 entitlement는 유지되어야 한다.

향후 결제 구현에서는 제목 문자열이 아니라 **변하지 않는 구매/책 식별자**에 entitlement를 연결한다.

현재 Core Engine의 Content SoT 및 `file` identity 계약을 가격정책 때문에 변경하지 않는다.

Commerce entitlement ID는 서비스 계층에서 별도로 설계한다.

---

## 5. PDF Export Paywall

초기 결제벽 위치:

~~~text
원고
→ 구조
→ 디자인
→ 표지
→ Preview
→ [ PDF Export ]
        ↓
      Paywall
~~~

사용자는 결제 전 다음을 확인할 수 있어야 한다.

- 자신의 원고가 정상 반영되었는지
- 구조가 맞는지
- Theme이 마음에 드는지
- 표지가 정상인지
- 페이지가 깨지지 않는지
- 실제 책처럼 보이는지

결제는 **가치를 확인한 뒤 완성물을 소유하려는 시점**에 요청한다.

---

## 6. Watermark Policy

초기 정책:

- Free PDF Export 자체를 제공하지 않는다.
- 따라서 "무료 워터마크 PDF" 상품도 제공하지 않는다.
- Preview 화면은 평가를 위한 정상 품질로 제공한다.
- Book Pass PDF는 워터마크가 없다.

사용자가 구매 전에 일부러 훼손된 결과물을 경험하게 만들지 않는다.

---

## 7. Page Count Policy

가격은 페이지 수에 따라 달라지지 않는다.

~~~text
30p = ₩14,900
80p = ₩14,900
150p = ₩14,900
~~~

단, 이는 **서비스가 지원하는 기술적 한도 안에서** 적용한다.

결제 기능을 실제 오픈하기 전 아래 운영 한도는 반드시 별도 벤치마크 후 확정한다.

- 최대 원고 파일 크기
- 최대 PDF 입력 크기
- 최대 책 페이지 수 또는 권장 페이지 수
- PDF 생성 timeout
- 이미지 총 용량

이 수치는 가격 차등을 위한 것이 아니라 안정적인 서비스 제공을 위한 기술 제한이다.

현재 검증되지 않은 최대치를 마케팅 문구로 약속하지 않는다.

---

## 8. Commercial Use

Book Pass로 Export한 PDF는 차곡 자체 기준으로:

- 개인 사용 가능
- 고객 납품 가능
- 전자책 판매 가능
- 강의/교육 자료 가능
- 사내 문서 가능
- 포트폴리오 가능

차곡은 별도의 상업용 라이선스 업셀을 두지 않는다.

다만 사용자 원고·이미지·폰트·인용물 등 제3자 콘텐츠 권리는 `SERVICE_POLICY.md`의 사용자 책임 원칙을 따른다.

---

## 9. Creator Subscription — Later

Creator는 초기 출시 상품이 아니다.

후보:

~~~text
Creator — ₩24,900 / month
~~~

Creator를 실제 출시하려면 아래 조건 중 최소 하나 이상이 사용자 행동으로 검증되어야 한다.

- 유료 사용자가 반복적으로 2권 이상 제작
- 여러 책을 지속 관리할 필요가 확인됨
- Cloud Library가 반복 사용의 핵심 가치가 됨
- 추가 Theme/Template의 지속 이용 수요가 확인됨
- AI 기능을 매월 반복 사용
- 월 사용량이 Book Pass보다 구독에 적합한 세그먼트가 확인됨

향후 Creator 후보 혜택:

- 여러 권의 PDF Export
- Cloud Library
- 추가 Theme/Template
- AI credit
- 고급 관리 기능

정확한 혜택과 fair-use 제한은 출시 시 다시 확정한다.

---

## 10. No Lifetime Plan at Launch

초기에는 Lifetime / 평생 이용권을 판매하지 않는다.

이유:

- 향후 Cloud 비용 발생 가능
- PDF worker 비용 발생 가능
- AI inference 비용 발생 가능
- Storage/egress 비용 발생 가능
- 제품 기능 범위가 아직 확장 중

장기 비용 구조가 검증되기 전 영구 무제한 권리를 선판매하지 않는다.

---

## 11. Refund / Failure Principle

현재 결제는 구현되지 않았으므로 아래는 **제품 정책 방향**이다.

### Technical Failure

결제했으나 차곡의 기술적 문제로 정상 PDF Export를 제공하지 못한 경우:

1. 재시도/복구
2. 동일 entitlement 유지
3. 해결되지 않을 경우 환불 또는 결제 취소 처리 대상

### Duplicate Charge

중복 결제가 발생하면 중복분은 정상화/환불 대상이다.

### Change of Mind

디지털 결과물 제공 이후의 단순 변심 환불 기준은 실제 결제 오픈 전에:

- 국내 전자상거래 관련 의무
- 디지털 콘텐츠 철회/공급 개시 고지
- 결제대행사 정책

을 검토하여 이용약관 및 Checkout UI에 확정한다.

법률 검토 전 "환불 불가"를 단정 문구로 사용하지 않는다.

---

## 12. Promotions

초기에는 복잡한 상시 할인을 만들지 않는다.

허용 후보:

- Launch coupon
- 사용자 테스트용 100% coupon
- CS 복구용 coupon
- 특정 캠페인 단기 할인

금지 권장:

- 가짜 상시 정가/할인가
- 매일 반복되는 카운트다운
- 숨겨진 수수료
- Checkout에서 갑자기 추가되는 필수 비용

가격 신뢰를 제품 경험의 일부로 본다.

---

## 13. Pricing UI Copy Baseline

대표 카피:

### Free

> 무료로 책을 만들어보세요.  
> 원고 입력부터 디자인·표지·미리보기까지 무료

### Book Pass

> 책 1권 완성 — ₩14,900  
> 완성 PDF 다운로드 · 같은 책 재출력 · 워터마크 없음 · 상업적 이용 가능

### Export Paywall

> 이 책을 완성할까요?  
> ₩14,900 한 번 결제하면 이 책의 PDF를 계속 다시 만들 수 있어요.

과도한 "PRO", "PREMIUM", "무제한" 표현은 실제 entitlement가 확정되기 전 사용하지 않는다.

---

## 14. Current / Later

| Item | Policy |
|---|---|
| Free | **CURRENT PRICING DECISION** |
| Book Pass ₩14,900 | **CURRENT PRICING DECISION / NOT IMPLEMENTED** |
| PDF Export paywall | **TARGET** |
| Same-book re-export | **INCLUDED** |
| Commercial use | **INCLUDED** |
| Watermarked free PDF | **NO** |
| Page-based surcharge | **NO** |
| Creator ₩24,900/month | **LATER CANDIDATE** |
| Lifetime | **NO AT LAUNCH** |
| AI credit pricing | **LATER** |
| Payment provider | **TBD** |
| Tax/receipt/legal checkout copy | **PRE-LAUNCH GATE** |

---

## 15. Metrics That Can Change Pricing

가격은 기분으로 바꾸지 않는다.

출시 후 아래 데이터를 본다.

- Preview → Paywall 도달률
- Paywall → Purchase 전환율
- 구매 후 PDF 성공률
- Book Pass 구매자의 2번째 책 생성률
- 30/60/90일 반복 사용
- 환불/실패율
- 평균 책 페이지/파일 크기
- PDF worker 원가
- AI 원가
- 고객 문의에서 가격 거부 사유

Creator 구독은 반복 제작 수요가 실제 데이터로 확인될 때만 활성화한다.

---

## 16. Locked Decisions v1.0

1. 초기 가격 구조는 **Free + Book Pass**다.
2. Book Pass 가격은 **₩14,900 / 책 1권**이다.
3. 결제벽은 **PDF Export 직전**이다.
4. Preview까지는 무료다.
5. 무료 워터마크 PDF는 제공하지 않는다.
6. 구매한 같은 책은 PDF를 반복 재생성/재다운로드할 수 있다.
7. 제목/본문/표지/Theme 수정은 재결제 사유가 아니다.
8. 복제된 새 책/새 프로젝트는 별도 Book Pass다.
9. 페이지 수에 따른 가격 차등은 없다.
10. 차곡 자체는 유료 PDF의 상업적 이용을 제한하지 않는다.
11. Creator는 **₩24,900/month 후보**지만 Launch 상품이 아니다.
12. Lifetime plan은 초기 판매하지 않는다.
13. Payment provider와 법적 Checkout 고지는 실제 결제 오픈 전에 확정한다.

---

## Next

다음 문서:

`_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md`

이 문서에서 정의할 것:

- Pricing 화면
- Export Paywall
- Checkout
- Payment Success / Failure
- Already Unlocked state
- Purchase history / entitlement 표시
- Free vs Book Pass UI hierarchy
