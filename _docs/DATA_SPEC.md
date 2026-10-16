# 차곡 Data Specification

- Product: 차곡
- Stage: Development Specification — Data
- Version: **1.1**
- Date: 2026-10-16
- Status: **CURRENT / IMPLEMENTATION BASELINE**
- Basis: 실제 파일/코드, Product Spec v1.4, FUNCTION_SPEC v1.1, SCREEN_SPEC v1.1, ENGINE_CONTRACT
- Pair: `_docs/API_SPEC.md`, `_docs/PHASE_15_AUTH_FOUNDATION.md`

현재 저장소를 기준으로 한다. Phase 15에서는 Supabase Auth session만 도입하며 DB / Storage schema는 만들지 않는다.

상태: CURRENT = 지금 있음. PHASE15_TARGET = Phase 15에서 변경 예정. LATER = 이후 범위.

---

## 1. Purpose

Book을 구성하는 데이터가 무엇이며 어디에 저장되는가.

---

## 2. Data Principles

1. 본문 SoT는 `book.html` 한 파일이다.
2. 없는 필드를 있는 것처럼 쓰지 않는다.
3. Overlay(eid, htmltree)는 디스크 데이터가 아니다.
4. S04–S08 Wizard state는 **Phase 13 localStorage draft recovery가 CURRENT**다. File object/base64는 저장하지 않는다.
5. S10 Editor에는 **Phase 14 local recovery + autosave state가 CURRENT**다.
6. 기존 책 마이그레이션 없음.
7. React/Vite 데이터 모델은 없다.
8. Supabase는 Phase 15 Auth session에만 사용한다. DB books / Storage / ownership schema는 아직 없다.

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

## 8. Wizard Session / Draft Data

### CURRENT — in-memory state

S04–S08 Wizard는 browser state에서 다음을 유지한다.

| 필드 | 용도 |
|---|---|
| method | `empty` \| `import` |
| source | text 또는 file metadata |
| parseResult | `/__parse` 결과 |
| parseState | idle / success 등 |
| structureDraft | S07 사용자 수정 구조 |
| structureDirty | 구조 수정 여부 |
| structureConfirmed | 구조 확정 여부 |
| themeId | practical \| minimal |
| meta | title / subtitle / author |

### CURRENT — localStorage recovery

키:

```text
mychapter:wizard-draft:v1
```

Legacy prefix는 기존 사용자 draft와 연결될 수 있으므로 단순 rename/delete 금지. `chagok:` prefix로 바꿀 경우 migration/fallback이 필요하다.

Schema:

```json
{
  "version": 1,
  "savedAt": "ISO",
  "step": "method|input|meta|structure|theme|generate",
  "state": {
    "method": "empty|import|null",
    "source": {},
    "parseResult": {},
    "parseState": "string",
    "structureDraft": [],
    "structureDirty": false,
    "structureConfirmed": false,
    "themeId": "practical|minimal",
    "meta": {
      "title": "",
      "subtitle": "",
      "author": ""
    }
  }
}
```

저장 규칙:
- debounce 400ms
- TTL 7일
- invalid/corrupt/expired draft는 무시 후 제거
- 생성 성공 또는 새로 시작 시 clear
- 생성 실패 시 보존

Text source:

```text
{ kind: "text", text: "..." }
```

File source:

```text
{
  kind: "file",
  name,
  size,
  type,
  lastModified,
  needsReselect: true
}
```

File object와 file base64는 localStorage에 넣지 않는다.

같은 파일 재선택:
- fingerprint 일치 → parse/structure state 복구
- 다름 → 기존 구조 clear 후 재분석

확정 전 `books/`·`source/`·사용자 원본 경로에 쓰지 않는다.

관련: S04–S08, F-NEW-03..05, F-IMPORT-*, F-STRUCT-01..06.

---

## 9. Structure Review Data

### CURRENT

