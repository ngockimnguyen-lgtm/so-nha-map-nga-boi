'use strict';

/* Dán URL Web App (kết thúc bằng /exec) của Code.gs vào đây.
   Để trống thì sổ chạy chế độ thử, chỉ lưu trên máy đang mở. */
const API_URL = '';

const BOOK = 'Sổ Nhà Mập Nga Boi';
const KEY = 'snmnb.';
const MEMBERS = [
  { key: 'map', name: 'Mập', c: '#FFB3C7', soft: '#FFE6EC' },
  { key: 'nga', name: 'Nga', c: '#C8B6F2', soft: '#EFE8FD' },
  { key: 'boi', name: 'Boi', c: '#A3DEC9', soft: '#DFF5EC' },
];
const MEM = Object.fromEntries(MEMBERS.map(m => [m.key, m]));
const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WD_LONG = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const HOLIDAYS = {
  '01-01': 'Tết Dương lịch', '02-14': 'Valentine', '03-08': 'Quốc tế Phụ nữ', '04-30': 'Giải phóng miền Nam',
  '05-01': 'Quốc tế Lao động', '06-01': 'Quốc tế Thiếu nhi', '09-02': 'Quốc khánh', '10-20': 'Phụ nữ Việt Nam', '12-24': 'Đêm Giáng sinh',
};

/* ---------- doodle vẽ tay (bút sáp pastel) ---------- */
const P = { pink: '#F29BBE', lav: '#C3A3EC', sky: '#93C7EE', mint: '#93D3A2', peach: '#F7B98A', butter: '#F2D46B', coral: '#F2A0A0', blue: '#A3B9E0', ink: '#7A6A7E' };
const st = (c, w = 6) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const rays = (cx, cy, r1, r2, n, c, w = 5, rot = 0) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2 + rot;
  return `<path ${st(c, w)} d="M${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)} L${(cx + Math.cos(a) * r2).toFixed(1)} ${(cy + Math.sin(a) * r2).toFixed(1)}"/>`;
}).join('');
const petals = (c) => Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
  return `<circle ${st(c)} cx="${(50 + Math.cos(a) * 22).toFixed(1)}" cy="${(50 + Math.sin(a) * 22).toFixed(1)}" r="16"/>`;
}).join('') + `<circle ${st(c)} cx="50" cy="50" r="9"/>`;
const word = (t, c, size = 46) => `<text x="50" y="66" text-anchor="middle" font-family="Patrick Hand, Itim, cursive" font-size="${size}" fill="${c}" stroke="${c}" stroke-width="1.2">${t}</text>`;

const DOODLES = {
  star: { n: 'Ngôi sao', d: `<path ${st(P.butter)} d="M50 10 L61 37 L91 39 L67 57 L76 88 L50 70 L23 87 L33 57 L9 40 L39 37 Z"/>` },
  smile: { n: 'Mặt cười', d: `<circle ${st(P.peach)} cx="50" cy="52" r="38"/><path ${st(P.peach, 7)} d="M37 42 L37 45 M63 42 L63 45"/><path ${st(P.peach)} d="M32 60 Q50 78 68 60"/>` },
  flower: { n: 'Bông hoa', d: petals(P.coral) },
  heart: { n: 'Trái tim', d: `<path ${st(P.pink)} d="M50 84 C20 62 11 44 22 30 C32 17 48 23 50 37 C52 23 68 17 78 30 C89 44 80 62 50 84 Z"/>` },
  heartblue: { n: 'Tim nét', d: `<path ${st(P.blue)} d="M44 84 C20 60 12 40 24 28 C36 18 48 30 50 44 C54 28 68 18 78 28 C88 40 74 62 60 80"/><path ${st(P.blue)} d="M48 40 C46 52 54 52 52 40"/>` },
  cool: { n: 'cool!', d: word('cool!', P.sky) },
  yay: { n: 'yay', d: word('yay!', P.pink) },
  xinh: { n: 'xinh', d: word('xinh', P.lav) },
  love: { n: 'love', d: word('love', P.coral) },
  hihi: { n: 'hihi', d: word('hihi', P.mint) },
  kaomoji: { n: 'Cười mỉm', d: `<path ${st(P.lav, 7)} d="M36 26 L33 44 M54 24 L53 38"/><path ${st(P.lav, 7)} d="M26 60 Q44 88 72 54"/>` },
  coil: { n: 'Lò xo', d: `<path ${st(P.mint)} d="M48 8 C24 14 28 34 48 32 C70 30 70 12 52 16 M48 32 C24 38 28 58 48 56 C70 54 70 36 52 40 M48 56 C24 62 28 82 48 80 C64 78 70 66 60 62 M48 80 C44 88 46 94 52 94"/>` },
  swirl: { n: 'Hoa xoắn', d: `<path ${st(P.pink)} d="M50 52 C57 48 55 39 47 41 C38 43 40 58 51 59 C65 60 67 40 54 32 C39 24 25 38 29 55 C33 73 60 78 73 63 C86 48 78 28 66 22"/>` },
  waves: { n: 'Sóng', d: `<path ${st(P.butter)} d="M8 38 Q20 26 32 38 T56 38 T80 38 T96 34"/><path ${st(P.butter)} d="M14 62 Q26 50 38 62 T62 62 T86 60"/>` },
  arrow: { n: 'Mũi tên', d: `<path ${st(P.blue)} d="M8 62 Q48 40 88 46"/><path ${st(P.blue)} d="M73 33 L90 46 L74 59"/>` },
  burst: { n: 'Lấp lánh', d: rays(50, 50, 20, 36, 10, P.blue, 6) },
  dots: { n: 'Chấm chấm', d: `<circle cx="28" cy="34" r="8" fill="${P.peach}"/><circle cx="66" cy="28" r="5" fill="${P.pink}"/><circle cx="52" cy="70" r="7" fill="${P.butter}"/><circle cx="80" cy="66" r="4" fill="${P.coral}"/>` },
  hash: { n: 'Gạch gạch', d: `<path ${st(P.butter)} d="M34 16 L20 84 M60 14 L44 86 M10 44 L84 30 M12 66 L82 54"/>` },
  check: { n: 'Dấu tick', d: `<path ${st(P.pink, 7)} d="M16 50 C24 58 30 68 38 80 C52 50 66 30 86 16"/>` },
  rainbow: { n: 'Cầu vồng', d: `<path ${st(P.butter)} d="M12 80 A38 38 0 0 1 88 80"/><path ${st(P.butter)} d="M27 80 A23 23 0 0 1 73 80"/><path ${st(P.butter)} d="M41 80 A9 9 0 0 1 59 80"/>` },
  loopy: { n: 'Vòng xoắn', d: `<path ${st(P.pink)} d="M8 88 C30 64 44 40 52 14 C56 40 46 70 38 84 C30 96 24 70 40 56 C56 42 70 54 66 72 C62 86 76 84 92 64"/>` },
  curly: { n: 'Chữ e', d: `<path ${st(P.mint)} d="M8 72 C28 72 52 62 46 48 C40 36 24 50 34 66 C44 80 72 78 94 64"/>` },
  underline: { n: 'Gạch chân', d: `<path ${st(P.blue)} d="M6 62 Q50 54 94 58"/>` },
  cloud: { n: 'Đám mây', d: `<path ${st(P.sky)} d="M24 70 C8 70 8 48 26 48 C26 30 50 26 56 40 C64 28 86 34 82 52 C96 54 94 72 78 72 Z"/>` },
  sun: { n: 'Mặt trời', d: `<circle ${st(P.butter)} cx="50" cy="50" r="17"/>${rays(50, 50, 27, 40, 8, P.butter, 6, 0.2)}` },
  moon: { n: 'Mặt trăng', d: `<path ${st(P.lav)} d="M62 14 C36 18 24 46 34 68 C44 88 70 90 84 76 C62 76 48 60 50 42 C52 28 58 20 62 14 Z"/>` },
  sparkle: { n: 'Sao lấp lánh', d: `<path ${st(P.lav)} d="M50 10 C53 40 60 47 90 50 C60 53 53 60 50 90 C47 60 40 53 10 50 C40 47 47 40 50 10 Z"/>` },
  music: { n: 'Nốt nhạc', d: `<ellipse ${st(P.blue)} cx="32" cy="74" rx="11" ry="9"/><ellipse ${st(P.blue)} cx="70" cy="64" rx="11" ry="9"/><path ${st(P.blue)} d="M43 72 L43 24 L81 14 L81 62 M43 36 L81 26"/>` },
  bow: { n: 'Nơ xinh', d: `<path ${st(P.pink)} d="M50 48 C34 28 12 30 15 48 C18 66 36 64 50 48 C64 32 86 30 85 48 C83 66 64 66 50 48 Z"/><path ${st(P.pink)} d="M46 52 L36 80 M54 52 L64 80"/>` },
  cherry: { n: 'Cherry', d: `<circle ${st(P.coral)} cx="32" cy="72" r="12"/><circle ${st(P.coral)} cx="64" cy="76" r="12"/><path ${st(P.mint)} d="M33 60 C40 38 52 26 66 18 M64 64 C62 46 63 32 66 18 M66 18 C76 10 88 14 90 22 C80 28 72 26 66 18"/>` },
  cat: { n: 'Mèo', d: `<path ${st(P.peach)} d="M24 42 L27 16 L42 30 C47 28 54 28 58 30 L73 16 L76 42 C84 62 70 84 50 84 C30 84 16 62 24 42 Z"/><path ${st(P.peach, 7)} d="M40 52 L40 55 M60 52 L60 55"/><path ${st(P.peach, 4)} d="M46 64 Q50 68 54 64 M14 58 L30 60 M14 68 L30 66 M86 58 L70 60 M86 68 L70 66"/>` },
  plane: { n: 'Máy bay', d: `<path ${st(P.sky)} d="M10 50 L88 20 L64 84 L50 58 Z M50 58 L88 20"/><path ${st(P.sky, 4)} d="M8 80 C20 74 26 82 36 74"/>` },
  camera: { n: 'Máy ảnh', d: `<path ${st(P.lav)} d="M14 34 L32 34 L38 24 L62 24 L68 34 L86 34 L86 78 L14 78 Z"/><circle ${st(P.lav)} cx="50" cy="56" r="14"/>` },
  leaf: { n: 'Lá', d: `<path ${st(P.mint)} d="M18 82 C18 40 46 16 86 16 C86 56 60 82 18 82 Z M18 82 C40 60 58 44 74 30"/>` },
  wink: { n: 'Nháy mắt', d: `<circle ${st(P.mint)} cx="50" cy="52" r="38"/><path ${st(P.mint, 6)} d="M33 44 Q38 40 43 44 M60 40 L60 46"/><path ${st(P.mint)} d="M34 62 Q50 76 66 60"/>` },
};
const DOODLE_KEYS = Object.keys(DOODLES);

