# My Chapter QA & Acceptance Specification

- Product: My Chapter
- Stage: Development Specification — QA / Acceptance
- Version: 1.0
- Date: 2026-10-03
- Basis: Product Spec v1.3, FUNCTION_SPEC, SCREEN_SPEC, ENGINE_CONTRACT, DATA_SPEC, API_SPEC, M0.5-A/B
- Pair: 기존 명세만 참조. 이 문서가 Architecture를 바꾸지 않는다.

MVP를 구현한 뒤 **완료되었다고 판단하는 검수 기준**이다. 테스트 코드·자동화·구현은 이 문서의 범위가 아니다.

---

## 1. Purpose

이 기능이 실제로 제대로 구현되었다고 **무엇으로 판단할 것인가.**

각 Acceptance Test는 Screen ↔ Function ↔ API ↔ Engine Contract와 연결된다.

QA가 요구하지 않는 것:

- Content SoT를 JSON으로 바꾸기
- Paged.js / Viewer / PDF / Editor 교체
- 168쪽 설계본 Migration
- Structured Book JSON
- React / Vite / Supabase
- WCAG 전체 인증
- Preview와 PDF의 픽셀 동일
- 임의 ms 성능 목표

---

## 2. Scope

| 구분 | 의미 | 출시 조건 |
|---|---|---|
| CURRENT Regression | 지금 엔진이 이미 하는 일. Product WRAP 후에도 동일해야 함 | 포함 |
| TARGET_MVP Acceptance | 아직 없는 제품 흐름 (S04–S09, S11, S16 등) | 포함 |
| LATER | Landing, Auth, AI Cover, Pricing, Auto Save, History UI, Print/EPUB/ZIP | 제외 |

**검증 책 (읽기 전용):** `books/내 포트폴리오, AI로 직접 만들기`

이 폴더의 `book.html` / `book.css`를 QA가 수정하지 않는다. 편집·블록·구조 테스트는 **복제본**에서만 한다.

**엔진 계약 전제:** Content SoT = `book.html`. Overlay = eid + editable + htmltree + blocks. Theme = CSS Token Layer. Pagination / Viewer / PDF = KEEP.

---

## 3. QA ID Convention

```text
QA-<AREA>-<NN>
```

| Prefix | Area |
|---|---|
| `QA-E2E` | 화면을 잇는 Happy Path |
| `QA-LIB` | Library |
| `QA-NEW` | New Book Method |
| `QA-IMPORT` | Manuscript Import |
| `QA-META` | Metadata |
| `QA-STRUCT` | Structure Review / 열린 책 구조 |
| `QA-THEME` | Theme |
| `QA-GEN` | Generation |
| `QA-WS` | Workspace Shell |
| `QA-EDITOR` | Editor / Blocks / Save |
| `QA-COVER` | Cover / Image State |
| `QA-PREVIEW` | Viewer |
| `QA-EXPORT` | PDF Export |
| `QA-DONE` | Export Complete |
| `QA-HIST` | History Engine Regression |
| `QA-REGRESSION` | 168쪽 설계본 |
| `QA-LOSS` | Data Loss Prevention |
| `QA-PERF` | Performance / Scale |
| `QA-A11Y` | Accessibility 최소 |
| `QA-NEG` | Negative / Error |
| `QA-BROWSER` | Browser |

새 Screen ID / Function ID / API ID를 만들지 않는다.

---

## 4. Priority Definition

| Priority | 의미 | Release |
|---|---|---|
| **P0** | 데이터 손실, Book 손상, 저장 실패로 내용 소실, 확정 전 write, PDF가 원본을 바꿈, 168쪽 Migration, 핵심 PDF 실패 | 하나라도 open이면 출시 불가 |
| **P1** | 핵심 사용자 흐름 (마법사, 열기, 편집 저장, Preview 세 모드, 전자책 PDF, Theme 적용) | Gate에 포함 |
| **P2** | 검색/정렬, 접근성 세부, Safari 확인, 편의 UI | Gate 밖. 기록만 |

---

## 5. MVP Release Gate

숫자를 과도하게 만들지 않는다. 아래가 모두 참이면 MVP 출시 가능.

1. **P0 open = 0**
2. **QA-E2E-01** 통과 (S03→…→S16)
3. **168쪽 Regression** (QA-REGRESSION-01…16) 통과. 원본 파일 불변
4. **PDF 160+ page** (QA-EXPORT-06 또는 QA-REGRESSION-15) 통과
5. **Import 4종** TXT / MD / PDF / DOCX (QA-IMPORT-01…04) 통과
6. **Practical / Minimal** (QA-THEME-01…06) 통과
7. **Data Loss** (QA-LOSS-01…07) 통과
8. 핵심 CURRENT Regression: 목록·열기·저장·블록·Viewer 세 모드·History snapshot (제품 UI HIDE여도 엔진)

Gate에 넣지 않음: S01/S02/S13/S17, Auto Save, History 제품 UI, Print/EPUB/ZIP, AI Cover, Safari 보장, 픽셀 PDF 동일, 가짜 % 외의 시각 polish.

---

## 6. End-to-End Flow

### QA-E2E-01 Import Happy Path

- **Test Name:** 원고 → 구조 → 디자인 → 표지 → PDF
- **Related Screen:** S03 → S04 → S05 → S06 → S07 → S08 → S09 → S10 → S11 → S12 → S14 → S15 → S16
- **Related Function ID:** F-LIB-03, F-NEW-01, F-IMPORT-01, F-IMPORT-04, F-META-01, F-STRUCT-01, F-STRUCT-06, F-THEME-02, F-GEN-01, F-GEN-03, F-WS-01, F-THEME-04, F-COVER-02, F-PREVIEW-01, F-EXPORT-01, F-DONE-01
- **Related API:** (없음 S04) → API-IMPORT-02 TARGET → 세션 → API-STRUCT-02 TARGET → 세션 → API-BOOK-03 WRAP (S09만) → API-BOOK-11 → API-THEME-01 TARGET 또는 CSS write → API-STATE-01 → Viewer JS → API-EXPORT-01
- **Priority:** P0
- **Preconditions:** 서버 기동. 기존 168쪽 책 존재. 테스트용 TXT/MD 원고 1개. Chrome 사용 가능
- **Test Data:** 장 2개 이상·소제목 있는 짧은 원고. 제목 `QA E2E 테스트`. 테마 Minimal. 표지 PNG 1장
- **Steps:**
  1. S03에서 새 책. `books/` 목록 스냅샷
  2. S04 Import 선택 후 계속
  3. S05 원고 업로드. 파싱 성공
  4. S06 제목/부제/저자 입력
  5. S07 Part/Chapter/Section 확인. 장 제목 1개 수정
  6. S08 Minimal 선택
  7. S09 생성 완료까지 대기
  8. S10 원고에서 문장 1개 저장
  9. S11 Practical로 적용 (또는 Minimal 유지 후 토큰 확인)
  10. S12 표지 이미지 업로드
  11. S14 Single에서 표지·차례·본문
  12. S15 전자책 PDF
  13. S16 다운로드
- **Expected Result:** S09 성공 전에는 새 폴더 없음. 성공 후 `book.html`/`book.css`/`book.json`/`source/` 존재. S07에서 고친 제목이 HTML에 있음. Theme가 문장을 바꾸지 않음. PDF가 열리고 S16이 성공만 표시. 168쪽 원본 불변
- **Failure Condition:** S05–S08에서 `books/` 신규 폴더. S05에서 API-BOOK-03 호출. 생성 실패인데 목록에 유령 카드. PDF 실패를 S16 SUCCESS로 표시. 원본 설계본 수정
- **Regression Risk:** `/__new-book`을 마법사 초기에 재사용하면 제품 규칙 파괴
- **Manual / Automatable:** Manual (흐름) + 폴더/파일 존재는 Automatable
- **MVP / Later:** MVP — TARGET_MVP Acceptance

단계별 계약:

| Step | Screen | Function | API | Engine Contract |
|---|---|---|---|---|
| 목록 | S03 | F-LIB-01 | API-BOOK-01 | Library MAY WRAP |
| 시작 | S04 | F-NEW-01 | 없음 | 생성 엔진 미호출 |
| 원고 | S05 | F-IMPORT-01,04 | API-IMPORT-02 | parser MUST USE, write 금지 |
| 메타 | S06 | F-META-01..03 | 세션 | HTML 쓰기 S09 |
| 구조 | S07 | F-STRUCT-01..06 | API-STRUCT-02 | session only |
| 테마 | S08 | F-THEME-01..03 | 없음 | CSS preview, HTML 불변 |
| 생성 | S09 | F-GEN-01 | API-BOOK-03 | 첫 destructive write |
| 편집 | S10 | F-EDITOR-02 | API-EDIT-01 | Editor KEEP |
| 디자인 | S11 | F-THEME-04 | API-THEME-01 또는 CSS | Token Layer |
| 표지 | S12 | F-COVER-02 | API-STATE-01 | sidecar MUST USE |
| 미리보기 | S14 | F-PREVIEW-01 | API-BOOK-11 | Viewer KEEP |
| PDF | S15 | F-EXPORT-01 | API-EXPORT-01 | PDF KEEP, HTML 불변 |
| 완료 | S16 | F-DONE-01 | API-EXPORT-01 캐시 | 새 엔진 없음 |

### QA-E2E-02 Empty Book Path

- **Test Name:** 빈 책 → 메타 → 테마 → 생성
- **Related Screen:** S03 → S04 → S06 → S08 → S09 → S10
- **Related Function ID:** F-NEW-02, F-META-01, F-THEME-02, F-GEN-01
- **Related API:** API-BOOK-03 (S09만, source 없음)
- **Priority:** P1
- **Preconditions:** 서재
- **Test Data:** 제목만
- **Steps:** 빈 책 선택. S07 없이 S06→S08→S09. Workspace에서 Template 샘플(prompt/checklist/figure) 확인
- **Expected Result:** Template 골격. S07 미표시. 확정 전 폴더 없음
- **Failure Condition:** S04/S06에서 create. Import 파서 필수화
- **Regression Risk:** `#new-dialog` 즉시 생성 잔존
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

---

## 7. Library QA

CURRENT Regression + WRAP.

### QA-LIB-01 목록과 json 없는 책

- **Test Name:** 서재 목록
- **Related Screen:** S03
- **Related Function ID:** F-LIB-01
- **Related API:** API-BOOK-01, API-BOOK-02
- **Priority:** P0
- **Preconditions:** 168쪽 책 존재 (`book.json` 없음이 정상)
- **Test Data:** 기존 워크스페이스
- **Steps:** `GET /` 또는 제품 서재 진입
- **Expected Result:** 168쪽 책이 카드로 보임. json 없어도 ERROR 아님
- **Failure Condition:** json 없다고 목록에서 제외·열기 실패
- **Regression Risk:** 새 list Route가 optional json을 필수로 만듦
- **Manual / Automatable:** Automatable (목록에 경로 존재)
- **MVP / Later:** MVP — CURRENT

### QA-LIB-02 Book 열기

- **Test Name:** 카드에서 Workspace
- **Related Screen:** S03 → S10
- **Related Function ID:** F-LIB-02, F-WS-01
- **Related API:** API-BOOK-11
- **Priority:** P1
- **Preconditions:** QA-LIB-01
- **Test Data:** 168쪽 `file`
- **Steps:** 카드 클릭
- **Expected Result:** 본문/표지 면이 보임. Identity는 `file` 경로
- **Failure Condition:** 404. UUID를 키로 요구
- **Regression Risk:** Identity 교체
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-LIB-03 새 책 버튼

