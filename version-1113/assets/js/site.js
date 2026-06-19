(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupPageFilter() {
    const forms = Array.from(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      const input = form.querySelector("[data-filter-input]");
      const scope = form.closest("main") || document;
      const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
      if (!input || cards.length === 0) {
        return;
      }

      function filterCards() {
        const query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden", query !== "" && text.indexOf(query) === -1);
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filterCards();
      });
      input.addEventListener("input", filterCards);
    });
  }

  function createSearchCard(movie) {
    const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    return [
      '<article class="movie-card" data-movie-card>',
      '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine || "") + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.region || "") + '</span><span>' + escapeHtml(movie.year || "") + '</span><span>' + escapeHtml(movie.type || "") + '</span></div>',
      '<div class="tag-row">' + tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function setupGlobalSearch() {
    const form = document.querySelector("[data-global-search-form]");
    const input = document.querySelector("[data-global-search-input]");
    const results = document.querySelector("[data-global-search-results]");
    const data = window.MOVIE_SEARCH_DATA;
    if (!form || !input || !results || !Array.isArray(data)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }

    function render() {
      const query = input.value.trim().toLowerCase();
      const list = query
        ? data.filter(function (movie) {
            const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
            return text.indexOf(query) !== -1;
          }).slice(0, 96)
        : data.slice(0, 24);
      results.innerHTML = list.map(createSearchCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = input.value.trim();
      const url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.history.replaceState(null, "", url);
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupPageFilter();
    setupGlobalSearch();
  });
}());
