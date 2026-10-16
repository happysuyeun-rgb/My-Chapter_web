# 차곡 Portfolio Case Study

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **CURRENT / PORTFOLIO STORYLINE**
- Audience: UX/Product Planner portfolio, interview, project presentation
- Source baseline:
  - `MY_CHAPTER_PRODUCT_SPEC.md` v1.5
  - `_docs/IA.md`
  - `_docs/TASK_FLOW.md`
  - `_docs/ENGINE_CONTRACT.md`
  - `_docs/QA_ACCEPTANCE.md` v1.2
  - `_docs/UI_PRODUCT_AUDIT_2026-10-16.md`
- Privacy rule: 실제 사용자 원고/개인 책 내용은 포트폴리오 캡처에 사용하지 않는다.

이 문서는 차곡을 **취업용 포트폴리오 케이스스터디**로 설명하기 위한 기준 스토리라인이다.

기술 문서처럼 모든 세부사항을 보여주는 것이 아니라, **문제 → 판단 → 설계 → 검증 → 결과**가 한눈에 이어지도록 구성한다.

---

## 1. One-line Case

> **원고는 있는데 책으로 완성하는 과정이 어렵다.  
> 차곡은 원고를 구조화하고, 디자인과 표지를 입히고, 미리보기와 PDF까지 한 흐름으로 완성하는 전자책 제작 도구다.**

핵심 플로우:

~~~text
원고
→ 구조 확인
→ 디자인 선택
→ 표지
→ 편집
→ 미리보기
→ PDF
~~~

---

## 2. Problem

전자책을 만들려는 사용자는 보통 여러 도구를 오간다.

예:

- 글은 Word / Docs / AI에서 작성
- 목차는 수동 정리
- 디자인은 Canva / 편집툴
- 페이지 깨짐은 별도 확인
- PDF는 마지막에 다시 출력
- 수정하면 다시 앞 과정을 반복

문제는 단순히 "디자인을 못한다"가 아니다.

### 핵심 문제

1. **원고와 책 사이에 긴 제작 공정이 있다.**
2. 원고 수정과 PDF 결과 사이의 거리가 멀다.
3. 디자인 자유도가 높을수록 초보자는 오히려 결정 피로가 커진다.
4. AI가 글을 생성해도 "실제 책 파일"까지 자동으로 이어지지 않는다.
5. 결과를 확인하기 전까지 품질을 예측하기 어렵다.

### Product Question

> 어떻게 하면 사용자가 편집 프로그램을 배우지 않아도, 자신의 원고가 "책처럼 완성되는 과정"을 한 흐름으로 경험하게 할 수 있을까?

---

## 3. Goal

### User Goal

> 원고만 준비하면 구조·디자인·표지·PDF까지 한 번에 완성하고 싶다.

### Product Goal

- 신규 사용자가 설명 없이 핵심 흐름을 이해한다.
- 실제 원고를 넣어 결과를 확인할 수 있다.
- 기존 편집/PDF 엔진의 안정성을 잃지 않는다.
- Preview와 PDF 결과의 차이를 최소화한다.
- 실수/새로고침/충돌로 작업을 잃지 않는다.

### Non-goal

차곡은 처음부터 아래 제품이 되려고 하지 않았다.

- Canva형 자유 배치 디자인 툴
- 범용 AI 글쓰기 서비스
- 출판사/ISBN/유통 대행 서비스
- 협업 문서 도구
- 모든 기능을 가진 올인원 출판 플랫폼

---

## 4. My Role

포트폴리오에서는 다음 역할로 설명한다.

### Primary Role

**Product / UX Planning**

- 문제 정의
- 사용자 흐름 설계
- IA / Task Flow
- 화면 구조 / 상태 정의
- 기능 우선순위
- 서비스/가격 정책
- 예외·복구 시나리오
- QA Acceptance 설계

### Product Architecture Coordination

- 기존 엔진 Audit
- KEEP / WRAP / HOLD 판단
- Content SoT 결정 보호
- Local MVP → SaaS 확장 경계 설계
- Payment / Ownership / PDF authorization 선후관계 정의

### AI-assisted Implementation Coordination

- 구현 요구사항을 문서/프롬프트 단위로 쪼개기
- 변경 범위/STOP 조건 지정
- Build/QA 결과 검수
- Code ↔ Spec drift 점검

포트폴리오에서는 "AI가 만들었다"가 아니라:

> **기획자가 제품 계약과 검수 기준을 먼저 정의하고, AI 개발 도구를 실행 레이어로 사용했다.**

로 설명한다.

---

## 5. Key Constraint

차곡은 빈 화면에서 새로 만든 프로젝트가 아니었다.

