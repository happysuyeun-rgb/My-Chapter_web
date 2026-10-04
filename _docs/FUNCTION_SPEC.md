# My Chapter Function Specification

- Product: My Chapter
- Stage: Development Specification — Function
- Version: 1.0
- Date: 2026-10-03
- Basis: `MY_CHAPTER_PRODUCT_SPEC.md` v1.3, `_docs/M0.5_ENGINE_AUDIT.md`, `_docs/M0.5_CONTENT_AUDIT.md`
- Pair: `_docs/SCREEN_SPEC.md`

이 문서는 **사용자가 어떤 기능을 사용할 수 있는가**만 정한다. API·DB·엔진 내부·구현 순서는 다음 단계다.

---

## 1. Document Purpose

MVP에서 사용자가 할 수 있는 일을 Function ID로 고정한다. 화면은 `SCREEN_SPEC.md`가 담당한다. 한 기능은 여러 화면에서 쓰일 수 있다.

---

## 2. Scope

**상세 명세 (MVP):** Library, New Book, Import, Metadata, Structure, Theme, Generation, Workspace, Editor, Design, Cover, Preview, Ebook PDF, Export Complete.

**개요만 (Later):** Landing, Auth, AI Cover, Pricing. History / Inspection / Print / EPUB / Web ZIP은 엔진 KEEP, 제품에서는 HIDE 또는 Later.

작성하지 않음: API 상세, DB/Supabase, Engine 내부, CSS Token 상세, Route 변경안, Implementation Plan.

---

## 3. Architecture Constraints

뒤집지 않는다.

- Content SoT = `book.html`
- Structured Overlay = `data-eid` + `editable` + `htmltree` + `blocks` (+ 장/부는 `toc.mjs`)
- Structured Book JSON = NOT NOW
- Theme = CSS Token Layer. HTML 의미 구조를 바꾸지 않음
- Pagination / Viewer / PDF = KEEP
- Existing Book Migration = NO
- Import = TXT / MD / PDF / DOCX
- Existing Engine = KEEP / WRAP
- Import는 기본 구조만 만든다. 고급 Component는 Editor에서 확장
- S07 확정 전 destructive write 금지. 원본 원고를 파괴하지 않음
- 생성 진행률은 가짜 Percentage를 만들지 않음
- Auto Save = Later
- AI는 필수 아님. AI Cover = Later

---

## 4. Function ID Convention

```text
F-<AREA>-<NN>
```

| Prefix | Area |
|---|---|
| `F-LIB` | Library |
| `F-NEW` | New Book method |
| `F-IMPORT` | Manuscript import |
| `F-META` | Book metadata |
| `F-STRUCT` | Structure review / confirm |
| `F-THEME` | Theme |
| `F-GEN` | Book generation |
| `F-WS` | Workspace shell |
| `F-EDITOR` | Manuscript editor |
| `F-DESIGN` | Design tab |
| `F-COVER` | Cover |
| `F-PREVIEW` | Preview |
| `F-EXPORT` | Export |
| `F-DONE` | Export complete |
| `F-LAND` / `F-AUTH` / `F-AICOVER` / `F-PAY` | Later |

Existing = 현재 엔진에 있음. New = 제품 흐름에 새로 필요. WRAP = 기존을 감싸거나 노출 위치만 바꿈.

---

## 5. Library Functions

### F-LIB-01 Book 목록

- **기능명:** Book 목록
- **목적:** 작업 공간의 책을 카드로 보여 준다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 서재 진입, 검색/정렬 변경, 생성·복제·휴지통 후 갱신
- **Preconditions:** 워크스페이스 접근 가능
- **Input:** 없음
- **Main Flow:** 책 폴더를 읽어 제목·저자·상태·수정 시각·표지 썸네일을 나열한다.
- **Success Result:** 목록 표시. 책 없으면 EMPTY.
- **Failure Result:** 목록을 읽지 못하면 ERROR.
- **Validation:** `_` / `.`로 시작하는 폴더는 목록에서 제외 (기존).
- **Persistence Timing:** 읽기 전용
- **Existing Engine Dependency:** Existing — `_shared/library.html` 목록
- **Side Effect:** 없음
- **Edge Cases:** `book.json` 없는 책(검증 도서)도 목록에 나온다. 제목과 폴더명이 다를 수 있다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 기존 책이 카드로 보이고, json 없는 책도 열린다.

### F-LIB-02 Book 열기

- **기능명:** Book 열기
- **목적:** 선택한 책을 Workspace로 연다.
- **관련 Screen:** S03 → S10
- **사용자:** 로컬 저자
- **Trigger:** 카드 클릭 / 열기
- **Preconditions:** 해당 `books/<folder>/book.html` 존재
- **Input:** Book Identity (`file` 경로)
- **Main Flow:** 그 책의 `book.html`을 연다. MVP Workspace는 이 열기를 감싼다.
- **Success Result:** S10 원고 탭(기존 Editor/Viewer) 진입
- **Failure Result:** 파일 없으면 오류. 목록 유지
- **Validation:** 경로가 워크스페이스 밖이면 거부 (기존)
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** Existing / WRAP — GET `book.html`
- **Side Effect:** 없음
- **Edge Cases:** 제목 변경 후 폴더를 안 바꿨으면 같은 `file`로 연다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 카드에서 책이 열리고 본문이 보인다.

### F-LIB-03 새 Book 시작

- **기능명:** 새 Book
- **목적:** 제작 마법사를 연다.
- **관련 Screen:** S03 → S04
- **사용자:** 로컬 저자
- **Trigger:** “새 책 만들기”
- **Preconditions:** 없음
- **Input:** 없음
- **Main Flow:** 한 장 대화상자 대신 S04로 간다.
- **Success Result:** S04 DEFAULT
- **Failure Result:** 없음
- **Validation:** 없음
- **Persistence Timing:** 이 시점 디스크 쓰기 없음
- **Existing Engine Dependency:** WRAP — 기존 `#new-dialog`를 마법사로 감쌈
- **Side Effect:** 없음
- **Edge Cases:** 마법사 중 취소하면 서재로 돌아가고 새 폴더가 없어야 한다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 새 책 버튼이 S04로 연결되고, 누르는 것만으로 책이 생기지 않는다.

### F-LIB-04 복제

- **기능명:** Book 복제
- **목적:** 기존 책을 사본 폴더로 복사한다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 카드 복제
- **Preconditions:** 원본 책 존재
- **Input:** 원본 `file`
- **Main Flow:** 폴더를 복사한다. `.history`와 캐시 PDF는 빼는 기존 규칙을 유지한다.
- **Success Result:** 새 카드. 제목에 사본 표시
- **Failure Result:** 복사 실패 메시지. 원본 유지
- **Validation:** 폴더명 충돌 시 고유 이름
- **Persistence Timing:** 즉시 새 폴더
- **Existing Engine Dependency:** Existing — `/__book/duplicate`
- **Side Effect:** 새 `book.json.id` 가능. 원본 불변
- **Edge Cases:** sidecar는 복사된다. 168쪽 설계본도 변환 없이 복사된다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 사본이 목록에 생기고 원본은 그대로다.

### F-LIB-05 휴지통으로 이동

- **기능명:** 휴지통
- **목적:** 책을 서재에서 치우고 복원 가능하게 둔다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 삭제 / 휴지통
- **Preconditions:** 책 존재
- **Input:** `file`
- **Main Flow:** 폴더를 `_trash/`로 옮긴다.
- **Success Result:** 목록에서 사라짐. 휴지통 개수 증가
- **Failure Result:** 이동 실패 시 목록 유지
- **Validation:** 확인 후 실행
- **Persistence Timing:** 즉시 move
- **Existing Engine Dependency:** Existing — `/__book/trash`
- **Side Effect:** `file` 경로가 바뀜
- **Edge Cases:** 열린 Workspace가 있으면 닫거나 막는다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 책이 목록에서 사라지고 휴지통에서 보인다.

### F-LIB-06 휴지통 복원

