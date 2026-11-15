/* Guarda la app en el celular para que abra sin internet. Siempre intenta primero la versión más nueva.
   Fotos y videos van en una caché aparte que no se borra con cada versión: se bajan una sola vez. */
const CACHE="consultorio-v7", MEDIA="consultorio-media-v2";
const CORE=["./","index.html","manifest.webmanifest","icon-v3-192.png","icon-v3-512.png","img/rolo.webp","img/mateo.webp","data/consultorio.enc","data/vacunas.enc","data/manual.enc","data/comida.enc"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==MEDIA).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin||req.headers.has("range")) return;
  if(/\/(vid|img)\//.test(url.pathname)){
    e.respondWith(caches.open(MEDIA).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.status===200)c.put(req,r.clone());return r;}))));
    return;
  }
  e.respondWith(fetch(req).then(r=>{
    if(r.status===200){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}
    return r;
  }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))));
});
