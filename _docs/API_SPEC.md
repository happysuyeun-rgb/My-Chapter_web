# My Chapter API Specification

- Product: My Chapter
- Stage: Development Specification — API
- Version: 1.0
- Date: 2026-10-03
- Basis: `preview-server.mjs` 실제 Route, M0.5-A §14, FUNCTION_SPEC, SCREEN_SPEC
- Pair: `_docs/ENGINE_CONTRACT.md`, `_docs/DATA_SPEC.md`

현재 Route를 기준으로 기능/화면과 연결한다. 새 프레임워크를 만들지 않는다. 없는 API는 TARGET_MVP / LATER로만 적는다.

---

## 1. Purpose

기능/화면이 **어떤 Method/Path/Input/Output**으로 기존 엔진에 붙는가.

---

## 2. API Principles

1. 존재하는 Route만 CURRENT라고 쓴다.
2. Product는 가능하면 KEEP / WRAP.
3. Wizard(S04–S07)의 parse-only·세션은 TARGET_MVP. 현재 `/__new-book`은 즉시 생성이다.
4. Workspace(S10–S15)는 기존 edit / blocks / structure / state / pdf를 재사용한다.
5. 새 Error 코드를 대량 발명하지 않는다. 현재 메시지/status를 우선한다.
6. Identity 쿼리/바디 키는 `file` (경로). UUID 아님.

상태: CURRENT / WRAP / TARGET_MVP / LATER.

---

## 3. Current vs Target API

| 구분 | 의미 |
|---|---|
| CURRENT | 코드에 있고 동작함 |
| WRAP | 그 Route를 제품 화면이 그대로 씀 (시점/UI만 변경) |
| TARGET_MVP | 아직 없음. MVP 마법사/테마에 필요 |
| LATER | 제품 숨김 또는 이후 |

**CURRENT에 없는 것:** parse-only, structure-review persist, theme apply, books JSON list, export-complete, Auth.

**CURRENT 목록 공급:** `GET /`가 서재 HTML 안에 `books.list()` JSON을 심는다. 별도 `GET /__books` 없음.

---

## 4. Book APIs

### API-BOOK-01 서재 페이지 + 목록

- **Status:** CURRENT / WRAP
- **Related Function ID:** F-LIB-01, F-LIB-08, F-LIB-09
- **Related Screen:** S03
- **Method / Path:** `GET /`
- **Purpose:** 서재 HTML과 인라인 책/휴지통 목록
- **Request:** 없음
- **Response:** HTML. 본문에 `books`, `trash` 배열
- **Validation:** 없음
- **Side Effect:** 없음
- **Error:** 서버 오류
- **Persistence:** 없음
- **Existing Handler:** `libraryPage`
- **Notes:** 검색/정렬은 클라이언트. 새 list Route를 CURRENT로 만들지 않음

### API-BOOK-02 표지 썸네일

- **Status:** CURRENT
- **Related Function ID:** F-LIB-01, F-COVER-01
- **Related Screen:** S03
- **Method / Path:** `GET /__cover?file=`
- **Purpose:** 표지 이미지 바이트
- **Request:** `file`
- **Response:** 이미지 또는 404 빈 몸
- **Validation:** bookFrom
- **Side Effect:** 없음
- **Error:** 404 파일/그림 없음
- **Persistence:** 없음
- **Existing Handler:** `coverImage`

### API-BOOK-03 새 책 생성 (즉시 write)

- **Status:** CURRENT. 제품에서는 S09에서 WRAP
- **Related Function ID:** F-GEN-01, F-NEW-02, F-IMPORT-05, F-META-01..04
- **Related Screen:** CURRENT `#new-dialog`. TARGET S09
- **Method / Path:** `POST /__new-book`
- **Purpose:** Template 복사 + 치환 + 선택 Import splice + book.json
- **Request:** `{ title, subtitle?, author?, source?: { name, data: base64 } }`
- **Response:** `{ url, file, stats? }`
- **Validation:** 제목 필수. source 있으면 SUPPORTED_EXT
- **Side Effect:** 새 폴더. source/ 가능
- **Error:** 400 제목 없음. Import 실패 메시지 (본문 없음, PDF 글자 없음, 미지원 형식)
- **Persistence:** 즉시 디스크
- **Existing Handler:** `books.create`
- **Notes:** S04–S07에서 이 API를 부르면 제품 규칙(확정 전 write 금지)을 깨다. TARGET은 S09에서만 호출하거나 parse-only를 앞에 둠

