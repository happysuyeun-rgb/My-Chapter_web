# Handoff: 전자책 「내 포트폴리오, AI로 직접 만들기」

## Overview
판매용 전자책(크몽·리디 등)의 조판 디자인입니다. 저자가 준 원고(`seoah_ai_portfolio_ebook_master.docx`)를 Paged.js로 자동 페이지 나눔한 **연속 원고형 책**으로 만들었습니다. 결과물은 두 가지입니다.
1. 웹에서 넘겨보는 전자책 (툴바, 썸네일 사이드바, 1쪽/2쪽 펼침/그리드 보기)
2. 인쇄용 PDF (Chrome 인쇄 파이프라인이 `@page` 규칙을 그대로 따름)

- 제목: **내 포트폴리오, AI로 직접 만들기**
- 부제: **기획부터 AI 코딩, 배포까지 내 손으로 완성하는 실전 가이드**
- 분량: 168쪽 (170×240mm 기준). 원고 최종 통합 수정 지시서(66개 항목)를 반영한 최종본입니다.
- 구성: 표지 → 속표지 → 판권·전자책 이용 안내 → 차례 → Prologue → 0장 → PART 1–5(1–15장) → 부록 1–5 → Epilogue

## About the Design Files
이 묶음의 파일은 **HTML로 만든 디자인 참고본**입니다. 의도한 모양과 동작을 보여 주는 프로토타입이며, 그대로 복사해서 쓸 운영 코드가 아닙니다. 해야 할 일은 이 디자인을 **대상 환경에서 다시 구현하는 것**입니다. 이미 쓰는 전자책 파이프라인(예: Paged.js / Vivliostyle / Prince / InDesign / EPUB3 빌드)이 있으면 그 환경의 방식대로 만들고, 아직 없으면 가장 알맞은 도구를 골라 구현하세요. 지금 HTML은 Paged.js polyfill v0.4.3으로 돌아가며 그대로 열어 볼 수 있습니다.

원고 HTML은 `.docx`를 Python(`python-docx`)으로 변환해서 만들었습니다. Word 스타일은 다음 컴포넌트로 바꿨습니다.

| Word 스타일 / 패턴 | HTML 컴포넌트 |
|---|---|
| Heading 1 (Prologue, 0장, PART, 부록, Epilogue) | `.part` 구분 페이지 또는 `section.chapter` + `.opener` |
| Heading 2 `N장. 제목 — 부제` | `section.chapter` + `.opener` (부제는 `.op-sub`) |
| Heading 2 / 3 | `h2` / `h3` (`STEP n.` 패턴은 `.step` + `.step-tag`) |
| `Prompt` 스타일 + 반말 요청문 단락 묶음 | `.prompt` 카드 (`[대괄호]`는 `<mark>`) |
| `Checklist` (□) | `ul.checklist` |
| `Placeholder` `[화면 캡처 자리 — …]` | `figure.shot` > `<image-slot>` + `figcaption` "그림 NN" |
| 전체 볼드 + `→` 포함 단락 | `.flow` 칩 다이어그램 |
| 전체 볼드 단락 | `p.key` (12장 용어집에서는 `h5.term`) |
| `[HEADER]` 같은 와이어프레임 블록 | `.wire` > `.wire-box` |
| `#### n. …` (13장 사례) | `h4.case` |
| 부록 2·4 `n. 제목` | `h3.entry` + `.entry-no` |
| 부록 4 `가능한 원인/확인/요청:` | `.kv` 그리드 |
| 부록 5 `• 항목:` | `.fill > .fill-row` (기입선) |
| 마크다운 표 `| … |` | `table.grid` |
| 「편집 메모 — 화면 캡처는 나중에 추가합니다」 섹션 | 내부 메모라서 **뺐습니다** |

## Fidelity
**하이파이(High-fidelity).** 색상, 서체, 판형, 여백, 컴포넌트 스타일은 최종안입니다. 화면 캡처 33곳과 표지 이미지만 아직 비어 있는 자리(placeholder)입니다.

## Screens / Views (페이지 유형)