- **기능명:** 휴지통 복원
- **목적:** 버린 책을 서재로 되돌린다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 휴지통 복원
- **Preconditions:** trash 항목 존재
- **Input:** trash id
- **Main Flow:** `_trash`에서 `books/`로 옮긴다.
- **Success Result:** 목록에 다시 나타남
- **Failure Result:** 복원 실패 메시지
- **Validation:** 폴더명 충돌 처리 (기존)
- **Persistence Timing:** 즉시 move
- **Existing Engine Dependency:** Existing — `/__trash/restore`
- **Side Effect:** 없음
- **Edge Cases:** 같은 제목 폴더가 있으면 기존 규칙대로 이름을 피한다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 복원한 책이 다시 열린다.

### F-LIB-07 영구 삭제

- **기능명:** 휴지통 비우기(항목)
- **목적:** trash 항목을 되돌릴 수 없게 지운다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 영구 삭제
- **Preconditions:** trash 항목 존재
- **Input:** trash id
- **Main Flow:** 확인 후 폴더 삭제
- **Success Result:** 휴지통에서 사라짐
- **Failure Result:** 삭제 실패 메시지
- **Validation:** 명시적 확인
- **Persistence Timing:** 즉시
- **Existing Engine Dependency:** Existing — `/__trash/purge`
- **Side Effect:** 복원 불가
- **Edge Cases:** 실수 방지 확인이 빠지면 실행하지 않는다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 확인 후에만 사라지고 복원되지 않는다.

### F-LIB-08 검색

- **기능명:** 제목·저자 검색
- **목적:** 목록을 걸러 본다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 검색창 입력
- **Preconditions:** 목록 로드됨
- **Input:** 검색어
- **Main Flow:** 제목·저자에 대해 필터
- **Success Result:** 일치 카드만. 없으면 EMPTY SEARCH
- **Failure Result:** 없음
- **Validation:** 빈 문자열은 전체
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** Existing
- **Side Effect:** 없음
- **Edge Cases:** 한글 제목 검색이 동작한다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 제목/저자로 책이 걸러진다.

### F-LIB-09 정렬

- **기능명:** 목록 정렬
- **목적:** 최근/제목/상태로 줄을 바꾼다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 정렬 선택
- **Preconditions:** 목록 존재
- **Input:** recent / title / status
- **Main Flow:** 선택 기준으로 재정렬. 기존처럼 로컬에 정렬 기억을 유지할 수 있다.
- **Success Result:** 순서 변경
- **Failure Result:** 없음
- **Validation:** 허용 값만
- **Persistence Timing:** 정렬 선호만 로컬. 책 파일 아님
- **Existing Engine Dependency:** Existing
- **Side Effect:** 없음
- **Edge Cases:** 상태 없는 책은 draft로 취급해도 된다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 세 정렬이 목록에 반영된다.

### F-LIB-10 상태 표시·변경

- **기능명:** 서재 상태
- **목적:** draft / review / done을 보이고 바꾼다.
- **관련 Screen:** S03
- **사용자:** 로컬 저자
- **Trigger:** 카드 정보 편집
- **Preconditions:** 책 존재
- **Input:** status, 선택 tags
- **Main Flow:** `book.json` 메타를 읽고 쓴다. 본문 HTML을 바꾸지 않는다.
- **Success Result:** 배지 갱신
- **Failure Result:** 저장 실패 시 이전 값
- **Validation:** 세 상태만
- **Persistence Timing:** 확인 시 `book.json`
- **Existing Engine Dependency:** Existing — `/__book/meta`
- **Side Effect:** `book.json` 없는 책에 파일이 생길 수 있음
- **Edge Cases:** 검증 도서에 json이 없어도 열기는 된다. 상태 저장 시 json이 생길 수 있음을 허용.
- **MVP / Later:** MVP
- **Acceptance Summary:** 상태가 카드에 보이고, 바꿔도 본문은 그대로다.

---

## 6. New Book / Import Functions

### F-NEW-01 제작 방식 선택

- **기능명:** 제작 시작
- **목적:** 빈 책 또는 원고 Import를 고른다.
- **관련 Screen:** S04
- **사용자:** 로컬 저자
- **Trigger:** F-LIB-03 이후
- **Preconditions:** 마법사 세션. 디스크에 새 책 없음
- **Input:** `empty` | `import`
- **Main Flow:** empty → S06. import → S05.
- **Success Result:** 다음 화면
- **Failure Result:** 미선택이면 Primary 비활성
- **Validation:** 둘 중 하나
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** New (흐름). 생성 엔진은 아직 호출하지 않음
- **Side Effect:** 없음
- **Edge Cases:** 뒤로 가면 선택 초기화 가능
- **MVP / Later:** MVP
- **Acceptance Summary:** 방식만 고르고 책은 아직 생기지 않는다.

### F-NEW-02 빈 책 경로

- **기능명:** 빈 책으로 시작
- **목적:** Template 골격만 쓰는 경로를 연다.
- **관련 Screen:** S04 → S06 → S08 → S09
- **사용자:** 로컬 저자
- **Trigger:** “빈 책으로 시작”
- **Preconditions:** F-NEW-01 = empty
- **Input:** 없음
- **Main Flow:** S07을 건너뛴다. 메타·테마 후 Template 복사로 생성한다.
- **Success Result:** 생성 후 S10. 샘플 prompt/checklist/figure가 있는 Template
- **Failure Result:** 생성 실패는 F-GEN-04
- **Validation:** 제목 필수 (F-META-01)
- **Persistence Timing:** F-GEN-01에서만 폴더 생성
- **Existing Engine Dependency:** WRAP — `books.create` source 없이
- **Side Effect:** 없음 (확정 전)
- **Edge Cases:** Import를 고쳤다가 empty로 바꾸면 올린 파일은 버려지고 원본 디스크 파일은 건드리지 않는다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 빈 책은 Template 골격으로 열린다.

### F-IMPORT-01 파일 업로드

- **기능명:** 원고 파일 업로드
- **목적:** 지원 파일을 마법사에 넣는다.
- **관련 Screen:** S05
- **사용자:** 로컬 저자
- **Trigger:** 파일 선택 / 드롭
- **Preconditions:** F-NEW-01 = import
- **Input:** 파일 1개
- **Main Flow:** 형식 검증(F-IMPORT-03) 후 파싱(F-IMPORT-04)
- **Success Result:** 파일명·크기 표시. 파싱으로
- **Failure Result:** 미지원/읽기 실패
- **Validation:** 확장자 + 비어 있지 않음
- **Persistence Timing:** 세션 보관. `source/` 쓰기는 생성 확정 후
- **Existing Engine Dependency:** WRAP — 기존 file input
- **Side Effect:** 사용자 원본 경로의 파일을 수정하지 않음
- **Edge Cases:** 대용량 PDF는 시간이 걸릴 수 있다. 진행은 실제 단계로만 표시.
- **MVP / Later:** MVP
- **Acceptance Summary:** TXT/MD/PDF/DOCX를 올릴 수 있고, 원본 파일은 그대로다.

### F-IMPORT-02 원고 붙여넣기

- **기능명:** 원고 붙여넣기
- **목적:** 파일 없이 텍스트로 Import한다.
- **관련 Screen:** S05
- **사용자:** 로컬 저자
- **Trigger:** 붙여넣기 영역 입력
- **Preconditions:** F-NEW-01 = import
- **Input:** 평문 / 마크다운 텍스트
- **Main Flow:** 비어 있지 않으면 TXT/MD와 같은 파서로 보낸다.
- **Success Result:** 파싱 가능
- **Failure Result:** 빈 텍스트 / 본문 없음
- **Validation:** 공백만은 거부
- **Persistence Timing:** 세션. 확정 시 `source/`에 txt로 보관할 수 있음
- **Existing Engine Dependency:** New — 현재 서재는 파일만 받음 (M0.5-A Gap)
- **Side Effect:** 없음
- **Edge Cases:** 파일과 붙여넣기가 둘 다 있으면 마지막 입력이 이긴다. 명시한다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 붙여넣은 글로 구조를 만들 수 있다.

### F-IMPORT-03 지원 Format 검증

