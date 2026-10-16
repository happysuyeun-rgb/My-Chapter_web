# 차곡 Phase 15 — Auth + Entry Routing Foundation

- 작성일: 2026-10-16
- Branch: `phase-15-auth-foundation`
- Base: `main@2af7924`
- Status: **Phase 15A COMPLETE / Phase 15B HOLD**
- Phase 15A: Entry Routing + Auth UI Foundation + Local/Guest fallback
- Phase 15B: Real Supabase Auth Runtime = **HOLD**
- Phase 16: Ownership / DB / Storage / RLS = **HOLD**
- Supabase project: **HOLD — 새 `Chagok Web` 프로젝트 생성·연결 전**
- 기존 `MyChapter` Supabase 프로젝트는 별도 앱용이므로 차곡 웹에서 사용하지 않는다.
- Related: `_docs/IA.md`, `_docs/TASK_FLOW.md`, `_docs/SCREEN_DESIGN.md`, `_docs/SCREEN_SPEC.md`

---

## 1. Goal

Phase 15의 목표는 두 가지다.

1. 차곡에 계정 세션 기반을 추가한다.
2. 최종 제품 진입 구조에 맞게 Landing / Library / Auth의 Entry Routing을 정리한다.

추가로 Phase 15A에서는 Supabase가 아직 연결되지 않아도
Landing → Wizard → Workspace → Preview → PDF 로컬 MVP 흐름이 막히지 않도록
Local/Guest fallback을 제공한다.

Phase 15 전체 완료 기준은 단순히 로그인 화면이 존재하는 것이 아니다.

```text
/          → Landing
/library   → Library
/__auth    → Auth
/__wizard  → New Book
/__workspace?file=... → Workspace
```

위 진입 구조와 Auth session이 함께 동작해야 Phase 15를 완료한 것으로 본다.

---

## 2. Scope

### Auth Foundation

- 이메일/비밀번호 회원가입
- 이메일/비밀번호 로그인
- 세션 유지
- 로그아웃
- 서재에서 로그인 상태 표시
- `returnTo` 기반 Auth 복귀
- 외부 URL redirect 차단

### Entry Routing Foundation

- S01 Landing 추가
- `GET /` → Landing
- `GET /library` → 기존 Library
- Auth 성공 → `returnTo` 또는 `/library`
- Logout → `/`
- Workspace의 "내 서재" → `/library`
- Wizard 취소/복귀 → `/library`

### Preserve

- 기존 로컬 책 엔진
- `book.html` Content SoT
- Editor
- Viewer
- Paged.js
- PDF
- Wizard Recovery
- Editor Autosave / Recovery
- 기존 사용자 책

---

## 3. Current Implementation Status

### Implemented

- `_shared/auth.html`
- `_shared/auth.js`
- `window.ChagokAuth`
- `signUp`
- `signInWithPassword`
- `signOut`
- `getSession`
- `persistSession: true`
- `autoRefreshToken: true`
- auth storage key: `chagok-auth-v1`
- `GET /__auth`
- Library login / email / logout UI
- 앱용 MyChapter Supabase 프로젝트 연결 제거
- release-check의 앱용 Supabase project ref 차단 guard
- 차곡 브랜드 반영

### Implemented after alignment audit

- S01 Landing
- `GET /` → Landing
- `GET /library` → existing Library
- safe Auth `returnTo`
- Login/Signup success → `returnTo`
- Logout → Landing
- Workspace / Wizard → `/library`
- Library login → `/__auth?returnTo=/library`
- config-missing auth guard
- release static gate expanded for routing/returnTo

### Implemented in Phase 15A (Local/Guest fallback)

- `ChagokAuth.isConfigured() === false` 일 때 Landing 새 책 CTA → `/__wizard`
- Landing/Library 로그인 CTA → `로그인 준비 중` (Auth 오류 화면으로 보내지 않음)
- `/__auth` 직접 접근 시 Local fallback 안내 + Wizard/Library/Home 이동
- Library는 Auth config 없이도 목록/검색/정렬/열기 정상
- `auth.js` CONFIG url/publishableKey는 빈 문자열 유지
- release-check Local mode / blank config / app-Supabase-ref 차단 guard

### Pending (Phase 15B — HOLD)

- 전용 `Chagok Web` Supabase 프로젝트 생성
- Supabase URL / publishable key 연결
- Runtime Auth QA (signup/login/session/logout)

---

## 4. Target Entry Routing

### Public Entry

```text
GET /
→ S01 Landing
```

Landing은 로그인 여부와 관계없이 제품의 브랜드 진입점으로 유지한다.

비로그인 상태:

```text
Landing
├─ 로그인
└─ 새 책 만들기
```

로그인 상태:

```text
Landing
├─ 내 서재
└─ 새 책 만들기
```

---

### Library

```text
GET /library
→ S03 Library
```

현재 `/`가 반환하는 기존 `_shared/library.html`을 `/library`에서 제공한다.

Library는 Landing 역할을 하지 않는다.

---

### Auth

