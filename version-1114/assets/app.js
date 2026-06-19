(function () {
  var ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var activate = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate(current + 1);
    }, 5600);
  }

  function initFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-card-group]"));
    groups.forEach(function (group) {
      var input = group.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(group.querySelectorAll("[data-filter-chip]"));
      var cards = Array.prototype.slice.call(group.querySelectorAll("[data-movie-card]"));
      var selected = "all";
      var apply = function () {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = card.getAttribute("data-filter-text") || "";
          var region = (card.getAttribute("data-region") || "").toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesChip = selected === "all" || region === selected;
          card.style.display = matchesQuery && matchesChip ? "" : "none";
        });
      };
      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          selected = chip.getAttribute("data-filter-chip") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-player-overlay]");
      if (!video || !overlay) {
        return;
      }
      var hlsInstance = null;
      var started = false;
      var start = function () {
        var url = video.getAttribute("data-video-url");
        if (!url) {
          return;
        }
        overlay.hidden = true;
        if (!started) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            });
          } else {
            video.src = url;
          }
          started = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      };
      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!started) {
          start();
          return;
        }
        if (video.paused) {
          video.play().catch(function () {});
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var pageInput = document.querySelector("[data-search-page-input]");
    if (!results || !summary || !window.SITE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (pageInput) {
      pageInput.value = query;
    }
    var render = function (keyword) {
      var normalized = keyword.trim().toLowerCase();
      var list = window.SITE_SEARCH_DATA.filter(function (item) {
        return !normalized || item.search.indexOf(normalized) !== -1;
      }).slice(0, 120);
      summary.textContent = normalized ? "相关影片" : "精选影片";
      if (list.length === 0) {
        results.innerHTML = "<p class=\"empty-state\">未找到匹配影片</p>";
        return;
      }
      results.innerHTML = list.map(function (item) {
        return [
          "<article class=\"movie-card\">",
          "  <a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">",
          "    <img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" />",
          "    <span class=\"poster-shade\"></span>",
          "    <span class=\"play-ring\">▶</span>",
          "    <span class=\"region-badge\">" + escapeHtml(item.region) + "</span>",
          "    <span class=\"year-badge\">" + escapeHtml(item.year) + "</span>",
          "  </a>",
          "  <div class=\"card-copy\">",
          "    <h2><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>",
          "    <p>" + escapeHtml(item.oneLine) + "</p>",
          "    <div class=\"tag-row\"><span>" + escapeHtml(item.genre) + "</span></div>",
          "  </div>",
          "</article>"
        ].join("");
      }).join("");
    };
    Array.prototype.slice.call(document.querySelectorAll("[data-search-preset]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-search-preset") || "";
        if (pageInput) {
          pageInput.value = value;
        }
        render(value);
        var nextUrl = "./search.html?q=" + encodeURIComponent(value);
        window.history.replaceState(null, "", nextUrl);
      });
    });
    render(query);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }
})();