- **기능명:** Format 검증
- **목적:** TXT / MD / PDF / DOCX만 받는다.
- **관련 Screen:** S05
- **사용자:** 시스템
- **Trigger:** 업로드
- **Preconditions:** 파일 선택됨
- **Input:** 파일명, 선택 MIME
- **Main Flow:** `SUPPORTED_EXT`와 맞는지 확인
- **Success Result:** 파싱 진행
- **Failure Result:** “TXT, MD, PDF, DOCX만 넣을 수 있어요.”
- **Validation:** `.txt` `.md` `.markdown` `.pdf` `.docx`
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** Existing — `manuscript-import.mjs`
- **Side Effect:** 없음
- **Edge Cases:** `.doc`(구형)은 거부. 스캔 PDF는 파싱 단계에서 실패할 수 있음.
- **MVP / Later:** MVP
- **Acceptance Summary:** 네 형식만 통과한다. PDF는 유지된다.

### F-IMPORT-04 원고 파싱

- **기능명:** Parsing
- **목적:** 원고를 기본 Book Structure로 바꾼다.
- **관련 Screen:** S05 → S07
- **사용자:** 시스템
- **Trigger:** 유효한 파일 또는 붙여넣기
- **Preconditions:** F-IMPORT-03 통과 또는 텍스트 있음
- **Input:** 바이트 또는 텍스트, 작업 제목(있으면)
- **Main Flow:** 기존 parser가 toc / part / chapter / p / h2 / h3 / ul / ol 골격을 만든다. prompt·checklist·figure 등 고급 블록은 만들지 않는다.
- **Success Result:** 구조 초안 + 통계(부/장/문단 수). S07
- **Failure Result:** F-IMPORT-07
- **Validation:** 본문 글이 하나 이상
- **Persistence Timing:** 메모리/세션만. `book.html` 미작성
- **Existing Engine Dependency:** Existing parser, New staging (현재는 create가 바로 씀)
- **Side Effect:** 없음
- **Edge Cases:** PDF 표지·차례 쪽은 기존처럼 빼질 수 있다. DOCX 그림은 버려진다. 표는 텍스트 줄이 될 수 있다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 기본 구조만 나오고 완성 설계본 Component는 강요하지 않는다.

### F-IMPORT-05 원본 원고 보존

- **기능명:** 원본 보관
- **목적:** 확정 후에만 사본을 책 폴더에 둔다.
- **관련 Screen:** S09 (확정 후)
- **사용자:** 시스템
- **Trigger:** F-GEN-01 성공 경로
- **Preconditions:** Import 경로. 원본 바이트 있음
- **Input:** 원본 파일
- **Main Flow:** `books/<folder>/source/<name>`에 복사
- **Success Result:** 원본 사본 존재. 사용자 디스크의 원본은 불변
- **Failure Result:** 책 생성은 됐을 수 있음. 원본 사본 실패는 경고
- **Validation:** 없음
- **Persistence Timing:** 생성 확정 시
- **Existing Engine Dependency:** Existing — `create()`의 `source/`
- **Side Effect:** 책 폴더에만 사본
- **Edge Cases:** 붙여넣기는 `source/원고.txt` 형태로 저장할 수 있다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 확정 전에 `source/`가 생기지 않고, 사용자 원본은 안 지워진다.

### F-IMPORT-06 원고 다시 선택

- **기능명:** 원고 다시 선택
- **목적:** 파싱 결과를 버리고 입력을 다시 한다.
- **관련 Screen:** S07 → S05
- **사용자:** 로컬 저자
- **Trigger:** “원고 다시 선택”
- **Preconditions:** 구조 미확정
- **Input:** 없음
- **Main Flow:** 세션의 파싱 결과를 버린다. 디스크 책 없음
- **Success Result:** S05
- **Failure Result:** 없음
- **Validation:** 미저장 구조 변경이 있으면 확인
- **Persistence Timing:** 쓰기 없음
- **Existing Engine Dependency:** New
- **Side Effect:** 없음
- **Edge Cases:** 제목 등 메타는 유지해도 된다. 명시적으로 유지.
- **MVP / Later:** MVP
- **Acceptance Summary:** 다시 선택해도 기존 책 폴더가 생기지 않았고, 원본 파일도 그대로다.

### F-IMPORT-07 Import 오류

- **기능명:** Import 오류 처리
- **목적:** 실패한 이유를 보여 주고 재시도하게 한다.
- **관련 Screen:** S05, S09
- **사용자:** 로컬 저자
- **Trigger:** 파싱/생성 실패
- **Preconditions:** 시도 후 실패
- **Input:** 엔진 오류 메시지
- **Main Flow:** 사용자 문장으로 표시. 예: 글자 없는 PDF, 본문 없음, 미지원 형식
- **Success Result:** 재업로드/붙여넣기 가능
- **Failure Result:** 같은 화면 ERROR
- **Validation:** 없음
- **Persistence Timing:** 실패 시 책 폴더 없음
- **Existing Engine Dependency:** WRAP — 기존 throw 메시지
- **Side Effect:** 부분 폴더가 생겼다면 생성 실패 시 남기지 않는다 (제품 규칙)
- **Edge Cases:** 스캔 이미지 PDF. 암호 PDF. 빈 문서.
- **MVP / Later:** MVP
- **Acceptance Summary:** 실패해도 서재에 깨진 책이 생기지 않는다.

---

## 7. Metadata Functions

### F-META-01 제목

- **기능명:** 제목
- **목적:** 책 표시 제목을 정한다.
- **관련 Screen:** S06, S10, S12
- **사용자:** 로컬 저자
- **Trigger:** 입력 / 이후 수정
- **Preconditions:** 마법사 또는 열린 책
- **Input:** 비어 있지 않은 문자열
- **Main Flow:** 생성 전에는 세션. 생성 후/기존 책은 전면부 HTML (`updateInfo` 계약)
- **Success Result:** 표지·속표지·판권·`<title>`에 반영 (기존 rewriteFront)
- **Failure Result:** 빈 제목 거부
- **Validation:** trim 후 필수
- **Persistence Timing:** 마법사 = F-GEN-01. 기존 책 = 저장 시 HTML
- **Existing Engine Dependency:** Existing — 제목 필드 / `updateInfo`
- **Side Effect:** 폴더 rename은 기본 하지 않음. Identity(`file`) 유지
- **Edge Cases:** 제목과 폴더명이 다를 수 있다. 허용.
- **MVP / Later:** MVP
- **Acceptance Summary:** 제목이 보이고, 바꿔도 경로 Identity가 함부로 바뀌지 않는다.

### F-META-02 부제

- **기능명:** 부제
- **목적:** 부제를 넣거나 비운다.
- **관련 Screen:** S06, S12
- **사용자:** 로컬 저자
- **Trigger:** 입력
- **Preconditions:** 없음
- **Input:** 선택 문자열
- **Main Flow:** 제목과 같이 전면부에 반영
- **Success Result:** kicker / tp-sub 등 기존 위치에 표시
- **Failure Result:** 없음 (빈 값 허용)
- **Validation:** 없음
- **Persistence Timing:** F-META-01과 같음
- **Existing Engine Dependency:** Existing
- **Side Effect:** 없음
- **Edge Cases:** 빈 부제는 표지에서 비어 보일 수 있다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 부제가 전면에 반영된다.

### F-META-03 저자

- **기능명:** 저자
- **목적:** 저자명을 정한다.
- **관련 Screen:** S06, S12
- **사용자:** 로컬 저자
- **Trigger:** 입력
- **Preconditions:** 없음
- **Input:** 문자열. 비우면 기존처럼 “저자”
- **Main Flow:** 전면부·메타에 반영
- **Success Result:** 표지/판권/서재 카드
- **Failure Result:** 없음
- **Validation:** 없음
- **Persistence Timing:** F-META-01과 같음
- **Existing Engine Dependency:** Existing
- **Side Effect:** 없음
- **Edge Cases:** 서재 검색은 저자명을 쓴다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 저자가 카드와 표지에 같다.

### F-META-04 MVP 기타 메타

