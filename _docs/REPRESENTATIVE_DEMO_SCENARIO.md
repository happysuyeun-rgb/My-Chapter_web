# 차곡 Representative Demo Scenario

- Product: 차곡 (Chagok)
- Version: **v1.0**
- Date: 2026-10-16
- Status: **CURRENT / DEMO BASELINE**
- Demo asset: `_demo/chagok-demo-manuscript.md`
- Goal: 신규 사용자가 **3~5분 안에 원고 → 책 → Preview → PDF**의 가치를 이해하게 한다.
- Privacy: 보호 책 / 실제 사용자 원고 / 고객 콘텐츠 사용 금지

---

## 1. Demo Goal

대표 데모의 목적은 모든 기능을 보여주는 것이 아니다.

한 문장으로:

> **준비된 원고가 차곡 안에서 실제 책의 형태와 PDF로 바뀌는 순간을 보여준다.**

데모에서 반드시 전달할 것:

1. 원고를 넣는다.
2. 차곡이 책 구조를 인식한다.
3. 디자인을 선택한다.
4. Workspace에서 표지/본문을 확인한다.
5. Single / Spread / Grid로 책을 확인한다.
6. PDF로 완성한다.

---

## 2. Demo Persona

**첫 전자책을 직접 만들어보려는 1인 창작자**

상황:

- 원고는 이미 작성함
- 편집 프로그램을 따로 배우고 싶지 않음
- 목차와 페이지가 책답게 정리되길 원함
- PDF를 최종 결과물로 필요로 함

Demo에서 특정 직업/나이/개인정보를 넣지 않는다.

---

## 3. Demo Manuscript

파일:

~~~text
_demo/chagok-demo-manuscript.md
~~~

제목:

> **작은 시작의 기술**

내용 구조:

~~~text
들어가며
PART 1 시작을 가볍게 만들기
  1장 목표를 결과물의 크기로 바꾸기
  2장 첫 버전에는 하나의 약속만 남기기

PART 2 완성을 반복 가능한 과정으로 만들기
  3장 저장과 복구도 사용자 경험이다
  4장 검증은 완성도를 높이는 마지막 기능이다

마치며
~~~

특징:

- 저작권 문제 없는 데모 전용 원고
- 개인정보 없음
- H1/H2, bullet, numbered list 포함
- Parser가 지원하는 기본 계약만 사용
- Practical / Minimal Theme 비교 가능

---

## 4. Fixed Demo Metadata

Demo 중 입력값을 매번 바꾸지 않는다.

~~~text
제목: 작은 시작의 기술
부제: 완벽한 계획보다 끝까지 가는 작은 결과
저자: 차곡 데모
~~~

실제 사용자 이름을 사용하지 않는다.

---

## 5. Default Theme

첫 데모는:

~~~text
Practical
~~~

을 사용한다.

이유:

- 장/파트 구조가 시각적으로 분명함
- 전후 차이가 잘 보임
- 책다운 결과를 빠르게 전달

Optional:

Workspace Design에서 한 번만 Minimal로 전환해:

> "콘텐츠는 그대로 두고 디자인만 바뀐다"

를 보여줄 수 있다.

시간이 3분 이하라면 Theme 전환은 생략한다.

---

## 6. 3~5 Minute Demo Flow

### 00:00–00:20 — Landing

화면:

~~~text
/
~~~

Narration:

> "차곡은 글을 대신 써주는 AI가 아니라, 이미 있는 원고를 책으로 완성하는 도구입니다."

Action:

- **새 책 만들기**

Success:

- 사용자가 첫 CTA를 바로 이해

---

### 00:20–01:00 — Manuscript Input

화면:

~~~text
S04 / S05
~~~

Action:

- 파일 업로드 선택
- `_demo/chagok-demo-manuscript.md` 입력
- Parse

Narration:

> "TXT, Markdown, PDF, DOCX 또는 붙여넣기 원고를 받을 수 있습니다."

Show:

- 원고가 장/절 단위로 구조화됨

금지:

- Parser의 기술 구현 설명을 길게 하지 않음

---

### 01:00–01:25 — Metadata

입력:

~~~text
작은 시작의 기술
완벽한 계획보다 끝까지 가는 작은 결과
차곡 데모
~~~

Narration:

> "책의 기본 정보만 넣고 다음으로 넘어갑니다."

---

### 01:25–02:00 — Structure Review

화면:

~~~text
S07
~~~

Show:

- 들어가며
- Part 1
- Chapter 1 / 2
- Part 2
- Chapter 3 / 4
- 마치며

Narration:

> "원고를 바로 생성하지 않고, 책이 만들어지기 전에 구조를 한 번 확인할 수 있습니다."

Highlight:

- **디자인 선택하기** CTA

---

### 02:00–02:20 — Theme

화면:

~~~text
S08
~~~

Action:

- Practical 선택

Narration:

> "자유형 편집보다 선택을 줄여, 바로 책을 만들 수 있게 했습니다."

Action:

- Book 생성

---

### 02:20–03:10 — Workspace

화면:

~~~text
S10
~~~

Show:

- 제목 / 저장 상태
- 원고
- 디자인
- 표지
- 미리보기

Narration:

> "책이 만들어진 뒤에도 본문, 디자인, 표지를 같은 작업공간에서 수정합니다."

Optional:

- 본문 한 문장 수정
- autosave 표시 확인

Demo에서는 실제 보호 책을 열지 않는다.

---

### 03:10–04:00 — Preview

화면:

~~~text
S14
~~~

Show order:

1. Spread
2. Grid
3. Single (필요 시)

Narration:

> "PDF를 만들기 전에 실제 페이지 단위로 전체 책을 확인할 수 있습니다."

가장 중요한 시각적 Wow Point:

~~~text
Raw Markdown
→ 실제 책 Spread
~~~

---

### 04:00–05:00 — PDF

Action:

- PDF Export

Narration:

> "미리보기와 같은 HTML/Paged.js 계약을 사용해 최종 PDF를 만듭니다."

Show:

- 생성된 PDF 첫 페이지
- 차례
- 본문 1개 장

Demo 종료 문장:

> "차곡의 핵심은 글을 생성하는 게 아니라, 원고가 실제 책 파일이 되는 과정을 줄이는 것입니다."

---

## 7. Demo Success Criteria

대표 데모는 다음 조건을 모두 만족해야 한다.

### Functional

- Markdown parse 성공
- 예상 장/파트 구조 유지
- S07 → S08 CTA 자연스러움
- Practical 적용
- Workspace 진입
- Preview Spread/Grid 정상
- PDF 정상 생성

### UX

- 5분 이내
- 중간에 설명하지 않으면 이해 안 되는 CTA 없음
- 화면 이동에서 막힘 없음
- 결과물이 "책처럼 보인다"는 인상 전달

### Technical

- console uncaught error 없음
- protected book 수정 없음
- demo book만 생성
- `npm run check` regression 영향 없음

---

## 8. Demo Reset Rule

각 시연 전에 Demo Book을 초기화할 수 있어야 한다.

원칙:

- 보호 책 삭제 금지
- 실제 사용자 책 삭제 금지
- Demo에서 만든 책만 정리
- `git clean` 사용 금지

Demo book naming:

~~~text
작은 시작의 기술
~~~

동일 이름 충돌 시 제품 duplicate-safe 동작을 그대로 사용하거나 Demo book만 명시적으로 휴지통 처리한다.

---

## 9. Screen Capture Set

대표 데모를 실행하면서 아래 캡처를 확보한다.

### Portfolio Essential

1. Landing
2. Markdown Input
3. Structure Review
4. Practical Theme
5. Workspace
6. Preview Spread
7. Preview Grid
8. PDF 첫 페이지
9. PDF 목차
10. PDF 본문

### Before / After Pair

**Before**
- raw Markdown 일부

**After**
- 같은 내용이 들어간 Spread 또는 PDF

이 Pair가 포트폴리오 핵심 이미지다.

---

## 10. Video Capture

추천 길이:

~~~text
45~75초
~~~

편집 순서:

~~~text
Landing 3s
→ Upload 6s
→ Structure 7s
→ Theme 5s
→ Workspace 8s
→ Spread 10s
→ Grid 6s
→ PDF 10s
~~~

긴 로딩 구간은 편집해도 되지만 실제 생성 시간을 허위로 표현하지 않는다.

---

## 11. User Validation Version

실제 사용자 3~5명 테스트에서는 데모 진행자가 대신 클릭하지 않는다.

Task:

> "이 원고를 차곡에서 책으로 만들고 PDF까지 완성해보세요."

관찰:

- 첫 행동
- 원고 입력 이해
- Structure에서 멈추는지
- Theme 선택 의미 이해
- Workspace 탭 탐색
- Preview 발견
- PDF Export 발견
- 도움 요청 횟수

질문:

1. 어디에서 가장 망설였나요?
2. 예상과 달랐던 부분은?
3. 결과 PDF를 실제로 쓸 수 있나요?
4. 이 결과를 받는 데 ₩14,900은 어떻게 느껴지나요?
5. 다시 쓴다면 어떤 상황인가요?

---

## 12. Validation Metrics

3~5명 소규모에서는 평균 숫자보다 행동을 우선한다.

기록:

| Metric | Target |
|---|---|
| 설명 없이 새 책 시작 | 4/5 이상 |
| 원고 입력 완료 | 4/5 이상 |
| 구조 확인 → 디자인 이동 | 4/5 이상 |
| Preview 발견 | 4/5 이상 |
| PDF Export 발견 | 4/5 이상 |
| 치명적 막힘 | 0 |
| PDF 실제 사용 가능 응답 | 정성 기록 |
| ₩14,900 가격 반응 | 이유와 함께 기록 |

---

## 13. Fix Rule After Test

테스트 후 수정 원칙:

### P0

- 데이터 손실
- 생성 실패
- PDF 실패
- 핵심 Flow 진행 불가

→ 즉시 수정.

### P1

- 여러 사용자가 같은 화면에서 반복적으로 막힘
- CTA 의미 오해
- Preview/PDF 결과 신뢰 저하

→ 검토 후 수정.

### P2

- 개인 취향
- 기능 추가 희망
- 한 명만 요청한 고급 기능

→ Backlog.

사용자 테스트를 새 기능 아이디어 수집회로 만들지 않는다.

---

## 14. Demo Privacy / Safety

공개 Demo에 사용 금지:

- `books/내 포트폴리오, AI로 직접 만들기/`의 실제 원고 내용
- `books/서아의/`
- 고객 콘텐츠
- 개인 이메일
- Vercel/Supabase secret
- local absolute path
- 결제 test secret

공개용 원고는 `_demo/` 파일만 사용한다.

---

## 15. Done Criteria

Representative Demo 준비 완료 조건:

- Demo manuscript committed
- Parse 가능한 구조
- Fixed metadata
- 3~5분 Flow
- 화면 캡처 목록
- 45~75초 영상 흐름
- 사용자 테스트 task/questions
- P0/P1/P2 수정 규칙

다음 단계:

~~~text
Local Demo 실제 실행
→ 캡처/PDF 확보
→ 사용자 3~5명 검증
~~~