### 1. 표지 (Cover, 1쪽)
- 판형 전면 170×240mm, `@page :first { margin: 0 }`
- 배경 `#1C1B19`. 10mm 격자 패턴(선 `rgba(250,248,244,.06)` 1px, 6mm 오프셋)
- 상단: `A PRACTICAL GUIDE` / `2026`. JetBrains Mono 500 7pt, 자간 .14em, `rgba(250,248,244,.55)`
- 공정 리스트(상단에서 30mm): `01 · PLAN … 06 · DEPLOY`. Mono 700 8pt. 활성 항목(01–04)은 종이색이고 앞에 10mm×2px 액센트 바가 붙습니다. 비활성 항목은 40% 투명도에 6mm×1px 바
- 하단 타이틀 블록: 키커는 Pretendard 600 9pt, `oklch(0.78 0.11 262)`. 제목은 Pretendard 800 33pt / 1.14, 자간 -.035em, "AI로"만 `oklch(0.72 0.15 262)`
- 액센트 룰 18mm×2px, 하단 메타는 Mono 7pt
- **표지 이미지 슬롯**: `<image-slot id="cover-image">`가 전면을 덮습니다. 비어 있으면 투명해서 타이포 표지가 그대로 보이고, 마우스를 올리면 드롭 안내가 나타납니다. 이미지를 넣으면 cover-fit으로 전면을 채웁니다. 저자 표지가 확정되면 이 레이어를 이미지로 바꾸면 됩니다.

### 2. 속표지 (Title page)
- `page: front` (러닝헤더와 쪽번호 없음), 높이 196mm 플렉스 컬럼
- 라벨 Mono 700 7pt 액센트, 제목 Pretendard 800 24pt / 1.22, 부제 500 10.5pt `#55524C`
- 하단: 1px 잉크 상단선 + 6열 그리드 `STEP 1 기획 … STEP 6 배포`

### 2-1. 판권·전자책 이용 안내 (Colophon, 3쪽)
- `page: front`, 높이 196mm, 내용은 페이지 하단에 정렬(`justify-content: flex-end`)
- 책 제목 Pretendard 800 11pt, 부제 500 8.4pt `#55524C`
- 정보 표(`dl`): 2열 그리드(26mm 라벨 + 내용), 위 1px 잉크 선 · 아래 1px `#DAD5CB` 선, 8pt. 라벨(`dt`)은 600 `#8C887F`
  - 항목: 저자 / 개정 기준일 **2026년 10월 1일** / 도구·요금 확인 **2026년 10월 1일 확인** 등
- 안내문(`.col-notes`) 7.6pt / 1.65 `#55524C`: 무단 복제·재배포 금지, AI 도구 화면·기능 변경 가능, 가격·정책 변경 가능, 실습 결과가 환경마다 다를 수 있음
- 저작권 표기(`.col-copy`) Mono 700 7pt

### 3. 차례 (TOC)
- `CONTENTS` 라벨 + "차례" 800 22pt
- PART 행: 1px 잉크 상단선, `PART n`(Mono 6.8pt 액센트, 13mm 고정폭) + 제목 700 9pt
- 장 행: 점선 하단선 `#DAD5CB`, 번호(Mono 7pt `#8C887F`) + 제목 500 8.6pt + 오른쪽 끝에 `target-counter(attr(href), page)` 쪽번호(Mono 700 7.5pt)
- 부록 번호 `A1–A5`는 액센트색

### 4. PART 구분 페이지 (5개)
- `@page part`: 여백 0, 배경 `#1C1B19`, 러닝 요소 없음
- 안쪽 여백 26mm 18mm 20mm
- `PART` Mono 700 8pt, 자간 .3em, `oklch(0.72 0.15 262)`
- 번호 `01–05` Mono 700 88pt
- 제목 Pretendard 800 22pt / 1.3, 최대 너비 118mm
- 하단: 해당 PART의 장 목록(번호 + 제목, 행마다 12% 종이색 구분선)

### 5. 장 오프너
- 각 장은 `break-before: page`
- `CHAPTER 06` 라벨(Mono 700 7pt, 자간 .2em, 액센트)
- 큰 번호 Mono 700 58pt / .95
- 제목 Pretendard 800 20pt / 1.3, `text-wrap: balance`, `string-set: chapter`
- 부제 500 10pt `#55524C`
- 하단 1px 잉크 선, 아래 여백 11mm

