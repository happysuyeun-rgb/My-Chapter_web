# My Chapter Product Spec

- Product: My Chapter
- Version: **v1.3**
- Date: 2026-10-03
- Status: Product / Development Baseline
- Basis: M0.5-A Engine Boundary Audit + M0.5-B Content Architecture Audit
- Prior text: 채팅의 v1.2.1 (루트 파일은 v1.3에서 처음 디스크에 둠)

이 문서는 제품/개발 기준이다. 구현 명세가 아니다.

충돌 시 우선순위:

1. M0.5-A 실제 코드 Audit
2. M0.5-B Content Architecture Audit
3. 현재 실제 코드
4. 이 문서의 과거 가정 (v1.2.1 이하)

Audit에서 기각된 가정은 다시 살리지 않는다.

근거 문서:

- `_docs/M0.5_ENGINE_AUDIT.md`
- `_docs/M0.5_CONTENT_AUDIT.md`

---

## 1. Product

My Chapter는 원고를 받아 책을 만들고, 구조를 잡고, 디자인을 입히고, 표지를 두고, PDF로 내보내는 제품이다.

한 줄:

```text
원고 → 구조화 → 디자인 → 표지 → PDF
```

검증된 표현력 기준 도서는 다음이다.

`books/내 포트폴리오, AI로 직접 만들기`

이 168쪽 설계본이 현재 엔진이 보존해야 하는 상한이다. Import 최소 구조가 상한이 아니다.

---

## 2. What Changed in v1.3

v1.2.1까지 남아 있던 후보/가정을 Audit 결과로 고정하거나 제거했다.

| 과거 가정 | v1.3 |
|---|---|
| canonicalContent JSON이 Content SoT | **기각.** SoT는 `book.html` |
| React / Vite가 Core Stack | **기각.** 현재 엔진은 Node + Vanilla HTML/JS + Paged.js + Headless Chrome |
| Pagination을 새로 만든다 | **기각.** Paged.js KEEP |
| PDF Engine 미정 | **기각.** 현행 파이프라인 KEEP |
| `legacy_html` / `structured_v1` 이중 포맷 | **기각.** HTML Book Contract 하나 |
| EPUB / Print / History / Inspection 삭제 | **기각.** KEEP / HIDE FROM PRODUCT |
| Import는 DOCX / TXT / MD만 | **수정.** TXT / MD / PDF / DOCX. PDF는 기존 자산으로 유지 |
| M1 = Auth | **기각.** M1은 Auth가 아니다 |
| Structured Book JSON을 지금 도입 | **DEFER.** 지금은 도입하지 않음 |

---

## 3. Current Engine Facts (Do Not Reopen)

M0.5-A가 확정한 사실이다.

| Area | Fact |
|---|---|
| Stack | Node 내장 HTTP + Vanilla HTML/JS + Paged.js + Headless Chrome |
| React | NOT USED |
| Vite | NOT USED |
| Supabase | NOT USED |
| Content Source | `book.html` |
| Metadata | 제목/저자 등 일부는 HTML. 서재 상태는 `book.json` |
| Image State | `.image-slots.state.json` |
| Render Source | HTML + `book.css` + Paged.js |
| Book Identity | `books/<폴더>/book.html` 경로. 제목과 폴더명은 다를 수 있음 |
| Import | TXT / MD / PDF / DOCX |
| Preview / PDF | PARTIAL shared renderer / rules |
| External Renderer → Viewer | PARTIAL compatibility |
| Existing Engine | KEEP / WRAP. 현재 교체 대상 없음 |

운영 Identity는 UUID가 아니다. 키는 `file` = 워크스페이스 상대 경로다. `book.json.id`는 신규/복제 시 기록될 수 있으나 라우트가 읽지 않는다.

---

## 4. Architecture Decision

아래는 후보가 아니다. 현재 Architecture Decision이다.

### 4.1 Content Source of Truth

Content SoT는 `book.html`이다.

별도의 Structured Book JSON을 현재 도입하지 않는다.

저장·편집·히스토리·미리보기·PDF는 모두 이 HTML 문자열을 기준으로 한다. 쪽 나눔 결과(`.pagedjs_page`)는 원본이 아니다.

### 4.2 Structured Overlay

다음 기존 층을 HTML 위의 Structured Overlay로 발전시킨다.

