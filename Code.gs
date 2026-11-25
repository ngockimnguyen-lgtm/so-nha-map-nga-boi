/**
 * Sổ Nhà Mập Nga Boi - phần lưu trữ (Google Apps Script)
 *
 * Cách cài (làm một lần):
 * 1. Vào https://script.google.com > Dự án mới, dán toàn bộ file này vào Code.gs.
 * 2. Đổi MA_CHUNG bên dưới thành mã của nhà mình.
 * 3. Chọn hàm setup ở thanh trên > Chạy > cấp quyền. Script tự tạo 1 Google Sheet và 1 thư mục ảnh trong Drive.
 * 4. Triển khai > Tùy chọn triển khai mới > Loại: Ứng dụng web
 *    - Thực thi với tư cách: Tôi
 *    - Người có quyền truy cập: Bất kỳ ai
 *    Bấm Triển khai, chép URL kết thúc bằng /exec dán vào API_URL trong app.js.
 * 5. Thông báo đẩy: chọn hàm setupPush > Chạy > cấp quyền (gửi thông báo + chạy theo giờ).
 *    Hàm này tạo khóa thông báo và hẹn 2 lịch: 9h sáng và 21h tối mỗi ngày.
 * Đổi mã sau này: sửa MA_CHUNG rồi chạy lại setup (không cần triển khai lại).
 * Sửa code sau này: Triển khai > Quản lý triển khai > sửa > Phiên bản mới (giữ nguyên link).
 * Dán lại cả file này thì để nguyên MA_CHUNG mặc định cũng được: setup chỉ đổi mã khi MA_CHUNG khác 'doi-ma-nay'.
 */

const MA_CHUNG = 'doi-ma-nay';
const TZ = 'Asia/Ho_Chi_Minh';
const PROPS = PropertiesService.getScriptProperties();

function setup() {
  let sheetId = PROPS.getProperty('SHEET_ID');
  if (!sheetId) {
    const ss = SpreadsheetApp.create('Sổ Nhà Mập Nga Boi - dữ liệu');
    const sh = ss.getSheets()[0];
    sh.setName('data');
    sh.appendRow(['id', 'type', 'json', 'updatedAt', 'deleted']);
    sh.setFrozenRows(1);
    sheetId = ss.getId();
    PROPS.setProperty('SHEET_ID', sheetId);
  }
  let folderId = PROPS.getProperty('FOLDER_ID');
  if (!folderId) {
    folderId = DriveApp.createFolder('Sổ Nhà Mập Nga Boi - ảnh').getId();
    PROPS.setProperty('FOLDER_ID', folderId);
  }
  if (MA_CHUNG !== 'doi-ma-nay' || !PROPS.getProperty('PASSCODE')) PROPS.setProperty('PASSCODE', String(MA_CHUNG).trim());
  Logger.log('Sheet: https://docs.google.com/spreadsheets/d/' + sheetId);
  Logger.log('Ảnh: https://drive.google.com/drive/folders/' + folderId);
}

function doGet() {
  return json_({ ok: true, app: 'so-nha-map-nga-boi' });
}

