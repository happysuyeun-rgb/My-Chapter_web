# 차곡 Screen Specification

- Product: 차곡
- Stage: Development Specification — Screen
- Version: **1.1**
- Date: 2026-10-16
- Status: **CURRENT / IMPLEMENTATION BASELINE**
- Basis: `MY_CHAPTER_PRODUCT_SPEC.md` v1.4, `_docs/IA.md`, `_docs/TASK_FLOW.md`, `_docs/FUNCTION_SPEC.md`
- Pair: `_docs/SCREEN_DESIGN.md`, `_docs/FUNCTION_SPEC.md`

이 문서는 **각 화면에서 사용자가 무엇을 보고 무엇을 하는가**만 정한다.

---

## 1. Document Purpose

화면 ID·상태·CTA·기존 엔진 연결을 고정한다. 구현·API·DB·토큰 상세는 다음 단계다.

Architecture는 Product Spec v1.4와 IA/Task Flow를 따른다. 기존 S03 / S10 원고 / S14 / S15는 재설계하지 않고 KEEP / WRAP / MINOR UI CHANGE만 한다.

현재 Route는 `/` = Landing, `/library` = Library로 구현되어 있다. Phase 15에서 남은 것은 전용 Supabase 연결과 Runtime Auth QA다.

---

## 2. Global UI Rules

- 언어: 한국어.
- 한 화면에 Primary CTA 하나.
- 생성 마법사(S04–S09)는 확정 전 `books/`에 쓰지 않는다.
- 진행 표시는 실제 단계 문구만. 가짜 % 금지.
- 미저장 편집이 있으면 이탈 시 묻는다.
- Theme 변경은 문장·HTML 의미를 바꾸지 않는다.
- History / Inspection / Print / EPUB / Web ZIP은 엔진에 남기되 MVP 화면에서 숨길 수 있다. 삭제 금지.
- React/Vite 전제 화면을 설계하지 않는다. 기존 Vanilla 엔진을 감싼다.

상태 이름: DEFAULT / LOADING / EMPTY / ERROR / SUCCESS / DISABLED / UNSAVED / SAVING / CONFLICT / AUTH_CHECKING.

---

## 3. Navigation Model

```text
S01 Landing
  ├─ 로그인 → S02 Auth → returnTo 또는 S03
  ├─ 비로그인 새 책 → S02 Auth → S04
  ├─ 로그인 내 서재 → S03 Library
  └─ 로그인 새 책 → S04

S03 Library
  ├─ 새 책 → S04 → (empty) S06 → S08 → S09 → S10
  │                (import) S05 → S06 → S07 → S08 → S09 → S10
  └─ 책 열기 → S10 Workspace
                ├─ 원고   (기존 Editor)
                ├─ 디자인 S11
                ├─ 표지   S12
                └─ 미리보기 S14
                     └─ PDF → S15 → S16 → S10
```

마법사 뒤로: 직전 화면. 취소: S03 Library (`/library`). 취소 시 새 폴더 없음.

Later: S12 → S13 AI Cover. S16 / S03 → S17 Pricing/Payment.

---

## 4. Screen Status Matrix

| Screen | Existing / Partial / New | MVP / Later | Main Reuse |
|---|---|---|---|
| S01 Landing | Implemented | Phase 15 | `_shared/landing.html/js` |
| S02 Auth | Partial Implemented | Phase 15 | `_shared/auth.html`, `_shared/auth.js` |
| S03 Library | Existing / `/library` current | MVP | `_shared/library.html` |
| S04 New Book Method | Implemented | MVP | Wizard |
| S05 Manuscript Input | Implemented | MVP | file/paste + parser |
| S06 Book Metadata | Implemented | MVP | 제목/부제/저자 |
| S07 Structure Review | Implemented | MVP | parse result staging |
| S08 Theme Selection | Implemented | MVP | Practical / Minimal |
| S09 Book Generation | Implemented | MVP | `books.create` WRAP |
| S10 Manuscript Workspace | Implemented | MVP | `book_editor.js` + Workspace shell |
| S11 Design | Implemented | MVP | Theme 시스템 = S08 |
| S12 Cover | Implemented | MVP | `section.cover` + image-slot |
| S13 AI Cover Studio | New | Later | 없음 |
| S14 Preview | Existing / Wrapped | MVP | `paged_book_viewer.js` |
| S15 PDF Export | Existing / Wrapped | MVP | `/__pdf`, `server/pdf.mjs` |
| S16 Export Complete | Implemented | MVP | Workspace 완료 패널 |
| S17 Pricing / Payment | New | Later | 없음 |