- **Test Name:** 새 책은 S04만
- **Related Screen:** S03 → S04
- **Related Function ID:** F-LIB-03
- **Related API:** 없음 (API-BOOK-03 호출 금지)
- **Priority:** P0
- **Preconditions:** `books/` 스냅샷
- **Test Data:** 없음
- **Steps:** + 새 책 만들기
- **Expected Result:** S04. 디스크에 새 폴더 없음
- **Failure Condition:** 즉시 `/__new-book`
- **Regression Risk:** 기존 `#new-dialog`가 Primary로 남음
- **Manual / Automatable:** Automatable (폴더) + Manual (화면)
- **MVP / Later:** MVP — TARGET_MVP

### QA-LIB-04 복제

- **Test Name:** 복제 원본 불변
- **Related Screen:** S03
- **Related Function ID:** F-LIB-04
- **Related API:** API-BOOK-07
- **Priority:** P1
- **Preconditions:** 원본 책. 가능하면 작은 책 또는 168쪽 (시간 허용 시)
- **Test Data:** 원본 `file`
- **Steps:** 복제. 원본 `book.html` 해시 비교. 사본 열기
- **Expected Result:** 새 카드. 원본 바이트 동일. `.history`/캐시 PDF는 사본에 없음 (기존 규칙)
- **Failure Condition:** 원본 수정. 168쪽 변환
- **Regression Risk:** 복제가 migrate를 수행
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — CURRENT

### QA-LIB-05 휴지통

- **Test Name:** 휴지통 이동
- **Related Screen:** S03
- **Related Function ID:** F-LIB-05
- **Related API:** API-BOOK-08
- **Priority:** P1
- **Preconditions:** 테스트용 사본 (설계본 금지)
- **Test Data:** 사본 `file`
- **Steps:** 휴지통. 확인
- **Expected Result:** 목록에서 사라짐. `_trash`에 폴더
- **Failure Condition:** 확인 없이 purge. 설계본을 실수로 대상
- **Regression Risk:** 영구 삭제와 혼동
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-LIB-06 복원

- **Test Name:** 휴지통 복원
- **Related Screen:** S03
- **Related Function ID:** F-LIB-06
- **Related API:** API-BOOK-09
- **Priority:** P1
- **Preconditions:** QA-LIB-05
- **Test Data:** trash id
- **Steps:** 복원. 열기
- **Expected Result:** 서재에 복귀. HTML/sidecar 유지
- **Failure Condition:** 404. 내용 손실
- **Regression Risk:** 경로 충돌 처리
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-LIB-07 영구 삭제

- **Test Name:** purge
- **Related Screen:** S03
- **Related Function ID:** F-LIB-07
- **Related API:** API-BOOK-10
- **Priority:** P1
- **Preconditions:** 테스트 trash 항목. 설계본 아님
- **Test Data:** trash id
- **Steps:** 확인 후 영구 삭제
- **Expected Result:** 복원 불가. 확인 전에는 실행 안 됨
- **Failure Condition:** 확인 스킵. 잘못된 항목
- **Regression Risk:** 설계본 경로
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-LIB-08 검색

- **Test Name:** 제목·저자 검색
- **Related Screen:** S03
- **Related Function ID:** F-LIB-08
- **Related API:** API-BOOK-01 (클라 필터)
- **Priority:** P2
- **Preconditions:** 한글 제목 책
- **Test Data:** `포트폴리오`
- **Steps:** 검색
- **Expected Result:** 일치 카드. 0이면 EMPTY SEARCH
- **Failure Condition:** 한글 검색 실패
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-LIB-09 정렬

- **Test Name:** recent / title / status
- **Related Screen:** S03
- **Related Function ID:** F-LIB-09
- **Related API:** API-BOOK-01
- **Priority:** P2
- **Preconditions:** 책 2권 이상
- **Test Data:** 기존 목록
- **Steps:** 세 정렬 전환
- **Expected Result:** 순서 변경. 책 파일 불변
- **Failure Condition:** 정렬이 HTML을 씀
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-LIB-10 상태

- **Test Name:** draft/review/done
- **Related Screen:** S03
- **Related Function ID:** F-LIB-10
- **Related API:** API-BOOK-05
- **Priority:** P2
- **Preconditions:** 테스트 책 (설계본에 강제 json 생성 금지. 사본 사용)
- **Test Data:** status=review
- **Steps:** 상태 변경. `book.html` 해시 비교
- **Expected Result:** 배지 변경. 본문 불변
- **Failure Condition:** 본문 변경
- **Regression Risk:** meta가 rewriteFront를 침범
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — CURRENT

---

## 8. Creation Wizard QA

TARGET_MVP. S04–S08에서 `books/` 신규 폴더 = **P0 FAIL**.

### QA-NEW-01 방식 선택

- **Test Name:** empty vs import
- **Related Screen:** S04
- **Related Function ID:** F-NEW-01, F-NEW-02
- **Related API:** 없음
- **Priority:** P1
- **Preconditions:** S03에서 진입
- **Test Data:** 없음
- **Steps:** 미선택 시 Primary. Import 선택 → S05. Empty 선택 → S06
- **Expected Result:** 선택 전 DISABLED. 디스크 쓰기 없음
- **Failure Condition:** create 호출
- **Regression Risk:** 한 장 대화상자
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-NEW-02 취소

- **Test Name:** 마법사 취소
- **Related Screen:** S04 (및 S05–S08에서 취소)
- **Related Function ID:** F-LIB-03
- **Related API:** 없음
- **Priority:** P0
- **Preconditions:** `books/` 스냅샷
- **Test Data:** 없음
- **Steps:** 새 책 → 취소. S05까지 갔다가 취소
- **Expected Result:** S03. 새 폴더 없음. 사용자 원본 파일 불변
- **Failure Condition:** 빈 폴더/유령 카드
- **Regression Risk:** create-then-delete
- **Manual / Automatable:** Automatable (폴더)
- **MVP / Later:** MVP — TARGET_MVP

---

## 9. Import QA

### QA-IMPORT-01 TXT

- **Test Name:** TXT Import 파싱
- **Related Screen:** S05 → S07
- **Related Function ID:** F-IMPORT-01, F-IMPORT-03, F-IMPORT-04
- **Related API:** API-IMPORT-02 TARGET (CURRENT API-IMPORT-01은 S05에서 쓰지 말 것)
- **Priority:** P1
- **Preconditions:** S04 import
- **Test Data:** UTF-8 TXT, 장 구분 있는 짧은 원고
- **Steps:** 업로드. 파싱
- **Expected Result:** S07에 장/문단. `books/` 쓰기 없음. 원본 TXT 불변
- **Failure Condition:** 즉시 책 생성. 고급 prompt 강요 실패
- **Regression Risk:** create 묶음 Import
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-IMPORT-02 MD

- **Test Name:** MD Import 파싱
- **Related Screen:** S05 → S07
- **Related Function ID:** F-IMPORT-01, F-IMPORT-03, F-IMPORT-04
- **Related API:** API-IMPORT-02 TARGET
- **Priority:** P1
- **Preconditions:** S04 import
- **Test Data:** `#` / `##` 있는 Markdown
- **Steps:** 업로드. 파싱
- **Expected Result:** 장/소제목 골격. `books/` 쓰기 없음. 원본 MD 불변
- **Failure Condition:** 즉시 책 생성
- **Regression Risk:** create 묶음 Import
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-IMPORT-03 PDF (텍스트)

- **Test Name:** 텍스트 PDF Import
- **Related Screen:** S05 → S07
- **Related Function ID:** F-IMPORT-01, F-IMPORT-03, F-IMPORT-04
- **Related API:** API-IMPORT-02 TARGET
- **Priority:** P1
- **Preconditions:** S04 import
- **Test Data:** 추출 가능한 텍스트 PDF
- **Steps:** 업로드. 파싱
- **Expected Result:** 기본 구조. write 없음. PDF 지원 유지
- **Failure Condition:** PDF를 미지원으로 거부. 즉시 create
- **Regression Risk:** 기획서 구버전(DOCX/TXT/MD만)으로 PDF 제거
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-IMPORT-04 DOCX

- **Test Name:** DOCX Import 파싱
- **Related Screen:** S05 → S07
- **Related Function ID:** F-IMPORT-01, F-IMPORT-03, F-IMPORT-04
- **Related API:** API-IMPORT-02 TARGET
- **Priority:** P1
- **Preconditions:** S04 import
- **Test Data:** 본문 있는 DOCX
- **Steps:** 업로드. 파싱
- **Expected Result:** 기본 구조. write 없음. 그림 버려짐은 PASS (엔진 한계)
- **Failure Condition:** 즉시 책 생성. 표/그림을 못 만들어 FAIL 처리
- **Regression Risk:** create 묶음 Import
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-IMPORT-05 붙여넣기

- **Test Name:** 원고 붙여넣기
- **Related Screen:** S05
- **Related Function ID:** F-IMPORT-02
- **Related API:** API-IMPORT-02 `{ text }`
- **Priority:** P1
- **Preconditions:** S04 import
- **Test Data:** 공백 아닌 평문/MD
- **Steps:** textarea 입력 → 파싱
- **Expected Result:** 파일 없이 S07 가능. 빈/공백만은 거부
- **Failure Condition:** 파일 필수. 빈 텍스트 통과
- **Regression Risk:** 없음 (현재 Gap)
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-IMPORT-06 미지원 형식

- **Test Name:** unsupported format
- **Related Screen:** S05
- **Related Function ID:** F-IMPORT-03, F-IMPORT-07
- **Related API:** API-IMPORT-03 / 클라 검증
- **Priority:** P1
- **Preconditions:** S05
- **Test Data:** `.doc` `.xlsx` `.png` `.epub`
- **Steps:** 업로드
- **Expected Result:** `TXT, MD, PDF, DOCX 파일만 넣을 수 있어요.` 책 없음
- **Failure Condition:** 조용히 무시하고 create
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT 메시지 WRAP

### QA-IMPORT-07 본문 없는 파일

- **Test Name:** empty manuscript
- **Related Screen:** S05
- **Related Function ID:** F-IMPORT-07
- **Related API:** API-IMPORT-02
- **Priority:** P1
- **Preconditions:** S05
- **Test Data:** 빈 TXT / 공백만
- **Steps:** 업로드
- **Expected Result:** `파일에서 본문 글을 찾지 못했습니다.` 폴더 없음
- **Failure Condition:** 빈 책 생성
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-IMPORT-08 스캔 PDF

- **Test Name:** scan PDF
- **Related Screen:** S05
- **Related Function ID:** F-IMPORT-07
- **Related API:** API-IMPORT-02
- **Priority:** P1
- **Preconditions:** S05
- **Test Data:** 글자 레이어 없는 이미지 PDF
- **Steps:** 업로드
- **Expected Result:** `PDF에서 글자를 찾지 못했습니다. 스캔한 이미지 PDF는 변환할 수 없어요.` 폴더 없음
- **Failure Condition:** 빈 장으로 성공 처리
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT 메시지

### QA-IMPORT-09 S05 디스크 가드

