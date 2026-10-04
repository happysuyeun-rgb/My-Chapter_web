# My Chapter Regression Baseline

- Stage: Phase 0 — Baseline / Regression Guard
- Date: 2026-10-03
- Book: `books/내 포트폴리오, AI로 직접 만들기`
- Code changes this phase: none
- This file only: hash and verification record

원본 `book.html` / `book.css`는 수정하지 않았다. 이 Phase에서 제품 코드를 바꾸지 않았다.

---

## 1. Identity

| Field | Value |
|---|---|
| Folder | `books/내 포트폴리오, AI로 직접 만들기` |
| `file` | `books/내 포트폴리오, AI로 직접 만들기/book.html` |
| `book.json` | 없음 (목록 노출·열기 정상) |
| sidecar | 없음 |

---

## 2. Source hashes (SHA-256)

기록 시각 기준 파일 mtime: 2026-10-03T00:53:02Z (html/css 동일)

| File | Bytes | SHA-256 |
|---|---|---|
| `book.html` | 220557 | `C28B6334184CBD31D8EEA8CDCD0F8BE0ECEAD6E13C6B35B7A62F66FE92FFBFDB` |
| `book.css` | 19035 | `D2673237AA46F8AE309DC264F078B7CDEFD1E47A3F4EF242123691C56ED313B6` |

### After verification

| File | SHA-256 match |
|---|---|
| `book.html` | YES — 동일 |
| `book.css` | YES — 동일 |

`book.json`은 검증 후에도 생기지 않았다.

---

## 3. Checks

| Check | QA | Result |
|---|---|---|
| 서재 카드 노출 (`book.json` 없음) | QA-LIB-01 | PASS |
| 열기 (제목·본문·툴바) | QA-REGRESSION-01 | PASS |
| Single (`pbv-mode-single`, counter `1 / 168`) | QA-REGRESSION-02 | PASS |
| Spread (`pbv-mode-spread`, 폭 1400px) | QA-REGRESSION-02 | PASS |
| Grid (`pbv-mode-thumb`, thumb 168) | QA-REGRESSION-02 | PASS |
| 원본 해시 불변 | QA-REGRESSION-05 | PASS |
| PDF 160+ | QA-REGRESSION-04 | PASS (168 pages) |
| 제품 코드 diff | Phase 0 | 없음 (git 저장소 아님. 엔진/UI 파일 미수정) |

### Library

- URL: `http://127.0.0.1:5500/`
- 카드 제목: 내 포트폴리오, AI로 직접 만들기
- 링크: 열기 · 편집, PDF 받기
- 전체 3권 중 하나. json 없어도 ERROR 아님

### Viewer

- URL: `http://127.0.0.1:5500/books/내 포트폴리오, AI로 직접 만들기/book.html`
- 툴바: Single / Spread / Grid, ← 서재, 편집하기, 내보내기
- UI 쪽 표시: `1 / 168`
- DOM `.pagedjs_page` 개수: 174 (뷰어 내부 여분 가능. UI 카운터는 168)
- 좁은 폭에서는 Spread가 Single로 접힘 (`MIN_SPREAD_WIDTH` 600). 1400px에서 Spread 확인
- TOC 링크·장 목록 존재 (프롤로그~부록 A1–A5·에필로그)

### PDF

- `GET /__pdf?file=books/내 포트폴리오, AI로 직접 만들기/book.html` → HTTP 성공
- 응답 바이트: 3477069
- `pdf-lib` 쪽 수: **168**
- 기존 엔진이 폴더 캐시 `내 포트폴리오, AI로 직접 만들기.pdf`를 갱신함 (mtime 2026-10-03T08:02:08Z, 3477069 bytes)
- **html/css 해시 불변.** PDF 캐시는 SoT가 아님

---

## 4. Code / repo

- 워크스페이스에 `.git` 없음. `git status`로 비교 불가
- Phase 0에서 수정한 엔진/UI/CSS/HTML: 없음
- 허용 산출물: 이 파일만

---

## 5. Verdict

**PASS.** Phase 1로 진행 가능. 이 문서의 html/css 해시가 이후 Regression 기준이다.

Phase 1은 이 기록의 범위가 아니다.