- **기능명:** 기타 MVP Metadata
- **목적:** 생성에 필요한 최소 부가 값만 다룬다.
- **관련 Screen:** S06
- **사용자:** 로컬 저자 / 시스템
- **Trigger:** 생성
- **Preconditions:** 제목 있음
- **Input:** 연도·날짜는 시스템 기본값. 태그는 S03에서
- **Main Flow:** Template `{{YEAR}}` `{{DATE}}` 치환. 사용자는 제목/부제/저자만 필수 입력
- **Success Result:** 판권 날짜 채워짐
- **Failure Result:** 없음
- **Validation:** 없음
- **Persistence Timing:** 생성 시
- **Existing Engine Dependency:** Existing Template 치환
- **Side Effect:** 없음
- **Edge Cases:** ISBN·가격은 MVP 없음
- **MVP / Later:** MVP (연도/날짜 자동). ISBN 등은 Later
- **Acceptance Summary:** 사용자는 제목·부제·저자만 넣으면 책이 만들어진다.

---

## 8. Structure Functions

S07 전용. AI 필수 아님. 확정 전 `book.html` 금지.

표시 단위:

- Part
- Chapter (pro / ch / ap / epi 포함)
- Section = 장 안 1차 소제목 (`h2`). Import가 만든 것만. 설계본 STEP/entry가 아님

### F-STRUCT-01 Import 결과 표시

- **기능명:** Import 결과 표시
- **목적:** 파서가 만든 골격을 보여 준다.
- **관련 Screen:** S07
- **사용자:** 로컬 저자
- **Trigger:** F-IMPORT-04 성공
- **Preconditions:** 세션에 구조 초안
- **Input:** 파싱 units
- **Main Flow:** Part / Chapter / Section 트리를 보여 준다. 통계(부·장·문단)
- **Success Result:** 트리 DEFAULT
- **Failure Result:** 비면 EMPTY + 다시 선택
- **Validation:** 최소 장 1
- **Persistence Timing:** 표시만
- **Existing Engine Dependency:** New UI on existing parse output
- **Side Effect:** 없음
- **Edge Cases:** 부 없는 원고. 프롤로그만. 부록만.
- **MVP / Later:** MVP
- **Acceptance Summary:** 장/부/소제목이 보이고, 고급 상자가 없다고 실패가 아니다.

### F-STRUCT-02 제목 수정

- **기능명:** 구조 제목 수정
- **목적:** 부/장/섹션 제목을 고친다.
- **관련 Screen:** S07
- **사용자:** 로컬 저자
- **Trigger:** 항목 인라인 편집
- **Preconditions:** F-STRUCT-01
- **Input:** 새 제목
- **Main Flow:** 세션 구조만 수정. 원본 원고 파일은 그대로.
- **Success Result:** 트리 제목 갱신
- **Failure Result:** 빈 제목 거부
- **Validation:** trim, 비어 있지 않음
- **Persistence Timing:** 세션. 디스크는 F-STRUCT-06 이후
- **Existing Engine Dependency:** New (확정 전). 확정 후 기존 책은 `toc.mjs` / editor
- **Side Effect:** 없음
- **Edge Cases:** 본문 문단은 S07에서 고치지 않는다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 제목만 바뀌고 원본 파일은 그대로다.

### F-STRUCT-03 순서 변경

- **기능명:** 구조 순서 변경
- **목적:** 부/장/섹션 순서를 옮긴다.
- **관련 Screen:** S07
- **사용자:** 로컬 저자
- **Trigger:** 위/아래 또는 드래그
- **Preconditions:** 항목 2개 이상
- **Input:** 대상, 방향
- **Main Flow:** 같은 부모 안에서 이동. 장에 속한 섹션은 그 장 안.
- **Success Result:** 새 순서
- **Failure Result:** 맨 위/아래면 안내
- **Validation:** 에필로그를 본장 앞으로 보내는 것은 막거나 경고
- **Persistence Timing:** 세션
- **Existing Engine Dependency:** New staging. 열린 책의 장 이동은 기존 structure와 별개(S07)
- **Side Effect:** 없음
- **Edge Cases:** 부를 옮기면 아래 장 그룹이 따라갈지 명시: **부가 옮기면 직후 장들이 함께 이동**한다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 순서가 바뀌고 원본 원고 파일은 그대로다.

### F-STRUCT-04 추가

- **기능명:** Part / Chapter / Section 추가
- **목적:** 빈 항목을 끼운다.
- **관련 Screen:** S07, S10 (열린 책은 F-EDITOR-07)
- **사용자:** 로컬 저자
- **Trigger:** 추가 버튼
- **Preconditions:** 구조 초안 또는 열린 책
- **Input:** kind = part | chapter | appendix | section
- **Main Flow:** S07에서는 세션에 빈 제목 항목. 본문은 빈 문단.
- **Success Result:** 트리에 항목
- **Failure Result:** 없음
- **Validation:** 종류 제한
- **Persistence Timing:** S07 = 세션. S10 = 즉시 HTML (기존 structureOp)
- **Existing Engine Dependency:** S07 New. S10 Existing `structureOp` / 블록
- **Side Effect:** S10만 디스크
- **Edge Cases:** S07에서 프롤로그/에필로그는 최대 1 권장.
- **MVP / Later:** MVP
- **Acceptance Summary:** 항목이 생기고, S07에서는 아직 책이 없다.

### F-STRUCT-05 삭제

- **기능명:** 구조 항목 삭제
- **목적:** 부/장/섹션을 뺀다.
- **관련 Screen:** S07
- **사용자:** 로컬 저자
- **Trigger:** 삭제
- **Preconditions:** 장 2개 이상일 때 장 삭제 가능
- **Input:** 대상
- **Main Flow:** 확인 후 세션에서 제거. 마지막 장 삭제는 거부.
- **Success Result:** 트리 갱신
- **Failure Result:** 마지막 장 거부
- **Validation:** 최소 장 1
- **Persistence Timing:** 세션
- **Existing Engine Dependency:** New staging
- **Side Effect:** 원본 파일 불변
- **Edge Cases:** 부 삭제 시 자식 장 처리: **장는 남기고 부 간지만 제거**. 명시.
- **MVP / Later:** MVP
- **Acceptance Summary:** 항목이 빠지고 원본 원고는 살아 있다.

### F-STRUCT-06 구조 확정

- **기능명:** 이 구조로 책 만들기
- **목적:** 세션 구조를 생성 입력으로 잠근다.
- **관련 Screen:** S07 → S08
- **사용자:** 로컬 저자
- **Trigger:** Primary CTA
- **Preconditions:** 장 ≥ 1, 제목 있음(또는 S06에서 이미 있음). 파싱 성공
- **Input:** 세션 구조
- **Main Flow:** 구조를 확정 표시하고 S08로 간다. **이 버튼만으로 `books/`에 쓰지 않는다.** 쓰기는 F-GEN-01.
- **Success Result:** S08. 구조 잠금(수정하려면 S07로 돌아옴)
- **Failure Result:** 장 없음이면 DISABLED
- **Validation:** 장 1+, 모든 장 제목 비어 있지 않음
- **Persistence Timing:** 세션 잠금만
- **Existing Engine Dependency:** New
- **Side Effect:** 없음
- **Edge Cases:** 확정 후 뒤로 가면 잠금 해제 + 확인
- **MVP / Later:** MVP
- **Acceptance Summary:** CTA 직후 서재에 새 카드가 생기지 않는다.

### F-STRUCT-07 열린 책 구조 편집

- **기능명:** Workspace에서 장/부 구조
- **목적:** 이미 있는 책의 장·부록·파트를 더하거나 지운다.
- **관련 Screen:** S10
- **사용자:** 로컬 저자
- **Trigger:** 기존 블록 도구 장 추가/삭제
- **Preconditions:** 책 열림, 편집 모드
- **Input:** op, eid
- **Main Flow:** 기존 `structureOp` + 번호 재매김 + 차례 동기
- **Success Result:** HTML 저장, 리로드+앵커
- **Failure Result:** 마지막 장 삭제 거부 등 기존 메시지
- **Validation:** 기존
- **Persistence Timing:** 즉시 `book.html` + history
- **Existing Engine Dependency:** Existing
- **Side Effect:** 차례·part-list 갱신
- **Edge Cases:** 표지·차례·오프너는 블록 도구로 구조를 바꾸지 않음
- **MVP / Later:** MVP
- **Acceptance Summary:** 열린 책에서 장을 더하고 지울 수 있다.