const MOODS = {
  vui: { n: 'Vui', d: `<circle cx="50" cy="50" r="40" fill="#FFE6A8"/><path ${st(P.ink, 6)} d="M36 42 L36 46 M64 42 L64 46"/><path ${st(P.ink, 5)} d="M33 60 Q50 76 67 60"/>` },
  thuong: { n: 'Thương', d: `<circle cx="50" cy="50" r="40" fill="#FFD3DF"/><path fill="${P.pink}" d="M36 48 C28 42 30 34 36 37 C42 34 44 42 36 48 Z M64 48 C56 42 58 34 64 37 C70 34 72 42 64 48 Z"/><path ${st(P.ink, 5)} d="M38 62 Q50 72 62 62"/>` },
  phankhich: { n: 'Phấn khích', d: `<circle cx="50" cy="50" r="40" fill="#D7F0E2"/><path ${st(P.ink, 5)} d="M30 42 L38 38 L30 34 M70 42 L62 38 L70 34"/><path fill="#fff" stroke="${P.ink}" stroke-width="5" stroke-linejoin="round" d="M32 56 Q50 84 68 56 Z"/>` },
  buon: { n: 'Buồn', d: `<circle cx="50" cy="50" r="40" fill="#D6E8FA"/><path ${st(P.ink, 6)} d="M36 44 L36 47 M64 44 L64 47"/><path ${st(P.ink, 5)} d="M36 68 Q50 56 64 68"/><path fill="${P.sky}" d="M66 52 C62 60 64 64 67 64 C70 64 72 60 66 52 Z"/>` },
  met: { n: 'Mệt', d: `<circle cx="50" cy="50" r="40" fill="#E8E1F3"/><path ${st(P.ink, 5)} d="M30 44 L42 44 M58 44 L70 44 M40 64 L60 64"/><path ${st(P.lav, 4)} d="M72 16 L82 16 L72 26 L82 26"/>` },
  gian: { n: 'Giận', d: `<circle cx="50" cy="50" r="40" fill="#FFD6CC"/><path ${st(P.ink, 5)} d="M30 36 L42 42 M70 36 L58 42"/><path ${st(P.ink, 6)} d="M37 48 L37 51 M63 48 L63 51"/><path ${st(P.ink, 5)} d="M38 68 Q50 60 62 68"/>` },
};
const WEATHER = {
  nang: { n: 'Nắng', d: DOODLES.sun.d },
  may: { n: 'Mây', d: DOODLES.cloud.d },
  mua: { n: 'Mưa', d: `<path ${st(P.sky)} d="M24 58 C8 58 8 36 26 36 C26 18 50 14 56 28 C64 16 86 22 82 40 C96 42 94 60 78 60 Z"/><path ${st(P.blue, 5)} d="M32 70 L28 82 M50 70 L46 84 M68 70 L64 82"/>` },
  gio: { n: 'Gió', d: `<path ${st(P.mint)} d="M10 40 L62 40 C76 40 76 22 64 22 M10 58 L78 58 C92 58 92 78 78 78 M10 76 L44 76"/>` },
  lanh: { n: 'Lạnh', d: `${rays(50, 50, 0, 38, 6, P.blue, 6)}${rays(50, 50, 20, 30, 6, P.sky, 5, Math.PI / 6)}` },
  cauvong: { n: 'Cầu vồng', d: DOODLES.rainbow.d },
};
const REACTS = ['heart', 'star', 'smile', 'flower'];

const ICON = {
  home: `<path ${st('currentColor', 7)} d="M14 50 L50 18 L86 50 M24 42 L24 84 L76 84 L76 42"/>`,
  cal: `<path ${st('currentColor', 7)} d="M14 24 L86 24 L86 86 L14 86 Z M14 42 L86 42 M32 12 L32 30 M68 12 L68 30"/>`,
  trip: `<path ${st('currentColor', 7)} d="M18 34 L82 34 L82 84 L18 84 Z M38 34 L38 22 L62 22 L62 34 M18 54 L82 54"/>`,
  bucket: `<path ${st('currentColor', 7)} d="M16 50 C24 58 30 68 38 80 C52 50 66 30 86 16"/>`,
  mail: `<path ${st('currentColor', 7)} d="M12 26 L88 26 L88 78 L12 78 Z M12 28 L50 56 L88 28"/>`,
  gear: `${rays(50, 50, 30, 42, 8, 'currentColor', 9)}<circle ${st('currentColor', 7)} cx="50" cy="50" r="18"/>`,
  plus: `<path ${st('currentColor', 9)} d="M50 18 L50 82 M18 50 L82 50"/>`,
  left: `<path ${st('currentColor', 9)} d="M62 18 L30 50 L62 82"/>`,
  right: `<path ${st('currentColor', 9)} d="M38 18 L70 50 L38 82"/>`,
  edit: `<path ${st('currentColor', 7)} d="M20 80 L24 62 L66 20 L80 34 L38 76 Z M58 28 L72 42"/>`,
  trash: `<path ${st('currentColor', 7)} d="M20 28 L80 28 M40 28 L40 16 L60 16 L60 28 M28 28 L32 86 L68 86 L72 28"/>`,
  x: `<path ${st('currentColor', 9)} d="M24 24 L76 76 M76 24 L24 76"/>`,
  lock: `<path ${st('#fff', 8)} d="M30 46 L70 46 L70 82 L30 82 Z M38 46 L38 34 C38 18 62 18 62 34 L62 46"/>`,
  open: `<path ${st('#fff', 8)} d="M24 52 L42 70 L78 30"/>`,
  shuffle: `<path ${st('currentColor', 7)} d="M14 30 L34 30 C56 30 50 70 72 70 L86 70 M74 58 L86 70 L74 82 M14 70 L34 70 C40 70 44 66 47 62 M58 38 C61 34 66 30 72 30 L86 30 M74 18 L86 30 L74 42"/>`,
};

