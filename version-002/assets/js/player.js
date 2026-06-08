import { H as Hls } from "./hls-vendor-dru42stk.js";

function setMessage(shell, text) {
    var message = shell.querySelector(".player-message");
    if (message) {
        message.textContent = text || "";
    }
}

function initializePlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-trigger");
    var source = shell.getAttribute("data-video-src");

    if (!video || !source) {
        setMessage(shell, "未找到播放源。");
        return;
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                setMessage(shell, "浏览器阻止了自动播放，请再次点击视频播放按钮。");
            });
        }
    }

    if (button) {
        button.classList.add("is-hidden");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        setMessage(shell, "正在加载原生 HLS 播放源…");
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setMessage(shell, "播放源已就绪。");
            playVideo();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setMessage(shell, "播放暂时不可用，请稍后重试。错误类型：" + data.type);
                hls.destroy();
            }
        });
        shell.hlsInstance = hls;
        setMessage(shell, "正在初始化 HLS 播放器…");
        return;
    }

    video.src = source;
    video.load();
    playVideo();
    setMessage(shell, "当前浏览器未启用 HLS.js，已尝试直接播放。 ");
}

function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
    shells.forEach(function (shell) {
        var button = shell.querySelector(".play-trigger");
        if (button) {
            button.addEventListener("click", function () {
                initializePlayer(shell);
            });
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPlayers);
} else {
    setupPlayers();
}
