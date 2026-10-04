// 최소한의 ZIP 만들기. EPUB은 첫 파일(mimetype)을 압축하지 않고 넣어야 합니다.
// Node 22의 zlib.crc32를 씁니다.

import zlib from "node:zlib";

function dosTime(d = new Date()) {
  return ((d.getSeconds() / 2) | (d.getMinutes() << 5) | (d.getHours() << 11)) & 0xffff;
}
function dosDate(d = new Date()) {
  return (d.getDate() | ((d.getMonth() + 1) << 5) | ((d.getFullYear() - 1980) << 9)) & 0xffff;
}

function u16(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }

export function makeZip(files) {
  const now = new Date();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name.replace(/\\/g, "/"), "utf8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data);
    const store = !!f.store;
    const compressed = store ? data : zlib.deflateRawSync(data, { level: 9 });
    const crc = zlib.crc32(data);
    const flag = 0x0800; // UTF-8 이름
    const method = store ? 0 : 8;
    const local = Buffer.concat([
      Buffer.from("PK\u0003\u0004"), u16(20), u16(flag), u16(method),
      u16(dosTime(now)), u16(dosDate(now)), u32(crc),
      u32(compressed.length), u32(data.length), u16(name.length), u16(0),
      name, compressed,
    ]);
    const central = Buffer.concat([
      Buffer.from("PK\u0001\u0002"), u16(20), u16(20), u16(flag), u16(method),
      u16(dosTime(now)), u16(dosDate(now)), u32(crc),
      u32(compressed.length), u32(data.length), u16(name.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const central = Buffer.concat(centrals);
  const end = Buffer.concat([
    Buffer.from("PK\u0005\u0006"), u16(0), u16(0),
    u16(files.length), u16(files.length),
    u32(central.length), u32(offset), u16(0),
  ]);
  return Buffer.concat([...locals, central, end]);
}
