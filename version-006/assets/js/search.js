(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function movieCard(movie) {
        return [
            '<a class="movie-card" href="movie/' + escapeHtml(movie.id) + '.html">',
            '    <span class="movie-thumb">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="movie-type">' + escapeHtml(movie.type) + '</span>',
            '        <span class="movie-play">▶</span>',
            '    </span>',
            '    <span class="movie-info">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <span class="movie-meta"><em>' + escapeHtml(movie.category) + '</em><i>' + escapeHtml(movie.year) + '</i></span>',
            '        <span class="movie-line">' + escapeHtml(movie.oneLine) + '</span>',
            '    </span>',
            '</a>'
        ].join('\n');
    }

    ready(function () {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.MOVIE_DATA) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var form = page.querySelector('[data-search-page-form]');
        var input = page.querySelector('[data-search-page-input]');
        var title = page.querySelector('[data-search-title]');
        var summary = page.querySelector('[data-search-summary]');
        var results = page.querySelector('[data-search-results]');

        function render(query) {
            var keyword = normalize(query);
            if (!keyword) {
                title.textContent = '请输入关键词进行搜索';
                summary.textContent = '支持标题、简介、标签、类型、年份和地区综合匹配。';
                results.innerHTML = '';
                return;
            }

            var matched = window.MOVIE_DATA.filter(function (movie) {
                var source = [
                    movie.title,
                    movie.year,
                    movie.type,
                    movie.region,
                    movie.category,
                    movie.oneLine,
                    movie.summary,
                    (movie.tags || []).join(' ')
                ].join(' ');
                return normalize(source).indexOf(keyword) !== -1;
            });

            title.textContent = '搜索“' + query + '”';
            summary.textContent = matched.length ? '已为你匹配到相关影片，可直接进入详情页播放。' : '没有找到匹配内容，请更换关键词。';
            results.innerHTML = matched.map(movieCard).join('\n');
        }

        if (input) {
            input.value = initialQuery;
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : '';
                var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState(null, '', url);
                render(query);
            });
        }

        render(initialQuery);
    });
}());
