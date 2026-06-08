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

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("action") || "search.html";
                var query = input ? input.value.trim() : "";
                window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var root = document.querySelector("[data-filter-root]");
        if (!root) {
            return;
        }
        var input = root.querySelector("[data-filter-input]");
        var year = root.querySelector("[data-filter-year]");
        var region = root.querySelector("[data-filter-region]");
        var category = root.querySelector("[data-filter-category]");
        var empty = root.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .rank-item"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (input && initial) {
            input.value = initial;
        }
        function apply() {
            var q = normalize(input && input.value);
            var y = normalize(year && year.value);
            var r = normalize(region && region.value);
            var c = normalize(category && category.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (y && cardYear !== y) {
                    match = false;
                }
                if (r && cardRegion.indexOf(r) === -1) {
                    match = false;
                }
                if (c && cardCategory !== c) {
                    match = false;
                }
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [input, year, region, category].forEach(function (field) {
            if (field) {
                field.addEventListener("input", apply);
                field.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var button = shell.querySelector(".play-start");
            var url = source ? source.getAttribute("src") : "";
            if (!video || !url) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else {
                video.src = url;
            }
            if (button) {
                button.addEventListener("click", function () {
                    video.play().catch(function () {});
                });
            }
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                shell.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
            });
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayers();
    });
})();
