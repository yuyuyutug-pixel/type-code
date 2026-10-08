const CACHE='astro-lab15-v010';
const ASSETS=[
  './index.html',
  './manifest.webmanifest',
  './chunks/1.txt',
  './chunks/2.txt',
  './chunks/3.txt',
  './chunks/4.txt',
  './chunks/5.txt',
  './chunks/6.txt',
  './chunks/tail.txt'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  })));
});