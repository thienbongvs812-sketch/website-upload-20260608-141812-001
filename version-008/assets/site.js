(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initImages() {
    var images = document.querySelectorAll("img[data-cover]");
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("cover-missing");
      });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function initPlayers() {
    var players = document.querySelectorAll(".player-shell[data-source]");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-cover");
      var url = player.getAttribute("data-source");
      var hlsInstance = null;

      function prepare() {
        if (!video || video.dataset.ready === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        video.dataset.ready = "1";
      }

      function play(event) {
        if (event) {
          event.preventDefault();
        }
        prepare();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("click", function () {
          prepare();
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function cardHtml(item) {
    var tags = item.genre.split(/[，,\/、|；;]+/).filter(Boolean).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag.trim()) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\">",
      "    <img data-cover src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "    <span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>",
      "  </a>",
      "  <div class=\"card-body\">",
      "    <h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "    <p class=\"card-meta\">" + escapeHtml(item.year + " · " + item.region + " · " + item.type) + "</p>",
      "    <p class=\"card-summary\">" + escapeHtml(item.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initSearch() {
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    var summary = document.getElementById("searchSummary");
    var results = document.getElementById("searchResults");
    if (!input || !title || !summary || !results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;

    function render(keyword) {
      var text = keyword.toLowerCase();
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.tags,
          item.oneLine
        ].join(" ").toLowerCase();
        return !text || haystack.indexOf(text) !== -1;
      }).slice(0, 120);
      title.textContent = keyword ? "“" + keyword + "”的搜索结果" : "推荐影片";
      summary.textContent = "共显示 " + matches.length + " 部影片";
      if (!matches.length) {
        results.innerHTML = "<div class=\"empty-state\">未找到相关视频，请尝试其他关键词。</div>";
        return;
      }
      results.innerHTML = matches.map(cardHtml).join("\n");
      initImages();
    }

    render(query);
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initPlayers();
    initSearch();
  });
})();
