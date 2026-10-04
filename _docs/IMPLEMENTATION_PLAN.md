# My Chapter Implementation Plan

- Product: My Chapter
- Stage: Implementation Planning
- Version: 1.0
- Date: 2026-10-03
- Basis: Product Spec v1.3, FUNCTION_SPEC, SCREEN_SPEC, ENGINE_CONTRACT, DATA_SPEC, API_SPEC, QA_ACCEPTANCE, M0.5-A/B
- Status: 계획만. 이 문서 작성 시점에 코드는 바꾸지 않는다.

MVP를 **작은 개발 단위**로 쪼갠다. 한 Phase가 QA를 통과하기 전에 다음 Phase로 가지 않는다.

---

## 0. Planning Principles

1. Existing Engine = KEEP / WRAP. `REPLACE` 대상 엔진 없음.
2. Editor / Viewer / Paged.js / PDF = DO NOT REPLACE.
3. Content SoT = `book.html`. Structured Book JSON = NOT NOW.
4. 한 Phase에 기능 묶음을 넣지 않는다. Shell → parse → session → write 순.
5. Phase QA 통과 후 STOP. 실패 시 다음 Phase 금지.
6. `books/내 포트폴리오, AI로 직접 만들기` 원본 수정 금지.
7. 순서는 dependency. 권장 10단계를 그대로 한 덩어리로 구현하지 않는다.
8. Auth / AI Cover / Payment / Auto Save / History 제품 UI / Print / EPUB / ZIP = 이 계획에서 제외 (LATER).
9. Identity = `file` 경로. `book.json` 필수화 금지. `themeId` 스키마를 선행하지 않음.
10. React / Vite / Supabase / 새 Backend 프레임워크 = NOT USED.

권장 흐름(S04–S09 Wizard 전체)은 **여러 Phase로 분해**한다. 첫 구현은 Shell / routing만.

---

## 1. Dependency Order (Adjusted)

```text
Phase 0  Baseline / Regression 보호
   ↓
Phase 1  Wizard Entry Shell     S03 → S04, 취소, create 없음     ← 첫 구현
   ↓
Phase 2  Wizard Step Shells     S05 / S06 UI + 세션, parse/write 없음
   ↓
Phase 3  parse-only             API-IMPORT-02, importManuscript 재사용
   ↓
Phase 4  Structure Review       S07 클라 세션. 서버 API-STRUCT-02 만들지 않음
   ↓
Phase 5  Theme Selection        S08 선택만 (CSS 토큰 엔진은 Phase 8)
   ↓
Phase 6  Final Generation       S09, /__new-book WRAP, 첫 write
   ↓
Phase 7  Workspace Shell        S10 탭 WRAP. Editor 재작성 없음
   ↓
Phase 8  Theme CSS Tokens       S08 Preview + S11 적용. HTML 불변
   ↓
Phase 9  Cover / Image          S12, 기존 sidecar
   ↓
Phase 10 Preview / PDF          S14 / S15 WRAP
   ↓
Phase 11 Export Complete        S16
   ↓
Phase 12 Full Regression        Release Gate
```

조정 이유:

- 권장 Phase 1(S04–S09 전부)은 한 단계에 Import·구조·테마·생성이 섞인다 → 분해.
- parse-only가 S07보다 앞선다. 구조 UI는 파서 출력이 있어야 한다.
- Theme **선택**은 생성 전에 세션에 둔다. Theme **CSS 엔진**은 생성 이후여도 된다. Phase 6는 Template CSS(Practical)로 책을 만들어도 된다.
- Workspace는 기존 책 열기와 독립이나, 생성 직후 착지점이므로 Phase 6 다음.
- Cover / Preview / PDF는 이미 CURRENT. Product 셸에 연결만 한다.

제외: S01, S02, S13, S17, F-EDITOR-09, F-AICOVER-01, F-AUTH-01, F-PAY-01, F-HIST 제품 UI.

---

## 2. Global File Rules

### Never touch (모든 Phase)

- `books/내 포트폴리오, AI로 직접 만들기/book.html`
- `books/내 포트폴리오, AI로 직접 만들기/book.css`
- `_shared/paged.polyfill.js`
- `_shared/paged_book_viewer.js` (Phase 10에서 WRAP만. 엔진 재작성 금지)
- `_shared/book_editor.js` (Phase 7에서 셸만. 내부 재작성 금지)
- `server/pdf.mjs` 파이프라인 교체
- `server/htmltree.mjs` / `server/editable.mjs` SoT화
- 기존 명세 파일 (`MY_CHAPTER_PRODUCT_SPEC.md`, `_docs/*` Audit/Spec) — 구현 Phase가 명세를 고치지 않음
- React / Vite / Supabase 도입 파일

### Engine KEEP (호출만, 리팩터 금지)

- `manuscript-import.mjs` — parse 재사용. 포맷 세트 유지 (TXT/MD/PDF/DOCX)
- `server/books.mjs` `create` — Phase 6에서 **optional 입력만** 확장 가능. 기존 source 경로 삭제 금지
- `POST /__new-book` — 제품은 S09에서만 호출. Route 삭제 금지
- `POST /__edit` `/__blocks` `/__structure` `/__state` `GET /__pdf` — KEEP
- `_template/book.html` — 골격 KEEP. Phase 6가 복사 원본

