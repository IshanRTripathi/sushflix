// Content categories component with enhanced error handling and loading states
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '@/modules/shared/config';
import { logger } from '@/modules/shared/utils/logger';

/**
 * Category interface with proper typing
 * @interface Category
 * @property {string} id - Unique identifier for the category
 * @property {string} name - Display name of the category
 * @property {string} description - Brief description of the category
 * @property {string} imageUrl - URL of the category image
 * @property {number} contentCount - Number of contents in this category
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  contentCount: number;
}

/**
 * Component props interface
 * @interface ContentCategoriesProps
 * @property {string} className - Optional class name for styling
 */
export interface ContentCategoriesProps {
  className?: string;
}

/**
 * ContentCategories component that displays a grid of category cards
 * @param {ContentCategoriesProps} props - Component props
 * @returns {ReactNode}
 */
export const ContentCategories: React.FC<ContentCategoriesProps> = ({ className = '' }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories with proper error handling and logging
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('Fetching categories from API');
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCategories(data);
      logger.info('Categories fetched successfully', { count: data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      logger.error('Failed to fetch categories', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Loading state with proper ARIA attributes
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center min-h-[400px] ${className}`}
        role="status"
        aria-label="Loading categories"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Error state with proper ARIA attributes
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`} role="alert">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchCategories}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
          aria-label="Retry loading categories"
        >
          Retry
        </button>
      </div>
    );
  }

  // Main content with proper ARIA attributes
  return (
    <div 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}
      role="region"
      aria-label="Content categories"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Categories</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            aria-label={`View ${category.name} category`}
          >
            <div className="aspect-video relative">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/images/default-category.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
              <p className="text-gray-200 text-sm mb-4">{category.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-gray-200 text-sm">
                  {category.contentCount} {category.contentCount === 1 ? 'content' : 'contents'}
                </span>
                <ChevronRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};