# 차곡 Engine Contract

- Product: 차곡
- Stage: Development Specification — Engine Contract
- Version: **1.1**
- Date: 2026-10-16
- Status: **CURRENT / IMPLEMENTATION BASELINE**
- Basis: Product Spec v1.4, M0.5-A/B, FUNCTION_SPEC v1.1, SCREEN_SPEC v1.1
- Pair: `_docs/DATA_SPEC.md`, `_docs/API_SPEC.md`, `_docs/PHASE_15_AUTH_FOUNDATION.md`

신규 Product UI가 **기존 엔진을 깨지 않고** 지켜야 하는 계약이다. Architecture를 바꾸기 위한 문서가 아니다.

---

## 1. Purpose

Product Layer는 기존 Book 관리/편집 엔진 위에 앉는다.

```text
Product / Service UI
  → 기존 API / 기존 Viewer·Editor
  → book.html (SoT)
  → overlay + book.css + Paged.js
  → Preview / PDF
```

이 문서의 질문: **무엇을 지키면 엔진이 깨지지 않는가?**

이 문서는 엔진 경계를 정의한다. Product/Service Layer의 Route/Auth 추가가 이 계약을 바꾸지는 않는다.

---

## 2. Architecture Baseline

뒤집지 않음.

| Decision | Value |
|---|---|
| Content SoT | `book.html` |
| Overlay | `data-eid` + `editable` + `htmltree` + `blocks` (+ `toc.mjs`) |
| Book JSON Content Model | NOT NOW |
| Theme | CSS Token Layer |
| Pagination / Viewer / PDF | KEEP |
| Existing Book Migration | NO |
| Import | TXT / MD / PDF / DOCX |
| Engine | KEEP / WRAP |
| React / Vite | Core Engine에 NOT USED |
| Supabase | **Core Engine에 NOT USED.** Phase 15 Service/Auth layer에서만 사용하며 DB/Storage는 아직 없음 |

분류 어휘: MUST PRESERVE / MUST USE / MAY WRAP / MAY EXTEND / DO NOT REPLACE / LATER.

---

## 3. Book Contract

책 하나 = `books/<folder>/` 디렉터리. Identity 운영 키 = `file` = 워크스페이스 상대 경로 (`books/<folder>/book.html`).

| 항목 | 책임 | Classification |
|---|---|---|
| Folder | 책의 디스크 단위. `safeName(title)`로 만들 수 있으나 이후 제목과 달라도 됨 | MUST PRESERVE |
| `book.html` | 본문·구조·전면 메타의 SoT. 편집/히스토리/미리보기/PDF의 입력 | MUST PRESERVE |
| `book.css` | 판형·`@page`·컴포넌트 규칙·현재 테마 실체 | MUST PRESERVE |
| `book.json` | 서재 메타만. 본문 아님. **없을 수 있음** | MAY WRAP |
| `.image-slots.state.json` | 슬롯 채움. HTML 아님. **없을 수 있음** | MUST USE |
| `source/` | Import 원본 사본. 확정 후에만 | MAY WRAP |
| `.history/` | HTML 전체 스냅샷. 제품 UI HIDE 가능 | MUST PRESERVE |
| `<title>.pdf` | 전체 전자책 PDF 캐시. 원본 아님 | MAY WRAP |
| `_shared` fonts/scripts | Viewer/Editor 계약 로드 | MUST USE |
| `_template/` | 새 책 골격 | MUST USE |

규칙:

- Product는 폴더를 다른 포맷으로 바꾸지 않는다.
- `book.json.id`는 있어도 Route 키가 아니다.
- 168쪽 설계본을 변환하지 않는다.
- 자산(폰트)은 `_shared`를 가리킨다. 책 폴더로 복사하지 않는 현재 방식을 유지한다.

관련: S03, S10, F-LIB-*, F-GEN-01.

---

## 4. Content Contract

SoT는 **디스크 `book.html` 문자열**이다. Overlay는 대체물이 아니다.