### Product UI 후보 (Phase가 허용할 때만)

- `_shared/library.html` — 새 책 버튼 WRAP
- `_shared/wizard.html` / `wizard.js` / `wizard.css` — 신규 허용 (Phase 1+)
- `_shared/workspace.html` 또는 library/book 셸 — Phase 7
- `preview-server.mjs` — 정적 서빙·parse-only Route 추가만. 기존 Route 동작 유지

---

## Phase 0 — Baseline / Regression Guard

### Goal

구현 전에 현재 엔진과 168쪽 원본이 살아 있음을 고정한다. 제품 기능은 넣지 않는다.

### Why Now

이후 WRAP이 기존 책을 깨면 원인 분리가 안 된다. Baseline이 있어야 Phase 1+를 되돌릴 수 있다.

### Screens

S03, S10(기존 책 HTML), S14, S15 — **현재 엔진 화면**. 새 화면 없음.

### Functions

F-LIB-01, F-LIB-02, F-PREVIEW-01..03, F-EXPORT-01 (CURRENT 확인만)

### APIs

API-BOOK-01, API-BOOK-11, API-EXPORT-01 — 호출만. 변경 없음.

### Existing Files to Reuse

- `_shared/library.html`
- `preview-server.mjs`
- `books/내 포트폴리오, AI로 직접 만들기/` (읽기)

### Files Allowed to Change

없음. (선택: 워크스페이스 **밖** 또는 `_docs/REGRESSION_BASELINE.md`에 해시 기록. 책 폴더에 쓰지 말 것)

### New Files Allowed

`_docs/REGRESSION_BASELINE.md` (해시·쪽 수 기록용, 선택)

### Implementation Tasks

1. `book.html` / `book.css` 해시 기록 (설계본).
2. 서재에서 설계본 카드 확인 (`book.json` 없어도 목록).
3. 열기 → Single / Spread / Grid 수동 확인.
4. (환경 되면) `GET /__pdf?file=` 160+ 쪽. HTML 해시 재확인.
5. 제품 코드 커밋 없음.

### DO NOT TOUCH

설계본 파일, Editor, Viewer, 모든 Route, `library.html`.

### QA Required

- QA-LIB-01
- QA-REGRESSION-01
- QA-REGRESSION-02
- QA-REGRESSION-05 (이 Phase 전후 해시)
- (가능 시) QA-REGRESSION-04

### Completion Criteria

설계본이 열리고 세 모드가 동작한다. 원본 해시 불변. 코드 diff 없음(또는 baseline 문서만).

### STOP CONDITION

해시가 바뀌었거나 열기/모드가 실패하면 Phase 1 금지. 원인 = 이 Phase가 아님(환경). 기록 후 중단.

### Rollback / Failure Note

변경 파일이 없으므로 rollback은 해시 재기록. 설계본을 “고치려” 하지 말 것.

---

## Phase 1 — Creation Wizard Entry Shell

### Goal

S03 “새 책 만들기”가 `#new-dialog` + `/__new-book` 대신 **S04로만** 간다. 취소하면 서재. **create 호출 없음.**

### Why Now

이후 S05–S09를 붙여도 진입이 즉시 write면 제품 규칙을 깨다. 가장 작은 경계부터 막는다.

### Screens

S03 (버튼 WRAP), S04 (신규, 방식 선택만)

### Functions

F-LIB-03, F-NEW-01 (선택 UI까지). F-NEW-02의 **생성**은 아직 아님.

### APIs

없음. API-BOOK-03 **호출 금지**.

### Existing Files to Reuse

- `_shared/library.html` (`#open-new`, `#new-tile`)
- 기존 서재 목록/검색/열기 (그대로)

### Files Allowed to Change

- `_shared/library.html` — 새 책 클릭만 S04로. 목록/복제/휴지통 로직 최소 변경
- `preview-server.mjs` — wizard HTML 정적 서빙이 필요할 때만. 기존 Route 동작 유지

### New Files Allowed

- `_shared/wizard.html`
- `_shared/wizard.js`
- `_shared/wizard.css` (최소)

S04 한 화면 + 세션 `method`만.

### Implementation Tasks

1. `#open-new` / `#new-tile`이 `#new-dialog.showModal()` 대신 S04로 이동.
2. S04: 빈 책 / 원고 Import 카드. 미선택 시 Primary DISABLED.
3. 취소 → S03. `books/` 신규 폴더 0.
4. Import 선택 후 “계속”은 **다음 Phase 자리**만. 이 Phase에서 S05 구현·parse·create 금지. (계속을 DISABLED로 두거나, S05 placeholder로 가되 파일/API 없이 “준비 중” + 뒤로/취소만 허용. **권장: 계속은 선택 표시만, S05 본문은 Phase 2.**)
5. `#new-dialog`의 `/__new-book` submit을 제품 Primary에서 제거. dialog 코드 삭제는 필수 아님. **숨기거나 연결 해제.**
6. `POST /__new-book` Route는 엔진에 남긴다.

