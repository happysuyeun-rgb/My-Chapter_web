# 차곡 Pricing Policy

- Product: 차곡 (Chagok)
- Version: **v1.1**
- Date: 2026-10-16
- Status: **CURRENT / Pricing Baseline**
- Depends on: `_docs/SERVICE_POLICY.md`
- Implementation status: **POLICY ONLY — Payment is not implemented**
- Note: 세금·환불·전자상거래 고지 문구는 실제 결제 오픈 전에 결제대행사/사업자 상태 및 관련 법률 검토가 필요하다.

이 문서는 차곡의 **초기 과금 구조, 무료/유료 경계, Book Pass entitlement, 가격 변경·환불·삭제·복구 원칙, 향후 구독 확장 조건**을 정의한다.

핵심 원칙:

> **책을 만들어보는 과정은 무료. 완성 PDF를 가져가는 순간 결제한다.**

---

## 1. Pricing Strategy

초기 과금은 다음 2단계로 시작한다.

| Plan | Price | Role |
|---|---:|---|
| **Free** | ₩0 | 원고를 넣고 책을 완성해보는 체험 |
| **Book Pass** | **₩14,900 / 책 1권** | 해당 책 프로젝트의 PDF Export 지속 Unlock |

Book Pass는 구독이 아니다.

한 번 구매한 **같은 책 프로젝트**에 대해 제목·본문·표지·Theme을 수정한 뒤 PDF를 다시 만드는 데 추가 Book Pass를 요구하지 않는다.

향후 반복 사용 수요가 검증된 뒤에만 구독제를 추가한다.

| Future Plan | Candidate Price | Status |
|---|---:|---|
| **Creator** | **₩24,900 / 월 후보** | LATER / NOT FOR LAUNCH |

Creator 가격은 현재 판매 가격이 아니라 향후 검증용 기준값이다.

---

## 2. Why One-Time Book Pass First

차곡의 핵심 Job은 매일 쓰는 협업툴이 아니라 **한 권의 책을 완성하는 것**이다.

초기 상품은 사용자 가치 단위와 과금 단위를 맞춘다.

~~~text
가치 단위 = 한 권의 완성된 책
과금 단위 = 한 권의 PDF Export Unlock
~~~

초기부터 월 구독을 강제하지 않는다.

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
- 향후 별도 entitlement가 필요한 기능은 별도 정책으로 추가

현재 Local MVP에서는 결제/사용량 제한을 강제하지 않는다.

향후 SaaS Free에서 다음 수치는 **Payment go-live 전 확정**한다.

- 활성 Draft 책 수
- 저장 용량
- 파일 크기
- 장기 보존 여부

검증되지 않은 숫자를 지금 임의로 넣지 않는다.

---

## 4. Book Pass Policy

### 4.1 Launch Price

~~~text
₩14,900 / 책 1권
~~~

초기 출시 기준 가격은 ₩14,900이다.

실제 Payment go-live 전에 세금/결제대행사/원가 검토로 가격이 바뀌는 경우 반드시 Pricing Policy 버전을 갱신한다.

### 4.2 Entitlement Definition

Book Pass를 구매하면 **해당 책 프로젝트에 대한 PDF Export entitlement**가 활성화된다.

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

정상적으로 entitlement가 유지되는 동안 추가 결제하지 않는다.

### 4.3 "영구 Unlock" 표현 기준

내부 정책에서는 Book Pass를 **지속적 entitlement**로 정의한다.

마케팅에서 "영구 Unlock"을 사용할 경우 다음 의미를 넘어서지 않는다.

> 같은 책 프로젝트를 계속 보유하고 서비스/계정을 정상 이용할 수 있는 동안, 재출력 때문에 다시 결제하지 않는다.

다음을 보장하는 표현으로 사용하지 않는다.

- 서비스가 무기한 존속함
- 삭제한 계정/책이 영구 복구됨
- 환불/chargeback 후에도 권리가 유지됨
- entitlement를 다른 책이나 다른 계정으로 옮길 수 있음

---

## 5. What Is One Book

가격 기준에서 "한 권"은 페이지 수가 아니라 **하나의 책 프로젝트**다.

같은 책으로 보는 변경:

