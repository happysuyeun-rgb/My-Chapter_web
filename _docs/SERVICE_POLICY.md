# 차곡 Service Policy

- Product: 차곡 (Chagok)
- Version: v1.0
- Date: 2026-10-16
- Status: CURRENT / Service Policy Baseline
- Applies to: Local MVP current baseline + future SaaS policy direction
- Related: MY_CHAPTER_PRODUCT_SPEC.md, _docs/IA.md, _docs/TASK_FLOW.md
- Note: 이 문서는 제품 운영 기준이다. 이용약관·개인정보처리방침·법률 자문을 대체하지 않는다.

이 문서는 차곡이 무엇을 제공하고, 무엇을 제공하지 않으며, 사용자 원고·결과물·저장·AI·출력에 어떤 원칙을 적용하는지 정의한다.

가격·요금제는 이 정책을 기준으로 별도 Pricing Policy에서 확정한다.

---

## 1. Service Identity

차곡은 글쓰기 AI가 아니라 사용자가 가진 원고를 책의 형태로 완성하는 제작 도구다.

핵심 경험:

~~~text
원고 → 구조 확인 → 디자인 선택 → 표지 → 미리보기 → PDF
~~~

차곡이 해결하는 핵심 문제:

- 원고를 책 구조로 정리하는 과정
- 직접 편집 디자인을 처음부터 만드는 부담
- 페이지네이션과 미리보기
- 실제 전달 가능한 PDF 결과물 생성

차곡은 다음 서비스가 아니다.

- 자유형 그래픽 디자인 도구
- 범용 문서 편집기
- 출판사 또는 출판 대행사
- ISBN 발급/유통 대행 플랫폼
- 공동 집필/실시간 협업 도구

---

## 2. Current Service Scope

현재 Local MVP에서 지원하는 핵심 범위:

| Area | Policy |
|---|---|
| Manuscript input | 붙여넣기 / TXT / MD / PDF / DOCX |
| Structure | 원고 parse 후 장/절 구조 확인 및 조정 |
| Theme | Practical / Minimal |
| Cover | 사용자 표지 이미지 적용 |
| Editing | 생성된 책의 본문 편집 |
| Save safety | Wizard recovery + Editor autosave/recovery + conflict safety |
| Preview | Single / Spread / Grid |
| Export | PDF |
| Library | 로컬 책 목록 / 복제 / 삭제 / 복원 |
| Account | Local/Guest 사용 가능. 실제 SaaS Auth Runtime은 HOLD |

현재 핵심 제품 범위는 원고부터 PDF까지 한 흐름으로 완성하는 것이다.

---

## 3. Access and Account Policy

### 3.1 Current Local / Guest Mode

현재 기준에서는 계정 없이 사용할 수 있다.

- Landing에서 새 책 만들기 가능
- Local Library 사용 가능
- Wizard / Workspace / Preview / PDF 사용 가능
- 실제 책 데이터는 현재 로컬 파일시스템 기반
- 일부 복구 상태는 브라우저 localStorage 사용

Local/Guest Mode에서 차곡은 클라우드 동기화 또는 다기기 연속 사용을 보장하지 않는다.

### 3.2 Future Account Mode

Phase 15B 이후 계정 기능을 연결할 경우 계정의 역할은 다음을 목표로 한다.

- 사용자 인증
- 책 소유권 연결
- 클라우드 저장/동기화
- 결제 및 플랜 권한 연결

단, 계정 기능 자체가 책 Content Source of Truth를 변경하지 않는다.

### 3.3 HOLD

현재 다음은 서비스 약속이 아니다.

- Supabase Auth Runtime
- 사용자별 클라우드 Ownership
- DB/Storage 동기화
- 다기기 동기화

위 항목은 Phase 15B / Phase 16 이후 별도 정책으로 확정한다.

---

## 4. Manuscript and Import Policy

지원 입력:

- 직접 붙여넣기
- TXT
- Markdown (MD)
- PDF
- DOCX

차곡은 입력 파일을 책 제작이 가능한 내부 구조로 변환한다.

다음은 완전 변환을 보장하지 않는다.

- 스캔 이미지 중심 PDF
- 복잡한 다단 편집 문서
- 특수 수식/매크로/임베디드 객체
- 원본 프로그램의 모든 스타일과 레이아웃
- DRM 또는 접근 제한이 있는 파일

Import의 목표는 원본 파일을 픽셀 단위로 복제하는 것이 아니라, 원고 내용을 차곡의 Book Contract 안에서 편집 가능한 책으로 만드는 것이다.

사용자는 변환 후 구조와 내용을 최종 확인해야 한다.

---

## 5. Book Creation Policy

차곡은 원고를 기반으로 다음 제작 단계를 제공한다.

