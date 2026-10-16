# 차곡 Service Policy

- Product: 차곡 (Chagok)
- Version: **v1.1**
- Date: 2026-10-16
- Status: **CURRENT / Service Policy Baseline**
- Applies to: Local MVP current baseline + future SaaS policy direction
- Related: `MY_CHAPTER_PRODUCT_SPEC.md`, `_docs/PRICING_POLICY.md`, `_docs/IA.md`, `_docs/TASK_FLOW.md`
- Note: 이 문서는 제품 운영 기준이다. 이용약관·개인정보처리방침·법률 자문을 대체하지 않는다.

이 문서는 차곡이 **무엇을 제공하고, 무엇을 제공하지 않으며, 사용자 콘텐츠·결과물·저장·AI·출력·운영에 어떤 원칙을 적용하는지** 정의한다.

가격·요금제는 `_docs/PRICING_POLICY.md`를 따른다.

---

## 1. Service Identity

차곡은 글쓰기 AI가 아니라 **사용자가 가진 원고를 책의 형태로 완성하는 제작 도구**다.

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
| Pricing | Free + Book Pass 정책 확정. Payment 구현은 HOLD |

현재 핵심 제품 범위는 **원고부터 PDF까지 한 흐름으로 완성하는 것**이다.

---

## 3. Access and Account Policy

### 3.1 Current Local / Guest Mode

현재 기준에서는 계정 없이 사용할 수 있다.

- Landing에서 새 책 만들기 가능
- Local Library 사용 가능
- Wizard / Workspace / Preview / PDF 사용 가능
- 실제 책 데이터는 현재 로컬 파일시스템 기반
- 일부 복구 상태는 브라우저 localStorage 사용

Local/Guest Mode에서 차곡은 **클라우드 동기화 또는 다기기 연속 사용을 보장하지 않는다.**

### 3.2 Future Account Mode

Phase 15B 이후 계정 기능을 연결할 경우 계정의 역할은 다음을 목표로 한다.

- 사용자 인증
- 책 소유권 연결
- 클라우드 저장/동기화
- 결제 및 Book Pass entitlement 연결

단, 계정 기능 자체가 책 Content Source of Truth를 변경하지 않는다.

### 3.3 HOLD

현재 다음은 서비스 약속이 아니다.

- Supabase Auth Runtime
- 사용자별 Cloud Ownership
- DB/Storage 동기화
- 다기기 동기화
- 실제 결제 처리

위 항목은 Phase 15B / Phase 16 / Payment Phase에서 별도 구현·QA 후 활성화한다.

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

차곡의 기본 최종 산출물은 **PDF**다.

차곡 자체는 사용자가 차곡으로 만든 PDF에 대해 **개인용 또는 상업적 이용을 제한하지 않는다.**

예:

- 전자책 판매
- 고객 납품
- 강의 자료
- 포트폴리오
- 사내 자료
- 인쇄용 원고 전달

다만 다음 권리는 별도다.

- 사용자가 업로드한 원고의 권리
- 사용자가 업로드한 표지/본문 이미지의 라이선스
- 사용자가 직접 추가한 폰트의 라이선스
- 인용문 또는 제3자 콘텐츠
- AI 또는 외부 도구에서 가져온 자료의 권리

차곡은 결과물 사용 자체에 별도 상업 이용 제한을 두지 않지만, **사용자가 직접 포함한 제3자 콘텐츠에 필요한 권리를 대신 확보해 주지는 않는다.**

---

## 7. Content Rights, Assets and Acceptable Use

### 7.1 User Content

사용자가 제공한 원고와 사용자가 보유한 콘텐츠의 권리는 사용자에게 남는다.

차곡은 서비스 제공을 이유로 원고의 저작권 이전을 요구하지 않는다.

향후 클라우드 서비스에서 저장/처리가 필요해질 경우에는 서비스 제공에 필요한 범위의 처리 권한을 이용약관/개인정보 정책에 별도로 명시한다.

### 7.2 User-Provided Assets

사용자가 직접 추가한 다음 자료의 권리 확인 책임은 사용자에게 있다.

- 원고
- 이미지
- 폰트
- 인용문
- 로고/상표
- 외부 AI 생성물
- 기타 제3자 저작물

### 7.3 Chagok-Provided Assets

차곡이 사용자-facing 제품에 기본 제공하는 Theme·폰트·기본 이미지/아이콘 등은 **차곡이 허용하는 PDF 제작 및 상업적 결과물 사용 범위에 적합한 권리를 확보했거나 해당 조건을 충족한 자산만 포함하는 것을 원칙**으로 한다.

따라서:

- 권리 조건이 확인되지 않은 자산은 상업용 기본 제공 자산으로 노출하지 않는다.
- 라이선스 조건이 변경되거나 불명확해지면 신규 제공을 중단하거나 대체한다.
- 사용자가 별도로 업로드한 자산은 Chagok-Provided Asset으로 보지 않는다.
- 실제 SaaS 출시 전 기본 폰트/Theme/아이콘에 대한 Asset License Audit을 완료한다.

### 7.4 User Responsibility

사용자는 다음에 대한 책임을 가진다.

