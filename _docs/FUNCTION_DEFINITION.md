# 차곡 기능정의서 (Function Definition)

- Product: 차곡 (Chagok)
- Document: Function Definition
- Version: 1.0
- Status: CURRENT / IMPLEMENTATION BASELINE
- Updated: 2026-10-16
- Related: `_docs/IA.md`, `_docs/TASK_FLOW.md`, `_docs/FUNCTION_SPEC.md`, `_docs/SCREEN_SPEC.md`
- Detail rule: 본 문서는 기능의 범위와 역할을 정의한다. Trigger/Validation/Acceptance/API 등 상세 조건은 `FUNCTION_SPEC.md`를 따른다.

---

## 1. 문서 목적

차곡이 사용자에게 제공하는 기능을 제품 단위로 정의한다.

문서 역할 구분:

- IA: 무엇이 어디에 존재하는가
- Task Flow: 사용자가 어떤 순서로 일을 완료하는가
- Function Definition: 어떤 기능을 제공하는가
- Function Spec: 각 기능이 어떻게 동작해야 하는가
- Screen Spec: 화면에서 어떻게 노출되는가
- API/Data/Engine Spec: 구현 계약

---

## 2. 제품 핵심 기능

차곡의 핵심 기능은 다음 6개 축으로 구성한다.

1. 계정 및 진입
2. 책 관리
3. 새 책 생성
4. 책 편집
5. 디자인·표지·미리보기
6. PDF 출력

핵심 가치:

> 사용자가 원고를 준비하면 차곡이 구조화·디자인·편집·표지·미리보기·PDF까지 한 흐름으로 완성하게 한다.

---

## 3. 기능 구조도

```text
차곡
├─ 01. 진입 / 계정
│  ├─ Landing
│  ├─ 회원가입
│  ├─ 로그인
│  ├─ 세션 유지
│  └─ 로그아웃
│
├─ 02. 내 서재
│  ├─ 책 목록
│  ├─ 검색
│  ├─ 필터 / 정렬
│  ├─ 책 열기
│  ├─ 책 정보 수정
│  ├─ 복제
│  ├─ 휴지통
│  └─ 복원 / 영구 삭제
│
├─ 03. 새 책 만들기
│  ├─ 시작 방식 선택
│  ├─ 원고 가져오기
│  ├─ 텍스트 붙여넣기
│  ├─ 책 기본정보
│  ├─ 구조 확인
│  ├─ 디자인 선택
│  └─ 책 생성
│
├─ 04. 원고 편집
│  ├─ 본문 편집
│  ├─ 구조 편집
│  ├─ 저장
│  ├─ Autosave
│  └─ Recovery
│
├─ 05. 책 꾸미기
│  ├─ 디자인
│  ├─ 표지
│  └─ 미리보기
│
└─ 06. 출력
   ├─ PDF 생성
   ├─ 다운로드
   └─ 재출력
```

---

## 4. 기능 정의 Matrix