이미 존재하는 로컬 전자책 엔진이 있었고, 다음 자산은 동작하고 있었다.

- HTML 기반 책
- Paged.js pagination
- Single / Spread / Grid Viewer
- Headless Chrome PDF
- Editor
- History
- Import
- Cover / image slot

또한 약 **168쪽 분량의 설계 기준 책**이 엔진 표현력의 상한으로 존재했다.

따라서 질문은:

> "새로 만들 것인가?"가 아니라  
> **"어떤 자산을 보존하고 어디만 제품화할 것인가?"**

였다.

---

## 6. Architecture Decision — Rebuild하지 않은 이유

초기에는 구조화 JSON, React/Vite, 신규 Viewer 같은 선택지도 고려할 수 있었다.

하지만 Audit 후 다음을 확정했다.

### Content SoT

~~~text
book.html
~~~

을 유지.

### Keep / Wrap

~~~text
Editor      KEEP / WRAP
Viewer      KEEP
Paged.js    KEEP
PDF Engine  KEEP
Import      KEEP
Theme       CSS Layer
~~~

### Not Now

~~~text
Structured Book JSON
React/Vite rewrite
new Pagination Engine
new PDF Engine
existing book migration
~~~

### Why

- 이미 긴 책을 안정적으로 표현하는 엔진이 있었다.
- 새 구조로 옮기면 표현력 손실과 migration 비용이 커졌다.
- MVP의 문제는 엔진 부재가 아니라 **사용자 흐름 부재**에 가까웠다.

이 결정으로 개발 범위를 "엔진 재작성"이 아니라 **제품 경험 통합**으로 좁혔다.

---

## 7. Core User Flow

### Before

~~~text
원고
→ 포맷 정리
→ 목차 수동
→ 디자인 툴
→ 페이지 확인
→ 수정
→ 다시 페이지 확인
→ PDF
~~~

### Chagok

~~~text
Landing
→ 새 책 만들기
→ 원고 입력
→ Metadata
→ 구조 확인
→ 디자인 선택
→ 책 생성
→ 편집 / 표지
→ Preview
→ PDF
~~~

### Important Decision

S05~S08 동안은 디스크에 실제 책을 만들지 않는다.

~~~text
Input
→ Parse
→ Metadata
→ Structure
→ Theme
→ S09 확정
→ 실제 Book write
~~~

사용자가 중간에 취소해도 "반쯤 만들어진 책 폴더"가 남지 않게 했다.

---

## 8. Screen Strategy

### S01 Landing

역할:

- 무엇을 만드는 서비스인지 즉시 설명
- 새 책 만들기
- 내 서재

핵심 메시지:

> 원고가 책이 되는 과정, 차곡.

### S04~S09 Wizard

초보 사용자가 순서대로 한 번에 결정하도록 설계.

~~~text
원고
→ 정보
→ 구조
→ 디자인
→ 생성
~~~

자유도보다 **진행 방향의 명확성**을 우선했다.

### S10 Workspace

기존 기능을 하나의 작업공간으로 통합.

~~~text
원고 | 디자인 | 표지 | 미리보기
~~~

기존 Editor / Viewer를 다시 만들지 않고 감쌌다.

### S14 Preview

- Single
- Spread
- Grid

사용자가 PDF를 만들기 전에 실제 책 품질을 확인하는 핵심 단계.

---

## 9. Recovery UX — "기능"보다 신뢰를 먼저 설계

책 제작은 작업 시간이 길다.

따라서 MVP에서도 작업 유실은 치명적인 문제로 봤다.

### Wizard Recovery

- 작성 중 draft 저장
- 새로고침 후 복구
- 동일 원고 fingerprint 기반
- File/base64는 localStorage에 저장하지 않음

### Editor Autosave

- debounce autosave
- local recovery
- 수동 저장 병행
- 저장 중 새 변경 보호

### Conflict

서버 원본 version이 달라지면:

~~~text
409 Conflict
→ autosave 중지
→ dirty/recovery 유지
→ 자동 덮어쓰기 금지
~~~

"자동 저장"보다 **잘못 저장하지 않는 것**을 더 중요하게 봤다.

---

## 10. Local-first Product Decision

초기에는 Auth/Cloud까지 바로 붙이지 않았다.

### 이유

핵심 질문은:

> 사용자가 실제로 원고를 넣고 책을 완성할 수 있는가?

였기 때문이다.

따라서:

~~~text
Phase 15A
Local / Guest
→ 핵심 Flow 검증

Phase 15B
Real Auth
→ HOLD

Phase 16
Ownership / DB / Storage
→ HOLD
~~~

로 나눴다.

Backend 기능이 제품 검증을 가리지 않도록 한 결정이다.

