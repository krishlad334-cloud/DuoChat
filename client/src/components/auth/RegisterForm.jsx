import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Phone, User, Info, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('Hey there! I am using WhatsApp.');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !password) {
      setError('Please provide your name, phone number, and password.');
      return;
    }

    const rawDigits = phone.replace(/[^0-9]/g, '');
    if (rawDigits.length < 6) {
      setError('Please enter a valid phone number (at least 6 digits).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        phone: phone.trim(),
        about: about.trim() || 'Hey there! I am using WhatsApp.',
        password
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-[#111b21] rounded-2xl shadow-xl border border-[#e9edef] dark:border-[#222d34]">
      {/* WhatsApp Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20 mb-3">
          <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.077-2.222-.556-1.954-.809-3.21-2.805-3.308-2.935-.098-.13-1.012-1.344-1.012-2.564 0-1.22.637-1.82.863-2.066.226-.246.494-.307.659-.307.164 0 .328.002.472.01.152.008.356-.058.558.428.207.498.706 1.722.768 1.848.062.126.103.273.02.437-.083.164-.124.266-.246.409-.123.144-.258.321-.369.431-.123.123-.252.257-.108.504.144.246.64 1.058 1.373 1.712.943.84 1.737 1.1 1.983 1.223.246.124.391.103.535-.062.144-.164.617-.719.782-.965.164-.246.329-.205.556-.123.226.082 1.436.677 1.683.8.246.123.411.185.472.288.062.103.062.597-.082 1.002z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#111b21] dark:text-[#e9edef] tracking-tight">
          Create WhatsApp Account
        </h2>
        <p className="text-xs text-[#667781] dark:text-[#8696a0] mt-1.5 leading-relaxed">
          Permanent profile — other users can search your phone number to chat
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#111b21] dark:text-[#e9edef] mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a0]" />
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Krish"
              className="w-full pl-10 pr-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] border border-transparent dark:border-[#222d34] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111b21] dark:text-[#e9edef] mb-1">
            Phone Number (with Country Code)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a0]" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 99999 88888 or 9876543210"
              className="w-full pl-10 pr-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] border border-transparent dark:border-[#222d34] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111b21] dark:text-[#e9edef] mb-1">
            Status / About
          </label>
          <div className="relative">
            <Info className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a0]" />
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Hey there! I am using WhatsApp."
              className="w-full pl-10 pr-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] border border-transparent dark:border-[#222d34] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111b21] dark:text-[#e9edef] mb-1">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a0]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2 bg-[#f0f2f5] dark:bg-[#202c33] border border-transparent dark:border-[#222d34] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] text-[#111b21] dark:text-[#e9edef] placeholder-[#8696a0] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#111b21] dark:hover:text-[#e9edef]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-2.5 px-4 bg-[#00a884] hover:bg-[#008069] active:scale-[0.99] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#00a884]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create WhatsApp Account</span>
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-[#e9edef] dark:border-[#222d34] text-center text-xs text-[#667781] dark:text-[#8696a0]">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#00a884] dark:text-[#25d366] font-semibold hover:underline ml-1"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
