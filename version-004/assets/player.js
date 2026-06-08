
function createPlayer(videoId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var initialized = false;

  if (!video || !button || !sourceUrl) {
    return;
  }

  function bindSource() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function playVideo() {
    bindSource();
    button.classList.add("is-hidden");
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
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
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
