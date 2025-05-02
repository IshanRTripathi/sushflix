import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const countryCodes = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  // Add more as needed
];

export function LoginForm({ closeModal }: { closeModal: () => void }) {
  const [tab, setTab] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome to Bingeme.</h2>
      <p className="text-sm text-gray-500 mb-6">The future of creator-fan connection.</p>
      <div className="flex mb-4 rounded-lg overflow-hidden bg-gray-100">
        <button
          className={`flex-1 py-2 text-sm font-medium ${tab === 'phone' ? 'bg-white text-black' : 'text-gray-500'}`}
          onClick={() => setTab('phone')}
        >
          Phone
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${tab === 'email' ? 'bg-white text-black' : 'text-gray-500'}`}
          onClick={() => setTab('email')}
        >
          Email
        </button>
      </div>
      {tab === 'phone' ? (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
            <select
              className="px-2 py-2 bg-gray-50 text-sm outline-none"
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
            >
              {countryCodes.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <input
              className="flex-1 px-3 py-2 bg-gray-50 outline-none text-sm"
              type="tel"
              placeholder="Enter Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      )}
      <button className="w-full bg-black text-white rounded-lg py-2 font-medium mb-2">Sign in →</button>
      <button
        className="w-full border border-gray-300 rounded-lg py-2 font-medium mb-2 bg-white"
        onClick={() => setShowPassword(v => !v)}
        type="button"
      >
        Login with password
      </button>
      {showPassword && (
        <div className="mb-4 mt-2">
          <input
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="w-full bg-black text-white rounded-lg py-2 font-medium">Sign in with password</button>
        </div>
      )}
      <div className="text-center my-2">
        <a href="/forgot-password" className="text-xs font-medium text-gray-700">Forgot Password ?</a>
      </div>
      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="mx-2 text-xs text-gray-400">Or sign in with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 font-medium bg-white mb-2">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
        Continue with Google
      </button>
      <div className="text-center mt-4 text-xs text-gray-500">
        New to Bingeme? <a href="/signup" className="text-indigo-600 font-medium">Sign up</a>
      </div>
      {error && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}