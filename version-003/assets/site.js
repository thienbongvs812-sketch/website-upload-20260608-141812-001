(function () {
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

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\" data-movie-card>",
            "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-shade\"></span>",
            "<span class=\"score-badge\">" + escapeHtml(movie.score) + "</span>",
            "<span class=\"play-mark\">▶</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>",
            "<p class=\"movie-line\">" + escapeHtml(movie.line) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var localFilter = document.querySelector("[data-local-filter]");
        var cardList = document.querySelector("[data-card-list]");
        var emptyState = document.querySelector("[data-empty-state]");
        var chipButtons = Array.prototype.slice.call(document.querySelectorAll("[data-chip-filter]"));
        var applyFilter = function (term) {
            if (!cardList) {
                return;
            }
            var query = normalize(term);
            var visible = 0;
            cardList.querySelectorAll("[data-movie-card]").forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-title") || card.textContent);
                var matched = !query || haystack.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        };
        if (localFilter) {
            localFilter.addEventListener("input", function () {
                chipButtons.forEach(function (button) {
                    button.classList.remove("is-active");
                });
                applyFilter(localFilter.value);
            });
        }
        chipButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-chip-filter") || "";
                var active = button.classList.toggle("is-active");
                chipButtons.forEach(function (item) {
                    if (item !== button) {
                        item.classList.remove("is-active");
                    }
                });
                if (localFilter) {
                    localFilter.value = active ? value : "";
                }
                applyFilter(active ? value : "");
            });
        });

        var resultsContainer = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");
        var pageInput = document.querySelector("[data-search-page-input]");
        if (resultsContainer && window.MovieSearchData) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (pageInput) {
                pageInput.value = query;
            }
            if (!query.trim()) {
                resultsContainer.innerHTML = "";
                if (status) {
                    status.textContent = "输入关键词开始搜索";
                }
                return;
            }
            var q = normalize(query);
            var results = window.MovieSearchData.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.line,
                    (movie.tags || []).join(" ")
                ].join(" "));
                return haystack.indexOf(q) !== -1;
            });
            if (status) {
                status.textContent = results.length ? "为你找到相关影片" : "未找到相关影片";
            }
            resultsContainer.innerHTML = results.map(cardTemplate).join("");
        }
    });
})();
