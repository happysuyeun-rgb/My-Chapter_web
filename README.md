# My Chapter

원고를 전자책으로 구성·편집·미리보기·PDF 출력하는 AI publishing studio MVP.

로컬 엔진은 Node + Vanilla HTML/JS + Paged.js이다. 런타임 코드는 `_shared/`, `_template/`, `server/`, `preview-server.mjs`이다.

## Run

```bash
npm install
npm run preview
```

브라우저에서 `http://127.0.0.1:5500/` 을 연다.

## Layout

| Path | Role |
|---|---|
| `_shared/` | 실제 런타임 (서재, Editor, Viewer, 폰트) |
| `_template/` | 새 책 골격 |
| `server/` | Import / edit / PDF 엔진 |
| `books/` | 로컬 책. Regression용 `book.html` / `book.css`는 유지 |
| `_docs/` | Product / Engine / QA 명세 |
| `design_handoff_portfolio_ebook/` | Frozen reference. 제품 코드가 아님 |

`books/**/source/` 와 생성된 PDF는 개인 원고·캐시다. 공개 저장소에 다시 올리지 않는다. 이미 history에 있는 파일 제거는 별도 작업이다.