1. 원고 입력
2. 메타데이터 입력
3. 구조 확인
4. 디자인 선택
5. 책 생성
6. 본문/디자인/표지 편집
7. 미리보기
8. PDF 출력

현재 Theme:

- Practical
- Minimal

Theme은 동일한 책 콘텐츠에 CSS 기반 디자인을 적용하는 방식이다.

현재 차곡은 Canva형 자유 배치 편집을 제공하지 않는다.

---

## 6. Output and Commercial Use Policy

차곡의 기본 최종 산출물은 PDF다.

차곡 자체는 사용자가 차곡으로 만든 PDF에 대해 개인용 또는 상업적 이용을 제한하지 않는다.

예:

- 전자책 판매
- 고객 납품
- 강의 자료
- 포트폴리오
- 사내 자료
- 인쇄용 원고 전달

다만 다음 권리는 별도다.

- 사용자가 업로드한 원고의 권리
- 표지/본문 이미지의 라이선스
- 폰트 라이선스
- 인용문 또는 제3자 콘텐츠
- AI로 생성하거나 외부 도구에서 가져온 자료의 권리

즉, 차곡은 결과물 사용 자체에 별도 상업 이용 제한을 두지 않지만, 사용자가 포함한 콘텐츠에 필요한 권리를 대신 확보해 주지는 않는다.

---

## 7. Content Ownership and User Responsibility

### 7.1 User Content

사용자가 제공한 원고와 사용자가 보유한 콘텐츠의 권리는 사용자에게 남는다.

차곡은 서비스 제공을 이유로 원고의 저작권 이전을 요구하지 않는다.

향후 클라우드 서비스에서 저장/처리가 필요해질 경우에는 서비스 제공에 필요한 범위의 처리 권한을 이용약관/개인정보 정책에 별도로 명시한다.

### 7.2 User Responsibility

사용자는 다음에 대한 책임을 가진다.

- 원고를 사용할 권리
- 이미지/폰트/인용 콘텐츠의 적법한 사용
- 개인정보 및 민감정보 포함 여부
- 사실관계
- 명예훼손/저작권/상표권 등 제3자 권리 침해 여부
- 최종 배포 전 결과물 검수

타인의 저작물을 무단 업로드하거나 배포하기 위한 사용은 허용되는 서비스 용도가 아니다.

---

## 8. Data, Storage and Recovery Policy

### 8.1 Current Baseline

현재 책의 Content Source of Truth:

~~~text
book.html
~~~

관련 로컬 데이터:

- book.html
- book.css
- book.json
- 이미지 상태
- history snapshot
- browser recovery state

현재 Local MVP는 클라우드 백업 서비스가 아니다.

### 8.2 Save Safety

현재 제공:

- Wizard draft recovery
- Editor autosave
- Editor local recovery
- 409 conflict safety
- manual save

이 기능은 작업 손실 위험을 줄이기 위한 보호 장치다.

모든 환경에서 데이터 복구를 100% 보장하는 백업 계약은 아니다.

### 8.3 Future Cloud Retention

클라우드 저장이 도입되기 전까지 다음은 미확정이다.

- 저장 용량
- 보존 기간
- 삭제 후 복구 기간
- 계정 탈퇴 후 데이터 처리
- 다기기 동기화
- 백업/SLA

Phase 16에서 데이터 정책과 함께 확정한다.

---

## 9. AI Policy

현재 차곡의 핵심 엔진은 AI가 없어도 동작해야 한다.

AI는 향후 보조 기능으로 추가할 수 있다.

예:

- 구조 제안
- 메타/카피 제안
- 표지 콘셉트/이미지
- 원고 보조 편집

원칙:

- AI는 사용자를 대신한 최종 저자가 아니다.
- AI 제안은 사용자가 검토하고 선택한다.
- AI 결과의 사실성·독창성·법적 적합성을 차곡이 자동 보증하지 않는다.
- AI 기능 장애가 핵심 책 제작/PDF 엔진을 막지 않도록 분리한다.

AI Cover는 현재 Later다.

---

## 10. Quality and Guarantee Boundary

차곡은 편집/페이지네이션/PDF 제작을 자동화하지만 다음을 보증하지 않는다.

- 원고의 사실성
- 맞춤법/문법의 완전성
- 법률/의학/세무 등 전문 정보의 정확성
- 모든 인쇄소 사양과의 완전 호환
- 모든 원본 문서의 100% 동일 복원
- 모든 이미지/폰트/콘텐츠의 라이선스 적합성

사용자는 배포 또는 인쇄 전에 최종 PDF를 확인해야 한다.

현재 서비스 범위에서 기본 목표는 디지털 전달 가능한 PDF 품질이다.

인쇄소별 다음 요구사항은 별도 기능으로 보지 않는다.

