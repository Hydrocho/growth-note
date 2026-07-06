const assert = require("assert");
const fs = require("fs");
const path = require("path");

const sw = fs.readFileSync(path.join(__dirname, "../../sw.js"), "utf8");

assert(
  sw.includes('const CACHE_NAME = "growth-note-cache-v2";'),
  "service worker cache name should change when cache behavior changes"
);

for (const copy of [
  "function shouldUseNetworkFirst(request)",
  'destination === "document"',
  'destination === "style"',
  'destination === "script"',
  "fetch(event.request)",
  "cache.put(request, responseToCache)",
  "return cachedResponse"
]) {
  assert(sw.includes(copy), `service worker should use network-first for app shell updates: ${copy}`);
}

assert(
  !sw.includes("if (cachedResponse) {\n          return cachedResponse;\n        }\n        return fetch(event.request)"),
  "service worker should not use cache-first for every cached asset"
);

console.log("service-worker-cache.test.js passed");
