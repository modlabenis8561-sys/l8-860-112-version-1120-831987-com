(function () {
  function initMoviePlayer(source) {
    const video = document.querySelector("[data-player-video]");
    const button = document.querySelector("[data-player-button]");
    if (!video || !button || !source) {
      return;
    }

    let attached = false;
    let hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
    }

    function start() {
      attach();
      button.classList.add("is-hidden");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