/* ---------- tiện ích ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseD = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
const dmy = s => { if (!s) return ''; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
const longDate = s => { const d = parseD(s); return `${WD_LONG[d.getDay()]}, ${dmy(s)}`; };
const daysUntil = s => Math.round((parseD(s) - parseD(today())) / 86400000);
const money = n => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));
const store = {
  get(k, def) { try { const v = localStorage.getItem(KEY + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* đầy bộ nhớ hoặc chế độ riêng tư */ } },
  del(k) { try { localStorage.removeItem(KEY + k); } catch { /* bỏ qua */ } },
};
function hashStr(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = typeof seed === 'number' ? seed : hashStr(seed); return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function pick(arr, r) { return arr[Math.floor(r() * arr.length)]; }

function svg(inner, cls = '', label = '') {
  const a = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg viewBox="0 0 100 100" class="${cls}" ${a}><g filter="url(#crayon)">${inner}</g></svg>`;
}
const icon = k => `<svg viewBox="0 0 100 100" aria-hidden="true">${ICON[k]}</svg>`;
const doodle = (k, label) => svg((DOODLES[k] || DOODLES.star).d, '', label);
const avatar = (m, cls = '') => `<span class="avatar ${cls}" style="--c:${MEM[m]?.c}" title="${esc(MEM[m]?.name)}">${esc(MEM[m]?.name[0] || '?')}</span>`;
const memStyle = m => `--c:${MEM[m].c};--c-soft:${MEM[m].soft};--soft:${MEM[m].soft};--hl:${MEM[m].soft}`;

// Doodle trang trí sẵn ở lề mỗi trang, cố định theo tên trang.
const SLOTS = [
  { top: 10, right: 16, s: 70 }, { top: 150, left: 20, s: 40, m: 1 }, { top: 330, left: 22, s: 38, m: 1 },
  { top: 520, left: 20, s: 40, m: 1 }, { bottom: 18, right: 26, s: 62 }, { bottom: 90, left: 20, s: 40, m: 1 },
  { top: 64, right: 120, s: 38 }, { bottom: 24, right: 130, s: 40, m: 1 }, { top: 760, left: 22, s: 38, m: 1 },
];
function decor(key) {
  const r = rng('page-' + key);
  const keys = [...DOODLE_KEYS].sort(() => r() - .5);
  return SLOTS.map((s, i) => {
    const pos = ['top', 'bottom', 'left', 'right'].filter(p => s[p] != null).map(p => `${p}:${s[p]}px`).join(';');
    const rot = Math.round((r() - .5) * 40);
    return `<span class="doodle ${s.m ? 'm-hide' : ''}" style="${pos};width:${s.s}px;height:${s.s}px;transform:rotate(${rot}deg)">${doodle(keys[i % keys.length])}</span>`;
  }).join('');
}

// Sticker người dùng chọn, xếp quanh mép thẻ.
function placeStickers(keys, seed) {
  const r = rng(seed || Math.random() * 1e9);
  return keys.slice(0, 12).map((k, i) => {
    const band = i % 3;
    let x, y;
    if (band === 0) { x = 74 + r() * 20; y = 12 + r() * 70; }
    else if (band === 1) { x = 8 + r() * 70; y = 86 + r() * 10; }
    else { x = 30 + r() * 40; y = -4 + r() * 6; }
    return { k, x: Math.round(x), y: Math.round(y), r: Math.round((r() - .5) * 50), s: Math.round(54 + r() * 30) };
  });
}
function stickersHtml(list) {
  return (list || []).filter(s => DOODLES[s.k]).map(s =>
    `<span class="doodle" style="left:${s.x}%;top:${s.y}%;width:${s.s}px;height:${s.s}px;transform:translate(-50%,-50%) rotate(${s.r}deg)">${doodle(s.k)}</span>`).join('');
}

/* ---------- dữ liệu ---------- */
const S = {
  recs: new Map(),
  lastSync: 0,
  me: store.get('me', ''),
  pass: store.get('pass', ''),
  online: true,
  cal: { y: new Date().getFullYear(), m: new Date().getMonth(), view: 'month' },
  diaryYear: {},
};
const all = type => [...S.recs.values()].filter(r => r.type === type);
const notesOf = m => all('note').filter(n => n.owner === m).sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));

function loadCache() {
  const c = store.get('cache', null);
  if (!c || c.api !== API_URL) return;
  S.lastSync = c.lastSync || 0;
  (c.recs || []).forEach(r => S.recs.set(r.id, r));
}
function saveCache() { store.set('cache', { api: API_URL, lastSync: S.lastSync, recs: [...S.recs.values()] }); }
function apply(list) { (list || []).forEach(r => { if (r.deleted) S.recs.delete(r.id); else S.recs.set(r.id, r); }); }

// Chế độ thử: giả lập server trong localStorage.
const demo = {
  db() { return store.get('demo', {}); },
  put(db) { store.set('demo', db); },
  seal(r) { return r.type === 'letter' && r.openDate > today() ? { ...r, body: '', locked: true } : r; },
  run(action, d) {
    const db = this.db();
    const now = Date.now();
    const out = { ok: true, now };
    const mut = (id, fn, del) => { const r = db[id]; if (!r) throw new Error('not_found'); fn(r); r.updatedAt = now; if (del) r._deleted = true; this.put(db); return del ? { id, deleted: true } : this.seal(r); };
    switch (action) {
      case 'ping': return out;
      case 'list': out.records = Object.values(db).map(r => r._deleted ? { id: r.id, deleted: true } : this.seal(r)); return out;
      case 'save': {
        const old = db[d.record.id];
        const rec = { ...d.record, updatedAt: now };
        if (old) { rec.reactions = old.reactions; rec.comments = old.comments; if (rec.type === 'letter' && !rec.body) rec.body = old.body; }
        db[rec.id] = rec; this.put(db); out.record = this.seal(rec); return out;
      }
      case 'delete': out.record = mut(d.id, () => {}, true); return out;
      case 'react': out.record = mut(d.id, r => { r.reactions = r.reactions || {}; const l = r.reactions[d.who] || []; const i = l.indexOf(d.icon); if (i >= 0) l.splice(i, 1); else l.push(d.icon); r.reactions[d.who] = l; }); return out;
      case 'comment': out.record = mut(d.id, r => { (r.comments = r.comments || []).push({ id: uid('c'), who: d.who, text: d.text, at: now }); }); return out;
      case 'uncomment': out.record = mut(d.id, r => { r.comments = (r.comments || []).filter(c => c.id !== d.cid); }); return out;
      case 'upload': out.fileId = 'data:' + d.mime + ';base64,' + d.data; return out;
      default: throw new Error('unknown_action');
    }
  },
};

async function api(action, data = {}) {
  if (!API_URL) return demo.run(action, data);
  const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action, pass: S.pass, ...data }) });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || 'loi');
  return j;
}

let syncing = false;
let syncAgain = 0;
async function sync(full) {
  if (syncing) { syncAgain = full ? 2 : Math.max(syncAgain, 1); return; }
  syncing = true;
  try {
    const j = await api('list', { since: full ? 0 : Math.max(0, S.lastSync - 60000) });
    if (full) S.recs.clear();
    apply(j.records);
    S.lastSync = j.now;
    S.online = true;
    saveCache();
    render();
  } catch (err) {
    S.online = false;
    if (String(err.message) === 'wrong_pass') { store.del('pass'); S.pass = ''; gate(); }
    renderSync();
  } finally {
    syncing = false;
    if (syncAgain) { const f = syncAgain === 2; syncAgain = 0; sync(f); }
  }
}

async function saveRec(rec, msg) {
  const isNew = !S.recs.has(rec.id);
  rec.updatedAt = Date.now();
  S.recs.set(rec.id, rec);
  render();
  try {
    const j = await api('save', { record: rec });
    S.recs.set(rec.id, j.record);
    saveCache();
    render();
    if (msg) toast(msg);
  } catch (err) {
    toast('Chưa lưu được, kiểm tra mạng rồi thử lại nha');
    if (isNew) S.recs.delete(rec.id);
    sync(true);
  }
}
async function delRec(id, msg) {
  const old = S.recs.get(id);
  S.recs.delete(id);
  render();
  try { await api('delete', { id }); saveCache(); if (msg) toast(msg); }
  catch { if (old) S.recs.set(id, old); render(); toast('Chưa xoá được, thử lại nha'); }
}
async function mutateRec(action, payload) {
  try { const j = await api(action, payload); S.recs.set(j.record.id, j.record); saveCache(); render(); }
  catch { toast('Mạng chập chờn, thử lại nha'); }
}

/* ---------- ảnh ---------- */
function photoUrl(p, w = 900) { return p.id.startsWith('data:') ? p.id : `https://lh3.googleusercontent.com/d/${p.id}=w${w}`; }
function resizeImage(file, max) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', .85).split(',')[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('anh_loi')); };
    img.src = url;
  });
}
async function uploadFiles(files, onEach) {
  const out = [];
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue;
    try {
      const data = await resizeImage(f, API_URL ? 1800 : 700);
      const j = await api('upload', { name: f.name.replace(/\.\w+$/, '') + '.jpg', mime: 'image/jpeg', data });
      const p = { id: j.fileId, cap: '' };
      out.push(p);
      onEach && onEach(p, out.length);
    } catch { toast('Có ảnh tải lên chưa được, thử lại ảnh đó nha'); }
  }
  return out;
}
function polaroid(p, i, opts = {}) {
  const r = ((hashStr(p.id) % 9) - 4) * .9;
  return `<figure class="polaroid" style="--r:${r}deg" data-act="view" data-src="${esc(photoUrl(p, 1800))}" data-cap="${esc(p.cap || '')}">
    <img src="${esc(photoUrl(p, 600))}" alt="${esc(p.cap || 'Ảnh kỷ niệm')}" loading="lazy">
    <figcaption>${esc(p.cap || '')}</figcaption>
    ${opts.del ? `<button class="del" data-act="${opts.del}" data-i="${i}" aria-label="Xoá ảnh">${icon('x')}</button>` : ''}
  </figure>`;
}

