# 차곡 Documentation Index

- Product: 차곡 (Chagok)
- Updated: 2026-10-16
- Status: **CURRENT / DOCUMENT SOURCE MAP**
- Active baseline: `main` (Phase 15A COMPLETE)

이 파일은 차곡 문서의 **읽는 순서, 우선순위, 현재/역사 상태**를 정의한다.

Cursor / 개발 작업에서 문서가 충돌하면 이 Index의 분류와 우선순위를 먼저 따른다.

---

## 1. Current Reading Order

```text
1. MY_CHAPTER_PRODUCT_SPEC.md
2. _docs/SERVICE_POLICY.md
3. _docs/PRICING_POLICY.md
4. _docs/IA.md
5. _docs/TASK_FLOW.md
6. _docs/FUNCTION_DEFINITION.md
7. _docs/FUNCTION_SPEC.md
8. _docs/SCREEN_DESIGN.md
9. _docs/SCREEN_SPEC.md
10. _docs/PAYMENT_PRICING_UI_REQUIREMENTS.md
11. _docs/PAYMENT_SCREEN_DESIGN.md
12. _docs/PAYMENT_SCREEN_SPEC.md
13. _docs/PAYMENT_DATA_SPEC.md
14. _docs/PAYMENT_API_SPEC.md
15. _docs/API_SPEC.md
16. _docs/DATA_SPEC.md
17. _docs/ENGINE_CONTRACT.md
18. _docs/QA_ACCEPTANCE.md
19. _docs/IMPLEMENTATION_PLAN.md
20. active Phase document
21. current audit / release evidence
```

---

## 2. CURRENT Documents

| Document | Role | Version / State |
|---|---|---|
| `MY_CHAPTER_PRODUCT_SPEC.md` | Product + Development baseline | v1.5 / CURRENT |
| `_docs/SERVICE_POLICY.md` | 사용자-facing 서비스 범위 / 권리 / 저장 / 출력 / AI 정책 | v1.1 / CURRENT |
| `_docs/PRICING_POLICY.md` | Free / Book Pass 가격·권리·과금 경계 | v1.1 / CURRENT |
| `_docs/PAYMENT_PRICING_UI_REQUIREMENTS.md` | Pricing / Paywall / Checkout / 결제·복구·환불·삭제 상태 UI 요구사항 | v1.1 / TARGET |
| `_docs/PAYMENT_SCREEN_DESIGN.md` | P01~P11 결제/가격 화면 배치·wireframe | v1.0 / TARGET |
| `_docs/PAYMENT_SCREEN_SPEC.md` | P01~P11 상태·CTA·전이·QA 계약 | v1.0 / TARGET |
| `_docs/PAYMENT_DATA_SPEC.md` | Book Pass Order / Payment / Entitlement / Refund 논리 데이터 계약 | v1.0 / TARGET |
| `_docs/PAYMENT_API_SPEC.md` | Commerce price / order / verify / webhook / entitlement API 계약 | v1.0 / TARGET |
| `_docs/IA.md` | Information Architecture | v1.0 / CURRENT |
| `_docs/TASK_FLOW.md` | User task flow | v1.0 / CURRENT |
| `_docs/FUNCTION_DEFINITION.md` | 기능 범위 정의 | v1.0 / CURRENT |
| `_docs/FUNCTION_SPEC.md` | 상세 기능 계약 | v1.1 / CURRENT |
| `_docs/SCREEN_DESIGN.md` | 화면 배치 / wireframe | v1.0 / CURRENT |
| `_docs/SCREEN_SPEC.md` | 화면 상태 / CTA 계약 | v1.1 / CURRENT |
| `_docs/API_SPEC.md` | Current/Target API 계약 | v1.1 / CURRENT |
| `_docs/DATA_SPEC.md` | 데이터 / persistence 계약 | v1.1 / CURRENT |
| `_docs/ENGINE_CONTRACT.md` | 기존 엔진 보호 계약 | v1.1 / CURRENT |
| `_docs/QA_ACCEPTANCE.md` | QA / Acceptance | v1.1 / CURRENT |
| `_docs/IMPLEMENTATION_PLAN.md` | 실행 Roadmap | v2.0 / CURRENT |
| `_docs/DEV_DOC_ALIGNMENT_AUDIT_2026-10-16.md` | Code ↔ Docs gap audit | CURRENT AUDIT |

---

## 3. ACTIVE PHASE Document

현재 Phase 상태:

```text
Phase 15A — Local MVP entry + Guest fallback = COMPLETE
Phase 15B — Supabase Auth Runtime = HOLD
Phase 16  — Ownership / DB / Storage / RLS = HOLD
```

기준 문서:

```text
_docs/PHASE_15_AUTH_FOUNDATION.md
_docs/UI_PRODUCT_AUDIT_2026-10-16.md
```

현재 route:

```text
/          → Landing
/library   → Library
/__auth    → Auth / Local fallback
/__wizard  → Wizard
/__workspace?file=... → Workspace
```

HOLD 동안 금지:

- Phase 16 ownership code 시작
- DB books table 확정
- Supabase Storage migration
- RLS/API authorization 구현
- Payment

---

## 4. HISTORICAL / EVIDENCE Documents

아래 문서는 **당시 사실 기록**이다.

현재 상태와 다른 문장이 있어도 자동으로 최신화하지 않는다.

| Document | Meaning |
|---|---|
| `_docs/M0.5_ENGINE_AUDIT.md` | 초기 실제 Engine boundary audit |
| `_docs/M0.5_CONTENT_AUDIT.md` | 초기 Content architecture audit |
| `_docs/RELEASE_GATE_MVP_2026-10-11.md` | 2026-10-11 당시 MVP release evidence |

Historical 문서에 다음과 같은 표현이 남아 있을 수 있다.

- My Chapter
- Auth 없음
- Autosave 없음
- Wizard recovery 없음

이 표현은 **현재 제품 계약이 아니라 당시 기록**이다.

---

## 5. Conflict Priority

문서가 충돌하면:

1. **보호/엔진 불변 계약**
   - M0.5에서 확정된 Content SoT / KEEP / WRAP 원칙
2. **현재 Product baseline**
   - Product Spec v1.5
3. **현재 IA / Task Flow**
4. **현재 Function / Screen / API / Data / Engine / QA**
5. **Active Phase document**
6. **현재 실제 코드**
   - 단, Phase 진행 중이면 TARGET과 CURRENT gap을 허용
7. **Historical documents**

현재 실제 코드가 CURRENT 문서와 다를 경우:

- 의도된 Phase gap인지 먼저 확인
- 의도된 gap이면 Implementation Plan / Phase 문서에 기록
- 의도되지 않은 gap이면 bug 또는 doc drift로 처리

---

## 6. Product Naming

현재 사용자-facing 제품명:

```text
차곡
```

English/internal:

```text
Chagok / chagok
```

Legacy filename:

```text
MY_CHAPTER_PRODUCT_SPEC.md
```

파일명은 참조 안정성 때문에 유지한다.

별도 앱 **MyChapter**와 차곡을 혼동하지 않는다.

---

## 7. Engine Baseline

절대 기준:

- Content SoT = `book.html`
- Book identity = `file`
- Paged.js = KEEP
- Viewer = KEEP
- Editor = KEEP / WRAP
- PDF = KEEP
- Theme = CSS layer
- Structured Book JSON = NOT NOW
- existing book migration = NO

---

## 8. Current Phase Status

```text
Phase 0~12  ✅ Complete
Phase 13    ✅ Wizard Draft Recovery
Phase 14    ✅ Editor Autosave / Recovery
Phase 15A   ✅ Local MVP entry + Guest fallback
Phase 15B   ⏸ Supabase Auth Runtime (HOLD)
Phase 16    ⏸ Ownership / DB / Storage / RLS (HOLD)
Later       Deployment / PDF Worker / AI / Payment
```

---

## 9. Current Development Gaps

상세 기준:

```text
_docs/DEV_DOC_ALIGNMENT_AUDIT_2026-10-16.md
_docs/UI_PRODUCT_AUDIT_2026-10-16.md
```

Phase 15A 완료:

- Landing `/`
- Library `/library`
- Local/Guest fallback
- Auth UI foundation + safe `returnTo`
- Wizard / Workspace / Preview / PDF Local E2E

HOLD (다음 즉시 작업 아님):

- Phase 15B: Chagok Web Supabase project/config + runtime Auth QA
- Phase 16: Ownership / DB / Storage / RLS
- Payment implementation: Auth/Ownership/stable commerce identity/server verification 이후

정책은 확정됐지만 구현은 HOLD:

- Service Policy v1.1
- Pricing Policy v1.1 — Free + Book Pass ₩14,900
- Payment/Pricing UI Requirements v1.1
- Payment Screen Design / Spec v1.0
- Payment Data / API Spec v1.0

---

## 10. Protected Assets

명시적 요청 없이 수정/삭제/이동 금지:

```text
books/내 포트폴리오, AI로 직접 만들기/
books/서아의/
```

Legacy recovery keys도 migration 없이 rename/delete 금지:

```text
mychapter:wizard-draft:v1
mychapter:editor-recovery:v1:<file>
```

---

## 11. Developer Start Rule

새 작업을 시작할 때:

```text
1. _docs/README.md
2. MY_CHAPTER_PRODUCT_SPEC.md
3. 관련 Service / Pricing policy (해당 작업일 때)
4. _docs/IMPLEMENTATION_PLAN.md
5. active Phase document
6. 관련 상세 spec
7. 실제 코드
```

를 확인한다.

Historical 문서를 CURRENT 구현 요구사항으로 사용하지 않는다.
