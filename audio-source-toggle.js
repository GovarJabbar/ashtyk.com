// Audio source toggle: auto-detects B2 availability, falls back to Archive.org
(function() {
  var B2_BASE = 'https://f003.backblazeb2.com/file/ashtyk/files/';
  var B2_HEALTH = 'https://f003.backblazeb2.com/file/ashtyk/health.txt';
  var ARCHIVE_BASE = 'https://archive.org/download/ashtyk-website-archive/files/';
  var CACHE_KEY = 'audioSource';
  var CACHE_TIME_KEY = 'audioSourceChecked';
  var MANUAL_KEY = 'audioSourceManual';
  var CACHE_TTL = 3600000; // re-check every 1 hour

  function getBase(src) {
    return src === 'b2' ? B2_BASE : ARCHIVE_BASE;
  }

  function swapLinks(from, to) {
    if (from === to) return;
    var links = document.querySelectorAll('a[href*="' + from + '"]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = links[i].href.replace(from, to);
    }
    var players = document.querySelectorAll('[id*="' + from + '"]');
    for (var j = 0; j < players.length; j++) {
      players[j].id = players[j].id.replace(from, to);
    }
  }

  function applySource(src) {
    if (src === 'b2') {
      swapLinks(ARCHIVE_BASE, B2_BASE);
    }
  }

  function updateButton(btn, src, auto) {
    if (src === 'b2') {
      btn.innerHTML = '&#9729; B2' + (auto ? ' &#10003;' : '');
      btn.style.background = '#2a7b3f';
      btn.title = 'Audio: Backblaze B2 (click to switch)';
    } else {
      btn.innerHTML = '&#127968; Archive' + (auto ? ' &#10003;' : '');
      btn.style.background = '#c44';
      btn.title = 'Audio: Archive.org (click to switch)';
    }
  }

  function addButton(src, auto) {
    var btn = document.createElement('button');
    btn.id = 'audio-source-btn';
    btn.style.cssText = 'color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;margin-right:10px;font-family:sans-serif;';
    btn.dataset.src = src;
    updateButton(btn, src, auto);

    btn.onclick = function() {
      var from = btn.dataset.src;
      var next = from === 'b2' ? 'archive' : 'b2';
      swapLinks(getBase(from), getBase(next));
      btn.dataset.src = next;
      updateButton(btn, next, false);
      // Save manual choice — this overrides auto-detect until cleared
      try {
        localStorage.setItem(MANUAL_KEY, next);
        localStorage.setItem(CACHE_KEY, next);
      } catch(e) {}
    };

    var nav = document.querySelector('.art-hmenu');
    if (nav) {
      var li = document.createElement('li');
      li.style.cssText = 'display:inline-block;padding:6px 4px;';
      li.appendChild(btn);
      nav.insertBefore(li, nav.firstChild);
    }
  }

  function checkB2(callback) {
    // If user manually chose, respect that
    try {
      var manual = localStorage.getItem(MANUAL_KEY);
      if (manual) {
        callback(manual, false);
        return;
      }
    } catch(e) {}

    // Check auto-detect cache
    try {
      var cached = localStorage.getItem(CACHE_KEY);
      var checkedAt = parseInt(localStorage.getItem(CACHE_TIME_KEY) || '0');
      if (cached && (Date.now() - checkedAt) < CACHE_TTL) {
        callback(cached, true);
        return;
      }
    } catch(e) {}

    // Ping B2 health file — use <img> trick to avoid CORS issues
    var img = new Image();
    var done = false;
    var timer = setTimeout(function() {
      if (done) return;
      done = true;
      // Timeout — B2 is down or blocked, use archive
      try { localStorage.setItem(CACHE_KEY, 'archive'); localStorage.setItem(CACHE_TIME_KEY, '' + Date.now()); } catch(e) {}
      callback('archive', true);
    }, 3000);

    img.onload = function() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { localStorage.setItem(CACHE_KEY, 'b2'); localStorage.setItem(CACHE_TIME_KEY, '' + Date.now()); } catch(e) {}
      callback('b2', true);
    };

    img.onerror = function() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      // onerror fires for non-image responses too — but it means the server responded
      // So B2 is up, the file just isn't an image. That's fine.
      try { localStorage.setItem(CACHE_KEY, 'b2'); localStorage.setItem(CACHE_TIME_KEY, '' + Date.now()); } catch(e) {}
      callback('b2', true);
    };

    img.src = B2_HEALTH + '?t=' + Date.now();
  }

  function init() {
    checkB2(function(src, auto) {
      applySource(src);
      addButton(src, auto);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
