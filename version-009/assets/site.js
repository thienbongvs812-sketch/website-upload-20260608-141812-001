(function() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-panel]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
      });
    });

    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function applySearch() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var typeValue = typeSelect ? typeSelect.value : '';
    var yearValue = yearSelect ? yearSelect.value : '';

    cards.forEach(function(card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var year = card.getAttribute('data-year') || '';
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedType = !typeValue || type === typeValue;
      var matchedYear = !yearValue || year === yearValue;
      card.style.display = matchedText && matchedType && matchedYear ? '' : 'none';
    });
  }

  if (searchInput || typeSelect || yearSelect) {
    if (searchInput) {
      searchInput.addEventListener('input', applySearch);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applySearch);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applySearch);
    }
  }

  var video = document.querySelector('[data-video-player]');
  var mask = document.querySelector('[data-play-mask]');

  if (video) {
    var streamUrl = video.getAttribute('data-stream') || '';
    var loaded = false;
    var hlsInstance = null;

    function mountVideo() {
      if (loaded || !streamUrl) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startVideo() {
      mountVideo();

      if (mask) {
        mask.classList.add('is-hidden');
      }

      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function() {});
      }
    }

    if (mask) {
      mask.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function() {
      if (!loaded || video.paused) {
        startVideo();
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
