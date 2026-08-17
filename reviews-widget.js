// Reviews Carousel Widget — Cork Wine Bar Bistro
// One slide visible at a time. Uses rv-* classes to avoid conflicts with
// the global .carousel-slide { position:absolute; opacity:0 } rule.

const ReviewsCarousel = (function () {
  let config = {};
  let reviewsData = null;
  let allReviews = [];
  let currentSlide = 0;
  let totalSlides = 0;
  let autoPlayInterval = null;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getCardsPerSlide() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function createReviewCard(review) {
    return `
      <article class="rv-card">
        <header class="rv-card-header">
          <span class="rv-stars">${renderStars(review.rating || 0)}</span>
          <span class="rv-author">${review.author_name || 'Anonymous'}</span>
        </header>
        <p class="rv-text">"${review.text || ''}"</p>
      </article>`;
  }

  // ── Render a single slide's cards ────────────────────────────────────────

  function renderSlide(index) {
    const n = getCardsPerSlide();
    const start = index * n;
    const chunk = allReviews.slice(start, start + n);

    const grid = document.querySelector('.rv-grid');
    if (!grid) return;

    grid.style.setProperty('--spv', n);
    grid.innerHTML = chunk.map(createReviewCard).join('');
  }

  // ── Dot indicators ───────────────────────────────────────────────────────

  function buildIndicators() {
    return Array.from({ length: totalSlides }, (_, i) =>
      `<button class="rv-dot ${i === 0 ? 'active' : ''}"
               onclick="ReviewsCarousel.goToSlide(${i})"
               aria-label="Slide ${i + 1}"></button>`
    ).join('');
  }

  function updateDots() {
    document.querySelectorAll('.rv-dot')
      .forEach((el, i) => el.classList.toggle('active', i === currentSlide));
  }

  // ── Auto-play ────────────────────────────────────────────────────────────

  function startAutoPlay() {
    stopAutoPlay();
    if (totalSlides <= 1) return;
    autoPlayInterval = setInterval(nextSlide, 6000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) { clearInterval(autoPlayInterval); autoPlayInterval = null; }
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function goTo(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    renderSlide(currentSlide);
    updateDots();
  }

  function nextSlide() { goTo(currentSlide + 1); startAutoPlay(); }
  function prevSlide() { goTo(currentSlide - 1); startAutoPlay(); }
  function goToSlide(i) { goTo(i); startAutoPlay(); }

  // ── Full widget HTML ─────────────────────────────────────────────────────

  function createHTML() {
    const n = getCardsPerSlide();
    totalSlides = Math.ceil(allReviews.length / n);
    const rating = (reviewsData?.rating || 0).toFixed(1);
    const total = reviewsData?.totalReviews || allReviews.length;
    const firstChunk = allReviews.slice(0, n).map(createReviewCard).join('');

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
          <div class="rv-grid" style="--spv:${n}">
            ${firstChunk}
          </div>
          ${totalSlides > 1 ? `
            <button class="rv-btn rv-prev" onclick="ReviewsCarousel.prevSlide()" aria-label="Previous">&#10094;</button>
            <button class="rv-btn rv-next" onclick="ReviewsCarousel.nextSlide()" aria-label="Next">&#10095;</button>
          ` : ''}
        </div>

        ${totalSlides > 1 ? `<div class="rv-dots">${buildIndicators()}</div>` : ''}

        <div class="rv-footer">
          <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI"
             target="_blank" rel="noopener" class="rv-view-all">
            View all ${total} reviews on Google →
          </a>
        </div>
      </div>`;
  }

  // ── Resize: rebuild if cards-per-slide changes ───────────────────────────

  function watchResize() {
    let last = getCardsPerSlide();
    window.addEventListener('resize', () => {
      const now = getCardsPerSlide();
      if (now === last) return;
      last = now;
      stopAutoPlay();
      currentSlide = 0;
      totalSlides = Math.ceil(allReviews.length / now);

      // Rebuild grid + dots only
      const grid = document.querySelector('.rv-grid');
      const dots = document.querySelector('.rv-dots');
      if (grid) {
        grid.style.setProperty('--spv', now);
        const chunk = allReviews.slice(0, now);
        grid.innerHTML = chunk.map(createReviewCard).join('');
      }
      if (dots) dots.innerHTML = buildIndicators();
      startAutoPlay();
    });
  }

  // ── Fetch & render ───────────────────────────────────────────────────────

  async function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div class="rv-widget"><p class="rv-loading-text">Loading reviews…</p></div>`;

    try {
      const res = await fetch(config.jsonUrl || 'reviews.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      reviewsData = await res.json();
      allReviews = (reviewsData.reviews || []).filter(r => r.rating >= 4);
      currentSlide = 0;

      container.innerHTML = createHTML();
      window.ReviewsCarousel = { nextSlide, prevSlide, goToSlide };
      startAutoPlay();
      watchResize();

    } catch (err) {
      console.error('Reviews carousel:', err);
      container.innerHTML = `
        <div class="rv-widget">
          <p class="rv-loading-text">Unable to load reviews.</p>
          <div style="text-align:center;margin-top:1rem">
            <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI"
               target="_blank" rel="noopener" class="rv-view-all">View reviews on Google →</a>
          </div>
        </div>`;
    }
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

// Single auto-init via data attribute
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