| ID | 영역 | 기능 | 정의 | MVP |
|---|---|---|---|---|
| FD-ENTRY-01 | 진입 | Landing | 차곡 소개와 주요 CTA를 제공한다. | Yes |
| FD-AUTH-01 | 계정 | 회원가입 | 이메일/비밀번호로 계정을 생성한다. | Yes |
| FD-AUTH-02 | 계정 | 로그인 | 계정 인증 후 세션을 생성한다. | Yes |
| FD-AUTH-03 | 계정 | 세션 유지 | 새로고침 후에도 로그인 상태를 유지한다. | Yes |
| FD-AUTH-04 | 계정 | 로그아웃 | 세션을 종료하고 Landing으로 이동한다. | Yes |
| FD-LIB-01 | 서재 | 책 목록 | 사용자의 책을 카드 목록으로 표시한다. | Yes |
| FD-LIB-02 | 서재 | 검색 | 제목·저자 등으로 책을 찾는다. | Yes |
| FD-LIB-03 | 서재 | 필터/정렬 | 상태와 수정일 등으로 목록을 정리한다. | Yes |
| FD-LIB-04 | 서재 | 책 열기 | 선택한 책을 Workspace로 연다. | Yes |
| FD-LIB-05 | 서재 | 책 정보 수정 | 제목·부제·저자·상태·태그·표지 정보를 수정한다. | Yes |
| FD-LIB-06 | 서재 | 복제 | 기존 책의 사본을 만든다. | Yes |
| FD-LIB-07 | 서재 | 휴지통 | 책을 복원 가능한 상태로 이동한다. | Yes |
| FD-LIB-08 | 서재 | 복원/영구삭제 | 휴지통 책을 복원하거나 완전 삭제한다. | Yes |
| FD-NEW-01 | 새 책 | 시작 방식 | 원고 가져오기 또는 빈 책 시작을 선택한다. | Yes |
| FD-IMPORT-01 | 새 책 | 파일 가져오기 | TXT/MD/PDF/DOCX 원고를 입력받는다. | Yes |
| FD-IMPORT-02 | 새 책 | 텍스트 붙여넣기 | 원고 텍스트를 직접 입력한다. | Yes |
| FD-META-01 | 새 책 | 기본정보 | 제목·부제·저자를 입력한다. | Yes |
| FD-STRUCT-01 | 새 책 | 구조 확인 | Part/Chapter/Section 구조를 확인·수정한다. | Yes |
| FD-THEME-01 | 새 책 | 디자인 선택 | Practical/Minimal 중 초기 디자인을 선택한다. | Yes |
| FD-GEN-01 | 새 책 | 책 생성 | 확정된 정보로 실제 책 파일을 생성한다. | Yes |
| FD-WS-01 | 작업공간 | Workspace | 한 책의 편집 기능을 하나의 작업 셸로 묶는다. | Yes |
| FD-EDIT-01 | 원고 | 본문 편집 | 기존 book.html 기반 본문을 편집한다. | Yes |
| FD-EDIT-02 | 원고 | 구조 편집 | 장/절 구조를 추가·수정·삭제·이동한다. | Yes |
| FD-EDIT-03 | 원고 | 저장 | 사용자 요청 시 변경 내용을 저장한다. | Yes |
| FD-EDIT-04 | 원고 | Autosave | 변경 내용을 일정 시간 후 자동 저장한다. | Yes |
| FD-EDIT-05 | 원고 | Recovery | 비정상 종료 시 로컬 복구본을 제안한다. | Yes |
| FD-DESIGN-01 | 디자인 | Theme 변경 | Practical/Minimal 디자인을 변경한다. | Yes |
| FD-DESIGN-02 | 디자인 | 세부 읽기 설정 | 본문 크기·행간·여백을 직접 조정한다. | Later |
| FD-COVER-01 | 표지 | 이미지 관리 | 표지 이미지를 추가·교체·제거한다. | Yes |
| FD-COVER-02 | 표지 | 표지 정보 | 제목·부제·저자를 편집한다. | Yes |
| FD-PREVIEW-01 | 미리보기 | Single | 한 쪽씩 미리본다. | Yes |
| FD-PREVIEW-02 | 미리보기 | Spread | 펼침면으로 미리본다. | Yes |
| FD-PREVIEW-03 | 미리보기 | Grid | 전체 페이지를 썸네일로 본다. | Yes |
| FD-EXPORT-01 | 출력 | PDF 생성 | 현재 저장된 책으로 PDF를 생성한다. | Yes |
| FD-EXPORT-02 | 출력 | 다운로드 | 생성된 PDF를 내려받는다. | Yes |
| FD-EXPORT-03 | 출력 | 재출력 | 필요하면 PDF를 다시 생성한다. | Yes |
| FD-AICOVER-01 | AI | AI 표지 | 원고 기반 AI 표지 생성 기능. | Later |
| FD-PAY-01 | 결제 | 요금/권한 | 사용량 또는 플랜 기반 접근 제어. | Later |

---

## 5. 진입 / 계정 기능

### FD-ENTRY-01 Landing

**정의**  
차곡의 브랜드와 제품 가치를 설명하고, 사용자의 다음 행동을 안내하는 진입 화면이다.

**주요 기능**
- 차곡 소개
- 핵심 제작 흐름 안내
- 새 책 만들기
- 로그인
- 로그인 상태에서는 내 서재 진입

**목표 Route**
- `/`

---

### FD-AUTH-01~04 Auth

**정의**  
사용자 계정과 브라우저 세션을 관리한다.