- 콘텐츠를 사용할 권리
- 개인정보 및 민감정보 포함 여부
- 사실관계
- 명예훼손/저작권/상표권 등 제3자 권리 침해 여부
- 최종 배포 전 결과물 검수

### 7.5 Acceptable Use

차곡을 다음 목적으로 사용하는 것을 허용된 서비스 용도로 보지 않는다.

- 권한 없는 저작물의 무단 배포
- 불법 활동을 직접 수행하거나 조장하기 위한 사용
- 악성코드/유해 파일 배포
- 타인을 사칭하거나 권리를 침해하는 콘텐츠의 제작·배포
- 서비스 안정성을 의도적으로 훼손하는 자동화/남용

실제 계정 정지·콘텐츠 제한·신고 처리 절차는 SaaS 출시 전 이용약관/운영정책에서 확정한다.

---

## 8. Data, Storage, Deletion and Recovery Policy

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

현재 Local MVP는 **클라우드 백업 서비스가 아니다.**

### 8.2 Save Safety

현재 제공:

- Wizard draft recovery
- Editor autosave
- Editor local recovery
- 409 conflict safety
- manual save

이 기능은 작업 손실 위험을 줄이기 위한 보호 장치다.

모든 환경에서 데이터 복구를 100% 보장하는 백업 계약은 아니다.

### 8.3 Paid Project Delete / Restore Direction

향후 Book Pass가 구현된 뒤의 기본 원칙:

- 구매한 책을 휴지통으로 이동해도 entitlement는 해당 책 프로젝트에 남는다.
- 같은 stable book identity로 복원되면 PDF Unlock도 함께 복원한다.
- 영구 삭제 전에는 "구매 권리가 다른 책으로 이전되지 않는다"는 점을 명확히 경고한다.
- 복구 불가능한 영구 삭제 후에는 entitlement를 새 프로젝트로 자동 이전하지 않는다.
- 기술 장애로 잘못 삭제된 경우의 복구/보상은 CS 정책으로 처리한다.

### 8.4 Future Cloud Retention

클라우드 저장이 도입되기 전까지 다음 수치는 미확정이다.

- 저장 용량
- 보존 기간
- 휴지통 보존 기간
- 계정 탈퇴 후 데이터 처리
- 다기기 동기화
- 백업/SLA

Phase 16 및 SaaS 운영정책에서 확정한다.

### 8.5 Account Deletion Direction

향후 계정 기반 서비스에서는:

- 계정 삭제 전에 보유 책·구매 entitlement·데이터 삭제 영향에 대해 명확히 고지한다.
- 가능한 범위에서 사용자가 최종 PDF를 Export할 기회를 제공한다.
- 법적/결제 기록 보존이 필요한 정보와 사용자 콘텐츠 보존을 구분한다.
- 보존 기간 종료 후 삭제된 계정의 작업물/entitlement 복구를 보장하지 않는다.

정확한 보존 기간은 개인정보처리방침과 결제/세무 요건 확정 후 정한다.

### 8.6 Service Discontinuation Direction

Book Pass는 **서비스가 무기한 존속한다는 보증**을 의미하지 않는다.

향후 SaaS를 종료해야 할 경우 가능한 범위에서:

- 합리적인 사전 고지
- 기존 유료 사용자의 PDF Export 기회
- 데이터 이전/다운로드 안내

를 제공하는 것을 운영 원칙으로 한다.

구체적인 고지 기간과 종료 절차는 실제 SaaS 출시 전 이용약관에서 확정한다.

---

## 9. AI Policy

현재 차곡의 핵심 엔진은 AI가 없어도 동작해야 한다.

AI는 향후 **보조 기능**으로 추가할 수 있다.

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

AI Cover는 현재 **Later**다.

---

## 10. Quality and Guarantee Boundary

차곡은 편집/페이지네이션/PDF 제작을 자동화하지만 다음을 보증하지 않는다.

- 원고의 사실성
- 맞춤법/문법의 완전성
- 법률/의학/세무 등 전문 정보의 정확성
- 모든 인쇄소 사양과의 완전 호환
- 모든 원본 문서의 100% 동일 복원
- 사용자가 직접 추가한 모든 이미지/폰트/콘텐츠의 라이선스 적합성

사용자는 배포 또는 인쇄 전에 최종 PDF를 확인해야 한다.

현재 서비스 범위에서 기본 목표는 **디지털 전달 가능한 PDF 품질**이다.

인쇄소별 다음 요구사항은 기본 서비스 범위가 아니다.

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

제품 화면에 노출되고 서비스정책/가격정책에 포함된 기능만 고객 약속으로 본다.

---

## 13. Pricing-Dependent and Technical Limits

정확한 수치가 아직 미확정인 항목:

- SaaS Free 생성/활성 책 수
- 클라우드 저장 용량
- 최대 파일 크기
- 최대 PDF 입력 크기
- 최대 또는 권장 페이지 수
- 이미지 총 용량
- PDF 생성 timeout
- AI 사용량/credit
- 향후 유료 Theme/Template 범위

현재 Local MVP에서는 결제 제한을 강제하지 않는다.

