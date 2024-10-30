import React from 'react';
import { Check } from 'lucide-react';
import type { SubscriptionLevel } from '../../types';

interface CreatorSubscriptionCardProps {
    level: SubscriptionLevel;
    creatorName: string;
    currentLevel: number;
    onSubscribe: (level: number) => void;
}

export function CreatorSubscriptionCard({ level, creatorName, currentLevel, onSubscribe }: CreatorSubscriptionCardProps) {
    const isCurrentPlan = currentLevel === level.level;
    const canUpgrade = level.level > currentLevel;

    return (
        <div className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
            isCurrentPlan ? 'border-2 border-indigo-500' : 'border border-gray-200'
        }`}>
            {isCurrentPlan && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
          <span className="inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold text-white">
            Current Plan
          </span>
                </div>
            )}

            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Level {level.level} - {level.name}</h3>
                {level.level > 0 && (
                    <p className="mt-4">
                        <span className="text-3xl font-bold text-gray-900">${level.price}</span>
                        <span className="text-gray-500">/month</span>
                    </p>
                )}
                <button
                    onClick={() => onSubscribe(level.level)}
                    disabled={isCurrentPlan || !canUpgrade}
                    className={`mt-8 w-full rounded-md px-4 py-2 text-sm font-semibold ${
                        isCurrentPlan
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : canUpgrade
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isCurrentPlan ? 'Current Plan' : canUpgrade ? `Upgrade to Level ${level.level}` : 'Contact Creator'}
                </button>
            </div>

            <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">Features</h4>
                <ul className="mt-4 space-y-3">
                    {level.features.map((feature, index) => (
                        <li key={index} className="flex">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="ml-3 text-sm text-gray-700">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}