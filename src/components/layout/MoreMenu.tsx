import React from 'react';

interface MoreMenuProps {
  onClose: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black w-64 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-white text-lg font-semibold mb-4">More Options</h2>
          
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              Settings
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              Help Center
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              Privacy Policy
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
              Terms of Service
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MoreMenu;