function doPost(e) {
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }
  // Service worker trên điện thoại hỏi tin nhắn bằng chính endpoint của nó, không cần mã chung.
  if (req && req.action === 'inbox') {
    try { return withLock_(() => json_({ ok: true, messages: inbox_(req.endpoint) })); }
    catch (err) { return json_({ ok: false, error: String(err && err.message || err) }); }
  }
  if (!req || String(req.pass || '').trim() !== PROPS.getProperty('PASSCODE')) {
    return json_({ ok: false, error: 'wrong_pass' });
  }
  try {
    switch (req.action) {
      case 'ping': return json_({ ok: true });
      case 'list': return json_({ ok: true, now: Date.now(), records: list_(Number(req.since) || 0) });
      case 'save': return withLock_(() => json_({ ok: true, record: save_(req.record) }));
      case 'delete': return withLock_(() => json_({ ok: true, record: mutate_(req.id, r => r, true) }));
      case 'react': return withLock_(() => json_({ ok: true, record: mutate_(req.id, r => react_(r, req.who, req.icon)) }));
      case 'comment': return withLock_(() => json_({ ok: true, record: mutate_(req.id, r => comment_(r, req)) }));
      case 'uncomment': return withLock_(() => json_({ ok: true, record: mutate_(req.id, r => uncomment_(r, req.cid)) }));
      case 'upload': return json_({ ok: true, fileId: upload_(req) });
      case 'vapid': return json_({ ok: true, key: PROPS.getProperty('VAPID_PUB') || '' });
      case 'subscribe': return withLock_(() => json_({ ok: true, count: subscribe_(req.sub, req.who) }));
      case 'unsubscribe': return withLock_(() => json_({ ok: true, removed: unsubscribe_(req.endpoint) }));
      case 'testpush': return json_({ ok: true, sent: notify_([req.who], { title: 'Sổ Nhà Mập Nga Boi', body: 'Thông báo chạy rồi nè! Hẹn gặp lại lúc 9h sáng với 21h tối.', url: './' }) });
      default: return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function sheet_() {
  return SpreadsheetApp.openById(PROPS.getProperty('SHEET_ID')).getSheetByName('data');
}

function today_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}

// Thư hẹn giờ: chưa tới ngày thì không gửi nội dung về máy.
function seal_(rec) {
  if (rec.type === 'letter' && rec.openDate && rec.openDate > today_()) {
    const copy = Object.assign({}, rec);
    copy.body = '';
    copy.locked = true;
    return copy;
  }
  return rec;
}

function openTs_(openDate) {
  const p = String(openDate).split('-').map(Number);
  // 00:00 giờ Việt Nam = 17:00 UTC hôm trước
  return Date.UTC(p[0], p[1] - 1, p[2]) - 7 * 3600 * 1000;
}

function list_(since) {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const rows = sh.getRange(2, 1, n, 5).getValues();
  const now = Date.now();
  const out = [];
  rows.forEach(row => {
    const updatedAt = Number(row[3]) || 0;
    const deleted = row[4] === true || row[4] === 'TRUE';
    let changed = updatedAt > since;
    if (!changed && row[1] === 'letter' && !deleted) {
      try {
        const r = JSON.parse(row[2]);
        const t = openTs_(r.openDate);
        changed = t > since && t <= now;
      } catch (err) { /* bỏ qua dòng lỗi */ }
    }
    if (!changed) return;
    if (deleted) { out.push({ id: row[0], deleted: true, updatedAt }); return; }
    try { out.push(seal_(JSON.parse(row[2]))); } catch (err) { /* bỏ qua dòng lỗi */ }
  });
  return out;
}

function findRow_(sh, id) {
  const cell = sh.getRange('A:A').createTextFinder(String(id)).matchEntireCell(true).findNext();
  return cell ? cell.getRow() : 0;
}

function save_(rec) {
  if (!rec || !rec.id || !rec.type) throw new Error('missing_id');
  const sh = sheet_();
  const row = findRow_(sh, rec.id);
  if (row) {
    // Giữ tim và bình luận đang có trên server, tránh ghi đè khi hai người cùng sửa.
    const old = JSON.parse(sh.getRange(row, 3).getValue() || '{}');
    if (old.reactions) rec.reactions = old.reactions;
    if (old.comments) rec.comments = old.comments;
    if (rec.type === 'letter' && old.body && !rec.body) rec.body = old.body;
  }
  rec.updatedAt = Date.now();
  const values = [[rec.id, rec.type, JSON.stringify(rec), rec.updatedAt, false]];
  if (row) sh.getRange(row, 1, 1, 5).setValues(values);
  else sh.appendRow(values[0]);
  return seal_(rec);
}

function mutate_(id, fn, del) {
  const sh = sheet_();
  const row = findRow_(sh, id);
  if (!row) throw new Error('not_found');
  const rec = fn(JSON.parse(sh.getRange(row, 3).getValue()));
  rec.updatedAt = Date.now();
  sh.getRange(row, 3, 1, 3).setValues([[JSON.stringify(rec), rec.updatedAt, !!del]]);
  return del ? { id: id, deleted: true, updatedAt: rec.updatedAt } : seal_(rec);
}

function react_(rec, who, icon) {
  rec.reactions = rec.reactions || {};
  const list = rec.reactions[who] || [];
  const i = list.indexOf(icon);
  if (i >= 0) list.splice(i, 1); else list.push(icon);
  rec.reactions[who] = list;
  return rec;
}

function comment_(rec, req) {
  const text = String(req.text || '').slice(0, 1000).trim();
  if (!text) return rec;
  rec.comments = rec.comments || [];
  rec.comments.push({ id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), who: req.who, text: text, at: Date.now() });
  return rec;
}

function uncomment_(rec, cid) {
  rec.comments = (rec.comments || []).filter(c => c.id !== cid);
  return rec;
}