---

## 5. S01 Landing

- **화면명:** Landing
- **목적:** 차곡 소개와 제품 진입. 엔진 아님
- **현재 구현 상태:** **Phase 15 Implemented / Runtime QA pending**
- **목표 Route:** `/`
- **기존 재사용 코드:** Auth session check만 재사용 가능. Book engine과 분리
- **Entry / Exit:** 공개 URL → S02 / S03 / S04
- **사용 데이터:** Auth session 상태만
- **Layout / Component / CTA:** Header + Hero + 제작 흐름 + Product Preview + Footer
- **비로그인 CTA:** 로그인, 새 책 만들기
- **로그인 CTA:** 내 서재, 새 책 만들기
- **Navigation:** 로그인 → `/__auth?returnTo=/library`; 비로그인 새 책 → `/__auth?returnTo=/__wizard`; 로그인 내 서재 → `/library`
- **상태:** DEFAULT / AUTH_CHECKING / AUTHENTICATED / AUTH_ERROR
- **MVP / Later:** **Phase 15**
- **관련 Function ID:** F-LAND-01, F-AUTH-03
- **DO NOT BREAK:** 로그인 사용자를 자동으로 Library로 강제 redirect하지 말 것. Landing은 항상 브랜드 진입점

---

## 6. S02 Auth

- **화면명:** Auth
- **목적:** 이메일 회원가입/로그인과 browser session 생성
- **현재 구현 상태:** **Phase 15 Partial Implemented** — UI/client/route 있음, 전용 Chagok Web 연결·Runtime QA pending
- **Route:** `/__auth`
- **기존 재사용 코드:** `_shared/auth.html`, `_shared/auth.js`
- **Entry / Exit:** S01 → Auth → 안전한 `returnTo` 또는 `/library`
- **Component:** 로그인/회원가입 전환, email, password, submit, status/error, 돌아가기
- **상태:** DEFAULT / SUBMITTING / SUCCESS / ERROR / ALREADY_AUTHENTICATED
- **Validation:** 내부 `returnTo`만 허용. `http://`, `https://`, `//` 거부
- **Session:** `persistSession: true`, `autoRefreshToken: true`, storage key `chagok-auth-v1`
- **MVP / Later:** **Phase 15**
- **관련 Function ID:** F-AUTH-01 … F-AUTH-05
- **DO NOT BREAK:** 앱용 MyChapter Supabase project 사용 금지. Auth를 Phase 16 전 Book ownership 보안 경계로 간주하지 말 것

---

## 7. S03 Library

- **화면명:** 서재
- **목적:** 책을 찾고 열고 만들고 정리한다.
- **현재 구현 상태:** **Existing / Workspace WRAP implemented**
- **기존 재사용 코드:** `_shared/library.html`
- **Entry Condition:** 목표 `/library`. S01 로그인 사용자 CTA, Auth 성공, S10/S16 복귀, 마법사 취소
- **Exit Condition:** F-LIB-02 → S10. F-LIB-03 → S04
- **사용 데이터:** 책 목록, `book.json` 상태/태그(있을 때), 표지 썸네일, trash
- **화면 Layout:** 상단 검색 + 새 책. 필터/정렬/휴지통. 카드 그리드
- **Component:** 검색, 정렬, 상태 배지, 카드, 새 책 버튼, 휴지통 대화상자, 책 정보(상태/태그), 로그인 이메일, 로그아웃. 기존 새 책 진입은 S04 Wizard로 연결
- **Primary CTA:** + 새 책 만들기 → S04
- **Secondary CTA:** 열기, 복제, 휴지통, 정보
- **Interaction:** 검색 즉시 필터. 정렬 변경. 카드 클릭 열기
- **Validation:** 기존
- **상태:**
  - DEFAULT: 카드
  - LOADING: 목록 로딩
  - EMPTY: 책 없음 + 새 책
  - EMPTY SEARCH: 검색 0
  - ERROR: 목록 실패
