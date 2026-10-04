// 모든 파일 읽기·쓰기는 작업 공간(workspace)을 거칩니다. 지금은 프로젝트 폴더 하나지만,
// 서비스로 키울 때는 사용자마다 다른 폴더(또는 다른 저장소 구현)를 넘기면 됩니다.

import fs from "node:fs";
import path from "node:path";
import { APP_ROOT, toPosix } from "./util.mjs";

export function createWorkspace(dir = APP_ROOT, { templateDir = path.join(APP_ROOT, "_template") } = {}) {
  const root = path.resolve(dir);
  const inside = (abs, base = root) => abs === base || abs.startsWith(base + path.sep);

  const ws = {
    root,
    booksDir: path.join(root, "books"),
    trashDir: path.join(root, "_trash"),
    templateDir,

    rel: (abs) => toPosix(path.relative(root, abs)),

    // URL·요청에서 온 상대 경로를 작업 공간 밖으로 못 나가게 풀어 줍니다.
    resolve(relPath) {
      let rel;
      try { rel = decodeURIComponent(String(relPath || "")); } catch { return null; }
      const abs = path.normalize(path.join(root, rel));
      return inside(abs) && abs !== root ? abs : null;
    },

    // 편집·출력 대상은 books/ 아래의 HTML만 허용합니다.
    bookHtml(relPath) {
      const abs = ws.resolve(relPath);
      return abs && inside(abs, ws.booksDir) && /\.html?$/i.test(abs) && fs.existsSync(abs) ? abs : null;
    },

    exists: (abs) => fs.existsSync(abs),
    read: (abs, enc = "utf8") => fs.readFileSync(abs, enc),
    write(abs, data) {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, data);
    },
    stat: (abs) => fs.statSync(abs),
    list: (abs) => (fs.existsSync(abs) ? fs.readdirSync(abs, { withFileTypes: true }) : []),
    remove: (abs) => fs.rmSync(abs, { recursive: true, force: true }),
    move(from, to) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.renameSync(from, to);
    },
    // fs.cpSync는 Windows에서 한글 경로로 복사할 때 Node 22를 죽이므로 파일 단위로 복사합니다.
    copyDir(src, dest, skip = () => false) {
      fs.mkdirSync(dest, { recursive: true });
      for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (skip(entry.name)) continue;
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);
        if (entry.isDirectory()) ws.copyDir(from, to, skip);
        else fs.writeFileSync(to, fs.readFileSync(from));
      }
    },
    readJsonFile(abs, fallback = null) {
      try { return JSON.parse(fs.readFileSync(abs, "utf8")); } catch { return fallback; }
    },
    writeJsonFile(abs, obj) {
      ws.write(abs, JSON.stringify(obj, null, 2));
    },
  };
  return ws;
}
