# 차곡 Product Spec

- Product: 차곡
- Version: **v1.5**
- Date: 2026-10-16
- Status: **CURRENT / Product + Development Baseline**
- Basis: M0.5-A/B Audit + MVP Release Gate + Phase 13 Wizard Recovery + Phase 14 Editor Autosave/Recovery + Phase 15A Local/Guest Entry + Final Local MVP UI QA + Service/Pricing Policy v1.1
- Prior baseline: v1.4 (2026-10-16)
- Legacy filename note: 파일명은 참조 안정성을 위해 유지하며 제품명은 차곡이다.

이 문서는 제품/개발 기준이다. 구현 명세가 아니다.

충돌 시 우선순위:

1. **엔진 불변 계약** — M0.5-A/B Audit에서 확정한 KEEP / WRAP / SoT 결정
2. **현재 제품 기준** — 본 v1.5 + `_docs/SERVICE_POLICY.md` + `_docs/PRICING_POLICY.md` + `_docs/IA.md` + `_docs/TASK_FLOW.md`
3. **현재 Phase 기준** — `_docs/PHASE_15_AUTH_FOUNDATION.md` 등 활성 Phase 문서
4. **현재 실제 코드** — 아직 목표 구조를 구현 중일 수 있으므로 CURRENT와 TARGET을 구분
5. 과거 가정 / Historical 문서

Audit에서 기각된 가정은 다시 살리지 않는다. Historical Release Gate는 당시 사실 기록으로 유지하며 현재 상태 문서로 해석하지 않는다.

근거 문서:

- `_docs/M0.5_ENGINE_AUDIT.md`
- `_docs/M0.5_CONTENT_AUDIT.md`
- `_docs/RELEASE_GATE_MVP_2026-10-11.md`
- `_docs/IA.md`
- `_docs/TASK_FLOW.md`
- `_docs/PHASE_15_AUTH_FOUNDATION.md`

---

## 1. Product

차곡은 원고를 받아 책을 만들고, 구조를 잡고, 디자인을 입히고, 표지를 두고, PDF로 내보내는 제품이다.

한 줄:

```text
원고 → 구조화 → 디자인 → 표지 → PDF
```

검증된 표현력 기준 도서는 다음이다.

`books/내 포트폴리오, AI로 직접 만들기`

이 168쪽 설계본이 현재 엔진이 보존해야 하는 상한이다. Import 최소 구조가 상한이 아니다.

---

## 2. What Changed in v1.5

v1.5는 Core Engine을 바꾸는 버전이 아니라, **Phase 15A 완료·Local MVP UI 마감·서비스/가격정책 확정 상태를 상위 Product baseline에 동기화하는 버전**이다.

| Area | v1.5 |
|---|---|
| Product name | 현재 브랜드는 **차곡 (Chagok)**. legacy filename은 참조 안정성을 위해 유지 |
| Wizard recovery | **IMPLEMENTED (Phase 13)** — 새로고침/탭 종료 후 draft recovery |
| Editor autosave | **IMPLEMENTED (Phase 14)** — debounce autosave + local recovery + conflict safety |
| Entry | **IMPLEMENTED (Phase 15A)** — `/` Landing, `/library` Library, `/__auth` Local/Auth foundation |
| Local/Guest | **IMPLEMENTED / QA PASS** — Supabase 미연결에서도 Wizard → Workspace → Preview → PDF 핵심 흐름 사용 가능 |
| Auth | Configured Auth foundation + safe `returnTo`는 유지. **Real Supabase Auth Runtime = Phase 15B HOLD** |
| Ownership | **Phase 16 HOLD** — Auth와 Book ownership은 아직 같은 것이 아님 |
| Persistence | 책 Content는 여전히 local `book.html`; Supabase DB/Storage는 도입하지 않음 |
| UI quality | Final P2 polish 완료. Local MVP 기준 P0/P1 = 0 |
| Service policy | `_docs/SERVICE_POLICY.md` v1.1 CURRENT |
| Pricing | Free + Book Pass **₩14,900/책 1권** 정책 확정. Payment 구현은 HOLD |
| Payment UX | `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md` v1.1 TARGET DEFINED |
| Engine | Editor / Viewer / Paged.js / PDF / Theme 계약 유지 |

### v1.3 Historical Architecture Decisions

v1.2.1까지 남아 있던 후보/가정을 Audit 결과로 고정하거나 제거한 결정은 계속 유효하다.

| 과거 가정 | v1.3 이후 현재 결정 |
|---|---|
| canonicalContent JSON이 Content SoT | **기각.** SoT는 `book.html` |
| React / Vite가 Core Stack | **기각.** Core Engine은 Node + Vanilla HTML/JS + Paged.js + Headless Chrome |
| Pagination을 새로 만든다 | **기각.** Paged.js KEEP |
| PDF Engine 미정 | **기각.** 현행 파이프라인 KEEP |
| `legacy_html` / `structured_v1` 이중 포맷 | **기각.** HTML Book Contract 하나 |
| EPUB / Print / History / Inspection 삭제 | **기각.** KEEP / HIDE FROM PRODUCT |
| Import는 DOCX / TXT / MD만 | **수정.** TXT / MD / PDF / DOCX |
| M1 = Auth | **과거 단계 가정으로 폐기.** 현재는 Phase 기반 로드맵 사용 |
| Structured Book JSON을 지금 도입 | **DEFER.** 지금은 도입하지 않음 |