**MVP 범위**
- 이메일 회원가입
- 이메일 로그인
- 세션 지속
- 로그아웃
- `returnTo` 기반 복귀

**Phase 15 Boundary**
- 로그인은 구현
- Book ownership은 아직 구현하지 않음

**Phase 16**
- 사용자별 Book ownership
- 사용자별 Library
- DB metadata
- Storage boundary
- API authorization

---

## 6. Library 기능

### 목적

사용자가 생성한 책을 찾고 관리하고 다시 작업할 수 있게 하는 작업 허브다.

### 주요 기능

- 책 목록
- 검색
- 상태 필터
- 정렬
- 새 책 만들기
- 기존 책 열기
- 책 정보 수정
- 사본 만들기
- 휴지통 이동
- 복원
- 영구 삭제
- PDF 바로 받기

### 주요 객체

```text
Book Card
├─ Cover
├─ Title
├─ Author
├─ Status
├─ Tags
├─ Updated At
├─ PDF State
└─ Actions
```

---

## 7. 새 책 만들기 기능

### FD-NEW-01 시작 방식

두 가지 시작 방법을 제공한다.

```text
새 책 만들기
├─ 원고 가져오기
└─ 빈 책 시작
```

---

### FD-IMPORT-01 / 02 원고 입력

지원 방식:

- TXT
- MD
- PDF
- DOCX
- 텍스트 붙여넣기

원고 입력 단계에서는 실제 책 파일을 만들지 않는다.

---

### FD-META-01 책 기본정보

필수:
- 제목

선택:
- 부제
- 저자

---

### FD-STRUCT-01 구조 확인

사용자가 자동 분석된 구조를 확인하고 수정한다.

대상:
- Part
- Chapter
- Section

가능 동작:
- 제목 수정
- 순서 이동
- 추가
- 삭제

본문 문장 편집은 이 단계에서 하지 않는다.

---

### FD-THEME-01 초기 디자인

초기 MVP Theme:

- Practical
- Minimal

Theme은 HTML 의미 구조를 바꾸지 않는다.

---

### FD-GEN-01 책 생성

S09에서만 실제 책을 생성한다.

생성 대상:

```text
books/<book>/
├─ book.html
├─ book.css
├─ book.json
└─ source/ (필요 시)
```

S09 이전에는 destructive write를 하지 않는다.

---

## 8. Workspace 기능

### FD-WS-01 Workspace

하나의 책에 대한 작업 기능을 탭으로 제공한다.

```text
Workspace
├─ 원고
├─ 디자인
├─ 표지
└─ 미리보기
```

공통 Header:
- 내 서재
- 책 제목
- 저장 상태
- 저장
- PDF 만들기

기존 Editor / Viewer / PDF Engine을 KEEP / WRAP한다.

---

## 9. 원고 편집 기능

### FD-EDIT-01 본문 편집

- 기존 `book.html` 기반
- `data-eid` overlay 기반
- 문장/블록 수정

### FD-EDIT-02 구조 편집

- 장 추가
- 장 삭제
- 구조 변경
- 블록 동작

### FD-EDIT-03 저장

- 수동 저장
- Ctrl/Cmd+S

### FD-EDIT-04 Autosave

- 변경 후 debounce 저장
- 한 번에 한 저장 요청
- 저장 중 추가 변경은 다음 저장으로 이어짐

### FD-EDIT-05 Recovery

- local recovery
- 서버 버전과 맞는 경우 복구 제안
- stale recovery 자동 적용 금지
- 409 conflict 자동 재전송 금지

---

## 10. Design 기능

### FD-DESIGN-01 Theme

- Practical
- Minimal

적용 대상:
- `book.css`

적용 금지:
- 문장 변경
- 구조 변경
- `book.html` 의미 변경

### FD-DESIGN-02 세부 읽기 설정 — Later

현재 Workspace Design 탭은 Practical / Minimal Theme 선택·적용만 제공한다.

직접 조정 컨트롤은 Later:
- 본문 글자 크기
- 행간
- 쪽 여백

---

## 11. Cover 기능

### FD-COVER-01 이미지

- 업로드
- 교체
- 제거
- 기존 cover sidecar 사용

### FD-COVER-02 표지 정보

