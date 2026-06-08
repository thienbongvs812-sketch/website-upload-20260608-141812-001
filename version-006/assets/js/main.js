(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function getBasePath() {
        return document.body.getAttribute('data-base') || '';
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }

        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('[data-search-input]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = getBasePath() + 'search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAutoPlay();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startAutoPlay();
            });
        }

        hero.addEventListener('mouseenter', stopAutoPlay);
        hero.addEventListener('mouseleave', startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    function setupHorizontalScroll() {
        var list = document.querySelector('[data-horizontal-list]');
        if (!list) {
            return;
        }

        var left = document.querySelector('[data-scroll-left]');
        var right = document.querySelector('[data-scroll-right]');

        function scroll(direction) {
            list.scrollBy({
                left: direction * 340,
                behavior: 'smooth'
            });
        }

        if (left) {
            left.addEventListener('click', function () {
                scroll(-1);
            });
        }

        if (right) {
            right.addEventListener('click', function () {
                scroll(1);
            });
        }
    }

    function setupFilters() {
        var root = document.querySelector('[data-filter-root]');
        var list = document.querySelector('[data-filter-list]');
        if (!root || !list) {
            return;
        }

        var keywordInput = root.querySelector('[data-filter-keyword]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var clearButton = root.querySelector('[data-clear-filter]');
        var empty = root.querySelector('[data-filter-empty]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (keyword && search.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilter();
            });
        }
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupHorizontalScroll();
        setupFilters();
    });
}());