- `data-eid` / `data-etag` (서빙 시 주입. 디스크 원본에는 없음)
- `server/editable.mjs`
- `server/htmltree.mjs`
- `server/blocks.mjs`
- 장/부 구조는 `server/toc.mjs`가 같은 HTML 계약을 사용

이 계층은 `book.html`을 대체하지 않는다.

목적:

- 의미 단위 편집
- 안전한 Patch
- AI Editing
- 구조 조작
- 향후 Auto Save

`htmltree`는 JSON 문서가 아니다. 원본 문자열 위의 위치 보존 오버레이다. 슬라이스 패치 기준 round-trip은 LOSSLESS에 가깝다. 트리를 직렬화해 HTML을 다시 만들면 LOSSY다.

### 4.3 Structured Book JSON = NOT NOW

별도 JSON Content SoT는 **DEFER**한다.

이유:

- 168쪽 HTML 표현력이 높다
- 현재 Block Model로 변환하면 LOSSY
- 신규 JSON Schema는 기존 표현력을 다시 모델링해야 한다
- htmltree 기반 패치는 현재 LOSSLESS에 가깝다

나중에 파생 JSON이 필요하면 읽기 전용 뷰로 뽑는다. 쓰기 원본은 HTML이다.

### 4.4 One HTML Book Contract

`legacy_html` / `structured_v1` 두 포맷을 만들지 않는다.

기존 책과 신규 책 모두 HTML Book Contract를 쓴다.

차이는 파일 포맷이 아니라 콘텐츠/컴포넌트 밀도와 편집 기능 수준이다.

- Import 책 = 계약의 부분집합
- Template 책 = 골격 + 샘플 3종
- 설계본 = 계약의 전체

기존 168쪽 Book은 Migration하지 않는다.

### 4.5 Theme Engine

Practical / Minimal Theme은 Content Model 교체가 아니다.

```text
동일 book.html
+ 동일 Component Class Contract
+ CSS Theme Token Layer
```

M0.5-B 기준 대부분 `CSS_ONLY`다. HTML 구조 변경은 실제로 필요한 컴포넌트에서만 최소화한다. 클래스 이름은 Content 계약으로 남긴다. 색·크기·장식만 토큰으로 뺀다.

현재 `book.css`에 `:root` 토큰이 있다. Template CSS는 설계본과 같은 컴포넌트 선택자를 이미 가진다.

### 4.6 Pagination

기존 Paged.js Pagination Engine을 KEEP한다. 새 Pagination Engine을 만들지 않는다.

쪽 나눔 책임은 Paged.js + `book.css` `@page`다. 뷰어는 나뉜 `.pagedjs_page`를 보여 준다.

### 4.7 Viewer

기존 Viewer를 KEEP한다.

- Single
- Spread
- Grid (`thumb`)

뷰어는 책 React 트리를 모른다. HTML Contract와 Paged.js 결과만 본다.

### 4.8 PDF

현행 파이프라인을 KEEP한다.

```text
HTML + book.css + Paged.js + Headless Chrome + pdf-lib
```

Preview/PDF는 완전히 같지 않다. M0.5-A 판정은 **PARTIAL shared rules**다.

공유: 같은 `book.html`, `book.css`, Paged.js, image-slot, TOC/`target-counter`.

차이: PDF 경로는 editor 없음. 인쇄 재단선·워터마크·장 발췌는 PDF 전용이다. 글 저장 직후 미리보기는 재나눔 전일 수 있다.

교체보다 차이를 관리한다.

### 4.9 Import

실제 지원 Format:

- TXT
- MD
- PDF
- DOCX

기획서에 없던 PDF도 기존 구현 자산으로 유지한다.

### 4.10 Import vs Final Book

Import가 168쪽 완성 Book 전체 표현력을 처음부터 만들 필요는 없다.

Import는 기본 구조를 만든다.

- toc
- part
- chapter (pro / ch / ap / epi)
- p
- h2
- h3
- ul
- ol
- inline `strong`

표지·속표지·판권은 Template 앞부분이 남는다.

이후 Book Editor / Component Layer로 고급 표현을 얹는다.

---

## 5. Service Architecture

새 층을 만들기 전에 현재 코드의 기존 층을 재사용한다.

