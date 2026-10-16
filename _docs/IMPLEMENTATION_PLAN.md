# 차곡 Implementation Plan

- Product: 차곡 (Chagok)
- Document: Implementation Plan
- Version: **2.0**
- Date: 2026-10-16
- Status: **CURRENT / EXECUTION ROADMAP**
- Branch: `phase-15-auth-foundation`
- Basis: Product Spec v1.4 + IA + Task Flow + Function/Screen/API/Data/Engine/QA v1.1
- Legacy filename note: `MY_CHAPTER_PRODUCT_SPEC.md`는 기존 문서 참조 안정성을 위해 유지한다.
- Historical note: v1.0은 2026-10-03 당시 Phase 0~12 구현 전 계획이었다. 본 v2.0이 현재 실행 기준이다.

---

## 0. 목적

차곡의 실제 구현 상태와 앞으로의 실행 순서를 하나의 현재 기준으로 관리한다.

이 문서의 핵심 역할:

1. 이미 끝난 Phase를 다시 구현하지 않게 한다.
2. 현재 진행 중인 Phase 15의 완료 조건을 고정한다.
3. Phase 16 이후 작업을 과하게 앞당기지 않는다.
4. 기존 Book Engine과 사용자 책을 보호한다.
5. 다음 Phase 진입 조건을 QA로 통제한다.

---

## 1. Planning Principles

1. Existing Engine = **KEEP / WRAP**.
2. Editor / Viewer / Paged.js / PDF = **DO NOT REPLACE**.
3. Content SoT = `book.html`.
4. Structured Book JSON = **NOT NOW**.
5. Book identity = `file` path.
6. 기존 실제 사용자 책 migration 없음.
7. Phase 완료 전에 다음 Phase 구현 금지.
8. CURRENT 문서가 Historical 문서보다 우선한다.
9. Auth session과 Book ownership을 혼동하지 않는다.
10. Phase 15에서는 Supabase Auth만 사용한다.
11. Supabase DB / Storage / RLS / API authorization은 Phase 16에서 설계한다.
12. Vercel / PDF Worker / AI / Payment는 그 이후다.

---

## 2. Protected Assets

모든 Phase에서 아래 자산은 명시적 요청 없이 수정/삭제/이동하지 않는다.

### User Books

```text
books/내 포트폴리오, AI로 직접 만들기/
books/서아의/
```

보호 기준책:

```text
book.html SHA-256
C28B6334184CBD31D8EEA8CDCD0F8BE0ECEAD6E13C6B35B7A62F66FE92FFBFDB

book.css SHA-256
D2673237AA46F8AE309DC264F078B7CDEFD1E47A3F4EF242123691C56ED313B6
```

### Git Safety

금지:

- `git clean`
- `git reset --hard`
- force pull
- force push
- 사용자 확인 없는 stash pop/drop

보존 stash:

```text
phase8-runtime-zz-test
```

`books/서아의/`는 untracked 상태를 유지할 수 있다. 이를 cleanup 대상으로 취급하지 않는다.

---

## 3. Architecture Baseline

현재 아키텍처:

```text
Product / Service UI
        ↓
Node + Vanilla HTML/JS
        ↓
Existing APIs
        ↓
book.html  ← Content SoT
book.css   ← Theme / Page Style
book.json  ← Library Metadata
sidecar    ← Images
        ↓
Editor / Viewer / Paged.js
        ↓
Preview / PDF
```

Phase 15 Service/Auth layer:

```text
Landing / Auth / Library
        ↓
Supabase Auth session
        ↓
아직 Book ownership과 연결되지 않음
```

Phase 16 Target:

```text
Auth User
   ↓
Book Ownership
   ↓
DB Metadata
   ↓
Storage Boundary
   ↓
RLS / API Authorization
```

---

## 4. Current URL Baseline

### Current code before Phase 15 Entry Routing completion

```text
/            → Library
/__auth      → Auth
/__wizard    → Wizard
/__workspace → Workspace
```

### Phase 15 Target

```text
/                         → S01 Landing
/library                  → S03 Library
/__auth                   → S02 Auth
/__wizard                 → S04~S09
/__workspace?file=...     → S10~S14
/__pdf?file=...           → S15
```

Phase 15 완료 전까지 CURRENT와 TARGET의 차이를 명시적으로 유지한다.

---

## 5. Phase Progress