Book Pass의 가격·PDF entitlement·워터마크 정책은 `_docs/PRICING_POLICY.md`에서 확정한다.

기술 한도는 실제 SaaS 배포 구조와 부하 테스트 후 별도 운영 한도로 확정하며, 검증되지 않은 최대치를 마케팅에서 약속하지 않는다.

---

## 14. Support and Incident Direction

실제 유료 서비스를 오픈하기 전에 최소한 다음 운영 기준을 확정한다.

- 고객 문의 채널
- 결제 오류 접수 경로
- PDF 생성 실패 대응
- 중복 결제 처리
- 데이터 손실/삭제 사고 대응
- 장애 공지 방식

현재 확정된 제품 원칙:

- 결제는 성공했는데 PDF 생성이 실패한 경우 다시 결제시키지 않는다.
- 동일 Book Pass entitlement는 유지한다.
- 서비스 기술 장애로 정상 산출물을 제공하지 못한 경우 재시도/복구를 우선하고, 해결 불가 시 환불/취소 검토 대상이 된다.

응답 시간 SLA는 실제 운영 인력과 채널을 정한 뒤 확정한다.

---

## 15. Current / HOLD / LATER

| Category | State |
|---|---|
| Local manuscript → PDF | CURRENT |
| TXT/MD/PDF/DOCX/paste | CURRENT |
| Practical / Minimal | CURRENT |
| Cover upload | CURRENT |
| Preview Single/Spread/Grid | CURRENT |
| Local autosave/recovery | CURRENT |
| Local PDF export | CURRENT |
| Local/Guest use | CURRENT |
| Service Policy | CURRENT |
| Pricing Policy | CURRENT |
| Pricing/Payment UI Requirements | TARGET DEFINED |
| Supabase Auth Runtime | HOLD |
| User Ownership | HOLD |
| DB / Storage / RLS | HOLD |
| Cloud sync | HOLD |
| Payment implementation | HOLD |
| AI Cover | LATER |
| Usage/Credit | LATER |
| EPUB/Web ZIP public productization | LATER / HIDDEN |
| Collaboration | OUT OF SCOPE |
| Publishing/ISBN distribution | OUT OF SCOPE |

---

## 16. Policy Precedence

문서 간 역할:

1. **Engine protection / architecture**
   - `_docs/ENGINE_CONTRACT.md`
2. **Product definition**
   - `MY_CHAPTER_PRODUCT_SPEC.md`
3. **User-facing service rules**
   - 본 `_docs/SERVICE_POLICY.md`
4. **Pricing / entitlement**
   - `_docs/PRICING_POLICY.md`
5. **Pricing / payment UX target**
   - `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md`
6. **Flow / Function / Screen rules**
   - IA / TASK_FLOW / FUNCTION_SPEC / SCREEN_SPEC
7. **Historical evidence**
   - 당시 Audit / Release documents

충돌 시 아키텍처를 서비스 문구 때문에 임의로 변경하지 않는다.

반대로 사용자-facing 제공 범위는 엔진에 코드가 존재한다는 이유만으로 자동 확대하지 않는다.

---

## 17. v1.1 Locked Decisions

1. 차곡은 **원고를 책으로 완성하는 제작 도구**다.
2. 핵심 범위는 **원고 → 구조 → 디자인 → 표지 → Preview → PDF**다.
3. 사용자의 원고 권리는 사용자에게 남는다.
4. 차곡은 결과 PDF 자체에 개인/상업 이용 제한을 두지 않는다.
5. 사용자가 직접 추가한 제3자 콘텐츠 권리는 사용자 책임이다.
6. **차곡이 기본 제공하는 사용자-facing Asset은 허용 범위에 맞는 권리를 확인한 것만 제공한다.**
7. 차곡은 출판사/유통/ISBN 대행 서비스가 아니다.
8. 현재 Local/Guest는 클라우드 저장을 보장하지 않는다.
9. 계정/Ownership/Cloud는 Phase 15B/16 이후 구현·정책을 확정한다.
10. AI는 선택적 보조 계층이며 핵심 엔진의 전제 조건이 아니다.
11. Book Pass는 다른 책으로 이전되는 범용 credit이 아니라 **특정 책 프로젝트에 연결된 entitlement**다.
12. 구매 책 삭제/계정 삭제/서비스 종료에는 별도 고지와 데이터 보호 원칙을 적용한다.
13. Payment 구현은 정책이 준비됐다는 이유만으로 앞당기지 않는다.

---

## 18. Pre-Launch Policy Gates

실제 SaaS + Payment 오픈 전 별도 확정/검토가 필요한 것:

- 이용약관
- 개인정보처리방침
- 결제/환불/청약철회 고지
- 사업자/세금/영수증 처리
- Asset License Audit
- 계정 삭제/데이터 보존 기간
- 기술 사용 한도
- 고객지원 채널
- 장애/보상 운영 기준

현재 상태:

~~~text
SERVICE POLICY = CURRENT
PRICING POLICY = CURRENT
PAYMENT UI REQUIREMENTS = TARGET DEFINED
PAYMENT IMPLEMENTATION = HOLD
~~~