- **Test Name:** Import 시점에 write 없음
- **Related Screen:** S05
- **Related Function ID:** F-IMPORT-01, F-IMPORT-04, F-IMPORT-05
- **Related API:** API-IMPORT-02 only
- **Priority:** P0
- **Preconditions:** `books/` mtime/목록
- **Test Data:** 성공 파싱되는 MD
- **Steps:** 파싱 성공까지. `source/` 검색
- **Expected Result:** 신규 Book Folder 0. `source/` 0
- **Failure Condition:** API-BOOK-03
- **Regression Risk:** CURRENT create 경로
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — TARGET_MVP

---

## 10. Metadata QA

### QA-META-01 제목 필수

- **Test Name:** 제목 없이 다음 불가
- **Related Screen:** S06
- **Related Function ID:** F-META-01
- **Related API:** 세션. 쓰기는 API-BOOK-03
- **Priority:** P1
- **Preconditions:** S04 empty 또는 S05 성공
- **Test Data:** `""`, 공백
- **Steps:** 제목 비움
- **Expected Result:** Primary DISABLED 또는 ERROR. write 없음
- **Failure Condition:** 빈 제목으로 create
- **Regression Risk:** 기존 400 메시지
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-META-02 부제 선택

- **Test Name:** 부제 생략
- **Related Screen:** S06
- **Related Function ID:** F-META-02
- **Related API:** 세션
- **Priority:** P2
- **Preconditions:** 제목 있음
- **Test Data:** 부제 공란
- **Steps:** 다음
- **Expected Result:** 진행. 생성 후 부제 비어 있어도 책 성립
- **Failure Condition:** 부제 필수화
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-META-03 저자

- **Test Name:** 저자 반영
- **Related Screen:** S06 → S09 → S03/S12
- **Related Function ID:** F-META-03
- **Related API:** API-BOOK-03
- **Priority:** P1
- **Preconditions:** 생성까지
- **Test Data:** 저자 `검수자`
- **Steps:** 입력 후 생성. 카드·표지 비교
- **Expected Result:** 동일 저자. 비우면 기존 기본 “저자” 허용
- **Failure Condition:** 카드와 표지 불일치
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-META-04 S06 무기록

- **Test Name:** 메타 화면 write 없음
- **Related Screen:** S06
- **Related Function ID:** F-META-01..04
- **Related API:** 없음
- **Priority:** P0
- **Preconditions:** 목록 스냅샷
- **Test Data:** 유효 제목
- **Steps:** 입력만 하고 대기
- **Expected Result:** 폴더 없음. Identity rename 없음
- **Failure Condition:** HTML/json 생성
- **Regression Risk:** 없음
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — TARGET_MVP

---

## 11. Structure Review QA

S07은 세션. `structureOp`(API-STRUCT-01)가 아니다.

### QA-STRUCT-01 표시

- **Test Name:** Part / Chapter / Section
- **Related Screen:** S07
- **Related Function ID:** F-STRUCT-01
- **Related API:** API-STRUCT-02
- **Priority:** P1
- **Preconditions:** 파싱 성공. 부에 장, 장에 h2가 있는 원고
- **Test Data:** Import 세션
- **Steps:** 트리 확인
- **Expected Result:** Part·Chapter·Section(h2) 표시. prompt 없음은 PASS
- **Failure Condition:** 고급 상자 없다고 ERROR. 디스크 HTML
- **Regression Risk:** S10 Editor를 S07에 재사용
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-STRUCT-02 제목 수정

- **Test Name:** 구조 제목
- **Related Screen:** S07
- **Related Function ID:** F-STRUCT-02
- **Related API:** API-STRUCT-02
- **Priority:** P1
- **Preconditions:** QA-STRUCT-01
- **Test Data:** 새 장 제목
- **Steps:** 인라인 수정. 사용자 원본 파일 해시
- **Expected Result:** 트리 갱신. 원본 불변. `books/` 없음
- **Failure Condition:** 빈 제목 허용. 원본 수정
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-STRUCT-03 순서

- **Test Name:** 순서 변경
- **Related Screen:** S07
- **Related Function ID:** F-STRUCT-03
- **Related API:** API-STRUCT-02
- **Priority:** P1
- **Preconditions:** 장 2+
- **Test Data:** 세션 트리
- **Steps:** 위/아래. 부가 있으면 장 그룹 동반
- **Expected Result:** 새 순서. 원본 불변
- **Failure Condition:** 맨 끝에서 조용히 손상
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-STRUCT-04 추가

- **Test Name:** Part/Chapter/Section 추가
- **Related Screen:** S07
- **Related Function ID:** F-STRUCT-04
- **Related API:** API-STRUCT-02
- **Priority:** P1
- **Preconditions:** 세션
- **Test Data:** kind=chapter
- **Steps:** 추가
- **Expected Result:** 트리에 항목. 책 폴더 없음
- **Failure Condition:** API-STRUCT-01 (열린 책 API)
- **Regression Risk:** 엔진 structureOp를 세션에 오용
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-STRUCT-05 삭제

- **Test Name:** 항목 삭제
- **Related Screen:** S07
- **Related Function ID:** F-STRUCT-05
- **Related API:** API-STRUCT-02
- **Priority:** P1
- **Preconditions:** 장 2+
- **Test Data:** 장 하나
- **Steps:** 삭제. 마지막 장 삭제 시도
- **Expected Result:** 항목 제거. 마지막 장 거부. 원본 불변
- **Failure Condition:** 장 0으로 확정
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-STRUCT-06 확정 CTA

- **Test Name:** 이 구조로 책 만들기 ≠ 생성
- **Related Screen:** S07 → S08
- **Related Function ID:** F-STRUCT-06
- **Related API:** 없음 (API-BOOK-03 금지)
- **Priority:** P0
- **Preconditions:** 장 ≥ 1, 제목 있음
- **Test Data:** 세션
- **Steps:** Primary. `books/` 확인
- **Expected Result:** S08. 새 카드 없음
- **Failure Condition:** create
- **Regression Risk:** CTA 라벨이 생성으로 오인
- **Manual / Automatable:** Automatable (폴더)
- **MVP / Later:** MVP — TARGET_MVP

### QA-STRUCT-07 원고 다시 선택

- **Test Name:** 다시 선택
- **Related Screen:** S07 → S05
- **Related Function ID:** F-IMPORT-06
- **Related API:** 없음
- **Priority:** P1
- **Preconditions:** 구조 수정 있음
- **Test Data:** 세션
- **Steps:** 다시 선택. 확인 후 S05
- **Expected Result:** 파싱 결과 폐기. 폴더 없음. 원본 파일 그대로. 메타는 유지 가능
- **Failure Condition:** 기존 책 생성/삭제
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-STRUCT-08 S05–S08 통합 가드

- **Test Name:** 확정 전 destructive write
- **Related Screen:** S05, S06, S07, S08
- **Related Function ID:** F-IMPORT-*, F-STRUCT-*, F-THEME-01..03
- **Related API:** API-IMPORT-02, API-STRUCT-02 only
- **Priority:** P0
- **Preconditions:** 마법사 전체
- **Test Data:** 성공 경로 입력
- **Steps:** S08 Preview까지. `books/` diff
- **Expected Result:** 신규 폴더 0
- **Failure Condition:** 어떤 단계든 write
- **Regression Risk:** CURRENT `/__new-book`
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — TARGET_MVP

---

## 12. Theme QA

Theme = CSS Token Layer. HTML 의미 구조 DO NOT REPLACE.

바뀌어도 됨: color, typography, spacing, page margin, component visual.

바꾸면 안 됨: 본문 문장, section 종류/id, class 의미, image-slot id, TOC href.

### QA-THEME-01 목록

- **Test Name:** Practical / Minimal만
- **Related Screen:** S08, S11
- **Related Function ID:** F-THEME-01
- **Related API:** 없음
- **Priority:** P1
- **Preconditions:** 마법사 또는 Workspace
- **Test Data:** 없음
- **Steps:** 화면 진입
- **Expected Result:** 두 테마. 기본 Practical
- **Failure Condition:** 세 번째 필수 테마. HTML 테마 파일
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-THEME-02 선택과 본문

- **Test Name:** 선택해도 문장 불변
- **Related Screen:** S08
- **Related Function ID:** F-THEME-02
- **Related API:** 없음
- **Priority:** P0
- **Preconditions:** 샘플 또는 책
- **Test Data:** 미리보기 텍스트 스냅샷
- **Steps:** Practical ↔ Minimal
- **Expected Result:** 동일 문장
- **Failure Condition:** 문장 치환
- **Regression Risk:** Theme이 HTML regenerate
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-THEME-03 Preview 계약

- **Test Name:** 클래스 의미 동일 Preview
- **Related Screen:** S08, S11
- **Related Function ID:** F-THEME-03
- **Related API:** Viewer/CSS WRAP
- **Priority:** P1
- **Preconditions:** 샘플 HTML
- **Test Data:** Template 계약
- **Steps:** 테마 전환
- **Expected Result:** 같은 class contract. S08은 짧은 샘플 (168쪽 전체 나눔 불필요)
- **Failure Condition:** 새 Pagination 엔진
- **Regression Risk:** Paged.js 교체
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-THEME-04 적용 후 HTML

- **Test Name:** Theme 적용은 CSS만
- **Related Screen:** S11 (또는 S09 생성 시)
- **Related Function ID:** F-THEME-04
- **Related API:** API-THEME-01 TARGET 또는 CSS write
- **Priority:** P0
- **Preconditions:** 열린 책 사본. `book.html` 해시
- **Test Data:** slot id 목록, TOC href, chapter id
- **Steps:** 반대 테마 적용
- **Expected Result:** HTML 문장/section/class/slot id/TOC href 동일. `book.css`만 변경 가능
- **Failure Condition:** HTML 본문 변경 = P0
- **Regression Risk:** 설계본 변환
- **Manual / Automatable:** Automatable (해시/id)
- **MVP / Later:** MVP — TARGET_MVP

### QA-THEME-05 재Pagination

- **Test Name:** Theme 후 Preview 쪽 나눔
- **Related Screen:** S11 → S14
- **Related Function ID:** F-THEME-04, F-PREVIEW-01
- **Related API:** API-BOOK-11 (reload/reattach)
- **Priority:** P1
- **Preconditions:** QA-THEME-04. Engine: CSS만 바꾸면 reload 후 재나눔
- **Test Data:** 사본 책
- **Steps:** 적용 → 미리보기 탭 (필요 시 reload)
- **Expected Result:** `.pagedjs_page` 정상. 겹침/빈 책 아님. 새 엔진 없음
- **Failure Condition:** 깨진 쪽. Pagination 재작성
- **Regression Risk:** 라이브 토큰 패치 후 구 쪽 유지로 오판 (reload 계약)
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-THEME-06 설계본 강제 변환 없음

- **Test Name:** 168쪽에 Theme을 써도 migrate 없음
- **Related Screen:** S11
- **Related Function ID:** F-THEME-04
- **Related API:** CSS only
- **Priority:** P0
- **Preconditions:** 설계본은 **복제본**에서만 Theme 적용. 원본 금지
- **Test Data:** 사본 vs 원본 해시
- **Steps:** 사본에 Minimal 적용. 원본 파일 비교
- **Expected Result:** 원본 불변. 사본 HTML 의미 불변
- **Failure Condition:** 원본 수정
- **Regression Risk:** 일괄 테마 마이그레이션
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP

---

## 13. Generation QA

S09만 실제 Book 생성. API-BOOK-03 WRAP.

