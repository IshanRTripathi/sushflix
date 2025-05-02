import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { LoginModal } from '../auth/LoginModal';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: [
      'Access to basic content',
      'HD streaming',
      'Watch on mobile devices',
      'Cancel anytime'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    features: [
      'Access to all content',
      '4K streaming',
      'Watch on all devices',
      'Download for offline',
      'Priority support',
      'Early access to new content'
    ],
    isPopular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Exclusive creator events',
      'Custom badge',
      'Ad-free experience',
      'Family sharing (up to 5)',
      'Personalized recommendations'
    ]
  }
];

export function SubscriptionPlans() {
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) throw new Error('Failed to create subscription');

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get unlimited access to exclusive content from your favorite creators
            </p>
          </div>

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={`rounded-lg shadow-sm divide-y divide-gray-200 ${
                        plan.isPopular
                            ? 'border-2 border-indigo-500 relative'
                            : 'border border-gray-200'
                    }`}
                >
                  {plan.isPopular && (
                      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                  <span className="inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold text-white">
                    Popular
                  </span>
                      </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                      <span className="text-base font-medium text-gray-500">
                    /{plan.interval}
                  </span>
                    </p>
                    <button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`mt-8 block w-full rounded-md px-4 py-2 text-sm font-semibold text-center ${
                            plan.isPopular
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                    >
                      Subscribe to {plan.name}
                    </button>
                  </div>

                  <div className="pt-6 pb-8 px-6">
                    <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                      What's included
                    </h4>
                    <ul className="mt-4 space-y-3">
                      {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                            <span className="ml-3 text-sm text-gray-700">{feature}</span>
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}