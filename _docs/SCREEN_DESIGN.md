# 차곡 화면설계서 (Screen Design)

- Product: 차곡 (Chagok)
- Document: Screen Design
- Version: 1.0
- Status: CURRENT / IMPLEMENTATION BASELINE
- Updated: 2026-10-16
- Related: `_docs/IA.md`, `_docs/TASK_FLOW.md`, `_docs/FUNCTION_DEFINITION.md`, `_docs/FUNCTION_SPEC.md`, `_docs/SCREEN_SPEC.md`
- Scope: S01~S16
- Note: `SCREEN_SPEC.md`가 화면의 목적/상태/CTA 계약을 정의한다면, 본 문서는 실제 화면 배치와 사용자 인터랙션 구조를 정의한다.

---

## 1. 화면설계 원칙

1. 한 화면의 Primary CTA는 하나를 우선한다.
2. 현재 구현된 Library / Workspace / Preview / PDF 엔진은 KEEP / WRAP한다.
3. 새 책 생성 Wizard는 단계형으로 제공한다.
4. S09 이전에는 실제 책 폴더를 생성하지 않는다.
5. 저장 상태는 명확히 노출한다.
6. 로딩은 실제 작업 단계 문구로 표시하고 가짜 %는 사용하지 않는다.
7. 비로그인 사용자는 Landing에서 시작한다.
8. `/` = Landing, `/library` = Library를 기준으로 한다.
9. Desktop 우선, Mobile은 기능 삭제 없이 세로 재배치한다.

---

# 2. Global Layout

## Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ Brand / Context                         Actions / Account    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                      Main Content                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Mobile

```text
┌──────────────────────┐
│ Header               │
│ Brand        Account │
├──────────────────────┤
│ Main Content         │
│                      │
│                      │
├──────────────────────┤
│ Context CTA          │
└──────────────────────┘
```

---

# 3. S01 Landing

## 목적

차곡이 무엇인지 이해시키고 사용자가 책 만들기 또는 서재로 진입하게 한다.

## URL

`/`