열린 책: HTML section + `toc.mjs` `outlineOf` → `{ id, kind, title }[]`.  
`GET /__outline`.

S07는 Wizard in-memory `parseResult` + `structureDraft`를 사용하며, Phase 13 localStorage draft에 복구용으로 저장한다.

단위: Part / Chapter (pro,ch,ap,epi) / Section(h2).

확정(F-STRUCT-06)은 세션 잠금만. 디스크는 F-GEN-01.

관련: S07, F-STRUCT-*.

---

## 10. Theme Data

### CURRENT

선택지:
- `practical`
- `minimal`

실체:
- 각 책 `book.css`
- CSS 주석 `/* my-chapter-theme: practical|minimal */`
- `GET /__theme`으로 읽기
- `POST /__theme`으로 적용

Theme id는 `book.json`에 저장하지 않는다.
Preview sample은 디스크 SoT가 아니다.
Theme은 `book.html`을 쓰지 않는다.

관련: S08, S11, F-THEME-*.

---

## 11. Export Data

| Data | Status | 위치 | SoT? |
|---|---|---|---|
| 전체 전자책 PDF 캐시 | CURRENT | `books/<folder>/<title>.pdf` (ids/print/wm 없을 때만 write) | NO |
| EPUB / ZIP | CURRENT | 응답 바이트. 상주 아님 | NO |
| 인쇄/워터마크/발췌 | CURRENT 옵션 | 쿼리. 파일명 접미사 | NO |
| S16 성공 표시용 파일명/상태 | CURRENT UI | 직전 export 결과 / Workspace state | NO |

PDF 생성은 HTML을 변경하지 않는다.

관련: S15, S16, F-EXPORT-*, F-DONE-*.

---

## 12. Editor Autosave / Recovery Data

### CURRENT

Autosave timing:
- save debounce: 1500ms
- recovery write debounce: 400ms

Recovery key:

```text
mychapter:editor-recovery:v1:<encoded file>
```

Legacy prefix는 기존 recovery와 연결될 수 있으므로 migration 없이 rename/delete 금지.

Schema:

```json
{
  "version": 1,
  "file": "books/<folder>/book.html",
  "baseVersion": "<sha1>",
  "savedAt": "ISO",
  "changes": [
    {
      "eid": "...",
      "tag": "...",
      "html": "..."
    }
  ]
}
```

규칙:
- dirty change가 있을 때만 recovery write
- baseVersion이 현재 server version과 같을 때만 자동 복구 후보
- stale recovery는 자동 적용하지 않음
- 복구 선택 → DOM 복원 → dirty → autosave
- 409 conflict → autosave pause, dirty/recovery 유지, 자동 재전송 금지
- manual Save / Ctrl+S 유지
- save race 방지를 위해 eid별 dirty revision / submitted snapshot 사용

관련: S10, F-EDITOR-09..11.

---

## 13. Auth Session Data

### CURRENT CODE / INFRA PENDING

Storage key:

```text
chagok-auth-v1
```

Supabase client options:
- `persistSession: true`
- `autoRefreshToken: true`
- `detectSessionInUrl: true`

현재 `_shared/auth.js`의 URL / publishable key는 비어 있으며 전용 `Chagok Web` 연결이 pending이다.

Auth data의 역할:
- 로그인 여부
- user/session
- Landing CTA state
- Library account UI

아직 하지 않는 것:
- Book ownership
- `book.json.userId`
- server API authorization
- DB metadata
- Storage path ownership
- RLS

이 경계는 Phase 16에서 설계한다.

---

