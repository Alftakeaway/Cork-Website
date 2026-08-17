// Reviews Carousel Widget — Cork Wine Bar Bistro
// One review per slide, horizontal layout, fixed-height card.

const ReviewsCarousel = (function () {
  let config = {};
  let reviewsData = null;
  let allReviews = [];
  let currentSlide = 0;
  let totalSlides = 0;
  let autoPlayInterval = null;

  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  // ── Render current review into the card ──────────────────────────────────

  function renderCard(index) {
    const r = allReviews[index];
    const card = document.querySelector('.rv-card');
    const dots = document.querySelectorAll('.rv-dot');
    if (!card || !r) return;

    // Fade out → swap content → fade in
    card.classList.add('rv-fade-out');
    setTimeout(() => {
      card.querySelector('.rv-stars').textContent = renderStars(r.rating || 0);
      card.querySelector('.rv-author').textContent = r.author_name || 'Anonymous';
      card.querySelector('.rv-text').textContent = `"${r.text || ''}"`;
      card.classList.remove('rv-fade-out');
    }, 200);

    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function goTo(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    renderCard(currentSlide);
  }

  function nextSlide() { goTo(currentSlide + 1); startAutoPlay(); }
  function prevSlide() { goTo(currentSlide - 1); startAutoPlay(); }
  function goToSlide(i) { goTo(i); startAutoPlay(); }

  // ── Auto-play ────────────────────────────────────────────────────────────

  function startAutoPlay() {
    stopAutoPlay();
    if (totalSlides <= 1) return;
    autoPlayInterval = setInterval(nextSlide, 6000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) { clearInterval(autoPlayInterval); autoPlayInterval = null; }
  }

  // ── Build indicators ─────────────────────────────────────────────────────

  function buildDots() {
    return Array.from({ length: totalSlides }, (_, i) =>
      `<button class="rv-dot ${i === 0 ? 'active' : ''}"
               onclick="ReviewsCarousel.goToSlide(${i})"
               aria-label="Review ${i + 1}"></button>`
    ).join('');
  }

  // ── Full HTML — first review pre-rendered ────────────────────────────────

  function createHTML() {
    const r = allReviews[0];
    const rating = (reviewsData?.rating || 0).toFixed(1);
    const total = reviewsData?.totalReviews || allReviews.length;

    return `
      <div class="rv-widget">

        <div class="rv-top">
          <span class="rv-badge">
            <span class="rv-badge-score">${rating}</span>
            <span class="rv-badge-stars">${renderStars(reviewsData?.rating || 0)}</span>
            <span class="rv-badge-count">${total} reviews</span>
          </span>
        </div>

        <div class="rv-carousel">
          ${totalSlides > 1 ? `<button class="rv-btn rv-prev" onclick="ReviewsCarousel.prevSlide()" aria-label="Previous">&#10094;</button>` : ''}

          <article class="rv-card">
            <div class="rv-card-inner">
              <span class="rv-stars">${renderStars(r.rating || 0)}</span>
              <p class="rv-text">"${r.text || ''}"</p>
              <span class="rv-author">— ${r.author_name || 'Anonymous'}</span>
            </div>
          </article>

          ${totalSlides > 1 ? `<button class="rv-btn rv-next" onclick="ReviewsCarousel.nextSlide()" aria-label="Next">&#10095;</button>` : ''}
        </div>

        ${totalSlides > 1 ? `<div class="rv-dots">${buildDots()}</div>` : ''}

        <div class="rv-footer">
          <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI"
             target="_blank" rel="noopener" class="rv-view-all">
            View all ${total} reviews on Google →
          </a>
        </div>
      </div>`;
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
      totalSlides = allReviews.length;

      container.innerHTML = createHTML();
      window.ReviewsCarousel = { nextSlide, prevSlide, goToSlide };
      startAutoPlay();

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