| Phase | 내용 | 상태 |
|---|---|---|
| Phase 0 | Baseline / Regression Guard | ✅ COMPLETE |
| Phase 1 | Wizard Entry Shell | ✅ COMPLETE |
| Phase 2 | S05 / S06 Wizard Shell | ✅ COMPLETE |
| Phase 3 | Parse-only | ✅ COMPLETE |
| Phase 4 | Structure Review | ✅ COMPLETE |
| Phase 5 | Theme Selection | ✅ COMPLETE |
| Phase 6 | Final Generation | ✅ COMPLETE |
| Phase 7 | Workspace Shell | ✅ COMPLETE |
| Phase 8 | Theme Engine | ✅ COMPLETE |
| Phase 9 | Cover | ✅ COMPLETE |
| Phase 10 | Preview / PDF Product UX | ✅ COMPLETE |
| Phase 11 | Export Complete | ✅ COMPLETE |
| Phase 12 | Full Regression / Release Gate | ✅ COMPLETE |
| Phase 13 | Wizard Draft Recovery | ✅ COMPLETE |
| Phase 14 | Editor Autosave / Recovery | ✅ COMPLETE |
| Phase 15A | Entry Routing + Auth UI + Local/Guest fallback | ✅ COMPLETE |
| Phase 15B | Real Supabase Auth Runtime | ⏸ HOLD |
| Phase 16 | Ownership + DB + Storage + API Authorization | ⏸ HOLD |
| Phase 17+ | Deployment / PDF Worker / AI / Payment | ⏳ LATER |

---

# Phase 0~12 — Historical Completed Baseline

## 상태

완료.

세부 구현 기록은 Git history와 다음 문서를 기준으로 한다.

- `_docs/RELEASE_GATE_MVP_2026-10-11.md`
- `_docs/M0.5_ENGINE_AUDIT.md`
- `_docs/M0.5_CONTENT_AUDIT.md`

Phase 0~12를 다시 구현하지 않는다.

### 확보된 핵심 결과

- S04~S09 Wizard
- TXT / MD / PDF / DOCX Import
- parse-only
- Structure Review
- Practical / Minimal
- S09 first-write boundary
- Workspace Shell
- Cover
- Single / Spread / Grid
- PDF
- Export Complete
- 168쪽 회귀 PASS
- 보호 책 hash 고정
- Engine KEEP / WRAP 검증

---

# Phase 13 — Wizard Draft Recovery

## 상태

✅ COMPLETE

## 구현 계약

localStorage key:

```text
mychapter:wizard-draft:v1
```

주의: legacy prefix는 기존 사용자 draft와 연결될 수 있으므로 단순 rename/delete 금지.

현재 기능:

- 400ms draft debounce
- 7일 TTL
- 이어서 하기 / 새로 시작
- File object/base64 미저장
- file fingerprint 저장
- 같은 파일 → 구조 복구
- 다른 파일 → 구조 clear + 재분석
- 생성 성공 → draft clear
- 생성 실패 → draft 유지
- corrupt/expired/quota safe

## 변경 금지

- migration 없이 storage key rename
- File object localStorage 저장
- S09 전 disk write

---

# Phase 14 — Editor Autosave / Recovery

## 상태

✅ COMPLETE

## 구현 계약

Autosave:

```text
1500ms debounce
single request in-flight
```

Recovery:

```text
400ms debounce
mychapter:editor-recovery:v1:<encoded file>
```

현재 기능:

- dirty revision tracking
- submitted snapshot
- save race protection
- manual Save 유지
- Ctrl/Cmd+S 유지
- stale recovery 자동 적용 금지
- 409 conflict → autosave pause
- dirty/recovery 보존
- auto/manual 재전송 차단
- block/structure op 전 dirty flush

## 변경 금지

- recovery key 단순 rename/delete
- 409 자동 overwrite
- autosave 응답으로 새 수정까지 clean 처리
- Editor engine 재작성

---

# Phase 15 — Auth + Entry Routing Foundation

## 상태

🚧 IN PROGRESS

현재 브랜치:

```text
phase-15-auth-foundation
```

현재 Phase 문서:

```text
_docs/PHASE_15_AUTH_FOUNDATION.md
```

---

## 15.1 현재 완료된 것

### Auth UI / Client

- `_shared/auth.html`
- `_shared/auth.js`
- `window.ChagokAuth`
- signUp
- signInWithPassword
- signOut
- getSession
- onAuthStateChange
- `persistSession: true`
- `autoRefreshToken: true`
- storage key `chagok-auth-v1`

