import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  contentCount: number;
}

export function ContentCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Categories</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
              <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-video relative">
                  <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
}