### 6. 본문 페이지
- `@page` 170×240mm, 여백 22mm(위·아래) / 18mm(좌우)
- 왼쪽 면: 왼쪽 위에 책 제목, 왼쪽 아래에 쪽번호
- 오른쪽 면: 오른쪽 위에 현재 장 제목(`string(chapter)`), 오른쪽 아래에 쪽번호
- 러닝헤더 Pretendard 500 7pt `#8C887F`, 쪽번호 Mono 700 7.5pt
- 본문 Pretendard 9.6pt / 1.78, `word-break: keep-all`, `text-wrap: pretty`, orphans/widows 2

### 컴포넌트 상세
- **h2**: 750 13.2pt / 1.4, 자간 -.025em, 위 10mm · 아래 3.5mm
- **h3**: 700 10.6pt. 앞에 1.6mm 액센트 정사각형
- **STEP 태그**: Mono 700 6.8pt, 종이색 글자, 잉크 배경(h2에서는 액센트 배경), 패딩 1.2/1.6mm, radius 1mm
- **볼드(strong)**: 700, 아래쪽 38%에 `oklch(0.93 0.04 262)` 형광펜 그라디언트
- **p.label**: 700 8pt 액센트 (예: "확인할 것", "정상 결과")
- **p.key**: 700 11pt, 위에 8mm×2px 액센트 바
- **flow 칩**: 배경 `#F1EEE7` 박스(패딩 3.6mm, radius 1.6mm). 칩은 흰 배경, 1px `#DAD5CB` 테두리, radius 5mm, 700 8pt. 화살표는 Mono 액센트
- **프롬프트 카드**: 1px 잉크 테두리, radius 1.6mm, 흰 배경. 헤더 바는 잉크 배경에 `PROMPT`(Mono 700 6.6pt, 자간 .2em) + 오른쪽 `COPY & EDIT`(50% 투명). 본문 8.8pt / 1.7, 패딩 3.2/3.6mm. `[대괄호 변수]`는 `mark`(액센트 소프트 배경 + 액센트 600). 700자 미만이면 `break-inside: avoid`, 더 길면 `box-decoration-break: clone`으로 쪽을 넘겨 이어집니다.
- **체크리스트**: `#F1EEE7` 박스, 1px `#DAD5CB`, `CHECK` 라벨. 항목 앞에 3.2mm 흰색 체크박스(1.2px 잉크 테두리, radius .6mm)
- **화면 캡처 슬롯**: 높이 66mm, 너비 100%. 135° 사선 줄무늬(`#F1EEE7` / `#EAE6DD`) + 1px 테두리. 캡션은 `그림 NN`(Mono 액센트) + 원고 설명 7.8pt
- **와이어프레임**: 점선 외곽. 섹션 박스(1px 잉크, 흰 배경) 안에 Mono 라벨과 회색 칩
- **용어(h5.term)**: 700 10pt, 상단 구분선, 뒤에 액센트 점
- **부록 entry**: 번호 Mono 8pt 액센트(6mm) + 제목. `.kv`는 17mm 라벨 열, "요청"은 액센트 600
- **워크시트 기입선**: 최소 높이 9mm, 하단 1px `#DAD5CB`. 왼쪽에 질문, 오른쪽은 빈 칸
- **표(grid)**: 헤더 하단선 1.5px 잉크, 셀 하단선 1px `#DAD5CB`, 셀 최소 높이 12mm(기입용)

### 박스 컴포넌트 5종 (수정 지시서 반영으로 추가)
공통 `.box`: 바깥 여백 4mm 0 5.5mm, 패딩 3.4mm 4mm 2.6mm, radius 1.6mm, `break-inside: avoid`, 9pt / 1.7. 라벨 `.box-label`은 Mono 700 6.8pt, 자간 .16em, 대문자, 아래 여백 2.2mm.

