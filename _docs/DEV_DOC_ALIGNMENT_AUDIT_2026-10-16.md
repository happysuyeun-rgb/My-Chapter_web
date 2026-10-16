# 차곡 Development ↔ Documentation Alignment Audit

- Date: 2026-10-16
- Branch: `phase-15-auth-foundation`
- Status: **CURRENT AUDIT / ACTION BASELINE**
- Compared: current branch code vs Product / IA / Task / Function / Screen / API / Data / Engine / QA / Implementation Plan
- Rule: intended Phase 15 gaps are tracked separately from accidental mismatches.

---

## 1. 결론

Phase 0~14 핵심 개발은 현재 문서와 대체로 일치한다.

Entry Routing gap은 수정 완료했다. 현재 실제 개발 누락의 중심은 **전용 Chagok Web Supabase runtime 연결 + Runtime Auth QA**다.

추가로 문서 몇 곳이 실제 구현보다 뒤처져 있었고, 일부 코드에는 Phase 15 전환 시 반드시 수정해야 할 navigation / auth robustness 문제가 있다.

---

## 2. Code ↔ Document Matrix

| Area | Document baseline | Actual code | Audit |
|---|---|---|---|
| Content SoT | `book.html` | 동일 | ✅ |
| Wizard S04~S09 | Implemented | 구현됨 | ✅ |
| Parse-only | `POST /__parse` CURRENT | 구현됨 | ✅ |
| Structure staging | client state | 구현됨 | ✅ |
| Wizard Recovery | Phase 13 CURRENT | 구현됨 | ✅ |
| Theme | Practical / Minimal | 구현됨 | ✅ |
| Theme generation | S09 선택 theme 반영 | `books.create({themeId})`가 create 내부에서 CSS 적용 | ✅ code / docs 일부 수정 필요 |
| Workspace | Implemented | 구현됨 | ✅ |
| Editor Autosave | Phase 14 CURRENT | 1500ms | ✅ |
| Editor Recovery | Phase 14 CURRENT | 400ms localStorage | ✅ |
| 409 Conflict guard | CURRENT | 구현됨 | ✅ |
| Cover | CURRENT | 구현됨 | ✅ |
| Preview 3 modes | CURRENT | 구현됨 | ✅ |
| PDF / S16 | CURRENT | 구현됨 | ✅ |
| Auth UI/client | Phase 15 | 구현됨 | ✅ partial |
| Dedicated Supabase | Chagok Web | config blank | 🚧 pending |
| Landing | `/` | 구현됨 | ✅ static QA pass |
| Library route | `/library` | 구현됨 | ✅ static QA pass |
| Auth returnTo | required | safe returnTo 구현 | ✅ static QA pass |
| Logout destination | `/` Landing | 구현됨 | ✅ |
| Wizard cancel | `/library` | 구현됨 | ✅ |
| Workspace library link | `/library` | 구현됨 | ✅ |
| Library login target | `returnTo=/library` | 구현됨 | ✅ |
| Auth config-missing resilience | local features should remain usable | guard 구현 | ✅ |
| Release static gate | Phase 15 routes/returnTo 검증 | 확대 완료, CI PASS | ✅ |
| Ownership / RLS / Storage | Phase 16 | 없음 | ✅ intentionally not Phase 15 |
| Deployment / PDF worker | Later | local-only | ✅ intentionally later |

---

## 3. Actual Phase 15 Code Gaps

### P0 / must close before merge

완료:
1. S01 Landing
2. `GET /` → Landing
3. `GET /library` → existing Library
4. safe `returnTo`
5. login/signup success → returnTo
6. logout → `/`
7. Workspace / Wizard → `/library`
8. Library login → `/__auth?returnTo=/library`
9. wrong MyChapter Supabase ref static guard

남음:
10. Chagok Web Supabase 연결
11. runtime signup/login/session/logout QA
12. protected book final regression

### P1 / Phase 15 robustness

완료:
1. CONFIG blank guard
2. release check route/returnTo markers
3. Auth 홈 링크 문구/경로 정리

Runtime pending:
4. 로그인 상태 Landing CTA 실제 session QA

---

## 4. Documentation Drift Found

### Theme create flow

실제 코드:

```text
S08 themeId
→ POST /__new-book { ..., themeId }
→ server/books.mjs create()
→ applyThemeCss(book.css, theme)
→ success
```

따라서 S09 생성 후 별도 `POST /__theme`가 필요한 것처럼 쓰면 틀리다.

`POST /__theme`는 **기존 책의 S11 Theme 변경** 경로다.

### Theme persistence

- Wizard의 `themeId` = transient state / recovery data
- 생성된 책의 persisted theme = `book.css` marker/layer
- `book.json.themeId` 없음

### QA stale labels

Phase 1~14에서 이미 구현된 기능 중 일부가 QA 문서에서 `TARGET_MVP`로 남아 있었다.
기능 상태는 CURRENT로 정리해야 한다.

---

## 5. Minor Code / UX Mismatch

Cover는 실제 코드에서:

- PNG
- JPEG
- WebP
- AVIF

를 허용하지만 일부 오류 문구는 “PNG, JPEG, WebP”만 표시한다.

오류 문구도 실제 accept set에 맞게 AVIF까지 반영 완료했다.

---

## 6. Not a Bug / Intentionally Deferred

다음은 현재 누락으로 보지 않는다.

- direct route server-side Auth enforcement
- User ↔ Book ownership
- Supabase DB books
- Supabase Storage
- RLS
- server API authorization
- cloud migration
- Vercel deployment
- Chrome PDF worker
- AI Cover
- Payment

위 항목은 Phase 16+다.

---

## 7. Safe Execution Order

```text
A. Code/Doc Audit ✅
   ↓
B. stale docs correction
   ↓
C. Document Index
   ↓
D. Phase 15 Entry Routing code ✅
   ↓
E. static release gate update ✅
   ↓
F. Chagok Web Supabase creation/config ← NEXT
   ↓
G. Runtime Auth QA
   ↓
H. Full regression + protected hashes
   ↓
I. PR merge
   ↓
J. Phase 16 design
```

각 단계 후 다시 gap check를 하고 다음 단계로 이동한다.

---

## 8. STOP Rules

- protected book hash change → STOP
- `books/서아의/` 영향 → STOP
- MyChapter app Supabase ref 사용 → STOP
- Phase 15 중 DB/Storage/RLS 시작 → STOP
- returnTo external redirect 허용 → STOP
- Auth 작업 때문에 Editor/Viewer/PDF 재작성 → STOP
- recovery legacy key migration 없이 rename → STOP


---

## 9. Static QA Evidence

- Routing/auth code completion head: `92f4c205dc21902b1045a2625a0029b5bc9eed0a`
- GitHub Actions run: `38845874579`
- Job: `release-static-check`
- Result: **SUCCESS**
- `npm ci`: SUCCESS
- `npm run check`: SUCCESS
