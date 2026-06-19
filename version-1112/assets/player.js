function initMoviePlayer(videoId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var loaded = false;

    if (!video || !cover || !streamUrl) {
        return;
    }

    function playVideo() {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    function attachStream(done) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', done, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, done);
            video.hlsStream = hls;
            return;
        }

        video.src = streamUrl;
        video.addEventListener('loadedmetadata', done, { once: true });
        video.load();
    }

    function start() {
        cover.classList.add('is-hidden');

        if (!loaded) {
            loaded = true;
            attachStream(playVideo);
            setTimeout(playVideo, 350);
            return;
        }

        playVideo();
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
}