---

## 11. Pricing Decision

기능 개발 전에 가격정책까지 설계했다.

초기 구조:

~~~text
Free
→ 원고 입력
→ 구조
→ 디자인
→ 표지
→ 편집
→ Preview

Book Pass
→ ₩14,900 / 책 1권
→ PDF Export unlock
→ 같은 책 수정 후 재출력 추가 결제 없음
~~~

### Paywall 위치

~~~text
Preview
→ PDF Export
→ Paywall
~~~

사용자가 결과를 먼저 확인한 뒤 구매하게 했다.

"사용 전 결제"보다 **가치 확인 후 결제**를 선택했다.

실제 Payment 구현은 Auth / Ownership / Authorized Export 전까지 HOLD했다.

---

## 12. QA Strategy

QA를 마지막 단계가 아니라 제품 설계의 일부로 사용했다.

### 주요 검수

- Landing → Wizard → Workspace → Preview → PDF
- TXT / MD / PDF / DOCX / Paste
- Wizard recovery
- Editor autosave / recovery
- 409 conflict
- Theme
- Cover
- Preview Single / Spread / Grid
- PDF page integrity
- responsive 390 / 768 / 1440

### Final Local MVP

기준:

- **P0 = 0**
- **P1 = 0**
- UI/Product Audit 최종 점수: **89 / 100**
- 계획한 P2 polish 완료
- Local MVP UI 개발 종료 가능 판정

포트폴리오에서는 점수 자체보다:

> **문제를 발견 → 우선순위 분류 → 수정 → 재검증**

프로세스를 보여준다.

---

## 13. Product Result

### Before

- 기능은 많지만 로컬 도구에 가까움
- 사용자가 어디서 시작할지 불명확
- 새 책 생성 단계가 제품 흐름으로 묶여 있지 않음
- 저장/복구 신뢰가 부족
- Landing/Auth/Workspace 제품 구조 미정

### After

- Landing → Library → Wizard → Workspace 제품 Flow
- Raw manuscript → structured book
- Practical / Minimal Theme
- Cover
- Preview 3 mode
- PDF Export
- Wizard Recovery
- Editor Autosave/Recovery
- Conflict safety
- Local/Guest fallback
- 서비스/가격/결제 정책까지 확장 가능한 구조

---

## 14. What I Deliberately Did Not Build

포트폴리오에서 이 섹션을 반드시 보여준다.

"못 만든 기능"이 아니라 **안 만들기로 결정한 기능**이다.

### HOLD

- Real Supabase Auth
- Ownership
- DB / Storage / RLS
- Cloud sync
- Payment implementation

### Later

- AI Cover
- AI manuscript assist
- Creator subscription

### Reason

핵심 가치 검증 전에 인프라와 기능을 늘리면:

- 일정이 길어지고
- 검증이 늦어지고
- 제품의 핵심 문제가 흐려진다.

기능을 추가하는 것만큼 **멈추는 판단**도 제품 설계로 본다.

---

## 15. Vercel Deployment Finding

GitHub ↔ Vercel Production 연결은 만들어졌지만 현재 Local Engine 구조를 그대로 Vercel에 올리면 제품이 정상 동작하지 않는다.

현재 Engine:

~~~text
Node HTTP server
+ local filesystem
+ fs.watch / SSE
+ Paged.js
+ local Headless Chrome
~~~

따라서 Production SaaS 전환 시 후보 구조는:

~~~text
Vercel
  → Product UI / short APIs

Supabase
  → Auth / Metadata / Storage

PDF Worker
  → Paged.js / Headless Chrome / PDF
~~~

여기서도 원칙은 **기존 PDF Engine을 버리는 것이 아니라 Worker로 WRAP**하는 것이다.

이 아키텍처는 실제 사용자 검증 후에만 착수한다.

---

## 16. Portfolio Story — 7 Slides / Sections

실제 포트폴리오에는 아래 7개 섹션 정도로 압축한다.

### 01. Problem

**원고는 있는데, 책으로 완성하려면 너무 많은 단계를 거쳐야 했다.**

시각자료:

- 기존 제작 과정 diagram
- 문제 3개

### 02. Product Direction

**자유로운 디자인 툴이 아니라 "원고 → 책" 완료 경험에 집중했다.**

시각자료:

- Chagok Flow
- Non-goal 비교

### 03. Architecture Audit

**이미 잘 동작하는 엔진을 다시 만들지 않았다.**

시각자료:

- KEEP / WRAP / HOLD diagram
- book.html → Paged.js → Preview/PDF

### 04. UX Flow

**결정 피로를 줄이기 위해 Wizard로 제작 순서를 고정했다.**