function upload_(req) {
  const bytes = Utilities.base64Decode(String(req.data || ''));
  if (!bytes.length) throw new Error('empty_file');
  if (bytes.length > 12 * 1024 * 1024) throw new Error('file_too_big');
  const name = String(req.name || 'anh.jpg').replace(/[\\/:*?"<>|]/g, '_');
  const blob = Utilities.newBlob(bytes, req.mime || 'image/jpeg', name);
  const file = DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID')).createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getId();
}

/* ================= THÔNG BÁO ĐẨY (Web Push, chuẩn VAPID) =================
 * Gửi push không kèm nội dung; service worker trên máy nhận push rồi gọi action 'inbox'
 * để lấy tin nhắn đang chờ của chính máy đó. Nhờ vậy không cần mã hoá nội dung.
 */

const MEMBERS_ = { map: 'Mập', nga: 'Nga', boi: 'Boi' };
const APP_URL_ = 'https://ngockimnguyen-lgtm.github.io/so-nha-map-nga-boi/';

function setupPush() {
  if (!PROPS.getProperty('VAPID_PRIV')) {
    const keys = EC_.makeKeys();
    PROPS.setProperty('VAPID_PRIV', keys.d);
    PROPS.setProperty('VAPID_PUB', keys.pub);
  }
  pushSheet_();
  ScriptApp.getProjectTriggers()
    .filter(t => ['baoBuoiSang', 'nhacVietBuoiToi'].indexOf(t.getHandlerFunction()) >= 0)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('baoBuoiSang').timeBased().atHour(9).everyDays(1).inTimezone(TZ).create();
  ScriptApp.newTrigger('nhacVietBuoiToi').timeBased().atHour(21).everyDays(1).inTimezone(TZ).create();
  Logger.log('Đã bật thông báo. Khóa công khai: ' + PROPS.getProperty('VAPID_PUB'));
}

function pushSheet_() {
  const ss = SpreadsheetApp.openById(PROPS.getProperty('SHEET_ID'));
  let sh = ss.getSheetByName('push');
  if (!sh) {
    sh = ss.insertSheet('push');
    sh.appendRow(['endpoint', 'who', 'sub', 'pending', 'createdAt', 'lastSent']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function subRows_() {
  const sh = pushSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 6).getValues().map((r, i) => ({ row: i + 2, endpoint: r[0], who: r[1], sub: r[2], pending: r[3] }));
}

function subscribe_(sub, who) {
  if (!sub || !sub.endpoint || !MEMBERS_[who]) throw new Error('bad_subscription');
  const sh = pushSheet_();
  const old = subRows_().filter(r => r.endpoint === sub.endpoint)[0];
  const values = [sub.endpoint, who, JSON.stringify(sub), old ? old.pending : '[]', Date.now(), ''];
  if (old) sh.getRange(old.row, 1, 1, 6).setValues([values]);
  else sh.appendRow(values);
  return subRows_().filter(r => r.who === who).length;
}

function unsubscribe_(endpoint) {
  const old = subRows_().filter(r => r.endpoint === endpoint)[0];
  if (!old) return false;
  pushSheet_().deleteRow(old.row);
  return true;
}

function inbox_(endpoint) {
  const r = subRows_().filter(x => x.endpoint === endpoint)[0];
  if (!r) return [];
  let msgs = [];
  try { msgs = JSON.parse(r.pending || '[]'); } catch (err) { msgs = []; }
  pushSheet_().getRange(r.row, 4).setValue('[]');
  return msgs.slice(-4);
}

// Gửi một tin tới mọi máy của những người trong danh sách. Trả về số máy nhận được.
function notify_(whoList, msg) {
  const sh = pushSheet_();
  let sent = 0;
  withLock_(() => {
    subRows_().filter(r => whoList.indexOf(r.who) >= 0).forEach(r => {
      let pending = [];
      try { pending = JSON.parse(r.pending || '[]'); } catch (err) { pending = []; }
      pending.push(Object.assign({ at: Date.now() }, msg));
      sh.getRange(r.row, 4).setValue(JSON.stringify(pending.slice(-6)));
    });
  });
  const gone = [];
  subRows_().filter(r => whoList.indexOf(r.who) >= 0).forEach(r => {
    const code = sendPush_(r.endpoint);
    if (code === 404 || code === 410) gone.push(r.endpoint);
    else if (code >= 200 && code < 300) { sent++; sh.getRange(r.row, 6).setValue(Date.now()); }
    else Logger.log('Push lỗi ' + code + ' tới ' + r.who);
  });
  gone.forEach(unsubscribe_);
  return sent;
}

function sendPush_(endpoint) {
  const aud = endpoint.match(/^https?:\/\/[^/]+/)[0];
  const res = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    headers: { Authorization: 'vapid t=' + vapidJwt_(aud) + ', k=' + PROPS.getProperty('VAPID_PUB'), TTL: '86400', Urgency: 'high' },
    payload: '',
    muteHttpExceptions: true,
  });
  return res.getResponseCode();
}

function vapidJwt_(aud) {
  const head = b64urlStr_(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const body = b64urlStr_(JSON.stringify({ aud: aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: APP_URL_ }));
  const input = head + '.' + body;
  return input + '.' + b64urlBytes_(EC_.sign(sha256_(input), PROPS.getProperty('VAPID_PRIV')));
}

/* ---------- lịch gửi ---------- */
function allRecords_() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 5).getValues()
    .filter(r => !(r[4] === true || r[4] === 'TRUE'))
    .map(r => { try { return JSON.parse(r[2]); } catch (err) { return null; } })
    .filter(Boolean);
}

function addDays_(ymd, n) {
  const p = ymd.split('-').map(Number);
  return Utilities.formatDate(new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)), 'UTC', 'yyyy-MM-dd');
}

