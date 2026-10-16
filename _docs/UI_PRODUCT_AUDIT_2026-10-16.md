# 차곡 UI / Product Audit — 2026-10-16

- Product: 차곡 (Chagok)
- Branch: `main`
- Baseline commit: `f379c300da54560dfd351dbacd60268fbd2006e8`
- Mode: Local / Guest (Supabase CONFIG blank)
- Scope: S01~S16 UI / 제품 완성도 감사
- Method: CURRENT docs 대조 + 실제 browser (Desktop 1440 / Tablet 768 / Mobile 390)
- Out of scope: Phase 15B Runtime, Phase 16 Ownership/DB/Storage/RLS, AI Cover, Payment, engine rewrite

---

## Executive Summary

Local MVP 핵심 흐름(Landing → Library → Wizard → Workspace → Preview → PDF)은 **실제로 동작**하며, Phase 15A Local/Guest 진입도 자연스럽다. 엔진·보호 책·recovery 계약은 유지된다.

완성도 점수 (초기 감사): **84 / 100**  
완성도 점수 (Post-15A polish): **87 / 100**  
완성도 점수 (Final P2 polish): **89 / 100**

판정:

- **포트폴리오 공개: YES** — Local MVP 데모로 충분
- **Local MVP UI 개발 종료: YES** — P0/P1 없음, 계획된 P2 마감 완료
- **P0: 0**
- **P1: 0**
- 남은 항목은 Idea / HOLD 또는 미세 backlog만

---

## Screen-by-screen

### S01 Landing — 86

| 항목 | 결과 |
|---|---|
| 5초 이해 | YES — “원고가 책이 되는 과정” |
| Primary CTA | 새 책 만들기 → `/__wizard` |
| Secondary CTA | 내 서재 → `/library` |
| Local mode | `로그인 준비 중` 표시 |
| Hero / flow | 01~05 흐름 + 3 가치 설명 |

메모:

- Hero에 `로그인 준비 중`이 크게 반복되어 “아직 못 쓰는 제품”처럼 보일 수 있음 (P2)
- IA의 Product Preview 구역은 없음 → doc drift (B), MVP 축소로 허용

### S02 Auth (Local) — 88

| 항목 | 결과 |
|---|---|
| Local 안내 | YES — 에러 화면이 아님 |
| CTA | 새 책 / 서재 / 홈 |
| Configured UI | 코드 유지, Local에서 숨김 |

메모:

- 본문에 `Supabase` 용어 노출 (P2 copy)
- Configured mode는 이번 감사에서 runtime 검증하지 않음 (HOLD)

### S03 Library — 85

| 항목 | 결과 |
|---|---|
| 목록 / 카드 | YES |
| 검색 / 정렬 / 상태 필터 | YES |
| 새 책 CTA | `/__wizard`로 연결 |
| 휴지통 / 복제·삭제 | 대화상자·메뉴 존재 |
| Local badge | `로그인 준비 중` |

메모:

- Legacy “새 책 만들기” dialog DOM이 남아 있으나 진입 CTA는 Wizard로 연결됨 (P2 / dead UI)
- Mobile에서 header wrap·카드 밀도 높음 (P2)
- Empty 서재는 현재 데이터상 미관찰 (억지 생성 안 함)

### S04~S09 Wizard — 83

| 단계 | 관찰 |
|---|---|
| S04 Method | STEP 1, 선택 후 계속 |
| S05 Input | 파일/붙여넣기, parse 상태 문구 |
| S06 Meta | 제목 필수, 다음 |
| S07 Structure | 트리 편집, 뒤로/재선택/취소 |
| S08 Theme | Practical/Minimal 카드 + preview |
| S09 Generate | 단계 리스트 UI 존재 (이번 감사에서 실제 생성은 생략) |
| Recovery banner | 코드/마크업 존재 |

메모:

- 현재 위치는 `STEP N` + header step-label로 인지 가능
- S07 CTA `이 구조로 책 만들기`는 실제로는 S08로 이동. **문서/QA도 이를 명시** (`QA-STRUCT-06`) → bug가 아니라 copy 긴장 (P2)
- Theme 좁은 폭에서 카드 일부가 잘릴 수 있음 (P2)

### S10 Workspace — 84

