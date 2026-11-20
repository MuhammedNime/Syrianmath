/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-5d155c7a'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "fc4e9376272e55c06ce83d24b3a90df2"
  }, {
    "url": "pwa-512x512.png",
    "revision": "840d302ef1f0bc685a62172b49652dc5"
  }, {
    "url": "pwa-192x192.png",
    "revision": "6d06211c22eb93fc9d51ec3fe9ee918d"
  }, {
    "url": "index.html",
    "revision": "5032212fcbc653aee821501bb128dbcc"
  }, {
    "url": "icon.svg",
    "revision": "d7cb3139b296123f66b936fd7961aedb"
  }, {
    "url": "icon-maskable.svg",
    "revision": "3275c2b1bf13cd65972253f2c8a42943"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8051e32decf5124848fe3b4fd97d35f0"
  }, {
    "url": "mathlive/fonts/KaTeX_Typewriter-Regular.woff2",
    "revision": "b8b8393d2e65fcebda5fa99fa3264f41"
  }, {
    "url": "mathlive/fonts/KaTeX_Size4-Regular.woff2",
    "revision": "61522cd3d9043622e235ab57762754f2"
  }, {
    "url": "mathlive/fonts/KaTeX_Size3-Regular.woff2",
    "revision": "9108a400f4787cffdcc3a3b813401e6a"
  }, {
    "url": "mathlive/fonts/KaTeX_Size2-Regular.woff2",
    "revision": "95a1da914c20455a07b7c9e2dcf2836d"
  }, {
    "url": "mathlive/fonts/KaTeX_Size1-Regular.woff2",
    "revision": "82ef26dc680ba60d884e051c73d9a42d"
  }, {
    "url": "mathlive/fonts/KaTeX_Script-Regular.woff2",
    "revision": "1b3161eb8cc67462d6e8c2fb96c68507"
  }, {
    "url": "mathlive/fonts/KaTeX_SansSerif-Regular.woff2",
    "revision": "1ac3ed6ebe34e473519ca1da86f7a384"
  }, {
    "url": "mathlive/fonts/KaTeX_SansSerif-Italic.woff2",
    "revision": "e934cbc86e2d59ceaf04102c43dc0b50"
  }, {
    "url": "mathlive/fonts/KaTeX_SansSerif-Bold.woff2",
    "revision": "ad546b4719bcf690a3604944b90b7e42"
  }, {
    "url": "mathlive/fonts/KaTeX_Math-Italic.woff2",
    "revision": "d8b7a801bd87b324efcbae7394119c24"
  }, {
    "url": "mathlive/fonts/KaTeX_Math-BoldItalic.woff2",
    "revision": "1320454d951ec809a7dbccb4f23fccf0"
  }, {
    "url": "mathlive/fonts/KaTeX_Main-Regular.woff2",
    "revision": "f8a7f19f45060f7a177314855b8c7aa3"
  }, {
    "url": "mathlive/fonts/KaTeX_Main-Italic.woff2",
    "revision": "652970624cde999882102fa2b6a8871f"
  }, {
    "url": "mathlive/fonts/KaTeX_Main-BoldItalic.woff2",
    "revision": "d873734390c716d6e18ff3f71ac6eb8b"
  }, {
    "url": "mathlive/fonts/KaTeX_Main-Bold.woff2",
    "revision": "a9382e25bcf75d856718fcef54d7acdb"
  }, {
    "url": "mathlive/fonts/KaTeX_Fraktur-Regular.woff2",
    "revision": "f9e6a99f4a543b7d6cad1efb6cf1e4b1"
  }, {
    "url": "mathlive/fonts/KaTeX_Fraktur-Bold.woff2",
    "revision": "796f3797cdf36fcaea18c3070a608378"
  }, {
    "url": "mathlive/fonts/KaTeX_Caligraphic-Regular.woff2",
    "revision": "08d95d99bf4a2b2dc7a876653857f154"
  }, {
    "url": "mathlive/fonts/KaTeX_Caligraphic-Bold.woff2",
    "revision": "a9e9b0953b078cd40f5e19ef4face6fc"
  }, {
    "url": "mathlive/fonts/KaTeX_AMS-Regular.woff2",
    "revision": "66c678209ce93b6e2b583f02ce41529e"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/web-BL-9oJuF.js",
    "revision": null
  }, {
    "url": "assets/trash-2-CTj9VMKx.js",
    "revision": null
  }, {
    "url": "assets/sparkles-Bm6aYi1r.js",
    "revision": null
  }, {
    "url": "assets/rotate-ccw-CiNmIi6z.js",
    "revision": null
  }, {
    "url": "assets/refresh-cw-SiPo6hSz.js",
    "revision": null
  }, {
    "url": "assets/plus-DHdELWoQ.js",
    "revision": null
  }, {
    "url": "assets/mathlive-DJ-knq2g.js",
    "revision": null
  }, {
    "url": "assets/loader-circle-Gptyyhqz.js",
    "revision": null
  }, {
    "url": "assets/index-D0vOOzb-.css",
    "revision": null
  }, {
    "url": "assets/index-CxapZAn2.js",
    "revision": null
  }, {
    "url": "assets/file-text-CdWGlF00.js",
    "revision": null
  }, {
    "url": "assets/eraser-n3PkYwZ9.js",
    "revision": null
  }, {
    "url": "assets/circle-play-BMwvu0yg.js",
    "revision": null
  }, {
    "url": "assets/chevron-up-DpDEhxpa.js",
    "revision": null
  }, {
    "url": "assets/chevron-right-CPSgP74q.js",
    "revision": null
  }, {
    "url": "assets/SmartTutorView-qOcgvjho.js",
    "revision": null
  }, {
    "url": "assets/MathChartBlock-B-7iMsSF.js",
    "revision": null
  }, {
    "url": "assets/LiveMathModal-BNpaO6VN.js",
    "revision": null
  }, {
    "url": "assets/LibraryView-C8Gfe2sF.js",
    "revision": null
  }, {
    "url": "assets/LessonPage-CQNyPG4n.js",
    "revision": null
  }, {
    "url": "assets/KaTeX_Typewriter-Regular-CO6r4hn1.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Typewriter-Regular-C0xS9mPB.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Size4-Regular-Dl5lxZxV.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Size4-Regular-BF-4gkZK.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Size3-Regular-CTq5MqoE.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Size2-Regular-oD1tc_U0.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Size2-Regular-Dy4dx90m.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Size1-Regular-mCD8mA8B.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Size1-Regular-C195tn64.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Script-Regular-D5yQViql.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Script-Regular-D3wIWfF6.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_SansSerif-Regular-DDBCnlJ7.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_SansSerif-Regular-CS6fqUqJ.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_SansSerif-Italic-DN2j7dab.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_SansSerif-Italic-C3H0VqGB.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_SansSerif-Bold-DbIhKOiC.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_SansSerif-Bold-D1sUS0GD.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Math-Italic-t53AETM-.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Math-Italic-DA0__PXp.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Math-BoldItalic-iY-2wyZ7.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Math-BoldItalic-CZnvNsCZ.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-Regular-Dr94JaBh.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-Regular-B22Nviop.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-Italic-NWA7e6Wa.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-Italic-BMLOBm91.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-BoldItalic-SpSLRI95.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-BoldItalic-DxDJ3AOS.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-Bold-Jm3AIy58.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Main-Bold-Cx986IdX.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Fraktur-Regular-Dxdc4cR9.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Fraktur-Regular-CTYiF6lA.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Fraktur-Bold-CL6g_b3V.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Fraktur-Bold-BsDP51OF.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Caligraphic-Regular-CTRA-rTL.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2",
    "revision": null
  }, {
    "url": "assets/KaTeX_Caligraphic-Bold-BEiXGLvX.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_AMS-Regular-DMm9YOAa.woff",
    "revision": null
  }, {
    "url": "assets/KaTeX_AMS-Regular-BQhdFMY1.woff2",
    "revision": null
  }, {
    "url": "assets/GradesLessonsView-71xiB5K9.js",
    "revision": null
  }, {
    "url": "assets/ExercisesQuizzesView-1mnxEjaL.js",
    "revision": null
  }, {
    "url": "assets/DrawingCanvasModal-JOjNn5AN.js",
    "revision": null
  }, {
    "url": "assets/CameraCaptureModal-CiOgucV8.js",
    "revision": null
  }, {
    "url": "assets/AdminConsoleView-ChsNu4ck.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8051e32decf5124848fe3b4fd97d35f0"
  }, {
    "url": "icon.svg",
    "revision": "d7cb3139b296123f66b936fd7961aedb"
  }, {
    "url": "pwa-192x192.png",
    "revision": "6d06211c22eb93fc9d51ec3fe9ee918d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "840d302ef1f0bc685a62172b49652dc5"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "fc4e9376272e55c06ce83d24b3a90df2"
  }, {
    "url": "manifest.webmanifest",
    "revision": "6e3ceb0770fa928d2f11fcb81b3398ad"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\/api\/(curriculum|grades|library\/books|lessons\/.+)$/i, new workbox.NetworkFirst({
    "cacheName": "syrian-math-api-cache",
    "networkTimeoutSeconds": 4,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 80,
      maxAgeSeconds: 1209600
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