### API-BOOK-04 전면 정보

- **Status:** CURRENT
- **Related Function ID:** F-META-01..03, F-COVER-03
- **Related Screen:** S12, S10
- **Method / Path:** `POST /__book/info`
- **Purpose:** 제목/부제/저자 HTML 전면부. 선택 폴더 rename
- **Request:** `{ file, title?, subtitle?, author?, renameFolder? }`
- **Response:** `{ file }` (rename 시 새 경로)
- **Validation:** 제목 `""` 불가
- **Side Effect:** HTML, history `rename`, 선택 move
- **Error:** 400 제목. 404 책 없음
- **Persistence:** HTML
- **Existing Handler:** `updateInfo`

### API-BOOK-05 서재 메타

- **Status:** CURRENT
- **Related Function ID:** F-LIB-10, F-COVER-04
- **Related Screen:** S03, S12
- **Method / Path:** `POST /__book/meta`
- **Purpose:** status / tags / coverColor
- **Request:** `{ file, status?, tags?, coverColor? }`
- **Response:** info 객체
- **Validation:** status ∈ draft|review|done. 색은 COVER_COLORS
- **Side Effect:** book.json. 색이면 HTML + history cover. reload suppress 1.5s
- **Error:** 400 알 수 없는 상태 / 고를 수 없는 색. 404
- **Persistence:** book.json ± HTML
- **Existing Handler:** `setInfo`

### API-BOOK-06 표지 업로드 (전용)

- **Status:** CURRENT
- **Related Function ID:** F-COVER-02
- **Related Screen:** S12
- **Method / Path:** `POST /__book/cover`
- **Purpose:** cover-image sidecar
- **Request:** `{ file, data: dataURL | null }`
- **Response:** `{ hasCover }`
- **Validation:** `data:image/(png|jpeg|webp|avif);base64,`
- **Side Effect:** sidecar
- **Error:** 400 형식. 404
- **Persistence:** sidecar
- **Existing Handler:** `setCover`
- **Notes:** 슬롯 드롭은 API-STATE-01과 동일 파일

### API-BOOK-07 복제

- **Status:** CURRENT
- **Related Function ID:** F-LIB-04
- **Related Screen:** S03
- **Method / Path:** `POST /__book/duplicate`
- **Request:** `{ file }`
- **Response:** `{ file }`
- **Side Effect:** 새 폴더. history/PDF skip
- **Error:** 404
- **Persistence:** 새 디스크
- **Existing Handler:** `duplicate`

### API-BOOK-08 휴지통

- **Status:** CURRENT
- **Related Function ID:** F-LIB-05
- **Related Screen:** S03
- **Method / Path:** `POST /__book/trash`
- **Request:** `{ file }`
- **Response:** `{ trashed }`
- **Side Effect:** `_trash` move
- **Error:** 404
- **Existing Handler:** `trash`

### API-BOOK-09 복원

- **Status:** CURRENT
- **Related Function ID:** F-LIB-06
- **Related Screen:** S03
- **Method / Path:** `POST /__trash/restore`
- **Request:** `{ id }` trash 디렉터리명
- **Response:** `{ file }`
- **Error:** 404 휴지통에서 찾지 못했습니다
- **Existing Handler:** `restore`

### API-BOOK-10 영구 삭제

- **Status:** CURRENT
- **Related Function ID:** F-LIB-07
- **Related Screen:** S03
- **Method / Path:** `POST /__trash/purge`
- **Request:** `{ id }`
- **Response:** `{ ok }`
- **Error:** 404
- **Existing Handler:** `purge`

### API-BOOK-11 책 HTML 서빙

- **Status:** CURRENT / WRAP
- **Related Function ID:** F-LIB-02, F-WS-01, F-PREVIEW-*
- **Related Screen:** S10, S14
- **Method / Path:** `GET /books/<folder>/book.html`
- **Purpose:** 원본 + eid 또는 `?pdf=1` 옵션
- **Request:** path. query `pdf`, `print`, `wm`, ids
- **Response:** HTML
- **Error:** 403/404
- **Existing Handler:** `serveStatic`
- **Notes:** Editor 주입은 pdf 없을 때

### API-BOOK-12 개요

- **Status:** CURRENT. 제품 S07이 아님
- **Related Function ID:** F-STRUCT-07 (참고)
- **Related Screen:** 기존 도구
- **Method / Path:** `GET /__outline?file=`
- **Response:** `{ items: [{ id, kind, title }] }`
- **Existing Handler:** `outlineOf`
- **Notes:** 디스크 HTML 기준. Import 세션용이 아님