---

## 9. Theme Functions

S08과 S11은 같은 Theme System.

### F-THEME-01 Theme 목록

- **기능명:** Theme 선택지
- **목적:** Practical / Minimal을 보여 준다.
- **관련 Screen:** S08, S11
- **사용자:** 로컬 저자
- **Trigger:** 화면 진입
- **Preconditions:** 없음
- **Input:** 없음
- **Main Flow:** 두 테마 카드
- **Success Result:** 선택 가능
- **Failure Result:** 없음
- **Validation:** 없음
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** New (제품). CSS는 기존 `:root` 토큰 위
- **Side Effect:** 없음
- **Edge Cases:** 세 번째 테마 없음 (MVP)
- **MVP / Later:** MVP
- **Acceptance Summary:** 두 테마만 보인다.

### F-THEME-02 Theme 선택

- **기능명:** Theme 선택
- **목적:** Practical 또는 Minimal을 고른다.
- **관련 Screen:** S08, S11
- **사용자:** 로컬 저자
- **Trigger:** 카드 클릭
- **Preconditions:** F-THEME-01
- **Input:** `practical` | `minimal`
- **Main Flow:** 선택 상태 + Preview (F-THEME-03)
- **Success Result:** 선택 표시
- **Failure Result:** 없음
- **Validation:** 두 값만
- **Persistence Timing:** 마법사 = 세션. S11 = 적용 시
- **Existing Engine Dependency:** New
- **Side Effect:** 본문 텍스트 불변
- **Edge Cases:** 기본값은 Practical (현재 설계본/Template과 같음)
- **MVP / Later:** MVP
- **Acceptance Summary:** 선택해도 원고 문장이 바뀌지 않는다.

### F-THEME-03 Theme Preview

- **기능명:** Theme Preview
- **목적:** 같은 샘플 스프레드를 두 토큰으로 보여 준다.
- **관련 Screen:** S08, S11
- **사용자:** 로컬 저자
- **Trigger:** 선택 변경
- **Preconditions:** 샘플 또는 현재 책
- **Input:** theme id
- **Main Flow:** 동일 HTML Class Contract에 토큰만 바꿔 보여 준다. S08은 Template 샘플. S11은 현재 책 일부.
- **Success Result:** 미리보기 갱신
- **Failure Result:** 미리보기 실패 시 이름만이라도 선택 유지
- **Validation:** 없음
- **Persistence Timing:** 미리보기는 디스크 아님
- **Existing Engine Dependency:** WRAP — 기존 Paged.js/CSS. 새 엔진 없음
- **Side Effect:** 없음
- **Edge Cases:** 168쪽 전체를 S08에서 나눔하지 않는다. 짧은 샘플.
- **MVP / Later:** MVP
- **Acceptance Summary:** 테마를 바꿔도 미리보기 문장·클래스 의미가 같다.

### F-THEME-04 Book 전체 적용

- **기능명:** Theme 적용
- **목적:** 선택한 토큰을 책 CSS에 적용한다.
- **관련 Screen:** S08→S09, S11
- **사용자:** 로컬 저자
- **Trigger:** 마법사 다음 / S11 적용
- **Preconditions:** theme 선택
- **Input:** theme id
- **Main Flow:** `book.css` 토큰 층만 교체. `book.html` 의미 구조 금지.
- **Success Result:** Preview/PDF가 새 토큰을 씀
- **Failure Result:** 적용 실패 시 이전 테마
- **Validation:** 없음
- **Persistence Timing:** 생성 시 또는 S11 적용 시 `book.css`
- **Existing Engine Dependency:** New token swap on existing CSS
- **Side Effect:** HTML SoT 불변. 이미지 sidecar 불변
- **Edge Cases:** 설계본 168쪽도 변환하지 않고 토큰만 바꿀 수 있다. 강제 마이그레이션 없음.
- **MVP / Later:** MVP
- **Acceptance Summary:** 테마 적용 후 장 수·문장·prompt 수가 같다.

---

## 10. Generation Functions

가짜 % 금지. 실제 단계만.

단계 예: 원고 확인 → Template 복사 → 구조 삽입 → 메타 치환 → Theme 적용 → 완료

### F-GEN-01 생성 시작

- **기능명:** 책 생성
- **목적:** 확정된 입력으로 책 폴더를 만든다.
- **관련 Screen:** S09
- **사용자:** 시스템 (S08 다음 자동 또는 확인)
- **Trigger:** S08 Primary 이후
- **Preconditions:** 제목. empty 또는 (import + 확정 구조 + 원본). theme
- **Input:** 세션 전체
- **Main Flow:** Template 복사, 치환, Import면 toc~본문 삽입, source 보관, theme 적용, `book.json` draft
- **Success Result:** F-GEN-03. `file` 생김
- **Failure Result:** F-GEN-04. 부분 폴더 남기지 않음
- **Validation:** 제목 필수
- **Persistence Timing:** 이 기능이 첫 destructive write
- **Existing Engine Dependency:** WRAP — `books.create` + theme 적용
- **Side Effect:** 서재에 책 등장
- **Edge Cases:** 같은 제목 폴더가 있으면 기존 `uniqueFolder`
- **MVP / Later:** MVP
- **Acceptance Summary:** 성공 시에만 서재에 책이 생긴다.

### F-GEN-02 실제 진행 상태

- **기능명:** 생성 진행
- **목적:** 지금 하는 일을 보여 준다.
- **관련 Screen:** S09
- **사용자:** 로컬 저자
- **Trigger:** F-GEN-01
- **Preconditions:** 생성 중
- **Input:** 엔진 단계
- **Main Flow:** 단계 라벨만. 임의 퍼센트 애니메이션 없음.
- **Success Result:** 단계가 실제로 바뀔 때만 UI 변경
- **Failure Result:** 해당 단계에서 멈춤 + 오류
- **Validation:** 없음
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** New UI. 현재 Job UI 없음
- **Side Effect:** 없음
- **Edge Cases:** PDF 파싱이 길면 “원고 읽는 중”이 유지된다.
- **MVP / Later:** MVP
- **Acceptance Summary:** 가짜 숫자가 없다.

### F-GEN-03 생성 성공

- **기능명:** 생성 성공
- **목적:** Workspace로 보낸다.
- **관련 Screen:** S09 → S10
- **사용자:** 시스템
- **Trigger:** F-GEN-01 성공
- **Preconditions:** `file` 존재
- **Input:** `file`
- **Main Flow:** 짧은 SUCCESS 후 S10 원고 탭
- **Success Result:** 책 열림
- **Failure Result:** 생성은 됐는데 열기 실패면 S03에서 열게 함
- **Validation:** 없음
- **Persistence Timing:** 이미 기록됨
- **Existing Engine Dependency:** WRAP
- **Side Effect:** 마법사 세션 종료
- **Edge Cases:** 없음
- **MVP / Later:** MVP
- **Acceptance Summary:** 새 책이 Workspace에서 열린다.

### F-GEN-04 생성 실패

- **기능명:** 생성 실패
- **목적:** 이유를 보이고 재시도하게 한다.
- **관련 Screen:** S09
- **사용자:** 로컬 저자
- **Trigger:** 생성 오류
- **Preconditions:** F-GEN-01 실패
- **Input:** 오류
- **Main Flow:** ERROR. 재시도 / 이전 / 서재
- **Success Result:** 사용자 선택 가능
- **Failure Result:** 책 없음
- **Validation:** 없음
- **Persistence Timing:** 실패 폴더 없음
- **Existing Engine Dependency:** WRAP
- **Side Effect:** 없음
- **Edge Cases:** 디스크 가득. Chrome과 무관(생성은 HTML).
- **MVP / Later:** MVP
- **Acceptance Summary:** 실패 후 서재에 유령 책이 없다.