권장 범위 확정: **S04에서 방식 선택 + 취소만. Primary “계속”은 Phase 2가 S05/S06를 열 때까지 DISABLED.**

### DO NOT TOUCH

- `server/books.mjs`, `manuscript-import.mjs`
- `book_editor.js`, Viewer, PDF
- 설계본
- `/__new-book` 핸들러 삭제
- 복제/휴지통/검색

### QA Required

- QA-LIB-03
- QA-NEW-01 (선택 + DISABLED. empty→S06 / import→S05 이동은 Phase 2)
- QA-NEW-02 (S04 취소)
- QA-LOSS-01 일부 (S04에서 write 없음)

### Completion Criteria

새 책 → S04. 취소 → S03. `books/` unchanged. Network에 `/__new-book` 없음. 기존 책 열기/목록 유지.

### STOP CONDITION

위 QA 통과 후 멈춘다. S05 업로드, parse, 메타 폼, 생성을 이어서 넣지 않는다.

### Rollback / Failure Note

`library.html`에서 `#open-new`를 다시 dialog로. 새 wizard 파일 미사용. 부분 폴더가 생겼으면 테스트 폴더만 삭제. 설계본 금지.

---

## Phase 2 — Wizard Step Shells (S05 / S06)

### Goal

마법사 이동만 완성한다. Import → S05, empty → S06. 뒤로/취소. 세션에 파일/텍스트/메타를 **메모리만** 둔다. parse Route 없음. write 없음.

### Why Now

parse-only를 붙이려면 업로드 UI와 세션 자리가 먼저 있어야 한다. 아직 디스크를 열 이유가 없다.

### Screens

S04 (계속 활성화), S05 (입력 UI), S06 (제목 폼)

### Functions

F-NEW-01, F-NEW-02(경로만), F-IMPORT-01, F-IMPORT-02, F-IMPORT-03 (클라 확장자), F-META-01..03 (세션)

### APIs

없음. API-IMPORT-02 아직. API-BOOK-03 금지.

### Existing Files to Reuse

- `library.html` accept 목록 문구: `.txt .md .markdown .pdf .docx`
- `#new-dialog` 제목/부제/저자 필드 라벨 (복사)

### Files Allowed to Change

- `_shared/wizard.html` / `wizard.js` / `wizard.css`
- `_shared/library.html` — 진입만, 필요 시

### New Files Allowed

세션 모듈 `_shared/wizard_session.js` (메모리). 서버 세션 스토어 금지.

### Implementation Tasks

1. S04 Import → S05. Empty → S06.
2. S05: dropzone, file input, textarea, 형식 칩. 마지막 입력 우선.
3. 클라에서 미지원 확장자 거부 (QA-IMPORT-06 일부). 서버 parse 호출 없음.
4. S06: 제목 필수, 부제/저자 선택. Primary는 제목 있을 때. **다음 화면(S07/S08)은 Phase 4–5. 이 Phase에서 다음 = DISABLED 또는 막힌 placeholder.**
5. 취소 = 세션 폐기 + S03. `books/` / `source/` 0.
6. 뒤로 = 직전 화면. 세션 유지.

### DO NOT TOUCH

`manuscript-import.mjs`, `books.create`, `/__new-book`, Editor, 설계본.

### QA Required

- QA-NEW-01 (이동 포함)
- QA-NEW-02 (S05/S06 취소)
- QA-META-01, QA-META-04
- QA-IMPORT-06 (클라)
- QA-IMPORT-09 / QA-STRUCT-08 / QA-LOSS-01 (이 구간 write 없음)
- QA-LIB-01 (회귀)

### Completion Criteria

empty/import 분기. 메타/파일이 세션에만 있음. `/__new-book`·파서 미호출. 제목 없으면 다음 불가.

### STOP CONDITION

S07 트리, parse API, Theme, 생성을 넣지 않는다.

### Rollback / Failure Note

wizard.js에서 S05/S06 라우팅 제거. Phase 1 S04만 남김.

---

## Phase 3 — parse-only

### Goal

S05가 원고를 **파싱만** 한다. 디스크에 Book/`source/`를 만들지 않는다.

### Why Now

S07은 파서 출력에 의존한다. 지금 create에 붙어 있는 Import를 그대로 쓰면 write가 생긴다.

### Screens

S05 (LOADING/ERROR/SUCCESS), 성공 후 S06이 비어 있으면 S06, 메타 있으면 다음 Phase의 S07로 넘길 준비만

### Functions

F-IMPORT-04, F-IMPORT-07, F-IMPORT-03

### APIs

API-IMPORT-02 TARGET. 후보 Path: `POST /__parse` (구현 시 확정).  
Request: `{ name, data }` 또는 `{ text }`.  
Response: parser units/stats (스키마는 `importManuscript` 출력에 맞춤).  
Persistence: 없음.

API-BOOK-03 호출 금지.

### Existing Files to Reuse

- `manuscript-import.mjs` `importManuscript` / `manuscriptText`
- 기존 오류 문자열 (미지원, 본문 없음, 스캔 PDF)

