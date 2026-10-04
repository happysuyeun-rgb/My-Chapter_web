# My Chapter Data Specification

- Product: My Chapter
- Stage: Development Specification — Data
- Version: 1.0
- Date: 2026-10-03
- Basis: 실제 파일/코드, Product Spec v1.3, FUNCTION_SPEC, SCREEN_SPEC, ENGINE_CONTRACT
- Pair: `_docs/API_SPEC.md`

현재 저장소를 기준으로 한다. 새 DB / Supabase Schema를 만들지 않는다.

상태: CURRENT = 지금 있음. TARGET_MVP = MVP에 필요하나 아직 없거나 위치가 다름. LATER = 범위 밖.

---

## 1. Purpose

Book을 구성하는 데이터가 무엇이며 어디에 저장되는가.

---

## 2. Data Principles

1. 본문 SoT는 `book.html` 한 파일이다.
2. 없는 필드를 있는 것처럼 쓰지 않는다.
3. Overlay(eid, htmltree)는 디스크 데이터가 아니다.
4. S05–S07 임시 데이터는 현재 Persistence가 없다. TARGET_MVP는 **세션 요구**이지 구현 가정이 아니다.
5. 기존 책 마이그레이션 없음.
6. React/Vite/Supabase 데이터 모델 없음.

---

## 3. Book Identity

| 개념 | 현재 값 | Status | SoT |
|---|---|---|---|
| 운영 키 `file` | `books/<folder>/book.html` 상대 경로 | CURRENT | 경로 |
| 폴더명 | `uniqueFolder(safeName(title))`로 생성. 이후 제목과 다를 수 있음 | CURRENT | 폴더 |
| 표시 제목 | `book.html` `<title>` / 표지 h1 / 전면부 | CURRENT | HTML |
| 부제 | `p.tp-sub` 등 HTML. 목록은 summarize가 추출 | CURRENT | HTML |
| 저자 | `<meta name="author">` / 전면부 | CURRENT | HTML |
| `book.json.id` | 신규/복제 시 UUID. **Route 미사용** | CURRENT | book.json (있을 때) |
| trash id | `_trash/<timestamp>__<folder>` 디렉터리명 | CURRENT | 경로 |

목록 객체(CURRENT, `books.list()` / `summarize`):

`title, author, subtitle, folder, file, mtime, pdf?, hasCover, status, tags, coverColor, createdAt, stats?`

`id`는 list 응답에 실리지 않는다.

관련: S03, F-LIB-01, F-LIB-02, F-META-01.

---

## 4. Book HTML

**역할:** Content Source of Truth. Status: CURRENT.

포함 (디스크):

- 텍스트, 인라인 `strong`/`mark`/`em`
- section 구조와 id
- class 계약 (chapter-pro, prompt, …)
- attribute (`id`, `href`, image-slot `shape`/`fit`/`placeholder`)
- 전면 메타: `<title>`, author/description meta, 표지/속표지/판권 카피
- **포함하지 않음:** `data-eid` (서빙 시에만)

읽기: Viewer, PDF, Editor(서빙본), list summarize, lint, outline.  
쓰기: `/__edit` `/__blocks` `/__structure` `updateInfo` `create` restore.

version = sha1(원본 문자열).

관련: S10, S14, S15, F-EDITOR-*, F-EXPORT-01.

---

## 5. Book Metadata / book.json

파일: `books/<folder>/book.json`. **없을 수 있음** (검증 도서). Status: CURRENT.

코드가 읽고 쓰는 필드만:

| Field | Type | 기본 | 역할 |
|---|---|---|---|
| `status` | `"draft"` \| `"review"` \| `"done"` | draft | 서재 배지 |
| `tags` | string[] | `[]` | 서재 태그 |
| `coverColor` | 허용 hex 또는 `""` | `""` | 표지 색. 쓰면 HTML에도 적용 |
| `createdAt` | ISO string \| 없음 | create 시 | 생성 시각 |
| `id` | UUID | create/duplicate 시 | **미사용 키** |

허용 색(CURRENT): `#1C1B19` `#1F2A44` `#2D3B2F` `#5A2E2A` `#3B2F4A` `#F1EEE7`.

제목/부제/저자는 **여기 없다**. HTML.

없는 필드 (만들지 않음): `themeId`, `canonicalContent`, `userId`, `slug`.

`themeId`가 MVP에 필요하면 §10 TARGET_MVP. 지금 스키마에 넣지 않는다.

관련: S03, F-LIB-10, F-COVER-04.

---

## 6. Image State