### F-GEN-05 재시도

- **기능명:** 생성 재시도
- **목적:** 같은 세션 입력으로 다시 만든다.
- **관련 Screen:** S09
- **사용자:** 로컬 저자
- **Trigger:** 다시 시도
- **Preconditions:** 세션 입력 유지
- **Input:** 동일
- **Main Flow:** F-GEN-01 재실행
- **Success Result:** F-GEN-03
- **Failure Result:** F-GEN-04
- **Validation:** 세션 만료 시 S04부터
- **Persistence Timing:** 성공 시만 쓰기
- **Existing Engine Dependency:** New UI
- **Side Effect:** 없음
- **Edge Cases:** 세션이 없으면 재시도 비활성
- **MVP / Later:** MVP
- **Acceptance Summary:** 같은 원고로 다시 시도할 수 있다.

---

## 11. Workspace / Editor Functions

### F-WS-01 Workspace Shell

- **기능명:** Workspace 셸
- **목적:** 서재·제목·저장 상태·PDF·탭을 한 테두리에 둔다.
- **관련 Screen:** S10
- **사용자:** 로컬 저자
- **Trigger:** F-LIB-02 / F-GEN-03
- **Preconditions:** `file`
- **Input:** `file`
- **Main Flow:** 셸 렌더. 기본 탭 원고
- **Success Result:** 탭 사용 가능
- **Failure Result:** 열기 실패 시 S03
- **Validation:** 없음
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** New shell WRAP. 안쪽은 기존 Editor/Viewer
- **Side Effect:** 없음
- **Edge Cases:** 기존 도구막대와 중복되면 셸 CTA로 모은다. 엔진 내부 재작성 아님
- **MVP / Later:** MVP
- **Acceptance Summary:** 내 서재 / 제목 / 저장 / PDF / 네 탭이 보인다.

### F-WS-02 탭 전환

- **기능명:** 원고·디자인·표지·미리보기 탭
- **목적:** 같은 책의 네 면을 오간다.
- **관련 Screen:** S10, S11, S12, S14
- **사용자:** 로컬 저자
- **Trigger:** 탭 클릭
- **Preconditions:** 책 열림
- **Input:** tab
- **Main Flow:** 원고=Editor, 디자인=S11, 표지=S12, 미리보기=Viewer. 미저장이면 확인 (F-EDITOR-08)
- **Success Result:** 해당 면
- **Failure Result:** 저장 거부 시 탭 유지
- **Validation:** 네 탭만
- **Persistence Timing:** 없음
- **Existing Engine Dependency:** WRAP
- **Side Effect:** 없음
- **Edge Cases:** 미리보기 탭은 저장본을 나눈다. 미저장 글은 안 보일 수 있음 → 저장 권고
- **MVP / Later:** MVP
- **Acceptance Summary:** 탭이 기존 Editor/Viewer를 감싼다.

### F-WS-03 서재로 나가기

- **기능명:** ← 내 서재
- **목적:** 목록으로 돌아간다.
- **관련 Screen:** S10 → S03
- **사용자:** 로컬 저자
- **Trigger:** 뒤로
- **Preconditions:** 없음
- **Input:** 없음
- **Main Flow:** 미저장이면 확인. 기존 Editor 가드와 동일
- **Success Result:** S03
- **Failure Result:** 취소 시 잔류
- **Validation:** 없음
- **Persistence Timing:** 저장을 고르면 F-EDITOR-03
- **Existing Engine Dependency:** Existing 가드 WRAP
- **Side Effect:** 없음
- **Edge Cases:** 없음
- **MVP / Later:** MVP
- **Acceptance Summary:** 미저장이면 물어보고, 저장한 책은 유지된다.

### F-EDITOR-01 편집 모드

- **기능명:** 기존 편집 켜기/끄기
- **목적:** contenteditable로 본문을 고친다.
- **관련 Screen:** S10 원고
- **사용자:** 로컬 저자
- **Trigger:** 편집하기 / 끝내기
- **Preconditions:** eid 주입된 HTML
- **Input:** 없음
- **Main Flow:** 기존 `book_editor.js`
- **Success Result:** 편집 가능 / 보기
- **Failure Result:** 없음
- **Validation:** 없음
- **Persistence Timing:** 켜는 것만으로는 저장 아님
- **Existing Engine Dependency:** Existing KEEP
- **Side Effect:** 없음
- **Edge Cases:** 표지·파트 면은 글자만
- **MVP / Later:** MVP
- **Acceptance Summary:** 기존처럼 문장을 고칠 수 있다.

### F-EDITOR-02 텍스트 패치 저장

- **기능명:** 저장
- **목적:** eid 변경을 `book.html`에 패치한다.
- **관련 Screen:** S10, 셸 저장 버튼
- **사용자:** 로컬 저자
- **Trigger:** 저장 / Ctrl+S
- **Preconditions:** dirty eid
- **Input:** changes[], version sha1
- **Main Flow:** `/__edit` → applyTextEdits → syncTocTitles → commit
- **Success Result:** 저장됨. 쪽 나눔 유지(기존). 저장 시각
- **Failure Result:** 409/오류. 편집 유지
- **Validation:** 중첩 블록/unsafe URL 거부 (기존)
- **Persistence Timing:** 버튼 시 즉시 HTML + history
- **Existing Engine Dependency:** Existing KEEP
- **Side Effect:** 차례 제목 동기 가능
- **Edge Cases:** 버전 충돌 시 새로고침 안내
- **MVP / Later:** MVP
- **Acceptance Summary:** 저장 후 다시 열면 같은 문장이다.

### F-EDITOR-03 저장 상태

- **기능명:** 저장 상태
- **목적:** 저장됨 / 저장 안 함 / 저장 중을 셸에 보여 준다.
- **관련 Screen:** S10
- **사용자:** 로컬 저자
- **Trigger:** dirty 변경, 저장 시작/끝
- **Preconditions:** Workspace
- **Input:** dirty count
- **Main Flow:** 기존 상태 문구를 셸로 올린다.
- **Success Result:** UNSAVED / SAVED / SAVING
- **Failure Result:** 실패 문구
- **Validation:** 없음
- **Persistence Timing:** 표시만
- **Existing Engine Dependency:** Existing WRAP
- **Side Effect:** 없음
- **Edge Cases:** dirty 0이면 저장 버튼 DISABLED
- **MVP / Later:** MVP
- **Acceptance Summary:** 저장 여부가 제목 옆에서 보인다.

### F-EDITOR-04 블록 삽입·이동·삭제

- **기능명:** 구조 요소 편집 (블록)
- **목적:** 기존 팔레트로 블록을 다룬다.
- **관련 Screen:** S10
- **사용자:** 로컬 저자
- **Trigger:** 블록 도구
- **Preconditions:** 장 본문. opener/표지/차례/파트 아님
- **Input:** op, type, eid
- **Main Flow:** 기존 `blocks.mjs` 10종
- **Success Result:** HTML 저장, 리로드+앵커
- **Failure Result:** 기존 거부 메시지
- **Validation:** 기존
- **Persistence Timing:** 즉시
- **Existing Engine Dependency:** Existing. 28종 한 번에 확장하지 않음
- **Side Effect:** 그림 번호 재매김 가능
- **Edge Cases:** 설계본 전용 패턴은 아직 삽입 못 함. 기존 HTML은 삭제되지 않는 한 유지
- **MVP / Later:** MVP (현재 10종). 추가 타입은 Later 점진
- **Acceptance Summary:** p/h2/h3/목록/checklist/prompt/image/table을 넣을 수 있다.

### F-EDITOR-08 미저장 가드

- **기능명:** 미저장 이탈 방지
- **목적:** 닫기·탭·서재 이동 시 묻는다.
- **관련 Screen:** S10
- **사용자:** 로컬 저자
- **Trigger:** beforeunload, 서재 링크, 탭
- **Preconditions:** dirty
- **Input:** 없음
- **Main Flow:** 확인. 저장 실패면 이동 취소
- **Success Result:** 저장 또는 폐기 후 이동
- **Failure Result:** 잔류
- **Validation:** 없음
- **Persistence Timing:** 저장 선택 시 F-EDITOR-02
- **Existing Engine Dependency:** Existing
- **Side Effect:** 없음
- **Edge Cases:** 없음
- **MVP / Later:** MVP
- **Acceptance Summary:** 저장 안 한 채 나가지 않게 막는다.

