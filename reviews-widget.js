// Reviews Carousel Widget — Cork Wine Bar Bistro
// Uses rv-* class names to avoid conflicts with the global .carousel-slide CSS
// (which uses position:absolute + opacity fade for hero/about carousels).

const ReviewsCarousel = (function () {
  let config = {};
  let reviewsData = null;
  let currentSlide = 0;
  let totalSlides = 0;
  let autoPlayInterval = null;
  let resizeObserver = null;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getSlidesPerView() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function createReviewCard(review) {
    const author = review.author_name || 'Anonymous';
    const rating = review.rating || 0;
    const text = review.text || '';
    return `
      <article class="rv-card">
        <header class="rv-card-header">
          <span class="rv-stars" aria-label="${rating} out of 5 stars">${renderStars(rating)}</span>
          <span class="rv-author">${author}</span>
        </header>
        <p class="rv-text">"${text}"</p>
      </article>`;
  }

  // ── Build slides ─────────────────────────────────────────────────────────

  function buildSlides(reviews) {
    const perView = getSlidesPerView();
    totalSlides = Math.ceil(reviews.length / perView);
    let html = '';
    for (let i = 0; i < totalSlides; i++) {
      const chunk = reviews.slice(i * perView, (i + 1) * perView);
      html += `
        <div class="rv-slide" data-slide="${i}">
          <div class="rv-grid" style="--spv:${perView}">
            ${chunk.map(createReviewCard).join('')}
          </div>
        </div>`;
    }
    return html;
  }

  function buildIndicators() {
    return Array.from({ length: totalSlides }, (_, i) =>
      `<button class="rv-dot ${i === 0 ? 'active' : ''}"
               onclick="ReviewsCarousel.goToSlide(${i})"
               aria-label="Slide ${i + 1}"></button>`
    ).join('');
  }

  // ── Full HTML ────────────────────────────────────────────────────────────

  function createHTML(reviews) {
    const rating = (reviewsData?.rating || 0).toFixed(1);
    const total = reviewsData?.totalReviews || reviews.length;

    return `
      <div class="rv-widget">
        <div class="rv-header">
          <span class="rv-badge">
            <span class="rv-badge-score">${rating}</span>
            <span class="rv-badge-stars">${renderStars(reviewsData?.rating || 0)}</span>
            <span class="rv-badge-count">${total} reviews</span>
          </span>
        </div>

        <div class="rv-carousel">
          <div class="rv-track-wrap">
            <div class="rv-track">
              ${buildSlides(reviews)}
            </div>
          </div>
          ${totalSlides > 1 ? `
            <button class="rv-btn rv-prev" onclick="ReviewsCarousel.prevSlide()" aria-label="Previous">&#10094;</button>
            <button class="rv-btn rv-next" onclick="ReviewsCarousel.nextSlide()" aria-label="Next">&#10095;</button>
            <div class="rv-dots">${buildIndicators()}</div>
          ` : ''}
        </div>

        <div class="rv-footer">
          <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI"
             target="_blank" rel="noopener" class="rv-view-all">
            View all ${total} reviews on Google →
          </a>
        </div>
      </div>`;
  }

  // ── Carousel movement ────────────────────────────────────────────────────

  function updateCarousel() {
    const track = document.querySelector('.rv-track');
    if (!track) return;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.rv-dot')
      .forEach((el, i) => el.classList.toggle('active', i === currentSlide));
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (totalSlides <= 1) return;
    autoPlayInterval = setInterval(nextSlide, 6000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) { clearInterval(autoPlayInterval); autoPlayInterval = null; }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
    startAutoPlay();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
    startAutoPlay();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    startAutoPlay();
  }

  // ── Fetch & render ───────────────────────────────────────────────────────

  async function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div class="rv-widget rv-loading"><p class="rv-loading-text">Loading reviews…</p></div>`;

    try {
      const res = await fetch(config.jsonUrl || 'reviews.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      reviewsData = await res.json();

      const filtered = (reviewsData.reviews || []).filter(r => r.rating >= 4);
      currentSlide = 0;
      container.innerHTML = createHTML(filtered);

      window.ReviewsCarousel = { nextSlide, prevSlide, goToSlide };
      startAutoPlay();
      watchResize(filtered);

    } catch (err) {
      console.error('Reviews carousel:', err);
      container.innerHTML = `
        <div class="rv-widget rv-error">
          <p>Unable to load reviews.</p>
          <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI"
             target="_blank" rel="noopener" class="rv-view-all">View reviews on Google →</a>
        </div>`;
    }
  }

  // ── Resize observer ──────────────────────────────────────────────────────

  function watchResize(reviews) {
    if (resizeObserver) resizeObserver.disconnect();
    let lastPerView = getSlidesPerView();

    resizeObserver = new ResizeObserver(() => {
      const nowPerView = getSlidesPerView();
      if (nowPerView === lastPerView) return;
      lastPerView = nowPerView;
      currentSlide = 0;
      stopAutoPlay();

      const perView = getSlidesPerView();
      totalSlides = Math.ceil(reviews.length / perView);

      const track = document.querySelector('.rv-track');
      const dots = document.querySelector('.rv-dots');

      if (track) {
        track.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
          const chunk = reviews.slice(i * perView, (i + 1) * perView);
          track.insertAdjacentHTML('beforeend', `
            <div class="rv-slide" data-slide="${i}">
              <div class="rv-grid" style="--spv:${perView}">
                ${chunk.map(createReviewCard).join('')}
              </div>
            </div>`);
        }
        track.style.transform = 'translateX(0)';
      }

      if (dots) dots.innerHTML = buildIndicators();
      startAutoPlay();
    });

    const widget = document.querySelector('.rv-widget');
    if (widget) resizeObserver.observe(widget);
  }

  // ── Init ─────────────────────────────────────────────────────────────────

  function init(options = {}) {
    config = { jsonUrl: 'reviews.json', containerId: 'reviews-widget', ...options };
    window.ReviewsCarousel = { nextSlide, prevSlide, goToSlide };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => render(config.containerId));
    } else {
      render(config.containerId);
    }
  }

  return { init, nextSlide, prevSlide, goToSlide };
})();

// Single auto-init
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('[data-reviews-widget]');
  if (el) {
    ReviewsCarousel.init({
      jsonUrl: el.dataset.jsonUrl || 'reviews.json',
      containerId: el.id || 'reviews-widget',
    });
  }
});

if (typeof module !== 'undefined' && module.exports) module.exports = ReviewsCarousel;