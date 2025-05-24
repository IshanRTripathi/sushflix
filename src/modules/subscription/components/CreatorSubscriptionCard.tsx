import React, { useCallback } from 'react';
import { Check } from 'lucide-react';
import { logger } from '@/modules/shared/utils/logger';

/**
 * Subscription level with all required properties
 */
interface EnhancedSubscriptionLevel {
  /** Subscription tier level (0-3) */
  level: 0 | 1 | 2 | 3;
  /** Price in the smallest currency unit (e.g., cents) */
  price: number;
  /** Display name of the subscription level */
  name: string;
  /** Description of the subscription level */
  description: string;
  /** List of features included in this level */
  features: string[];
}

/**
 * Props interface for CreatorSubscriptionCard component
 * @interface CreatorSubscriptionCardProps
 */
interface CreatorSubscriptionCardProps {
  level: EnhancedSubscriptionLevel;
  creatorName: string;
  currentLevel: number;
  onSubscribe: (level: number) => void;
  className?: string;
}

/**
 * CreatorSubscriptionCard component for displaying subscription levels
 * @param {CreatorSubscriptionCardProps} props - Component props
 * @returns {ReactNode}
 */
const CreatorSubscriptionCard: React.FC<CreatorSubscriptionCardProps> = ({
  level,
  creatorName,
  currentLevel,
  onSubscribe,
  className = ''
}) => {
  const handleSubscribe = useCallback(() => {
    logger.info('Subscribing to level:', { level: level.level });
    onSubscribe(level.level);
  }, [level.level, onSubscribe]);

  const isCurrentLevel = currentLevel === level.level;
  const isSubscribed = currentLevel >= level.level;
  const isUpgrade = currentLevel < level.level;
  const isDowngrade = currentLevel > level.level;

  return (
    <div 
      className={`rounded-lg border p-6 transition-all hover:shadow-md ${className} ${
        isCurrentLevel ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{level.name}</h3>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
              ${level.price / 100}/month
            </span>
          </div>
          
          <p className="mt-2 text-gray-600">{level.description}</p>
          
          <ul className="mt-6 space-y-3">
            {level.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="ml-3 text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          {isCurrentLevel ? (
            <button
              type="button"
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              disabled
            >
              Current Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubscribe}
              className={`w-full rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isUpgrade 
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                  : isDowngrade 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
                    : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
              }`}
            >
              {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscribe'}
            </button>
          )}
          
          {isSubscribed && !isCurrentLevel && (
            <p className="mt-2 text-center text-xs text-gray-500">
              You're already subscribed to {creatorName}'s {currentLevel === 0 ? 'free' : ''} content
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorSubscriptionCard;