### Route

```text
GET /__auth
```

### Library Auth UI

- 로그인
- 사용자 이메일
- 로그아웃

### Safety

앱용 MyChapter Supabase project ref:

```text
rdrafwfdwfzgcfiqkgug
```

차곡에서 사용 금지.

release check에서도 위 ref 사용을 막는다.

### Brand

현재 사용자-facing brand = **차곡**.

---

## 15.2 아직 남은 것

### A. Chagok Web Supabase

전용 Supabase 프로젝트:

```text
Chagok Web
```

남은 작업:

1. 프로젝트 생성
2. Project URL 확인
3. publishable key 확인
4. `_shared/auth.js`의 CONFIG 연결

현재:

```text
CONFIG.url = ""
CONFIG.publishableKey = ""
```

다른 프로젝트를 임의로 연결하지 않는다.

---

### B. Landing

✅ 구현 완료.

Target:

```text
GET /
→ Landing
```

필수:

- 차곡 브랜드
- 제품 설명
- 새 책 만들기
- 로그인
- 로그인 상태 시 내 서재
- 로그인 상태 시 새 책 만들기

로그인 사용자도 `/`에서 자동 Library redirect하지 않는다.

---

### C. Library Route

✅ 구현 완료.

```text
GET /
→ Landing

GET /library
→ 기존 Library
```

기존 Library 기능은 재작성하지 않았다.

---

### D. returnTo — ✅ 구현 완료

일반 로그인:

```text
/__auth?returnTo=/library
```

새 책:

```text
/__auth?returnTo=/__wizard
```

허용:

- `/library`
- `/__wizard`
- 내부 `/__workspace?... `

거부:

- `http://`
- `https://`
- `//`

invalid/missing:

```text
→ /library
```

---

### E. Navigation 정리 — ✅ 구현 완료

Phase 15에서 맞춰야 할 이동:

```text
Logout
→ /

Workspace "내 서재"
→ /library

Wizard 취소 / 복귀
→ /library
```

---

## 15.3 Phase 15 QA

### Static

- `npm run check`
- JS/MJS syntax
- 앱용 MyChapter Supabase ref 없음
- 보호 책 hash 불변

### Routing

- `/` = Landing
- `/library` = Library
- `/__auth` = Auth
- Workspace → Library
- Wizard cancel → Library
- Logout → Landing

### Auth

- 신규 이메일 회원가입
- 로그인
- 새로고침 후 session 유지
- Library 사용자 이메일
- 로그아웃
- `returnTo=/library`
- `returnTo=/__wizard`
- external returnTo 거부

### Regression

- Library
- Wizard
- Wizard Recovery
- Editor
- Autosave
- Editor Recovery
- Cover
- Single / Spread / Grid
- PDF
- 보호 책 hash
- `books/서아의/` 보존

---

## 15.4 Phase 15 Merge Gate

다음이 모두 TRUE일 때만 PR merge 가능.

- Chagok Web Supabase 연결
- Landing 구현
- `/library` route 구현
- returnTo 구현
- logout routing 구현
- Workspace / Wizard routing 정리
- Runtime Auth QA PASS
- `npm run check` PASS
- protected hash unchanged
- 앱용 MyChapter Supabase 접근 없음
- user books / stash 영향 없음

### STOP

위 Gate 전에는:

- main merge 금지
- Phase 16 코드 금지
- DB table 생성 금지
- Storage migration 금지
- RLS 구현 금지
- Vercel 배포 금지
- Payment 금지

---

# Phase 16 — Ownership + DB + Storage Boundary

## 상태

⏳ NEXT — Phase 15 merge 후 시작

Phase 15 완료 전 상세 스키마를 확정하지 않는다.

---

## 16.1 Goal

브라우저 Auth session을 실제 Book 데이터 보안 경계와 연결한다.

```text
User
  ↓ owns
Book
  ↓
Metadata / Content / Assets
```

---

## 16.2 Required Design Before Code

Phase 16 시작 시 먼저 문서화:

1. User ↔ Book ownership model
2. Supabase DB metadata schema
3. Storage bucket/path strategy
4. RLS policy
5. local `file` identity와 cloud book id 관계
6. existing local books migration 여부
7. API authorization contract
8. local development compatibility
9. recovery key/file identity 영향
10. PDF worker가 읽을 storage contract

---

## 16.3 Key Rule

