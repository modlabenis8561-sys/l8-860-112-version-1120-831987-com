import { H as Hls } from './hls.js';

const shell = document.querySelector('[data-player]');

if (shell) {
  const video = shell.querySelector('video');
  const overlay = shell.querySelector('[data-play-button]');
  const streamUrl = shell.getAttribute('data-stream-url');
  let prepared = false;
  let hls = null;

  const prepare = function () {
    if (prepared || !video || !streamUrl) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  };

  const play = function () {
    prepare();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (video) {
      video.play().catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
