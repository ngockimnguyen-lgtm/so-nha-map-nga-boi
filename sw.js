// Ưu tiên mạng để sửa code là máy tự nhận; mất mạng thì dùng bản đã lưu.
importScripts('config.js');
const CACHE = 'so-nha-v4';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'config.js', 'icon.svg', 'icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});

// Push tới không kèm nội dung: hỏi server tin đang chờ của chính máy này rồi hiện lên.
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let msgs = [];
    try {
      const sub = await self.registration.pushManager.getSubscription();
      const res = await fetch(self.SO_API_URL, { method: 'POST', body: JSON.stringify({ action: 'inbox', endpoint: sub && sub.endpoint }) });
      msgs = (await res.json()).messages || [];
    } catch (err) { /* mất mạng thì hiện tin chung */ }
    if (!msgs.length) msgs = [{ title: 'Sổ Nhà Mập Nga Boi', body: 'Có tin mới trong sổ nè, vào xem đi.', url: './' }];
    for (const m of msgs) {
      await self.registration.showNotification(m.title || 'Sổ Nhà Mập Nga Boi', {
        body: m.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: m.tag || undefined, data: { url: m.url || './' },
      });
    }
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if ('focus' in c) { if ('navigate' in c) c.navigate(target); return c.focus(); }
    }
    return self.clients.openWindow(target);
  }));
});
