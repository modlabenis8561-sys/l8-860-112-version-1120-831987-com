(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        var active = position === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
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
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var scope = input.closest("[data-search-scope]");
      if (!scope) {
        scope = document;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      function apply(value) {
        var query = String(value || "").trim().toLowerCase();
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          card.hidden = query.length > 0 && text.indexOf(query) === -1;
        });
      }
      input.addEventListener("input", function () {
        apply(input.value);
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
        apply(q);
      }
      Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]")).forEach(function (button) {
        button.addEventListener("click", function () {
          input.value = button.getAttribute("data-filter-value") || "";
          apply(input.value);
          input.focus();
        });
      });
    });
  }

  function prepareVideo(video) {
    var url = video.getAttribute("data-url");
    if (!url) {
      return;
    }
    if (video.getAttribute("data-ready") === "yes") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.setAttribute("data-ready", "yes");
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var player = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      player.loadSource(url);
      player.attachMedia(video);
      video.hlsPlayer = player;
      video.setAttribute("data-ready", "yes");
      return;
    }
    video.setAttribute("data-ready", "no");
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
      var video = shell.querySelector(".movie-video");
      var cover = shell.querySelector(".player-cover");
      if (!video || !cover) {
        return;
      }
      function start() {
        prepareVideo(video);
        shell.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      cover.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