function baoBuoiSang() {
  const t = today_();
  const recs = allRecords_();
  const everyone = Object.keys(MEMBERS_);
  recs.filter(r => r.type === 'letter' && r.openDate === t).forEach(l => {
    const to = l.to === 'all' ? everyone : [l.to, l.from];
    notify_(to.filter((v, i, a) => a.indexOf(v) === i), {
      title: 'Hôm nay mở thư nè',
      body: 'Lá thư "' + (l.title || 'không tên') + '" của ' + (MEMBERS_[l.from] || 'ai đó') + ' đã tới ngày mở. Vào đọc liền đi!',
      url: './#/thu', tag: 'letter-' + l.id,
    });
  });
  recs.filter(r => r.type === 'event' && (r.yearly ? r.date.slice(5) === t.slice(5) && r.date.slice(0, 4) <= t.slice(0, 4) : r.date === t)).forEach(e => {
    notify_(everyone, {
      title: e.kind === 'bday' ? 'Hôm nay sinh nhật nè!' : 'Hôm nay có chuyện vui',
      body: e.title + (e.kind === 'bday' ? '. Nhớ chúc mừng với viết một trang thật xinh nha.' : ''),
      url: './#/lich', tag: 'event-' + e.id + '-' + t,
    });
  });
  recs.filter(r => r.type === 'trip' && r.start).forEach(tr => {
    const left = [7, 1].filter(n => addDays_(t, n) === tr.start)[0];
    if (!left) return;
    notify_(tr.members && tr.members.length ? tr.members : everyone, {
      title: left === 1 ? 'Mai đi rồi!' : 'Còn 7 ngày nữa là đi',
      body: tr.title + (tr.place ? ' · ' + tr.place : '') + (left === 1 ? '. Soạn đồ chưa đó?' : '. Thêm vài điều muốn làm cho chuyến này đi.'),
      url: './#/chuyen-di/' + tr.id, tag: 'trip-' + tr.id + '-' + left,
    });
  });
}

function nhacVietBuoiToi() {
  const t = today_();
  const wrote = {};
  allRecords_().filter(r => r.type === 'note' && r.date === t).forEach(n => { wrote[n.owner] = true; });
  const lines = [
    'Hôm nay có gì vui không, kể sổ nghe một xíu nha.',
    'Một dòng thôi cũng được, sổ nhớ giùm cho.',
    'Trước khi ngủ ghé sổ viết vài chữ nè.',
    'Hôm nay ăn gì, gặp ai, vui hay mệt? Ghi lại đi.',
    'Năm sau mở "ngày này năm xưa" sẽ cảm ơn bạn đó.',
  ];
  Object.keys(MEMBERS_).filter(m => !wrote[m]).forEach(m => {
    notify_([m], {
      title: MEMBERS_[m] + ' ơi, viết nhật ký chưa?',
      body: lines[Math.floor(Math.random() * lines.length)],
      url: './#/' + m, tag: 'nightly-' + t,
    });
  });
}