/* ---------- khung trang ---------- */
const ROUTES = [
  { k: '', n: 'Hôm nay', i: 'home', tab: '#FFF1B8' },
  { k: 'lich', n: 'Lịch', i: 'cal', tab: '#CFE6FF' },
  ...MEMBERS.map(m => ({ k: m.key, n: m.name, m: m.key, tab: m.c })),
  { k: 'chuyen-di', n: 'Chuyến đi', i: 'trip', tab: '#FFD9C2' },
  { k: 'bucket', n: 'Bucket list', i: 'bucket', tab: '#D7F0E2' },
  { k: 'thu', n: 'Thư hẹn giờ', i: 'mail', tab: '#FFE6EC' },
  { k: 'cai-dat', n: 'Cài đặt', i: 'gear', tab: '#EFE8FD' },
];
function route() { const h = location.hash.replace(/^#\/?/, ''); const [a, b] = h.split('/'); return { a: a || '', b: b ? decodeURIComponent(b) : '' }; }

function renderTabs() {
  const { a } = route();
  $('#tabs').innerHTML = ROUTES.map(r => {
    const cur = r.k === a || (r.k === 'chuyen-di' && a === 'chuyen-di');
    const ic = r.m ? avatar(r.m, 'sm') : icon(r.i);
    return `<a class="tab" href="#/${r.k}" style="--tab:${r.tab}" ${cur ? 'aria-current="page"' : ''}>${ic}<span>${esc(r.n)}</span></a>`;
  }).join('');
}

let lastRouteKey = '';
function render() {
  renderTabs();
  const { a, b } = route();
  const views = { '': viewHome, lich: viewCal, 'chuyen-di': viewTrips, bucket: viewBucket, thu: viewLetters, 'cai-dat': viewSettings };
  let html;
  if (MEM[a]) html = viewDiary(a);
  else if (a === 'chuyen-di' && b) html = viewTrip(b);
  else html = (views[a] || viewHome)();
  const page = $('#page');
  const keepScroll = lastRouteKey === a + '/' + b;
  const y = window.scrollY;
  page.innerHTML = decor(a + b) + (API_URL ? '' : `<div class="demo-banner">Đang chạy chế độ thử: dữ liệu chỉ lưu trên máy này. Dán link Web App vào <b>API_URL</b> trong app.js để cả nhà dùng chung.</div>`) + html;
  if (keepScroll) window.scrollTo(0, y);
  else { window.scrollTo(0, 0); lastRouteKey = a + '/' + b; }
  if (S.scrollTo) { const el = document.getElementById(S.scrollTo); S.scrollTo = null; if (el) el.scrollIntoView({ block: 'center' }); }
  renderSync();
}
function renderSync() {
  $$('.sync').forEach(el => {
    el.classList.toggle('off', !S.online);
    el.innerHTML = `<span class="dot"></span>${API_URL ? (S.online ? 'Đã đồng bộ' : 'Đang ngoại tuyến') : 'Chế độ thử'}`;
  });
}
function head(title, sub, right = '', hl = '') {
  return `<header class="page-head"><div><h1 class="page-title" ${hl ? `style="--hl:${hl}"` : ''}><span class="hl">${title}</span></h1>${sub ? `<p class="page-sub">${sub}</p>` : ''}</div><div class="row" style="align-items:center">${right}</div></header>`;
}

/* ---------- Hôm nay ---------- */
function upcomingYearly(withinDays) {
  const t = today();
  const y = Number(t.slice(0, 4));
  const out = [];
  all('event').filter(e => e.yearly).forEach(e => {
    for (const yy of [y, y + 1]) {
      const d = `${yy}-${e.date.slice(5)}`;
      const n = daysUntil(d);
      if (n >= 0 && n <= withinDays && yy >= Number(e.date.slice(0, 4))) { out.push({ e, d, n }); break; }
    }
  });
  return out.sort((a, b) => a.n - b.n);
}
function viewHome() {
  const t = today();
  const md = t.slice(5);
  const me = MEM[S.me];
  const past = all('note').filter(n => n.date.slice(5) === md && n.date < t.slice(0, 4)).sort((a, b) => b.date.localeCompare(a.date));
  const pastTrips = all('trip').filter(tr => tr.start && tr.start.slice(5) === md && tr.start.slice(0, 4) < t.slice(0, 4));
  const nextTrip = all('trip').filter(tr => tr.start && tr.start > t).sort((a, b) => a.start.localeCompare(b.start))[0];
  const yearly = upcomingYearly(45);
  const letters = all('letter').filter(l => (l.to === 'all' || l.to === S.me || l.from === S.me));
  const soon = letters.filter(l => l.locked && daysUntil(l.openDate) <= 30).sort((a, b) => a.openDate.localeCompare(b.openDate));
  const justOpened = letters.filter(l => !l.locked && daysUntil(l.openDate) >= -7 && daysUntil(l.openDate) <= 0);
  const recent = all('note').sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 4);

  return `
  ${head(esc(BOOK), `${longDate(t)} · <span class="sync"></span>`, `<div class="stickers-row">${doodle('heart')}${doodle('star')}${doodle('flower')}</div>`)}
  <p class="hand" style="margin:-8px 0 18px">Chào ${me ? esc(me.name) : 'cả nhà'}! Hôm nay có gì vui kể sổ nghe đi.</p>
  <div class="member-cards">
    ${MEMBERS.map(m => {
      const ns = notesOf(m.key);
      return `<a class="member-card" href="#/${m.key}" style="${memStyle(m.key)}">${avatar(m.key)}<div><b>${esc(m.name)}</b><span>${ns.length} trang nhật ký${ns[0] ? ` · gần nhất ${dmy(ns[0].date)}` : ''}</span></div></a>`;
    }).join('')}
  </div>
  ${S.me ? `<div style="margin-top:16px"><button class="btn" data-act="new-note" data-date="${t}">${icon('edit')} Viết nhật ký hôm nay</button></div>` : ''}

  <section class="section">
    <h2 class="section-title">${doodle('moon')} Ngày này năm xưa</h2>
    ${past.length || pastTrips.length ? `<div class="grid-2">
      ${past.map(n => `<a class="card memory-card" href="#/${n.owner}" data-act="goto-entry" data-id="${n.id}" style="text-decoration:none;color:inherit"><span class="tape"></span>
        <div class="memory-year">${n.date.slice(0, 4)} · ${Number(t.slice(0, 4)) - Number(n.date.slice(0, 4))} năm trước · ${esc(MEM[n.owner]?.name)}</div>
        <h3 style="margin:6px 0">${esc(n.title || 'Một ngày không tên')}</h3>
        <p class="hand" style="margin:0">${esc((n.body || '').slice(0, 120))}${(n.body || '').length > 120 ? '…' : ''}</p></a>`).join('')}
      ${pastTrips.map(tr => `<a class="card memory-card" href="#/chuyen-di/${tr.id}" style="text-decoration:none;color:inherit"><span class="tape" style="--tape:#CFE6FF"></span>
        <div class="memory-year">${tr.start.slice(0, 4)} · chuyến đi</div><h3 style="margin:6px 0">${esc(tr.title)}</h3><p class="hand" style="margin:0">${esc(tr.place || '')}</p></a>`).join('')}
    </div>` : `<p class="empty">Chưa có kỷ niệm nào vào ngày ${dmy(t).slice(0, 5)} các năm trước. Viết hôm nay đi, năm sau mở lại sẽ thấy.</p>`}
  </section>

  <section class="section">
    <h2 class="section-title">${doodle('sparkle')} Sắp tới</h2>
    <div class="grid-2">
      ${nextTrip ? `<a class="card" href="#/chuyen-di/${nextTrip.id}" style="text-decoration:none;color:inherit;background:var(--boi-soft)"><span class="tape" style="--tape:#A3DEC9"></span>
        <div class="muted">Chuyến đi tiếp theo</div><div class="count-big">còn ${daysUntil(nextTrip.start)} ngày</div><h3 style="margin-top:6px">${esc(nextTrip.title)}</h3><p class="hand" style="margin:0">${dmy(nextTrip.start)}${nextTrip.place ? ' · ' + esc(nextTrip.place) : ''}</p></a>` : ''}
      ${yearly.map(({ e, d, n }) => `<div class="card" style="background:var(--map-soft)"><span class="tape"></span>
        <div class="muted">${e.kind === 'bday' ? 'Sinh nhật' : 'Kỷ niệm'} · ${dmy(d).slice(0, 5)}</div><div class="count-big">${n === 0 ? 'hôm nay!' : `còn ${n} ngày`}</div><h3 style="margin-top:6px">${esc(e.title)}</h3></div>`).join('')}
      ${soon.map(l => `<a class="card" href="#/thu" style="text-decoration:none;color:inherit;background:#FFF1D6"><span class="tape" style="--tape:#F7B98A"></span>
        <div class="muted">Thư hẹn giờ của ${esc(MEM[l.from]?.name)}</div><div class="count-big">${daysUntil(l.openDate) === 0 ? 'mở hôm nay' : `còn ${daysUntil(l.openDate)} ngày`}</div><p class="hand" style="margin:6px 0 0">gửi ${l.to === 'all' ? 'cả nhà' : esc(MEM[l.to]?.name)}</p></a>`).join('')}
      ${justOpened.map(l => `<a class="card" href="#/thu" style="text-decoration:none;color:inherit;background:#FFF1D6"><span class="tape" style="--tape:#F7B98A"></span>
        <div class="muted">Vừa mở khoá</div><h3 style="margin-top:6px">${esc(l.title || 'Thư của ' + (MEM[l.from]?.name || ''))}</h3><p class="hand" style="margin:0">Vào mục Thư hẹn giờ đọc nha</p></a>`).join('')}
    </div>
    ${!nextTrip && !yearly.length && !soon.length && !justOpened.length ? `<p class="empty">Chưa có gì sắp tới. Thêm sinh nhật ở mục Lịch, lên kế hoạch chuyến đi, hoặc viết một lá thư hẹn giờ.</p>` : ''}
  </section>

  <section class="section">
    <h2 class="section-title">${doodle('heart')} Mới viết gần đây</h2>
    ${recent.length ? `<div class="grid-2">${recent.map(n => `<a class="card" href="#/${n.owner}" data-act="goto-entry" data-id="${n.id}" style="text-decoration:none;color:inherit;${memStyle(n.owner)};background:var(--soft)">
      <div class="row" style="align-items:center;gap:8px">${avatar(n.owner, 'sm')}<span class="muted">${dmy(n.date)}</span></div>
      <h3 style="margin:8px 0 4px">${esc(n.title || 'Không tên')}</h3><p class="hand" style="margin:0">${esc((n.body || '').slice(0, 90))}${(n.body || '').length > 90 ? '…' : ''}</p></a>`).join('')}</div>` : `<p class="empty">Sổ còn trắng tinh. Ai viết trang đầu tiên đây?</p>`}
  </section>`;
}

/* ---------- Lịch ---------- */
function calIndex(y) {
  const idx = {};
  const at = d => (idx[d] = idx[d] || { notes: new Set(), events: [], trips: [] });
  all('note').forEach(n => { if (n.date.startsWith(y + '-')) at(n.date).notes.add(n.owner); });
  all('event').forEach(e => {
    if (e.yearly) { if (Number(e.date.slice(0, 4)) <= y) at(`${y}-${e.date.slice(5)}`).events.push(e); }
    else if (e.date.startsWith(y + '-')) at(e.date).events.push(e);
  });
  all('trip').forEach(tr => {
    if (!tr.start) return;
    const end = tr.end && tr.end >= tr.start ? tr.end : tr.start;
    for (let d = parseD(tr.start), i = 0; ymd(d) <= end && i < 60; d.setDate(d.getDate() + 1), i++) {
      if (d.getFullYear() === y) at(ymd(d)).trips.push(tr);
    }
  });
  return idx;
}
function viewCal() {
  const { y, m, view } = S.cal;
  const idx = calIndex(y);
  const bar = `<div class="cal-bar">
    <div class="year-nav"><button class="round" data-act="year" data-d="-1" aria-label="Năm trước">${icon('left')}</button>
      <input type="number" value="${y}" min="1900" max="9999" data-act-input="year-set" aria-label="Năm"><button class="round" data-act="year" data-d="1" aria-label="Năm sau">${icon('right')}</button></div>
    <div class="seg"><button data-act="cal-view" data-v="month" aria-pressed="${view === 'month'}">Tháng</button><button data-act="cal-view" data-v="year" aria-pressed="${view === 'year'}">Cả năm</button></div>
    <button class="btn ghost small" data-act="cal-today">Hôm nay</button>
    <button class="btn small" data-act="new-event">${icon('plus')} Sinh nhật, sự kiện</button>
  </div>`;
  if (view === 'year') {
    return head('Lịch nhà mình', 'Chọn năm nào cũng được, lịch tự sinh mãi mãi') + bar + `<div class="year-grid">${Array.from({ length: 12 }, (_, mm) => miniMonth(y, mm, idx)).join('')}</div>`;
  }
  return head('Lịch nhà mình', 'Chấm màu là ai đã viết nhật ký ngày đó') + bar +
    `<div class="months-strip" style="margin-bottom:14px">${Array.from({ length: 12 }, (_, mm) => `<button data-act="month" data-m="${mm}" aria-pressed="${mm === m}">Th ${mm + 1}</button>`).join('')}</div>` +
    monthGrid(y, m, idx) +
    `<p class="muted" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:14px">${MEMBERS.map(mb => `<span><span class="dot" style="--c:${mb.c}"></span> ${esc(mb.name)}</span>`).join('')}</p>`;
}
function monthGrid(y, m, idx) {
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const n = new Date(y, m + 1, 0).getDate();
  const t = today();
  const cells = [];
  for (let i = 0; i < first; i++) { const d = new Date(y, m, i - first + 1); cells.push(dayCell(d, idx, true, t)); }
  for (let i = 1; i <= n; i++) cells.push(dayCell(new Date(y, m, i), idx, false, t));
  while (cells.length % 7) { const d = new Date(y, m, n + (cells.length % 7 ? cells.length - first - n + 1 : 1)); cells.push(dayCell(d, idx, true, t)); }
  return `<div class="month"><div class="month-name">Tháng ${m + 1}, ${y}</div>
    <div class="wd">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(w => `<span>${w}</span>`).join('')}</div>
    <div class="days">${cells.join('')}</div></div>`;
}
function dayCell(d, idx, out, t) {
  const s = ymd(d);
  const x = idx[s] || { notes: new Set(), events: [], trips: [] };
  const hol = HOLIDAYS[s.slice(5)];
  const evs = [
    ...x.events.map(e => `<span class="ev ${e.kind === 'bday' ? 'bday' : ''}">${esc(e.title)}</span>`),
    ...x.trips.slice(0, 1).map(tr => `<span class="ev trip">${esc(tr.title)}</span>`),
    ...(hol ? [`<span class="ev holiday">${esc(hol)}</span>`] : []),
  ];
  return `<button class="day ${out ? 'out' : ''} ${s === t ? 'today' : ''} ${d.getDay() === 0 ? 'sun' : ''}" data-act="day" data-d="${s}" aria-label="${longDate(s)}">
    <span class="num">${d.getDate()}</span><span class="marks">${[...x.notes].map(o => `<span class="dot" style="--c:${MEM[o]?.c}"></span>`).join('')}</span>${evs.slice(0, 2).join('')}</button>`;
}
function miniMonth(y, m, idx) {
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const n = new Date(y, m + 1, 0).getDate();
  const t = today();
  let cells = '<span></span>'.repeat(first);
  for (let i = 1; i <= n; i++) {
    const s = `${y}-${pad(m + 1)}-${pad(i)}`;
    const x = idx[s];
    const has = x && (x.notes.size || x.events.length || x.trips.length);
    cells += `<span class="md ${has ? 'has' : ''} ${s === t ? 'today' : ''}">${i}</span>`;
  }
  return `<button class="mini" data-act="month" data-m="${m}" data-go="1"><h3>Tháng ${m + 1}</h3><div class="wd">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(w => `<span>${w}</span>`).join('')}</div><div class="days">${cells}</div></button>`;
}
function openDay(s) {
  const y = Number(s.slice(0, 4));
  const x = calIndex(y)[s] || { notes: new Set(), events: [], trips: [] };
  const notes = all('note').filter(n => n.date === s);
  const hol = HOLIDAYS[s.slice(5)];
  modal(`<h2>${longDate(s)}</h2>
    ${hol ? `<p class="chip" style="--chip:#F4F1E6">${esc(hol)}</p>` : ''}
    ${x.events.map(e => `<div class="row" style="align-items:center;margin:8px 0"><span class="chip" style="--chip:${e.kind === 'bday' ? '#FFE6EC' : '#CFE6FF'}">${e.kind === 'bday' ? 'Sinh nhật' : 'Sự kiện'}${e.yearly ? ' · hằng năm' : ''}</span><b>${esc(e.title)}</b>
      <span style="margin-left:auto"><button class="icon-btn" data-act="edit-event" data-id="${e.id}" aria-label="Sửa">${icon('edit')}</button></span></div>`).join('')}
    ${x.trips.map(tr => `<p><a href="#/chuyen-di/${tr.id}" data-act="close">Chuyến đi: <b>${esc(tr.title)}</b></a></p>`).join('')}
    ${notes.length ? notes.map(n => `<p class="row" style="align-items:center">${avatar(n.owner, 'sm')}<a href="#/${n.owner}" data-act="goto-entry" data-id="${n.id}">${esc(n.title || 'Nhật ký của ' + MEM[n.owner].name)}</a></p>`).join('') : `<p class="empty" style="padding:6px 0">Chưa ai viết nhật ký ngày này.</p>`}
    <div class="actions">
      <button class="btn ghost" data-act="new-event" data-date="${s}">${icon('plus')} Thêm sự kiện</button>
      ${S.me ? `<button class="btn" data-act="new-note" data-date="${s}">${icon('edit')} Viết nhật ký ngày này</button>` : ''}
    </div>`);
}
function eventEditor(ev, date) {
  const e = ev || { id: uid('e'), type: 'event', title: '', date: date || today(), yearly: false, kind: 'event', by: S.me };
  modal(`<h2>${ev ? 'Sửa' : 'Thêm'} sự kiện</h2>
    <form id="f">
      <label class="field"><span>Tên</span><input name="title" required maxlength="80" value="${esc(e.title)}" placeholder="Sinh nhật Nga, kỷ niệm quen nhau..."></label>
      <div class="row">
        <label class="field"><span>Ngày</span><input type="date" name="date" required value="${e.date}"></label>
        <label class="field"><span>Loại</span><select name="kind"><option value="event" ${e.kind !== 'bday' ? 'selected' : ''}>Sự kiện, kỷ niệm</option><option value="bday" ${e.kind === 'bday' ? 'selected' : ''}>Sinh nhật</option></select></label>
      </div>
      <div class="who-pick" style="margin-bottom:14px"><label><input type="checkbox" name="yearly" ${e.yearly || e.kind === 'bday' ? 'checked' : ''}> Lặp lại mỗi năm</label></div>
      <div class="actions">${ev ? `<button type="button" class="btn danger left" data-act="del-event" data-id="${e.id}">${icon('trash')} Xoá</button>` : ''}
        <button type="button" class="btn ghost" data-act="close">Huỷ</button><button class="btn">Lưu</button></div>
    </form>`);
  $('#f').onsubmit = ev2 => {
    ev2.preventDefault();
    const f = new FormData(ev2.target);
    const kind = f.get('kind');
    closeModal();
    saveRec({ ...e, title: f.get('title').trim(), date: f.get('date'), kind, yearly: kind === 'bday' || !!f.get('yearly') }, 'Đã ghi vào lịch');
  };
}

/* ---------- Nhật ký ---------- */
function viewDiary(m) {
  const mb = MEM[m];
  const ns = notesOf(m);
  const years = [...new Set(ns.map(n => n.date.slice(0, 4)))];
  const fy = S.diaryYear[m] || '';
  const list = fy ? ns.filter(n => n.date.startsWith(fy)) : ns;
  const isMe = S.me === m;
  let lastMonth = '';
  const items = list.map(n => {
    const mk = n.date.slice(0, 7);
    const div = mk !== lastMonth ? `<div class="month-divider">Tháng ${Number(mk.slice(5))}, ${mk.slice(0, 4)}</div>` : '';
    lastMonth = mk;
    return div + entryHtml(n);
  }).join('');
  return `<div style="${memStyle(m)}">
    ${head(`Nhật ký của ${esc(mb.name)}`, `${ns.length} trang${ns[0] ? ` · viết gần nhất ${dmy(ns[0].date)}` : ''}${isMe ? '' : ` · đây là sổ của ${esc(mb.name)}, mình đọc và thả tim nha`}`,
      isMe ? `<button class="btn" data-act="new-note">${icon('edit')} Viết trang mới</button>` : avatar(m), mb.soft)}
    ${years.length > 1 ? `<div class="months-strip"><button data-act="diary-year" data-m="${m}" data-y="" aria-pressed="${!fy}">Tất cả</button>${years.map(y => `<button data-act="diary-year" data-m="${m}" data-y="${y}" aria-pressed="${fy === y}">${y}</button>`).join('')}</div>` : ''}
    ${items || `<p class="empty">${isMe ? 'Trang đầu tiên đang chờ bạn đó. Bấm "Viết trang mới" nha.' : `${esc(mb.name)} chưa viết trang nào.`}</p>`}
  </div>`;
}
function entryHtml(n) {
  const own = S.me === n.owner;
  return `<article class="entry" id="e-${n.id}">
    ${stickersHtml(n.stickers)}
    <div class="entry-top">
      <span class="entry-date">${longDate(n.date)}</span>
      ${n.mood && MOODS[n.mood] ? `<span class="mood" title="${MOODS[n.mood].n}">${svg(MOODS[n.mood].d, '', MOODS[n.mood].n)}</span>` : ''}
      ${n.weather && WEATHER[n.weather] ? `<span class="weather" title="${WEATHER[n.weather].n}">${svg(WEATHER[n.weather].d, '', WEATHER[n.weather].n)}</span>` : ''}
      ${own ? `<span class="entry-tools"><button class="icon-btn" data-act="edit-note" data-id="${n.id}" aria-label="Sửa">${icon('edit')}</button><button class="icon-btn" data-act="del-note" data-id="${n.id}" aria-label="Xoá">${icon('trash')}</button></span>` : ''}
    </div>
    ${n.title ? `<h2 class="entry-title">${esc(n.title)}</h2>` : ''}
    <p class="entry-body">${esc(n.body)}</p>
    ${n.photos && n.photos.length ? `<div class="photos">${n.photos.map((p, i) => polaroid(p, i)).join('')}</div>` : ''}
    ${reactsHtml(n)}
    ${commentsHtml(n)}
  </article>`;
}
function reactsHtml(r) {
  const re = r.reactions || {};
  return `<div class="reacts">${REACTS.map(k => {
    const who = MEMBERS.filter(m => (re[m.key] || []).includes(k));
    const on = who.some(m => m.key === S.me);
    return `<button class="react ${on ? 'on' : ''}" data-act="react" data-id="${r.id}" data-icon="${k}" aria-pressed="${on}" aria-label="${DOODLES[k].n}" style="${S.me ? `--me:${MEM[S.me].c};--me-soft:${MEM[S.me].soft}` : ''}">${doodle(k)}<span class="who">${who.map(m => `<span class="dot" style="--c:${m.c}" title="${esc(m.name)}"></span>`).join('')}</span></button>`;
  }).join('')}</div>`;
}
function commentsHtml(r) {
  const cs = r.comments || [];
  return `${cs.length ? `<div class="notes">${cs.map(c => `<div class="sticky" style="${MEM[c.who] ? memStyle(c.who) : ''};--r:${((hashStr(c.id) % 7) - 3) * .8}deg"><b>${esc(MEM[c.who]?.name || '?')} viết:</b>${esc(c.text)}
    ${c.who === S.me ? `<button class="icon-btn x" data-act="uncomment" data-id="${r.id}" data-cid="${c.id}" aria-label="Xoá lời nhắn">${icon('x')}</button>` : ''}</div>`).join('')}</div>` : ''}
    ${S.me ? `<form class="add-note" data-form="comment" data-id="${r.id}"><input name="t" maxlength="300" placeholder="Viết lời bên lề..." aria-label="Lời nhắn"><button class="btn small">Dán</button></form>` : ''}`;
}

// Bộ chọn dùng chung cho các popup soạn thảo
function stickerPicker(sel) {
  return `<div class="field"><span>Sticker dán lên trang (chọn tối đa 12)</span><div class="sticker-picker">${DOODLE_KEYS.map(k => `<button type="button" data-pick-sticker="${k}" aria-pressed="${sel.includes(k)}" title="${esc(DOODLES[k].n)}">${doodle(k)}</button>`).join('')}</div></div>`;
}
function bindStickerPicker(sel) {
  $$('[data-pick-sticker]').forEach(b => b.onclick = () => {
    const k = b.dataset.pickSticker;
    const i = sel.indexOf(k);
    if (i >= 0) sel.splice(i, 1); else if (sel.length < 12) sel.push(k); else toast('Tối đa 12 sticker một trang nha');
    b.setAttribute('aria-pressed', sel.includes(k));
  });
}
function photoField(photos, label = 'Ảnh') {
  return `<div class="field"><span>${label}</span>
    <label class="btn ghost small" style="align-self:flex-start">${icon('plus')} Chọn ảnh<input type="file" accept="image/*" multiple hidden id="pf"></label>
    <div class="upload-list" id="pl"></div></div>`;
}
function bindPhotoField(photos, state) {
  const draw = () => {
    $('#pl').innerHTML = photos.map((p, i) => `<div class="polaroid" style="--r:${(i % 3 - 1) * 2}deg"><img src="${esc(photoUrl(p, 300))}" alt=""><input value="${esc(p.cap || '')}" data-cap="${i}" placeholder="chú thích" aria-label="Chú thích ảnh"><button type="button" class="del" data-rm="${i}" aria-label="Bỏ ảnh">${icon('x')}</button></div>`).join('') +
      (state.uploading ? `<div class="chip">Đang tải ${state.uploading} ảnh…</div>` : '');
    $$('[data-cap]').forEach(inp => inp.oninput = () => { photos[inp.dataset.cap].cap = inp.value; });
    $$('[data-rm]').forEach(b => b.onclick = () => { photos.splice(Number(b.dataset.rm), 1); draw(); });
  };
  $('#pf').onchange = async e => {
    const files = [...e.target.files];
    e.target.value = '';
    state.uploading = files.length;
    draw();
    await uploadFiles(files, p => { photos.push(p); state.uploading--; draw(); });
    state.uploading = 0;
    draw();
  };
  draw();
}
function pickerRow(name, dict, val) {
  return `<div class="field"><span>${name === 'mood' ? 'Tâm trạng' : 'Thời tiết'}</span><div class="picker">${Object.entries(dict).map(([k, v]) => `<button type="button" data-pick="${name}" data-v="${k}" aria-pressed="${val === k}" title="${v.n}">${svg(v.d, '', v.n)}</button>`).join('')}</div></div>`;
}
function bindPickers(state) {
  $$('[data-pick]').forEach(b => b.onclick = () => {
    const name = b.dataset.pick;
    state[name] = state[name] === b.dataset.v ? '' : b.dataset.v;
    $$(`[data-pick="${name}"]`).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === state[name]));
  });
}

