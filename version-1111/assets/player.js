var SitePlayer = (function () {
    function mount(videoId, url, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var initialized = false;
        var instance = null;

        function play() {
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (!initialized) {
                initialized = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    instance.loadSource(url);
                    instance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!initialized) {
                    play();
                }
            });
            video.addEventListener("error", function () {
                if (instance) {
                    instance.destroy();
                    instance = null;
                    initialized = false;
                }
            });
        }
    }

    return {
        mount: mount
    };
})();