### F-EDITOR-09 Auto Save

- **기능명:** Auto Save
- **목적:** 주기 저장
- **관련 Screen:** S10
- **MVP / Later:** **Later**
- **Existing Engine Dependency:** Overlay 준비 후. 지금은 없음
- **Acceptance Summary:** MVP에 없음. 수동 저장만.

---

## 12. Cover Functions

### F-COVER-01 기존 표지 표시

- **기능명:** 기존 표지
- **목적:** `section.cover`와 슬롯을 보여 준다.
- **관련 Screen:** S12, S14
- **사용자:** 로컬 저자
- **Trigger:** 표지 탭 / 미리보기 첫 쪽
- **Preconditions:** 책 HTML
- **Input:** 없음
- **Main Flow:** 기존 cover 마크업 + image-slot
- **Success Result:** 표지 보임
- **Failure Result:** 슬롯 비어 있으면 placeholder
- **Validation:** 없음
- **Persistence Timing:** 읽기
- **Existing Engine Dependency:** Existing KEEP
- **Side Effect:** 없음
- **Edge Cases:** 표지 이미지 없어도 책 성립
- **MVP / Later:** MVP
- **Acceptance Summary:** 표지 면이 보인다.

### F-COVER-02 표지 이미지 업로드

- **기능명:** 표지 이미지
- **목적:** `cover-image` 슬롯을 채운다.
- **관련 Screen:** S12
- **사용자:** 로컬 저자
- **Trigger:** 드롭 / 파일
- **Preconditions:** image-slot
- **Input:** png/jpeg/webp/avif
- **Main Flow:** 기존 sidecar 저장
- **Success Result:** 표지에 그림
- **Failure Result:** 형식 거부
- **Validation:** 기존 ACCEPT
- **Persistence Timing:** 즉시 `.image-slots.state.json`. HTML 아님
- **Existing Engine Dependency:** Existing
- **Side Effect:** History 밖 (기존)
- **Edge Cases:** PDF 경로에서는 읽기 전용일 수 있음
- **MVP / Later:** MVP
- **Acceptance Summary:** 올린 그림이 미리보기 표지에 남는다.

### F-COVER-03 표지 제목·부제·저자

- **기능명:** 표지 카피
- **목적:** 표지에서 메타를 고친다.
- **관련 Screen:** S12
- **사용자:** 로컬 저자
- **Trigger:** 필드 편집
- **Preconditions:** 책 열림
- **Input:** title, subtitle, author
- **Main Flow:** F-META-01..03과 동일 데이터. 표지 전용 복제 저장 아님
- **Success Result:** 표지와 판권이 같음
- **Failure Result:** 빈 제목 거부
- **Validation:** 제목 필수
- **Persistence Timing:** 저장 시 HTML
- **Existing Engine Dependency:** Existing rewriteFront WRAP
- **Side Effect:** 폴더명 기본 유지
- **Edge Cases:** 표지 `em`/`br`이 있는 설계본은 글자만 교체하는 기존 규칙을 존중
- **MVP / Later:** MVP
- **Acceptance Summary:** 표지에서 고친 제목이 책 전체와 같다.

### F-COVER-04 표지 색 (기존)

- **기능명:** 표지 색
- **목적:** 기존 coverColor를 유지한다.
- **관련 Screen:** S12
- **사용자:** 로컬 저자
- **Trigger:** 색 선택 (이미 있으면)
- **Preconditions:** 기존 UI
- **Input:** color
- **Main Flow:** 기존 `/__book/meta` cover
- **Success Result:** 표지 색
- **Failure Result:** 실패 시 이전 색
- **Validation:** 없음
- **Persistence Timing:** 즉시
- **Existing Engine Dependency:** Existing
- **Side Effect:** HTML 색 스타일 가능
- **Edge Cases:** Theme과 동시에 쓰이면 Theme 위 오버라이드. MVP는 기존 동작 유지
- **MVP / Later:** MVP (이미 있으면 노출 유지)
- **Acceptance Summary:** 기존 색 기능이 죽지 않는다.

### F-AICOVER-01 AI 표지

- Later. S13. MVP 없음.

---

## 13. Preview Functions

### F-PREVIEW-01 Single

- **기능명:** 한 쪽 보기
- **관련 Screen:** S14
- **Trigger:** Single
- **Main Flow:** 기존 `setMode` single
- **Existing Engine Dependency:** Existing KEEP
- **MVP / Later:** MVP
- **Acceptance Summary:** 한 쪽이 보인다.

### F-PREVIEW-02 Spread

- **기능명:** 펼침 보기
- **관련 Screen:** S14
- **Trigger:** Spread
- **Main Flow:** 기존 spread. 좁은 폭은 기존처럼 single로 접힐 수 있음
- **Existing Engine Dependency:** Existing KEEP
- **MVP / Later:** MVP
- **Acceptance Summary:** 두 쪽이 보인다.

### F-PREVIEW-03 Grid

- **기능명:** 격자 보기
- **관련 Screen:** S14
- **Trigger:** Grid
- **Main Flow:** 기존 `thumb`
- **Existing Engine Dependency:** Existing KEEP
- **MVP / Later:** MVP
- **Acceptance Summary:** 여러 쪽 썸네일이 보인다.

### F-PREVIEW-04 쪽 이동

- **기능명:** Page navigation
- **관련 Screen:** S14
- **Trigger:** 버튼, 키보드, 썸네일, 차례 클릭
- **Main Flow:** 기존 `goToPage` / TOC href
- **Existing Engine Dependency:** Existing KEEP
- **MVP / Later:** MVP
- **Acceptance Summary:** 쪽을 이동할 수 있다.

공통 (01–04): 사용자=저자, Persistence=없음, 새 Preview Engine 없음, 글 저장 후 재나눔 없음(기존). 미저장 글은 안 보일 수 있음.

---

## 14. Export Functions

### F-EXPORT-01 전자책 PDF

- **기능명:** Ebook PDF Export
- **목적:** 화면용 전자책 PDF를 만든다. **제품 Primary.**
- **관련 Screen:** S15, S10 PDF 버튼, S16
- **사용자:** 로컬 저자
- **Trigger:** “전자책 PDF 만들기”
- **Preconditions:** `book.html` 존재. Chrome 사용 가능
- **Input:** `file`. MVP 기본: 전체 책, print 아님, wm 없음
- **Main Flow:** 기존 `/__pdf` + Paged.js + Headless Chrome + pdf-lib
- **Success Result:** S16. 파일 다운로드 가능
- **Failure Result:** Chrome/타임아웃/오류. 책 HTML 유지
- **Validation:** 열린 책
- **Persistence Timing:** 전체 PDF는 기존처럼 책 폴더 캐시 가능
- **Existing Engine Dependency:** Existing KEEP
- **Side Effect:** 임시 Chrome 프로필
- **Edge Cases:** 160쪽+는 시간 필요. 가짜 % 없이 “PDF 만드는 중”
- **MVP / Later:** MVP
- **Acceptance Summary:** 전자책 PDF가 받아진다. Preview와 기본 규칙은 PARTIAL 공유.

### F-EXPORT-02 PDF 다운로드

- **기능명:** PDF 다운로드
- **관련 Screen:** S16
- **Trigger:** 다운로드
- **Main Flow:** 방금 만든 또는 캐시 PDF 제공
- **Existing Engine Dependency:** Existing WRAP
- **MVP / Later:** MVP
- **Acceptance Summary:** 파일이 내려받는다.

### F-EXPORT-03 다시보내기

- **기능명:** 재Export
- **관련 Screen:** S16, S10
- **Trigger:** 다시 만들기
- **Main Flow:** F-EXPORT-01 재실행
- **Existing Engine Dependency:** Existing
- **MVP / Later:** MVP
- **Acceptance Summary:** 최신 저장본으로 다시 만든다.

