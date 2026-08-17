// Local Reviews Widget - reads reviews.json from repo
// Usage: <div id="reviews-widget"></div> + initReviewsWidget()

const ReviewsWidget = (function () {
  let config = {};
  let reviewsData = null;

  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  function createReviewCard(review) {
    const authorName = review.author_name || 'Anonymous';
    const rating = review.rating || 0;
    const text = review.text || '';
    const time = review.time ? formatRelativeTime(review.time) : '';
    const profilePhoto = review.profile_photo_url || '';

    return `
      <article class="g-review-card">
        <header class="g-review-header">
          ${profilePhoto ? `<img src="${profilePhoto}" alt="" class="g-review-avatar" loading="lazy">` : '<div class="g-review-avatar-placeholder"></div>'}
          <div class="g-review-meta">
            <span class="g-review-author">${authorName}</span>
            <span class="g-review-stars" aria-label="${rating} out of 5 stars">${renderStars(rating)}</span>
          </div>
        </header>
        <p class="g-review-text">${text}</p>
        <footer class="g-review-footer">
          <time class="g-review-time">${time}</time>
        </footer>
      </article>
    `;
  }

  function createWidgetHTML(reviews, data) {
    const avgRating = data.rating || 0;
    const totalReviews = data.totalReviews || reviews.length;
    const lastUpdated = data.lastUpdated ? `Updated ${data.lastUpdated}` : '';

    return `
      <div class="google-reviews-widget">
        <div class="g-reviews-summary">
          <div class="g-rating-badge">
            <span class="g-rating-value">${avgRating.toFixed(1)}</span>
            <span class="g-rating-stars">${renderStars(avgRating)}</span>
            <span class="g-rating-count">${totalReviews} reviews · ${lastUpdated}</span>
          </div>
        </div>
        <div class="g-reviews-grid" id="gReviewsGrid">
          ${reviews.map(createReviewCard).join('')}
        </div>
        <div class="g-reviews-footer">
          <p class="g-powered-by">Reviews from Google · <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:underline">View all on Google →</a></p>
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

  async function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="google-reviews-widget loading">
        <div class="g-loading">Loading reviews…</div>
      </div>
    `;

    try {
      reviewsData = await fetchReviews();
      const displayReviews = reviewsData.reviews.slice(0, config.maxReviews || 6);
      container.innerHTML = createWidgetHTML(displayReviews, reviewsData);
    } catch (error) {
      console.error('Reviews widget error:', error);
      container.innerHTML = `
        <div class="google-reviews-widget error">
          <p class="g-error">Unable to load reviews.</p>
          <a href="https://search.google.com/local/reviews?placeid=ChIJu0aCp0JjdkgRMeuCV3E3DdI" 
             target="_blank" rel="noopener" class="g-view-all">
            View reviews on Google →
          </a>
        </div>
      `;
    }
  }

  function init(options = {}) {
    config = {
      jsonUrl: 'reviews.json',
      maxReviews: 6,
      containerId: 'reviews-widget',
      ...options
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => render(config.containerId));
    } else {
      render(config.containerId);
    }
  }

  function refresh(containerId) {
    render(containerId || config.containerId);
  }

  return { init, refresh };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('[data-reviews-widget]');
  if (el) {
    ReviewsWidget.init({
      jsonUrl: el.dataset.jsonUrl || 'reviews.json',
      maxReviews: parseInt(el.dataset.maxReviews) || 6,
      containerId: el.id || 'reviews-widget'
    });
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReviewsWidget;
}