- **저장 시점:** 상태/태그만 즉시 `book.json`. 본문 아님
- **Navigation:** → S04, → S10. 로그아웃 → S01 `/`. 휴지통은 오버레이
- **관련 Function ID:** F-LIB-01 … F-LIB-10, F-LIB-03
- **기존 엔진 연결점:** 서재 HTML, `/__new-book`은 마법사 끝에서만, duplicate/trash/restore/purge/meta
- **DO NOT BREAK:** 새 Library를 만들지 말 것. json 없는 168쪽 책 열기. 한글 제목. Identity=`file`

**제품화 범위:** KEEP / WRAP / MINOR UI CHANGE. 새 책 버튼 연결만 필수 WRAP.

---

## 8. S04 New Book Method

- **화면명:** 제작 방식
- **목적:** 빈 책 vs 원고 Import
- **현재 구현 상태:** **Implemented**
- **기존 재사용 코드:** 없음. 생성 엔진 미호출
- **Entry Condition:** F-LIB-03
- **Exit Condition:** empty → S06. import → S05. 취소 → S03 `/library`
- **사용 데이터:** 세션 method만
- **화면 Layout:** 두 카드 + 취소
- **Component:** 빈 책 카드, 원고로 만들기 카드, 뒤로
- **Primary CTA:** 선택한 방식으로 계속 (선택 전 DISABLED)
- **Secondary CTA:** 취소
- **Interaction:** 카드 선택 후 계속
- **Validation:** 선택 필수
- **상태:** DEFAULT / DISABLED(미선택)
- **Loading / Empty / Error / Success:** 해당 없음
- **저장 시점:** 없음
- **Navigation:** S06 또는 S05
- **관련 Function ID:** F-NEW-01 … F-NEW-05
- **기존 엔진 연결점:** 없음
- **Recovery:** Phase 13 draft가 있으면 “작성 중이던 책이 있습니다.” → 이어서 하기 / 새로 시작. 파일 Import는 동일 fingerprint 재선택 시 구조 복구
- **DO NOT BREAK:** 이 화면에서 `books.create` 호출 금지. legacy wizard recovery key를 migration 없이 rename/delete 금지

---

## 9. S05 Manuscript Input

- **화면명:** 원고 입력
- **목적:** 파일을 올리거나 글을 붙여 넣고 파싱한다.
- **현재 구현 상태:** **Implemented** — file/paste + parse-only staging + recovery
- **기존 재사용 코드:** accept 목록, `manuscript-import.mjs` (파싱만)
- **Entry Condition:** S04 import. S07 다시 선택
- **Exit Condition:** 파싱 성공 → S06(메타 미입력) 또는 메타가 있으면 S07. 뒤로 → S04
- **사용 데이터:** 파일 또는 텍스트. 파싱 결과(세션)
- **화면 Layout:** 업로드 영역, 붙여넣기 영역, 형식 안내, 다음
- **Component:** dropzone, file input, textarea, 형식 칩(TXT MD PDF DOCX), 오류, 다음
- **Primary CTA:** 다음 (유효 입력 + 파싱 성공 후)
- **Secondary CTA:** 뒤로, 파일 제거
- **Interaction:** 드롭/선택 → 검증 → 파싱. 붙여넣기. 둘 다 있으면 마지막 입력 우선
- **Validation:** F-IMPORT-03. 빈 붙여넣기 거부
- **상태:**
  - DEFAULT
  - LOADING: 파싱 중 (실제 “원고 읽는 중”)
  - ERROR: 미지원/본문 없음/스캔 PDF
  - SUCCESS: 파일명 + 통계 미리보기 한 줄
  - DISABLED: 입력 없음
- **저장 시점:** 세션만. `source/` 금지
- **Navigation:** → S06 → S07. 메타를 S04 전에 받지 않았으면 S06 먼저
- **관련 Function ID:** F-IMPORT-01, F-IMPORT-02, F-IMPORT-03, F-IMPORT-04, F-IMPORT-07
- **기존 엔진 연결점:** parser. `create()` 아님
- **DO NOT BREAK:** PDF 지원 유지. 사용자 원본 파일 수정/삭제 금지. 고급 Component 생성 강요 금지