### QA-GEN-01 산출물

- **Test Name:** 성공 시 폴더 계약
- **Related Screen:** S09
- **Related Function ID:** F-GEN-01, F-IMPORT-05, F-META-04
- **Related API:** API-BOOK-03
- **Priority:** P0
- **Preconditions:** 세션 완료 (import 경로)
- **Test Data:** QA-E2E-01 세션
- **Steps:** 생성 성공. 디스크 확인
- **Expected Result:** `books/<folder>/book.html`, `book.css`, `book.json` (draft), Import면 `source/`. Identity = `file`
- **Failure Condition:** html 없이 카드. 기존 책 덮어쓰기
- **Regression Risk:** uniqueFolder 실패로 기존 폴더 침범
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — WRAP

### QA-GEN-02 구조 수정 반영

- **Test Name:** S07 편집이 생성본에 있음
- **Related Screen:** S09 → S10
- **Related Function ID:** F-STRUCT-02, F-STRUCT-03, F-GEN-01
- **Related API:** API-BOOK-03
- **Priority:** P1
- **Preconditions:** S07에서 제목 변경·순서 변경
- **Test Data:** 고유 장 제목
- **Steps:** 생성 후 HTML에서 제목/순서
- **Expected Result:** 세션 수정 반영
- **Failure Condition:** 원본 파서 결과만 쓰고 S07을 버림
- **Regression Risk:** source를 재파싱하며 수정 손실
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

### QA-GEN-03 Theme 반영

- **Test Name:** 선택 테마가 CSS에 있음
- **Related Screen:** S09
- **Related Function ID:** F-THEME-04, F-GEN-01
- **Related API:** API-BOOK-03 ± API-THEME-01
- **Priority:** P1
- **Preconditions:** S08 Minimal
- **Test Data:** 세션 themeId
- **Steps:** 생성. Preview 토큰
- **Expected Result:** Minimal 시각. HTML 문장 = 세션 구조
- **Failure Condition:** HTML을 테마별로 재생성
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-GEN-04 실패와 유령 책

- **Test Name:** 생성 실패
- **Related Screen:** S09
- **Related Function ID:** F-GEN-04, F-IMPORT-07
- **Related API:** API-BOOK-03
- **Priority:** P0
- **Preconditions:** 실패를 유도 (디스크 권한 또는 잘못된 조립). 목록 스냅샷
- **Test Data:** 세션 유지
- **Steps:** 실패. 서재·`books/`
- **Expected Result:** ERROR. 불완전 책 목록 없음. 재시도/이전/서재
- **Failure Condition:** 깨진 카드
- **Regression Risk:** 부분 copy
- **Manual / Automatable:** Manual + 폴더
- **MVP / Later:** MVP

### QA-GEN-05 재시도

- **Test Name:** 같은 세션 재시도
- **Related Screen:** S09
- **Related Function ID:** F-GEN-05
- **Related API:** API-BOOK-03
- **Priority:** P1
- **Preconditions:** QA-GEN-04 또는 세션 유효
- **Test Data:** 동일 원고/메타/구조/테마
- **Steps:** 다시 시도
- **Expected Result:** 성공 시 F-GEN-03. 세션 만료면 S04부터. 가짜 % 없음 (F-GEN-02)
- **Failure Condition:** 세션 소실로 원고 재업로드 강제(만료 아닌데). 유령 폴더
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP

---

## 14. Workspace / Editor QA

Editor DO NOT REPLACE. 편집 테스트는 **사본**만.

### QA-WS-01 셸

- **Test Name:** Workspace 셸
- **Related Screen:** S10
- **Related Function ID:** F-WS-01, F-WS-02
- **Related API:** API-BOOK-11
- **Priority:** P1
- **Preconditions:** 책 열림
- **Test Data:** 사본
- **Steps:** 셸 확인. 네 탭
- **Expected Result:** 내 서재 / 제목 / 저장 상태 / PDF / 원고·디자인·표지·미리보기. 원고 = 기존 Editor
- **Failure Condition:** Editor 재구현
- **Regression Risk:** 도구막대 중복으로 엔진 동작 손실
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET WRAP

### QA-EDITOR-01 텍스트 수정·저장

- **Test Name:** eid 패치 저장
- **Related Screen:** S10
- **Related Function ID:** F-EDITOR-01, F-EDITOR-02, F-EDITOR-03
- **Related API:** API-EDIT-01
- **Priority:** P0
- **Preconditions:** 사본. 편집 모드
- **Test Data:** 문장에 고유 마커
- **Steps:** 수정 → 저장 → 재오픈
- **Expected Result:** 같은 문장. 새 version sha1. 쪽 나눔 유지(기존). history `edit`
- **Failure Condition:** 저장 성공인데 재오픈 시 소실
- **Regression Risk:** eid 디스크 저장
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-EDITOR-02 version 409

- **Test Name:** 잘못된 version
- **Related Screen:** S10
- **Related Function ID:** F-EDITOR-02
- **Related API:** API-EDIT-01
- **Priority:** P0
- **Preconditions:** 사본. 현재 version 앎
- **Test Data:** 고의 stale version
- **Steps:** `POST /__edit` with 틀린 version
- **Expected Result:** 409 `원본 파일이 다른 곳에서 바뀌었습니다`. commit 없음. 화면 dirty 유지
- **Failure Condition:** 덮어쓰기 성공
- **Regression Risk:** 충돌 무시
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — CURRENT

### QA-EDITOR-03 eid 불일치

- **Test Name:** invalid eid
- **Related Screen:** S10
- **Related Function ID:** F-EDITOR-02
- **Related API:** API-EDIT-01
- **Priority:** P0
- **Preconditions:** 사본
- **Test Data:** 존재하지 않는 eid
- **Steps:** 패치 요청
- **Expected Result:** 409 `편집 위치를 원본에서 찾지 못했습니다`. HTML 불변. dirty 유지
- **Failure Condition:** 잘못된 위치 write
- **Regression Risk:** 순서 인덱스 재배치
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — CURRENT

### QA-EDITOR-04 블록 insert/delete/move/retype

- **Test Name:** blocks 10종 연산
- **Related Screen:** S10
- **Related Function ID:** F-EDITOR-04
- **Related API:** API-BLOCK-01
- **Priority:** P1
- **Preconditions:** 사본 장 본문 (opener/표지/차례/파트 아님)
- **Test Data:** type=p, prompt, checklist
- **Steps:** insert → up/down → retype p|h2|h3 → delete. 표지에서 insert 시도
- **Expected Result:** HTML 반영. history `blocks`. 표지 등 거부. 28종 일괄 없어도 PASS
- **Failure Condition:** 설계본 전용 HTML이 일괄 삭제. 마지막 블록 삭제 허용으로 장 붕괴
- **Regression Risk:** blocks를 SoT로 승격
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-EDITOR-05 열린 책 구조

- **Test Name:** structureOp
- **Related Screen:** S10
- **Related Function ID:** F-STRUCT-07
- **Related API:** API-STRUCT-01
- **Priority:** P1
- **Preconditions:** 사본. 장 2+
- **Test Data:** add-chapter, delete-section
- **Steps:** 장 추가. 마지막 장 삭제 시도
- **Expected Result:** 번호/차례 동기. 마지막 장 400. history `structure`
- **Failure Condition:** 표지를 장으로 삭제
- **Regression Risk:** S07 세션 API와 혼동
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-EDITOR-06 재오픈·가드

- **Test Name:** reopen / unsaved
- **Related Screen:** S10 → S03
- **Related Function ID:** F-EDITOR-08, F-WS-03
- **Related API:** API-EDIT-01 (저장 시)
- **Priority:** P1
- **Preconditions:** dirty
- **Test Data:** 미저장 문장
- **Steps:** 서재로. 취소/저장/폐기
- **Expected Result:** 확인. 저장 실패면 잔류. 저장 후 재오픈 일치
- **Failure Condition:** 묻지 않고 폐기
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-EDITOR-07 Save 실패 시 덮어쓰기 없음

- **Test Name:** 저장 실패 보호
- **Related Screen:** S10
- **Related Function ID:** F-EDITOR-02
- **Related API:** API-EDIT-01
- **Priority:** P0
- **Preconditions:** 409 또는 네트워크 실패
- **Test Data:** dirty DOM
- **Steps:** 저장 실패
- **Expected Result:** 디스크는 이전 성공본. 화면 편집 유지. 성공으로 표시 금지
- **Failure Condition:** 빈 패치로 디스크 덮음. dirty 소실
- **Regression Risk:** 실패 후 reload
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

---

## 15. Cover / Image QA

History는 Image State를 복원하지 않는다 (현재 한계. §19).

### QA-COVER-01 표지 표시

- **Test Name:** section.cover
- **Related Screen:** S12, S14
- **Related Function ID:** F-COVER-01
- **Related API:** API-BOOK-11
- **Priority:** P1
- **Preconditions:** 책
- **Test Data:** 슬롯 비어 있어도 됨
- **Steps:** 표지 탭 / 첫 쪽
- **Expected Result:** 표지 면. 그림 없으면 placeholder. 책 성립
- **Failure Condition:** 그림 없다고 책 오류
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-COVER-02 cover-image 업로드

- **Test Name:** 표지 이미지
- **Related Screen:** S12
- **Related Function ID:** F-COVER-02
- **Related API:** API-STATE-01 및/또는 API-BOOK-06
- **Priority:** P1
- **Preconditions:** 사본
- **Test Data:** png/jpeg
- **Steps:** 업로드. reload. HTML 해시
- **Expected Result:** sidecar `cover-image`. HTML 불변. Preview 표지 그림
- **Failure Condition:** HTML에 data URL 매립으로 SoT 팽창(기존 계약 위반 시 FAIL). 형식 거부 실패
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-COVER-03 본문 슬롯

- **Test Name:** body image-slot
- **Related Screen:** S14 / Editor
- **Related Function ID:** F-COVER-02 (동일 sidecar)
- **Related API:** API-STATE-01
- **Priority:** P1
- **Preconditions:** 슬롯 있는 사본 (Template 또는 복제)
- **Test Data:** slot id 일치 이미지
- **Steps:** 드롭. reload
- **Expected Result:** 해당 id만 채워짐
- **Failure Condition:** id 재생성으로 전부 빈 슬롯
- **Regression Risk:** Theme/구조가 slot id 변경
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-COVER-04 복제·휴지통·PDF

- **Test Name:** sidecar 수명
- **Related Screen:** S03, S15
- **Related Function ID:** F-LIB-04, F-LIB-05, F-LIB-06, F-EXPORT-01
- **Related API:** API-BOOK-07, API-BOOK-08, API-BOOK-09, API-EXPORT-01
- **Priority:** P1
- **Preconditions:** 그림 있는 사본
- **Test Data:** sidecar
- **Steps:** 복제 후 사본에 그림. 원본 trash/restore. PDF
- **Expected Result:** 복제에 sidecar 포함 (기존). restore 후 그림 유지. PDF에 그림
- **Failure Condition:** restore 후 sidecar 상실. PDF만 빈 칸 (원본에 그림 있는데)
- **Regression Risk:** 복제가 sidecar skip
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-COVER-05 슬롯 불일치