- 제목/부제/저자 수정
- 오탈자 수정
- 본문 추가/삭제
- 목차/구조 수정
- Theme 변경
- 표지 변경
- 페이지 수 변화
- PDF 재생성

새 책으로 보는 경우:

- 새 프로젝트 생성
- 기존 책 Duplicate
- 독립적인 다른 출판물로 분리

~~~text
구매한 원본 프로젝트 = Unlock 유지
Duplicate / 새 프로젝트 = 별도 Book Pass
~~~

---

## 6. Stable Commerce Identity

제목 문자열이나 현재 파일 경로만으로 entitlement를 판단하지 않는다.

현재 Core Engine identity:

~~~text
file = workspace relative path
~~~

향후 Payment/Ownership 서비스 계층에서는 별도의 **immutable stable book identity**와 entitlement record가 필요하다.

후보 개념:

- `book_id` — 서비스 계층의 불변 책 식별자
- `entitlement_id` — 구매 권리 식별자
- `order_id` — 결제 거래 식별자

정확한 schema는 Phase 16 / Payment implementation에서 확정한다.

Core Engine의 `file` identity와 `book.html` SoT를 가격정책 때문에 변경하지 않는다.

---

## 7. Entitlement Lifecycle

### 7.1 Active

결제 검증 성공 후 entitlement = ACTIVE.

ACTIVE 책은 Export Paywall을 다시 보지 않는다.

### 7.2 Trash / Restore

구매한 책을 휴지통으로 이동해도 entitlement는 같은 stable book identity에 유지한다.

같은 책이 복원되면 Unlock도 복원한다.

### 7.3 Permanent Delete

유료 책을 영구 삭제하기 전 다음을 명확히 경고한다.

- 책 콘텐츠가 복구 불가능할 수 있음
- Book Pass는 다른 새 책으로 이전되지 않음
- 구매 기록이 남더라도 삭제한 책 콘텐츠를 재생성할 수 없을 수 있음

복구 가능한 보존 기간이 존재하는 경우 같은 stable book identity를 복원했을 때 entitlement도 복원한다.

복구 불가능한 삭제 이후 entitlement를 새 프로젝트 credit으로 자동 전환하지 않는다.

### 7.4 Duplicate

구매한 책의 Duplicate는 새로운 책 프로젝트다.

- 원본: ACTIVE 유지
- 복제본: LOCKED
- 복제 행위 자체는 무료일 수 있으나 PDF Export는 별도 Book Pass 필요

### 7.5 Account Deletion

향후 계정 기반 서비스에서 계정 삭제 전:

- 보유 Book Pass
- 구매 기록
- 책 데이터 삭제 영향
- 최종 PDF Export 기회

를 고지한다.

보존 기간 종료 후 삭제된 계정/콘텐츠/entitlement의 복구를 보장하지 않는다.

### 7.6 Refund / Cancellation / Chargeback

정상적으로 환불·결제취소·chargeback이 확정되면 해당 거래로 생성된 entitlement는 REVOKED 처리하는 것을 기본으로 한다.

예외:

- 운영자 보상
- 기술 장애 보상
- 중복 결제 정리

는 별도 audit trail을 남기고 처리한다.

### 7.7 Service Discontinuation

Book Pass는 서비스 무기한 존속 보장이 아니다.

향후 SaaS 종료 시 가능한 범위에서 사전 고지와 PDF Export/데이터 이전 기회를 제공한다.

---

## 8. Transfer Policy

Book Pass는 기본적으로 다음 간 이전이 불가하다.

- 책 A → 책 B
- 원본 → Duplicate
- 사용자 A → 사용자 B
- 삭제한 책 → 새 책

기술적 오류 또는 운영자 보상으로 이동이 필요한 경우 일반 기능이 아니라 **support remediation**으로 처리하고 기록을 남긴다.

---

## 9. PDF Export Paywall

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

사용자는 결제 전 자신의 실제 책 결과를 충분히 확인할 수 있어야 한다.

결제는 **가치를 확인한 뒤 완성물을 가져가려는 시점**에 요청한다.

---

## 10. Watermark Policy

- Free PDF Export 자체를 제공하지 않는다.
- 무료 워터마크 PDF 상품도 제공하지 않는다.
- Preview는 정상 품질로 제공한다.
- Book Pass PDF는 워터마크가 없다.

