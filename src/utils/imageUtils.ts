/**
 * Type definition for placeholder image types
 */
type PlaceholderType = 'hero' | 'featured' | 'thumbnail';

/**
 * Map of placeholder image filenames by type
 */
const PLACEHOLDER_IMAGES: Record<PlaceholderType, string> = {
  hero: 'hero-placeholder.png',
  featured: 'featured-placeholder.png',
  thumbnail: 'thumbnail-placeholder.png',
} as const;

/**
 * Gets the URL for a static image from the static/images directory.
 * In development, serves from the public directory. In production, uses hashed URLs.
 *
 * @param {string} imageName - The name of the image file (e.g., 'logo.png')
 * @returns {string} The full URL to the static image
 * @throws {Error} If imageName is not provided or invalid
 *
 * @example
 * // Returns '/static/images/logo.png' in development
 * const logoUrl = getStaticImageUrl('logo.png');
 */
export const getStaticImageUrl = (imageName: string): string => {
  if (!imageName || typeof imageName !== 'string' || !imageName.trim()) {
    throw new Error('Image name must be a non-empty string');
  }

  // In development, images are served from the public directory
  if (import.meta.env.DEV) {
    return `/static/images/${imageName}`;
  }
  
  // In production, use Vite's URL builder for hashed filenames
  try {
    return new URL(`/static/images/${imageName}`, import.meta.url).href;
  } catch (error) {
    console.error('Failed to build image URL:', error);
    return ''; // Return empty string as fallback
  }
};

/**
 * Gets placeholder image URLs for different UI components.
 * Returns URLs for hero, featured, and thumbnail placeholders.
 *
 * @returns {Record<PlaceholderType, string>} Object mapping placeholder types to their URLs
 *
 * @example
 * const { hero, featured, thumbnail } = getPlaceholderImages();
 * // hero = '/static/images/hero-placeholder.png' (in development)
 */
export const getPlaceholderImages = (): Record<PlaceholderType, string> => {
  return Object.entries(PLACEHOLDER_IMAGES).reduce(
    (acc, [key, filename]) => ({
      ...acc,
      [key]: getStaticImageUrl(filename),
    }),
    {} as Record<PlaceholderType, string>
  );
};

/**
 * Gets a specific placeholder image URL by type.
 *
 * @param {PlaceholderType} type - The type of placeholder image to get
 * @returns {string} The URL to the requested placeholder image
 * @throws {Error} If an invalid placeholder type is provided
 *
 * @example
 * // Returns URL to hero placeholder
 * const heroPlaceholder = getPlaceholderImage('hero');
 */
export const getPlaceholderImage = (type: PlaceholderType): string => {
  if (!PLACEHOLDER_IMAGES[type]) {
    throw new Error(`Invalid placeholder type: ${type}`);
  }
  return getStaticImageUrl(PLACEHOLDER_IMAGES[type]);
};