| 클래스 | 용도 | 스타일 | 예시 위치 |
|---|---|---|---|
| `.result-box` | 각 장 첫머리 "이 장을 끝내면 남는 것" | 잉크 배경 `#1C1B19`, 종이색 글자. 라벨 `oklch(0.78 0.11 262)`, 목록 마커 `oklch(0.72 0.15 262)` | 각 장 시작 |
| `.case-box` | 책 전체를 잇는 "서비스 기획자 S" 사례(학습용 재구성) | `--accent-soft` 배경, 라벨 액센트. 안의 캡처 슬롯 높이는 52mm | 1–7, 9, 11, 13장 |
| `.checkpoint` | 6장 CHECKPOINT 1–3 | 흰 배경 + 1.5px 액센트 테두리, 라벨 액센트. 안의 `p.key`는 10.6pt이고 액센트 바 없음 | 6장 |
| `.tip-box` | 짧은 팁 (예: "경력이 많지 않다면 이렇게 바꿔 읽으세요", 이미지 파일명 규칙) | `--paper-2` 배경 + 1px `--rule` 테두리, 라벨 `--ink-2` | 2·5·8장 등 |
| `.option-box` | 필수가 아닌 선택 내용 (예: "선택 — 내 도메인을 연결하고 싶다면") | 1px 점선 `--ink-3` 테두리, 라벨 앞에 액센트색 `OPTIONAL · ` 자동 표시 | 10장 |

박스 안에 프롬프트 카드가 들어가면 위아래 여백이 2.6mm 0 1mm로 줄어듭니다.

## Interactions & Behavior
- 뷰어 단축키: ←/→, PgUp/PgDn, Home/End, 1/2/3(단면/펼침/그리드). 사이드바 썸네일과 차례 링크를 누르면 해당 쪽으로 이동
- 펼침 보기는 창 너비가 약 600px보다 좁으면 단면 보기로 바뀝니다.
- `<image-slot>`: 클릭하거나 드래그&드롭해서 이미지를 넣습니다(PNG/JPEG/WebP/AVIF, 최대 1200px로 재인코딩). 넣은 이미지는 `.image-slots.state.json`에 저장됩니다. cover-fit 슬롯은 더블클릭하면 위치와 크기를 다시 맞출 수 있습니다. 운영 버전에서는 확정된 이미지를 정적 `<img>`로 바꾸는 것을 권장합니다.
- PDF 출력: 브라우저 인쇄(Cmd/Ctrl+P). `@page` 판형이 그대로 적용됩니다.

## State Management
상태가 따로 없는 정적 문서입니다. 상태는 두 가지뿐입니다.
- 뷰어의 현재 보기 모드와 현재 쪽
- 이미지 슬롯 내용(사이드카 JSON)

## Design Tokens
| 토큰 | 값 | 용도 |
|---|---|---|
| `--paper` | `#FAF8F4` | 페이지 배경 |
| `--paper-2` | `#F1EEE7` | 박스 배경 |
| `--ink` | `#1C1B19` | 본문, 표지·PART 배경 |
| `--ink-2` | `#55524C` | 보조 텍스트 |
| `--ink-3` | `#8C887F` | 러닝헤더, 메타 |
| `--rule` | `#DAD5CB` | 구분선 |
| `--accent` | `oklch(0.52 0.19 262)` (≈ `#2F55D4`) | 코발트 포인트 |
| `--accent-soft` | `oklch(0.93 0.04 262)` | 형광펜, mark 배경 |
| 어두운 배경용 액센트 | `oklch(0.72 0.15 262)`, `oklch(0.78 0.11 262)` | 표지, PART |

- **서체**: Pretendard Variable(본문·제목, 45–920), JetBrains Mono 500/700(라벨·번호)
- **타입 스케일(pt)**: 6.6 · 7 · 7.5 · 8 · 8.8 · 9.6(본문) · 10.6 · 13.2 · 20 · 22 · 24 · 33 · 58 · 88
- **간격(mm)**: 1 · 1.6 · 2.2 · 2.6 · 3.2 · 3.6 · 4.5 · 5 · 7 · 10 · 11
- **Radius**: .6mm(체크박스, mark) · 1mm(태그) · 1.2mm(슬롯) · 1.6mm(카드, 박스) · 5mm(칩)
- **그림자**: 없음 (평면 인쇄 스타일)