### Files Allowed to Change

- `preview-server.mjs` — Route **추가만**. 기존 핸들러 동작 유지
- `manuscript-import.mjs` — export를 재사용하기 위한 **최소** 분리만. 파서 규칙/포맷 변경 금지
- `_shared/wizard.js` — parse 호출, 세션에 결과 저장

### New Files Allowed

없음 권장. 필요 시 `server/parse.mjs`가 `importManuscript`를 wrap (write 0).

### Implementation Tasks

1. parse-only 핸들러: 파싱 → JSON. `ws.write` / `books.create` / `source/` 없음.
2. S05 성공 → 세션 `parseResult`. “다음” 활성화.
3. 실패 → 기존 메시지. 재시도. 폴더 없음.
4. 붙여넣기는 `{ text }`로 동일 파서.
5. 기존 `POST /__new-book` + source 경로는 **그대로** (엔진 CURRENT). 제품 S05는 쓰지 않음.

### DO NOT TOUCH

`create()`의 즉시 write 의미. 설계본. Editor. 새 JSON Content Model.

### QA Required

- QA-IMPORT-01 TXT
- QA-IMPORT-02 MD
- QA-IMPORT-03 PDF
- QA-IMPORT-04 DOCX
- QA-IMPORT-05 붙여넣기
- QA-IMPORT-07 본문 없음
- QA-IMPORT-08 스캔 PDF
- QA-IMPORT-09
- QA-LOSS-01

### Completion Criteria

네 형식 파싱 성공 시 세션만 갱신. `books/` diff 0. create 미호출.

### STOP CONDITION

S07 편집 UI, 생성, Theme CSS를 넣지 않는다.

### Rollback / Failure Note

새 Route 제거. wizard를 Phase 2 상태로. create는 원래대로.

---

## Phase 4 — Structure Review Session

### Goal

S07에서 Part / Chapter / Section을 보고 고친다. **클라 세션만.** 서버 `API-STRUCT-02` Route를 만들지 않는다. write 없음.

### Why Now

생성 입력이 “원본 파서 결과”가 아니라 “사용자가 확정한 트리”여야 한다. 열린 책 `structureOp`와 섞으면 디스크를 건드린다.

### Screens

S07. 확정 CTA → S08은 Phase 5. 이 Phase에서 Primary는 세션 `confirmed`만 하거나 S08 placeholder.

권장: 확정 → 세션 잠금. S08 화면은 Phase 5. Phase 4 완료 조건은 트리 CRUD + 확정 시 write 없음.

### Functions

F-STRUCT-01..06, F-IMPORT-06

### APIs

API-STRUCT-02 = **클라 세션**. `POST /__structure` (API-STRUCT-01) 사용 금지.

### Existing Files to Reuse

- Phase 3 `parseResult` 형태
- 표시 단위 정의 (FUNCTION_SPEC §8)

### Files Allowed to Change

- `_shared/wizard.js` / `wizard.html` / `wizard_session.js`

### New Files Allowed

`_shared/structure_session.js` (트리 조작, 디스크 IO 없음)

### Implementation Tasks

1. 트리 표시 + 통계.
2. 제목 수정, 순서, 추가, 삭제. 마지막 장 삭제 거부. 부 삭제 시 장 유지.
3. 원고 다시 선택 → S05. 파싱 결과 폐기. 메타 유지 가능.
4. Primary “이 구조로 책 만들기” → 세션 잠금. **`/__new-book` 금지.**
5. 본문 문단 편집 없음.

### DO NOT TOUCH

`server/toc.mjs` `structureOp`, `book.html` 생성, API-STRUCT-01, 설계본.

### QA Required

- QA-STRUCT-01..07
- QA-STRUCT-08
- QA-LOSS-01

### Completion Criteria

S07 CRUD가 메모리에만 있다. CTA 후 서재에 카드 없음. 원본 원고 파일 불변.

### STOP CONDITION

S09 생성, Theme CSS, Editor를 열지 않는다.

### Rollback / Failure Note

S07 화면 제거. parse 세션만 유지.

---

## Phase 5 — Theme Selection Session

### Goal

S08에서 Practical / Minimal을 **고른다.** CSS Token 엔진·`book.css` write는 Phase 8. 기본값 Practical.

### Why Now

마법사 경로상 생성 전에 선택이 필요하다. 토큰 시스템을 여기서 만들면 Phase가 커진다.

### Screens

S08 (카드 선택). Preview는 Template 샘플 정적/간단 비교면 충분. Paged.js 전체 나눔 필수 아님.

### Functions

F-THEME-01, F-THEME-02, (F-THEME-03은 샘플 수준). F-THEME-04 적용은 Phase 8.

### APIs

없음. `API-THEME-01` 만들지 않음. `themeId`를 `book.json`에 추가하지 않음.

### Existing Files to Reuse

- `_template/book.css` `:root` (읽기, 미리보기 힌트)
- Template 샘플 HTML 조각 (읽기)

### Files Allowed to Change

- wizard 파일 (S08 화면 + 세션 `themeId`)

### New Files Allowed

없음 권장.

