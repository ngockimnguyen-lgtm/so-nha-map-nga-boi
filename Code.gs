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
 * Đổi mã sau này: sửa MA_CHUNG rồi chạy lại setup (không cần triển khai lại).
 * Sửa code sau này: Triển khai > Quản lý triển khai > sửa > Phiên bản mới (giữ nguyên link).
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
  PROPS.setProperty('PASSCODE', String(MA_CHUNG).trim());
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
