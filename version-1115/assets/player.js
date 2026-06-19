document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-toggle');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var hlsInstance = null;
    var loaded = false;

    function attachStream() {
      if (!video || !streamUrl || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = streamUrl;
      loaded = true;
    }

    function startPlayback() {
      attachStream();

      if (!video) {
        return;
      }

      var attempt = video.play();

      if (attempt && typeof attempt.then === 'function') {
        attempt.then(function () {
          box.classList.add('is-playing');
        }).catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      attachStream();

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