파일: `.image-slots.state.json`. Status: CURRENT. 없어도 책 성립.

읽기: 같은 폴더에서 `fetch`.  
쓰기: JSON 객체 전체 덮어쓰기 (`POST /__state`).

키: slot `id` 문자열.

값 CURRENT:

- 구형: data URL string
- 신형: `{ u: dataURL, s: number, x: number, y: number }` (재프레임)

표지 키: `cover-image`. 본문: `slot-01` 등.

HTML 관계: `<image-slot id>`가 자리. 픽셀은 sidecar. id가 어긋나면 그림이 비는다.

History/watch 밖.

관련: S12, F-COVER-02.

---

## 7. History Data

위치: `books/<folder>/.history/`. Status: CURRENT.

파일명: `<YYYY-MM-DDTHH-mm-ss-SSS>__<reason>.html`  
예: `2026-10-03T11-16-47-892__edit.html`

스냅샷: 그 순간 직전 `book.html` 전체.

| reason | 호출 | 제품 |
|---|---|---|
| edit | `/__edit` commit | 엔진 |
| blocks | `/__blocks` | 엔진 |
| structure | `/__structure` | 엔진 |
| restore | `/__restore` | 엔진 |
| rename | `updateInfo` | 엔진 |
| cover | `applyCoverColor` | 엔진 |
| import | **미호출** | 선언만 |

list 항목: `{ id, time, reason, label, changed }`.

sidecar·book.json은 스냅샷에 없음.

관련: F-HIST-01 LATER / HIDE.

---

## 8. Import Session Data

### CURRENT

세션 Persistence 없음. `POST /__new-book` body가 한 번에 끝난다.

Request (CURRENT):

```text
title, subtitle?, author?, source?: { name, data: base64 }
```

성공 시 디스크: 새 폴더 + html/css + 선택 source/ + book.json.

### TARGET_MVP (요구만. 구현 가정 아님)

S05–S08이 확정 전 유지해야 할 **휘발 세션**:

| 필드 | 용도 | Persistence |
|---|---|---|
| method | empty \| import | 메모리 |
| title, subtitle, author | S06 | 메모리 |
| sourceBytes / pastedText / filename | S05 | 메모리 |
| parseResult (units/stats) | S07 | 메모리 |
| structureEdits | S07 수정분 | 메모리 |
| themeId | practical \| minimal | 메모리 |
| confirmed | S07 잠금 | 메모리 |

확정 전 `books/`·`source/`·사용자 원본 경로에 쓰지 않음.

서버 parse-only가 생기면 응답은 세션에만 둔다 (API-SPEC TARGET).

관련: S04–S08, F-IMPORT-*, F-STRUCT-01..06, F-NEW-*.

---

## 9. Structure Review Data

### CURRENT

열린 책: HTML section + `toc.mjs` `outlineOf` → `{ id, kind, title }[]`.  
`GET /__outline`.

S07 전용 스토어 없음.

### TARGET_MVP

세션 `parseResult` + 사용자 수정 트리.

단위: Part / Chapter (pro,ch,ap,epi) / Section(h2).

확정(F-STRUCT-06)은 세션 잠금만. 디스크는 F-GEN-01.

관련: S07, F-STRUCT-*.

---

## 10. Theme Data

### CURRENT

Theme id 파일 없음. 실체 = 각 책 `book.css` (`:root` + 컴포넌트). Template과 설계본이 Practical에 해당.

### TARGET_MVP

- 선택지: `practical` | `minimal`
- 적용: 같은 class contract + 토큰 세트 → `book.css`
- id를 기억할 자리 후보: `book.json`에 필드 추가 **또는** CSS 주석/파일명. **아직 확정하지 않음.** 여기서 스키마를 닫지 않는다.
- Preview 샘플은 디스크 SoT가 아님

Theme는 HTML을 쓰지 않는다.

관련: S08, S11, F-THEME-*.

---

## 11. Export Data

| Data | Status | 위치 | SoT? |
|---|---|---|---|
| 전체 전자책 PDF 캐시 | CURRENT | `books/<folder>/<title>.pdf` (ids/print/wm 없을 때만 write) | NO |
| EPUB / ZIP | CURRENT | 응답 바이트. 상주 아님 | NO |
| 인쇄/워터마크/발췌 | CURRENT 옵션 | 쿼리. 파일명 접미사 | NO |
| S16 성공 표시용 파일명 | TARGET_MVP | 직전 export 결과 (세션/캐시) | NO |

PDF 생성은 HTML을 변경하지 않는다.

관련: S15, S16, F-EXPORT-*, F-DONE-*.