function noteEditor(note, date) {
  if (!S.me) return gate();
  const n = note ? JSON.parse(JSON.stringify(note)) : { id: uid('n'), type: 'note', owner: S.me, date: date || today(), title: '', body: '', mood: '', weather: '', photos: [], stickers: [], createdAt: Date.now() };
  const sel = (n.stickers || []).map(s => s.k);
  const state = { mood: n.mood, weather: n.weather, uploading: 0 };
  modal(`<h2>${note ? 'Sửa trang nhật ký' : 'Trang nhật ký mới'}</h2>
    <form id="f" style="${memStyle(n.owner)}">
      <div class="row"><label class="field"><span>Ngày</span><input type="date" name="date" value="${n.date}" required></label>
        <label class="field" style="flex:2 1 220px"><span>Tiêu đề</span><input name="title" maxlength="120" value="${esc(n.title)}" placeholder="Hôm nay là một ngày..."></label></div>
      ${pickerRow('mood', MOODS, n.mood)}
      ${pickerRow('weather', WEATHER, n.weather)}
      <label class="field"><span>Viết gì đó</span><textarea name="body" required maxlength="20000" placeholder="Kể sổ nghe đi...">${esc(n.body)}</textarea></label>
      ${photoField(n.photos)}
      ${stickerPicker(sel)}
      <div class="actions"><button type="button" class="btn ghost" data-act="close">Huỷ</button><button class="btn">Cất vào sổ</button></div>
    </form>`);
  bindPickers(state);
  bindStickerPicker(sel);
  bindPhotoField(n.photos, state);
  $('#f').onsubmit = e => {
    e.preventDefault();
    if (state.uploading) return toast('Đợi ảnh tải xong đã nha');
    const f = new FormData(e.target);
    const oldKeys = (n.stickers || []).map(s => s.k).join();
    const stickers = oldKeys === sel.join() ? n.stickers : placeStickers(sel);
    closeModal();
    saveRec({ ...n, date: f.get('date'), title: f.get('title').trim(), body: f.get('body'), mood: state.mood, weather: state.weather, stickers }, 'Đã cất vào sổ');
    S.scrollTo = 'e-' + n.id;
    if (route().a !== n.owner) location.hash = '#/' + n.owner;
  };
}

