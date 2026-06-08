(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var previousButton = slider.querySelector('[data-slide-prev]');
        var nextButton = slider.querySelector('[data-slide-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide-dot')) || 0);
                start();
            });
        });

        if (previousButton) {
            previousButton.addEventListener('click', function () {
                showSlide(current - 1);
                start();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var gridId = panel.getAttribute('data-filter-panel');
            var grid = document.getElementById(gridId);
            if (!grid) {
                return;
            }
            var input = panel.querySelector('[data-filter-input]');
            var count = panel.querySelector('[data-result-count]');
            var categoryButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-category]'));
            var typeButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var selectedCategory = '';
            var selectedType = '';

            function setActive(buttons, activeButton) {
                buttons.forEach(function (button) {
                    button.classList.toggle('is-active', button === activeButton);
                });
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardCategory = card.getAttribute('data-category') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedCategory = !selectedCategory || cardCategory === selectedCategory;
                    var matchedType = !selectedType || cardType === selectedType;
                    var show = matchedQuery && matchedCategory && matchedType;
                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = '显示 ' + visible + ' 部';
                }
            }

            categoryButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    selectedCategory = button.getAttribute('data-filter-category') || '';
                    setActive(categoryButtons, button);
                    apply();
                });
            });

            typeButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    if (button.classList.contains('is-active')) {
                        selectedType = '';
                        button.classList.remove('is-active');
                    } else {
                        selectedType = button.getAttribute('data-filter-type') || '';
                        setActive(typeButtons, button);
                    }
                    apply();
                });
            });

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
            }
            apply();
        });
    }

    ready(function () {
        setupMobileNav();
        setupHeroSlider();
        setupFilters();
    });
})();