- **Test Name:** HTML id vs sidecar 키
- **Related Screen:** S12, S14
- **Related Function ID:** F-COVER-02
- **Related API:** API-STATE-01
- **Priority:** P0
- **Preconditions:** 사본
- **Test Data:** 고의로 키만 다른 sidecar는 테스트 후 원복
- **Steps:** Theme/생성 전후 slot id 목록 vs sidecar keys
- **Expected Result:** 제품이 id를 임의 재생성하지 않음. 어긋나면 그림 소실 = FAIL
- **Failure Condition:** 마이그레이션이 id를 바꿈
- **Regression Risk:** Import/Theme rewrite
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP

### QA-COVER-06 표지 카피

- **Test Name:** 제목 동기
- **Related Screen:** S12
- **Related Function ID:** F-COVER-03, F-META-01
- **Related API:** API-BOOK-04
- **Priority:** P1
- **Preconditions:** 사본
- **Test Data:** 새 제목
- **Steps:** 저장. 판권/`<title>`/카드
- **Expected Result:** 동일. 기본 renameFolder 없음
- **Failure Condition:** 빈 제목. Identity 강제 변경
- **Regression Risk:** 설계본 `em`/`br` 파괴
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

---

## 16. Preview QA

Viewer 교체 Test 없음. CURRENT Regression.

공통 Preconditions: 168쪽은 보기만. 사본은 편집본 가능.

각 모드에서 확인: page rendering, navigation, zoom(기존 UI가 있으면), page count, cover, TOC, images.

### QA-PREVIEW-01 Single

- **Related Screen:** S14
- **Related Function ID:** F-PREVIEW-01, F-PREVIEW-04
- **Related API:** API-BOOK-11 + `paged_book_viewer.js`
- **Priority:** P1
- **Steps:** Single. 다음/이전. 차례 클릭
- **Expected Result:** 한 쪽. 이동. 표지·TOC
- **Failure Condition:** 모드 엔진 재작성. 쪽 0
- **Regression Risk:** 셸이 뷰어 DOM을 깨뜨림
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT
- **Test Name / Preconditions / Test Data / Failure / Manual:** 168쪽 또는 사본. 기존 툴바 WRAP만

### QA-PREVIEW-02 Spread

- 동일. F-PREVIEW-02. 두 쪽. 좁은 폭은 기존처럼 single 접힘 허용. **Priority:** P1

### QA-PREVIEW-03 Grid

- 동일. F-PREVIEW-03 (`thumb`). 썸네일 + 점프. **Priority:** P1

### QA-PREVIEW-04 저장 전 글

- **Test Name:** 미저장 본문은 Preview에 없을 수 있음
- **Related Screen:** S10, S14
- **Related Function ID:** F-WS-02, F-PREVIEW-01
- **Related API:** API-BOOK-11
- **Priority:** P2
- **Preconditions:** dirty
- **Expected Result:** 기존 계약. 저장 권고. 미저장 PDF 성공 처리 금지 (QA-EXPORT)
- **Failure Condition:** 미저장을 저장본인 것처럼 PDF 성공
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT 계약 명시
- **Test Data:** dirty 마커
- **Steps:** 미리보기 탭
- **Regression Risk:** 강제 재나눔을 새 요구로 넣음 (하지 말 것)

---

## 17. PDF / Export QA

Preview와 PDF는 PARTIAL shared rules. 픽셀 동일 요구 없음.

요구: 내용 동일, 순서 동일, 주요 Layout 동일, Page Break 합리적.

### QA-EXPORT-01 전자책 PDF 생성

- **Test Name:** Primary PDF
- **Related Screen:** S15
- **Related Function ID:** F-EXPORT-01
- **Related API:** API-EXPORT-01 `GET /__pdf?file=` (ids/print/wm 없음)
- **Priority:** P0
- **Preconditions:** 저장된 책. Chrome
- **Test Data:** 사본 또는 168쪽 (원본 HTML 해시 사전 기록)
- **Steps:** 전자책 PDF 만들기
- **Expected Result:** application/pdf. 열림. HTML 해시 동일
- **Failure Condition:** HTML 변경. 빈 PDF. 성공 오표시
- **Regression Risk:** 엔진 교체
- **Manual / Automatable:** Automatable (해시) + Manual (열기)
- **MVP / Later:** MVP — CURRENT

### QA-EXPORT-02 페이지 완전성

- **Test Name:** 누락/중복 없음
- **Related Screen:** S15
- **Related Function ID:** F-EXPORT-01
- **Related API:** API-EXPORT-01
- **Priority:** P0
- **Preconditions:** Preview 쪽 수 기록 (근사)
- **Test Data:** 168쪽 설계본
- **Steps:** PDF 쪽 수·목차·장 시작 훑기
- **Expected Result:** 160+ 쪽. 앞뒤 잘림 없음. 같은 쪽이 연속 중복되지 않음. 표지·TOC·장·부록 존재
- **Failure Condition:** 절반만 출력. 본문 순서 뒤섞임
- **Regression Risk:** ids 쿼리 오적용
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-EXPORT-03 그림·폰트·쪽번호·TOC

- **Test Name:** PDF 자산
- **Related Screen:** S15
- **Related Function ID:** F-EXPORT-01
- **Related API:** API-EXPORT-01
- **Priority:** P1
- **Preconditions:** 168쪽 (슬롯은 placeholder 가능 — 설계본 sidecar 없을 수 있음). 그림 있는 사본이면 그림 확인
- **Test Data:** 설계본 + 그림 사본
- **Steps:** PDF에서 TOC 번호, 쪽번호, 한글 폰트, 이미지(있을 때)
- **Expected Result:** 깨진 네모 글꼴 없음(한글). 쪽번호 존재. TOC 점프는 있으면 PASS, 없으면 번호만이라도
- **Failure Condition:** 전 페이지 폰트 대체 실패
- **Regression Risk:** `_shared` 폰트 경로
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-EXPORT-04 Preview vs PDF PARTIAL

- **Test Name:** 공유 규칙 (픽셀 아님)
- **Related Screen:** S14, S15
- **Related Function ID:** F-PREVIEW-01, F-EXPORT-01
- **Related API:** API-BOOK-11, API-EXPORT-01
- **Priority:** P1
- **Preconditions:** 같은 저장본
- **Test Data:** 사본
- **Steps:** Preview 장 순서 vs PDF
- **Expected Result:** 같은 문장·같은 장 순서. 주요 면(표지/차례/장). 쪽 나눔이 1–2쪽 달라도 합리면 PASS
- **Failure Condition:** 장 누락. 본문 다름. 픽셀 diff를 Gate로 사용
- **Regression Risk:** 완전 동일 렌더러 요구
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-EXPORT-05 HIDE 옵션

- **Test Name:** Print/EPUB/ZIP 삭제되지 않음
- **Related Screen:** S15 제품 UI
- **Related Function ID:** F-EXPORT-05..07
- **Related API:** API-EXPORT-01 print, API-EXPORT-02, API-EXPORT-03
- **Priority:** P2
- **Preconditions:** 엔진 기동
- **Test Data:** 사본 `file`
- **Steps:** 제품 CTA에 고급 옵션 숨김. Route는 응답
- **Expected Result:** MVP UI HIDE. Route 404로 삭제되면 FAIL (KEEP / HIDE)
- **Failure Condition:** Route 제거
- **Regression Risk:** “안 쓰는 API 삭제”
- **Manual / Automatable:** Automatable (Route)
- **MVP / Later:** MVP Gate는 HIDE만. Route KEEP은 P1으로 격상 가능 — **P1**로 취급

(우선순위 확정: Route 삭제는 엔진 계약 위반 → **P1**.)

---

## 18. Export Complete QA

### QA-DONE-01 성공 화면

- **Test Name:** S16 SUCCESS
- **Related Screen:** S16
- **Related Function ID:** F-DONE-01, F-EXPORT-02
- **Related API:** API-EXPORT-01 응답/캐시
- **Priority:** P1
- **Preconditions:** QA-EXPORT-01 성공
- **Test Data:** 파일명
- **Steps:** S16 진입. 다운로드
- **Expected Result:** 성공 문구, 파일명, 파일 저장
- **Failure Condition:** 실패 PDF를 SUCCESS
- **Regression Risk:** 다운로드만 되고 실패를 삼킴
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — TARGET_MVP UI

### QA-DONE-02 다시 다운로드

- **Test Name:** 재다운로드
- **Related Screen:** S16
- **Related Function ID:** F-EXPORT-02
- **Related API:** 캐시 또는 blob
- **Priority:** P1
- **Preconditions:** S16
- **Test Data:** 동일 PDF
- **Steps:** 다운로드 두 번
- **Expected Result:** 두 번 모두 유효 PDF. 책 HTML 불변
- **Failure Condition:** 두 번째에 재생성 실패를 성공으로
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-DONE-03 Book으로

- **Test Name:** 같은 책 복귀
- **Related Screen:** S16 → S10
- **Related Function ID:** F-DONE-02
- **Related API:** API-BOOK-11
- **Priority:** P1
- **Preconditions:** S16
- **Test Data:** 동일 `file`
- **Steps:** 돌아가기
- **Expected Result:** 같은 Workspace
- **Failure Condition:** 다른 책. 책 삭제
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-DONE-04 다시 Export

- **Test Name:** 재Export
- **Related Screen:** S16 → S15 → S16
- **Related Function ID:** F-EXPORT-03
- **Related API:** API-EXPORT-01
- **Priority:** P1
- **Preconditions:** 본문 추가 저장 후
- **Test Data:** 새 마커
- **Steps:** 다시 만들기
- **Expected Result:** 최신 저장본. 실패 시 S16 SUCCESS 아님
- **Failure Condition:** 옛 캐시만 성공 처리
- **Regression Risk:** 캐시 무조건 재사용
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

---

## 19. History Regression QA

제품 UI HIDE 가능. 엔진 Route는 CURRENT. Auto Save = Later (이 절에서 요구하지 않음).

테스트 책은 사본.

### QA-HIST-01 edit snapshot

- **Related Screen:** 기존 도구 (제품 숨김)
- **Related Function ID:** F-HIST-01
- **Related API:** API-HISTORY-01, API-EDIT-01
- **Priority:** P1
- **Preconditions:** 사본 저장
- **Test Data:** edit
- **Steps:** 저장. `.history/*__edit.html` 또는 `GET /__history`
- **Expected Result:** 직전 HTML 스냅샷. reason=edit
- **Failure Condition:** 스냅샷 없음 (commit 경로 제거)
- **Regression Risk:** Auto Save 선도입
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP 엔진 — CURRENT / 제품 Later
- **Test Name:** edit history

### QA-HIST-02 blocks / structure snapshot

- 동일. reason=`blocks`, `structure`. API-BLOCK-01, API-STRUCT-01. **Priority:** P1

### QA-HIST-03 restore

- **Test Name:** restore
- **Related Function ID:** F-HIST-01
- **Related API:** API-HISTORY-03
- **Priority:** P1
- **Preconditions:** 두 번 편집
- **Test Data:** 이전 id
- **Steps:** restore. 재오픈
- **Expected Result:** 해당 스냅샷 문장. reason `restore` 추가. sidecar는 복원 안 됨 (한계, §26)
- **Failure Condition:** 원본 파괴. 빈 파일
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP 엔진
- **Related Screen:** 기존 패널
- **Test Data:** history id

### QA-HIST-04 rename / cover reason

