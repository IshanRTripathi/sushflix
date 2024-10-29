import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-indigo-600">CreatorHub</h3>
            <p className="text-gray-600 text-sm">
              Empowering creators to share their content and connect with their audience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-indigo-600">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/subscribe" className="text-gray-600 hover:text-indigo-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-600 hover:text-indigo-600">
                  Upload
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-indigo-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:support@creatorhub.com" className="text-gray-600 hover:text-indigo-600">
                  support@creatorhub.com
                </a>
              </li>
              <li className="text-gray-600">
                123 Creator Street<br />
                San Francisco, CA 94107
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} CreatorHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}