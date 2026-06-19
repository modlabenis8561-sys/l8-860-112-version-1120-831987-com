(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                startTimer();
            });
        });

        startTimer();
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var grid = document.querySelector('[data-card-grid]');
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
        var searchInput = filterRoot.querySelector('[data-card-search]');
        var sortSelect = filterRoot.querySelector('[data-card-sort]');
        var tagButtons = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-tag-filter]'));
        var activeTag = '';

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var text = cardText(card);
                var tagMatch = !activeTag || text.indexOf(activeTag.toLowerCase()) !== -1;
                var queryMatch = !query || text.indexOf(query) !== -1;

                card.classList.toggle('is-filtered-out', !(tagMatch && queryMatch));
            });
        }

        function applySort() {
            if (!grid || !sortSelect) {
                return;
            }

            var value = sortSelect.value;
            var sorted = cards.slice();

            sorted.sort(function (a, b) {
                if (value === 'year-desc') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }

                if (value === 'year-asc') {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                }

                if (value === 'title-asc') {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
                }

                return cards.indexOf(a) - cards.indexOf(b);
            });

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                applySort();
                applyFilter();
            });
        }

        tagButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeTag = button.getAttribute('data-tag-filter') || '';

                tagButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });

                applyFilter();
            });
        });
    }

    var searchInput = document.getElementById('searchInput');
    var searchButton = document.getElementById('searchButton');
    var searchResults = document.getElementById('searchResults');
    var searchTabs = Array.prototype.slice.call(document.querySelectorAll('[data-search-type]'));
    var activeType = '';

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function resultCard(item) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-thumb" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">',
            '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '        <span class="movie-badge">' + escapeHtml(item.category) + '</span>',
            '    </a>',
            '    <div class="movie-info">',
            '        <a href="' + escapeHtml(item.url) + '" class="movie-title">' + escapeHtml(item.title) + '</a>',
            '        <p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(item.year) + '</span>',
            '            <span>' + escapeHtml(item.region) + '</span>',
            '            <span>' + escapeHtml(item.type) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function runSearch() {
        if (!searchInput || !searchResults || !window.SEARCH_ITEMS && typeof SEARCH_ITEMS === 'undefined') {
            return;
        }

        var list = typeof SEARCH_ITEMS !== 'undefined' ? SEARCH_ITEMS : window.SEARCH_ITEMS;
        var query = searchInput.value.trim().toLowerCase();
        var matched = list.filter(function (item) {
            var text = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine, item.category].join(' ').toLowerCase();
            var queryMatch = !query || text.indexOf(query) !== -1;
            var typeMatch = !activeType || item.type.indexOf(activeType) !== -1;

            return queryMatch && typeMatch;
        }).slice(0, 120);

        searchResults.innerHTML = matched.map(resultCard).join('');
    }

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        searchInput.value = initialQuery;
        runSearch();

        searchInput.addEventListener('input', runSearch);

        if (searchButton) {
            searchButton.addEventListener('click', runSearch);
        }

        searchTabs.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-search-type') || '';

                searchTabs.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });

                runSearch();
            });
        });
    }
})();
