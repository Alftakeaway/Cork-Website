// UK 14 Major Allergens
const ALLERGENS = {
  celery: { label: 'Celery', icon: '🥬', short: 'CEL' },
  gluten: { label: 'Gluten (Wheat)', icon: '🌾', short: 'GLU' },
  crustaceans: { label: 'Crustaceans', icon: '🦐', short: 'CRU' },
  eggs: { label: 'Eggs', icon: '🥚', short: 'EGG' },
  fish: { label: 'Fish', icon: '🐟', short: 'FSH' },
  lupin: { label: 'Lupin', icon: '🌱', short: 'LUP' },
  milk: { label: 'Milk/Dairy', icon: '🥛', short: 'MLK' },
  molluscs: { label: 'Molluscs', icon: '🐚', short: 'MOL' },
  mustard: { label: 'Mustard', icon: '🌰', short: 'MUS' },
  nuts: { label: 'Nuts', icon: '🥜', short: 'NUT' },
  peanuts: { label: 'Peanuts', icon: '🥜', short: 'PNT' },
  sesame: { label: 'Sesame', icon: '🌰', short: 'SES' },
  soy: { label: 'Soy', icon: '🫘', short: 'SOY' },
  sulphites: { label: 'Sulphites', icon: '🍷', short: 'SUL' }
};

// Allergen matrix for each menu item
// true = contains, 'may' = may contain traces, false = free
const ALLERGEN_MATRIX = {
  // TAGLIERI
  'Tagliere salumi': {
    gluten: true,
    milk: false,
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true,  // cured meats often contain sulphites
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Tagliere formaggi': {
    gluten: true,  // served with sourdough
    milk: true,    // cheeses
    eggs: false,
    nuts: 'may',   // some aged cheeses may have nut traces
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Tagliere misto': {
    gluten: true,
    milk: true,
    eggs: false,
    nuts: 'may',
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Pane e burro': {
    gluten: true,  // sourdough
    milk: true,    // butter
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Salame e pane': {
    gluten: true,
    milk: false,
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true,  // salami
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },

  // FOCACCE
  'Siciliano': {
    gluten: true,    // focaccia base
    milk: false,
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: true,      // anchovies
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Bella Italia': {
    gluten: true,
    milk: true,      // buffalo mozzarella
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Süd Tirol': {
    gluten: true,
    milk: true,      // gorgonzola
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Firenze': {
    gluten: true,
    milk: true,      // toma cheese
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true, // finocchiona salami
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Abruzzese': {
    gluten: true,
    milk: true,      // taleggio
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true, // porchetta
    celery: true,    // caramelised onions often cooked with celery
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Pugliese': {
    gluten: true,
    milk: true,      // stracciatella
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true, // coppa
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Fat Pig': {
    gluten: true,
    milk: true,      // stracciatella
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true, // pancetta, salame napoli
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Spicy Bomb': {
    gluten: true,
    milk: true,      // toma
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: true, // spianata, nduja
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },

  // OLIVES (all varieties)
  'Nocellara': {
    gluten: false,
    milk: false,
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Garlic & herbs': {
    gluten: false,
    milk: false,
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Silvergreen (piri-piri)': {
    gluten: false,
    milk: false,
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },
  'Silvergreen (stuffed with garlic)': {
    gluten: false,
    milk: false,
    eggs: false,
    nuts: false,
    peanuts: false,
    sesame: false,
    soy: false,
    sulphites: false,
    celery: false,
    crustaceans: false,
    fish: false,
    lupin: false,
    molluscs: false,
    mustard: false
  },

  // DRINKS - Wine, Beer, Spirits generally don't require allergen labelling
  // but we note sulphites in wine and gluten in beer
};

// Dietary flags for each menu item
// true = suitable, false = not suitable
const DIETARY_FLAGS = {
  // TAGLIERI
  'Tagliere salumi': { vegetarian: false, vegan: false },
  'Tagliere formaggi': { vegetarian: true, vegan: false },
  'Tagliere misto': { vegetarian: false, vegan: false },
  'Pane e burro': { vegetarian: true, vegan: false },
  'Salame e pane': { vegetarian: false, vegan: false },

  // FOCACCE
  'Siciliano': { vegetarian: false, vegan: false },      // anchovies
  'Bella Italia': { vegetarian: false, vegan: false },   // ham, mozzarella
  'Süd Tirol': { vegetarian: false, vegan: false },      // speck, gorgonzola
  'Firenze': { vegetarian: false, vegan: false },        // salami, cheese
  'Abruzzese': { vegetarian: false, vegan: false },      // porchetta, cheese
  'Pugliese': { vegetarian: false, vegan: false },       // coppa, stracciatella
  'Fat Pig': { vegetarian: false, vegan: false },        // pancetta, salami, cheese
  'Spicy Bomb': { vegetarian: false, vegan: false },     // spianata, nduja, cheese

  // OLIVES (all varieties) - all vegan
  'Nocellara': { vegetarian: true, vegan: true },
  'Garlic & herbs': { vegetarian: true, vegan: true },
  'Silvergreen (piri-piri)': { vegetarian: true, vegan: true },
  'Silvergreen (stuffed with garlic)': { vegetarian: true, vegan: true },
};

// Helper to get allergen keys that are true or 'may'
function getAllergensForDish(dishName) {
  const matrix = ALLERGEN_MATRIX[dishName];
  if (!matrix) return { contains: [], mayContain: [] };

  const contains = [];
  const mayContain = [];

  Object.entries(matrix).forEach(([key, value]) => {
    if (value === true) contains.push(key);
    else if (value === 'may') mayContain.push(key);
  });

  return { contains, mayContain };
}

// Helper to get dietary flags
function getDietaryFlags(dishName) {
  return DIETARY_FLAGS[dishName] || { vegetarian: false, vegan: false };
}

// Export for both browser and Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ALLERGENS, ALLERGEN_MATRIX, DIETARY_FLAGS, getAllergensForDish, getDietaryFlags };
}