# 차곡 S01 랜딩페이지 리뉴얼 스토리보드 v1.0

- 제품: 차곡(Chagok) — 별도 MyChapter 앱과 혼동 금지
- 작성일: 2026-10-16
- 상태: DRAFT / PRODUCT DESIGN / 구현 착수 전 검토
- 작업 대상: S01 Landing, Route /
- 기준: MY_CHAPTER_PRODUCT_SPEC.md v1.4, _docs/README.md, IA.md, TASK_FLOW.md, SCREEN_DESIGN.md, SCREEN_SPEC.md, UI_PRODUCT_AUDIT_2026-10-16.md 및 현재 _shared/landing.html/js
- Scope: 랜딩 UI, 콘텐츠/카피, CTA/정보 구조, 제품 시연 이미지 및 모바일/접근성/측정 계획
- Non-scope: Book engine, Wizard, Editor, Viewer, Paged.js, PDF, Phase 15B Auth runtime, Phase 16 Ownership/DB/Storage, AI 생성, 결제

## 1. 기획 배경 / 문제 정의

현재 랜딩은 ① 텍스트 Hero ② 원고→구조→디자인→표지→PDF 5단계 ③ 기능 설명 3개 ④ Footer로 구성된다. 기본 이해는 쉽지만 실제 책 결과물, 제작 전후 비교, 실제 제품 UI가 없으며 누구를 위한 서비스인지 즉각 파악하기 어렵다. IA·화면설계 문서에 정의된 Product Preview도 실제 페이지에는 없음. Local 상태의 '로그인 준비 중'은 개발 내부 상태를 사용자에게 전달한다. Hero 상단의 'AI PUBLISHING STUDIO'는 현재 AI 생성 기능이 상용화된 것처럼 읽힐 소지가 있다.

**목표:** 사용자가 5초 내에 '원고를 책 형태로 만들어 PDF로 출력하는 도구'임을 이해하고, 실제 제작 화면/결과물을 신뢰한 다음 Wizard에 진입하도록 한다.

**경계:** 차곡은 현재 AI 책 자동 집필 서비스가 아니다. Product Spec 기준 Local/Guest MVP는 구현됐지만 전용 Supabase Auth runtime, 사용자별 클라우드 저장, 결제 및 AI 보조는 HOLD/Later다. 광고 문구와 CTA는 실제 이용 가능한 범위만 약속한다.

## 2. 사용자와 전환 목표

### 타깃 가설 (고객 인터뷰 전 가설로 관리)

- Primary: 원고는 있지만 전자책 편집·조판·PDF 제작이 익숙하지 않은 1인 창작자
- Secondary: 교안, 워크북, 실무 가이드북, 매뉴얼 등의 PDF 책자를 만들려는 강사/실무자
- 핵심 문제: 완성된 원고가 있어도 구조를 정리하고 책처럼 편집·검수·출력하기 위해 여러 도구를 오간다
- 핵심 작업(Job): '내 원고를 손쉽게 읽을 만한 한 권의 책으로 완성하고 싶다'
- 가치 제안: '원고를 가져와 구조를 확인하고, 디자인과 표지를 적용한 뒤 실제 책처럼 미리보고 PDF로 완성한다'

### 전환 목표와 측정

1. Primary: landing_view → landing_primary_cta_click → wizard_start
2. Activation: wizard_start → book_generate_success
3. Value: book_generate_success → pdf_export_success
4. 보조: before_after_engage, showcase_tab_click, scroll_section_view
5. 성과 판단은 방문 수·표본 크기를 함께 보고, 비율만으로 섣불리 결론 내리지 않는다.
6. 계측 이벤트는 **설계 제안**이며 현재 구현된 Analytics라고 주장하지 않는다. 분석 도구 선정도 별도 결정한다.

## 3. 핵심 메시지와 브랜드 톤

