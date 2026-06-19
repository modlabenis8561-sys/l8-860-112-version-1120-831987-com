document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  if (slides.length) {
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 6500);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();

        card.style.display = haystack.indexOf(value) >= 0 ? '' : 'none';
      });
    });
  });

  var globalInput = document.getElementById('global-search');
  var resultBox = document.getElementById('search-results');
  var runButton = document.querySelector('[data-run-search]');

  function renderSearch() {
    if (!globalInput || !resultBox || !window.SEARCH_DATA) {
      return;
    }

    var query = globalInput.value.trim().toLowerCase();
    var records = window.SEARCH_DATA;

    if (query) {
      records = records.filter(function (item) {
        return item.text.indexOf(query) >= 0;
      });
    }

    resultBox.innerHTML = records.slice(0, 240).map(function (item) {
      return '<a class="movie-card" href="' + item.url + '">' +
        '<figure><img src="' + item.cover + '" alt="' + item.title + '" loading="lazy"><span class="year-badge">' + item.year + '</span></figure>' +
        '<div class="movie-card-body"><h3>' + item.title + '</h3><p>' + item.oneLine + '</p>' +
        '<div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span><span>' + item.genre + '</span></div></div>' +
        '</a>';
    }).join('');
  }

  if (globalInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    globalInput.value = initial;
    globalInput.addEventListener('input', renderSearch);

    if (runButton) {
      runButton.addEventListener('click', renderSearch);
    }

    renderSearch();
  }
});
