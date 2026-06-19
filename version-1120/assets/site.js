(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var mobileToggle = $('[data-mobile-toggle]');
  var mobileNav = $('[data-mobile-nav]');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = $all('[data-hero-slide]');
  var dots = $all('[data-hero-dot]');
  var prev = $('[data-hero-prev]');
  var next = $('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  function startHero() {
    if (heroTimer) {
      clearInterval(heroTimer);
    }
    if (slides.length > 1) {
      heroTimer = setInterval(function () {
        showHero(heroIndex + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        startHero();
      });
    }
    startHero();
  }

  var listingGrid = $('[data-listing-grid]');
  var filterInput = $('[data-filter-input]');
  var sortSelect = $('[data-sort-select]');
  if (listingGrid && (filterInput || sortSelect)) {
    var cards = $all('.movie-card', listingGrid);
    var originalCards = cards.slice();

    function applyListing() {
      var keyword = filterInput ? text(filterInput.value) : '';
      var sorted = cards.slice();
      var sortValue = sortSelect ? sortSelect.value : 'default';

      if (sortValue === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else if (sortValue === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        });
      } else if (sortValue === 'title') {
        sorted.sort(function (a, b) {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        });
      } else {
        sorted = originalCards.slice();
      }

      sorted.forEach(function (card) {
        listingGrid.appendChild(card);
        var haystack = text([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        card.classList.toggle('is-hidden-by-filter', Boolean(keyword && haystack.indexOf(keyword) === -1));
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyListing);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applyListing);
    }
  }

  var searchInput = $('#site-search');
  var searchButton = $('[data-search-button]');
  var searchResults = $('#search-results');

  function buildSearchCard(item) {
    return '<article class="movie-card">' +
      '<a class="movie-cover" href="./' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="cover-shade"></span><span class="card-play">▶</span></a>' +
      '<div class="movie-card-body"><a class="movie-title" href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div></div>' +
      '</article>';
  }

  function performSearch() {
    if (!searchInput || !searchResults || !window.searchIndex) {
      return;
    }
    var q = text(searchInput.value);
    if (!q) {
      searchResults.innerHTML = '';
      return;
    }
    var results = window.searchIndex.filter(function (item) {
      return text([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ')).indexOf(q) !== -1;
    }).slice(0, 120);
    searchResults.innerHTML = results.map(buildSearchCard).join('');
  }

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', performSearch);
    if (searchButton) {
      searchButton.addEventListener('click', performSearch);
    }
    performSearch();
  }

  function initPlayer() {
    var shell = $('.player-shell');
    if (!shell || !window.playerConfig || !window.playerConfig.url) {
      return;
    }
    var video = $('.player-video', shell);
    var layer = $('.play-layer', shell);
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      var url = window.playerConfig.url;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      attach();
      shell.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          shell.classList.remove('is-playing');
        }
      });
    }
  }

  initPlayer();
})();