- **Test Name:** rename·cover 스냅샷
- **Related Function ID:** F-HIST-01, F-COVER-03, F-COVER-04
- **Related API:** API-BOOK-04, API-BOOK-05
- **Priority:** P2
- **Preconditions:** 사본
- **Steps:** 제목 변경, coverColor 변경
- **Expected Result:** reason `rename` / `cover` (기존)
- **Failure Condition:** Route 삭제
- **Regression Risk:** 없음
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP 엔진
- **Related Screen:** S12 / 기존

---

## 20. Existing 168-page Book Regression

대상: `books/내 포트폴리오, AI로 직접 만들기`

**절대 수정하지 않는다.** 편집 테스트 금지. 열기·보기·PDF·목록만.

사전에 `book.html` / `book.css` 해시 기록. 테스트 후 동일해야 한다.

Inventory 기준 (M0.5-B, 근사): Chapter 23, Part 5, chapter-ap 5, prompt 100, checklist 26, figure/image-slot 34, STEP/flow/wire 존재. 클래스 `appendix` 없음.

### QA-REGRESSION-01 열림

- **Related Screen:** S03, S10
- **Related Function ID:** F-LIB-01, F-LIB-02
- **Related API:** API-BOOK-01, API-BOOK-11
- **Priority:** P0
- **Preconditions:** 원본 존재. json 없어도 됨
- **Test Data:** 해당 `file`
- **Steps:** 목록 → 열기
- **Expected Result:** 로드. 변환 마법사 없음
- **Failure Condition:** migrate 프롬프트. 열기 실패
- **Regression Risk:** json 필수화
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT
- **Test Name:** 168쪽 열기

### QA-REGRESSION-02 Single / Spread / Grid

- **Related Screen:** S14
- **Related Function ID:** F-PREVIEW-01..03
- **Related API:** API-BOOK-11
- **Priority:** P0
- **Preconditions:** QA-REGRESSION-01
- **Test Data:** 원본
- **Steps:** 세 모드
- **Expected Result:** 쪽 렌더. 160+ 쪽 근처. 모드 전환 가능
- **Failure Condition:** 한 모드 붕괴
- **Regression Risk:** 뷰어 WRAP
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP
- **Test Name:** 168쪽 Viewer

### QA-REGRESSION-03 표현력 샘플

- **Test Name:** 이미지·표·Prompt·Checklist·STEP·Flow·Wire·Chapter·Appendix·TOC
- **Related Screen:** S14
- **Related Function ID:** F-PREVIEW-04
- **Related API:** API-BOOK-11
- **Priority:** P0
- **Preconditions:** Grid/Single로 해당 장 이동
- **Test Data:** 설계본 (읽기)
- **Steps:**
  - 표지/본문 `image-slot` 자리 (sidecar 없으면 placeholder PASS)
  - `table.grid` 1
  - `.prompt` 상자
  - `ul.checklist`
  - `step-tag` / STEP 제목
  - `.flow` / `.wire`
  - `chapter-ch` / `chapter-ap` (APPENDIX)
  - `#toc` 항목·href
- **Expected Result:** 각 패턴이 보임. 클래스가 일반 `p`로 평탄화되지 않음
- **Failure Condition:** 신규 기능이 HTML을 재직렬화해 상자 손실
- **Regression Risk:** htmltree serialize SoT
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-REGRESSION-04 PDF 160+

- **Related Screen:** S15
- **Related Function ID:** F-EXPORT-01
- **Related API:** API-EXPORT-01
- **Priority:** P0
- **Preconditions:** Chrome. 원본 해시
- **Test Data:** 168쪽 `file`
- **Steps:** 전체 전자책 PDF. 해시 재확인
- **Expected Result:** 160+ 쪽 PDF. 열림. HTML/CSS 불변
- **Failure Condition:** timeout을 성공. 원본 수정. 쪽 수 크게 부족
- **Regression Risk:** print=1 오적용
- **Manual / Automatable:** Manual + 해시
- **MVP / Later:** MVP
- **Test Name:** 168쪽 PDF

### QA-REGRESSION-05 Migration 없음

- **Test Name:** 원본 바이트
- **Related Screen:** 전 구간
- **Related Function ID:** —
- **Related API:** —
- **Priority:** P0
- **Preconditions:** 스위트 시작/끝
- **Test Data:** html/css 해시
- **Steps:** MVP 기능 전체 후 비교
- **Expected Result:** 원본 두 파일 동일. 새 json/sidecar를 QA가 원본에 만들지 않음 (실수로 생겼으면 FAIL, 복구)
- **Failure Condition:** 어떤 write든
- **Regression Risk:** 상태 저장이 검증 도서에 json 생성
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP

상태 변경(F-LIB-10)은 설계본이 아니라 사본에서만 (QA-LIB-10).

---

## 21. Data Loss Prevention

모두 P0. Gate 항목.

### QA-LOSS-01 확정 전 write 없음

- Screen S04–S08. Function F-NEW/F-IMPORT/F-STRUCT/F-THEME. API TARGET only. Steps: 마법사 중 `books/` diff. Expected: 0 신규. Failure: create. CURRENT `/__new-book`을 S05에서 쓰면 FAIL. Automatable. MVP TARGET.

### QA-LOSS-02 기존 Book overwrite 없음

- 생성 시 기존 폴더명 충돌은 `uniqueFolder`. 168쪽 경로 불변. API-BOOK-03. P0. Automatable.

### QA-LOSS-03 Save conflict overwrite 없음

- QA-EDITOR-02/07과 동일 판정. API-EDIT-01 409. P0.

### QA-LOSS-04 Theme → Content 손상 없음

- QA-THEME-04와 동일. P0.

### QA-LOSS-05 Image State 손실 없음

- QA-COVER-05. 제품이 slot id를 바꾸지 않음. P0.

### QA-LOSS-06 168쪽 Migration 없음

- QA-REGRESSION-05. P0.

### QA-LOSS-07 PDF가 원본 변경 없음

- QA-EXPORT-01 해시. sidecar도 불변. P0.

---

## 22. Performance / Scale

임의 ms SLA 없음. **실행 불가 수준의 Freeze / Crash / Timeout / 무응답**이면 FAIL.

### QA-PERF-01 100,000자 원고

- **Related Screen:** S05, S07, S09
- **Related Function ID:** F-IMPORT-04, F-GEN-01
- **Related API:** API-IMPORT-02, API-BOOK-03
- **Priority:** P1
- **Preconditions:** 충분한 디스크
- **Test Data:** ~100,000자 TXT/MD
- **Steps:** 파싱 → (성공 시) 생성
- **Expected Result:** 완료 또는 명시적 ERROR. 브라우저/서버 크래시 없음. 가짜 % 없음
- **Failure Condition:** 탭 죽음. 유령 폴더
- **Regression Risk:** 동기 파싱이 UI를 영구 정지
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP
- **Test Name:** 대용량 원고

### QA-PERF-02 160페이지 이상 Book

- **Test Name:** 설계본 규모 열기
- **Related Screen:** S10, S14
- **Related Function ID:** F-LIB-02, F-PREVIEW-01
- **Related API:** API-BOOK-11
- **Priority:** P1
- **Preconditions:** 168쪽 원본 (읽기)
- **Test Data:** 설계본
- **Steps:** 열기. Paged.js 완료 대기. Single 이동
- **Expected Result:** 나눔 완료. 크래시 없음
- **Failure Condition:** 무한 로딩을 성공으로. 프로세스 종료
- **Regression Risk:** 셸 오버헤드
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-PERF-03 큰 DOCX

- **Test Name:** 큰 DOCX Import
- **Related Screen:** S05
- **Related Function ID:** F-IMPORT-01, F-IMPORT-04
- **Related API:** API-IMPORT-02
- **Priority:** P1
- **Preconditions:** S04 import
- **Test Data:** 수 MB 본문 DOCX (그림 많아도 본문만 쓰면 됨)
- **Steps:** 업로드. “원고 읽는 중”
- **Expected Result:** 완료 또는 명시 오류. write 없음. 크래시 없음
- **Failure Condition:** 무응답. 부분 폴더
- **Regression Risk:** mammoth 메모리
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-PERF-04 PDF Export 규모

- **Test Name:** 160+ PDF 시간
- **Related Screen:** S15
- **Related Function ID:** F-EXPORT-01
- **Related API:** API-EXPORT-01
- **Priority:** P1
- **Preconditions:** Chrome. 168쪽
- **Test Data:** 설계본 `file`
- **Steps:** Export. “PDF 만드는 중”
- **Expected Result:** PDF 또는 명시 실패. 원본 불변. 무한 hang 아님
- **Failure Condition:** 타임아웃을 SUCCESS. HTML 변경
- **Regression Risk:** Chrome 프로필
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

---

## 23. Browser / Accessibility

제품 명세에 공식 브라우저 매트릭스가 없다. **새 보장 범위를 만들지 않는다.**

검증 대상 (관례, 보장 선언 아님):

| Browser | 취급 | Gate |
|---|---|---|
| Chrome 최신 | MVP 주 검증. PDF 파이프라인과 동일 계열 | P1 핵심 흐름 |
| Edge 최신 | Chrome과 동일하게 확인 | P1 (QA-E2E-01, 저장, Preview) |
| Safari | Verify만. 실패는 P2로 기록 | Gate 밖 |

### QA-BROWSER-01 Chrome / Edge

- **Test Name:** 최신 Chromium
- **Related Screen:** S03–S16
- **Related Function ID:** QA-E2E-01 세트
- **Related API:** 해당 E2E
- **Priority:** P1
- **Preconditions:** Chrome 또는 Edge 최신
- **Test Data:** QA-E2E-01
- **Steps:** Happy Path 1회
- **Expected Result:** 통과
- **Failure Condition:** 핵심 흐름 불가
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-BROWSER-02 Safari Verify

- **Test Name:** Safari 기록
- **Related Screen:** S03, S10, S14
- **Related Function ID:** F-LIB-02, F-PREVIEW-01
- **Related API:** API-BOOK-11
- **Priority:** P2
- **Preconditions:** Safari 사용 가능할 때만
- **Test Data:** 기존 책 열기
- **Steps:** 목록·열기·Single
- **Expected Result:** 결과를 기록. 실패해도 Gate 비차단
- **Failure Condition:** 없음 (Gate)
- **Regression Risk:** Safari를 MVP 필수로 승격하지 말 것
- **Manual / Automatable:** Manual
- **MVP / Later:** Later / Verify

접근성: WCAG 전체 인증은 MVP 조건이 아니다.

### QA-A11Y-01 버튼·폼 label

- **Test Name:** label / error text
- **Related Screen:** S04, S05, S06, S15
- **Related Function ID:** F-NEW-01, F-IMPORT-01, F-META-01, F-EXPORT-01
- **Related API:** 없음
- **Priority:** P2
- **Preconditions:** 마법사·Export UI
- **Test Data:** 없음
- **Steps:** 버튼 접근 이름. 제목 필드 label. 오류가 텍스트로 보임
- **Expected Result:** 아이콘만인 Primary 없음. 오류가 색만으로 전달되지 않음
- **Failure Condition:** 오류를 색점만으로 표시 (P2)
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP (비Gate)

### QA-A11Y-02 keyboard / focus / disabled

- **Test Name:** 키보드 최소
- **Related Screen:** S04, S06, S10
- **Related Function ID:** F-NEW-01, F-META-01, F-EDITOR-02
- **Related API:** 없음
- **Priority:** P2
- **Preconditions:** 키보드
- **Test Data:** 없음
- **Steps:** Tab으로 Primary 도달. Disabled 버튼 활성화 불가. focus 가시
- **Expected Result:** 핵심 CTA 도달. disabled 클릭 무효
- **Failure Condition:** focus 함정만 있으면 P2
- **Regression Risk:** Editor 내부 키보드는 기존 유지 (재작성 금지)
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP (비Gate)

