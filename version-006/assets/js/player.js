(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupPlayer(root) {
        var video = root.querySelector('[data-video]');
        var button = root.querySelector('[data-player-play]');
        var status = root.querySelector('[data-player-status]');
        var frame = root.querySelector('.video-frame');
        var source = root.getAttribute('data-src');
        var hls = null;
        var sourceReady = false;

        if (!video || !source) {
            if (status) {
                status.textContent = '播放源未配置';
            }
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function markPlaying(isPlaying) {
            if (frame) {
                frame.classList.toggle('is-playing', isPlaying);
            }
        }

        function attachSource() {
            if (sourceReady) {
                return;
            }

            sourceReady = true;
            setStatus('正在加载播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源已就绪');
                });

                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络异常，正在重试...');
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体异常，正在恢复...');
                        hls.recoverMediaError();
                    } else {
                        setStatus('播放失败，请稍后重试');
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('播放源已就绪');
                }, { once: true });
            } else {
                setStatus('当前浏览器不支持 HLS 播放');
            }
        }

        function playOrPause() {
            attachSource();
            if (video.paused) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setStatus('浏览器阻止自动播放，请再次点击播放');
                    });
                }
            } else {
                video.pause();
            }
        }

        video.setAttribute('controls', 'controls');
        attachSource();

        if (button) {
            button.addEventListener('click', playOrPause);
        }

        video.addEventListener('play', function () {
            markPlaying(true);
            setStatus('正在播放');
        });

        video.addEventListener('pause', function () {
            markPlaying(false);
            setStatus('已暂停');
        });

        video.addEventListener('ended', function () {
            markPlaying(false);
            setStatus('播放结束');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(setupPlayer);
    });
}());
