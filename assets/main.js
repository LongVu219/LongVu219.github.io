(function () {
  var root = document.documentElement;

  // ---- theme toggle (saved choice wins, otherwise follow the system) ----
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // ---- hairline under the top bar once the page scrolls ----
  var bar = document.querySelector('.topbar');
  function onScroll() { if (bar) bar.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- UniCaMo clip: example tabs, tap-to-reveal control signal, play only when visible ----
  var BASE = 'https://phongnhhn.info/Unicamo/teaser/';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.work-media').forEach(function (media) {
    var clip = media.querySelector('[data-clip]');
    if (!clip) return;
    var video = clip.querySelector('video');
    var control = clip.querySelector('.control');
    var visible = false;

    function play() { if (visible && !reduceMotion) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } }

    media.querySelectorAll('.clip-tabs button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        media.querySelectorAll('.clip-tabs button').forEach(function (b) {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        var key = btn.getAttribute('data-src');
        video.src = BASE + key + '.mp4';
        control.src = BASE + key + '.png';
        clip.classList.remove('show-control');
        clip.setAttribute('aria-pressed', 'false');
        play();
      });
    });

    // mouse users get the control signal on hover; touch and keyboard users toggle it
    function flip() {
      clip.classList.toggle('show-control');
      clip.setAttribute('aria-pressed', clip.classList.contains('show-control') ? 'true' : 'false');
    }
    var canHover = window.matchMedia('(hover: hover)');
    clip.addEventListener('click', function () { if (!canHover.matches) flip(); });
    clip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visible = en.isIntersecting;
          if (visible) play(); else video.pause();
        });
      }, { threshold: 0.25 }).observe(clip);
    } else {
      visible = true;
      play();
    }
  });
})();