- 제목
- 부제
- 저자
- 배경색

본문 내용과 구조는 변경하지 않는다.

---

## 12. Preview 기능

세 가지 Preview 모드를 제공한다.

- Single
- Spread
- Grid

Paged.js 기반 기존 Viewer를 재사용한다.

새 Preview Engine을 만들지 않는다.

---

## 13. PDF 출력 기능

### FD-EXPORT-01 생성

현재 저장된 책을 기존 Chrome + Paged.js PDF 파이프라인으로 출력한다.

### FD-EXPORT-02 다운로드

생성된 PDF 다운로드.

### FD-EXPORT-03 재출력

동일 책에 대해 다시 PDF를 생성할 수 있다.

MVP에서 고급 출력 기능은 숨길 수 있으나 엔진 코드를 삭제하지 않는다.

---

## 14. Recovery 기능

### Wizard Draft Recovery

Phase 13 기준:

- 작성 중 draft 저장
- 이어서 하기
- 새로 시작
- 파일 fingerprint 확인

### Editor Recovery

Phase 14 기준:

- 변경본 로컬 저장
- Autosave
- 비정상 종료 복구
- conflict 안전 처리

---

## 15. Later 기능

### AI Cover

원고 내용 기반 표지 생성.

현재 S12 수동 표지를 대체하지 않는다.

### Pricing / Payment

계정·ownership·usage state 이후 도입한다.

현재 PDF 기능을 결제 뒤로 숨기지 않는다.

---

## 16. 기능 우선순위

### P0 — 핵심 제작 완료

- Library
- New Book
- Import
- Metadata
- Structure
- Theme
- Generation
- Workspace
- Editor
- Cover
- Preview
- PDF

### P1 — SaaS 기반

- Auth
- Ownership
- DB Metadata
- Storage
- Deployment

### P2 — AI / Monetization

- AI manuscript assist
- AI Cover
- Usage control
- Payment

---

## 17. 기능 의존 관계

```text
Landing
   ↓
Auth
   ↓
Library
   ↓
New Book
   ↓
Import / Metadata / Structure / Theme
   ↓
Generation
   ↓
Workspace
   ├─ Editor
   ├─ Design
   ├─ Cover
   └─ Preview
        ↓
      PDF
```

SaaS 확장:

```text
Auth
 ↓
Ownership
 ↓
DB / Storage
 ↓
Deployment
 ↓
AI
 ↓
Payment
```

---

## 18. 현재 구현 상태 요약

| 영역 | 상태 |
|---|---|
| Library | 구현됨 |
| New Book Wizard | 구현됨 |
| Import | 구현됨 |
| Structure | 구현됨 |
| Theme | 구현됨 |
| Generation | 구현됨 |
| Workspace | 구현됨 |
| Cover | 구현됨 |
| Preview | 구현됨 |
| PDF | 구현됨 |
| Wizard Recovery | 구현됨 |
| Editor Autosave / Recovery | 구현됨 |
| Auth Foundation | Phase 15 진행 중 |
| Landing | Phase 15 Entry Routing과 함께 보완 필요 |
| User Ownership | Phase 16 |
| Cloud Storage | Phase 16 |
| AI Cover | Later |
| Payment | Later |

---

## 19. DO NOT BREAK

- `book.html` = Content Source of Truth
- 기존 Editor
- 기존 Viewer
- Paged.js
- PDF Engine
- 보호 책
- Theme contract
- Cover sidecar
- Wizard Recovery
- Editor Recovery
- 역사적 QA / Audit 기록

---

## 20. 상세 기능명세 연결

본 문서의 기능을 실제 개발 조건까지 내려가면 `_docs/FUNCTION_SPEC.md`를 기준으로 한다.

예:

```text
FUNCTION_DEFINITION
FD-LIB-01 책 목록
        ↓
FUNCTION_SPEC
F-LIB-01 Book 목록
        ↓
SCREEN_SPEC
S03 Library
        ↓
API / DATA / ENGINE
구현 계약
```

차곡의 기능 문서 기준은 다음 순서를 사용한다.

```text
Product Spec
→ IA
→ Task Flow
→ Function Definition
→ Function Specification
→ Screen Specification
→ API / Data / Engine
→ QA
```
