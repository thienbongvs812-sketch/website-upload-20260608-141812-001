(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('.movie-player');
        var startButton = shell.querySelector('[data-player-start]');
        var status = shell.querySelector('[data-player-status]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var initialized = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function initialize() {
            if (initialized || !source) {
                return;
            }
            initialized = true;
            setStatus('正在初始化播放源');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源已就绪');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络错误，正在重试');
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体错误，尝试恢复');
                        hlsInstance.recoverMediaError();
                    } else {
                        setStatus('播放源暂时无法加载');
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('使用浏览器原生 HLS 播放');
            } else {
                video.src = source;
                setStatus('当前浏览器需要 HLS 支持');
            }
        }

        function play() {
            initialize();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus('请再次点击播放按钮');
                });
            }
        }

        if (startButton) {
            startButton.addEventListener('click', play);
        }
        video.addEventListener('click', play);
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
            setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
            setStatus('已暂停');
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
            setStatus('播放结束');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
})();