시각자료:

- Landing
- S05 Input
- S07 Structure
- S08 Theme
- Workspace

### 05. Reliability

**전자책 제작에서 가장 큰 UX 문제 중 하나는 작업 유실이었다.**

시각자료:

- Wizard recovery
- Autosave
- 409 conflict flow

### 06. Validation

**QA를 기준으로 P0/P1을 닫고 UI 개발 종료선을 정했다.**

시각자료:

- 390 / 768 / 1440
- QA matrix
- Preview / PDF

### 07. Business Extension

**결제도 기능보다 먼저 정책과 entitlement 구조를 설계했다.**

시각자료:

~~~text
Free → Preview
Book Pass ₩14,900 → PDF
~~~

단, 실제 결제는 검증 전 HOLD.

---

## 17. Screenshot / Visual Asset Checklist

실제 포트폴리오용 캡처는 아래만 준비하면 충분하다.

### Must Have

1. Landing
2. Manuscript Input
3. Structure Review
4. Theme Selection
5. Workspace Manuscript
6. Cover
7. Preview Spread
8. Preview Grid
9. Generated PDF sample
10. Recovery / conflict 상태 중 하나

### Diagram

1. Before → Chagok Flow
2. KEEP / WRAP architecture
3. Autosave / Recovery flow
4. Local → SaaS future boundary

### Optional

- Library
- Mobile 390
- Pricing concept

### Privacy

포트폴리오 캡처에는:

- 개인 원고
- 실제 고객 원고
- `books/서아의/`
- 민감 파일명/경로

를 노출하지 않는다.

별도의 공개용 Demo Book을 사용한다.

---

## 18. Representative Demo Requirement

다음 단계에서 공개용 Demo Book 1개를 고정한다.

조건:

- 개인정보 없음
- 저작권 문제 없음
- 6~10페이지 정도
- 제목/본문/목차/이미지 1~2개 포함
- Practical / Minimal 차이가 보임
- PDF 결과가 포트폴리오에 사용 가능

대표 데모의 목적:

> **신규 사용자가 3~5분 안에 원고를 책으로 만드는 전체 흐름을 보여주는 것.**

---

## 19. Interview Talking Points

### Q. 왜 React로 다시 만들지 않았나요?

> 기존 엔진이 168쪽 책과 Preview/PDF까지 안정적으로 처리하고 있었습니다. 문제는 기술 스택보다 사용자 흐름이었습니다. 그래서 재작성보다 KEEP/WRAP 전략을 선택했습니다.

### Q. 가장 중요한 UX 결정은?

> 사용자가 결과를 보기 전에 많은 설정을 요구하지 않고, 원고 → 구조 → 디자인 → 생성 순서를 Wizard로 고정한 것입니다.

### Q. Autosave를 왜 복잡하게 설계했나요?

> 자동저장 자체보다 잘못된 덮어쓰기를 막는 게 중요했습니다. 409 conflict에서 자동 재전송을 막고 recovery를 보존했습니다.

### Q. 왜 Auth/DB를 바로 안 붙였나요?

> 핵심 가치가 검증되기 전에 인프라가 제품 우선순위를 잡아먹는 것을 막기 위해 Local MVP를 먼저 닫았습니다.

### Q. 결제는 왜 PDF 직전인가요?

> 자신의 실제 결과물을 확인한 뒤 구매하는 편이 가치 인지가 명확하기 때문입니다.

---

## 20. Resume / Portfolio Summary

짧게 쓸 경우:

> **차곡 — AI-assisted ebook production tool**  
> 원고 입력부터 구조화, 디자인, 표지, 미리보기, PDF까지 이어지는 전자책 제작 경험을 기획했습니다. 기존 HTML/Paged.js 기반 엔진을 Audit해 재작성 대신 KEEP/WRAP 전략을 수립했고, Wizard Recovery·Editor Autosave·Conflict Safety를 설계해 장시간 작업의 안정성을 보완했습니다. Local MVP 기준 P0/P1을 0으로 마감했으며, 서비스·가격·Payment entitlement까지 확장 가능한 정책/기술 경계를 설계했습니다.

---

## 21. Case Study Done Criteria

이 문서 이후 실제 포트폴리오 산출물 완료 조건:

- 공개용 Demo Book 고정
- Must-have 화면 8개 이상 캡처
- PDF sample 확보
- Before/After diagram
- KEEP/WRAP architecture diagram
- 7-section portfolio page/presentation
- 실제 사용자 검증 결과 1개 이상 반영

---

## Next

다음 작업:

~~~text
Representative Demo Scenario
→ Demo Book
→ 3~5분 End-to-End 시연
→ 사용자 3~5명 검증
~~~