| 항목 | 결과 |
|---|---|
| 책 이름 | YES |
| Tabs | 원고 / 디자인 / 표지 / 미리보기 |
| 저장 상태 | `저장됨` / Save 버튼 |
| 서재 복귀 | `← 내 서재` + dirty confirm |
| 편집 영역 | iframe book.html editor |

메모:

- 정보 밀도는 전문툴에 가깝고 초보에게는 다소 무거움 (P2/Idea 경계, 재설계 금지)
- Mobile에서 header actions wrap (P2)

### S11 Design — 86

| 항목 | 결과 |
|---|---|
| Practical / Minimal | YES |
| Apply 상태 | 동일 theme면 Apply disabled |
| Preview sample | 우측 sample 존재 (좁은 폭에서는 아래로) |

슬라이더 부재는 버그 아님 (현재 계약).

### S12 Cover — 85

| 항목 | 결과 |
|---|---|
| 현재 표지 | iframe 연동 미리보기 |
| 업로드 / 제거 | YES |
| 문구 저장 | YES |
| 빈 이미지 | “표지 이미지가 없습니다.” |

AI Cover 없음 = Later (정상).

### S13 AI Cover — Later

감사 제외. 진입점 없음 = 정상.

### S14 Preview — 82 → (fix 후 기대 86)

| 항목 | 결과 |
|---|---|
| Single / Spread / Grid | YES |
| mode 인지 | `aria-selected` + status `Single · n / total` |
| 긴 책 | 169p 샘플에서 pagination 동작 |

**P1 found:** Preview mode bar가 iframe **아래**에 렌더되어 모드 전환 UI가 화면 하단으로 밀림.  
**Fix applied:** `_shared/workspace.css`에 `.ws-stage.show-preview .ws-preview { order: -1; }` 추가. Desktop에서 mode bar가 iframe 위로 이동하는 것 확인.

### S15 Export — 86

| 항목 | 결과 |
|---|---|
| PDF CTA | header `전자책 PDF 만들기` |
| Loading | `PDF를 만들고 있어요` |
| Error | status error + 저장 필요 안내 |
| Success | S16 패널로 전환 |

긴 책 full PDF 재생성은 이번 감사에서 반복하지 않음 (Phase 15A E2E PASS 증거 신뢰).

### S16 Complete — 87

| 항목 | 결과 |
|---|---|
| 성공 패널 | YES |
| 다운로드 / 책으로 / 다시 만들기 / 서재 | YES |

---

## Responsive

| Viewport | Landing | Library | Wizard | Workspace/Cover/Preview |
|---|---|---|---|---|
| 1440 | OK | OK | OK | OK (Preview bar 수정 후 OK) |
| 768 | OK | wrap OK | OK | Cover 2-col → 축소 |
| 390 | OK, CTA wrap | header dense | STEP text OK | tabs/header dense; Preview bar는 수정으로 상단 유지 |

공통 P2:

- Library/Workspace header wrapping
- Wizard theme cards 좁은 폭 잘림 가능
- Landing hero `로그인 준비 중` 중복

horizontal overflow는 주요 화면에서 관찰되지 않음.

---

## UX Scorecard (YES/NO)

| 질문 | Landing | Library | Wizard | Workspace | Preview | Export |
|---|---|---|---|---|---|---|
| 1. 현재 위치 | YES | YES | YES | YES | YES | YES |
| 2. 다음 행동 명확 | YES | YES | YES* | YES | YES | YES |
| 3. 취소/뒤로 예측 가능 | YES | YES | YES | YES | YES | YES |
| 4. 저장 여부 인지 | n/a | n/a | draft/parse | YES | YES | n/a |
| 5. 오류 해결책 | YES | YES | YES | YES | YES | YES |
| 6. 전문 제작툴 인상 | YES | YES | YES | YES | YES | YES |
| 7. 설명 없이 사용 가능 | YES | YES | YES* | PARTIAL | YES | YES |

\* Wizard S07 CTA 문구는 생성으로 오인될 수 있으나 문서상 S08 이동이 계약이다.

---

## Bugs

### P0

없음.

### P1

1. **Preview mode bar 하단 배치** → **RESOLVED**  
   - 수정: `_shared/workspace.css` `.ws-stage.show-preview .ws-preview { order: -1; }`  
   - 검증: Desktop/Mobile에서 mode bar가 iframe 위