### Implementation Tasks

1. 두 카드. 기본 Practical.
2. 선택 → 세션. 문장 불변.
3. empty 경로: S06 → S08. import 경로: S07 확정 → S08.
4. Primary “이 디자인으로 만들기” → Phase 6 자리. **이 Phase에서 create 금지.**
5. Minimal이 아직 CSS가 없으면 선택만 저장. 생성 시 Practical CSS여도 됨 (Phase 8에서 적용). 문서/UI에 숨기지 말고, Phase 6 Completion에 “theme apply는 Phase 8”을 남긴다.

### DO NOT TOUCH

기존 책 `book.css`, 설계본, Paged.js, HTML 재생성.

### QA Required

- QA-THEME-01
- QA-THEME-02
- QA-STRUCT-08 / QA-LOSS-01 (S08 write 없음)
- QA-E2E-02 중 S08 도달 (생성 제외)

### Completion Criteria

테마 id가 세션에 있다. `books/` 0. HTML/CSS 디스크 불변.

### STOP CONDITION

토큰 세트 구현, S11, create를 하지 않는다.

### Rollback / Failure Note

S08 제거. S07 확정 후 STOP.

---

## Phase 6 — Final Generation

### Goal

S09에서만 책을 만든다. 기존 `POST /__new-book` / `books.create`를 WRAP. 첫 destructive write.

### Why Now

세션(method, meta, parse+structure, themeId)이 갖춰진 뒤에만 write가 안전하다.

### Screens

S09 (실제 단계 문구, 가짜 % 금지) → 성공 시 기존 `book.html` 열기 (S10 셸은 Phase 7)

### Functions

F-GEN-01..05, F-IMPORT-05, F-META-04

### APIs

API-BOOK-03 WRAP. S09에서만.

입력 TARGET: 세션 메타 + (import면 수정된 구조로 본문 조립) + source 바이트.  
theme CSS 적용은 Phase 8이 비어 있으면 Template CSS.

기존 `{ title, subtitle, author, source? }` 유지. 구조 반영은:

- 선택 A: create에 optional `units` / html fragment 추가 (기존 source 경로 삭제 금지)
- 선택 B: 클라가 수정 구조를 반영한 임시 source를 만들어 `source`로 전달

구현 때 하나 고름. 둘 다 **기존 책 overwrite 금지** (`uniqueFolder`).

### Existing Files to Reuse

- `server/books.mjs` `create`
- `_template/`
- `importManuscript` (이미 세션에 있으면 재파싱하지 말고 세션 트리를 씀)

### Files Allowed to Change

- `server/books.mjs` — optional 인자만
- `preview-server.mjs` — create 응답 유지
- `_shared/wizard.js` — S09에서만 fetch `/__new-book`

### New Files Allowed

S09 단계 UI는 wizard 안에.

### Implementation Tasks

1. S09 자동 시작. 단계 라벨: 원고 확인 → 틀 복사 → 구조 넣기 → 정보 넣기 → (디자인 적용은 Phase 8이면 “기본 디자인”).
2. 성공: 폴더 + `book.html` + `book.css` + `book.json` + import면 `source/`.
3. S07 제목/순서가 HTML에 있어야 함 (QA-GEN-02).
4. 실패: 유령 폴더 없음. 세션 유지. 재시도.
5. 같은 제목은 `uniqueFolder`. 설계본 경로 불변.
6. 제품 마법사 외 `#new-dialog`가 남아 있으면 여전히 create 가능 — 제품 CTA에서는 쓰지 않음. dialog는 숨김 유지.

### DO NOT TOUCH

설계본, Editor 재작성, 기존 책 일괄 변환, `book.json` 필수화, Structured JSON.

### QA Required

- QA-GEN-01..05
- QA-E2E-02 (Theme 최종 적용 제외 가능)
- QA-META-03
- QA-LOSS-02
- QA-LIB-01 (새 카드 + 설계본 유지)
- QA-REGRESSION-05

### Completion Criteria

성공 시에만 서재 카드. 실패 시 목록 불변. S05–S08 재실행해도 이전처럼 write 없음. 168쪽 원본 해시 유지.

### STOP CONDITION

Workspace 탭, Theme 토큰, Cover, PDF 제품 화면을 이 Phase에 넣지 않는다. 성공 착지는 **기존 book.html URL**.

### Rollback / Failure Note

wizard의 create 호출 제거. `create()` optional 필드 되돌림. 테스트로 만든 폴더만 삭제.

---

## Phase 7 — Workspace Shell

### Goal

열린 책을 제품 셸로 감싼다. 원고 탭 = 기존 Editor. 탭만. Editor 내부 재작성 없음.

### Why Now

생성/기존 열기의 착지. 디자인/표지/미리보기 탭은 자리만 두고 본문은 Phase 8–10.

### Screens

S10. 탭: 원고(실장), 디자인/표지/미리보기(placeholder 또는 기존 뷰 연결은 이후)

권장: 원고 = 현재 book.html iframe 또는 동일 문서. 다른 탭은 “곧” 또는 기존 Viewer URL.

### Functions