- 메인 콘셉트: From Manuscript to Book / 원고에서 한 권의 책으로
- 브랜드 핵심: 원고를 쌓고 다듬어 책으로 완성하는 차곡차곡의 감각
- 메인 헤드라인(채택): **당신의 원고가, 한 권의 책이 되도록.**
- 서브 카피(채택): **원고를 가져오고, 목차와 디자인을 다듬고, 책처럼 미리본 뒤 PDF로 완성하세요. 복잡한 책 제작 과정을 차곡에서 이어갑니다.**
- 상단 Eyebrow: **CHAGOK · BOOK MAKING STUDIO** (AI 생성 오인 방지)
- Primary CTA: **내 책 만들기**
- Secondary CTA: **만드는 과정 보기** (Page anchor #how-it-works)
- 금지 카피: 'AI가 책을 써줘요', '몇 초 만에 자동 출판', '출판사 수준 보장', '무료', '클라우드에 안전하게 자동 저장', '원클릭 AI 표지' (검증되지 않거나 미구현)
- 현 단계 권장 어투: 전문적이지만 누구나 이해할 수 있는 문장, 기능/원가/속도 과장 금지

## 4. 페이지 IA

| ID | 구역 | 전달 정보 | 주요 행동 |
|---|---|---|---|
| S01-00 | Header | 차곡 로고, 제품/과정, 내 서재/로그인, 시작 | 내 책 만들기 |
| S01-01 | Hero | 제품 정의 + 실제 책 결과물 | 내 책 만들기 / 만드는 과정 보기 |
| S01-02 | Before & After | 원고 → 편집된 책, 동일 샘플 비교 | 실제 비교 인지 |
| S01-03 | Core Benefits | 구조·편집·미리보기 3가지 가치 | 제작 과정으로 이동 |
| S01-04 | How It Works | 원고 / 구조 / 디자인 / 표지 / PDF | 내 책 만들기 |
| S01-05 | Product Showcase | 실제 Workspace·디자인·표지·미리보기 | 탭 전환 / 내 책 만들기 |
| S01-06 | Use Cases | 전자책, 교안, 가이드, 매뉴얼 | 내 책 만들기 |
| S01-07 | Final CTA & Footer | 마무리·지원 형식·이용 범위·기본 정보 | 내 책 만들기 / 내 서재 |

권장 앵커: #how-it-works, #features, #preview. 별도 페이지/새 라우트는 도입하지 않는다.

## 5. 섹션별 스토리보드

### S01-00 Global Header

**목적:** 브랜드 인지, 제품 설명 섹션으로의 이동, 주요 전환 CTA를 항상 이해하기 쉬운 위치에 제공한다.

**Desktop:** 좌측 워드마크 '차곡', 우측 '제작 과정'(#how-it-works), '제품 미리보기'(#preview), 로그인/내 서재(상태 기반), Primary '내 책 만들기'. 기존 3개의 분리된 버튼을 과밀하게 늘리지 않는다.

**Mobile:** 로고와 Primary CTA를 1행 우선 배치한다. 보조 메뉴는 단순화하거나 접근 가능한 메뉴 토글로 제공한다. 헤더가 여러 줄 겹치지 않도록 한다.

**동작:** 로고 클릭→/, 제작 과정→앵커, 미리보기→앵커. 기존 CTA ID·Session 분기 등 연결 계약은 유지하거나 무결성 검증을 동반해 정리한다. 현재 Local 환경의 로그인 미구현 텍스트를 주요 CTA처럼 보이게 하지 않는다.

### S01-01 Hero

**목적:** 방문 첫 화면에서 '무엇을 할 수 있는 제품인지'와 '어떤 결과물이 만들어지는지'를 동시에 전달한다.

**레이아웃:** Desktop 2칼럼(좌 텍스트 44% / 우 시각 56%). 좌측 Eyebrow, H1, 2행 설명, Primary + Secondary CTA, 아래 'TXT · MD · PDF · DOCX · 텍스트 붙여넣기 지원' 안내. 우측 실제 책 미리보기와 원고 화면의 레이어 시각화(가짜 기능 UI 금지).

**문구:**
- Eyebrow: CHAGOK · BOOK MAKING STUDIO
- H1: 당신의 원고가, 한 권의 책이 되도록.
- Body: 원고를 가져오고, 목차와 디자인을 다듬고, 책처럼 미리본 뒤 PDF로 완성하세요. 복잡한 책 제작 과정을 차곡에서 이어갑니다.
- Primary: 내 책 만들기
- Secondary: 만드는 과정 보기
- 지원 입력 안내: TXT, MD, PDF, DOCX와 텍스트 붙여넣기

**시각 자료:** 실제 검증된 PDF/미리보기 결과에서 공개 가능한 데모 책을 캡처한다. 사용자의 비공개 원고 및 보호 책을 무단 노출하지 않는다. 사실과 다르게 생성된 UI, '출력 성공' 지표, 이용자 수를 합성하지 않는다.

**Mobile:** 텍스트→CTA→책 비주얼 순서, 우선 높이 제한. 주요 CTA는 접히지 않도록 표시하고 책 비주얼은 화면 폭에 맞춰 축소한다.

### S01-02 Before & After

**목적:** '차곡을 쓰기 전/후' 차이를 기능명 없이 눈으로 이해시킨다.

**헤드라인:** 원고만 있어도, 책의 형태는 달라집니다.
**서브:** 같은 내용을 원고와 편집된 책으로 나란히 비교해보세요.

**Desktop 시각:** 왼쪽 [BEFORE · 원고] 텍스트 문단, 오른쪽 [AFTER · 차곡으로 만든 책] 같은 텍스트가 배치된 책 페이지. 동일한 샘플 원고를 활용해야 하며 문장을 추가/삭제했다면 그 사실을 표시한다.

**Mobile:** BEFORE→AFTER 순차 카드. 모바일에서 비교 슬라이더 하나에 의존하지 않는다.
**인터랙션:** MVP 기본은 정적 2분할 비교. 리치 슬라이더는 옵션이며 키보드·터치 접근성이 확보되지 않으면 도입하지 않는다.
**제작 필요 자산:** 공개용 데모 원고 1개, 동등한 콘텐츠의 실제 차곡 제작 PDF 페이지 1개.

### S01-03 Core Benefits

**목적:** 기능 목록이 아닌 3가지 사용 가치를 전달한다.

**카드 1**
- 제목: 원고의 흐름을 책의 구조로
- 문구: 장과 절을 확인하고 순서를 정리해, 읽기 좋은 책의 뼈대를 만듭니다.
- 근거: Wizard Structure Review(S07)

**카드 2**
- 제목: 편집부터 디자인까지 한 곳에서
- 문구: 내용을 다듬고 Practical·Minimal 테마를 적용해 책의 분위기를 완성합니다.
- 근거: Editor(S10) / Design(S11)

**카드 3**
- 제목: 책처럼 미리보고 PDF로
- 문구: 한 쪽씩 또는 펼침면으로 확인한 뒤 전자책 PDF를 만듭니다.
- 근거: Preview(S14) / PDF(S15)

시각은 추상 일러스트보다 실제 기능 화면의 부분 클로즈업 권장. 과도한 하드웨어 프레임, 무의미한 숫자 지표 금지.

### S01-04 How It Works

**목적:** 사용자가 시작 이후 경로를 예측 가능하게 한다.

**헤드라인:** 처음 원고부터 완성 파일까지, 차곡차곡.
**5단계 구성:**
1. 원고 가져오기 — 파일 업로드 또는 직접 붙여넣기
2. 구조 확인하기 — 제목·장·절을 확인하고 정리
3. 디자인 선택하기 — Practical 또는 Minimal 테마 적용
4. 표지 다듬기 — 표지 이미지와 책 정보를 편집
5. 미리보고 PDF 만들기 — 페이지를 검수하고 출력

**제약 반영:** 실제 Wizard의 S04~S09는 새 책 생성 단계이며, 표지/미리보기/출력은 생성 후 Workspace 과정이다. 5단계 설명은 서비스 전체의 대표 흐름이지 Wizard 화면 5개와 1:1 매칭이 아님을 설계 문서에 명시한다.

**CTA:** 내 책 만들기 → 현재 세션/Local 설정에 따라 Wizard 또는 Auth returnTo 경유.
**Desktop:** 5개 스텝을 가로로, 각 단계에 1개 스냅샷/아이콘.
**Mobile:** 5개 스텝을 세로 스택, 흐름이 끊기지 않도록 연결선/번호 제공.

### S01-05 Product Showcase

**목적:** 기능이 실제로 구현되어 있음을 보여준다.

**헤드라인:** 만드는 모든 순간을 한 화면에서.
**서브:** 편집하고, 꾸미고, 넘겨보며 내 책의 완성도를 확인하세요.

**탭(또는 모바일 칩):**
- 원고 편집 → 실제 Workspace S10 캡처
- 디자인 선택 → 실제 Practical/Minimal S11 캡처
- 표지 편집 → 실제 S12 캡처
- 책 미리보기 → 실제 S14 Single/Spread/Grid 화면 캡처

**기본 탭:** 책 미리보기 — '결과물'을 가장 직관적으로 보여주는 화면.
**동작:** 탭 선택 시 같은 구역의 설명과 이미지 변경; autoplay 금지; aria-tab/aria-selected 및 키보드 포커스 처리; 이미지 로드 전 레이아웃 크기 예약.
**CTA:** 하단 내 책 만들기.

**이미지 운영 원칙:** 현재 UI를 정확히 반영한 스크린샷으로만 갱신한다. 실제 개발 UI와 지나치게 달라지는 광고용 합성 금지. 필요 시 메뉴/개인정보는 마스킹하고 제작 버전·촬영 시점을 자산 메모에 남긴다.

### S01-06 Use Cases

**목적:** 어떤 콘텐츠를 이 도구로 제작할지 사용자 스스로 연결한다.

**헤드라인:** 책이 필요한 순간, 차곡에서.
**카드 예시:**
- 나의 첫 전자책 — 지식과 경험을 한 권으로 정리
- 강의 교안·워크북 — 학습 콘텐츠를 읽기 쉬운 형태로 구성
- 업무 가이드북 — 복잡한 정보를 장·절로 정리
- 콘텐츠 모음집 — 흩어진 글을 하나의 흐름으로 묶기

**표기:** 업종별 전용 템플릿이나 판매·배포 자동화를 제공한다고 주장하지 않는다. 사용 예시일 뿐이며 공개 샘플이 확보된 항목만 실제 결과물 썸네일을 사용한다.

### S01-07 Final CTA & Footer

**마지막 헤드라인:** 준비한 글이 있다면, 이제 책으로 완성할 차례.
**설명:** 원고를 가져와 차곡에서 나만의 책을 만들어 보세요.
**Primary:** 내 책 만들기
**Secondary:** 내 서재 (세션/Local 상태에서 의미가 있을 때만)

**작은 FAQ:**
- Q. 어떤 원고 파일을 사용할 수 있나요? A. TXT, MD, PDF, DOCX 및 텍스트 붙여넣기를 지원합니다.
- Q. AI가 원고를 대신 작성하나요? A. 현재 제공 기능은 준비된 원고를 책으로 구성·편집·출력하는 작업입니다. AI 원고 보조는 향후 범위입니다.
- Q. 어디에 저장되나요? A. 현재 로컬 MVP는 작업 환경의 파일 시스템을 사용합니다. 계정별 클라우드 저장은 준비 중입니다. (이 답변은 공개 서비스 출시 시 실제 상태로 재검증 및 교체)

**Footer:** 차곡 로고, 한 줄 설명, 필수 정책·문의 링크는 실제 문서/연락처가 준비된 경우에만 연결. 존재하지 않는 약관·주소·고객지원 링크는 생성하지 않는다.

## 6. 상태별 CTA 라우팅 계약 (기존 코드 호환 필수)

| 상태 | Header 보조 요소 | Primary CTA '내 책 만들기' | 내 서재 |
|---|---|---|---|
| Local/Guest CONFIG 미연결 | 로그인 상태를 과장하지 않고 필요 시 '로컬 체험' 소형 안내 | /__wizard | /library |
| Auth configured + 비로그인 | 로그인 → /__auth?returnTo=/library | /__auth?returnTo=/__wizard | 미노출 |
| Auth configured + 로그인 | 내 서재 | /__wizard | /library |
| Auth session 확인 중 | 안정된 Skeleton/자리 유지 | 중복 클릭 방지 및 상태 결정 후 이동 | 상태 결정 후 표시 |
| Auth 조회 오류 | 안전한 기존 fallback | 잘못된 세션을 인증된 것처럼 취급 금지 | 상태 따라 표시 |

현재 landing.js의 분기와 정합성 검사 필수. Local mode는 그대로 동작해야 하며 Auth runtime을 랜딩 작업의 선행조건으로 만들지 않는다. 외부 공개 URL에서 실제 Wizard/서버 동작이 준비되지 않았다면 CTA를 유효한 '즉시 제작 가능' 버튼으로 게시하면 안 된다. 공개 전에 배포·접근 방식과 CTA 실제 목적지를 재검증한다.

## 7. Desktop/Mobile 레이아웃 지침

### Desktop (기준 1440px)
- 콘텐츠 최대 폭 1120~1200px, 내부 좌우 여백 24~48px
- Header: 가로 정렬, Primary 강조, Anchor 두 개 정도만 배치
- Hero: 좌측 문구 / 우측 실제 책 프리뷰, 2칼럼
- Before & After: 2칼럼 동일 원고 비교
- Benefits: 3열
- Process: 5단계 가로
- Product: 선택 탭 + 넓은 단일 실제 캡처
- Use Cases: 4열 또는 2x2
- Footer: 정보의 중요도에 따라 분할

### Tablet (약 768px)
- Hero는 콘텐츠 우선 단일열 전환 가능
- Before & After는 2열이 어려우면 세로 전환
- Benefit/Use Case는 2열
- Product 탭 스크롤 가능, 활성 탭 명시

### Mobile (약 390px)
- CTA 최소 터치 영역 44px
- H1은 2~4줄 내 자연스러운 줄바꿈, 가로 오버플로 없음
- Hero 문구→CTA→프리뷰 순서
- 정적 이미지/탭이 퍼포먼스에 불리하면 첫 상태만 선노출
- 카드/스텝 세로 스택, 스크롤 중 맥락 유지
- Sticky bottom CTA는 옵션; 키보드/뷰어를 가리지 않도록 하고 과도한 CTA 반복 금지

## 8. 시각 디자인 원칙

- 키워드: 출판물, 종이, 읽기, 편집, 축적, 완성
- 현행 기본색과 연결: paper #faf8f4, ink #1c1b19, accent #2f55d4. 실제 디자인 탐색에서 대비 검증 후 조정 가능
- 타이포: UI는 현재 Pretendard 기준. 책 시각화는 본문과 명확히 구별되는 서체·여백 사용 가능
- 모션: 미세한 전환 정도만; prefers-reduced-motion 적용, 페이지 넘김 강제 애니메이션 금지
- 실사 책 목업보다 **실제 PDF/page preview**의 충실도를 우선
- 'AI' 화려한 그래픽, 허구 대시보드, 검증 없는 통계·후기는 사용하지 않음

## 9. 자산 제작 명세

| ID | 자산 | 소스 | 공개 조건 |
|---|---|---|---|
| A01 | Hero 대표 책 결과물 | 실제 PDF/Viewer 샘플 | 권리 확인된 데모 원고 |
| A02 | Before 원고 이미지/텍스트 | A03과 동일 샘플 텍스트 | 개인·기밀 정보 제거 |
| A03 | After 페이지 | 실제 차곡에서 생성한 같은 원고 | Before와 내용 대응 검수 |
| A04 | S10 Editor 캡처 | 실제 Local MVP | 개인 원고/계정 정보 마스킹 |
| A05 | S11 Design 캡처 | 실제 Local MVP | 기능 일치 |
| A06 | S12 Cover 캡처 | 실제 Local MVP | 임의 AI 표지 생성으로 오인 금지 |
| A07 | S14 Preview 캡처 | 실제 Local MVP | 실제 페이지 모드 보여주기 |
| A08 | OG 이미지 | 브랜드+대표 책 장면 | 텍스트 가독성/저작권 점검 |

보호 자산 'books/내 포트폴리오, AI로 직접 만들기', 'books/서아의/' 및 recovery key는 촬영을 이유로 수정/삭제하지 않는다. 공개 사용 동의 없이 비공개 책의 표지·내용을 랜딩 자산으로 포함하지 않는다. 공개용 가짜 '샘플 작가/후기'를 만들지 않는다.

## 10. SEO, 접근성, 성능

- Title 제안: 차곡 | 원고에서 한 권의 책까지
- Meta Description 제안: 원고를 가져와 장과 절을 정리하고, 디자인과 표지를 적용해 전자책 PDF로 완성하세요. 차곡에서 책 제작 과정을 이어갑니다.
- H1 1개; H2는 섹션 헤드라인; 언어 lang=ko
- Open Graph 및 Twitter/카카오 공유 시 미리보기는 실제 공개 가능한 OG 이미지만 사용
- 화면/이미지에 의미 있는 Alt 작성; 장식 이미지는 비워 중복 낭독 방지
- 포커스 가시성, 대비 4.5:1 텍스트 기준 확인, 키보드 탭 순서, ESC 가능 토글
- CLS 방지: 스크린샷 aspect ratio 선지정, hero 이미지 사전 최적화
- 가능하면 이미지 lazy load(첫 Hero 이미지는 우선 로딩), 정적 CSS/HTML 기본 렌더 우선
- Analytics는 실제 동의/개인정보 정책을 확정한 뒤 적용

## 11. 개발 범위와 금지 변경

**허용 후보:** _shared/landing.html, _shared/landing.js, 신규 랜딩 전용 CSS 또는 안전한 전용 이미지 assets, 필요 시 랜딩 관련 smoke test / 문서.

**변경 금지:** 기존 원고/168쪽 보호 도서, Wizard/Editor/Viewer/PDF/Paged.js 계약, book.html/Book identity, Supabase project 연결, 로그인 보안 경계, 신규 결제/AI 기능, 회귀 보호용 legacy recovery keys.

현재의 전용 Chagok Web Auth 프로젝트와 별도 앱 MyChapter Supabase를 혼동하지 않는다. 리뉴얼 작업만으로 Phase 15B/16 HOLD를 해제하지 않는다.

## 12. 요구사항 및 QA 수용 기준

| ID | 우선순위 | 완료 조건 |
|---|---|---|
| LAND-R01 | P0 | 첫 화면에서 제품과 결과물을 설명하는 H1/서브카피가 읽힌다 |
| LAND-R02 | P0 | 공개 가능하고 실제 기능에 근거한 Hero 책 자산이 보인다 |
| LAND-R03 | P0 | Before & After가 동일 원고임을 검증할 수 있다 |
| LAND-R04 | P0 | Primary CTA가 Local, 로그인, 비로그인 상태별 유효한 경로를 갖는다 |
| LAND-R05 | P0 | /, /library, /__wizard, /__auth의 기존 계약이 유지된다 |
| LAND-R06 | P0 | 허구 AI/클라우드/무료·출판 자동화 약속이 없다 |
| LAND-R07 | P1 | S10/S11/S12/S14 실제 제품 화면이 해당 설명과 일치한다 |
| LAND-R08 | P1 | Desktop 1440, Tablet 768, Mobile 390에서 오버플로·버튼 겹침이 없다 |
| LAND-R09 | P1 | keyboard·screen reader 사용자도 주요 CTA/탭 사용 가능 |
| LAND-R10 | P1 | 기존 npm run check 통과, Wizard → Workspace → Preview → PDF 기본 흐름 영향 없음 |
| LAND-R11 | P1 | 이미지 최적화, LCP/CLS 측정 및 공유 카드 확인 |
| LAND-R12 | P2 | 전환 이벤트 정의 및 분석 도구 연결(실제 릴리스 시) |
| LAND-R13 | P2 | CTA/카피 A/B 가설 마련(사용량 확보 후 시행) |

## 13. 실행 순서 / 작업 분리

**Step 1 — Product planning (이번 문서):** 포지셔닝, 화면 ID, 섹션 구성, 카피, 동작, 수용 기준 완료. 실제 타깃/공개 방식은 가설로 표기.

**Step 2 — Asset prep:** 공개 가능한 데모 원고 선정, 실제 차곡에서 After PDF 추출, Product 4컷 확보, 노출 정보 검수. 샘플 자산을 확보할 때 보호 원고 수정 금지.

**Step 3 — Hi-fi wireframe:** Desktop 1440 / Mobile 390 기준 Figma 또는 HTML 정적 시안. 레이아웃/가독성/결과물 임팩트 우선. 디자인 확정 전 운영 엔진 수정 금지.

**Step 4 — Frontend implementation:** 랜딩에만 변경 적용. 기존 CTA ID/라우팅/세션 분기와 연결 정합성 유지.

**Step 5 — QA + Release review:** Local/Guest + configured mode(가능할 때) CTA, 반응형, 접근성, 진입/이탈, 실제 샘플 이미지, 엔진 회귀 검사. Public deployment readiness는 별도 게이트.

## 14. 의사결정 기록 (현재)

- **선택:** Conversion-first, result-first 랜딩. 실제 완성 책을 Hero와 Before/After에 배치.
- **선택:** Primary CTA '내 책 만들기', Secondary '만드는 과정 보기'.
- **선택:** AI 주장은 현재 기능에 맞춰 제거하고 브랜드를 'BOOK MAKING STUDIO'로 표현.
- **선택:** 정적 캡처 중심으로 MVP 설계; 복잡한 3D·슬라이더는 이후 검토.
- **유보:** 실제 홍보에 사용할 원고·완성 책 자산, 외부 공개 시점, 서버 배포와 계정 제공 방식, 이벤트 계측 도구.
- **정책:** 기획서 자체는 개발 변경 승인/배포 승인으로 간주하지 않는다.

## 15. 출처 문서 (Repo)

- MY_CHAPTER_PRODUCT_SPEC.md (v1.4)
- _docs/README.md
- _docs/IA.md (S01 및 Global Nav)
- _docs/TASK_FLOW.md (Entry flow)
- _docs/SCREEN_DESIGN.md / _docs/SCREEN_SPEC.md (S01)
- _docs/UI_PRODUCT_AUDIT_2026-10-16.md
- _docs/PHASE_15_AUTH_FOUNDATION.md
- _shared/landing.html / _shared/landing.js

---
Revision: v1.0, 2026-10-16. 본 문서는 차곡 랜딩 리뉴얼의 기획 초안이며 제품 코드는 변경하지 않는다.