---

## 24. Negative / Error Cases

현재 엔진 메시지를 우선한다. 새 Error Code를 발명하지 않음.

### QA-NEG-01 book not found

- **Test Name:** 없는 file
- **Related Screen:** S10, S15
- **Related Function ID:** F-LIB-02, F-EXPORT-01
- **Related API:** API-BOOK-11, API-EXPORT-01
- **Priority:** P1
- **Preconditions:** 잘못된 경로
- **Test Data:** `books/없는책/book.html`
- **Steps:** 열기 / PDF
- **Expected Result:** 404 `책 파일을 찾지 못했습니다`. 다른 책 불변
- **Failure Condition:** 빈 폴더 생성
- **Regression Risk:** 없음
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — CURRENT

### QA-NEG-02 마지막 장 / 마지막 블록

- **Test Name:** 구조·블록 하한
- **Related Screen:** S07, S10
- **Related Function ID:** F-STRUCT-05, F-STRUCT-07, F-EDITOR-04
- **Related API:** API-STRUCT-02, API-STRUCT-01, API-BLOCK-01
- **Priority:** P1
- **Preconditions:** 장 1 / 블록 1
- **Test Data:** 사본 또는 세션
- **Steps:** 삭제
- **Expected Result:** `마지막 남은 장은 지울 수 없어요` / 마지막 블록 거부
- **Failure Condition:** 빈 HTML
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP

### QA-NEG-03 중첩 붙여넣기 / unsafe

- **Test Name:** edit validation
- **Related Screen:** S10
- **Related Function ID:** F-EDITOR-02
- **Related API:** API-EDIT-01
- **Priority:** P1
- **Preconditions:** 사본 편집
- **Test Data:** 문단 안 블록 HTML. javascript: URL
- **Steps:** 저장
- **Expected Result:** 400 기존 문구. commit 없음
- **Failure Condition:** 저장 성공
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-NEG-04 Chrome 부재 PDF

- **Test Name:** PDF generation failure
- **Related Screen:** S15
- **Related Function ID:** F-EXPORT-01
- **Related API:** API-EXPORT-01
- **Priority:** P1
- **Preconditions:** Chrome을 쓸 수 없는 환경이거나 경로 오류 (가능 시)
- **Test Data:** 사본 `file`
- **Steps:** Export
- **Expected Result:** ERROR. S16 SUCCESS 아님. HTML 불변
- **Failure Condition:** 빈 파일을 성공
- **Regression Risk:** 없음
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-NEG-05 표지 형식

- **Test Name:** 잘못된 표지 이미지
- **Related Screen:** S12
- **Related Function ID:** F-COVER-02
- **Related API:** API-BOOK-06
- **Priority:** P2
- **Preconditions:** 사본
- **Test Data:** gif / 비이미지
- **Steps:** 업로드
- **Expected Result:** `PNG, JPEG, WebP 이미지만` (또는 기존 ACCEPT). sidecar 오염 없음
- **Failure Condition:** 깨진 sidecar로 전 슬롯 소실
- **Regression Risk:** 전체 JSON 덮어쓰기
- **Manual / Automatable:** Manual
- **MVP / Later:** MVP — CURRENT

### QA-NEG-06 휴지통 없음

- **Test Name:** 잘못된 trash id
- **Related Screen:** S03
- **Related Function ID:** F-LIB-06
- **Related API:** API-BOOK-09
- **Priority:** P2
- **Preconditions:** 없음
- **Test Data:** 가짜 id
- **Steps:** restore
- **Expected Result:** 404 `휴지통에서 찾지 못했습니다`
- **Failure Condition:** books/ 손상
- **Regression Risk:** 없음
- **Manual / Automatable:** Automatable
- **MVP / Later:** MVP — CURRENT

---

## 25. QA Traceability Matrix

| QA ID | Screen | Function | API | Priority | MVP/Later | Manual/Auto |
|---|---|---|---|---|---|---|
| QA-E2E-01 | S03–S16 | F-LIB-03 … F-DONE-01 | API-IMPORT-02, API-BOOK-03, API-EDIT-01, API-STATE-01, API-EXPORT-01 | P0 | MVP TARGET | Manual+Auto |
| QA-E2E-02 | S03–S10 | F-NEW-02, F-GEN-01 | API-BOOK-03 | P1 | MVP TARGET | Manual |
| QA-LIB-01 | S03 | F-LIB-01 | API-BOOK-01, API-BOOK-02 | P0 | MVP CURRENT | Auto |
| QA-LIB-02 | S03→S10 | F-LIB-02, F-WS-01 | API-BOOK-11 | P1 | MVP CURRENT | Manual |
| QA-LIB-03 | S03→S04 | F-LIB-03 | 없음 | P0 | MVP TARGET | Manual+Auto |
| QA-LIB-04 | S03 | F-LIB-04 | API-BOOK-07 | P1 | MVP CURRENT | Auto |
| QA-LIB-05 | S03 | F-LIB-05 | API-BOOK-08 | P1 | MVP CURRENT | Manual |
| QA-LIB-06 | S03 | F-LIB-06 | API-BOOK-09 | P1 | MVP CURRENT | Manual |
| QA-LIB-07 | S03 | F-LIB-07 | API-BOOK-10 | P1 | MVP CURRENT | Manual |
| QA-LIB-08 | S03 | F-LIB-08 | API-BOOK-01 | P2 | MVP CURRENT | Manual |
| QA-LIB-09 | S03 | F-LIB-09 | API-BOOK-01 | P2 | MVP CURRENT | Manual |
| QA-LIB-10 | S03 | F-LIB-10 | API-BOOK-05 | P2 | MVP CURRENT | Auto |
| QA-NEW-01 | S04 | F-NEW-01, F-NEW-02 | 없음 | P1 | MVP TARGET | Manual |
| QA-NEW-02 | S04–S08 | F-LIB-03 | 없음 | P0 | MVP TARGET | Auto |
| QA-IMPORT-01 | S05 | F-IMPORT-01,03,04 | API-IMPORT-02 | P1 | MVP TARGET | Manual |
| QA-IMPORT-02 | S05 | F-IMPORT-01,03,04 | API-IMPORT-02 | P1 | MVP TARGET | Manual |
| QA-IMPORT-03 | S05 | F-IMPORT-01,03,04 | API-IMPORT-02 | P1 | MVP TARGET | Manual |
| QA-IMPORT-04 | S05 | F-IMPORT-01,03,04 | API-IMPORT-02 | P1 | MVP TARGET | Manual |
| QA-IMPORT-05 | S05 | F-IMPORT-02 | API-IMPORT-02 | P1 | MVP TARGET | Manual |
| QA-IMPORT-06 | S05 | F-IMPORT-03,07 | API-IMPORT-03 | P1 | MVP | Manual |
| QA-IMPORT-07 | S05 | F-IMPORT-07 | API-IMPORT-02 | P1 | MVP | Manual |
| QA-IMPORT-08 | S05 | F-IMPORT-07 | API-IMPORT-02 | P1 | MVP | Manual |
| QA-IMPORT-09 | S05 | F-IMPORT-01,04,05 | API-IMPORT-02 | P0 | MVP TARGET | Auto |
| QA-META-01 | S06 | F-META-01 | 세션 | P1 | MVP TARGET | Manual |
| QA-META-02 | S06 | F-META-02 | 세션 | P2 | MVP TARGET | Manual |
| QA-META-03 | S06 | F-META-03 | API-BOOK-03 | P1 | MVP | Manual |
| QA-META-04 | S06 | F-META-01..04 | 없음 | P0 | MVP TARGET | Auto |
| QA-STRUCT-01 | S07 | F-STRUCT-01 | API-STRUCT-02 | P1 | MVP TARGET | Manual |
| QA-STRUCT-02 | S07 | F-STRUCT-02 | API-STRUCT-02 | P1 | MVP TARGET | Manual |
| QA-STRUCT-03 | S07 | F-STRUCT-03 | API-STRUCT-02 | P1 | MVP TARGET | Manual |
| QA-STRUCT-04 | S07 | F-STRUCT-04 | API-STRUCT-02 | P1 | MVP TARGET | Manual |
| QA-STRUCT-05 | S07 | F-STRUCT-05 | API-STRUCT-02 | P1 | MVP TARGET | Manual |
| QA-STRUCT-06 | S07→S08 | F-STRUCT-06 | 없음 | P0 | MVP TARGET | Auto |
| QA-STRUCT-07 | S07→S05 | F-IMPORT-06 | 없음 | P1 | MVP TARGET | Manual |
| QA-STRUCT-08 | S05–S08 | F-IMPORT-*, F-STRUCT-*, F-THEME-* | TARGET only | P0 | MVP TARGET | Auto |
| QA-THEME-01 | S08, S11 | F-THEME-01 | 없음 | P1 | MVP TARGET | Manual |
| QA-THEME-02 | S08 | F-THEME-02 | 없음 | P0 | MVP TARGET | Manual |
| QA-THEME-03 | S08, S11 | F-THEME-03 | Viewer WRAP | P1 | MVP TARGET | Manual |
| QA-THEME-04 | S11, S09 | F-THEME-04 | API-THEME-01 TARGET | P0 | MVP TARGET | Auto |
| QA-THEME-05 | S11→S14 | F-THEME-04, F-PREVIEW-01 | API-BOOK-11 | P1 | MVP TARGET | Manual |
| QA-THEME-06 | S11 | F-THEME-04 | CSS | P0 | MVP | Auto |
| QA-GEN-01 | S09 | F-GEN-01, F-IMPORT-05 | API-BOOK-03 | P0 | MVP WRAP | Auto |
| QA-GEN-02 | S09→S10 | F-STRUCT-02, F-GEN-01 | API-BOOK-03 | P1 | MVP TARGET | Manual |
| QA-GEN-03 | S09 | F-THEME-04, F-GEN-01 | API-BOOK-03 | P1 | MVP TARGET | Manual |
| QA-GEN-04 | S09 | F-GEN-04 | API-BOOK-03 | P0 | MVP TARGET | Manual |
| QA-GEN-05 | S09 | F-GEN-05 | API-BOOK-03 | P1 | MVP TARGET | Manual |
| QA-WS-01 | S10 | F-WS-01, F-WS-02 | API-BOOK-11 | P1 | MVP TARGET | Manual |
| QA-EDITOR-01 | S10 | F-EDITOR-01..03 | API-EDIT-01 | P0 | MVP CURRENT | Manual |
| QA-EDITOR-02 | S10 | F-EDITOR-02 | API-EDIT-01 | P0 | MVP CURRENT | Auto |
| QA-EDITOR-03 | S10 | F-EDITOR-02 | API-EDIT-01 | P0 | MVP CURRENT | Auto |
| QA-EDITOR-04 | S10 | F-EDITOR-04 | API-BLOCK-01 | P1 | MVP CURRENT | Manual |
| QA-EDITOR-05 | S10 | F-STRUCT-07 | API-STRUCT-01 | P1 | MVP CURRENT | Manual |
| QA-EDITOR-06 | S10 | F-EDITOR-08, F-WS-03 | API-EDIT-01 | P1 | MVP CURRENT | Manual |
| QA-EDITOR-07 | S10 | F-EDITOR-02 | API-EDIT-01 | P0 | MVP CURRENT | Manual |
| QA-COVER-01 | S12, S14 | F-COVER-01 | API-BOOK-11 | P1 | MVP CURRENT | Manual |
| QA-COVER-02 | S12 | F-COVER-02 | API-STATE-01, API-BOOK-06 | P1 | MVP CURRENT | Manual |
| QA-COVER-03 | S14 | F-COVER-02 | API-STATE-01 | P1 | MVP CURRENT | Manual |
| QA-COVER-04 | S03, S15 | F-LIB-04..06, F-EXPORT-01 | API-BOOK-07..09, API-EXPORT-01 | P1 | MVP CURRENT | Manual |
| QA-COVER-05 | S12 | F-COVER-02 | API-STATE-01 | P0 | MVP | Auto |
| QA-COVER-06 | S12 | F-COVER-03 | API-BOOK-04 | P1 | MVP CURRENT | Manual |
| QA-PREVIEW-01 | S14 | F-PREVIEW-01,04 | API-BOOK-11 | P1 | MVP CURRENT | Manual |
| QA-PREVIEW-02 | S14 | F-PREVIEW-02 | API-BOOK-11 | P1 | MVP CURRENT | Manual |
| QA-PREVIEW-03 | S14 | F-PREVIEW-03 | API-BOOK-11 | P1 | MVP CURRENT | Manual |
| QA-PREVIEW-04 | S10, S14 | F-WS-02 | API-BOOK-11 | P2 | MVP CURRENT | Manual |
| QA-EXPORT-01 | S15 | F-EXPORT-01 | API-EXPORT-01 | P0 | MVP CURRENT | Manual+Auto |
| QA-EXPORT-02 | S15 | F-EXPORT-01 | API-EXPORT-01 | P0 | MVP CURRENT | Manual |
| QA-EXPORT-03 | S15 | F-EXPORT-01 | API-EXPORT-01 | P1 | MVP CURRENT | Manual |
| QA-EXPORT-04 | S14, S15 | F-PREVIEW-01, F-EXPORT-01 | API-BOOK-11, API-EXPORT-01 | P1 | MVP | Manual |
| QA-EXPORT-05 | S15 | F-EXPORT-05..07 | API-EXPORT-01..03 | P1 | MVP HIDE | Auto |
| QA-DONE-01 | S16 | F-DONE-01, F-EXPORT-02 | API-EXPORT-01 | P1 | MVP TARGET | Manual |
| QA-DONE-02 | S16 | F-EXPORT-02 | 캐시/blob | P1 | MVP TARGET | Manual |
| QA-DONE-03 | S16→S10 | F-DONE-02 | API-BOOK-11 | P1 | MVP TARGET | Manual |
| QA-DONE-04 | S16 | F-EXPORT-03 | API-EXPORT-01 | P1 | MVP TARGET | Manual |
| QA-HIST-01 | 숨김 | F-HIST-01 | API-HISTORY-01, API-EDIT-01 | P1 | MVP 엔진 / Later UI | Auto |
| QA-HIST-02 | 숨김 | F-HIST-01 | API-BLOCK-01, API-STRUCT-01 | P1 | MVP 엔진 | Auto |
| QA-HIST-03 | 숨김 | F-HIST-01 | API-HISTORY-03 | P1 | MVP 엔진 | Manual |
| QA-HIST-04 | S12 | F-HIST-01, F-COVER-03,04 | API-BOOK-04, API-BOOK-05 | P2 | MVP 엔진 | Auto |
| QA-REGRESSION-01 | S03, S10 | F-LIB-01,02 | API-BOOK-01,11 | P0 | MVP CURRENT | Manual |
| QA-REGRESSION-02 | S14 | F-PREVIEW-01..03 | API-BOOK-11 | P0 | MVP CURRENT | Manual |
| QA-REGRESSION-03 | S14 | F-PREVIEW-04 | API-BOOK-11 | P0 | MVP CURRENT | Manual |
| QA-REGRESSION-04 | S15 | F-EXPORT-01 | API-EXPORT-01 | P0 | MVP CURRENT | Manual+Auto |
| QA-REGRESSION-05 | 전 구간 | — | — | P0 | MVP | Auto |
| QA-LOSS-01 | S04–S08 | F-NEW/IMPORT/STRUCT/THEME | TARGET | P0 | MVP TARGET | Auto |
| QA-LOSS-02 | S09 | F-GEN-01 | API-BOOK-03 | P0 | MVP | Auto |
| QA-LOSS-03 | S10 | F-EDITOR-02 | API-EDIT-01 | P0 | MVP CURRENT | Auto |
| QA-LOSS-04 | S11 | F-THEME-04 | CSS | P0 | MVP | Auto |
| QA-LOSS-05 | S12 | F-COVER-02 | API-STATE-01 | P0 | MVP | Auto |
| QA-LOSS-06 | — | — | — | P0 | MVP | Auto |
| QA-LOSS-07 | S15 | F-EXPORT-01 | API-EXPORT-01 | P0 | MVP CURRENT | Auto |
| QA-PERF-01 | S05, S09 | F-IMPORT-04, F-GEN-01 | API-IMPORT-02, API-BOOK-03 | P1 | MVP | Manual |
| QA-PERF-02 | S10, S14 | F-LIB-02, F-PREVIEW-01 | API-BOOK-11 | P1 | MVP CURRENT | Manual |
| QA-PERF-03 | S05 | F-IMPORT-01,04 | API-IMPORT-02 | P1 | MVP | Manual |
| QA-PERF-04 | S15 | F-EXPORT-01 | API-EXPORT-01 | P1 | MVP CURRENT | Manual |
| QA-BROWSER-01 | S03–S16 | E2E | E2E | P1 | MVP | Manual |
| QA-BROWSER-02 | S03, S10, S14 | F-LIB-02, F-PREVIEW-01 | API-BOOK-11 | P2 | Later Verify | Manual |
| QA-A11Y-01 | S04–S06, S15 | F-NEW, F-IMPORT, F-META, F-EXPORT | 없음 | P2 | MVP 비Gate | Manual |
| QA-A11Y-02 | S04, S06, S10 | F-NEW-01, F-META-01, F-EDITOR-02 | 없음 | P2 | MVP 비Gate | Manual |
| QA-NEG-01 | S10, S15 | F-LIB-02, F-EXPORT-01 | API-BOOK-11, API-EXPORT-01 | P1 | MVP CURRENT | Auto |
| QA-NEG-02 | S07, S10 | F-STRUCT-05,07, F-EDITOR-04 | API-STRUCT-01,02, API-BLOCK-01 | P1 | MVP | Manual |
| QA-NEG-03 | S10 | F-EDITOR-02 | API-EDIT-01 | P1 | MVP CURRENT | Manual |
| QA-NEG-04 | S15 | F-EXPORT-01 | API-EXPORT-01 | P1 | MVP CURRENT | Manual |
| QA-NEG-05 | S12 | F-COVER-02 | API-BOOK-06 | P2 | MVP CURRENT | Manual |
| QA-NEG-06 | S03 | F-LIB-06 | API-BOOK-09 | P2 | MVP CURRENT | Auto |