/* ---------- Chuyến đi ---------- */
function viewTrips() {
  const t = today();
  const trips = all('trip').sort((a, b) => (b.start || '').localeCompare(a.start || ''));
  return head('Chuyến đi của tụi mình', `${trips.length} chuyến · ${trips.reduce((s, tr) => s + (tr.photos || []).length, 0)} tấm ảnh`, `<button class="btn" data-act="new-trip">${icon('plus')} Thêm chuyến đi</button>`, '#FFD9C2') +
    (trips.length ? `<div class="grid-2">${trips.map((tr, i) => `<a class="trip-card" href="#/chuyen-di/${tr.id}" style="--r:${(i % 3 - 1) * 1.4}deg">
      <div class="trip-cover">${tr.photos && tr.photos[0] ? `<img src="${esc(photoUrl(tr.photos[tr.cover || 0] || tr.photos[0], 700))}" alt="" loading="lazy">` : doodle(pick(['plane', 'camera', 'sun', 'cloud'], rng(tr.id)))}</div>
      <h3>${esc(tr.title)}</h3><p class="trip-meta">${tr.start ? dmy(tr.start) : ''}${tr.end && tr.end !== tr.start ? ' đến ' + dmy(tr.end) : ''}${tr.place ? ' · ' + esc(tr.place) : ''}</p>
      <div class="members-row">${(tr.members || []).map(m => avatar(m, 'sm')).join('')}${tr.start > t ? `<span class="chip" style="--chip:#D7F0E2;margin-left:auto">còn ${daysUntil(tr.start)} ngày</span>` : ''}</div></a>`).join('')}</div>`
      : `<p class="empty">Chưa có chuyến nào. Thêm chuyến đầu tiên, kể cả chuyến đi ăn lẩu cũng được.</p>`);
}
function viewTrip(id) {
  const tr = S.recs.get(id);
  if (!tr) return `<p class="empty">Không tìm thấy chuyến đi này. <a href="#/chuyen-di">Quay lại</a></p>`;
  const members = tr.members && tr.members.length ? tr.members : MEMBERS.map(m => m.key);
  const ex = tr.expenses || [];
  const total = ex.reduce((s, e) => s + Number(e.amount || 0), 0);
  const bal = Object.fromEntries(MEMBERS.map(m => [m.key, 0]));
  ex.forEach(e => {
    const split = e.split && e.split.length ? e.split : members;
    bal[e.paidBy] = (bal[e.paidBy] || 0) + Number(e.amount || 0);
    split.forEach(m => { bal[m] = (bal[m] || 0) - Number(e.amount || 0) / split.length; });
  });
  const settle = settleUp(bal);
  const buckets = all('bucket').filter(b => b.tripId === id);
  return `<p style="margin:0 0 10px"><a href="#/chuyen-di" class="muted">${icon('left').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} Tất cả chuyến đi</a></p>
  <div class="trip-hero">
    ${head(esc(tr.title), `${tr.start ? dmy(tr.start) : ''}${tr.end && tr.end !== tr.start ? ' đến ' + dmy(tr.end) : ''}${tr.place ? ' · ' + esc(tr.place) : ''}`,
      `<div class="members-row">${members.map(m => avatar(m)).join('')}</div><button class="icon-btn" data-act="edit-trip" data-id="${id}" aria-label="Sửa chuyến đi">${icon('edit')}</button>`, '#FFD9C2')}
  </div>
  ${tr.desc ? `<div class="card" style="background:#FFF6E9">${stickersHtml(tr.stickers)}<span class="tape" style="--tape:#F7B98A"></span><p class="hand" style="margin:0;white-space:pre-wrap">${esc(tr.desc)}</p></div>` : (tr.stickers && tr.stickers.length ? `<div class="card" style="min-height:90px;background:#FFF6E9">${stickersHtml(tr.stickers)}</div>` : '')}

  <section class="section">
    <div class="page-head" style="margin-bottom:12px"><h2 class="section-title">${doodle('camera')} Ảnh kỷ niệm (${(tr.photos || []).length})</h2>
      <label class="btn small">${icon('plus')} Thêm ảnh<input type="file" accept="image/*" multiple hidden data-act-change="trip-photos" data-id="${id}"></label></div>
    ${(tr.photos || []).length ? `<div class="gallery">${tr.photos.map((p, i) => polaroid(p, i, { del: 'trip-photo-del' })).join('')}</div>` : `<p class="empty">Chưa có ảnh. Chọn nhiều ảnh một lần được nha.</p>`}
    ${reactsHtml(tr)}
    ${commentsHtml(tr)}
  </section>

  <section class="section">
    <h2 class="section-title">${doodle('cherry')} Chia tiền</h2>
    <form class="card" data-form="expense" data-id="${id}" style="margin-bottom:16px">
      <div class="row">
        <label class="field" style="flex:2 1 180px"><span>Khoản gì</span><input name="what" required maxlength="80" placeholder="Phòng homestay, lẩu, xăng..."></label>
        <label class="field"><span>Số tiền</span><input name="amount" required inputmode="numeric" placeholder="350000"></label>
        <label class="field"><span>Ai trả</span><select name="paidBy">${members.map(m => `<option value="${m}" ${m === S.me ? 'selected' : ''}>${esc(MEM[m].name)}</option>`).join('')}</select></label>
      </div>
      <div class="field"><span>Chia cho</span><div class="who-pick">${members.map(m => `<label><input type="checkbox" name="split" value="${m}" checked> ${esc(MEM[m].name)}</label>`).join('')}</div></div>
      <div class="actions" style="margin-top:0"><button class="btn small">${icon('plus')} Ghi khoản này</button></div>
    </form>
    ${ex.length ? `<div class="card" style="overflow-x:auto"><table class="money"><thead><tr><th>Khoản</th><th>Ai trả</th><th>Chia cho</th><th style="text-align:right">Số tiền</th><th></th></tr></thead><tbody>
      ${ex.map((e, i) => `<tr><td>${esc(e.what)}</td><td>${avatar(e.paidBy, 'sm')}</td><td>${(e.split && e.split.length ? e.split : members).map(m => avatar(m, 'sm')).join('')}</td><td class="num">${money(e.amount)} đ</td>
        <td><button class="icon-btn" data-act="del-expense" data-id="${id}" data-i="${i}" aria-label="Xoá khoản">${icon('trash')}</button></td></tr>`).join('')}
      <tr><td colspan="3"><b>Tổng cả chuyến</b></td><td class="num">${money(total)} đ</td><td></td></tr></tbody></table></div>
      <div class="balance" style="margin-top:16px">${members.map(m => `<div style="--soft:${MEM[m].soft}">${esc(MEM[m].name)} ${bal[m] >= 0 ? 'được nhận lại' : 'cần trả thêm'}<b>${money(Math.abs(bal[m]))} đ</b></div>`).join('')}</div>
      <div class="settle" style="margin-top:14px">${settle.length ? settle.map(s => `<div class="settle-row">${avatar(s.from, 'sm')} chuyển cho ${avatar(s.to, 'sm')} <b>${money(s.amt)} đ</b></div>`).join('') : `<p class="hand" style="margin:0">Huề cả làng, không ai nợ ai.</p>`}</div>`
      : `<p class="empty">Chưa ghi khoản nào.</p>`}
  </section>

  ${buckets.length ? `<section class="section"><h2 class="section-title">${doodle('check')} Bucket list làm trong chuyến này</h2><ul class="bucket">${buckets.map(bucketLi).join('')}</ul></section>` : ''}

  <div class="actions" style="margin-top:36px"><button class="btn danger small" data-act="del-trip" data-id="${id}">${icon('trash')} Xoá chuyến đi</button></div>`;
}
function settleUp(bal) {
  const cred = [], debt = [];
  Object.entries(bal).forEach(([k, v]) => { if (v > 0.5) cred.push([k, v]); else if (v < -0.5) debt.push([k, -v]); });
  cred.sort((a, b) => b[1] - a[1]); debt.sort((a, b) => b[1] - a[1]);
  const out = [];
  let i = 0, j = 0;
  while (i < debt.length && j < cred.length) {
    const amt = Math.min(debt[i][1], cred[j][1]);
    out.push({ from: debt[i][0], to: cred[j][0], amt });
    debt[i][1] -= amt; cred[j][1] -= amt;
    if (debt[i][1] < 0.5) i++;
    if (cred[j][1] < 0.5) j++;
  }
  return out;
}
function tripEditor(trip) {
  const tr = trip ? JSON.parse(JSON.stringify(trip)) : { id: uid('t'), type: 'trip', title: '', place: '', start: today(), end: '', members: MEMBERS.map(m => m.key), desc: '', photos: [], expenses: [], stickers: [], by: S.me, createdAt: Date.now() };
  const sel = (tr.stickers || []).map(s => s.k);
  modal(`<h2>${trip ? 'Sửa chuyến đi' : 'Chuyến đi mới'}</h2>
    <form id="f">
      <label class="field"><span>Tên chuyến</span><input name="title" required maxlength="80" value="${esc(tr.title)}" placeholder="Đà Lạt mùa dã quỳ"></label>
      <label class="field"><span>Ở đâu</span><input name="place" maxlength="80" value="${esc(tr.place)}" placeholder="Đà Lạt"></label>
      <div class="row"><label class="field"><span>Từ ngày</span><input type="date" name="start" required value="${tr.start}"></label><label class="field"><span>Đến ngày</span><input type="date" name="end" value="${tr.end || ''}"></label></div>
      <div class="field"><span>Ai đi</span><div class="who-pick">${MEMBERS.map(m => `<label><input type="checkbox" name="members" value="${m.key}" ${tr.members.includes(m.key) ? 'checked' : ''}> ${esc(m.name)}</label>`).join('')}</div></div>
      <label class="field"><span>Ghi chú chuyến đi</span><textarea name="desc" maxlength="5000" style="min-height:120px" placeholder="Kế hoạch, điều nhớ nhất...">${esc(tr.desc)}</textarea></label>
      ${stickerPicker(sel)}
      <div class="actions"><button type="button" class="btn ghost" data-act="close">Huỷ</button><button class="btn">Lưu</button></div>
    </form>`);
  bindStickerPicker(sel);
  $('#f').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const members = f.getAll('members');
    const stickers = (tr.stickers || []).map(s => s.k).join() === sel.join() ? tr.stickers : placeStickers(sel);
    closeModal();
    saveRec({ ...tr, title: f.get('title').trim(), place: f.get('place').trim(), start: f.get('start'), end: f.get('end'), members: members.length ? members : MEMBERS.map(m => m.key), desc: f.get('desc'), stickers }, 'Đã lưu chuyến đi');
    location.hash = '#/chuyen-di/' + tr.id;
  };
}

