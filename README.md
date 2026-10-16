# 차곡

원고를 차곡차곡 정리해 구성·편집·미리보기·PDF 출력까지 완성하는 AI publishing studio MVP.

로컬 엔진은 Node + Vanilla HTML/JS + Paged.js이다. 런타임 코드는 `_shared/`, `_template/`, `server/`, `preview-server.mjs`이다.

## Run

```bash
npm install
npm run preview
```

브라우저에서 `http://127.0.0.1:5500/` 을 연다.

## Checks

```bash
npm run check
```

`npm run check`는 기존 안전 게이트, 핵심 JS/MJS 문법, 보호용 168쪽 기준책 해시, 요청 본문 크기 제한을 확인한다.

JSON 요청 본문은 기본 32MB로 제한한다. 로컬 환경에서 조정이 필요한 경우 바이트 단위로 `MAX_JSON_BODY_BYTES` 환경변수를 사용한다.

## Layout

| Path | Role |
|---|---|
| `_shared/` | 실제 런타임 (서재, Editor, Viewer, 폰트) |
| `_template/` | 새 책 골격 |
| `server/` | Import / edit / PDF 엔진 |
| `books/` | 로컬 책. Regression용 `book.html` / `book.css`는 유지 |
| `_docs/` | Product / Engine / QA 명세 |
| `design_handoff_portfolio_ebook/` | Frozen reference. 제품 코드가 아님 |

`books/**/source/` 와 생성된 PDF는 개인 원고·캐시다. 공개 저장소에 다시 올리지 않는다. 현재 브랜치에서 제거해도 Git 과거 이력에 남아 있을 수 있으므로, 외부 공개 전에는 저장소 비공개 전환과 history 정리를 별도로 수행해야 한다.


## Documentation

현재 제품/개발 기준과 문서 우선순위는 `_docs/README.md`에서 시작한다.
