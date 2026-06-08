(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".mobile-nav");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
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
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

        panels.forEach(function (panel) {
            var section = panel.closest(".content-section") || document;
            var grid = section.querySelector("[data-filter-grid]");
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".video-card")) : [];
            var keyword = panel.querySelector(".filter-keyword");
            var year = panel.querySelector(".filter-year");
            var region = panel.querySelector(".filter-region");
            var type = panel.querySelector(".filter-type");
            var count = panel.querySelector("[data-filter-count]");

            if (!grid || cards.length === 0) {
                return;
            }

            function applyFilters() {
                var keywordValue = normalize(keyword && keyword.value);
                var yearValue = normalize(year && year.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchesKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
                    var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
                    var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                    var isVisible = matchesKeyword && matchesYear && matchesRegion && matchesType;

                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部影片";
                }
            }

            [keyword, year, region, type].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", applyFilters);
                    input.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        });
    }

    function createResultCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<em>#" + escapeHtml(tag) + "</em>";
        }).join("");
        var genres = (item.genres || []).slice(0, 2).join("、");

        return "" +
            "<article class="video-card">" +
            "<a class="card-link" href="" + escapeHtml(item.url) + "" aria-label="观看 " + escapeHtml(item.title) + "">" +
            "<span class="poster-wrap" data-title="" + escapeHtml(item.title) + "">" +
            "<img class="cover-image" src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + " 海报" loading="lazy" onerror="this.closest('.poster-wrap').classList.add('poster-missing'); this.remove();">" +
            "<span class="corner-badge">" + escapeHtml(item.type) + "</span>" +
            "</span>" +
            "<span class="card-body">" +
            "<span class="card-title">" + escapeHtml(item.title) + "</span>" +
            "<span class="card-meta">" + escapeHtml(item.region) + " · " + escapeHtml(item.year) + " · " + escapeHtml(genres || item.type) + "</span>" +
            "<span class="card-desc">" + escapeHtml(item.description) + "</span>" +
            "<span class="card-tags">" + tags + "</span>" +
            "</span>" +
            "</a>" +
            "</article>";
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("#search-page-input");
        var results = document.querySelector("[data-search-results]");
        var count = document.querySelector("[data-search-count]");
        var data = window.SEARCH_DATA || [];

        if (!form || !input || !results) {
            return;
        }

        function performSearch(query) {
            var q = normalize(query);
            var found;

            if (!q) {
                found = data.slice(0, 36);
                if (count) {
                    count.textContent = "已展示推荐结果 36 条；输入关键词可进一步筛选。";
                }
            } else {
                found = data.filter(function (item) {
                    var text = normalize([
                        item.title,
                        item.year,
                        item.region,
                        item.type,
                        (item.genres || []).join(" "),
                        (item.tags || []).join(" "),
                        item.description
                    ].join(" "));

                    return text.indexOf(q) !== -1;
                }).slice(0, 120);
                if (count) {
                    count.textContent = "找到 " + found.length + " 条相关影片";
                }
            }

            results.innerHTML = found.map(createResultCard).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input.value;
            var url = new URL(window.location.href);
            url.searchParams.set("q", query);
            window.history.replaceState({}, "", url.toString());
            performSearch(query);
        });

        var initial = new URLSearchParams(window.location.search).get("q") || "";
        input.value = initial;
        performSearch(initial);
    }

    function initScrollPlayerLinks() {
        var links = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));
        var player = document.querySelector(".video-shell");

        links.forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                if (player) {
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        });
    }

    ready(function () {
        initMobileNavigation();
        initHeroCarousel();
        initFilters();
        initSearchPage();
        initScrollPlayerLinks();
    });
})();