---

## 5. Import APIs

### API-IMPORT-01 생성에 묶인 Import

- **Status:** CURRENT (API-BOOK-03의 source 분기)
- **Related Function ID:** F-IMPORT-01, F-IMPORT-03, F-IMPORT-04, F-GEN-01
- **Related Screen:** 현재 서재 대화상자
- **Method / Path:** `POST /__new-book` + `source`
- **Purpose:** 파싱 후 즉시 toc~본문 삽입
- **Request:** source.name + base64
- **Response:** `{ url, file, stats }`
- **Validation:** `.txt` `.md` `.markdown` `.pdf` `.docx`
- **Error:** `TXT, MD, PDF, DOCX 파일만 넣을 수 있어요.` / `파일에서 본문 글을 찾지 못했습니다.` / `PDF에서 글자를 찾지 못했습니다. 스캔한 이미지 PDF는 변환할 수 없어요.`
- **Persistence:** 즉시 책 + source/
- **Existing Handler:** `importManuscript` inside `create`
- **Notes:** S05 전용 Route 아님

### API-IMPORT-02 Parse only

- **Status:** TARGET_MVP
- **Related Function ID:** F-IMPORT-04, F-IMPORT-07, F-STRUCT-01
- **Related Screen:** S05 → S07
- **Method / Path:** 미정. 신규여야 함. 현재 없음
- **Purpose:** 원고 → 구조 초안. **디스크 쓰기 없음**
- **Request:** TARGET `{ name, data }` 또는 `{ text }` (붙여넣기)
- **Response:** TARGET `{ units, stats }` 또는 HTML fragment. 스키마는 구현 단계에서 parser 출력에 맞춤
- **Validation:** 동일 확장자/본문 존재
- **Error:** 위 Import 메시지 재사용
- **Persistence:** 없음
- **Existing Handler:** 없음. `importManuscript` 재사용 가능
- **Notes:** 구현하지 않음. 없으면 S05가 `/__new-book`을 부를 수밖에 없어 제품 규칙을 위반

### API-IMPORT-03 Format 검증

- **Status:** CURRENT (클라이언트 + create). 단독 Route 없음
- **Related Function ID:** F-IMPORT-03
- **Related Screen:** S05
- **Notes:** TARGET으로 새 검증 API를 만들지 않아도 됨. 클라+기존 에러면 충분

---

## 6. Structure APIs

### API-STRUCT-01 열린 책 구조 조작

- **Status:** CURRENT
- **Related Function ID:** F-STRUCT-07
- **Related Screen:** S10
- **Method / Path:** `POST /__structure`
- **Purpose:** add-chapter / add-appendix / add-part / delete-section
- **Request:** `{ file, version, op, eid }`
- **Response:** `{ version, anchor, select }`
- **Validation:** version sha1. eid 위치. 마지막 장 삭제 불가
- **Side Effect:** HTML + history `structure` + 번호/차례
- **Error:** 409 버전/eid. 400 마지막 장 / 알 수 없는 작업 / 장·파트·차례 밖
- **Persistence:** book.html
- **Existing Handler:** `structureOp`
- **Notes:** S07 세션용이 아님

### API-STRUCT-02 S07 세션 구조

- **Status:** TARGET_MVP (클라 세션 또는 미구현 서버)
- **Related Function ID:** F-STRUCT-01..06
- **Related Screen:** S07
- **Method / Path:** 없음이 기본. 서버 없이 세션 가능
- **Purpose:** 표시/수정/확정. write 없음
- **Persistence:** 없음
- **Notes:** 확정 CTA가 API-BOOK-03을 부르면 안 됨. S08을 거쳐 S09

---

## 7. Editor APIs

### API-EDIT-01 텍스트 저장

- **Status:** CURRENT
- **Related Function ID:** F-EDITOR-02, F-EDITOR-03
- **Related Screen:** S10
- **Method / Path:** `POST /__edit`
- **Purpose:** eid inner HTML 패치 + 차례 제목 동기
- **Request:** `{ file, version, changes:[{eid,tag,html}], dryRun? }`
- **Response:** `{ version, changed, tocSynced? }`
- **Validation:** eid+tag 일치. 중첩 블록 거부. unsafe URL 거부
- **Side Effect:** 변경 있으면 snapshot+write `edit`. dryRun/빈 changed는 쓰기 없음
- **Error:** 409 원본이 다른 곳에서 바뀜 / 편집 위치 못 찾음. 400 문단 안 블록 / 링크 서식
- **Persistence:** book.html
- **Existing Handler:** `applyTextEdits` + `syncTocTitles` + `commit`
- **Notes:** reload 없음. S10 WRAP