---

## 3. Current Engine Facts (Do Not Reopen)

M0.5-A가 확정한 사실이다.

| Area | Fact |
|---|---|
| Stack | Node 내장 HTTP + Vanilla HTML/JS + Paged.js + Headless Chrome |
| React | NOT USED |
| Vite | NOT USED |
| Supabase | **Core Engine에는 NOT USED.** Phase 15A는 Auth UI/client foundation + Local fallback까지 완료. Real Chagok Web Auth Runtime은 Phase 15B HOLD, DB/Storage는 Phase 16 HOLD |
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
- Auto Save / Recovery (Phase 14 구현)

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

차곡이 보존해야 하는 표현력 기준은 설계본이다. M0.5-B 주요 수치:

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

책 Content 지속성은 현재도 로컬 파일시스템이다. `book.html` / `book.css` / `book.json` 계약은 유지한다.

Phase 15A에서는 **Auth UI/client foundation + Local/Guest fallback**까지 구현했다. 실제 Chagok Web Supabase Runtime은 Phase 15B HOLD다. Supabase DB / Storage는 사용하지 않으며, 사용자별 Book ownership과 클라우드 저장 경계는 Phase 16 HOLD 범위다.

---

## 9. Screens

화면 ID는 유지한다. 기존 엔진 화면은 재작성하지 않는다.

| ID | Screen | Current / Target | Strategy |
|---|---|---|---|
| S01 | Landing | **IMPLEMENTED (Phase 15A)** | 신규 진입 화면. `/` |
| S02 | Auth | **LOCAL FALLBACK IMPLEMENTED / CONFIGURED FOUNDATION READY** | `_shared/auth.html/js`; Real Chagok Web runtime = Phase 15B HOLD |
| S03 | Library | **IMPLEMENTED / `/library` route current** | 기존 서재 KEEP / WRAP |
| S04 | New Book Method | **IMPLEMENTED** | Wizard |
| S05 | Manuscript Input | **IMPLEMENTED** | TXT / MD / PDF / DOCX / paste |
| S06 | Metadata | **IMPLEMENTED** | 제목·부제·저자 |
| S07 | Structure Review | **IMPLEMENTED** | parse 결과 확인·수정 |
| S08 | Theme Selection | **IMPLEMENTED** | Practical / Minimal |
| S09 | Generation | **IMPLEMENTED** | 확정 후 실제 book 생성 |
| S10 | Workspace / Manuscript | **IMPLEMENTED** | 기존 Editor KEEP / WRAP |
| S11 | Design | **IMPLEMENTED** | Theme layer |
| S12 | Cover | **IMPLEMENTED** | 기존 cover/image state WRAP |
| S13 | AI Cover | **LATER** | 별도 Phase |
| S14 | Preview | **IMPLEMENTED** | Single / Spread / Grid KEEP |
| S15 | PDF Export | **IMPLEMENTED** | 기존 PDF Engine KEEP |
| S16 | Export Complete | **IMPLEMENTED** | 제품 완료 상태 |
| S17 | Pricing / Payment | **POLICY + UI TARGET DEFINED / IMPLEMENTATION HOLD** | Phase 15B/16 + Payment prerequisites 이후 |

### 9.1 Target Entry Routing

```text
/          → S01 Landing
/library   → S03 Library
/__auth    → S02 Auth
/__wizard  → S04~S09
/__workspace?file=... → S10~S14
/__pdf?file=... → S15
```

Phase 15A Entry Routing과 Local/Guest fallback은 구현·QA 완료다. 전용 Chagok Web Supabase 연결과 Runtime Auth QA는 **Phase 15B HOLD**이며 현재 즉시 작업이 아니다.

### 9.2 Auth vs Ownership

Phase 15A의 Auth UI/client foundation이 존재해도 아직 사용자별 Book ownership을 보장하지 않는다.

```text
Phase 15A: Local/Guest Entry + Auth UI/client foundation ✅
Phase 15B: Real Supabase Auth Runtime ⏸ HOLD
Phase 16 : Auth User → Book Ownership → DB Metadata → Storage → API Authorization ⏸ HOLD
```

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
- **Auto Save / Recovery는 Phase 14에서 구현 완료.**
- 자동 저장 debounce 1500ms, local recovery write 400ms.
- 한 번에 하나의 `/__edit` 요청만 진행하며 pending change는 다음 저장으로 이어진다.
- 409 conflict 시 autosave를 중지하고 recovery/dirty를 보존하며 자동 재전송하지 않는다.
- 수동 Save와 Ctrl/Cmd+S는 계속 지원한다.
- editor recovery localStorage key는 현재 legacy prefix를 사용하므로 리브랜딩 시 삭제/단순 rename하지 않고 migration/fallback이 필요하다.

