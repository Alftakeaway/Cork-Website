// Local Reviews Carousel Widget - reads reviews.json from repo
// Carousel-style like hero images

const ReviewsCarousel = (function () {
  let config = {};
  let reviewsData = null;
  let currentSlide = 0;
  let autoPlayInterval = null;
  const SLIDES_PER_VIEW = getSlidesPerView();
  let totalSlides = 0;

  function getSlidesPerView() {
    if (window.innerWidth < 480) return 1;
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
    const authorName = review.author_name || 'Anonymous';
    const rating = review.rating || 0;
    const text = review.text || '';

    return `
      <article class="review-card">
        <header class="review-card-header">
          <span class="review-stars" aria-label="${rating} out of 5 stars">${renderStars(rating)}</span>
          <span class="review-author">${authorName}</span>
        </header>
        <p class="review-text">"${text}"</p>
      </article>
    `;
  }

  function createCarouselHTML(reviews) {
    totalSlides = Math.ceil(reviews.length / SLIDES_PER_VIEW);
    const slides = [];

    for (let i = 0; i < totalSlides; i++) {
      const slideReviews = reviews.slice(i * SLIDES_PER_VIEW, (i + 1) * SLIDES_PER_VIEW);
      slides.push(`
        <div class="carousel-slide ${i === 0 ? 'current-slide' : ''}" data-slide="${i}">
          <div class="review-slide-grid">
            ${slideReviews.map(createReviewCard).join('')}
          </div>
        </div>
      `);
    }

    const indicators = Array.from({ length: totalSlides }, (_, i) => 
      `<button class="carousel-indicator ${i === 0 ? 'active' : ''}" onclick="ReviewsCarousel.goToSlide(${i})" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');

    return `
      <div class="reviews-carousel-widget">
        <div class="reviews-carousel-header">
          <div class="reviews-summary">
            <span class="reviews-rating-badge">
              <span class="rating-value">${(reviewsData?.rating || 0).toFixed(1)}</span>
              <span class="rating-stars">${renderStars(reviewsData?.rating || 0)}</span>
              <span class="rating-count">${reviewsData?.totalReviews || reviews.length} reviews</span>
            </span>
          </div>
        </div>
        <div class="carousel">
          <div class="carousel-track-container">
            ${slides.join('')}
          </div>
          ${totalSlides > 1 ? `
            <button class="carousel-btn prev" onclick="ReviewsCarousel.prevSlide()" aria-label="Previous reviews">&#10094;</button>
            <button class="carousel-btn next" onclick="ReviewsCarousel.nextSlide()" aria-label="Next reviews">&#10095;</button>
            <div class="carousel-nav">
              ${indicators}
            </div>
          ` : ''}
        </div>
        <div class="reviews-carousel-footer">
          <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI" 
             target="_blank" rel="noopener" class="reviews-view-all">
            View all ${reviewsData?.totalReviews || reviews.length} reviews on Google →
          </a>
        </div>
      </div>
    `;
  }

  async function fetchReviews() {
    const url = config.jsonUrl || 'reviews.json';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    return response.json();
  }

  function filterReviews(reviews) {
    // Only 4 and 5 star reviews
    return reviews.filter(r => r.rating >= 4);
  }

  async function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="reviews-carousel-widget loading">
        <div class="g-loading">Loading reviews…</div>
      </div>
    `;

    try {
      reviewsData = await fetchReviews();
      const filteredReviews = filterReviews(reviewsData.reviews);
      container.innerHTML = createCarouselHTML(filteredReviews);
      
      // Start auto-play
      startAutoPlay();
      
      // Handle resize
      window.addEventListener('resize', debounce(() => {
        const newSlidesPerView = getSlidesPerView();
        if (newSlidesPerView !== SLIDES_PER_VIEW) {
          location.reload(); // Simple approach - reload to recalculate slides
        }
      }, 250));
      
    } catch (error) {
      console.error('Reviews carousel error:', error);
      container.innerHTML = `
        <div class="reviews-carousel-widget error">
          <p class="g-error">Unable to load reviews.</p>
          <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI" 
             target="_blank" rel="noopener" class="reviews-view-all">
            View reviews on Google →
          </a>
        </div>
      `;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (totalSlides <= 1) return;
    autoPlayInterval = setInterval(() => nextSlide(), 6000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
  }

  function updateCarousel() {
    const track = document.querySelector('.reviews-carousel-widget .carousel-track-container');
    const slides = document.querySelectorAll('.reviews-carousel-widget .carousel-slide');
    const indicators = document.querySelectorAll('.reviews-carousel-widget .carousel-indicator');
    
    if (!track || slides.length === 0) return;

    const slideWidth = 100 / SLIDES_PER_VIEW;
    track.style.transform = `translateX(-${currentSlide * slideWidth * SLIDES_PER_VIEW}%)`;

    slides.forEach((slide, i) => {
      slide.classList.toggle('current-slide', i === currentSlide);
    });
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === currentSlide);
    });
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

  function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  function init(options = {}) {
    config = {
      jsonUrl: 'reviews.json',
      containerId: 'reviews-widget',
      ...options
    };

    // Expose globally for inline onclick handlers
    window.ReviewsCarousel = { nextSlide, prevSlide, goToSlide };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => render(config.containerId));
    } else {
      render(config.containerId);
    }
  }

  function refresh(containerId) {
    currentSlide = 0;
    render(containerId || config.containerId);
  }

  return { init, refresh, nextSlide, prevSlide, goToSlide };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('[data-reviews-widget]');
  if (el) {
    ReviewsCarousel.init({
      jsonUrl: el.dataset.jsonUrl || 'reviews.json',
      containerId: el.id || 'reviews-widget'
    });
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReviewsCarousel;
}