---

## 11. Page Count and Technical Limits

가격은 페이지 수에 따라 달라지지 않는다.

~~~text
30p = ₩14,900
80p = ₩14,900
150p = ₩14,900
~~~

단, 서비스가 지원하는 기술 한도 안에서 적용한다.

Payment go-live 전에 별도 벤치마크 후 확정:

- 최대 원고 파일 크기
- 최대 PDF 입력 크기
- 최대 또는 권장 페이지 수
- PDF 생성 timeout
- 이미지 총 용량

이 수치는 가격 차등이 아니라 안정적인 서비스 제공을 위한 기술 제한이다.

---

## 12. Commercial Use

Book Pass로 Export한 PDF는 차곡 자체 기준으로:

- 개인 사용 가능
- 고객 납품 가능
- 전자책 판매 가능
- 강의/교육 자료 가능
- 사내 문서 가능
- 포트폴리오 가능

차곡은 별도의 상업용 라이선스 업셀을 두지 않는다.

사용자가 직접 추가한 콘텐츠와 차곡 기본 제공 Asset의 권리 구분은 `SERVICE_POLICY.md`를 따른다.

---

## 13. Price Display, Tax and Receipts

사용자 UI에서는 **실제 결제 직전에 최종 결제금액을 명확한 한 숫자로 표시**한다.

현재 기준 가격:

~~~text
₩14,900
~~~

실제 Payment go-live 전 확정:

- 부가세 포함/표시 방식
- 영수증
- 현금영수증
- 사업자 증빙
- 결제수단별 고지
- PG 수수료 처리

사용자가 Checkout에서 예상하지 못한 필수 비용을 추가하지 않는다.

법률/세무 검토 전 세금 처리를 단정하지 않는다.

---

## 14. Price Change Policy

향후 신규 구매 가격은 변경할 수 있다.

원칙:

- 이미 구매한 Book Pass entitlement는 가격 변경 때문에 소멸하지 않는다.
- 기존 구매자에게 새 가격과의 차액을 추가 청구하지 않는다.
- 신규 가격은 변경 시점 이후 신규 구매에 적용한다.
- 단기 할인/쿠폰 종료 후 과거 할인 차액을 소급 청구하지 않는다.
- 이후 더 낮은 가격이 나왔다고 과거 정상 구매분 차액을 자동 환불하지 않는다.

실제 가격 변경 시 Pricing Policy 버전을 갱신하고 UI의 canonical price를 함께 변경한다.

---

## 15. Purchase Recovery

향후 계정 기반 서비스에서는 구매 내역을 서버의 검증된 거래 기록으로 복구할 수 있어야 한다.

사용자 시나리오:

- 브라우저 종료
- 기기 변경
- 결제 직후 redirect 실패
- 로그인 재시도

이 경우 client local state가 아니라 **server-verified order + entitlement**를 기준으로 구매 상태를 복원한다.

"구매 복원"은 다른 책으로 entitlement를 옮기는 기능이 아니다.

---

## 16. Refund / Failure Principle

### Technical Failure

결제했으나 차곡의 기술적 문제로 정상 PDF Export를 제공하지 못한 경우:

1. 재시도/복구
2. 동일 entitlement 유지
3. 해결되지 않을 경우 환불 또는 결제 취소 검토

### Duplicate Charge

중복 결제가 확인되면 중복분 정상화/환불 대상이다.

### Change of Mind

디지털 결과물 제공 이후의 단순 변심 환불 기준은 실제 결제 오픈 전에:

- 국내 전자상거래 관련 의무
- 디지털 콘텐츠 철회/공급 개시 고지
- 결제대행사 정책

을 검토하여 이용약관 및 Checkout UI에 확정한다.

법률 검토 전 "환불 불가"를 단정 문구로 사용하지 않는다.

---

## 17. Promotions

허용 후보:

- Launch coupon
- 사용자 테스트용 coupon
- CS 복구용 coupon
- 특정 캠페인 단기 할인

금지 권장:

- 가짜 상시 정가/할인가
- 매일 반복되는 카운트다운
- 숨겨진 수수료
- Checkout에서 갑자기 추가되는 필수 비용