F-WS-01, F-WS-02, F-WS-03, F-EDITOR-01..03, F-EDITOR-08 (기존 가드)

### APIs

API-BOOK-11, API-EDIT-01, API-BLOCK-01, API-STRUCT-01 — **기존 그대로**. 새 edit API 없음.

### Existing Files to Reuse

- `_shared/book_editor.js` MUST USE
- 서빙 시 eid / `__bookEdit` 계약
- `_shared/library.html` 열기 링크

### Files Allowed to Change

- `_shared/library.html` — 열기 → 셸 URL
- `preview-server.mjs` — 셸 HTML 서빙
- 신규 workspace 셸 파일

### New Files Allowed

`_shared/workspace.html` / `workspace.js` (셸 전용)

### Implementation Tasks

1. 레이아웃: ← 내 서재, 제목, 저장 상태, PDF 자리, 탭 4.
2. 원고 탭에 기존 Editor 로드. 패치 로직 복제 금지.
3. 미저장 가드는 기존 Editor 것 WRAP.
4. PDF 버튼은 Phase 10까지 기존 `/__pdf` 직접 호출이어도 됨 (제품 S15/S16은 이후).
5. 설계본을 셸로 열 때 변환 없음.

### DO NOT TOUCH

`book_editor.js` 내부 재작성, `blocks.mjs` 28종, eid 디스크 저장, 설계본 HTML.

### QA Required

- QA-WS-01
- QA-EDITOR-01, QA-EDITOR-06
- QA-LIB-02
- QA-REGRESSION-01
- 사본에서 QA-EDITOR-04, QA-EDITOR-05 (엔진 회귀, 셸이 도구를 가리지 않는지)

### Completion Criteria

기존 저장/블록/구조가 셸 안에서도 동작. 설계본 열림. 새 SoT 없음.

### STOP CONDITION

S11 토큰, S12 신규 UI, Viewer 재작성, S16을 넣지 않는다.

### Rollback / Failure Note

열기를 다시 직접 `book.html`로. workspace 파일 미연결.

---

## Phase 8 — Theme CSS Token Layer

### Goal

동일 HTML class contract 위에 Practical / Minimal 토큰. S08 Preview 강화 + S11 적용. **HTML 불변.**

### Why Now

생성 책이 있고 셸 탭이 있다. 이제 CSS만 갈아끼울 수 있다.

### Screens

S08 (샘플 Preview), S11 (적용, 글자 크기/행간/여백 토큰 3종)

### Functions

F-THEME-03, F-THEME-04

### APIs

`API-THEME-01`은 **없어도 됨**. `book.css` 파일 write. `themeId`를 `book.json`에 필수로 넣지 말 것. 기억 위치는 DATA_SPEC대로 미확정 → CSS 실체만.

### Existing Files to Reuse

- `_template/book.css` `:root`
- 설계본/Template 컴포넌트 선택자 (이름 유지)
- Paged.js (재나눔은 reload)

### Files Allowed to Change

- `_template/book.css` — 토큰 세트 **추가**. 선택자 의미 삭제 금지
- 신규 Minimal 토큰 파일 예: `_shared/theme-minimal.css` (책 CSS에 합치거나 교체)
- S09 create 이후 또는 S11 적용 시 해당 책 `book.css`만
- wizard S08 Preview, workspace S11

### New Files Allowed

토큰 파일 1–2개. Theme 엔진 JS 소량.

### Implementation Tasks

1. Practical = 현재 Template 토큰.
2. Minimal = 같은 선택자, 다른 토큰.
3. 적용 전후 `book.html` 해시, slot id, TOC href, section id 비교.
4. S11 적용 후 Preview는 reload/reattach (새 Pagination 금지).
5. 설계본 **원본**에 적용 금지. 사본만.
6. Phase 6가 themeId=minimal로 만든 책이 아직 Practical이면 여기서 적용.

### DO NOT TOUCH

설계본 원본, HTML 재생성, class 이름 변경, Paged.js, `themeId` DB.

### QA Required

- QA-THEME-03..06
- QA-LOSS-04
- QA-THEME-05
- QA-REGRESSION-05 (원본)

### Completion Criteria

테마 바꿔도 문장·구조·slot id 동일. Preview 쪽 나눔 정상.

### STOP CONDITION

컴포넌트별 색 픽커 풀세트, 폰트 업로드, 판형 변경, 28종 블록 확장 금지.

### Rollback / Failure Note

책 `book.css`를 Template로 복구. 토큰 파일 연결 해제.

---

## Phase 9 — Cover / Image Integration

### Goal

S12를 셸 표지 탭에 연결. 기존 `section.cover` + sidecar. 새 이미지 시스템 없음.

### Why Now

Theme 이후 표지는 같은 HTML/sidecar 계약이다.

### Screens

S12

### Functions

F-COVER-01..04, F-META-01..03 (표지 카피)

### APIs

API-STATE-01, API-BOOK-06, API-BOOK-04, API-BOOK-05 — CURRENT KEEP.

### Existing Files to Reuse

- `_shared/image_slot.js`
- `.image-slots.state.json`
- rewriteFront / coverColor

