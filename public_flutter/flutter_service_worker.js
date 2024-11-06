'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "6e425fe14b5f268cc646016b59e87b49",
"version.json": "5e1c71506621745632096b358829463d",
"index.html": "d80664882b3e55c22629f89ed1a4c6a7",
"/": "d80664882b3e55c22629f89ed1a4c6a7",
"main.dart.js": "0ac4dddf73df57243dcc290369bc12d7",
"flutter.js": "383e55f7f3cce5be08fcf1f3881f585c",
"index_old.html": "cb5a03fef4b406be22227f52f1019628",
"favicon.png": "834b960de681cb186bbd98e2303396f4",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "881d08734865b181d3fadcd2c094f4ff",
"assets/asset/roundfix.png": "ed42a17ed8282bd528ed99db8683d691",
"assets/asset/no_image.png": "d01e7fe7078bd8f8c7500413f68dfe60",
"assets/asset/eclip.png": "3387c3cfbd6295e329cc985ca97c92c9",
"assets/asset/round.png": "b14a3526de14b6da9d77c46f13725735",
"assets/asset/bgcolor2.png": "468131731d92852b5bdfe79fc2b8a226",
"assets/asset/blackbg.png": "738dd3c3773a346fac956ece2c3d2c13",
"assets/asset/bgcolor1.png": "82d96ce68c167c1c250c8a403e14b7e1",
"assets/asset/bg_sample_4.jpg": "ec407651ccfa2ef30a08384cf9a71ef6",
"assets/asset/circle.png": "5e9ed5dac36602cf93aec6c028be7f28",
"assets/asset/bg_sample_3.jpg": "12d38386c1e53403b0206feb88e4a33f",
"assets/asset/image/logo_renew.png": "51456b9f214904eefe8394293e885900",
"assets/asset/image/logo_new.png": "8b3e6515bdc352ff9052294184f41451",
"assets/asset/image/bg2_original.jpg": "e47527b44d216f5957a071cdbc088c39",
"assets/asset/bg_color2.png": "aa190769fb43ed2100171c3502e1044a",
"assets/asset/bg_color1.png": "82d96ce68c167c1c250c8a403e14b7e1",
"assets/asset/bg_sample1.jpg": "14e9145789867f12a54a35e734655193",
"assets/asset/bg_video_vegas_plaza.mp4": "5388bc6623cd3e90f0f0fb168ff8ca71",
"assets/asset/bg2.jpg": "8dcf2600e15c7b9b3bbadf94babcf079",
"assets/asset/bg_sample2.jpg": "c38b54fe8632c015a30bb3681f77f9ab",
"assets/asset/font/Poppins-Light.ttf": "fcc40ae9a542d001971e53eaed948410",
"assets/asset/font/Poppins-Medium.ttf": "bf59c687bc6d3a70204d3944082c5cc0",
"assets/asset/font/Poppins-Regular.ttf": "093ee89be9ede30383f39a899c485a82",
"assets/asset/font/Poppins-Bold.ttf": "08c20a487911694291bd8c5de41315ad",
"assets/asset/font/Poppins-Black.ttf": "14d00dab1f6802e787183ecab5cce85e",
"assets/asset/font/Poppins-Thin.ttf": "9ec263601ee3fcd71763941207c9ad0d",
"assets/asset/bg_video.mp4": "bc7d43ede3f7199677d03468e8069cec",
"assets/asset/layout.jpeg": "54c7e001c7ac91339ec0da19f4e5af02",
"assets/asset/square.png": "ffcf9d09d04cdc7f6ea3e83054fe7bc0",
"assets/asset/bg.jpg": "3827f5e3fcea884a57ed71af0e0e4cfc",
"assets/AssetManifest.json": "c66abec1d50792b7cf3ea643da6ec533",
"assets/NOTICES": "aaee5a5883aa9da2ae979cf149d14628",
"assets/FontManifest.json": "63281437c1eb5ec5c806dc9163605afd",
"assets/AssetManifest.bin.json": "6d1a03dacf7e84b65a531cfd75c62f14",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b93248a553f9e8bc17f1065929d5934b",
"assets/packages/fluttertoast/assets/toastify.js": "56e2c9cedd97f10e7e5f1cebd85d53e3",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/packages/wakelock_plus/assets/no_sleep.js": "7748a45cd593f33280669b29c2c8919a",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "579c5f9ba94ab59566f6793105016d92",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"canvaskit/skwasm.js": "f17a293d422e2c0b3a04962e68236cc2",
"canvaskit/skwasm.js.symbols": "c4ccfde2b701d591395ceb7a62c86304",
"canvaskit/canvaskit.js.symbols": "003797afc47f3c6539a71f06f06e6349",
"canvaskit/skwasm.wasm": "f188a1bd2adcc3934ec096de7939f484",
"canvaskit/chromium/canvaskit.js.symbols": "295a1fdaf7a86a9f9bd6186781f44ece",
"canvaskit/chromium/canvaskit.js": "901bb9e28fac643b7da75ecfd3339f3f",
"canvaskit/chromium/canvaskit.wasm": "ae464726be5743e1dbee1f86ccd7e96b",
"canvaskit/canvaskit.js": "738255d00768497e86aa4ca510cce1e1",
"canvaskit/canvaskit.wasm": "b3ab261ffaef884b7c1c58bf9790d054",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
