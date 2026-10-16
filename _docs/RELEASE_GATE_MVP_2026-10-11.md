# My Chapter MVP Release Gate — 2026-10-11

> Historical note: 이 Release Gate는 제품명이 **My Chapter**였던 시점의 기록이다. 현재 제품명은 **차곡**이며, 과거 검증 기록의 의미를 보존하기 위해 제목은 변경하지 않는다.

## Release baseline

- Release commit: `28aa7732b3b0db85e21da9fa5ecae4b6c23721a3`
- Phase 12 branch: `phase-12-release-gate`
- Phase 12 code changes: none
- Release Gate: **PASS**
- P0 / P1 / P2 open issues: **0 / 0 / 0**

## End-to-end acceptance

| Area | Result |
|---|---|
| Empty book S03 → S16 | PASS |
| TXT import | PASS |
| MD import | PASS |
| PDF import | PASS |
| DOCX import | PASS |
| S07 edited structure preserved | PASS |
| Practical theme | PASS |
| Minimal theme | PASS |
| Practical ↔ Minimal switch without content mutation | PASS |
| Cover PNG / JPEG / WebP | PASS |
| Unsupported GIF rejection | PASS |
| Metadata save and reopen | PASS |
| Editor save / reload | PASS |
| History snapshot / restore | PASS |
| No pre-confirm write | PASS |
| Generation rollback / no ghost folder | PASS |
| Duplicate create guard | PASS |
| Duplicate PDF guard | PASS |
| Library regression | PASS |
| Workspace regression | PASS |
| Single / Spread / Grid | PASS |
| S16 Export Complete | PASS |
| Invalid path boundary | PASS |
| Advanced engine code preserved | PASS |

## 168-page regression fixture

Read-only fixture:

`books/내 포트폴리오, AI로 직접 만들기`

- Direct viewer: 168 pages at completed pagination
- Workspace viewer: 168 pages
- Grid thumbnails: 168
- PDF: 168 pages
- PDF generation time in release QA: ~31.8s
- PDF size in release QA: 3,477,066 bytes
- PDF export source mutation: NO

Protected SHA-256:

- `book.html`: `C28B6334184CBD31D8EEA8CDCD0F8BE0ECEAD6E13C6B35B7A62F66FE92FFBFDB`
- `book.css`: `D2673237AA46F8AE309DC264F078B7CDEFD1E47A3F4EF242123691C56ED313B6`

## Known limitations accepted for this MVP

- Wizard state is memory-only and is lost on refresh.
- No Auth or multi-user SaaS persistence yet.
- No editor autosave/recovery yet.
- AI Cover is not implemented.
- EPUB / Print / Web ZIP remain engine capabilities but are hidden from the primary MVP product flow.
- Screen preview page count and PDF page count are not guaranteed to be identical in every book.
- PDF rendering currently depends on an installed Chrome/Edge/Chromium executable.

## Post-release hardening

The release baseline above was validated before post-MVP hardening. Hardening changes should preserve the protected fixture hashes and pass `npm run check`.
