import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Heart, Share2, BookmarkPlus } from 'lucide-react';
import { API_BASE_URL } from '../../config/index';

interface ContentData {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorAvatar: string;
  mediaUrl: string;
  likes: number;
  isExclusive: boolean;
  thumbnailUrl: string;
}

export function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Content not available');

        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (isLoading) return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
  );

  if (error || !content) return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Unavailable</h2>
        <p className="text-gray-600">{error || 'Content not found'}</p>
      </div>
  );

  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-black rounded-xl overflow-hidden mb-8">
          {content.mediaUrl ? (
              <video
                  className="w-full aspect-video"
                  controls
                  poster={content.thumbnailUrl}
              >
                <source src={content.mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
          ) : (
              <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full aspect-video object-cover"
              />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                    src={content.creatorAvatar}
                    alt={content.creatorName}
                    className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{content.creatorName}</h3>
                  <p className="text-sm text-gray-500">Creator</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-red-500">
                  <Heart className="w-6 h-6" />
                  <span>{content.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-500">
                  <Share2 className="w-6 h-6" />
                </button>
                <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-500">
                  <BookmarkPlus className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{content.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Related Content</h3>
              {/* Related content will be implemented separately */}
            </div>
          </div>
        </div>
      </div>
  );
}