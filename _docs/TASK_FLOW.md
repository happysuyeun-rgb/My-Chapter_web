# 차곡 Task Flow

- Product: 차곡 (Chagok)
- Document: Task Flow
- Version: 1.0
- Status: CURRENT / IMPLEMENTATION BASELINE
- Updated: 2026-10-16
- Related: `MY_CHAPTER_PRODUCT_SPEC.md`, `_docs/SCREEN_SPEC.md`, `_docs/FUNCTION_SPEC.md`
- Phase note: Phase 15A COMPLETE. `/` = Landing, `/library` = Library. Phase 15B Supabase Auth Runtime = HOLD. Phase 16 Ownership/DB/Storage/RLS = HOLD.

---

## 1. 목적

차곡의 핵심 사용자 과업은 다음과 같다.

> 원고 준비 → 책 생성 → 구조 확인 → 디자인 → 편집 → 표지 → 미리보기 → PDF 완성

본 문서는 화면 단위 명세보다 상위에서 사용자의 실제 이동 흐름, 인증 진입, 새 책 생성, 기존 책 편집, 복구, 오류 흐름을 정의한다.

---

## 2. 핵심 원칙

1. `/` 는 제품 랜딩이다.
2. 서재는 별도 작업 허브이며 `/library` 를 사용한다.
3. 로그인 여부와 관계없이 랜딩은 브랜드 진입점으로 유지한다.
4. 인증이 필요한 액션에서 Auth로 이동할 때 `returnTo` 로 원래 목적을 보존한다.
5. 새 책 생성은 S09 이전까지 실제 `book.html` 을 쓰지 않는다.
6. 기존 Editor / Viewer / Paged.js / PDF 엔진은 재작성하지 않는다.
7. Phase 15의 Auth는 세션 기반만 제공하며, 사용자별 Book Ownership은 Phase 16 범위다.

---

## 3. Target URL Map

| 기능 | URL | Screen |
|---|---|---|
| Landing | `/` | S01 |
| Auth | `/__auth` | S02 |
| Library | `/library` | S03 |
| New Book Wizard | `/__wizard` | S04~S09 |
| Workspace | `/__workspace?file=...` | S10~S14 |
| PDF | `/__pdf?file=...` | S15 |
| Export Complete | Workspace 내 상태/패널 | S16 |

### Current implementation

Entry Routing 구현 완료:

```text
/          → Landing
/library   → Library
/__auth    → Auth
/__wizard  → New Book Wizard
/__workspace?file=... → Workspace
```

Phase 15A Local/Guest entry는 완료됐다. Phase 15B(`Chagok Web` Supabase 연결 + Runtime Auth QA)와 Phase 16 Ownership은 HOLD다.

---

## 4. Global Entry Flow

```text
[ S01 Landing / ]
        │
        ├─ 비로그인
        │   ├─ 책 만들기
        │   │    ↓
        │   │  S02 Auth
        │   │    ↓
        │   │  인증 성공
        │   │    ↓
        │   │  S04 Wizard
        │   │
        │   └─ 로그인
        │        ↓
        │      S02 Auth
        │        ↓
        │      S03 Library
        │
        └─ 로그인
            ├─ 내 서재
            │    ↓
            │  S03 Library
            │
            └─ 새 책 만들기
                 ↓
               S04 Wizard
```

로그인 사용자를 랜딩에서 자동으로 Library로 강제 이동하지 않는다.

대신 로그인 상태에 따라 CTA를 바꾼다.

- 비로그인: `로그인`, `책 만들기`
- 로그인: `내 서재`, `새 책 만들기`

---

## 5. Auth Return Flow

### 새 책 만들기에서 Auth로 진입

```text
/ 
→ [새 책 만들기]
→ /__auth?returnTo=/__wizard
→ 인증 성공
→ /__wizard
```

### 일반 로그인

```text
/
→ [로그인]
→ /__auth?returnTo=/library
→ 인증 성공
→ /library
```

### Security Rule