기존 `book.html` SoT를 DB JSON content model로 교체하지 않는다.

Cloud 저장 구조가 들어와도:

```text
Book Content
= HTML Contract 유지
```

DB는 ownership / metadata / location을 관리한다.

---

## 16.4 예상 산출 문서

Phase 16 코드 전에 다음 문서를 추가/확정한다.

- `_docs/PHASE_16_OWNERSHIP_STORAGE.md`
- DB schema
- RLS policy
- Storage path contract
- API auth contract
- migration decision

---

# Phase 17 — Deployment Foundation

## 상태

Later

예상 방향:

```text
Vercel
  → UI / Auth / 일반 API

Supabase
  → Auth / DB / Storage

PDF Worker
  → Chrome / Paged.js PDF
```

현재 local `preview-server.mjs`를 그대로 Vercel에 올리지 않는다.

---

# Phase 18 — AI Manuscript Assist

## 상태

Later

원칙:

- AI는 핵심 엔진 의존성이 아님
- 원고를 강제로 재작성하지 않음
- 제안/보조 중심
- 기존 manual path 유지

---

# Phase 19 — AI Cover

## 상태

Later

S12 수동 Cover를 대체하지 않는다.

```text
원고 분석
→ Concept
→ Generate
→ 선택
→ S12에 적용
```

---

# Phase 20 — Usage / Payment

## 상태

Later

전제:

- Auth 안정
- Ownership 안정
- Storage 안정
- Usage state 정의
- AI/PDF 원가 측정

그 전에는 결제부터 구현하지 않는다.

---

## 6. Cross-Phase STOP Rules

| 상황 | 행동 |
|---|---|
| 보호 책 hash 변경 | 즉시 STOP |
| `books/서아의/` 영향 | 즉시 STOP |
| stash 손실 위험 | 즉시 STOP |
| S04~S08 book folder write | 즉시 STOP |
| `/__edit` 409 overwrite 시도 | 즉시 STOP |
| Theme가 HTML 의미를 변경 | 즉시 STOP |
| Editor/Viewer/PDF 재작성 | STOP |
| recovery legacy key 무계획 rename | STOP |
| MyChapter 앱 Supabase 사용 | STOP |
| Phase QA 실패 | 다음 Phase 금지 |
| Phase 15 전에 ownership 코드 시작 | STOP |

---

## 7. Current Execution Order

현재 작업 순서는 다음으로 고정한다.

```text
1. 문서 정합성 정리
   ✅ Phase 15 문서
   ✅ Product Spec v1.4
   ✅ Function Spec
   ✅ Screen Spec
   ✅ API Spec
   ✅ Data Spec
   ✅ Engine Contract
   ✅ QA Acceptance
   ✅ Implementation Plan v2.0

2. 문서 Index 작성 ✅
   ↓

3. 전체 문서 Cross-check ✅
   ↓

4. Phase 15 Entry Routing 구현 ✅
   - Landing
   - /library
   - returnTo
   - navigation
   - static release gate
   ↓

5. Phase 15A Local/Guest fallback ✅
   - Supabase 미연결 시 로컬 MVP 흐름 유지
   - `/__auth` Local fallback
   - blank CONFIG 유지
   ↓

6. Chagok Web Supabase 연결 ← HOLD (Phase 15B)
   ↓

7. Phase 15B Runtime Auth QA ← HOLD
   ↓

8. PR merge (15A 또는 15B 완료 기준에 따름)
   ↓

9. Phase 16 설계 ← HOLD
```

---

## 8. Definition of Current Done

문서 정합성 단계 완료 조건:

- Product / IA / Task Flow / Function / Screen / API / Data / Engine / QA / Plan이 같은 Phase를 가리킴
- S01/S02가 Later로 남아 있지 않음
- Auto Save가 Later로 남아 있지 않음
- parse-only가 TARGET으로 남아 있지 않음
- Theme API가 미구현으로 남아 있지 않음
- `/` vs `/library` CURRENT/TARGET 구분 명확
- Phase 15A / 15B / Phase 16 boundary 명확
- Historical 문서는 당시 기록으로 보존

---

## 9. Next Action

현재 다음 작업:

> **Phase 15A는 Local/Guest fallback까지 완료. Phase 15B(실제 Supabase Auth Runtime)와 Phase 16은 HOLD.**

Supabase URL/key를 연결하기 전에는 Runtime Auth QA를 시작하지 않는다.