LATER (출시 제외, 케이스 없음): S01 F-LAND-01, S02 F-AUTH-01, S13 F-AICOVER-01, S17 F-PAY-01, F-EDITOR-09 Auto Save.

---

## 26. Known Limitations

QA가 실패로 보지 않는 현재 엔진/제품 한계. Architecture를 바꾸라는 뜻이 아니다.

1. **History는 Image State를 복원하지 않는다.** restore 후 sidecar가 그 시점과 다를 수 있다. HTML만 스냅샷 (ENGINE_CONTRACT §10, DATA_SPEC §14.7).
2. **Preview와 PDF는 PARTIAL shared rules.** 픽셀/쪽 수 1–2 차이 허용.
3. **글 저장(`/__edit`)은 재Pagination 없음.** 미저장 글은 Preview/PDF에 없을 수 있다.
4. **Import는 기본 구조만.** prompt/checklist/figure/STEP/flow 미생성은 PASS.
5. **blocks는 10종.** 설계본 28종 삽입 불가는 PASS. 기존 HTML 삭제가 아니면 FAIL 아님.
6. **검증 도서에 sidecar/`book.json`이 없을 수 있다.** placeholder·상태 없음은 PASS.
7. **Theme id Persistence는 미정.** 실체는 `book.css`. id 파일 없음은 CURRENT PASS.
8. **S07/parse-only는 TARGET_MVP.** 구현 전에는 CURRENT `#new-book` 즉시 생성이 코드 사실이다. **제품 완료 판정은 TARGET을 기준으로 한다.**
9. **`import` history reason은 create가 호출하지 않음.** 없어도 엔진 FAIL 아님.
10. **Live Reload / watch는 sidecar·book.json을 무시.** 그림만 바꿔도 HTML reload 없음.
11. **Auto Save 없음.** 수동 저장만. History 폭증 테스트를 MVP에 넣지 않음.
12. **Print / EPUB / ZIP / Lint / History UI**는 HIDE. 삭제가 아니면 PASS.

---

## 27. Release Checklist

구현 후 이 목록을 위에서 아래로 닫는다. 새 수치를 추가하지 않는다.

- [ ] P0 open = 0
- [ ] QA-E2E-01 Import Happy Path
- [ ] QA-E2E-02 Empty Book (P1, 권장)
- [ ] S05–S08에서 `books/` 신규 폴더 없음 (QA-STRUCT-08, QA-LOSS-01)
- [ ] S09만 생성. 실패 시 유령 책 없음 (QA-GEN-01, QA-GEN-04)
- [ ] TXT / MD / PDF / DOCX Import (QA-IMPORT-01…04)
- [ ] 붙여넣기·미지원·빈 본문·스캔 PDF (QA-IMPORT-05…08)
- [ ] Practical / Minimal. HTML 의미 불변 (QA-THEME-02, QA-THEME-04)
- [ ] Theme 후 Preview 재나눔 (QA-THEME-05)
- [ ] Editor 저장·409·eid·블록·구조 (QA-EDITOR-01…05, QA-EDITOR-07)
- [ ] Image slot id ↔ sidecar (QA-COVER-05)
- [ ] Viewer Single / Spread / Grid (QA-PREVIEW-01…03, QA-REGRESSION-02)
- [ ] 전자책 PDF. HTML 불변 (QA-EXPORT-01, QA-LOSS-07)
- [ ] 168쪽 열기·표현력·PDF 160+·원본 해시 (QA-REGRESSION-01…05)
- [ ] S16은 성공 PDF만 (QA-DONE-01, QA-DONE-04)
- [ ] History 엔진 snapshot/restore (QA-HIST-01…03) — UI 숨김 허용
- [ ] Print/EPUB/ZIP Route 삭제 아님 (QA-EXPORT-05)
- [ ] Chrome 또는 Edge에서 핵심 흐름 (QA-BROWSER-01)
- [ ] Data Loss 7항 (QA-LOSS-01…07)

닫지 않아도 출시 가능:

- Safari (QA-BROWSER-02)
- A11Y P2
- 검색/정렬 P2
- History 제품 화면
- Auto Save / AI Cover / Auth / Payment

이 문서로 Development Specification QA는 끝난다. Implementation Plan·테스트 코드·구현은 포함하지 않는다.