## Desktop Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 차곡                         [로그인] [새 책 만들기]         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│          원고가 책이 되는 과정, 차곡                         │
│                                                              │
│   원고를 넣으면 구조 · 디자인 · 표지 · PDF까지               │
│   한 흐름으로 완성합니다.                                    │
│                                                              │
│          [ 새 책 만들기 ]   [ 내 서재 ]                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  원고  →  구조  →  디자인  →  표지  →  PDF                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Product Preview Area                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Footer                                                       │
└──────────────────────────────────────────────────────────────┘
```

## 비로그인

- Header: 로그인 / 새 책 만들기
- Primary: 새 책 만들기
- Secondary: 로그인

## 로그인

- Header: 내 서재 / 새 책 만들기
- Primary: 새 책 만들기
- Secondary: 내 서재

## 주요 Interaction

- 새 책 만들기
  - 비로그인 → `/__auth?returnTo=/__wizard`
  - 로그인 → `/__wizard`
- 로그인 → `/__auth?returnTo=/library`
- 내 서재 → `/library`

## 상태

- DEFAULT
- AUTH_CHECKING
- AUTHENTICATED
- AUTH_ERROR

---

# 4. S02 Auth

## URL

`/__auth`

## Wireframe

```text
┌────────────────────────────────────────┐
│ 차곡                      [← 돌아가기] │
│                                        │
│ 로그인                                 │
│ 계정으로 내 책 작업을 이어가세요.      │
│                                        │
│ [ 로그인 ] [ 회원가입 ]                │
│                                        │
│ 이메일                                 │
│ [____________________________]         │
│                                        │
│ 비밀번호                               │
│ [____________________________]         │
│                                        │
│ [          로그인           ]          │
│                                        │
│ 상태 / 오류 메시지                     │
└────────────────────────────────────────┘
```

## Component

- Brand
- Login Tab
- Signup Tab
- Email Input
- Password Input
- Submit Button
- Message
- Back Link

## Navigation

- 성공: `returnTo`
- returnTo 없음: `/library`
- 잘못된 외부 URL: `/library`

## 상태

- DEFAULT
- SUBMITTING
- SUCCESS
- ERROR
- ALREADY_AUTHENTICATED

---

# 5. S03 Library

## URL

`/library`

## Desktop Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 차곡 / 내 서재                                               │
│ [검색________________] [+ 새 책 만들기] [email] [로그아웃]   │
├──────────────────────────────────────────────────────────────┤
│ [전체] [초안] [검토 중] [완료]        [최근 수정순 ▼] [휴지통]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │ Cover  │  │ Cover  │  │ Cover  │  │   +    │            │
│  │        │  │        │  │        │  │ 새 책  │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│   제목          제목          제목                            │
│   저자/상태      저자/상태      저자/상태                    │
│   [열기] [PDF]   [열기] [PDF]   [열기] [PDF]                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Book Card

```text
┌───────────────┐
│        ⋯      │
│     COVER     │
│               │
├───────────────┤
│ 제목          │
│ 상태 · 저자   │
│ 수정일        │
│ tags          │
│ PDF 상태      │
│ [열기] [PDF]  │
└───────────────┘
```

## More Menu

- 책 정보·표지 편집
- 사본 만들기
- 휴지통으로 이동

## 상태

- DEFAULT
- EMPTY
- SEARCH_EMPTY
- LOADING
- ERROR

## Mobile

- Search full width
- Filter horizontal scroll
- Card 1~2열
- Account email 축약 또는 숨김

---

# 6. S04 New Book Method

## URL

`/__wizard`

## Wireframe

```text
┌──────────────────────────────────────────────┐
│ 차곡                              [취소]     │
│                                              │
│ 새 책을 어떻게 시작할까요?                  │
│                                              │
│ ┌────────────────────┐  ┌──────────────────┐ │
│ │ 원고 가져오기      │  │ 빈 책으로 시작   │ │
│ │ TXT / MD / PDF /   │  │ 제목부터 만들기  │ │
│ │ DOCX / 붙여넣기    │  │                  │ │
│ └────────────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────┘
```

## Primary

선택한 카드

## Navigation

- Import → S05
- Empty → S06
- 취소 → `/library`

---

# 7. S05 Manuscript Input

## Wireframe

```text
┌──────────────────────────────────────────────┐
│ ← 뒤로                 원고 가져오기         │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 파일을 끌어다 놓거나 선택하세요         │ │
│ │ TXT · MD · PDF · DOCX                    │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ 또는                                         │
│                                              │
│ [ 원고를 여기에 붙여넣기                  ] │
│ [                                          ] │
│ [                                          ] │
│                                              │
│ 파일 정보 / 분석 결과 요약                  │
│                                [ 다음 ]      │
└──────────────────────────────────────────────┘
```

## 상태

- DEFAULT
- FILE_SELECTED
- PARSING
- PARSE_SUCCESS
- ERROR
- DISABLED

## Error

- 미지원 파일
- 빈 원고
- 스캔 PDF
- 50MB 초과

---

# 8. S06 Book Metadata

## Wireframe

```text
┌──────────────────────────────────────────┐
│ ← 뒤로                책 기본정보        │
│                                          │
│ 제목 *                                   │
│ [____________________________]           │
│                                          │
│ 부제                                     │
│ [____________________________]           │
│                                          │
│ 저자                                     │
│ [____________________________]           │
│                                          │
│                               [ 다음 ]   │
└──────────────────────────────────────────┘
```

## Validation

- 제목 필수
- 공백만 입력 불가

---

# 9. S07 Structure Review

## Desktop Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ ← 뒤로                      원고 구조 확인                    │
├───────────────────────┬──────────────────────────────────────┤
│ 구조 Tree             │ 선택 항목                            │
│                       │                                      │
│ Part 1                │ 제목                                 │
│ ├ Chapter 1           │ [____________________________]       │
│ │ ├ Section 1         │                                      │
│ │ └ Section 2         │ [위로] [아래로] [추가] [삭제]        │
│ └ Chapter 2           │                                      │
│                       │                                      │
├───────────────────────┴──────────────────────────────────────┤
│ 3장 · 8섹션              [원고 다시 선택] [구조 확정]        │
└──────────────────────────────────────────────────────────────┘
```

## Mobile

- Tree → 상단 Accordion
- 선택 항목 편집 → 하단 Detail

## 상태

- DEFAULT
- EMPTY
- ERROR
- DISABLED

---