`returnTo` 는 내부 경로만 허용한다.

허용:
- `/library`
- `/__wizard`
- `/__workspace?... `

거부:
- `http://...`
- `https://...`
- `//external...`

잘못된 값은 `/library` 로 fallback 한다.

---

## 6. 신규 사용자 — 원고 가져오기

```text
S01 Landing
   ↓
책 만들기
   ↓
S02 Auth
   ↓
S04 새 책 만들기
   ↓
[원고 가져오기]
   ↓
S05 원고 입력
   ├─ TXT
   ├─ MD
   ├─ PDF
   ├─ DOCX
   └─ 텍스트 붙여넣기
   ↓
원고 분석
   ↓
S06 책 기본정보
   ├─ 제목 *
   ├─ 부제
   └─ 저자
   ↓
S07 구조 확인
   ├─ Part
   ├─ Chapter
   ├─ Section
   ├─ 제목 수정
   ├─ 순서 변경
   └─ 추가 / 삭제
   ↓
구조 확정
   ↓
S08 디자인 선택
   ├─ Practical
   └─ Minimal
   ↓
S09 책 생성
   ↓
S10 Workspace
```

### Write boundary

S05~S08:
- 세션 / draft 상태만 사용
- 실제 책 폴더 생성 금지
- `book.html` 생성 금지

S09 성공 시:
- 책 폴더 생성
- `book.html`
- `book.css`
- `book.json`
- 필요한 source 보존

---

## 7. 신규 사용자 — 빈 책 시작

```text
S04 새 책 만들기
   ↓
[빈 책으로 시작]
   ↓
S06 책 기본정보
   ↓
S08 디자인 선택
   ↓
S09 책 생성
   ↓
S10 Workspace
```

빈 책은 S05 / S07을 건너뛴다.

---

## 8. Library Flow

```text
S03 Library
   │
   ├─ 기존 책 선택
   │    ↓
   │  S10 Workspace
   │
   ├─ 새 책 만들기
   │    ↓
   │  S04 Wizard
   │
   ├─ 검색
   ├─ 상태 필터
   ├─ 책 정보 수정
   ├─ 사본 만들기
   ├─ 휴지통
   └─ 로그아웃
        ↓
      S01 Landing
```

Library는 브랜드 인트로가 아니라 로그인 후 작업 허브다.

---

## 9. Workspace Flow

```text
S10 Workspace

┌──────────────────────────────────┐
│ ← 내 서재      책 제목      PDF │
├──────────────────────────────────┤
│ 원고 │ 디자인 │ 표지 │ 미리보기 │
└──────────────────────────────────┘
```

### 원고

```text
S10 Manuscript
 ├─ 본문 편집
 ├─ Chapter 추가
 ├─ 구조 수정
 ├─ 수동 저장
 └─ Autosave
```

### 디자인

```text
S11 Design
 ├─ Practical
 ├─ Minimal
 ├─ 본문 글자 크기
 ├─ 행간
 └─ 쪽 여백
```

### 표지

```text
S12 Cover
 ├─ 이미지
 ├─ 제목
 ├─ 부제
 └─ 저자
```

### 미리보기

```text
S14 Preview
 ├─ Single
 ├─ Spread
 └─ Grid
```

각 탭은 동일한 `book.html` Content SoT를 기반으로 한다.

---

## 10. PDF Export Flow

```text
S10 Workspace
   ↓
[전자책 PDF 만들기]
   ↓
S15 PDF Export
   ↓
기존 PDF Pipeline
   ↓
S16 Export Complete
   │
   ├─ PDF 다운로드
   ├─ 책으로 돌아가기
   └─ 다시 만들기
```

MVP에서는 Print / EPUB / ZIP 등 고급 기능은 숨길 수 있으나 삭제하지 않는다.

---

## 11. Wizard Draft Recovery

Phase 13 구현 기준.