권장 순서 (Import): S04 → S05 → S06 → S07. 제목이 파싱에 쓰이면 S06을 S05 앞에 둘 수 있으나, **쓰기는 여전히 S09**.

---

## 10. S06 Book Metadata

- **화면명:** 책 기본정보
- **목적:** 제목·부제·저자
- **현재 구현 상태:** **Implemented**
- **기존 재사용 코드:** `#new-dialog` 제목/부제/저자
- **Entry Condition:** S04 empty 또는 S05 성공
- **Exit Condition:** 제목 유효 → empty면 S08, import면 S07. 뒤로 직전
- **사용 데이터:** title, subtitle, author. YEAR/DATE 자동
- **화면 Layout:** 폼 3필드
- **Component:** 제목*, 부제, 저자, 다음, 뒤로
- **Primary CTA:** 다음
- **Secondary CTA:** 뒤로
- **Interaction:** 제목 입력 시 Primary 활성
- **Validation:** 제목 필수
- **상태:** DEFAULT / DISABLED(제목 없음) / ERROR(공백 제목)
- **저장 시점:** 세션. HTML 전면부 쓰기는 S09
- **Navigation:** → S07 또는 S08
- **관련 Function ID:** F-META-01 … F-META-04
- **기존 엔진 연결점:** Template 치환 값과 동일 필드명
- **DO NOT BREAK:** 제목 변경이 폴더 Identity를 기본으로 바꾸지 않음. ISBN 등 추가 필드 요구 금지

---

## 11. S07 Structure Review

- **화면명:** 원고 구조 확인
- **목적:** Import 골격을 보고 고친 뒤 확정한다. AI 없음
- **현재 구현 상태:** **Implemented**
- **기존 재사용 코드:** parser units만. 기존 Editor 재사용 아님
- **Entry Condition:** Import 파싱 성공 + 메타
- **Exit Condition:** 확정 → S08. 다시 선택 → S05. 뒤로 → S06
- **사용 데이터:** Part / Chapter / Section 트리, 통계
- **화면 Layout:** 좌 트리, 우 선택 항목 제목, 하단 CTA
- **Component:** 트리, 제목 편집, 위/아래, 추가(부/장/부록/섹션), 삭제, 통계, Primary, Secondary
- **Primary CTA:** 이 구조로 책 만들기 → F-STRUCT-06 → S08
- **Secondary CTA:** 원고 다시 선택 → F-IMPORT-06
- **Interaction:** 인라인 제목, 순서 이동, 추가/삭제. 본문 문단 편집 없음
- **Validation:** 장 ≥ 1, 장 제목 비어 있지 않음. 마지막 장 삭제 불가
- **상태:**
  - DEFAULT
  - EMPTY: 장 0 → Primary DISABLED, 다시 선택
  - ERROR: 세션 만료
  - DISABLED: 확정 불가 조건
- **저장 시점:** 세션만. **destructive write 금지**
- **Navigation:** → S08, → S05
- **관련 Function ID:** F-STRUCT-01 … F-STRUCT-06, F-IMPORT-06
- **기존 엔진 연결점:** `importManuscript` 결과 형태. `structureOp`는 열린 책(S10)용
- **DO NOT BREAK:** 원본 원고 파괴 금지. `book.html` 생성 금지. 고급 상자 미생성을 오류로 보지 말 것

---

## 12. S08 Theme Selection

- **화면명:** 디자인 선택
- **목적:** Practical / Minimal을 고른다
- **현재 구현 상태:** **Implemented**
- **기존 재사용 코드:** Template/설계본 CSS 토큰, Paged.js 샘플 가능
- **Entry Condition:** S07 확정 또는 empty의 S06
- **Exit Condition:** 다음 → S09. 뒤로 → S07 또는 S06
- **사용 데이터:** theme id, 샘플 HTML (Template 계약)
- **화면 Layout:** 두 테마 + 샘플 미리보기
- **Component:** Practical 카드, Minimal 카드, Preview, 다음
- **Primary CTA:** 이 디자인으로 만들기 → S09
- **Secondary CTA:** 뒤로
- **Interaction:** 선택 즉시 Preview. 내용은 동일 클래스
- **Validation:** 기본 Practical
- **상태:** DEFAULT / LOADING(미리보기 나눔) / ERROR(미리보기 실패해도 선택은 유지)
- **저장 시점:** 세션. `book.css` 쓰기는 S09/S11
- **Navigation:** → S09
- **관련 Function ID:** F-THEME-01 … F-THEME-04
- **기존 엔진 연결점:** CSS Token Layer. HTML SoT 변경 없음
- **DO NOT BREAK:** Theme이 문장·구조를 바꾸면 안 됨. 새 Pagination 금지