---

## 18. Creator Subscription — Later

Creator는 초기 출시 상품이 아니다.

후보:

~~~text
Creator — ₩24,900 / month
~~~

실제 출시 조건:

- 유료 사용자의 반복 2권 이상 제작
- 여러 책 지속 관리 필요
- Cloud Library 반복 가치
- 추가 Theme/Template 수요
- AI 월 반복 사용
- Book Pass보다 구독이 적합한 사용자군 확인

정확한 혜택과 fair-use 제한은 출시 시 다시 확정한다.

---

## 19. No Lifetime Plan at Launch

초기에는 Lifetime / 평생 이용권을 판매하지 않는다.

이유:

- Cloud 비용
- PDF worker 비용
- AI inference 비용
- Storage/egress 비용
- 아직 확장 중인 제품 범위

Book Pass의 "같은 책 재출력 추가 결제 없음"과 Lifetime SaaS 이용권은 다른 개념이다.

---

## 20. Pricing UI Copy Baseline

### Free

> 무료로 책을 만들어보세요.  
> 원고 입력부터 디자인·표지·미리보기까지 무료

### Book Pass

> 책 1권 완성 — ₩14,900  
> 완성 PDF 다운로드 · 같은 책 재출력 · 워터마크 없음 · 상업적 이용 가능

### Export Paywall

> 이 책을 완성할까요?  
> ₩14,900 한 번 결제하면 이 책은 수정 후에도 추가 결제 없이 PDF를 다시 만들 수 있어요.

"영구"보다 실제 entitlement 범위를 설명하는 문구를 우선한다.

---

## 21. Current / Later

| Item | Policy |
|---|---|
| Free | **CURRENT PRICING DECISION** |
| Book Pass ₩14,900 | **CURRENT PRICING DECISION / NOT IMPLEMENTED** |
| PDF Export paywall | **TARGET** |
| Same-book re-export | **INCLUDED** |
| Commercial use | **INCLUDED** |
| Watermarked free PDF | **NO** |
| Page-based surcharge | **NO** |
| Entitlement transfer | **NO BY DEFAULT** |
| Purchase recovery | **TARGET** |
| Creator ₩24,900/month | **LATER CANDIDATE** |
| Lifetime | **NO AT LAUNCH** |
| AI credit pricing | **LATER** |
| Payment provider | **TBD** |
| Tax/receipt/legal checkout copy | **PRE-LAUNCH GATE** |

---

## 22. Metrics That Can Change Future Pricing

출시 후 확인:

- Preview → Paywall 도달률
- Paywall → Purchase 전환율
- 구매 후 PDF 성공률
- 2번째 책 생성률
- 30/60/90일 반복 사용
- 환불/실패율
- 평균 책 규모
- PDF worker 원가
- AI 원가
- 가격 거부 사유

Creator 구독은 반복 제작 수요가 실제 데이터로 확인될 때만 활성화한다.

---

## 23. Locked Decisions v1.1

1. 초기 구조는 **Free + Book Pass**다.
2. Book Pass 기준 가격은 **₩14,900 / 책 1권**이다.
3. 결제벽은 **PDF Export 직전**이다.
4. Preview까지 무료다.
5. 무료 워터마크 PDF는 제공하지 않는다.
6. 구매한 같은 책은 수정 후에도 추가 결제 없이 재출력할 수 있다.
7. Duplicate/새 프로젝트는 별도 Book Pass다.
8. 페이지 수에 따른 가격 차등은 없다.
9. 차곡 자체는 유료 PDF의 상업적 이용을 제한하지 않는다.
10. Book Pass는 다른 책/계정으로 이전되는 범용 credit이 아니다.
11. 환불/취소/chargeback 확정 시 entitlement revoke가 기본이다.
12. 가격 변경은 기존 구매 entitlement를 소급 훼손하지 않는다.
13. 구매 상태는 향후 server-verified order/entitlement로 복구한다.
14. Creator는 **₩24,900/month 후보**지만 Launch 상품이 아니다.
15. Lifetime plan은 초기 판매하지 않는다.
16. Payment provider와 법적 Checkout 고지는 실제 결제 오픈 전에 확정한다.
