export const SERVICE_TYPES = [
  // Food & Dining
  'restaurant',
  'bar',
  'fast_food',
  'nightclub',
  'bakery',
  'butcher',
  'deli',
  'seafood',
  'caterers',

  // Groceries & Supermarkets
  'supermarket',
  'convenience',
  'grocery',
  'wholesale',
  'wholesale market',
  'general',

  // Fuel
  'gas',
  'fuel',

  // Cafe & Coffee
  'cafe',
  'coffee',
  'tea',

  // Health & Beauty
  'hairdresser',
  'tanning',
  'beauty',
  'cosmetics',
  'perfumery',
  'chemist',
  'massage',
  'spa',

  // Shopping & Retail
  'clothes',
  'shoes',
  'fashion',
  'bag',
  'jewelry',
  'watches',
  'boutique',
  'department_store',
  'mall',

  // Electronics & Tech
  'electronics',
  'computer',
  'mobile_phone',
  'hifi',
  'electric',
  'electrical',

  // Home & Garden
  'furniture',
  'garden_centre',
  'hardware',
  'doityourself',
  'paint',
  'flooring',
  'lighting',
  'kitchenware',
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