---

## 13. S09 Book Generation

- **화면명:** 책 생성 상태
- **목적:** 실제 생성 단계를 보여 주고 성공 시 Workspace로 보낸다
- **현재 구현 상태:** **Implemented**
- **기존 재사용 코드:** `books.create` WRAP
- **Entry Condition:** S08 다음
- **Exit Condition:** 성공 → S10. 실패 → 재시도/이전/S03
- **사용 데이터:** 세션 전체. 성공 시 `file`
- **화면 Layout:** 단계 목록, 현재 단계, 오류, 재시도
- **Component:** 단계 표시, 오류 문구, 재시도, 이전, 서재
- **Primary CTA:** 없음(진행 중). 실패 시 다시 시도 (F-GEN-05)
- **Secondary CTA:** 실패 시 이전 / 서재
- **Interaction:** 자동 시작. 사용자 중단은 MVP에서 필수 아님
- **Validation:** 서버 측 제목 등
- **상태:** LOADING / SUCCESS / ERROR
- **Loading:** “원고 확인 / 책 틀 복사 / 구조 넣기 / 정보 넣기 / 디자인 적용”처럼 **실제 단계**
- **Empty:** 없음
- **Error:** F-GEN-04. 유령 폴더 없음
- **Success:** 짧은 완료 후 S10
- **저장 시점:** 성공 시 첫 `book.html` / `book.css` / `book.json` / `source/`
- **Navigation:** → S10
- **관련 Function ID:** F-GEN-01 … F-GEN-05, F-IMPORT-05, F-THEME-04
- **기존 엔진 연결점:** `POST /__new-book`에 해당하는 생성. 호출 시점은 여기만
- **DO NOT BREAK:** 가짜 %. 실패 잔여 폴더. 168쪽 기존 책 변환

---

## 14. S10 Manuscript Workspace

- **화면명:** Manuscript Workspace
- **목적:** 열린 책의 작업 셸. 원고 탭은 기존 Editor
- **현재 구현 상태:** **Implemented** — Workspace shell + 기존 Editor/Viewer WRAP
- **기존 재사용 코드:** `book_editor.js`, 미리보기 탭은 `paged_book_viewer.js`
- **Entry Condition:** S03 열기, S09 성공, S16 복귀
- **Exit Condition:** 서재. PDF 흐름. 탭
- **사용 데이터:** `book.html`, 저장 상태, 제목
- **화면 Layout:**

```text
← 내 서재    [책 제목]    [저장 상태]    [PDF]
[ 원고 ] [ 디자인 ] [ 표지 ] [ 미리보기 ]
……………… 탭 본문 ………………
```

- **Component:** 뒤로, 제목, 저장 상태, 저장 버튼(기존), PDF, 탭 4. 원고 본문 = 기존 Editor **내부 재작성 금지**
- **Primary CTA:** 저장 (UNSAVED일 때). 그 외 PDF
- **Secondary CTA:** 내 서재, 탭
- **Interaction:** 탭 전환 시 미저장 가드. 원고에서 기존 편집/블록/장 추가
- **Validation:** 기존 Editor
- **상태:** DEFAULT / UNSAVED / SAVING / SUCCESS(저장됨) / ERROR(저장 실패) / CONFLICT
- **Loading:** 책 HTML + Paged.js (기존)
- **Empty:** 빈 장 문단은 Template 문구일 수 있음. 정상
- **Error:** 열기/저장 실패
- **저장 시점:** 수동 Save + Phase 14 Autosave(1500ms debounce). Local Recovery는 400ms debounce
- **Navigation:** 디자인 S11, 표지 S12, 미리보기 S14, PDF S15, 서재 S03 `/library`
- **관련 Function ID:** F-WS-01, F-WS-02, F-WS-03, F-EDITOR-01, F-EDITOR-02, F-EDITOR-03, F-EDITOR-04, F-EDITOR-08, F-EDITOR-09, F-EDITOR-10, F-EDITOR-11, F-STRUCT-07, F-EXPORT-01
- **기존 엔진 연결점:** `/__edit` `/__blocks` `/__structure` eid overlay
- **Recovery / Conflict:** baseVersion이 맞는 local recovery만 복구 제안. stale recovery 자동 적용 금지. 409 시 autosave pause + dirty/recovery 보존 + 자동 재전송 금지
- **DO NOT BREAK:** Editor 내부 재작성 금지. 글 저장 후 쪽 유지. 설계본 HTML 변환 금지. blocks 28종 일괄 확장 금지. legacy editor recovery key 단순 rename/delete 금지

