/**
 * Seasonal Background Images System
 * Automatically switches background images based on current season
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalImageSet {
  spring: string;
  summer: string;
  autumn: string;
  winter: string;
}

/**
 * Get current season based on month
 * Northern Hemisphere seasons:
 * Spring: March, April, May (3-5)
 * Summer: June, July, August (6-8)
 * Autumn: September, October, November (9-11)
 * Winter: December, January, February (12, 1-2)
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

/**
 * Seasonal image sets for each page
 */
export const seasonalImages: Record<string, SeasonalImageSet> = {
  // Rural Dashboard
  ruralDashboard: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6a8a3711-44fb-495a-a4e4-a11a32791c57.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4da36730-75ba-4231-9a9b-e0dead649406.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ec839a13-f906-4888-901c-680c153bc933.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a776e4d2-a913-4588-8a98-a8b4f6f08965.jpg',
  },
  
  // Crops Management
  cropsManagement: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9fe0309a-9231-4442-9838-c8cddfb4665a.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_53a6f4de-1a49-4952-9c3b-f96da5926ae9.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ab6850bf-20f7-4315-8db7-1c9d62c7f62e.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_931d29d0-f2af-4804-b3bd-105305c8cb2f.jpg',
  },
  
  // Financial Management (reuse dashboard for consistency)
  financialManagement: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6a8a3711-44fb-495a-a4e4-a11a32791c57.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4da36730-75ba-4231-9a9b-e0dead649406.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ec839a13-f906-4888-901c-680c153bc933.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a776e4d2-a913-4588-8a98-a8b4f6f08965.jpg',
  },
  
  // Livestock Management
  livestock: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_248110a0-d6a4-4d60-8651-b70dc9b28ee5.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9a6667ac-5fe7-4bcc-bfb9-9a638e2dbce9.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e54ae5e2-a461-4f13-b324-f959c7d23729.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4f653844-0a94-4250-86f0-85c74e51fe9b.jpg',
  },
  
  // Inventory & Equipment (reuse dashboard)
  inventory: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6a8a3711-44fb-495a-a4e4-a11a32791c57.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4da36730-75ba-4231-9a9b-e0dead649406.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ec839a13-f906-4888-901c-680c153bc933.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a776e4d2-a913-4588-8a98-a8b4f6f08965.jpg',
  },
  
  // Orders & Marketplace
  orders: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9fe0309a-9231-4442-9838-c8cddfb4665a.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_53a6f4de-1a49-4952-9c3b-f96da5926ae9.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ab6850bf-20f7-4315-8db7-1c9d62c7f62e.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_931d29d0-f2af-4804-b3bd-105305c8cb2f.jpg',
  },
  
  // Urban Dashboard
  urbanDashboard: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_03f801d9-31cc-4d0d-a620-5b0dc87f3e9f.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_728ebc43-3e75-4f05-93c1-12842a9624e3.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7192a27c-9727-425c-ba99-7f303dee0f47.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_2e275bb9-5251-4cd7-8d21-ea5e68b9d5d1.jpg',
  },
  
  // Crop Planning
  cropPlanning: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f898fe7a-4778-45fa-aa71-f0e2b052052f.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a64307db-286b-4817-b5a3-a032398727d8.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_58163c25-1b46-4c5e-8e7c-640d2679c002.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6bc2df16-f8f4-4bdf-9c56-f92388942c48.jpg',
  },
  
  // Urban Marketplace
  urbanMarketplace: {
    spring: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9fe0309a-9231-4442-9838-c8cddfb4665a.jpg',
    summer: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_53a6f4de-1a49-4952-9c3b-f96da5926ae9.jpg',
    autumn: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ab6850bf-20f7-4315-8db7-1c9d62c7f62e.jpg',
    winter: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_931d29d0-f2af-4804-b3bd-105305c8cb2f.jpg',
  },
};

/**
 * Get seasonal image URL for a specific page
 */
export function getSeasonalImage(pageKey: string): string {
  const season = getCurrentSeason();
  const imageSet = seasonalImages[pageKey];
  
  if (!imageSet) {
    console.warn(`No seasonal images found for page: ${pageKey}`);
    return '';
  }
  
  return imageSet[season];
}

/**
 * Get all seasonal images for a page (for preloading)
 */
export function getAllSeasonalImages(pageKey: string): string[] {
  const imageSet = seasonalImages[pageKey];
  if (!imageSet) return [];
  
  return [imageSet.spring, imageSet.summer, imageSet.autumn, imageSet.winter];
}
