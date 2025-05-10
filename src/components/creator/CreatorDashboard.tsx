import React, { useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { CreditCard, Users, TrendingUp, Image } from 'lucide-react';
import { logger } from '../../utils/logger';

/**
 * Props interface for CreatorDashboard component
 * @interface CreatorDashboardProps
 */
interface CreatorDashboardProps {
  className?: string;
}

/**
 * CreatorDashboard component for displaying creator statistics
 * @param {CreatorDashboardProps} props - Component props
 * @returns {ReactNode}
 */
export function CreatorDashboard({ className = '' }: CreatorDashboardProps) {
  const { user } = useAuth();

  // Memoized stats object
  const stats = useMemo(() => ({
    followers: 1234,
    subscribers: 567,
    revenue: 4321.50,
    posts: 89
  }), []);

  // Handle activity click with logging
  const handleActivityClick = useCallback((activity: string) => {
    logger.info('Activity item clicked', { 
      activity,
      userId: user?.username 
    });
  }, [user?.username]);

  return (
    <div 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
      role="main"
      aria-label="Creator dashboard"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-8" aria-label="Creator dashboard heading">
        Creator Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Followers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.followers.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Paid Subscribers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.subscribers.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.revenue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Posts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.posts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4" aria-label="Recent activity section">
          Recent Activity
        </h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <li 
                key={item}
                onClick={() => handleActivityClick(`activity-${item}`)}
                className="cursor-pointer hover:bg-gray-50"
                role="button"
                aria-label={`View activity ${item}`}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      New subscriber
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Level 2
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        John Doe
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Subscribed 30 minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}