---

## 8. Block APIs

### API-BLOCK-01 블록 연산

- **Status:** CURRENT
- **Related Function ID:** F-EDITOR-04
- **Related Screen:** S10
- **Method / Path:** `POST /__blocks`
- **Purpose:** insert / delete / up / down / retype
- **Request:** `{ file, version, op, type?, eid }`
- **Response:** `{ version, anchor, select }`
- **Validation:** type ∈ BLOCK_TYPES. retype은 p|h2|h3. 표지/차례/파트/opener 금지
- **Side Effect:** 변경 시 history `blocks`
- **Error:** 409 블록/버전. 400 알 수 없는 종류 / 마지막 블록 / 맨 위·아래
- **Persistence:** book.html
- **Existing Handler:** `applyBlockOp`
- **Notes:** MAY EXTEND 타입. Route 교체 아님

---

## 9. Image State APIs

### API-STATE-01 sidecar 쓰기

- **Status:** CURRENT
- **Related Function ID:** F-COVER-02
- **Related Screen:** S12, S14 (드롭)
- **Method / Path:** `POST /__state?file=`
- **Purpose:** `.image-slots.state.json` 전체 저장
- **Request:** query `file`. body = slots JSON
- **Response:** 204
- **Validation:** bookFrom. body JSON
- **Side Effect:** sidecar 덮어쓰기. History 없음
- **Error:** 404 책. JSON 파싱 실패
- **Persistence:** sidecar
- **Existing Handler:** `POST /__state`
- **Notes:** `omelette.writeFile`이 이 경로를 호출

---

## 10. History APIs

제품 MVP HIDE. 엔진 KEEP.

### API-HISTORY-01 목록

- **Status:** CURRENT / LATER (제품 숨김)
- **Related Function ID:** F-HIST-01
- **Related Screen:** 기존 도구 패널
- **Method / Path:** `GET /__history?file=`
- **Response:** `{ items: [{id,time,reason,label,changed}] }`
- **Existing Handler:** `history.list`

### API-HISTORY-02 diff

- **Status:** CURRENT / LATER
- **Method / Path:** `GET /__history/view?file=&id=`
- **Response:** `{ total, diff }` max 300
- **Error:** 404 기록을 찾지 못했습니다

### API-HISTORY-03 복원

- **Status:** CURRENT / LATER
- **Related Function ID:** F-HIST-01
- **Method / Path:** `POST /__restore`
- **Request:** `{ file, id }`
- **Response:** `{ version }`
- **Side Effect:** snapshot+write `restore`
- **Existing Handler:** `commit(..., "restore")`

---

## 11. Viewer / Live APIs

### API-LIVE-01 Live Reload

- **Status:** CURRENT
- **Related Screen:** S10 (로컬)
- **Method / Path:** `GET /__live`
- **Purpose:** SSE `event: reload`
- **Response:** event-stream
- **Side Effect:** 구독
- **Existing Handler:** `GET /__live`
- **Notes:** 제품 SaaS에서는 유지/숨김 가능. 삭제 계약 아님

Viewer 모드/쪽 이동은 Route 없음. 브라우저 `paged_book_viewer.js`.

정적: `GET /_shared/*`, 폰트, `book.css`.

---

## 12. Export / PDF APIs

### API-EXPORT-01 PDF

- **Status:** CURRENT / WRAP (S15 Primary는 쿼리 최소)
- **Related Function ID:** F-EXPORT-01, F-EXPORT-03, F-EXPORT-04, F-EXPORT-05
- **Related Screen:** S15, S16
- **Method / Path:** `GET /__pdf?file=&ids=&print=&wm=`
- **Purpose:** Paged.js + Chrome printToPDF + pdf-lib
- **Request:** `file` 필수. `ids` 장 id 콤마. `print=1`. `wm=1`
- **Response:** application/pdf 첨부
- **Validation:** 책 존재. Chrome
- **Side Effect:** 전체·비인쇄·비wm일 때 폴더에 `.pdf` 캐시. **HTML 불변**
- **Error:** 404 책. Chrome/타임아웃 (핸들러 메시지)
- **Persistence:** 조건부 캐시
- **Existing Handler:** `renderPdf`
- **Notes:** MVP 제품은 `file`만. ids/print/wm는 HIDE