### Files Allowed to Change

- workspace 표지 탭 UI (필드 + 슬롯). 슬롯 런타임은 기존

### New Files Allowed

커버 탭 패널 HTML/JS 소량.

### Implementation Tasks

1. 표지 프리뷰 + 업로드 + 제목/부제/저자.
2. 이미지 → sidecar. HTML 불변.
3. slot id 재생성 금지.
4. 설계본 원본에 상태 json을 QA가 쓰지 않음. 사본으로 테스트.
5. AI Cover 없음.

### DO NOT TOUCH

`image_slot.js` 교체, History에 sidecar 넣기, 설계본.

### QA Required

- QA-COVER-01..06
- QA-LOSS-05
- QA-COVER-04 (복제/PDF는 Phase 10과 함께 재확인 가능)

### Completion Criteria

올린 그림이 reload 후 남음. HTML 해시 동일(카피 저장 시 전면부만 변경 — 제목 테스트는 사본).

### STOP CONDITION

AI Cover, 새 에셋 DB 없음.

### Rollback / Failure Note

표지 탭을 placeholder로. sidecar는 사본에서만 삭제.

---

## Phase 10 — Preview / PDF Integration

### Goal

미리보기 탭 = 기존 Viewer. PDF 버튼 = 기존 `/__pdf` (제품 Primary: file만). 엔진 교체 없음.

### Why Now

셸이 있고 저장본이 있다. 연결만 하면 CURRENT QA가 제품 화면에 붙는다.

### Screens

S14, S15 (제품은 전자책 PDF 한 장. print/ids/wm HIDE)

### Functions

F-PREVIEW-01..04, F-EXPORT-01, F-EXPORT-03

### APIs

API-BOOK-11, API-EXPORT-01, API-LIVE-01 (로컬 유지)

### Existing Files to Reuse

- `_shared/paged_book_viewer.js` / `.css`
- `_shared/book_tools.js`
- `server/pdf.mjs`

### Files Allowed to Change

- workspace 미리보기 탭이 Viewer를 로드하는 방식 (iframe/동일 계약)
- PDF 버튼이 `ids/print/wm` 없이 `file`만
- 고급 내보내기 UI HIDE (Route 삭제 금지)

### New Files Allowed

S15 진행 문구 UI 소량 (“PDF 만드는 중”).

### Implementation Tasks

1. Single / Spread / Grid 그대로.
2. 미저장 본문으로 PDF 성공 처리 금지.
3. PDF 후 HTML/sidecar 해시 확인.
4. Print/EPUB/ZIP Route 유지.
5. S16은 Phase 11. 이 Phase는 다운로드 또는 기존 동작 + 제품 라벨.

### DO NOT TOUCH

Viewer 모드 엔진, Paged.js, pdf-lib/Chrome 파이프라인, 설계본.

### QA Required

- QA-PREVIEW-01..03
- QA-EXPORT-01..05
- QA-REGRESSION-02, QA-REGRESSION-03, QA-REGRESSION-04
- QA-LOSS-07
- QA-NEG-04 (가능 시)

### Completion Criteria

세 모드 + 전자책 PDF. 설계본 160+ PDF. 원본 불변. Route 삭제 없음.

### STOP CONDITION

S16 성공 화면, 픽셀 비교 도구, PDF 엔진 교체 없음.

### Rollback / Failure Note

탭에서 직접 book.html / `__pdf` 링크로 복귀.

---

## Phase 11 — Export Complete

### Goal

PDF **성공 후에만** S16. 다운로드 / 다시 / Book으로.

### Why Now

S15가 실제 PDF를 만든 뒤에야 성공 화면이 거짓이 아니다.

### Screens

S16 → S10 또는 S15

### Functions

F-DONE-01, F-DONE-02, F-EXPORT-02, F-EXPORT-03

### APIs

API-EXPORT-01 응답/캐시 WRAP. 새 Export 엔진 없음.

### Existing Files to Reuse

PDF 바이트, 조건부 `<title>.pdf` 캐시

### Files Allowed to Change

- workspace / wizard가 아닌 export 완료 화면 파일
- PDF 성공 분기

### New Files Allowed

`_shared/export_complete.html` (또는 workspace 내 상태)

### Implementation Tasks

1. 성공 응답일 때만 S16.
2. 다운로드, 재다운로드, 돌아가기(같은 `file`), 다시 만들기.
3. 실패 → S16 SUCCESS 금지. Workspace ERROR.
4. 책을 지우거나 변환하지 않음.

### DO NOT TOUCH

PDF 엔진, 설계본, 결제.

### QA Required

- QA-DONE-01..04
- QA-E2E-01 (여기까지 연결 시도)

### Completion Criteria

실패를 성공으로 표시하지 않음. 같은 책 복귀.

### STOP CONDITION

Pricing, Auth, 랜딩을 붙이지 않음.

### Rollback / Failure Note

성공 시 브라우저 다운로드만 (CURRENT).

---

## Phase 12 — Full Regression + Release Gate

### Goal

QA Release Gate를 한 번에 닫는다. 새 기능 없음.

### Why Now

