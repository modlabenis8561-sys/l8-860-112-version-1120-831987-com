(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const clearButton = document.querySelector('[data-clear-search]');
  const cards = Array.from(document.querySelectorAll('[data-search-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  const applySearch = function () {
    if (!searchInput || cards.length === 0) {
      return;
    }

    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute('data-search') || '').toLowerCase();
      const matched = query === '' || text.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }
})();