```text
Product / Service UI
  ↓
기존 Book 관리/편집 API
  ↓
HTML Source of Truth          (book.html)
  ↓
data-eid / editable / htmltree / blocks
  ↓
book.css + Theme Tokens
  ↓
Paged.js
  ├─ Preview
  └─ PDF
```

기존 엔진 분류 (M0.5-A):

| Feature | Decision |
|---|---|
| Library | KEEP / WRAP |
| New Book | WRAP |
| Import | KEEP |
| Book Generator | KEEP |
| book.html | KEEP |
| book.json | KEEP / WRAP |
| Editor | KEEP / WRAP |
| editable / htmltree / blocks | KEEP |
| Image State | KEEP / WRAP |
| History | KEEP / HIDE FROM PRODUCT |
| Restore | KEEP |
| Live Reload | KEEP (로컬 도구) |
| Pagination | KEEP |
| Single / Spread / Grid | KEEP |
| TOC | KEEP |
| Cover | KEEP / WRAP |
| Inspection | KEEP / HIDE FROM PRODUCT |
| PDF | KEEP |
| Print / EPUB / Web ZIP | KEEP / HIDE FROM PRODUCT |

`REPLACE ONLY IF REQUIRED`에 해당하는 현재 엔진은 없다.

React, Vite, Supabase, 신규 Pagination, 신규 PDF 엔진, 신규 Viewer를 Core로 올리지 않는다. 서비스 UI가 필요하면 기존 API를 감싼다.

---

## 6. HTML Book Contract

Viewer / Editor / PDF가 기대하는 최소 골격이다. 상세 선택자는 Audit과 이후 `ENGINE_CONTRACT.md`에 둔다.

| 역할 | 패턴 |
|---|---|
| 표지 | `section.cover`, 선택 `#cover-image` |
| 속표지 | `section.titlepage` |
| 판권 | `section.colophon` |
| 차례 | `section.toc#toc` |
| 파트 | `section.part` |
| 장 | `section.chapter.chapter-{pro,ch,ap,epi}` |
| 장 시작 | `header.opener` |
| 판형 | `book.css` `@page` (현재 170×240mm) |

필수 로드는 템플릿·설계본과 같다.

```text
fonts / image_slot.js / paged.polyfill.js
paged_book_viewer.css + paged_book_viewer.js
book.css
```

외부 Renderer가 이 계약과 같은 `book.css` 규칙을 지키면 기존 Viewer/PDF에 PARTIAL하게 붙는다.

---

## 7. Expression Ceiling (168-page Designed Book)

My Chapter가 보존해야 하는 표현력 기준은 설계본이다. M0.5-B 주요 수치:

| Pattern | Count |
|---|---|
| Chapter | 23 |
| Part | 5 |
| Appendix (`chapter-ap`) | 5 |
| Prompt | 100 |
| Checklist | 26 |
| Figure | 33 |
| 설계 상자 (result/case/tip/checkpoint/option) | 25 |
| Flow | 12 |
| STEP (`step-tag`) | 58 |
| Entry | 82 |
| KV | 63 |
| Fill | 46 |

클래스명 `appendix`는 없다. 부록은 `chapter-ap`다.

의미는 HTML 클래스 계약에 둔다. 모양은 Theme/CSS에 둔다.

현재 `blocks.mjs`가 완전히 이해하는 본문 타입은 **28종 중 9종**이다.

Full insert: `p`, `h2`, `h3`, `ul`, `ol`, `checklist`, `prompt`, `image`, `table`.

모르는 것 예: result/case/tip/checkpoint/option, STEP, flow, wire, kv, fill, entry, term.

blocks layer는 필요 기능에 따라 **점진적으로** 확장한다. 28종 전체를 한 번에 구현하지 않는다. Block Model을 SoT로 승격하지 않는다.

---

## 8. Data Layout (Current)

```text
<workspace>/
├─ books/<folder>/
│  ├─ book.html                 # Content SoT
│  ├─ book.css                  # 현재 책 테마 (Practical 실체)
│  ├─ book.json                 # 서재 메타. 없을 수 있음
│  ├─ .image-slots.state.json   # 그림 상태. 없을 수 있음
│  ├─ source/                   # Import 원본
│  └─ .history/                 # HTML 전체 스냅샷. 제품 UI에서는 숨길 수 있음
├─ _trash/
├─ _template/
├─ _shared/
├─ server/
├─ manuscript-import.mjs
└─ preview-server.mjs
```

