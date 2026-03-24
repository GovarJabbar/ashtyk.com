// Audio source toggle: B2 (default) vs Archive.org
(function() {
  var B2_BASE = 'https://f003.backblazeb2.com/file/ashtyk/files/';
  var ARCHIVE_BASE = 'https://archive.org/download/ashtyk-website-archive/uploads/files/';
  var STORAGE_KEY = 'audioSource';

  function getSource() {
    try { return localStorage.getItem(STORAGE_KEY) || 'b2'; } catch(e) { return 'b2'; }
  }

  function setSource(src) {
    try { localStorage.setItem(STORAGE_KEY, src); } catch(e) {}
  }

  function getBase(src) {
    return src === 'b2' ? B2_BASE : ARCHIVE_BASE;
  }

  function getOtherBase(src) {
    return src === 'b2' ? ARCHIVE_BASE : B2_BASE;
  }

  function swapLinks(from, to) {
    // Swap href attributes
    var links = document.querySelectorAll('a[href*="' + from + '"]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = links[i].href.replace(from, to);
    }
    // Swap clickplay IDs (audio player)
    var players = document.querySelectorAll('[id*="' + from + '"]');
    for (var j = 0; j < players.length; j++) {
      players[j].id = players[j].id.replace(from, to);
    }
  }

  function updateButton(btn, src) {
    if (src === 'b2') {
      btn.innerHTML = '&#9729; B2';
      btn.title = 'Audio from Backblaze B2 (click to switch to Archive.org)';
    } else {
      btn.innerHTML = '&#127968; Archive';
      btn.title = 'Audio from Archive.org (click to switch to Backblaze B2)';
    }
  }

  function init() {
    var source = getSource();

    // On page load, links point to archive.org in HTML — swap to B2 if needed
    if (source === 'b2') {
      swapLinks(ARCHIVE_BASE, B2_BASE);
    }

    // Create toggle button
    var btn = document.createElement('button');
    btn.id = 'audio-source-btn';
    btn.style.cssText = 'background:#2a7b3f;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:13px;margin-right:10px;font-family:sans-serif;';
    updateButton(btn, source);

    btn.onclick = function() {
      var current = getSource();
      var next = current === 'b2' ? 'archive' : 'b2';
      swapLinks(getBase(current), getBase(next));
      setSource(next);
      updateButton(btn, next);
    };

    // Insert into nav bar
    var nav = document.querySelector('.art-hmenu');
    if (nav) {
      var li = document.createElement('li');
      li.style.cssText = 'display:inline-block;padding:6px 4px;';
      li.appendChild(btn);
      nav.insertBefore(li, nav.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