### F-EXPORT-04 맛보기(장 선택)

- **기능명:** 장 발췌 PDF
- **관련 Screen:** 기존 내보내기 창
- **MVP / Later:** Later / HIDE. 엔진 KEEP
- **Acceptance Summary:** MVP 제품 CTA에 넣지 않는다.

### F-EXPORT-05 인쇄용 PDF

- **Later / HIDE.** 엔진 KEEP (`print=1`). 삭제 금지.

### F-EXPORT-06 EPUB

- **Later / HIDE.** 엔진 KEEP. 삭제 금지.

### F-EXPORT-07 Web ZIP

- **Later / HIDE.** 엔진 KEEP. 삭제 금지.

### F-DONE-01 출력 완료

- **기능명:** 성공 상태
- **목적:** PDF가 끝났음을 알린다.
- **관련 Screen:** S16
- **Trigger:** F-EXPORT-01 성공
- **Main Flow:** 성공, 파일명, 돌아가기/다운로드/재Export
- **Existing Engine Dependency:** New 화면. 엔진은 S15
- **MVP / Later:** MVP
- **Acceptance Summary:** 성공 후 세 행동이 가능하다.

### F-DONE-02 Book으로 돌아가기

- **기능명:** Book으로 돌아가기
- **관련 Screen:** S16 → S10
- **Trigger:** 돌아가기
- **Main Flow:** 같은 `file` Workspace
- **MVP / Later:** MVP
- **Acceptance Summary:** 같은 책이 다시 열린다.

---

## 15. Later Functions

개요만.

| ID | 기능 | Screen | 메모 |
|---|---|---|---|
| F-LAND-01 | 랜딩 소개 | S01 | 마케팅. 엔진 아님 |
| F-AUTH-01 | 로그인/세션 | S02 | M1 기본값 아님 |
| F-AICOVER-01 | AI 표지 | S13 | S12와 분리 |
| F-PAY-01 | 요금/결제 | S17 | |
| F-EDITOR-09 | Auto Save | S10 | |
| F-HIST-01 | History UI | — | KEEP / HIDE |
| F-LINT-01 | Inspection UI | — | KEEP / HIDE |
| F-EXPORT-04..07 | 고급보내기 | S15 | KEEP / HIDE |
| F-EDITOR-10 | blocks 타입 확장 | S10 | 점진. 28종 한 번에 금지 |

---

## 16. Function Traceability Matrix

| Function ID | Function | Screen | MVP/Later | Existing/New |
|---|---|---|---|---|
| F-LIB-01 | Book 목록 | S03 | MVP | Existing |
| F-LIB-02 | Book 열기 | S03→S10 | MVP | Existing / WRAP |
| F-LIB-03 | 새 Book | S03→S04 | MVP | WRAP |
| F-LIB-04 | 복제 | S03 | MVP | Existing |
| F-LIB-05 | 휴지통 | S03 | MVP | Existing |
| F-LIB-06 | 복원 | S03 | MVP | Existing |
| F-LIB-07 | 영구 삭제 | S03 | MVP | Existing |
| F-LIB-08 | 검색 | S03 | MVP | Existing |
| F-LIB-09 | 정렬 | S03 | MVP | Existing |
| F-LIB-10 | 상태 | S03 | MVP | Existing |
| F-NEW-01 | 제작 방식 | S04 | MVP | New |
| F-NEW-02 | 빈 책 경로 | S04 | MVP | WRAP |
| F-IMPORT-01 | 파일 업로드 | S05 | MVP | WRAP |
| F-IMPORT-02 | 붙여넣기 | S05 | MVP | New |
| F-IMPORT-03 | Format 검증 | S05 | MVP | Existing |
| F-IMPORT-04 | Parsing | S05→S07 | MVP | Existing + New staging |
| F-IMPORT-05 | 원본 보관 | S09 | MVP | Existing |
| F-IMPORT-06 | 원고 다시 선택 | S07→S05 | MVP | New |
| F-IMPORT-07 | Import 오류 | S05, S09 | MVP | WRAP |
| F-META-01 | 제목 | S06, S10, S12 | MVP | Existing |
| F-META-02 | 부제 | S06, S12 | MVP | Existing |
| F-META-03 | 저자 | S06, S12 | MVP | Existing |
| F-META-04 | 연도/날짜 등 | S06 | MVP | Existing |
| F-STRUCT-01 | 구조 표시 | S07 | MVP | New |
| F-STRUCT-02 | 제목 수정 | S07 | MVP | New |
| F-STRUCT-03 | 순서 변경 | S07 | MVP | New |
| F-STRUCT-04 | 추가 | S07, S10 | MVP | New / Existing |
| F-STRUCT-05 | 삭제 | S07 | MVP | New |
| F-STRUCT-06 | 구조 확정 | S07→S08 | MVP | New |
| F-STRUCT-07 | 열린 책 구조 | S10 | MVP | Existing |
| F-THEME-01 | Theme 목록 | S08, S11 | MVP | New |
| F-THEME-02 | Theme 선택 | S08, S11 | MVP | New |
| F-THEME-03 | Theme Preview | S08, S11 | MVP | WRAP |
| F-THEME-04 | Theme 적용 | S08, S09, S11 | MVP | New on CSS |
| F-GEN-01 | 생성 | S09 | MVP | WRAP |
| F-GEN-02 | 진행 상태 | S09 | MVP | New |
| F-GEN-03 | 생성 성공 | S09→S10 | MVP | WRAP |
| F-GEN-04 | 생성 실패 | S09 | MVP | New |
| F-GEN-05 | 재시도 | S09 | MVP | New |
| F-WS-01 | Workspace 셸 | S10 | MVP | New WRAP |
| F-WS-02 | 탭 | S10–S14 | MVP | New WRAP |
| F-WS-03 | 서재로 | S10→S03 | MVP | WRAP |
| F-EDITOR-01 | 편집 모드 | S10 | MVP | Existing |
| F-EDITOR-02 | 저장 | S10 | MVP | Existing |
| F-EDITOR-03 | 저장 상태 | S10 | MVP | Existing / WRAP |
| F-EDITOR-04 | 블록 | S10 | MVP | Existing |
| F-EDITOR-08 | 미저장 가드 | S10 | MVP | Existing |
| F-EDITOR-09 | Auto Save | S10 | Later | New |
| F-COVER-01 | 표지 표시 | S12, S14 | MVP | Existing |
| F-COVER-02 | 표지 이미지 | S12 | MVP | Existing |
| F-COVER-03 | 표지 카피 | S12 | MVP | Existing / WRAP |
| F-COVER-04 | 표지 색 | S12 | MVP | Existing |
| F-PREVIEW-01 | Single | S14 | MVP | Existing |
| F-PREVIEW-02 | Spread | S14 | MVP | Existing |
| F-PREVIEW-03 | Grid | S14 | MVP | Existing |
| F-PREVIEW-04 | 쪽 이동 | S14 | MVP | Existing |
| F-EXPORT-01 | 전자책 PDF | S15, S10, S16 | MVP | Existing |
| F-EXPORT-02 | PDF 다운로드 | S16 | MVP | WRAP |
| F-EXPORT-03 | 재Export | S16, S10 | MVP | Existing |
| F-EXPORT-04 | 장 발췌 | — | Later / HIDE | Existing |
| F-EXPORT-05 | Print PDF | — | Later / HIDE | Existing |
| F-EXPORT-06 | EPUB | — | Later / HIDE | Existing |
| F-EXPORT-07 | Web ZIP | — | Later / HIDE | Existing |
| F-DONE-01 | 출력 완료 | S16 | MVP | New |
| F-DONE-02 | Book으로 | S16→S10 | MVP | New |
| F-LAND-01 | Landing | S01 | Later | New |
| F-AUTH-01 | Auth | S02 | Later | New |
| F-AICOVER-01 | AI Cover | S13 | Later | New |
| F-PAY-01 | Pricing | S17 | Later | New |
| F-HIST-01 | History | — | Later / HIDE | Existing |
| F-LINT-01 | Inspection | — | Later / HIDE | Existing |