| Layer | 역할 | 디스크 | Classification |
|---|---|---|---|
| `book.html` | 텍스트, section 구조, class, attribute, 전면 제목 | YES | MUST PRESERVE |
| `data-eid` / `data-etag` | 서빙 시 `withEditIds`가 붙이는 순서 인덱스. 저장 위치 키 | NO | MUST USE |
| `editable.mjs` | 편집 가능 태그 스캔, sha1 version, inner 패치 | — | MUST USE |
| `htmltree.mjs` | 위치 보존 트리. 슬라이스 패치. JSON 문서 아님 | — | MUST USE |
| `blocks.mjs` | 장 unit 삽입/이동/삭제/retype. 10종 fragment | — | MAY EXTEND |
| `toc.mjs` | 장/부 추가·삭제·번호·차례 동기 | — | MUST USE |

명시:

- Overlay round-trip은 원본 슬라이스일 때 LOSSLESS. 트리 직렬화로 HTML을 다시 만들면 안 된다.
- Block Model / 신규 Book JSON을 SoT로 올리지 않는다 (DO NOT REPLACE).
- `blocks` 타입은 필요 시 점진 확장. 28종 한 번에 확장 금지 (MAY EXTEND).
- Import 결과는 기본 구조만. 설계본 상한을 처음부터 요구하지 않는다.

관련: S10, F-EDITOR-*, F-STRUCT-07.

---

## 5. Editor Contract

기존 `book_editor.js` KEEP. S10은 **WRAP**만. 내부를 새로 구현하지 않는다 (DO NOT REPLACE).

### 5.1 Editor가 요구하는 입력

서빙된 `book.html`에 다음이 있어야 한다.

- Viewer HTML Contract (섹션 6)와 같은 로드
- `?pdf`가 아닐 때 서버 주입: `window.__bookEdit = { file, version }`, `omelette.writeFile`, `/__live`, editor/tools, `data-eid`

없으면 편집·저장·그림 쓰기가 깨진다.

### 5.2 동작 계약

| 동작 | 계약 | Route |
|---|---|---|
| 텍스트 저장 | dirty eid → `{file, version, changes:[{eid,tag,html}]}`. 성공 시 새 sha1. 쪽 나눔 유지 | `POST /__edit` |
| 블록 | 선저장 후 `{file, version, op, type, eid}`. 성공 시 reload+anchor | `POST /__blocks` |
| 구조 | 장/부록/파트 추가·삭제. opener/표지/차례/파트 본문은 블록 도구 금지 | `POST /__structure` |
| version | 원본 전체 sha1. 불일치 409 | `versionOf` |
| History | commit 직전 HTML 스냅샷 | `edit` / `blocks` / `structure` |
| Live Reload | watch → SSE. commit은 1.5s suppress | `GET /__live` |

Product 셸(S10)은 저장 상태·탭·PDF 버튼을 **바깥에** 둘 수 있다. Editor 패치 로직을 복제하지 않는다.

관련: S10, F-EDITOR-01..08, F-STRUCT-07, F-WS-*.

---

## 6. Viewer Contract

기존 Single / Spread / Grid KEEP. DO NOT REPLACE.

외부(또는 Template/Import) HTML이 Viewer에 붙으려면:

### 6.1 필수 로드

```text
../../_shared/fonts/PretendardVariable.woff2
../../_shared/image_slot.js
PagedConfig.before = fonts.load(...)
PagedConfig.after  = __pbv_attach()
../../_shared/paged.polyfill.js
../../_shared/paged_book_viewer.css
../../_shared/paged_book_viewer.js
book.css
```

### 6.2 HTML structure / class

| 역할 | 패턴 |
|---|---|
| 표지 | `section.cover` 선택 `#cover-image` |
| 속표지 | `section.titlepage` |
| 판권 | `section.colophon` |
| 차례 | `section.toc#toc` |
| 파트 | `section.part` |
| 장 | `section.chapter.chapter-{pro,ch,ap,epi}` |
| 오프너 | `header.opener` |

뷰어는 React 트리를 모른다. Paged.js가 만든 `.pagedjs_page`만 찾는다.

### 6.3 CSS / Image / Font

- 판형·쪽번호·TOC 번호는 **그 책의 `book.css`**에 묶인다. HTML만 같고 CSS가 다르면 PARTIAL.
- 그림은 `<image-slot id>` + 형제 sidecar.
- 폰트는 `_shared` Pretendard / JBM.

호환: **PARTIAL** (M0.5-A). 계약+같은 `@page` 규칙을 지키면 붙는다.