### API-EXPORT-02 EPUB

- **Status:** CURRENT / LATER HIDE
- **Related Function ID:** F-EXPORT-06
- **Method / Path:** `GET /__epub?file=`
- **Existing Handler:** `buildEpub`

### API-EXPORT-03 Web ZIP

- **Status:** CURRENT / LATER HIDE
- **Related Function ID:** F-EXPORT-07
- **Method / Path:** `GET /__web?file=`
- **Existing Handler:** `buildWebZip`

### API-EXPORT-04 Lint

- **Status:** CURRENT / LATER HIDE
- **Related Function ID:** F-LINT-01
- **Method / Path:** `GET /__lint?file=`
- **Existing Handler:** `lintBook`

S16 다운로드는 같은 PDF 응답 또는 캐시 파일. 새 Route 필수 아님 (WRAP).

---

## 13. Creation Wizard Target Flow

### CURRENT (지금)

```text
S03 #new-dialog
  → POST /__new-book { title, subtitle, author, source? }
  → 즉시 folder write
  → GET book.html
```

S04–S08 Route 없음. S07 없음.

### TARGET_MVP (제품 명세, 미구현)

```text
S04 방식 선택          API 없음
S05 업로드/붙여넣기     API-IMPORT-02 TARGET (parse, no write)
S06 메타                세션
S07 구조 검토           API-STRUCT-02 세션 (write 없음)
S08 테마                세션 + CSS 미리보기
S09 생성                API-BOOK-03 WRAP
                        입력 = 세션 메타 + (고친 구조로 source/조립) + theme
                        → 성공 시 S10 GET book.html
```

규칙: S05에서 API-BOOK-03 호출 금지.

Theme 적용이 create 이후 CSS 패치면 TARGET `API-THEME-01`이 될 수 있음. 없으면 create가 Template CSS를 그대로 쓰고 S11에서 적용. **아직 Path 없음.**

실패 시 폴더 없음. 재시도는 같은 세션으로 S09 재호출.

---

## 14. Error Handling

현재 엔진 메시지/status를 우선한다. 새 코드 체계를 대량 만들지 않음.

| 상황 | CURRENT | status |
|---|---|---|
| 책 없음 | 책 파일을 찾지 못했습니다 | 404 |
| 휴지통 없음 | 휴지통에서 찾지 못했습니다 | 404 |
| 기록 없음 | 기록을 찾지 못했습니다 | 404 |
| 제목 없음 | 책 제목을 입력해 주세요 | 400 |
| 상태 오류 | 알 수 없는 상태입니다 | 400 |
| 색 오류 | 고를 수 없는 색입니다 | 400 |
| 표지 형식 | PNG, JPEG, WebP 이미지만 | 400 |
| 미지원 Import | TXT, MD, PDF, DOCX 파일만 | 400/Error |
| 본문 없음 | 파일에서 본문 글을 찾지 못했습니다 | Error |
| 스캔 PDF | PDF에서 글자를 찾지 못했습니다… | Error |
| 버전 충돌 | 원본 파일이 다른 곳에서 바뀌었습니다… | 409 |
| eid 불일치 | 편집 위치를 원본에서 찾지 못했습니다… | 409 |
| 블록 없음 | 블록을 원본에서 찾지 못했습니다… | 409 |
| 중첩 붙여넣기 | 문단 안에 다른 문단이나 블록을… | 400 |
| unsafe | 링크 주소나 서식에 쓸 수 없는… | 400 |
| 구조 범위 | 표지·차례·파트 면은 블록 도구로… / 장이나 파트, 차례 항목 안에서만 | 400 |
| 마지막 장 | 마지막 남은 장은 지울 수 없어요 | 400 |
| 정적 거부 | 403 / not found 404 | 403/404 |

TARGET_MVP에서 제품 문장으로 감쌀 수 있음. 새 코드 테이블은 만들지 않음.

PDF/Chrome 실패는 서버 로그+HTTP 오류. 전용 코드 없음.

image state 실패: 404 file, 또는 클라 fetch 실패 (슬롯 비움).

---

## 15. API Traceability Matrix

