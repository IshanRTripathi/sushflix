/**
 * Get the URL for a static image
 * @param imageName - The name of the image file in the static/images directory
 * @returns The URL to the image
 */
export const getStaticImageUrl = (imageName: string): string => {
  // In development, images are served from the public directory
  if (import.meta.env.DEV) {
    return `/static/images/${imageName}`;
  }
  
  // In production, images will be in the static directory with a hash
  // The hash is added by Vite during build
  return new URL(`/static/images/${imageName}`, import.meta.url).href;
};

/**
 * Get placeholder image URLs
 * @returns Object containing URLs for different placeholder images
 */
export const getPlaceholderImages = () => ({
  hero: getStaticImageUrl('hero-placeholder.png'),
  featured: getStaticImageUrl('featured-placeholder.png'),
  thumbnail: getStaticImageUrl('thumbnail-placeholder.png'),
}); 