---

## 15. S11 Design

- **화면명:** 디자인
- **목적:** 같은 Theme System으로 책 토큰을 바꾼다
- **현재 구현 상태:** **Implemented**
- **기존 재사용 코드:** S08과 동일 Theme. Viewer 샘플 가능
- **Entry Condition:** S10 디자인 탭
- **Exit Condition:** 다른 탭. 적용 후 미리보기
- **사용 데이터:** 현재 theme, `book.css` 토큰
- **화면 Layout:** Practical / Minimal 두 Theme 카드 + Preview + 적용
- **Component:** Practical / Minimal, 현재/선택 상태, Preview, 적용
- **Later:** 본문 글자 크기·행간·쪽 여백 직접 조절 UI
- **Primary CTA:** 적용 (F-THEME-04)
- **Secondary CTA:** 되돌리기(적용 전)
- **Interaction:** 선택/슬라이더 → 미리보기 → 적용 시 `book.css`만
- **Validation:** 범위는 이후 Token 명세. 의미 구조 변경 컨트롤 없음
- **상태:** DEFAULT / UNSAVED(미적용 변경) / LOADING / SUCCESS / ERROR
- **저장 시점:** 적용 시 CSS. HTML 아님
- **Navigation:** 탭
- **관련 Function ID:** F-THEME-01 … F-THEME-04, F-WS-02
- **기존 엔진 연결점:** `book.css` `:root`
- **DO NOT BREAK:** HTML 재작성 금지. 클래스 계약 유지. 색만으로 문단 타입을 지우지 말 것

현재 구현에서 하지 않음: 본문 글자 크기·행간·쪽 여백 직접 조절, 컴포넌트별 색 픽커 풀세트, 폰트 파일 업로드, 판형 변경.

---

## 16. S12 Cover

- **화면명:** 표지
- **목적:** 기존 표지 면의 그림과 카피
- **현재 구현 상태:** **Implemented**
- **기존 재사용 코드:** `section.cover`, `image-slot`, rewriteFront
- **Entry Condition:** S10 표지 탭
- **Exit Condition:** 다른 탭
- **사용 데이터:** cover HTML, sidecar `cover-image`, 제목/부제/저자
- **화면 Layout:** 표지 미리보기 + 이미지 + 세 필드
- **Component:** 표지 프리뷰, 업로드, 제목, 부제, 저자, 기존 색(있으면)
- **Primary CTA:** 저장 (카피 변경 시)
- **Secondary CTA:** 이미지 제거
- **Interaction:** 드롭 이미지. 필드 편집
- **Validation:** 제목 필수. 이미지 형식 기존
- **상태:** DEFAULT / EMPTY(그림 없음, 정상) / UNSAVED / SUCCESS / ERROR
- **저장 시점:** 이미지=sidecar 즉시. 카피=HTML 저장
- **Navigation:** 탭. AI는 없음
- **관련 Function ID:** F-COVER-01 … F-COVER-04, F-META-01 … F-META-03
- **기존 엔진 연결점:** `/__state`, `/__book/cover`, `/__book/info`
- **DO NOT BREAK:** 표지 없는 책. 설계본 cover-flow 등 장식 삭제 강제 금지. AI 필수화 금지

---

## 17. S13 AI Cover Studio

- **화면명:** AI Cover
- **목적:** 이후 AI 표지
- **현재 구현 상태:** 없음
- **MVP / Later:** Later
- **관련 Function ID:** F-AICOVER-01
- **DO NOT BREAK:** S12 기존 표지를 대체하지 말 것

---

## 18. S14 Preview

