(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
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
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        if (searchInputs.length && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            function applySearch(value) {
                var keyword = String(value || "").trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            searchInputs.forEach(function (input) {
                if (query && !input.value) {
                    input.value = query;
                }
                input.addEventListener("input", function () {
                    applySearch(input.value);
                });
            });
            applySearch(query || searchInputs[0].value);
        }
    });
})();