/* ---------- Bucket list ---------- */
function bucketLi(b) {
  const tr = b.tripId && S.recs.get(b.tripId);
  return `<li class="${b.done ? 'done' : ''}"><button class="check" data-act="bucket-toggle" data-id="${b.id}" aria-pressed="${!!b.done}" aria-label="Đánh dấu xong">${svg(DOODLES.check.d.replace(P.pink, P.ink))}</button>
    <span class="txt">${esc(b.text)}</span>
    <span class="meta">${MEM[b.by] ? esc(MEM[b.by].name) : ''}${b.done && b.doneDate ? ' · xong ' + dmy(b.doneDate) : ''}${tr ? ` · <a href="#/chuyen-di/${tr.id}">${esc(tr.title)}</a>` : ''}</span>
    <button class="icon-btn" data-act="edit-bucket" data-id="${b.id}" aria-label="Sửa">${icon('edit')}</button></li>`;
}
function viewBucket() {
  const items = all('bucket').sort((a, b) => (a.done - b.done) || (b.createdAt || 0) - (a.createdAt || 0));
  const done = items.filter(b => b.done).length;
  return head('Bucket list chung', 'Những điều muốn làm cùng nhau trước khi già', '', '#D7F0E2') +
    `<div class="progress" role="progressbar" aria-valuenow="${done}" aria-valuemax="${items.length}"><i style="width:${items.length ? (done / items.length) * 100 : 0}%"></i></div>
    <p class="hand" style="margin:8px 0 0">Đã làm ${done}/${items.length} điều</p>
    <form class="add-note" data-form="bucket" style="max-width:640px;margin-top:18px"><input name="t" required maxlength="160" placeholder="Ngắm bình minh ở Mũi Né, học làm bánh..." aria-label="Điều muốn làm"><button class="btn">${icon('plus')} Thêm</button></form>
    ${items.length ? `<ul class="bucket">${items.map(bucketLi).join('')}</ul>` : `<p class="empty">Danh sách đang trống. Mỗi người thêm một điều đi.</p>`}`;
}
function bucketEditor(b) {
  const trips = all('trip').sort((a, c) => (c.start || '').localeCompare(a.start || ''));
  modal(`<h2>Sửa điều muốn làm</h2><form id="f">
    <label class="field"><span>Nội dung</span><input name="text" required maxlength="160" value="${esc(b.text)}"></label>
    <label class="field"><span>Làm trong chuyến đi nào</span><select name="tripId"><option value="">Chưa gắn</option>${trips.map(tr => `<option value="${tr.id}" ${b.tripId === tr.id ? 'selected' : ''}>${esc(tr.title)}</option>`).join('')}</select></label>
    <div class="actions"><button type="button" class="btn danger left" data-act="del-bucket" data-id="${b.id}">${icon('trash')} Xoá</button><button type="button" class="btn ghost" data-act="close">Huỷ</button><button class="btn">Lưu</button></div></form>`);
  $('#f').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); closeModal(); saveRec({ ...b, text: f.get('text').trim(), tripId: f.get('tripId') }); };
}