- **화면명:** Preview
- **목적:** 나뉜 쪽을 Single / Spread / Grid로 본다
- **현재 구현 상태:** Existing
- **기존 재사용 코드:** `_shared/paged_book_viewer.js`
- **Entry Condition:** S10 미리보기 탭. 현재는 책 HTML 로드가 곧 뷰어
- **Exit Condition:** 다른 탭. PDF
- **사용 데이터:** 저장본 `book.html` + `book.css` + sidecar
- **화면 Layout:** 기존 툴바(모드, 쪽)를 셸 안으로 WRAP 가능. **모드 엔진 재작성 금지**
- **Component:** Single, Spread, Grid, 쪽 이동, 차례 점프
- **Primary CTA:** 없음 또는 PDF
- **Secondary CTA:** 모드 전환
- **Interaction:** 기존과 동일
- **Validation:** 없음
- **상태:** DEFAULT / LOADING(Paged.js) / ERROR(로드 실패)
- **저장 시점:** 없음. 보기 전용
- **Navigation:** S15
- **관련 Function ID:** F-PREVIEW-01 … F-PREVIEW-04, F-WS-02, F-EXPORT-01
- **기존 엔진 연결점:** `.pagedjs_page`, `setMode`, `goToPage`
- **DO NOT BREAK:** 세 모드. 새 Preview Engine. 글 저장 시 강제 재나눔을 요구하지 말 것(기존 계약)

---

## 19. S15 PDF Export

- **화면명:** PDF Export
- **목적:** 전자책 PDF를 만든다
- **현재 구현 상태:** **Existing engine / Product UX implemented**
- **기존 재사용 코드:** `book_tools.js`, `/__pdf`, `server/pdf.mjs`
- **Entry Condition:** S10/S14 PDF
- **Exit Condition:** 성공 → S16. 실패 → Workspace
- **사용 데이터:** `file`, 저장된 HTML
- **화면 Layout:** 제품 MVP는 **전자책 PDF 만들기** 한 장. 기존 고급 옵션은 HIDE
- **Component:** Primary 버튼, 진행(“PDF 만드는 중”), 오류. Print/EPUB/ZIP/장 선택/워터마크는 HIDE
- **Primary CTA:** 전자책 PDF 만들기
- **Secondary CTA:** 취소(가능하면)
- **Interaction:** 클릭 → 기존 파이프라인
- **Validation:** 책 존재
- **상태:** DEFAULT / LOADING / ERROR / SUCCESS(→S16)
- **저장 시점:** PDF 캐시 파일 가능(기존). HTML 불변
- **Navigation:** → S16
- **관련 Function ID:** F-EXPORT-01, F-EXPORT-03
- **기존 엔진 연결점:** Chrome + Paged.js + pdf-lib. Preview와 PARTIAL shared rules
- **DO NOT BREAK:** PDF 엔진 교체 금지. Print/EPUB/ZIP **삭제** 금지. 미저장 본문만으로 PDF를 성공으로 치지 말 것(저장 권고)

---

## 20. S16 Export Complete

- **화면명:** 출력 완료
- **목적:** 성공, 다운로드, 복귀, 재Export
- **현재 구현 상태:** **Implemented** — Workspace 완료 패널
- **기존 재사용 코드:** PDF 바이트/캐시
- **Entry Condition:** F-EXPORT-01 성공
- **Exit Condition:** S10 또는 재Export S15
- **사용 데이터:** 파일명, 책 제목, `file`
- **화면 Layout:** 성공 메시지, 파일명, 버튼 3
- **Component:** 성공, 다운로드, Book으로 돌아가기, 다시 만들기
- **Primary CTA:** PDF 다운로드 (F-EXPORT-02)
- **Secondary CTA:** Book으로 돌아가기 (F-DONE-02), 다시 만들기 (F-EXPORT-03)
- **Interaction:** 다운로드. 복귀. 재생성
- **Validation:** 없음
- **상태:** SUCCESS / ERROR(다운로드만 실패) / LOADING(재Export)
- **Empty:** 없음
- **저장 시점:** 없음
- **Navigation:** → S10, → S15
- **관련 Function ID:** F-DONE-01, F-DONE-02, F-EXPORT-02, F-EXPORT-03
- **기존 엔진 연결점:** 생성된 PDF
- **DO NOT BREAK:** 성공 화면이 책을 지우거나 변환하지 말 것

