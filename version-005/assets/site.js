(function () {
  const body = document.body;
  const menuButton = document.querySelector("[data-menu-toggle]");
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      body.classList.toggle("is-menu-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    showSlide(0);
    schedule();
  }

  const searchInput = document.querySelector("[data-site-search]");
  const filterFields = Array.from(document.querySelectorAll("[data-filter-field]"));
  const items = Array.from(document.querySelectorAll("[data-search-item]"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    const query = normalize(searchInput ? searchInput.value : "");
    const filters = filterFields.map(function (field) {
      return {
        name: field.getAttribute("data-filter-field"),
        value: normalize(field.value)
      };
    });

    items.forEach(function (item) {
      const haystack = normalize(item.getAttribute("data-search-text"));
      const queryMatched = !query || haystack.indexOf(query) !== -1;
      const filtersMatched = filters.every(function (filter) {
        if (!filter.value) {
          return true;
        }
        return normalize(item.getAttribute("data-" + filter.name)).indexOf(filter.value) !== -1;
      });
      item.classList.toggle("is-hidden", !(queryMatched && filtersMatched));
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterFields.forEach(function (field) {
    field.addEventListener("change", applyFilters);
  });
}());