관련: S14, F-PREVIEW-01..04.

---

## 7. Pagination Contract

Paged.js + `book.css` `@page` DO NOT REPLACE.

| 항목 | 현재 코드 |
|---|---|
| 나눔 실행 | 브라우저 로드마다 Paged.js |
| 글 저장 `/__edit` | **재나눔 없음** |
| 블록/구조 | reload → 재나눔 |
| resize | 폭 클래스·spread→single. Paged.js 재실행 없음 |
| Theme 변경 | CSS만 바꾸면 **reload 후에야** 쪽 나눔이 다시 돈다. 토큰만 라이브 패치하면 기존과 같이 재실행이 없다 |

Product UI 규칙:

- Pagination 엔진 내부를 수정하지 않는다.
- Theme 적용(S11) 후 Preview가 최신 판형을 보려면 **페이지 reload 또는 기존 Viewer 재attach 수준**이어야 한다. 새 엔진 금지.
- 저장되지 않은 글은 Preview/PDF에 없을 수 있다 (기존).

관련: S11, S14, S15, F-THEME-04, F-PREVIEW-*.

---

## 8. Theme Contract

Theme는 Content를 바꾸지 않는다.

```text
동일 book.html class contract
+ CSS Token Layer
```

MAY WRAP / MAY EXTEND (`book.css` 토큰). HTML SoT DO NOT REPLACE.

| 바꿔도 됨 | 바꾸면 안 됨 |
|---|---|
| `--paper` `--ink` `--accent` 등 색 | section 종류, id, TOC href |
| 본문/제목 글꼴·크기·행간 | prompt/checklist 등 **클래스 의미** |
| `@page` 여백·머리글 스타일 | 문장, mark, 목록 항목 |
| 상자 바닥색·테두리 | image-slot id, sidecar 키 |
| step-tag 모양 | opener/part 마크업 삭제 |

Practical = 현재 Template/설계본 토큰. Minimal = 같은 선택자, 다른 토큰.

Theme 선택은 현재 `book.css`에 CSS 주석 `/* my-chapter-theme: practical|minimal */`로 기록한다. `book.json.themeId`는 사용하지 않는다. `GET/POST /__theme`이 이 계약을 읽고 쓴다.

관련: S08, S11, F-THEME-*.

---

## 9. Image Contract

MUST USE.

- 파일: 책 폴더 `.image-slots.state.json`
- 키: `<image-slot id>`. 표지 `cover-image`
- 값: data URL 문자열 또는 `{u,s,x,y}`
- 읽기: `image_slot.js` `fetch('.image-slots.state.json')`
- 쓰기: `omelette.writeFile` → `POST /__state?file=<book.html>`
- HTML은 슬롯 **자리**만. 픽셀은 sidecar
- PDF는 같은 컴포넌트, omelette 없어 읽기 전용
- watch가 sidecar를 무시 → Live Reload로 그림만 바꿔도 HTML reload 없음
- History는 HTML만. 그림은 스냅샷 밖

관련: S12, S14, F-COVER-02, API-STATE-01.

---

## 10. History / Restore Contract

MUST PRESERVE. 제품 UI는 HIDE 가능 (LATER 노출).

- 위치: `.history/<ISO>__<reason>.html`
- 내용: 저장 **직전** HTML 전체. 델타 아님
- reason: `edit` `blocks` `structure` `restore` `rename` `cover` (`import`는 선언만, create가 snapshot 안 함)
- 최근 50 + 하루 하나 prune
- Restore: 스냅샷을 다시 write, reason `restore`

### Auto Save / Recovery / Live Reload Guardrail

Phase 14에서 Auto Save / Recovery를 구현했다.

현재 계약:

- Auto Save debounce = 1500ms
- Local Recovery write debounce = 400ms
- 한 번에 하나의 `/__edit` 요청만 진행
- save 요청 이후 발생한 새 수정은 성공 응답으로 잘못 clean 처리하지 않음
- manual Save / Ctrl/Cmd+S 유지
- 409 conflict → autosave pause + dirty/recovery 보존 + 자동 재전송 금지
- stale recovery는 자동 적용하지 않음
- block/structure op 전에 dirty flush. save 실패 시 해당 op 중단

History guardrail:

- 매 키 입력마다 `commit`+전체 스냅샷 금지
- autosave는 debounce로 history 폭증을 제한
- sidecar 변경은 History에 안 남음
- rename/cover는 별도 경로이며 autosave와 혼합하지 않음

Recovery key는 legacy `mychapter:editor-recovery:v1:<file>`를 사용 중이다. migration 없이 rename/delete 금지.

관련: F-HIST-01, F-EDITOR-09..11, API-HISTORY-*, API-EDIT-01.

---

## 11. PDF Contract

DO NOT REPLACE. Preview와 **PARTIAL shared rules**.

공유: 같은 `book.html`, `book.css`, Paged.js, image-slot+sidecar, TOC `target-counter`.

차이:

| | Preview | PDF |
|---|---|---|
| URL | 책 경로 | 같은 HTML + `?pdf=1` |
| Editor 주입 | 있음 | 없음 |
| `print=1` | 없음 | 176×246 + crop/bleed |
| `wm=1` | 없음 | 워터마크 |
| `ids` | 없음 | 장 발췌 |
| 글 저장 직후 | 재나눔 전일 수 있음 | 디스크 저장본만 |

Product Primary: 전체 전자책 PDF (`print`/`wm`/`ids` 없음). 고급 옵션 KEEP / HIDE.

PDF는 원본 `book.html`을 수정하지 않는다. 전체 화면용만 폴더에 `.pdf` 캐시.

관련: S15, S16, F-EXPORT-01..03, API-EXPORT-01.

---

## 12. Import Contract

MUST USE parser. 생성 흐름은 MAY WRAP.

Import 역할: Raw Manuscript → **기본 Book Structure**.

만듦: toc, part, chapter-{pro,ch,ap,epi}, p, h2, h3, ul, ol, `strong`.

안 만듦: prompt, checklist, figure, table.grid, 설계 상자, flow, wire, STEP, kv, fill.

표지/속표지/판권은 Template 앞부분.

### CURRENT

| 단계 | 현재 동작 |
|---|---|
| S05 | `POST /__parse`로 parse-only. 디스크 write 없음 |
| S06 | metadata client state |
| S07 | structure client state + Phase 13 draft recovery |
| S08 | theme client state |
| S09 | `POST /__new-book { ..., themeId }`에서 첫 실제 book write + 선택 Theme CSS 적용 |
| S11 Theme 변경 | 기존 책에 `POST /__theme` |

원본 source 사본은 생성 확정 후에만 책 폴더에 보관한다.

S07 확정 전 destructive write 금지는 이제 **현재 제품 동작 계약**이다.

관련: S05–S09, F-IMPORT-*, F-STRUCT-*, F-GEN-01.

---

## 13. Workspace Integration Contract

S10 Workspace Shell은 구현되었고 기존 엔진을 WRAP한다.

```text
셸: 서재 / 제목 / 저장 상태 / PDF / 탭
  원고     → 기존 Editor   MUST USE
  디자인   → Theme UI      MAY WRAP (CSS만)
  표지     → cover+slot    MUST USE
  미리보기 → 기존 Viewer   MUST USE
```

금지: Editor/Viewer/Paged.js 재구현, 탭마다 다른 SoT, 미저장 본문으로 PDF 성공 처리.

관련: S10–S15, F-WS-*.

---

## 14. Existing Engine Guardrails

1. `book.html`을 JSON으로 바꾸지 않는다.
2. Paged.js / Viewer 세 모드 / PDF 파이프라인을 교체하지 않는다.
3. 168쪽 책을 migrate하지 않는다.
4. eid를 디스크에 심지 않는다 (현재 계약).
5. htmltree를 직렬화 SoT로 쓰지 않는다.
6. History 전체 스냅샷을 키 입력 단위 저장에 연결하지 않는다. Auto Save는 debounce 계약을 유지한다.
7. 409 conflict 후 자동 재전송으로 덮어쓰지 않는다.
8. Recovery legacy key를 migration 없이 rename/delete하지 않는다.
9. Import 실패/마법사 취소를 부분 폴더로 남기지 않는다.
10. Print/EPUB/ZIP/History/Lint를 삭제하지 않는다. HIDE만.
11. PDF가 HTML/sidecar를 쓰지 않는다.
12. Theme가 class 의미를 지우지 않는다.
13. Phase 15 Auth 도입 때문에 book.html/file identity 계약을 바꾸지 않는다.
14. Auth session을 Book ownership으로 취급하지 않는다.