/* ---------- Thư hẹn giờ ---------- */
function viewLetters() {
  const ls = all('letter');
  const locked = ls.filter(l => l.locked).sort((a, b) => a.openDate.localeCompare(b.openDate));
  const opened = ls.filter(l => !l.locked).sort((a, b) => b.openDate.localeCompare(a.openDate));
  const env = l => {
    const n = daysUntil(l.openDate);
    const st2 = MEM[l.from] ? `--c:${MEM[l.from].c};--soft:${MEM[l.from].soft}` : '';
    return `<button class="envelope ${l.locked ? '' : 'open'}" style="${st2}" data-act="letter" data-id="${l.id}">
      <span class="seal">${icon(l.locked ? 'lock' : 'open')}</span>
      <span class="info"><b>${esc(l.title || 'Thư không tên')}</b><br>${esc(MEM[l.from]?.name || '')} gửi ${l.to === 'all' ? 'cả nhà' : esc(MEM[l.to]?.name || '')} · ${l.locked ? `mở ngày ${dmy(l.openDate)} (còn ${n} ngày)` : `mở từ ${dmy(l.openDate)}`}</span></button>`;
  };
  return head('Thư hẹn giờ', 'Viết bây giờ, khoá lại, tới ngày hẹn mới đọc được', `<button class="btn" data-act="new-letter">${icon('edit')} Viết thư</button>`, '#FFE6EC') +
    `<section class="section" style="margin-top:8px"><h2 class="section-title">${doodle('moon')} Đang chờ mở (${locked.length})</h2>${locked.length ? `<div class="letters">${locked.map(env).join('')}</div>` : `<p class="empty">Không có lá thư nào đang khoá.</p>`}</section>
    <section class="section"><h2 class="section-title">${doodle('heart')} Đã mở (${opened.length})</h2>${opened.length ? `<div class="letters">${opened.map(env).join('')}</div>` : `<p class="empty">Chưa có thư nào tới ngày mở.</p>`}</section>`;
}
function openLetter(l) {
  if (l.locked) return toast(`Chưa tới ngày mở nha, còn ${daysUntil(l.openDate)} ngày nữa`);
  modal(`<h2>${esc(l.title || 'Thư của ' + (MEM[l.from]?.name || ''))}</h2>
    <p class="muted" style="margin-top:-8px">${esc(MEM[l.from]?.name || '')} gửi ${l.to === 'all' ? 'cả nhà' : esc(MEM[l.to]?.name || '')} · viết ngày ${dmy(l.writtenOn)} · mở từ ${dmy(l.openDate)}</p>
    <div class="letter-paper" style="position:relative">${stickersHtml(l.stickers)}<span style="position:relative">${esc(l.body)}</span></div>
    ${l.from === S.me ? `<div class="actions"><button class="btn danger small left" data-act="del-letter" data-id="${l.id}">${icon('trash')} Xoá thư</button></div>` : ''}`);
}
function letterEditor() {
  if (!S.me) return gate();
  const tomorrow = ymd(new Date(Date.now() + 86400000));
  const sel = [];
  modal(`<h2>Viết thư hẹn giờ</h2><form id="f">
    <div class="row"><label class="field"><span>Gửi</span><select name="to"><option value="all">Cả nhà</option>${MEMBERS.filter(m => m.key !== S.me).map(m => `<option value="${m.key}">${esc(m.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Mở vào ngày</span><input type="date" name="openDate" required min="${tomorrow}" value="${ymd(new Date(new Date().getFullYear() + 1, 0, 1))}"></label></div>
    <label class="field"><span>Tiêu đề</span><input name="title" maxlength="80" placeholder="Gửi tụi mình của năm sau"></label>
    <label class="field"><span>Nội dung</span><textarea name="body" required maxlength="20000" placeholder="Viết gì cũng được, tới ngày mới ai cũng đọc được..."></textarea></label>
    ${stickerPicker(sel)}
    <p class="hand muted" style="margin:0 0 8px">Gửi xong là khoá luôn, cả người viết cũng phải đợi tới ngày mới đọc lại được.</p>
    <div class="actions"><button type="button" class="btn ghost" data-act="close">Huỷ</button><button class="btn">Khoá và gửi</button></div></form>`);
  bindStickerPicker(sel);
  $('#f').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    closeModal();
    saveRec({ id: uid('l'), type: 'letter', from: S.me, to: f.get('to'), openDate: f.get('openDate'), title: f.get('title').trim(), body: f.get('body'), writtenOn: today(), stickers: placeStickers(sel), createdAt: Date.now() }, 'Đã khoá thư, hẹn gặp lại ngày mở nha');
  };
}

/* ---------- Cài đặt ---------- */
function viewSettings() {
  const count = t => all(t).length;
  return head('Cài đặt', `<span class="sync"></span>`, '', '#EFE8FD') + `
    <div class="card" style="max-width:640px"><span class="tape" style="--tape:#C8B6F2"></span>
      <h2 class="section-title">Máy này là của ai?</h2>
      <div class="big-who">${MEMBERS.map(m => `<button data-act="set-me" data-m="${m.key}" aria-pressed="${S.me === m.key}" style="--soft:${m.soft}">${avatar(m.key)}${esc(m.name)}</button>`).join('')}</div>
      <p class="hand muted" style="margin:0">Chọn đúng người để viết nhật ký, thả tim và dán lời bên lề đúng tên.</p>
    </div>
    <div class="card" style="max-width:640px;margin-top:22px">
      <h2 class="section-title">Trong sổ đang có</h2>
      <p class="hand" style="margin:0">${count('note')} trang nhật ký · ${count('trip')} chuyến đi · ${all('trip').reduce((s, t) => s + (t.photos || []).length, 0) + all('note').reduce((s, n) => s + (n.photos || []).length, 0)} ảnh · ${count('event')} sự kiện · ${count('bucket')} điều muốn làm · ${count('letter')} lá thư</p>
      <div class="actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn ghost small" data-act="resync">Đồng bộ lại toàn bộ</button>
        <button class="btn ghost small" data-act="export">Tải bản sao lưu (.json)</button>
        ${API_URL ? `<button class="btn ghost small" data-act="logout">Thoát mã trên máy này</button>` : ''}
      </div>
    </div>
    <div class="card" style="max-width:640px;margin-top:22px">
      <h2 class="section-title">Mẹo nhỏ</h2>
      <p class="hand" style="margin:0">Trên điện thoại: mở sổ bằng Safari hoặc Chrome, bấm Chia sẻ rồi chọn "Thêm vào màn hình chính" để có biểu tượng như app.<br>Ảnh được cất trong thư mục Google Drive "Sổ Nhà Mập Nga Boi - ảnh", chữ trong Google Sheet cùng tên, nên còn mãi kể cả khi web có đổi.</p>
    </div>`;
}

/* ---------- popup + toast ---------- */
function modal(html, cls = '') {
  const m = $('#modal');
  m.innerHTML = `<div class="sheet ${cls}" role="dialog" aria-modal="true"><button class="icon-btn close" data-act="close" aria-label="Đóng">${icon('x')}</button>${html}</div>`;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const f = m.querySelector('input:not([type=hidden]):not([type=file]), textarea'); if (f && cls !== 'viewer') f.focus(); }, 30);
}
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.style.overflow = ''; }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

function gate() {
  const needPass = !!API_URL && !S.pass;
  let who = S.me;
  modal(`<div class="gate"><div class="stickers-row">${doodle('star')}${doodle('heart')}${doodle('flower')}${doodle('smile')}</div>
    <h2>${esc(BOOK)}</h2><p>${needPass ? 'Nhập mã của nhà mình để mở sổ' : 'Bạn là ai trong nhà?'}</p>
    <form id="g">
      ${needPass ? `<label class="field"><span>Mã chung</span><input name="pass" type="password" required autocomplete="current-password"></label>` : ''}
      <div class="big-who">${MEMBERS.map(m => `<button type="button" data-who="${m.key}" aria-pressed="${who === m.key}" style="--soft:${m.soft}">${avatar(m.key)}${esc(m.name)}</button>`).join('')}</div>
      <button class="btn" style="width:100%">Mở sổ</button>
    </form></div>`);
  $('.sheet .close').remove();
  $$('[data-who]').forEach(b => b.onclick = () => { who = b.dataset.who; $$('[data-who]').forEach(x => x.setAttribute('aria-pressed', x.dataset.who === who)); });
  $('#g').onsubmit = async e => {
    e.preventDefault();
    if (!who) return toast('Chọn mình là ai đã nha');
    if (needPass) {
      S.pass = new FormData(e.target).get('pass').trim();
      try { await api('ping'); } catch { S.pass = ''; return toast('Sai mã rồi, hỏi lại hai đứa kia nha'); }
      store.set('pass', S.pass);
    }
    S.me = who;
    store.set('me', who);
    closeModal();
    render();
    sync();
  };
}

/* ---------- sự kiện ---------- */
const ACT = {
  close: () => closeModal(),
  view: el => modal(`<img src="${esc(el.dataset.src)}" alt="${esc(el.dataset.cap || 'Ảnh kỷ niệm')}">${el.dataset.cap ? `<div class="cap">${esc(el.dataset.cap)}</div>` : ''}`, 'viewer'),
  'goto-entry': el => { S.scrollTo = 'e-' + el.dataset.id; closeModal(); if (location.hash === el.getAttribute('href')) render(); },
  'new-note': el => noteEditor(null, el.dataset.date),
  'edit-note': el => noteEditor(S.recs.get(el.dataset.id)),
  'del-note': el => { if (confirm('Xoá trang nhật ký này? Xoá rồi không lấy lại trên web được.')) delRec(el.dataset.id, 'Đã xoá trang'); },
  react: el => { if (!S.me) return gate(); mutateRec('react', { id: el.dataset.id, who: S.me, icon: el.dataset.icon }); },
  uncomment: el => mutateRec('uncomment', { id: el.dataset.id, cid: el.dataset.cid }),
  'diary-year': el => { S.diaryYear[el.dataset.m] = el.dataset.y; render(); },
  year: el => { S.cal.y += Number(el.dataset.d); render(); },
  'cal-view': el => { S.cal.view = el.dataset.v; render(); },
  'cal-today': () => { const d = new Date(); S.cal.y = d.getFullYear(); S.cal.m = d.getMonth(); S.cal.view = 'month'; render(); },
  month: el => { S.cal.m = Number(el.dataset.m); S.cal.view = 'month'; render(); },
  day: el => openDay(el.dataset.d),
  'new-event': el => eventEditor(null, el.dataset.date),
  'edit-event': el => eventEditor(S.recs.get(el.dataset.id)),
  'del-event': el => { closeModal(); delRec(el.dataset.id, 'Đã xoá sự kiện'); },
  'new-trip': () => tripEditor(),
  'edit-trip': el => tripEditor(S.recs.get(el.dataset.id)),
  'del-trip': el => { if (confirm('Xoá cả chuyến đi này? Ảnh vẫn còn trong Google Drive.')) { delRec(el.dataset.id, 'Đã xoá chuyến đi'); location.hash = '#/chuyen-di'; } },
  'trip-photo-del': (el, e) => {
    e.stopPropagation();
    const id = route().b;
    const tr = S.recs.get(id);
    if (!tr || !confirm('Bỏ ảnh này khỏi chuyến đi? Ảnh gốc vẫn còn trong Drive.')) return;
    tr.photos.splice(Number(el.dataset.i), 1);
    saveRec(tr);
  },
  'del-expense': el => { const tr = S.recs.get(el.dataset.id); tr.expenses.splice(Number(el.dataset.i), 1); saveRec(tr); },
  'bucket-toggle': el => { const b = S.recs.get(el.dataset.id); saveRec({ ...b, done: !b.done, doneDate: !b.done ? today() : '' }, !b.done ? 'Yay, gạch được thêm một điều!' : ''); },
  'edit-bucket': el => bucketEditor(S.recs.get(el.dataset.id)),
  'del-bucket': el => { closeModal(); delRec(el.dataset.id); },
  'new-letter': () => letterEditor(),
  letter: el => openLetter(S.recs.get(el.dataset.id)),
  'del-letter': el => { if (confirm('Xoá lá thư này?')) { closeModal(); delRec(el.dataset.id, 'Đã xoá thư'); } },
  'set-me': el => { S.me = el.dataset.m; store.set('me', S.me); render(); toast('Chào ' + MEM[S.me].name + '!'); },
  resync: () => { toast('Đang đồng bộ...'); sync(true); },
  logout: () => { store.del('pass'); store.del('cache'); S.pass = ''; S.recs.clear(); render(); gate(); },
  export: () => {
    const blob = new Blob([JSON.stringify({ book: BOOK, exportedAt: new Date().toISOString(), records: [...S.recs.values()] }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `so-nha-map-nga-boi-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) { if (e.target.id === 'modal') closeModal(); return; }
  const fn = ACT[el.dataset.act];
  if (!fn) return;
  if (el.tagName === 'BUTTON' || el.dataset.act !== 'goto-entry') { if (el.tagName !== 'A') e.preventDefault(); }
  fn(el, e);
});
document.addEventListener('change', async e => {
  const el = e.target;
  if (el.dataset.actInput === 'year-set') { const y = Number(el.value); if (y >= 1900 && y <= 9999) { S.cal.y = y; render(); } }
  if (el.dataset.actChange === 'trip-photos') {
    const tr = S.recs.get(el.dataset.id);
    const files = [...el.files];
    if (!tr || !files.length) return;
    toast(`Đang tải ${files.length} ảnh...`);
    const added = await uploadFiles(files);
    if (!added.length) return;
    const fresh = S.recs.get(tr.id);
    fresh.photos = [...(fresh.photos || []), ...added];
    saveRec(fresh, `Đã thêm ${added.length} ảnh`);
  }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  const fd = new FormData(f);
  if (f.dataset.form === 'comment') {
    const t = String(fd.get('t') || '').trim();
    if (t) mutateRec('comment', { id: f.dataset.id, who: S.me, text: t });
  }
  if (f.dataset.form === 'bucket') {
    const t = String(fd.get('t') || '').trim();
    if (t) saveRec({ id: uid('b'), type: 'bucket', text: t, by: S.me, done: false, doneDate: '', tripId: '', createdAt: Date.now() }, 'Đã thêm vào bucket list');
  }
  if (f.dataset.form === 'expense') {
    const tr = S.recs.get(f.dataset.id);
    const amount = Number(String(fd.get('amount')).replace(/[^\d]/g, ''));
    if (!amount) return toast('Nhập số tiền bằng số nha, ví dụ 350000');
    tr.expenses = [...(tr.expenses || []), { id: uid('x'), what: String(fd.get('what')).trim(), amount, paidBy: fd.get('paidBy'), split: fd.getAll('split'), by: S.me, at: Date.now() }];
    saveRec(tr, 'Đã ghi khoản chi');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden && !$('#g')) closeModal(); });
window.addEventListener('hashchange', () => { closeModal(); render(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });

/* ---------- khởi động ---------- */
function injectDefs() {
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="crayon" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="11" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.45" result="gm"/>
      <feComposite in="d" in2="gm" operator="in"/>
    </filter></defs></svg>`);
}
function start() {
  injectDefs();
  loadCache();
  render();
  if ((API_URL && !S.pass) || !S.me) gate();
  if (!API_URL || S.pass) sync();
  setInterval(() => { if (!document.hidden && (S.pass || !API_URL)) sync(); }, 60000);
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
start();
window.__so = { S, sync, demo };
