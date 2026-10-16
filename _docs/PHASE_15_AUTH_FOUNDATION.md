# My Chapter Phase 15 — Auth Foundation

- 작성일: 2026-10-16
- Branch: `phase-15-auth-foundation`
- Base: `main@2af7924`
- Status: IMPLEMENTED / RUNTIME QA PENDING
- Supabase project: `MyChapter` (`rdrafwfdwfzgcfiqkgug`)

## Goal

My Chapter에 계정 세션의 기반만 추가한다.

이번 Phase의 범위:

- 이메일/비밀번호 회원가입
- 이메일/비밀번호 로그인
- 세션 유지
- 로그아웃
- 서재에서 로그인 상태 표시
- 기존 로컬 책 엔진은 그대로 유지

## Architecture

- Supabase Auth 사용
- 브라우저 클라이언트는 Supabase publishable key만 사용
- 세션은 Supabase JS의 브라우저 저장소를 사용
- 기존 `book.html` Content SoT 변경 없음
- 기존 `books/` 파일 저장 방식 변경 없음

## Important Boundary

이번 Phase는 Auth Foundation이다.

아직 구현하지 않음:

- 사용자별 Book ownership
- DB의 books 테이블
- Supabase Storage
- 서버 API authorization
- 다른 사용자의 책 접근 차단
- 로컬 책 → 계정 마이그레이션
- Vercel 배포
- 결제

따라서 로그인하지 않아도 기존 로컬 MVP는 계속 사용할 수 있다.
계정 소유권과 서버 보호는 Phase 16에서 구현한다.

## Files

- `_shared/auth.html` — S02 Auth 화면
- `_shared/auth.js` — Supabase Auth client
- `_shared/library.html` — 로그인 상태 / 로그아웃 UI
- `preview-server.mjs` — `GET /__auth`
- `scripts/release-check.mjs` — Auth static guard

## QA Required

1. `npm run check` PASS
2. `/__auth` 열림
3. 신규 이메일 회원가입
4. 로그인
5. 새로고침 후 세션 유지
6. 서재에 로그인 이메일 표시
7. 로그아웃
8. 로그아웃 후 기존 로컬 서재/책 기능 유지
9. Wizard / Editor / PDF 회귀 없음
10. 보호 책 해시 불변

## Next

Phase 16:

`Auth user → Book ownership → DB metadata → per-user storage boundary`

Phase 16 전에는 Auth가 데이터 보안 경계라고 간주하지 않는다.
