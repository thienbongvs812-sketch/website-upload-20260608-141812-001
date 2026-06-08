(function () {
    function canUseNativeHls(video) {
        return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    }

    function bindSource(video, source) {
        if (canUseNativeHls(video)) {
            if (video.src !== source) {
                video.src = source;
            }
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video.movieHls) {
                video.movieHls.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            video.movieHls = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                var resolved = false;
                var done = function () {
                    if (!resolved) {
                        resolved = true;
                        resolve();
                    }
                };
                hls.on(window.Hls.Events.MANIFEST_PARSED, done);
                window.setTimeout(done, 1400);
            });
        }
        if (video.src !== source) {
            video.src = source;
        }
        return Promise.resolve();
    }

    window.initializeMoviePlayer = function (options) {
        var video = document.querySelector(options.selector);
        var button = document.querySelector(options.buttonSelector);
        var source = options.source;
        if (!video || !source) {
            return;
        }
        var started = false;
        var start = function () {
            bindSource(video, source).then(function () {
                started = true;
                if (button) {
                    button.classList.add("is-hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            });
        };
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (button && !video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    };
})();