---

## 12. Data Ownership Matrix

| Data | Status | Owner | Writer | Reader | Persistence | Source of Truth |
|---|---|---|---|---|---|---|
| book.html | CURRENT | Book | edit/blocks/structure/create/info/restore | Viewer, PDF, Editor, list | 디스크 | YES |
| book.css | CURRENT | Book | create, rename TITLE_CSS, Theme 적용(TARGET) | Viewer, PDF | 디스크 | 테마/판형 |
| book.json | CURRENT | Library | create, setInfo, duplicate | list | 디스크 (optional) | 서재 메타 |
| sidecar | CURRENT | Image slot | /__state, setCover | slot, PDF, cover | 디스크 (optional) | 그림 |
| source/ | CURRENT | Import | create 성공 시 | 보관 | 디스크 | 원본 사본 |
| .history | CURRENT | Engine | commit 직전 | history UI | 디스크 | 과거 HTML |
| PDF cache | CURRENT | Export | /__pdf 전체 | 서재 링크, S16 | 디스크 optional | NO |
| file path | CURRENT | Identity | create/move | 모든 API | 경로 | 운영 키 |
| data-eid | CURRENT | Overlay | withEditIds 응답 | Editor | 없음 | NO |
| version sha1 | CURRENT | Overlay | 원본 hash | edit/blocks/structure | 없음 | 충돌 키 |
| list embed | CURRENT | Library | GET / 생성 | S03 | 응답 | NO |
| Import session | TARGET_MVP | Wizard | S04–S08 UI | S07–S09 | 메모리 | NO |
| S07 트리 수정 | TARGET_MVP | Wizard | 사용자 | F-GEN-01 | 메모리 | NO |
| themeId | TARGET_MVP | Theme | S08/S11 | S09/S11 | 미정 | NO (실체는 CSS) |
| S16 last pdf | TARGET_MVP | Export | F-EXPORT-01 | S16 | 세션/캐시 | NO |
| AI cover job | LATER | — | — | — | — | — |
| Auth user | LATER | — | — | — | — | — |

---

## 13. Data Lifecycle

```text
[마법사 TARGET]
세션(method, meta, source, structure, theme)
  → S09 create
  → folder + book.html + book.css + book.json + source?

[기존 책 CURRENT]
open file
  → serve html + eid
  → edit/blocks/structure → snapshot + write html
  → image → sidecar
  → meta → book.json
  → pdf → 캐시 파일
  → trash → _trash
```

폐기: purge는 폴더 전체(html/css/json/sidecar/history/pdf).

복제: 폴더 복사, history·PDF skip, 새 id/createdAt.

---

## 14. Data Loss Prevention Rules

1. **Import 확정 전 기존 Book 파괴 금지.** 다른 책 폴더를 덮어쓰지 않음. 마법사 중 사용자 원본 파일 수정 금지.
2. **Save 실패 시 덮어쓰기 금지.** 409/검증 실패면 `commit` 없음. dirty 유지.
3. **Theme 변경 시 Content 변경 금지.** `book.html` 문장/class 의미 유지.
4. **Image State 누락 금지.** 슬롯 id를 바꾸면 sidecar 키를 함께 다루거나 그림을 잃는다. 제품이 id를 임의 재생성하지 않음.
5. **기존 Book Migration 금지.**
6. **PDF가 원본 Book을 변경하면 안 됨.**
7. Restore는 HTML만. sidecar는 그 시점과 어긋날 수 있음 (현재 한계, 명시).
8. 생성 실패 시 부분 폴더를 서재에 남기지 않음 (제품). CURRENT create는 성공 경로에서만 목록에 등장.

---

## 15. Current vs Target MVP

| Data | CURRENT | TARGET_MVP |
|---|---|---|
| book.html | SoT | 동일 |
| book.json 필드 | status, tags, coverColor, createdAt, id | 동일. themeId는 후보만 |
| sidecar | 위 구조 | 동일 |
| 새 책 생성 | `/__new-book` 즉시 write | S09에서만 write |
| Import 결과 | 메모리 없이 바로 HTML | S07 세션 트리 |
| Theme | CSS 파일 자체 | 토큰 세트 + 선택 id |
| S16 | 브라우저 다운로드만 | 성공 화면용 파일 핸들 |
| 붙여넣기 원고 | 없음 | 세션 텍스트 |

---

## 16. Later Data

- Auth / user workspace
- AI cover job / prompt
- Payment
- Auto Save 초안 (History와 분리해야 함)
- Structured Book JSON — NOT NOW
- ISBN 등 확장 메타
