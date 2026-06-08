
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var shell = document.querySelector("[data-hero]");
    if (!shell) {
      return;
    }
    var slides = Array.prototype.slice.call(shell.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(shell.querySelectorAll(".hero-dot"));
    var prev = shell.querySelector(".hero-prev");
    var next = shell.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function matchesType(card, typeValue) {
    if (!typeValue) {
      return true;
    }
    var typeText = normalize(card.getAttribute("data-type"));
    var tagText = normalize(card.getAttribute("data-tags"));
    return typeText.indexOf(typeValue) !== -1 || tagText.indexOf(typeValue) !== -1;
  }

  function applyFilter(input, typeSelect) {
    var root = input.closest("main") || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll(".searchable-list [data-title]"));
    var keyword = normalize(input.value);
    var typeValue = typeSelect ? normalize(typeSelect.value) : "";
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-tags")
      ].join(" "));
      var visible = (!keyword || haystack.indexOf(keyword) !== -1) && matchesType(card, typeValue);
      card.classList.toggle("is-filtered-out", !visible);
    });
  }

  function setupLocalFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));
    inputs.forEach(function (input) {
      var typeSelect = document.querySelector(".type-filter");
      if (query && !input.value) {
        input.value = query;
      }
      input.addEventListener("input", function () {
        applyFilter(input, typeSelect);
      });
      if (typeSelect) {
        typeSelect.addEventListener("change", function () {
          applyFilter(input, typeSelect);
        });
      }
      applyFilter(input, typeSelect);
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
  });
})();
