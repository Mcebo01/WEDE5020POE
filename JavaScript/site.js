/* Lightweight site enhancements for SportsStatsHub
   - Tabs (data-tab)
   - Gallery Lightbox (click .gallery-img)
   - Dynamic gallery population from data/players.json (if .gallery-grid has data-src)
   - Search/filter for player gallery (form id="playerSearch" or #searchInput)
   - Leaflet map init for an element with id="map" and data-lat/data-lng attributes
   - Accessible keyboard support (Escape to close lightbox)
*/

(function () {
  'use strict';

  /* Utility: addClass/removeClass */
  function qsa(selector, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(selector)); }
  function el(selector, ctx) { return (ctx || document).querySelector(selector); }

  /* Tabs: buttons with .tab-btn and data-tab attribute; target .tab-content with id `${profileId}-${tab}` or id given */
  function initTabs() {
    qsa('.profile-tabs').forEach(tabBar => {
      tabBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.tab-btn');
        if (!btn) return;
        var tabName = btn.getAttribute('data-tab');
        var parent = tabBar.parentElement;
        // deactivate other buttons in this tabBar
        qsa('.tab-btn', tabBar).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // find all tab-content siblings within parent container and toggle
        var container = parent;
        qsa('.tab-content', container).forEach(tc => tc.classList.remove('active'));
        // try common id pattern first
        var target = document.getElementById(tabName) || el(`#${container.id}-${tabName}`) || el(`.${tabName}`);
        if (target) {
          target.classList.add('active');
        } else {
          // fallback: find matching data-tab on tab-content
          var alt = qsa('.tab-content').find && qsa('.tab-content').find(c => c.getAttribute('data-tab') === tabName);
          if (alt) alt.classList.add('active');
        }
      });
    });
  }

  /* Lightbox */
  function initLightbox() {
    // create overlay markup once
    var overlay = document.createElement('div');
    overlay.id = 'ssb-lightbox';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;z-index:9999;padding:1rem;';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<button id="ssb-lightbox-close" aria-label="Close image" style="position:absolute;top:1rem;right:1rem;background:transparent;border:none;color:#fff;font-size:2rem;cursor:pointer">×</button><div id="ssb-lightbox-inner" style="max-width:1100px;max-height:90vh;overflow:auto;border-radius:6px"></div>';
    document.body.appendChild(overlay);

    var inner = el('#ssb-lightbox-inner');
    var closeBtn = el('#ssb-lightbox-close');

    function openLightbox(imgSrc, alt) {
      inner.innerHTML = '';
      var img = document.createElement('img');
      img.src = imgSrc;
      img.alt = alt || '';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '0 auto';
      inner.appendChild(img);
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // click images with class .gallery-img
    document.addEventListener('click', function (e) {
      var img = e.target.closest('.gallery-img');
      if (!img) return;
      var src = img.getAttribute('data-large') || img.src;
      var alt = img.alt || img.getAttribute('data-alt') || '';
      openLightbox(src, alt);
    });

    // close handlers
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    closeBtn.addEventListener('click', closeLightbox);

    // ESC to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') closeLightbox();
    });
  }

  /* Dynamic gallery population */
  function populateGallery() {
    qsa('.gallery-grid').forEach(async function (grid) {
      var src = grid.getAttribute('data-src');
      if (!src) return;
      try {
        var res = await fetch(src, {cache: 'no-store'});
        if (!res.ok) throw new Error('Failed to fetch ' + src);
        var data = await res.json();
        // clear existing and render
        grid.innerHTML = '';
        data.forEach(player => {
          var img = document.createElement('img');
          img.className = 'gallery-img';
          img.src = player.image;
          img.alt = player.name;
          img.setAttribute('data-player', player.profileId || player.id || '');
          img.setAttribute('data-large', player.imageLarge || player.image);
          img.setAttribute('data-name', player.name);
          img.tabIndex = 0;
          // keyboard activate (Enter)
          img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') img.click();
          });
          // create caption wrapper if desired
          var figure = document.createElement('figure');
          figure.style.margin = '0';
          figure.style.textAlign = 'center';
          figure.appendChild(img);
          var figcap = document.createElement('figcaption');
          figcap.style.fontSize = '0.95rem';
          figcap.style.marginTop = '0.35rem';
          figcap.style.color = '#222';
          figcap.textContent = player.name;
          figure.appendChild(figcap);
          grid.appendChild(figure);
        });
      } catch (err) {
        console.warn('populateGallery error:', err);
      }
    });
  }

  /* Search / Filter */
  function initSearchFilter() {
    var form = el('#playerSearch');
    var input = el('#searchInput') || (form && form.querySelector('input'));
    if (!input) return;

    // support form submit and input events
    function doFilter(e) {
      if (e) e.preventDefault && e.preventDefault();
      var q = (input.value || '').trim().toLowerCase();
      var imgs = qsa('.gallery-grid .gallery-img');
      imgs.forEach(img => {
        var name = (img.getAttribute('data-name') || img.alt || '').toLowerCase();
        var profile = (img.getAttribute('data-player') || '').toLowerCase();
        var visible = !q || name.indexOf(q) !== -1 || profile.indexOf(q) !== -1;
        img.closest('figure') && (img.closest('figure').style.display = visible ? '' : 'none');
      });
    }

    form && form.addEventListener('submit', doFilter);
    input.addEventListener('input', function () {
      // live filter
      doFilter();
    });
  }

  /* Initialize Leaflet map if #map present
     Expects a div#map with data-lat and data-lng attributes (numbers).
     If not present, map init is skipped.
     Leaflet CSS/JS must be included in HTML (CDN links recommended):
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  */
  function initLeaflet() {
    if (typeof L === 'undefined') return; // leaflet not loaded
    var mapEl = el('#map');
    if (!mapEl) return;
    var lat = parseFloat(mapEl.getAttribute('data-lat')) || -26.3977477;
    var lng = parseFloat(mapEl.getAttribute('data-lng')) || 27.8080104;
    var zoom = parseInt(mapEl.getAttribute('data-zoom')) || 13;
    try {
      var map = L.map('map', {scrollWheelZoom: false}).setView([lat, lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
    } catch (err) {
      console.warn('Leaflet init failed:', err);
    }
  }

  /* Add minimal CSS classes for focus visible for keyboard users */
  function initFocusVisible() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') document.body.classList.add('show-focus');
    });
    document.addEventListener('mousedown', function () {
      document.body.classList.remove('show-focus');
    });
  }

  /* Auto-run initialization on DOMContentLoaded */
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initLightbox();
    populateGallery().then(function () {
      initSearchFilter();
    });
    initLeaflet();
    initFocusVisible();
    // activate nav link matching current path
    (function activeNav() {
      var current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
      qsa('nav a').forEach(a => {
        var href = (a.getAttribute('href') || '').toLowerCase();
        if (href === current || (href === 'index.html' && (current === '' || current === 'index.html'))) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
      });
    })();
  });

})();