| Screen | Function | API | Status |
|---|---|---|---|
| S03 | F-LIB-01 | API-BOOK-01 | CURRENT / WRAP |
| S03 | F-LIB-01 | API-BOOK-02 | CURRENT |
| S03 | F-LIB-02 | API-BOOK-11 | CURRENT / WRAP |
| S03 | F-LIB-03 | (없음, S04로) | TARGET 흐름 |
| S03 | F-LIB-04 | API-BOOK-07 | CURRENT |
| S03 | F-LIB-05 | API-BOOK-08 | CURRENT |
| S03 | F-LIB-06 | API-BOOK-09 | CURRENT |
| S03 | F-LIB-07 | API-BOOK-10 | CURRENT |
| S03 | F-LIB-08, F-LIB-09 | API-BOOK-01 (클라) | CURRENT |
| S03 | F-LIB-10 | API-BOOK-05 | CURRENT |
| S04 | F-NEW-01, F-NEW-02 | 없음 | TARGET_MVP 세션 |
| S05 | F-IMPORT-01..04,07 | API-IMPORT-02 | TARGET_MVP |
| S05 | (현재 대화상자) | API-IMPORT-01 / API-BOOK-03 | CURRENT (쓰지 말 것) |
| S06 | F-META-01..04 | 세션 → 이후 API-BOOK-03 | TARGET_MVP |
| S07 | F-STRUCT-01..06 | API-STRUCT-02 | TARGET_MVP 세션 |
| S07 | F-IMPORT-06 | 없음 | TARGET_MVP |
| S08 | F-THEME-01..03 | 없음 | TARGET_MVP 세션 |
| S09 | F-GEN-01..05 | API-BOOK-03 | WRAP |
| S09 | F-IMPORT-05 | API-BOOK-03 source/ | WRAP |
| S09 | F-THEME-04 | CSS in create or API-THEME-01 | TARGET_MVP |
| S10 | F-WS-01, F-LIB-02 | API-BOOK-11 | WRAP |
| S10 | F-EDITOR-02,03 | API-EDIT-01 | CURRENT |
| S10 | F-EDITOR-04 | API-BLOCK-01 | CURRENT |
| S10 | F-STRUCT-07 | API-STRUCT-01 | CURRENT |
| S10 | F-EDITOR-08, F-WS-02,03 | 클라 | CURRENT |
| S10 | F-EXPORT-01 | API-EXPORT-01 | WRAP |
| S11 | F-THEME-04 | API-THEME-01 또는 CSS write | TARGET_MVP |
| S12 | F-COVER-02 | API-STATE-01 / API-BOOK-06 | CURRENT |
| S12 | F-COVER-03 | API-BOOK-04 | CURRENT |
| S12 | F-COVER-04 | API-BOOK-05 | CURRENT |
| S14 | F-PREVIEW-01..04 | API-BOOK-11 + Viewer JS | CURRENT |
| S14 | — | API-LIVE-01 | CURRENT |
| S15 | F-EXPORT-01,03 | API-EXPORT-01 | CURRENT / WRAP |
| S16 | F-EXPORT-02 | API-EXPORT-01 응답/캐시 | WRAP |
| S16 | F-DONE-01,02 | 없음 (내비) | TARGET_MVP UI |
| — | F-HIST-01 | API-HISTORY-01..03 | CURRENT / LATER HIDE |
| — | F-LINT-01 | API-EXPORT-04 | CURRENT / LATER HIDE |
| — | F-EXPORT-06 | API-EXPORT-02 | CURRENT / LATER HIDE |
| — | F-EXPORT-07 | API-EXPORT-03 | CURRENT / LATER HIDE |
| S01 | F-LAND-01 | 없음 | LATER |
| S02 | F-AUTH-01 | 없음 | LATER |
| S13 | F-AICOVER-01 | 없음 | LATER |
| S17 | F-PAY-01 | 없음 | LATER |

`API-THEME-01`은 Path 없는 TARGET 자리표시. CURRENT Route로 쓰지 않음.

---

## 16. Unknowns

- parse-only를 서버 Route로 둘지, 생성 직전 클라에서 구조를 HTML로 조립해 `/__new-book`에 넣을지 (후자면 API-IMPORT-02 없이 source만으로 S07을 재현하기 어려움).
- Theme 적용을 create 시 CSS 치환으로 둘지, 별도 write인지.
- S16이 캐시 PDF 경로를 쓰는지, 방금 받은 blob만 쓰는지.
- `GET /` 인라인 목록을 제품 셸이 그대로 쓰는지.
- Chrome 부재 시 PDF 오류 문구의 고정 문자열.
- `import` history reason을 create에 연결할지 (현재 미호출).

이 Unknown은 구현 단계에서 고른다. 이 문서에서 Route를 만들지 않는다.