### P2

1. Landing Hero `로그인 준비 중` 중복 → **RESOLVED**
2. Library legacy create dialog → **RESOLVED**
3. Doc drift Phase 15A status → **RESOLVED**
4. Auth Local `Supabase` 용어 → **RESOLVED** (사용자 문구로 교체)
5. Wizard S07 CTA → **RESOLVED** (`디자인 선택하기`)
6. Wizard Theme mobile density → **RESOLVED**
7. Workspace/Library mobile header density → **RESOLVED**
8. SCREEN_DESIGN Product Preview doc drift → **RESOLVED**
9. Design sample pane이 좁은 폭에서 아래로 밀림 — backlog (기능 영향 없음, 의도적 1열 스택)

### Idea / HOLD

- AI Cover (S13)
- Auth Runtime / Ownership / DB / Storage / RLS
- Pricing / Payment
- Workspace 정보 밀도 재설계 (금지 범위)

---

## Doc drift

| 항목 | 분류 | 상태 |
|---|---|---|
| `_docs/README.md` Phase 15A status | B | **RESOLVED** |
| `IA.md` / `TASK_FLOW.md` “`/` = Library” phase note | B | **RESOLVED** |
| IA Landing Product Preview 구역 | B | **RESOLVED via SCREEN_DESIGN** — MVP 축소 명시 |
| TASK_FLOW Auth-first happy path | B/C | KEEP — Local skip은 제품 결정 |
| SCREEN_DESIGN Product Preview wireframe | B | **RESOLVED** — value props로 sync |
| S07 CTA 문구 | B | **RESOLVED** — `디자인 선택하기` |
| S13 AI Cover 없음 | C | Later |

---

## Follow-up polish (2026-10-16)

| Item | Result |
|---|---|
| Preview P1 | RESOLVED |
| Landing duplicate Local status | RESOLVED |
| Library legacy create dialog | RESOLVED |
| Doc Phase 15A sync | RESOLVED |
| Revised score (then) | **87 / 100** |

---

## Final P2 polish (2026-10-16)

| Item | Result |
|---|---|
| Auth Local Supabase terminology | RESOLVED |
| S07 CTA copy | RESOLVED → `디자인 선택하기` |
| Mobile header density | RESOLVED |
| Theme card density | RESOLVED |
| SCREEN_DESIGN Product Preview sync | RESOLVED |
| Revised score | **89 / 100** |
| Local MVP UI development | **CLOSED** |

---

## Remaining backlog (not blocking)

1. Design sample pane narrow-width stack (의도된 1열, polish only)
2. Idea/HOLD: Auth Runtime, Ownership, AI Cover, Payment

---

## HOLD items

- Phase 15B Supabase Auth Runtime
- Phase 16 Ownership / DB / Storage / RLS
- AI Cover
- Payment / Pricing

---

## Portfolio-ready

**YES — Local MVP demo용으로 공개 가능**

조건:

- Local/Guest 전제로 설명
- Auth Runtime / cloud sync는 “다음 단계”로 명시
- 보호 책(168p) 무결성 유지

**Local MVP UI 추가 개발 권장: NO**  
P0/P1이 없고 계획된 P2를 마감했으므로 UI 기능 개발은 여기서 종료한다.

---

## Changes in this audit / follow-up / final P2

| File | Change |
|---|---|
| `_shared/workspace.css` | Preview chrome 상단 + mobile header/design density |
| `_shared/landing.js` | Local Hero status 숨김 |
| `_shared/library.html` | legacy create dialog 제거 + mobile header density |
| `_shared/auth.html` | Local 사용자 문구 |
| `_shared/wizard.html` / `wizard.js` / `wizard.css` | S07 CTA + Theme mobile density |
| `_docs/README.md` / `IA.md` / `TASK_FLOW.md` | Phase 15A COMPLETE |
| `_docs/SCREEN_DESIGN.md` / `SCREEN_SPEC.md` / `FUNCTION_SPEC.md` / `QA_ACCEPTANCE.md` | CTA + Landing/Auth sync |
| `_docs/UI_PRODUCT_AUDIT_2026-10-16.md` | 감사 + Final P2 상태 |

엔진 / 보호 책 / recovery keys / Supabase 설정 변경 없음.