지속성은 지금 로컬 파일시스템이다. Supabase는 쓰지 않는다.

---

## 9. Screens

화면 ID는 유지한다. 기존 엔진 화면은 재작성하지 않는다.

### 9.1 Keep as existing engine

| ID | Screen | Strategy |
|---|---|---|
| S03 | Library | 기존 서재 KEEP / WRAP |
| S10 | Editor | 기존 Editor KEEP / WRAP |
| S14 | Viewer | 기존 Single / Spread / Grid KEEP |
| S15 | PDF | 기존 PDF Engine KEEP |

### 9.2 Needs new product design

기존 생성 흐름을 서비스 UX로 감싸는 화면. 엔진 교체가 아니다.

| ID | Screen | Note |
|---|---|---|
| S04 | 제작 방식 | 빈 책 / 원고 Import 등 |
| S05 | 원고 입력 | TXT / MD / PDF / DOCX. 붙여넣기는 Gap |
| S06 | 기본 정보 | 제목·부제·저자. Identity는 경로 |
| S07 | 원고 구조 확인 | Import 결과 골격 확인. 설계본 완성도가 아님 |
| S08 | 디자인 선택 | Practical / Minimal. CSS Theme Token |
| S09 | 생성 상태 | 현재 Job UI 없음. Wrapper 후보 |
| S11 | 디자인 | 테마/토큰 조정. HTML 재작성 아님 |
| S16 | 출력 완료 | PDF 결과. 엔진은 S15 |

### 9.3 Later

| ID | Screen |
|---|---|
| S01 | Landing |
| S02 | Auth |
| S13 | AI Cover |
| S17 | Payment |

S02를 M1과 같지 않게 읽는다.

---

## 10. Edit / Save (Current Contract)

제품의 편집 원리는 유지한다.

```text
contenteditable DOM
  → data-eid 패치
  → POST /__edit | /__blocks | /__structure
  → applyTextEdits / applyBlockOp / structureOp
  → commit() = history snapshot + write(book.html)
```

- 글 저장은 reload 없이 쪽 분할을 유지한다.
- 버전은 원본 HTML sha1이다.
- 충돌은 409다.
- Auto Save는 아직 없다. Overlay가 준비되면 붙일 수 있다. 구현은 이 문서의 범위가 아니다.

History / Restore / Inspection / EPUB / Print는 엔진에 있다. 제품 화면에서 숨길 수 있다. 삭제 대상이 아니다.

---

## 11. M1

M1을 Auth 시작 단계로 고정하지 않는다.

M1은:

**Audit 이후 가장 작은 실제 서비스 경계 구현**

후보는 다음이다. 순서는 이후 Development Specification과 Implementation Plan에서 정한다.

- Book Identity 안정화
- Persistence Boundary
- Service Wrapper
- Project Metadata
- Auth

Auth는 후보다. 기본값이 아니다.

---

## 12. Roadmap

```text
M0.5-A Engine Audit ✅
  ↓
M0.5-B Content Audit ✅
  ↓
Product Spec v1.3 ✅
  ↓
Development Specification
  ↓
Implementation Plan
  ↓
Incremental Development
```

다음 단계는 기능 구현이 아니다. 다음 단계는 개발 명세 작성이다.

Development Specification에 포함될 문서 (이번 작업에서 만들지 않음):

- `FUNCTION_SPEC.md`
- `SCREEN_SPEC.md`
- `ENGINE_CONTRACT.md`
- `DATA_SPEC.md`
- `API_SPEC.md`
- `QA_ACCEPTANCE.md`

---

## 13. Out of Scope for This Document

이 문서는 구현하지 않는다.

- 코드 / UI / CSS / Theme 구현
- `blocks.mjs` 확장
- Auto Save
- Supabase / Auth / React
- API 수정
- 168쪽 Book 수정
- 위 6개 개발 명세 파일 작성

---

# Architecture Decision Summary v1.3

- Content SoT = `book.html`
- Structured Overlay = eid + editable + htmltree + blocks
- Separate Book JSON Content Model = NOT NOW
- Theme = CSS Token Layer
- Pagination = KEEP
- Viewer = KEEP
- PDF = KEEP
- Existing Book Migration = NO
- Import = TXT / MD / PDF / DOCX
- Existing Engine = KEEP / WRAP
- Next Step = Development Specification