```text
Wizard 진행
   ↓
새로고침 / 종료
   ↓
다시 Wizard 진입
   ↓
"작성 중이던 책이 있습니다."
   │
   ├─ 이어서 하기
   │    ↓
   │  이전 Step 복구
   │
   └─ 새로 시작
        ↓
      Draft 삭제
```

파일 업로드 기반 원고는 File object를 저장하지 않는다.

같은 파일 재선택:
- fingerprint 일치 → 구조/파싱 결과 복구

다른 파일:
- 기존 구조 폐기
- 다시 분석

---

## 12. Editor Recovery

Phase 14 구현 기준.

```text
원고 편집
   ↓
Local Recovery
   ↓
Autosave
   ↓
Server Save
```

비정상 종료 후:

```text
책 다시 열기
   ↓
Recovery 발견
   ↓
복구 선택
   ├─ 복구
   │   ↓
   │ Editor 복원 → dirty → Autosave
   │
   └─ 현재 서버본 사용
```

409 Conflict:
- Autosave 중지
- Recovery 유지
- 사용자 판단 전 자동 재전송 금지

---

## 13. Auth / Session Flow

Phase 15 범위.

```text
S02 Auth
  ↓
Supabase Auth
  ↓
Session 생성
  ↓
브라우저 Session 유지
  ↓
S03 Library
```

새로고침:

```text
Library
  ↓
getSession()
  ↓
session 있음
  ↓
로그인 이메일 표시
```

로그아웃:

```text
Logout
  ↓
Supabase signOut
  ↓
Session 제거
  ↓
S01 Landing
```

### Phase 15 Boundary

현재:

```text
로그인 ≠ 책 소유권
```

Phase 16 목표:

```text
Auth User
   ↓
Book Ownership
   ↓
사용자별 Library
   ↓
DB Metadata
   ↓
per-user Storage Boundary
```

---

## 14. Error Flow

### Auth Error

```text
Auth ERROR
   ↓
현재 화면 유지
   ↓
오류 메시지
   ↓
재시도
```

### Book Generation Error

```text
S09 ERROR
   ├─ 다시 시도
   ├─ 이전 단계
   └─ Library
```

규칙:
- 실패한 ghost book folder 생성 금지

### PDF Error

```text
S15 ERROR
   ├─ 다시 시도
   └─ Workspace 복귀
```

---

## 15. Full Happy Path

```text
S01 Landing
   ↓
S02 Auth
   ↓
S03 Library
   ↓
S04 New Book
   ↓
S05 Manuscript
   ↓
S06 Metadata
   ↓
S07 Structure
   ↓
S08 Theme
   ↓
S09 Generate
   ↓
S10 Workspace
   ├─ S11 Design
   ├─ S12 Cover
   └─ S14 Preview
          ↓
        S15 PDF
          ↓
        S16 Complete
```

---

## 16. Phase 15 Implementation Impact

Phase 15A에서 Entry Routing은 반영 완료됐다.

1. `GET /` → Landing
2. `GET /library` → Library
3. Auth success → `returnTo` 우선, 없으면 `/library` (Configured mode)
4. Local mode → Auth 강제 없이 Wizard/Library
5. Logout → `/` Landing (Configured mode)
6. HOLD
   - Phase 15B Supabase Auth Runtime
   - Phase 16 Book ownership / DB / Storage / server authorization

---

## 17. DO NOT BREAK

- `book.html` Content SoT
- 기존 168쪽 보호 책
- `books/서아의/`
- Paged.js Viewer
- Editor
- PDF Engine
- Theme contract
- Cover sidecar
- Wizard Recovery
- Editor Autosave / Recovery
- 과거 Audit / Release Gate의 역사 기록
- 기존 파일명 참조 안정성

---

## 18. Current Decision

차곡의 기준 Entry Flow는 다음으로 확정한다.

```text
/ = Landing
/library = Library
/__auth = Auth
/__wizard = New Book
/__workspace = Workspace
```

Phase 15A는 이 Entry Routing과 Local/Guest fallback까지 완료했다. Phase 15B Runtime Auth QA와 Phase 16 Ownership은 HOLD다.
