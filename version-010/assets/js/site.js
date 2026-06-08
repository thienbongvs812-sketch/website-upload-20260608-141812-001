(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var empty = document.querySelector('[data-empty-state]');
  var runFilter = function () {
    if (!cards.length) {
      return;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.year].join(' ').toLowerCase();
      var matched = (!query || haystack.indexOf(query) !== -1) && (!year || card.dataset.year === year);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  };
  if (searchInput || yearSelect) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    if (searchInput) {
      searchInput.addEventListener('input', runFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', runFilter);
    }
    runFilter();
  }
})();

function initStaticPlayer(videoUrl) {
  var video = document.querySelector('[data-player-video]');
  var layer = document.querySelector('[data-player-layer]');
  var button = document.querySelector('[data-player-button]');
  var attached = false;
  var hlsInstance = null;

  if (!video || !videoUrl) {
    return;
  }

  var attachVideo = function () {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
  };

  var start = function () {
    attachVideo();
    video.controls = true;
    if (layer) {
      layer.classList.add('is-hidden');
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  };

  if (layer) {
    layer.addEventListener('click', start);
  }
  if (button && button !== layer) {
    button.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      start();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}