---

## 15. Contract Matrix

| Area | Contract | Classification | Related Screen | Related Function |
|---|---|---|---|---|
| book.html | Content SoT | MUST PRESERVE | S10, S14, S15 | F-EDITOR-*, F-EXPORT-01 |
| book.css | 판형+테마 실체 | MUST PRESERVE | S08, S11, S14 | F-THEME-04 |
| book.json | 서재 메타 | MAY WRAP | S03 | F-LIB-10 |
| image sidecar | 슬롯 픽셀 | MUST USE | S12, S14 | F-COVER-02 |
| .history | HTML 스냅샷 | MUST PRESERVE | — | F-HIST-01 |
| data-eid | 서빙 인덱스 | MUST USE | S10 | F-EDITOR-02 |
| editable | 패치/version | MUST USE | S10 | F-EDITOR-02 |
| htmltree | 위치 트리 | MUST USE | S10 | F-EDITOR-04, F-STRUCT-07 |
| blocks | 10종 팔레트 | MAY EXTEND | S10 | F-EDITOR-04 |
| toc.mjs | 장/부 | MUST USE | S10 | F-STRUCT-07 |
| Editor | book_editor.js | DO NOT REPLACE / MAY WRAP | S10 | F-EDITOR-*, F-WS-01 |
| Viewer | Single/Spread/Grid | DO NOT REPLACE / MAY WRAP | S14 | F-PREVIEW-* |
| Paged.js | 쪽 나눔 | DO NOT REPLACE | S14, S15 | F-PREVIEW-*, F-EXPORT-01 |
| PDF | Chrome+pdf-lib | DO NOT REPLACE | S15, S16 | F-EXPORT-01 |
| Import parser | 기본 구조 | MUST USE | S05, S09 | F-IMPORT-04, F-GEN-01 |
| New-book route | 즉시 생성 | MAY WRAP | S09 | F-GEN-01 |
| Library | library.html | MAY WRAP | S03 | F-LIB-* |
| Theme tokens | CSS only | MAY EXTEND | S08, S11 | F-THEME-* |
| Live Reload | SSE | MUST PRESERVE (로컬) | S10 | — |
| Auto Save | book_editor.js | MUST PRESERVE / MAY WRAP | S10 | F-EDITOR-09 |
| Editor Recovery | localStorage recovery | MUST PRESERVE until migration | S10 | F-EDITOR-10, F-EDITOR-11 |
| AI Cover | — | LATER | S13 | F-AICOVER-01 |

---

## 16. Service/Auth Boundary

Phase 15의 Landing / Auth / Library routing은 Product/Service Layer 변화다.

엔진 관점에서 유지되는 것:

- book identity = `file`
- local book folder contract
- book.html SoT
- Editor / Viewer / Paged.js / PDF
- Theme / sidecar / history

Phase 15의 Supabase Auth는 browser session만 추가한다.

Phase 16 전까지:
- Book ownership 없음
- DB metadata 없음
- Supabase Storage 없음
- server API authorization 없음

따라서 Auth 도입을 이유로 엔진 파일 구조나 SoT를 변경하면 안 된다.

---

## 17. Breaking Change Definition

다음을 하면 계약을 깨는 것이다.

- SoT를 JSON/Block Model로 교체
- eid 없이 다른 키로 저장을 재작성
- Paged.js 제거 또는 자체 쪽나눔
- Viewer 세 모드 제거
- PDF를 스크린샷/다른 엔진으로 교체
- 기존 책 HTML을 일괄 변환
- Theme 적용이 본문 문장/section을 재생성
- Import가 설계본 전 Component를 필수화
- History/Print/EPUB 파일·Route 삭제
- 마법사 중 사용자 원본 파일 수정

허용 (비파괴):

- Library/New-book/Editor를 셸로 감싸기
- `/__new-book`을 S09에서만 호출
- parse-only TARGET API 추가 (기존 create 유지)
- `book.css` 토큰 세트 추가
- blocks 타입 소수 추가
- 제품에서 History/고급 Export 숨김