- CMYK 완전 관리
- 특수 별색
- 업체별 재단/도련 규격
- 인쇄 감리
- 종이/후가공 추천

---

## 11. Publishing Boundary

차곡은 책 제작 도구이며 출판 행정/유통 대행 서비스가 아니다.

현재 제공하지 않는 것:

- ISBN 발급
- 출판사 신고
- 서점 유통 등록
- POD 계약 대행
- 저작권 등록 대행
- 편집자/교정교열 전문가의 검수 보장
- 인쇄 발주 대행

향후 별도 서비스로 추가되지 않는 한 기본 상품에 포함된 것으로 해석하지 않는다.

---

## 12. Hidden Engine Features vs Product Features

현재 엔진에 존재하더라도 사용자-facing 상품 기능으로 약속하지 않는 기능이 있다.

예:

- EPUB
- Web ZIP
- Print 고급 기능
- Advanced History
- Inspection tools

원칙:

~~~text
ENGINE EXISTS != PRODUCT PROMISE
~~~

제품 화면에 노출되고 서비스 정책/가격정책에 포함된 기능만 고객 약속으로 본다.

---

## 13. Pricing-Dependent Limits

아래 항목은 서비스정책의 방향은 유지하되 정확한 수치는 가격정책에서 확정한다.

- 무료 생성 가능 책 수
- 활성 책 수
- 클라우드 저장 용량
- 파일 크기 제한
- 페이지 또는 원고 길이 제한
- PDF Export 횟수
- 워터마크 여부
- 유료 Theme/Template
- AI 사용량/크레딧
- 고급 Export 기능

따라서 현재 이 문서에는 임의의 숫자 제한을 넣지 않는다.

가격정책은 이 Service Policy v1.0을 변경하지 않는 범위에서 플랜별 entitlement를 정의한다.

---

## 14. Current / HOLD / LATER

| Category | State |
|---|---|
| Local manuscript → PDF | CURRENT |
| TXT/MD/PDF/DOCX/paste | CURRENT |
| Practical / Minimal | CURRENT |
| Cover upload | CURRENT |
| Preview Single/Spread/Grid | CURRENT |
| Local autosave/recovery | CURRENT |
| PDF export | CURRENT |
| Local/Guest use | CURRENT |
| Supabase Auth Runtime | HOLD |
| User Ownership | HOLD |
| DB / Storage / RLS | HOLD |
| Cloud sync | HOLD |
| AI Cover | LATER |
| Usage/Credit | LATER |
| Payment | LATER |
| EPUB/Web ZIP public productization | LATER / HIDDEN |
| Collaboration | OUT OF SCOPE |
| Publishing/ISBN distribution | OUT OF SCOPE |

---

## 15. Policy Precedence

문서 간 역할:

1. Engine protection / architecture
   - ENGINE_CONTRACT.md
2. Product definition
   - MY_CHAPTER_PRODUCT_SPEC.md
3. User-facing service rules
   - SERVICE_POLICY.md
4. Flow / Function / Screen rules
   - IA / TASK_FLOW / FUNCTION_SPEC / SCREEN_SPEC
5. Pricing / entitlement
   - 향후 Pricing Policy

충돌 시 아키텍처를 서비스 문구 때문에 임의로 변경하지 않는다.

반대로 사용자-facing 제공 범위는 엔진에 코드가 존재한다는 이유만으로 자동 확대하지 않는다.

---

## 16. v1.0 Decisions Locked Before Pricing

가격정책 수립 전에 다음을 기준 결정으로 고정한다.

1. 차곡은 원고를 책으로 완성하는 제작 도구다.
2. 핵심 범위는 원고 → 구조 → 디자인 → 표지 → Preview → PDF다.
3. 사용자의 원고 권리는 사용자에게 남는다.
4. 차곡은 결과 PDF 자체에 개인/상업 이용 제한을 두지 않는다.
5. 제3자 원고·이미지·폰트·인용물의 권리 책임은 사용자에게 있다.
6. 차곡은 출판사/유통/ISBN 대행 서비스가 아니다.
7. 현재 Local/Guest는 클라우드 저장을 보장하지 않는다.
8. 계정/Ownership/Cloud는 Phase 15B/16 이후 확정한다.
9. AI는 선택적 보조 계층이며 핵심 엔진의 전제 조건이 아니다.
10. 정확한 사용량 제한과 유료 경계는 Pricing Policy에서 결정한다.

---

## Next Policy Document

다음 확정 문서:

~~~text
Pricing Policy v1.0
~~~

Pricing Policy에서 결정할 것:

- Free / Paid 구조
- 구독 vs 건별 결제
- 책 수/저장량/Export entitlement
- AI credit
- 출시 가격
- 환불/결제 기본 원칙