---

## 21. S17 Pricing

- **화면명:** Pricing
- **목적:** 이후 요금
- **현재 구현 상태:** 없음
- **MVP / Later:** Later
- **관련 Function ID:** F-PAY-01
- **DO NOT BREAK:** 로컬 MVP PDF를 결제 뒤로 숨기지 말 것

---

## 22. Screen → Function Traceability

| Screen | Function IDs |
|---|---|
| S01 | F-LAND-01, F-AUTH-03 |
| S02 | F-AUTH-01, F-AUTH-02, F-AUTH-03, F-AUTH-04, F-AUTH-05 |
| S03 | F-LIB-01, F-LIB-02, F-LIB-03, F-LIB-04, F-LIB-05, F-LIB-06, F-LIB-07, F-LIB-08, F-LIB-09, F-LIB-10 |
| S04 | F-NEW-01, F-NEW-02, F-NEW-03, F-NEW-04, F-NEW-05 |
| S05 | F-IMPORT-01, F-IMPORT-02, F-IMPORT-03, F-IMPORT-04, F-IMPORT-07 |
| S06 | F-META-01, F-META-02, F-META-03, F-META-04 |
| S07 | F-STRUCT-01, F-STRUCT-02, F-STRUCT-03, F-STRUCT-04, F-STRUCT-05, F-STRUCT-06, F-IMPORT-06 |
| S08 | F-THEME-01, F-THEME-02, F-THEME-03, F-THEME-04 |
| S09 | F-GEN-01, F-GEN-02, F-GEN-03, F-GEN-04, F-GEN-05, F-IMPORT-05, F-THEME-04 |
| S10 | F-WS-01, F-WS-02, F-WS-03, F-EDITOR-01, F-EDITOR-02, F-EDITOR-03, F-EDITOR-04, F-EDITOR-08, F-EDITOR-09, F-EDITOR-10, F-EDITOR-11, F-STRUCT-07, F-EXPORT-01 |
| S11 | F-THEME-01, F-THEME-02, F-THEME-03, F-THEME-04, F-WS-02 |
| S12 | F-COVER-01, F-COVER-02, F-COVER-03, F-COVER-04, F-META-01, F-META-02, F-META-03 |
| S13 | F-AICOVER-01 |
| S14 | F-PREVIEW-01, F-PREVIEW-02, F-PREVIEW-03, F-PREVIEW-04, F-WS-02, F-EXPORT-01 |
| S15 | F-EXPORT-01, F-EXPORT-03 |
| S16 | F-DONE-01, F-DONE-02, F-EXPORT-02, F-EXPORT-03 |
| S17 | F-PAY-01 |

Background / HIDE (화면 없음): F-EXPORT-04…07, F-HIST-01, F-LINT-01. Auto Save/Recovery는 S10 current 기능이다.

---

## 23. MVP Navigation Flow

Entry:

```text
비로그인: S01 → S02 → returnTo
로그인:   S01 → S03 또는 S04
```

Happy path (원고):

```text
S01 → S02(필요 시) → S04(import) → S05 → S06 → S07 → S08 → S09 → S10
  원고 편집 → 디자인 S11 / 표지 S12 / 미리보기 S14
  → S15 → S16 → S10
```

Happy path (빈 책):

```text
S01 → S02(필요 시) → S04(empty) → S06 → S08 → S09 → S10 → …
```

기존 책:

```text
S01 → S03 → S10 → S14 → S15 → S16
```

실패:

```text
S05 ERROR → 다시 업로드
S07 → 원고 다시 선택 → S05
S09 ERROR → 재시도 또는 S03 (책 없음)
S15 ERROR → S10
```


---

## 24. Phase 15 Route Gap

Current branch at this document revision:

- `GET /__auth` = implemented
- Auth client/session UI = implemented
- `GET /` still serves Library until Entry Routing implementation
- `GET /` = Landing implemented
- `GET /library` = Library implemented
- safe `returnTo` implemented
- Workspace/Wizard/Logout navigation aligned
- Chagok Web Supabase config = pending

Phase 15 Runtime QA는 전용 Supabase를 연결한 뒤 수행한다.
