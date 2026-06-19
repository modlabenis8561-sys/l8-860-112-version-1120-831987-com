(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-region") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));
    inputs.forEach(function (input) {
      var target = document.getElementById(input.getAttribute("data-filter-target"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var matched = !query || textOf(card).indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        var existing = target.nextElementSibling;
        if (existing && existing.classList.contains("empty-state")) {
          existing.hidden = visible !== 0;
        } else if (visible === 0) {
          var empty = document.createElement("p");
          empty.className = "empty-state";
          empty.textContent = target.getAttribute("data-empty-message") || "未找到匹配内容";
          target.parentNode.insertBefore(empty, target.nextSibling);
        }
      });
    });
  }

  function initSearchBoard() {
    var board = document.querySelector("[data-search-board]");
    if (!board) {
      return;
    }
    var input = board.querySelector("[data-search-input]");
    var category = board.querySelector("[data-category-select]");
    var year = board.querySelector("[data-year-select]");
    var type = board.querySelector("[data-type-select]");
    var cards = Array.prototype.slice.call(board.querySelectorAll(".movie-card"));
    var empty = board.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var categoryValue = category ? category.value : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;
        if (query && textOf(card).indexOf(query) === -1) {
          matched = false;
        }
        if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
          matched = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          matched = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.setupMoviePlayer = function (id, src) {
    var shell = document.getElementById(id);
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-veil");
    var loading = shell.querySelector(".player-loading");
    var message = shell.querySelector(".player-message");
    var hls = null;
    var attached = false;
    var pending = null;

    function showLoading(show) {
      if (loading) {
        loading.hidden = !show;
      }
    }

    function showMessage(show) {
      if (message) {
        message.hidden = !show;
      }
    }

    function attach() {
      if (attached) {
        return pending || Promise.resolve();
      }
      attached = true;
      showLoading(true);
      showMessage(false);

      pending = new Promise(function (resolve, reject) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            showLoading(false);
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showLoading(false);
              showMessage(true);
              reject(new Error("playback"));
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", function () {
            showLoading(false);
            resolve();
          }, { once: true });
          video.addEventListener("error", function () {
            showLoading(false);
            showMessage(true);
            reject(new Error("playback"));
          }, { once: true });
        } else {
          showLoading(false);
          showMessage(true);
          reject(new Error("unsupported"));
        }
      });

      return pending;
    }

    function play() {
      attach().then(function () {
        video.controls = true;
        shell.classList.add("is-playing");
        return video.play();
      }).catch(function () {
        showLoading(false);
        showMessage(true);
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchBoard();
  });
})();
