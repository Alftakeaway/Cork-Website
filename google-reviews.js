// Google Places Reviews Widget
// Usage: <div id="google-reviews"></div> + initGoogleReviews({ placeId: 'YOUR_PLACE_ID', apiKey: 'YOUR_API_KEY' })

const GoogleReviews = (function () {
  let config = {};
  let cache = null;
  const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

  // Map Google rating to stars
  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  // Format relative time
  function formatRelativeTime(time) {
    const now = Date.now();
    const diff = now - time * 1000;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  // Create review card HTML
  function createReviewCard(review) {
    const authorName = review.author_name || 'Anonymous';
    const rating = review.rating || 0;
    const text = review.text || '';
    const time = review.time ? formatRelativeTime(review.time) : '';
    const profilePhoto = review.profile_photo_url || '';
    const isTranslated = review.original_language && review.original_language !== 'en';

    return `
      <article class="g-review-card" style="--rating:${rating}">
        <header class="g-review-header">
          ${profilePhoto ? `<img src="${profilePhoto}" alt="" class="g-review-avatar" loading="lazy">` : ''}
          <div class="g-review-meta">
            <span class="g-review-author">${authorName}</span>
            <span class="g-review-stars" aria-label="${rating} out of 5 stars">${renderStars(rating)}</span>
          </div>
        </header>
        <p class="g-review-text">${text}</p>
        <footer class="g-review-footer">
          <time class="g-review-time">${time}</time>
          ${isTranslated ? '<span class="g-review-translated" title="Translated by Google">🌐 Translated</span>' : ''}
        </footer>
      </article>
    `;
  }

  // Create widget HTML
  function createWidgetHTML(reviews, placeInfo) {
    const avgRating = placeInfo.rating || 0;
    const totalReviews = placeInfo.user_ratings_total || reviews.length;

    return `
      <div class="google-reviews-widget">
        <div class="g-reviews-summary">
          <div class="g-rating-badge">
            <span class="g-rating-value">${avgRating.toFixed(1)}</span>
            <span class="g-rating-stars">${renderStars(avgRating)}</span>
            <span class="g-rating-count">${totalReviews} reviews</span>
          </div>
          <a href="https://search.google.com/local/reviews?placeid=${config.placeId}" 
             target="_blank" rel="noopener" class="g-write-review">
            Write a review
          </a>
        </div>
        <div class="g-reviews-grid" id="gReviewsGrid">
          ${reviews.map(createReviewCard).join('')}
        </div>
        <div class="g-reviews-footer">
          <a href="https://search.google.com/local/reviews?placeid=${config.placeId}" 
             target="_blank" rel="noopener" class="g-view-all">
            View all ${totalReviews} reviews on Google →
          </a>
          <p class="g-powered-by">Powered by Google Reviews</p>
        </div>
      </div>
    `;
  }

  // Fetch reviews from Google Places API
  async function fetchReviews() {
    // Check cache first
    const cached = localStorage.getItem('google_reviews_cache');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const fields = 'reviews,rating,user_ratings_total,name';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${config.placeId}&fields=${fields}&key=${config.apiKey}&language=en`;

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.status !== 'OK') {
        throw new Error(`Google Places API: ${result.status} - ${result.error_message || 'Unknown error'}`);
      }

      const data = {
        reviews: result.result.reviews || [],
        placeInfo: {
          rating: result.result.rating,
          user_ratings_total: result.result.user_ratings_total,
          name: result.result.name
        }
      };

      // Cache it
      localStorage.setItem('google_reviews_cache', JSON.stringify({ data, timestamp: Date.now() }));
      return data;
    } catch (error) {
      console.error('Google Reviews fetch failed:', error);
      // Return cached data if available, even if expired
      if (cached) {
        return JSON.parse(cached).data;
      }
      throw error;
    }
  }

  // Render widget
  async function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    // Show loading state
    container.innerHTML = `
      <div class="google-reviews-widget loading">
        <div class="g-loading">Loading reviews…</div>
      </div>
    `;

    try {
      const { reviews, placeInfo } = await fetchReviews();
      // Show max 6 reviews
      const displayReviews = reviews.slice(0, config.maxReviews || 6);
      container.innerHTML = createWidgetHTML(displayReviews, placeInfo);
    } catch (error) {
      container.innerHTML = `
        <div class="google-reviews-widget error">
          <p class="g-error">Unable to load reviews at the moment.</p>
          <a href="https://search.google.com/local/reviews?placeid=${config.placeId}" 
             target="_blank" rel="noopener" class="g-view-all">
            View reviews on Google →
          </a>
        </div>
      `;
    }
  }

  // Public init function
  function init(options) {
    config = {
      placeId: '',
      apiKey: '',
      maxReviews: 6,
      containerId: 'google-reviews',
      ...options
    };

    if (!config.placeId || !config.apiKey) {
      console.warn('GoogleReviews: placeId and apiKey are required');
      return;
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => render(config.containerId));
    } else {
      render(config.containerId);
    }
  }

  // Expose for manual refresh
  function refresh(containerId) {
    localStorage.removeItem('google_reviews_cache');
    render(containerId || config.containerId);
  }

  return { init, refresh };
})();

// Auto-init if config is set via data attributes
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('[data-google-reviews]');
  if (el) {
    GoogleReviews.init({
      placeId: el.dataset.placeId,
      apiKey: el.dataset.apiKey,
      maxReviews: parseInt(el.dataset.maxReviews) || 6,
      containerId: el.id || 'google-reviews'
    });
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleReviews;
}