## Assets
- `fonts/PretendardVariable.woff2`: Pretendard v1.3.9 (SIL OFL)
- `fonts/JetBrainsMono-500.woff2`, `-700.woff2`: JetBrains Mono, latin 서브셋 (OFL)
- 표지 이미지: **저자가 제공 예정** (슬롯 `cover-image`)
- 화면 캡처 33개: 원고의 `[화면 캡처 자리]`와 `[저자 실제 사례 자리]` 위치. 슬롯 id는 `slot-01`–`slot-33`, 캡션은 원고 문구 그대로입니다. 캡처 캡션에는 "2026-10-01 기준"을 표시하는 것을 권장합니다.
- 아이콘, 일러스트: 없음

## Files
- `내 포트폴리오, AI로 직접 만들기.html`: **최종본** 책 전체(표지, 속표지, 판권, 차례, 본문)
- `book.css`: 조판 스타일 전부(@page, 컴포넌트, 토큰)
- `paged.polyfill.js`: Paged.js v0.4.3 (MIT)
- `paged_book_viewer.js` / `paged_book_viewer.css`: 리더 UI(툴바, 사이드바)
- `image_slot.js`: 이미지 슬롯 웹 컴포넌트
- `fonts/`: 서체 파일

## 원고 반영 상태 (최종본)
저자의 **원고 최종 통합 수정 지시서**(66개 항목)를 이 HTML에 반영했습니다. 주요 반영 내용은 다음과 같습니다.
- 확인 기준일을 **2026년 10월 1일**로 통일하고, 판권·전자책 이용 안내 페이지를 추가했습니다.
- 비용 안내를 공식 페이지 기준으로 다시 썼습니다.
  - Cursor: 무료 플랜은 Agent 요청 수가 제한되고, Pro는 월 20달러입니다.
  - Vercel: Hobby는 개인·비상업용만 가능하고, Pro는 개발자 좌석당 월 20달러입니다.
  - GitHub Free와 Figma Starter 안내도 포함했습니다.
- 기본 실습 경로를 React + Vite + **JavaScript**(TypeScript 미사용)로 명시했습니다. Netlify는 부록 1에 참고 대안으로 한 번만 남겼습니다.
- 6장에 CHECKPOINT 1–3을 넣었습니다(`.checkpoint`).
- 10장 보완 내용:
  - Production/Preview 구분, Production domain 설명
  - SPA 새로고침 404 확인 프롬프트(rewrite 설정은 승인 전 추가 금지)
  - "선택 — 내 도메인을 연결하고 싶다면" 박스(`.option-box`)
- 14장 제목을 "공개 버전 최종 점검 — 포트폴리오 최종 QA"로 바꾸고, 시크릿 창 확인과 외부 링크 직접 클릭 확인을 추가했습니다.
- 그 밖에 추가한 내용:
  - "서비스 기획자 S" 연결 사례: 가짜 회사·수치·일정은 없습니다.
  - "경력이 많지 않다면" 박스
  - 이미지 파일명 규칙
  - Resume·Contact 개인정보 안내
  - 12장 용어 보강
  - 부록 1 "F. 공식 문서 및 최신 정보 확인"
  - Epilogue 확대: 마지막 행동은 "오늘 완성한 포트폴리오 URL을 실제 한 사람에게 보내보세요."
- 그대로 유지한 개수: 프롬프트 47개, 문제 해결 35개, 워크시트 STEP 36(32-1 포함), 화면 캡처 자리 33개

### 출판 전 확인 필요
- 가격·요금제는 바뀔 수 있으므로 출판 직전에 각 서비스 공식 Pricing 페이지에서 다시 확인하세요.
- 차례의 `target-counter` 쪽번호는 구조상 정상적으로 생성되는 것을 확인했습니다. 다만 화면에 숫자가 실제로 보이는지는 육안으로 최종 확인하세요.
- 프로젝트 루트의 `내 포트폴리오, AI로 직접 만들기 v1.html`은 수정 전 백업입니다. 이 패키지에는 넣지 않았습니다.