/* ---------- mã hoá ---------- */
function sha256_(input) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8).map(b => b & 255);
}
function b64urlStr_(s) { return Utilities.base64EncodeWebSafe(s, Utilities.Charset.UTF_8).replace(/=+$/, ''); }
function b64urlBytes_(bytes) { return Utilities.base64EncodeWebSafe(bytes.map(b => (b > 127 ? b - 256 : b))).replace(/=+$/, ''); }
function randBytes_() {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now() + Math.random(), Utilities.Charset.UTF_8).map(b => b & 255);
}

// ECDSA P-256 (ES256) viết tay vì Apps Script không có sẵn.
const EC_ = (() => {
  const B = s => BigInt(s);
  const P = B('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff');
  const N = B('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551');
  const G = [B('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'), B('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'), B(1)];
  const Z = B(0), ONE = B(1), TWO = B(2), THREE = B(3), FOUR = B(4), EIGHT = B(8), BYTE = B(255);
  const mod = (a, m) => { const r = a % m; return r < Z ? r + m : r; };
  const inv = (a, m) => {
    let r0 = mod(a, m), r1 = m, s0 = ONE, s1 = Z;
    while (r1 !== Z) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; }
    return mod(s0, m);
  };
  const dbl = ([X, Y, Zc]) => {
    if (Zc === Z || Y === Z) return [ONE, ONE, Z];
    const delta = mod(Zc * Zc, P), gamma = mod(Y * Y, P), beta = mod(X * gamma, P);
    const alpha = mod(THREE * (X - delta) * (X + delta), P);
    const X3 = mod(alpha * alpha - EIGHT * beta, P);
    const Z3 = mod((Y + Zc) * (Y + Zc) - gamma - delta, P);
    const Y3 = mod(alpha * (FOUR * beta - X3) - EIGHT * gamma * gamma, P);
    return [X3, Y3, Z3];
  };
  const add = (p1, p2) => {
    if (p1[2] === Z) return p2;
    if (p2[2] === Z) return p1;
    const [X1, Y1, Z1] = p1, [X2, Y2, Z2] = p2;
    const Z1Z1 = mod(Z1 * Z1, P), Z2Z2 = mod(Z2 * Z2, P);
    const U1 = mod(X1 * Z2Z2, P), U2 = mod(X2 * Z1Z1, P);
    const S1 = mod(Y1 * Z2 * Z2Z2, P), S2 = mod(Y2 * Z1 * Z1Z1, P);
    if (U1 === U2) return S1 === S2 ? dbl(p1) : [ONE, ONE, Z];
    const H = mod(U2 - U1, P), I = mod(FOUR * H * H, P), J = mod(H * I, P);
    const r = mod(TWO * (S2 - S1), P), V = mod(U1 * I, P);
    const X3 = mod(r * r - J - TWO * V, P);
    const Y3 = mod(r * (V - X3) - TWO * S1 * J, P);
    const Z3 = mod(((Z1 + Z2) * (Z1 + Z2) - Z1Z1 - Z2Z2) * H, P);
    return [X3, Y3, Z3];
  };
  const mul = (k, pt) => {
    let R = [ONE, ONE, Z];
    const bits = k.toString(2);
    for (let j = 0; j < bits.length; j++) { R = dbl(R); if (bits[j] === '1') R = add(R, pt); }
    return R;
  };
  const affine = ([X, Y, Zc]) => { const zi = inv(Zc, P), zi2 = mod(zi * zi, P); return [mod(X * zi2, P), mod(Y * zi2 * zi, P)]; };
  const toBig = bytes => bytes.reduce((a, b) => (a << EIGHT) + B(b & 255), Z);
  const toBytes = (x, len) => { const out = []; for (let i = 0; i < len; i++) { out.unshift(Number(x & BYTE)); x >>= EIGHT; } return out; };
  const randScalar = () => mod(toBig(randBytes_()), N - ONE) + ONE;
  return {
    makeKeys() {
      const d = randScalar();
      const [x, y] = affine(mul(d, G));
      return { d: d.toString(16), pub: b64urlBytes_([4].concat(toBytes(x, 32), toBytes(y, 32))) };
    },
    sign(hashBytes, dHex) {
      const d = B('0x' + dHex), e = toBig(hashBytes);
      for (;;) {
        const k = randScalar();
        const r = mod(affine(mul(k, G))[0], N);
        if (r === Z) continue;
        const s = mod(inv(k, N) * (e + r * d), N);
        if (s === Z) continue;
        return toBytes(r, 32).concat(toBytes(s, 32));
      }
    },
  };
})();