History / Restore / Inspection / EPUB / Print는 엔진에 있다. 제품 화면에서 숨길 수 있다. 삭제 대상이 아니다.

---

## 11. Current Phase Model

현재는 실제 구현 Phase를 기준으로 관리한다.

```text
Phase 12  Full Regression / MVP Release Gate ✅
Phase 13  Wizard Draft Recovery ✅
Phase 14  Editor Autosave / Recovery ✅
Phase 15A Local MVP Entry + Auth UI Foundation + Guest fallback ✅
Phase 15B Real Supabase Auth Runtime ⏸ HOLD
Phase 16  Ownership + DB Metadata + Storage + RLS/API Authorization ⏸ HOLD
Later     Deployment / PDF Worker / AI
Payment   Policy + UI requirements defined, implementation HOLD
```

### 11.1 Phase 15A Completion

완료 기준:

- `/` Landing
- `/library` Library
- `/__auth` Local/Auth UI foundation
- Local/Guest 새 책 진입
- safe `returnTo`
- Wizard / Editor / Preview / PDF regression PASS
- Final UI polish 완료
- 보호 책 hash 불변
- P0 / P1 = 0

### 11.2 Phase 15B Start Gate

Phase 15B는 지금 즉시 시작하지 않는다.

다음과 같은 실제 외부 사용자/배포 필요가 생길 때 재개한다.

- 계정 로그인이 실제 서비스 진입에 필요
- 구매 entitlement 복구가 필요
- 다기기/클라우드 사용이 필요
- 외부 사용자 테스트를 Local 환경 밖에서 진행

그때 전용 Chagok Web Supabase Auth Runtime을 연결하고 runtime QA를 수행한다.

### 11.3 Phase 16 Start Gate

Phase 16은 Phase 15B 이후다.

범위:

- immutable service-layer book identity
- user → book ownership
- DB metadata
- Storage boundary
- RLS / API authorization
- Guest → Account migration

Payment 구현은 이 ownership 기반 없이 시작하지 않는다.

---

## 12. Service / Pricing / Commerce Baseline

현재 제품 정책 문서:

- `_docs/SERVICE_POLICY.md` v1.1 — CURRENT
- `_docs/PRICING_POLICY.md` v1.1 — CURRENT
- `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md` v1.1 — TARGET DEFINED

초기 가격 기준:

```text
Free
  → 원고 입력 / 구조 / 디자인 / 표지 / 편집 / Preview

Book Pass
  → ₩14,900 / 책 1권
  → 해당 책 프로젝트 PDF Export entitlement
  → 같은 책 수정 후 재출력 추가 결제 없음
```

중요:

- Pricing Policy 확정 ≠ Payment 구현 시작
- 현재 Local MVP PDF는 기존 엔진 기능으로 유지
- SaaS 결제벽은 아직 연결하지 않음
- Payment는 Auth/Ownership/stable identity/server verification 전제 후 별도 Phase로 구현

---

## 13. Out of Scope for This Document

이 Product Spec 자체는 구현 코드를 작성하지 않는다.

현재 별도 Phase 또는 Later로 남겨 두는 것:

- Phase 15B Real Supabase Auth Runtime
- Phase 16 Ownership / DB / Storage / RLS
- Vercel 배포 구조
- SaaS PDF worker / queue
- Payment provider / 실제 Checkout 구현
- AI manuscript assist
- AI Cover
- Usage / Credit model
- Structured Book JSON SoT
- React/Vite 전환
- 기존 168쪽 Book migration

보호 원칙:

- 168쪽 기준책과 실제 사용자 책을 Product Spec 갱신 때문에 수정하지 않는다.
- Core Engine KEEP / WRAP 결정을 Auth/Payment/리브랜딩 때문에 뒤집지 않는다.
- Commerce stable identity는 Core `file` identity를 덮어쓰는 방식으로 만들지 않는다.

---

# Architecture Decision Summary v1.5

- Product = **차곡 (Chagok)**
- Content SoT = `book.html`
- Core book identity = `file`
- Structured Overlay = eid + editable + htmltree + blocks
- Separate Book JSON Content Model = NOT NOW
- Theme = CSS Token Layer
- Pagination = KEEP
- Viewer = KEEP
- PDF = KEEP
- Existing Book Migration = NO
- Import = TXT / MD / PDF / DOCX
- Existing Engine = KEEP / WRAP
- Wizard Draft Recovery = IMPLEMENTED
- Editor Autosave / Recovery = IMPLEMENTED
- Phase 15A = **COMPLETE**
- Phase 15B = **HOLD**
- Phase 16 = **HOLD**
- Supabase DB/Storage = **NOT YET**
- Service Policy v1.1 = **CURRENT**
- Pricing Policy v1.1 = **CURRENT**
- Book Pass = **₩14,900 / 책 1권**
- Payment UI requirements v1.1 = **TARGET DEFINED**
- Payment implementation = **HOLD**
- Next product work = **portfolio case study → representative demo → small user validation**, not backend expansion