# 10. S08 Theme Selection

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ ← 뒤로                     디자인 선택                       │
│                                                              │
│ ┌─────────────────────┐  ┌─────────────────────┐             │
│ │ Practical           │  │ Minimal             │             │
│ │ [Preview]           │  │ [Preview]           │             │
│ │ 정보 구조가 명확함  │  │ 여백 중심           │             │
│ └─────────────────────┘  └─────────────────────┘             │
│                                                              │
│                                       [ 이 디자인으로 만들기 ]│
└──────────────────────────────────────────────────────────────┘
```

## 상태

- DEFAULT
- SELECTED
- PREVIEW_LOADING
- PREVIEW_ERROR

---

# 11. S09 Book Generation

## Wireframe

```text
┌──────────────────────────────────────────────┐
│              책을 만들고 있어요              │
│                                              │
│ ✓ 원고 확인                                  │
│ ✓ 책 틀 준비                                 │
│ ● 구조 반영 중                               │
│ ○ 책 정보 반영                               │
│ ○ 디자인 적용                                │
│                                              │
│ 잠시만 기다려 주세요.                        │
└──────────────────────────────────────────────┘
```

## Error

```text
책을 만들지 못했습니다.

[ 다시 시도 ]  [ 이전 단계 ]  [ 내 서재 ]
```

## 원칙

- 가짜 %
- ghost folder 금지

---

# 12. S10 Workspace — Manuscript

## Desktop Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ ← 내 서재    책 제목       저장됨        [저장] [PDF 만들기] │
├──────────────────────────────────────────────────────────────┤
│ [원고] [디자인] [표지] [미리보기]                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                  Existing Editor                             │
│                                                              │
│            book.html / data-eid 기반 편집                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Header State

- 저장됨
- 저장 중
- 저장 실패
- 충돌
- 미저장

## Navigation

- 내 서재 → `/library`
- PDF → S15
- Tab → S11 / S12 / S14

---

# 13. S11 Design

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ Design                                                       │
│                                                              │
│ [ Practical ]   [ Minimal ]                                  │
│                                                              │
│                         Preview                              │
│                                                              │
│                           [ 이 디자인 적용 ]                  │
└──────────────────────────────────────────────────────────────┘
```

## 규칙

- 현재 구현 범위는 Practical / Minimal Theme 선택·적용
- CSS Theme layer만 변경
- HTML 의미 구조 변경 금지
- 본문 글자 크기·행간·쪽 여백 직접 조절 UI는 Later

---

# 14. S12 Cover

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ 표지                                                         │
│                                                              │
│ ┌────────────────────┐   제목 [________________________]     │
│ │                    │   부제 [________________________]     │
│ │    Cover Preview   │   저자 [________________________]     │
│ │                    │                                      │
│ └────────────────────┘   배경색 ○ ○ ○ ○ ○                   │
│                                                              │
│ [이미지 올리기] [이미지 빼기]      [ 표지 문구 저장 ]        │
└──────────────────────────────────────────────────────────────┘
```

## 상태

- NO_IMAGE
- DEFAULT
- UNSAVED
- SAVING
- SUCCESS
- ERROR

---

# 15. S13 AI Cover — Later

## 예정 구조

```text
원고 분석
→ Cover Concept 3개
→ 이미지 생성
→ 선택
→ S12 표지로 적용
```

기존 수동 표지를 대체하지 않는다.

---

# 16. S14 Preview

## Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ [Single] [Spread] [Grid]                   12 / 168           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                       Preview                                │
│                                                              │
│                    Paged.js Viewer                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Mode

- Single
- Spread
- Grid

## 상태

- LOADING
- READY
- ERROR

---

# 17. S15 PDF Export

## Wireframe

```text
┌──────────────────────────────────────────────┐
│ 전자책 PDF 만들기                            │
│                                              │
│ 현재 저장된 책으로 PDF를 만듭니다.           │
│                                              │
│ [       전자책 PDF 만들기        ]           │
│                                              │
│ 상태: 준비됨                                 │
└──────────────────────────────────────────────┘
```

## Loading

```text
PDF 만드는 중...
```

고급 Export 옵션은 MVP에서 숨긴다.

---

# 18. S16 Export Complete

## Wireframe

```text
┌──────────────────────────────────────────────┐
│               PDF 완성                       │
│                                              │
│ 내 포트폴리오, AI로 직접 만들기.pdf          │
│                                              │
│ [ PDF 다운로드 ]                             │
│ [ 책으로 돌아가기 ]                          │
│ [ 다시 만들기 ]                              │
│                                              │
│ 내 서재                                      │
└──────────────────────────────────────────────┘
```

---

# 19. Modal / Overlay 설계

## 책 정보 Modal

```text
┌──────────────────────────────────────┐
│ 책 정보                              │
│ 제목                                 │
│ 부제                                 │
│ 저자                                 │
│ 상태                                 │
│ 태그                                 │
│ 표지 이미지                          │
│ 표지 색                              │
│                                      │
│ [취소] [저장]                        │
└──────────────────────────────────────┘
```

## 휴지통 Modal

```text
┌──────────────────────────────────────┐
│ 휴지통                               │
│ 책 A             [복원] [영구 삭제] │
│ 책 B             [복원] [영구 삭제] │
│                                      │
│ [닫기]                               │
└──────────────────────────────────────┘
```

## Recovery Dialog

```text
작성 중이던 책이 있습니다.