모든 WRAP 이후 168쪽과 Data Loss를 다시 본다.

### Screens

S03–S16 (MVP). Later 화면 없음.

### Functions

Gate에 적힌 Function만.

### APIs

CURRENT + WRAP + 구현된 TARGET. 새 API 없음.

### Existing Files to Reuse

QA_ACCEPTANCE §5, §27

### Files Allowed to Change

버그 수정만. 범위 밖 리팩터 금지.

### New Files Allowed

없음.

### Implementation Tasks

1. QA-E2E-01 수동.
2. Import 4종 + 붙여넣기/오류.
3. 168쪽 Regression 전부. 원본 해시.
4. P0 목록 0.
5. History 엔진 (사본): edit/blocks/structure/restore.
6. 열린 P0/P1만 수정. 새 Phase 기능 추가 금지.

### DO NOT TOUCH

설계본, LATER 기능, 엔진 교체.

### QA Required

QA_ACCEPTANCE §5 Release Gate + §27 Checklist.

### Completion Criteria

Gate 항목 전부 참. P0 = 0.

### STOP CONDITION

Gate 통과 = MVP 구현 계획 종료. Auth/AI/Payment로 넘어가지 않음.

### Rollback / Failure Note

실패한 Phase로 돌아가 수정. Gate를 느슨하게 바꾸지 않음.

---

## 3. Cross-Phase STOP Rules

| 상황 | 행동 |
|---|---|
| S04–S08에서 `books/` 신규 폴더 | 즉시 STOP. create 호출 제거 |
| 설계본 해시 변경 | STOP. 원본 복구. 기능 진행 금지 |
| `/__edit` 409를 덮어쓰기로 “수정” | STOP |
| Theme가 HTML을 재작성 | STOP |
| Editor/Viewer/PDF 재작성 PR | 거부 |
| Phase QA 미통과 | 다음 Phase 금지 |

---

## 4. Out of Plan (LATER)

- S01 Landing, S02 Auth, S13 AI Cover, S17 Payment
- Auto Save, History 제품 UI, Inspection UI
- Print / EPUB / Web ZIP 제품 CTA
- blocks 28종, Structured JSON, Supabase, React
- 168쪽 migration
- `book.json.themeId` 스키마 선행

---

# First Implementation Task

다음 요청으로 **그대로** 구현을 시작해도 되는 첫 단위. 이 블록만 수행한다.

### 목표

S03의 “+ 새 책 만들기” / 타일이 기존 `#new-dialog` + `POST /__new-book` 대신 **S04 제작 방식 화면**으로만 이동한다.

S04에서:

- 빈 책 / 원고로 만들기 카드 선택
- 미선택이면 Primary DISABLED
- 취소 → S03

이 작업에서 **계속(S05/S06)은 DISABLED**로 둔다. parse, 메타 저장, 생성 없음.

### 변경 허용 파일

- `_shared/library.html` (새 책 버튼 연결 해제/전환만)
- `_shared/wizard.html` (신규)
- `_shared/wizard.js` (신규)
- `_shared/wizard.css` (신규, 최소)
- `preview-server.mjs` — wizard 정적 파일을 이미 `/_shared/`로 주고 있으면 **변경 불필요**. 새 Route가 꼭 필요할 때만 GET 추가. 기존 POST 핸들러 수정 금지.

### 변경 금지 파일

- `server/books.mjs`
- `manuscript-import.mjs`
- `_shared/book_editor.js`
- `_shared/paged_book_viewer.js`
- `_shared/paged.polyfill.js`
- `server/pdf.mjs`
- `server/editable.mjs`, `htmltree.mjs`, `blocks.mjs`, `toc.mjs`
- `books/내 포트폴리오, AI로 직접 만들기/**`
- `_template/**` (이 작업에서 불필요)
- `POST /__new-book` 삭제/동작 변경
- 기타 `_docs/*` 명세 (구현이 명세를 고치지 않음)

### 관련 Screen / Function / API / QA

- Screen: S03, S04
- Function: F-LIB-03, F-NEW-01
- API: 없음 (API-BOOK-03 호출 0)
- QA: QA-LIB-03, QA-NEW-01 (선택/DISABLED까지), QA-NEW-02 (S04 취소), QA-LOSS-01 일부, QA-LIB-01 (목록 회귀)

### 완료 조건

1. 새 책 → S04가 보인다.
2. 카드 선택 전에는 계속 불가.
3. 취소 후 서재. `books/`에 새 폴더 없음.
4. 새 책 흐름에서 `/__new-book` 요청 없음.
5. 기존 책 목록/열기가 동작한다.
6. 설계본 파일 해시 불변.

### STOP 조건

완료 조건이 참이면 **멈춘다.**

하지 말 것:

- S05 업로드 / 붙여넣기
- parse-only Route
- S06 폼
- S07–S16
- `#new-dialog` 내부 생성 로직을 새 화면으로 이식
- Editor / Viewer / PDF / Theme / Cover

실패 시: library 버튼을 원래 dialog로 되돌리고 wizard 연결을 끊는다. 다음 Phase로 가지 않는다.

아직 코드를 쓰지 않는다.