```text
GET /__auth
→ S02 Auth
```

일반 로그인:

```text
/
→ /__auth?returnTo=/library
→ 로그인 성공
→ /library
```

새 책 만들기:

```text
/
→ /__auth?returnTo=/__wizard
→ 로그인 성공
→ /__wizard
```

---

## 5. returnTo Contract

`returnTo`는 내부 경로만 허용한다.

허용 예:

- `/library`
- `/__wizard`
- `/__workspace?file=...`

금지:

- `http://...`
- `https://...`
- `//external...`

잘못되거나 없는 값:

```text
fallback → /library
```

Open Redirect가 생기지 않도록 반드시 내부 경로만 허용한다.

---

## 6. Auth Architecture

현재 `_shared/auth.js`의 Supabase URL/key는 비워 둔다.

이유:

- 기존 `MyChapter` Supabase 프로젝트는 별도 앱용
- 차곡 웹툴과 데이터 경계를 분리해야 함
- 새 `Chagok Web` 프로젝트를 만든 뒤에만 연결

사용:

- Supabase Auth
- 브라우저 클라이언트는 publishable key만 사용
- Supabase JS browser session storage
- persistent session
- auto refresh

사용하지 않음:

- service role key
- 앱용 MyChapter Supabase project
- 서버 비밀키 노출

---

## 7. Important Boundary

Phase 15는 **계정 세션 + 진입 흐름**까지다.

아직 구현하지 않음:

- 사용자별 Book ownership
- DB의 books 테이블
- Supabase Storage
- 서버 API authorization
- 다른 사용자의 책 접근 차단
- 로컬 책 → 계정 마이그레이션
- RLS
- Vercel 배포
- PDF worker 분리
- 결제

따라서 Phase 15의 로그인은 아직 데이터 보안 경계가 아니다.

```text
Phase 15
Auth Session + Entry Routing

Phase 16
Auth User
→ Book Ownership
→ DB Metadata
→ per-user Storage
→ API Authorization
```

---

## 8. Files

현재 관련 파일:

- `_shared/auth.html` — S02 Auth
- `_shared/auth.js` — Supabase Auth client
- `_shared/library.html` — S03 Library
- `_shared/workspace.html`
- `_shared/workspace.js`
- `_shared/wizard.html`
- `_shared/wizard.js`
- `preview-server.mjs`
- `scripts/release-check.mjs`

S01 Landing 파일은 `_shared/landing.html` + `_shared/landing.js`로 구현했다.

---

## 9. Runtime QA Required

### Static

1. `npm run check` PASS
2. JS/MJS syntax PASS
3. 앱용 Supabase project ref 미사용
4. 보호 책 hash 불변

Current evidence:
- commit `92f4c205dc21902b1045a2625a0029b5bc9eed0a`
- GitHub Actions run `38845874579`
- job `release-static-check` = SUCCESS

### Landing / Routing

5. `/` → Landing
6. `/library` → Library
7. 비로그인 Landing CTA 정상
8. 로그인 Landing CTA 정상
9. Workspace → 내 서재 = `/library`
10. Wizard 취소/복귀 = `/library`

### Auth

11. `/__auth` 정상 표시
12. 신규 이메일 회원가입
13. 로그인
14. 새로고침 후 세션 유지
15. Library에 사용자 이메일 표시
16. 로그아웃
17. 로그아웃 후 `/` Landing 이동
18. `returnTo=/__wizard` 정상
19. `returnTo=/library` 정상
20. 외부 URL returnTo 거부

### Regression

21. 기존 Library 기능 정상
22. Wizard 정상
23. Editor 정상
24. Autosave / Recovery 정상
25. Single / Spread / Grid 정상
26. PDF 정상
27. 보호 책 hash 불변
28. `books/서아의/` 보존

---

## 10. Merge Gate

Phase 15A와 Phase 15B를 분리한다.

**PR #4의 Phase 15A merge 조건:**

- Entry Routing 구현 완료
- Local/Guest fallback 구현 완료
- Local E2E QA PASS
- Wizard / Editor / Preview / PDF 핵심 회귀 PASS
- `npm run check` PASS
- 보호 책 불변
- 앱용 MyChapter Supabase 접근 없음
- 사용자 책 / stash 영향 없음

**Phase 15B는 Phase 15A merge blocker가 아니다.**

Phase 15B HOLD:
- 전용 Chagok Web Supabase 생성/연결
- signup/login/session/logout Runtime Auth QA
- configured session Landing CTA QA

---

## 11. Next

Phase 15A Local E2E + PDF 품질 QA를 먼저 완료한다.
PASS 후 Phase 15A를 main에 merge할 수 있다.

Phase 15B와 Phase 16은 외부 사용자 테스트/서비스 배포 필요 시까지 HOLD한다.

Phase 16:

```text
Auth User
→ Book Ownership
→ DB Metadata
→ Storage Boundary
→ RLS / API Authorization
```

Phase 16 상세 구현명세는 Phase 15 완료 전 확정하지 않는다.