[ 이어서 하기 ]
[ 새로 시작 ]
```

---

# 20. 공통 상태 설계

| State | 표현 |
|---|---|
| DEFAULT | 기본 화면 |
| LOADING | 실제 작업명 표시 |
| EMPTY | 다음 행동 CTA 제공 |
| ERROR | 원인 + 재시도 |
| SUCCESS | 완료 + 다음 행동 |
| DISABLED | 조건 미충족 |
| UNSAVED | 저장 필요 표시 |
| SAVING | 저장 중 |
| CONFLICT | 자동 저장 중지 + 사용자 확인 |

---

# 21. Responsive Rules

## Desktop ≥ 1024

- Library: 4~6 columns auto grid
- Structure: 2-pane
- Workspace: full toolbar + tabs
- Cover: Preview + Form 2-column

## Tablet 768~1023

- Library: 3 columns
- Structure: 40/60 split
- Cover: 40/60 split

## Mobile < 768

- Library: 1~2 columns
- Header actions wrapping
- Structure Tree / Detail vertical
- Cover Preview above Form
- Workspace tabs horizontal scroll
- PDF CTA fixed bottom 가능
- 기능 삭제 금지

---

# 22. 접근성 기준

- 버튼/링크 명확한 accessible name
- Tab은 role / aria-selected 사용
- Dialog는 focus trap 또는 native dialog
- Form label 연결
- Error는 role=alert 또는 status
- 색만으로 상태 구분 금지
- 키보드 Save 유지
- 최소 터치 영역 40px 이상 권장

---

# 23. Route / Screen Mapping

| Screen | Route | Primary CTA |
|---|---|---|
| S01 | `/` | 새 책 만들기 |
| S02 | `/__auth` | 로그인/계정 만들기 |
| S03 | `/library` | 새 책 만들기 |
| S04 | `/__wizard` | 시작 방식 선택 |
| S05 | Wizard | 다음 |
| S06 | Wizard | 다음 |
| S07 | Wizard | 구조 확정 |
| S08 | Wizard | 디자인으로 만들기 |
| S09 | Wizard | 자동 진행 |
| S10 | `/__workspace` | 저장/PDF |
| S11 | Workspace Tab | 디자인 적용 |
| S12 | Workspace Tab | 표지 저장 |
| S14 | Workspace Tab | PDF |
| S15 | Workspace Flow | PDF 만들기 |
| S16 | Workspace State | 다운로드 |

---

# 24. Phase 15 화면 영향

Phase 15에서 화면설계 기준으로 필요한 변경:

1. S01 Landing 신규 추가
2. 기존 Library를 `/library` 로 이동
3. Auth 완료 후 `returnTo` 처리
4. Workspace "내 서재" 링크 → `/library`
5. Wizard 취소/복귀 → `/library`
6. Logout → `/`
7. 로그인 상태에 따라 Landing CTA 변경

Phase 15에서는 다음을 하지 않는다.

- Book ownership
- DB
- Storage
- Payment
- AI Cover

---

# 25. DO NOT BREAK

- 기존 Library 기능
- 기존 Editor
- 기존 Viewer
- Paged.js
- PDF engine
- `book.html` Content SoT
- Wizard Recovery
- Editor Autosave / Recovery
- 보호 책
- `books/서아의/`
- Theme / Cover contracts

---

# 26. 문서 연결

```text
Product Spec
   ↓
IA
   ↓
Task Flow
   ↓
Function Definition
   ↓
Function Specification
   ↓
Screen Design
   ↓
Screen Specification
   ↓
API / Data / Engine
   ↓
QA
```

화면 구현 시 본 문서의 Layout을 기준으로 하고,
기능 동작 조건은 `FUNCTION_SPEC.md`,
화면 상태/CTA 계약은 `SCREEN_SPEC.md`를 함께 따른다.