## 14. Data Ownership Matrix

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
| Wizard state | CURRENT | Wizard | S04–S08 UI | S04–S09 | memory + localStorage | NO |
| Wizard file fingerprint | CURRENT | Wizard | file 선택 | recovery | localStorage | NO |
| S07 트리 수정 | CURRENT | Wizard | 사용자 | F-GEN-01 | memory + localStorage | NO |
| Theme marker | CURRENT | Theme | /__theme | S08/S11/Viewer/PDF | book.css | NO |
| Editor recovery | CURRENT | Editor | dirty change | S10 recovery | localStorage | NO |
| Auth session | Phase 15 CURRENT code / infra pending | Auth | Supabase browser SDK | S01/S02/S03 | browser storage | NO ownership |
| S16 last pdf | CURRENT UI | Export | F-EXPORT-01 | S16 | response / disk cache | NO |
| AI cover job | LATER | — | — | — | — | — |

---

## 15. Data Lifecycle

```text
[Wizard CURRENT]
memory state
  ↔ localStorage draft recovery
  → POST /__parse (no book write)
  → S09 create
  → folder + book.html + book.css + book.json + source?

[Editor CURRENT]
open file
  → serve html + eid
  → dirty state
  ↔ localStorage editor recovery
  → autosave/manual save
  → edit/blocks/structure → snapshot + write html

[Auth Phase 15]
Supabase browser session
  → Landing/Library UI state
  → 아직 Book ownership과 연결 안 됨

[Book CURRENT]
image → sidecar
meta → book.json
theme → book.css
pdf → cache
trash → _trash
```

폐기: purge는 폴더 전체(html/css/json/sidecar/history/pdf).

복제: 폴더 복사, history·PDF skip, 새 id/createdAt.

---

## 16. Data Loss Prevention Rules

1. **Import 확정 전 기존 Book 파괴 금지.** 다른 책 폴더를 덮어쓰지 않음. 마법사 중 사용자 원본 파일 수정 금지.
2. **Save 실패 시 덮어쓰기 금지.** 409/검증 실패면 `commit` 없음. dirty 유지.
3. **Theme 변경 시 Content 변경 금지.** `book.html` 문장/class 의미 유지.
4. **Image State 누락 금지.** 슬롯 id를 바꾸면 sidecar 키를 함께 다루거나 그림을 잃는다. 제품이 id를 임의 재생성하지 않음.
5. **기존 Book Migration 금지.**
6. **PDF가 원본 Book을 변경하면 안 됨.**
7. Restore는 HTML만. sidecar는 그 시점과 어긋날 수 있음 (현재 한계, 명시).
8. 생성 실패 시 부분 폴더를 서재에 남기지 않음.
9. Wizard / Editor recovery legacy key는 migration 없이 rename/delete 금지.
10. 409 conflict 시 editor recovery/dirty를 유지하고 자동 재전송 금지.
11. Logout은 local books / recovery / source 폴더 삭제 동작이 아니다.
12. Auth session을 Book ownership으로 간주하지 않는다.

---

## 17. Current vs Target

| Data | CURRENT | NEXT |
|---|---|---|
| book.html | Content SoT | 동일 |
| book.json | status, tags, coverColor, createdAt, id | Phase 16 ownership metadata와 관계 설계 |
| sidecar | image slot state | SaaS Storage 이전 경계 설계 |
| 새 책 생성 | S09에서만 write | 동일 |
| Import parse | `POST /__parse` no-write | 동일 |
| Wizard draft | localStorage + 7일 TTL | 필요 시 key migration |
| S07 구조 | memory + draft recovery | 동일 |
| Theme | book.css marker + GET/POST /__theme | 동일 |
| Editor autosave | 1500ms + local recovery | SaaS concurrency와 재검토 |
| Editor recovery | localStorage per file | cloud ownership 이후 path identity 재검토 |
| Auth | browser Supabase session | Phase 16 ownership / server auth |
| S16 | Product 완료 UI + PDF response/cache | SaaS worker 이후 다운로드 계약 재검토 |

---

## 18. Later Data

- User ↔ Book ownership
- Supabase DB metadata
- Supabase Storage
- RLS / server API authorization
- AI cover job / prompt
- Payment / usage / credit
- Structured Book JSON — NOT NOW
- ISBN 등 확장 메타
