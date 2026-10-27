import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../utils/countryCodes';
import {
  Send,
  Lock,
  Phone,
  User,
  Info,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  Search,
  Settings2,
  AlertCircle,
  Wifi
} from 'lucide-react';
import ServerSettingsModal from './ServerSettingsModal';
import { getApiBaseUrl, testApiConnection } from '../../services/api';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Country selector
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // India (+91)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('Hey there! I am using Duo Chat.');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Server connection management
  const [showServerModal, setShowServerModal] = useState(false);
  const [activeApiUrl, setActiveApiUrl] = useState(getApiBaseUrl());
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  // Check server health on mount & when URL changes
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      setServerStatus('checking');
      const res = await testApiConnection(getApiBaseUrl());
      if (isMounted) {
        setServerStatus(res.ok ? 'online' : 'offline');
        setActiveApiUrl(getApiBaseUrl());
      }
    };

    checkServer();

    const handleUrlChange = () => {
      setActiveApiUrl(getApiBaseUrl());
      checkServer();
    };
    window.addEventListener('duochat:api-url-changed', handleUrlChange);

    return () => {
      isMounted = false;
      window.removeEventListener('duochat:api-url-changed', handleUrlChange);
    };
  }, []);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  // Full normalized phone number
  const getFullPhone = () => {
    const raw = phoneNumber.trim().replace(/[^0-9]/g, '');
    const code = selectedCountry.code.replace(/[^0-9]/g, '');
    if (phoneNumber.startsWith('+')) {
      return phoneNumber.trim();
    }
    return `+${code}${raw}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const fullPhone = getFullPhone();
    const digitsOnly = fullPhone.replace(/[^0-9]/g, '');

    if (digitsOnly.length < 6) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(fullPhone, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const fullPhone = getFullPhone();
    const digitsOnly = fullPhone.replace(/[^0-9]/g, '');

    if (digitsOnly.length < 6) {
      setError('Please enter a valid phone number with country code.');
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
        phone: fullPhone,
        about: about.trim() || 'Hey there! I am using Duo Chat.',
        password
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const isNetworkError = error && (
    error.toLowerCase().includes('network error') ||
    error.toLowerCase().includes('cannot connect') ||
    error.toLowerCase().includes('failed to connect') ||
    serverStatus === 'offline'
  );

  // Shorten displayed URL for mobile UI
  const formatUrlForDisplay = (url) => {
    try {
      if (url.startsWith('/')) return url;
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname}`;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0e1621] text-zinc-100 dark:bg-[#0e1621] selection:bg-[#6c78e6] selection:text-white relative overflow-y-auto px-4 py-8 font-sans">
      {/* Telegram-style subtle wallpaper mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(#17212b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#6c78e6]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Telegram Web Authentic Login Card */}
      <div className="w-full max-w-[420px] bg-[#17212b] border border-[#242f3d] rounded-3xl p-6 sm:p-10 shadow-2xl z-10 relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Telegram Circular Paperplane Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#5288c1] to-[#6c78e6] text-white flex items-center justify-center mb-4 shadow-xl shadow-[#5288c1]/25 ring-4 ring-[#242f3d]">
            <Send className="w-9 h-9 -translate-x-0.5 translate-y-0.5 fill-white text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Duo Chat
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
            {isRegister
              ? 'Create your permanent profile to start chatting with anyone by phone number.'
              : 'Please confirm your country code and enter your phone number.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex p-1 bg-[#0e1621] border border-[#242f3d] rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              !isRegister
                ? 'bg-[#5288c1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              isRegister
                ? 'bg-[#5288c1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Network Error Actionable Alert */}
        {error && (
          <div className={`mb-4 p-3.5 text-xs rounded-2xl border flex flex-col gap-2.5 animate-in fade-in duration-200 ${
            isNetworkError
              ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
              : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
          }`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{isNetworkError ? 'Cannot Connect to Server' : 'Action Failed'}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{error}</p>
              </div>
            </div>
            {isNetworkError && (
              <button
                type="button"
                onClick={() => setShowServerModal(true)}
                className="w-full py-2 px-3 bg-rose-900/70 hover:bg-rose-800 text-rose-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-rose-700/60"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Change Server URL & Settings</span>
              </button>
            )}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          
          {/* Registration Extra Fields */}
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Krish Lad"
                  className="w-full pl-10 pr-4 py-3 bg-[#0e1621] border border-[#242f3d] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5288c1]/50 focus:border-[#5288c1] text-white placeholder-zinc-500 transition"
                />
              </div>
            </div>
          )}

          {/* Telegram-style Country Selector */}
          <div className="relative">
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Country
            </label>
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="w-full px-4 py-3 bg-[#0e1621] border border-[#242f3d] hover:border-[#5288c1] rounded-xl text-sm text-left flex items-center justify-between text-white transition"
            >
              <span className="flex items-center gap-2.5 truncate mr-2">
                <span className="text-lg shrink-0">{selectedCountry.flag}</span>
                <span className="font-medium truncate">{selectedCountry.name}</span>
              </span>
              <span className="flex items-center gap-2 text-zinc-400 shrink-0">
                <span className="font-mono text-xs">{selectedCountry.code}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {/* Country Dropdown Modal */}
            {isCountryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#17212b] border border-[#242f3d] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-[#242f3d] bg-[#0e1621]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      autoFocus
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search country..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#17212b] border border-[#242f3d] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#5288c1]"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-[#242f3d]/50">
                  {filteredCountries.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(c);
                        setIsCountryDropdownOpen(false);
                        setCountrySearch('');
                      }}
                      className="w-full px-3 py-2 text-xs flex items-center justify-between text-zinc-300 hover:bg-[#5288c1]/20 hover:text-white transition text-left"
                    >
                      <span className="flex items-center gap-2 truncate mr-2">
                        <span>{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </span>
                      <span className="font-mono text-zinc-400 shrink-0">{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Telegram Phone Input with Country Code prefix */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Phone Number
            </label>
            <div className="flex items-center bg-[#0e1621] border border-[#242f3d] rounded-xl focus-within:ring-2 focus-within:ring-[#5288c1]/50 focus-within:border-[#5288c1] transition overflow-hidden">
              <span className="px-3.5 py-3 font-mono text-sm text-[#5288c1] font-semibold bg-[#242f3d]/40 select-none border-r border-[#242f3d] shrink-0">
                {selectedCountry.code}
              </span>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98765 43210"
                className="w-full px-3.5 py-3 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Registration Bio */}
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Bio / Status
              </label>
              <div className="relative">
                <Info className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Hey there! I am using Duo Chat."
                  className="w-full pl-10 pr-4 py-3 bg-[#0e1621] border border-[#242f3d] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5288c1]/50 focus:border-[#5288c1] text-white placeholder-zinc-500 transition"
                />
              </div>
            </div>
          )}

          {/* Password field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password {isRegister && <span className="text-zinc-500 text-[11px]">(min 6 chars)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#0e1621] border border-[#242f3d] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5288c1]/50 focus:border-[#5288c1] text-white placeholder-zinc-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Telegram-style Big Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-[#5288c1] hover:bg-[#4677aa] active:scale-[0.99] text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-[#5288c1]/30 flex items-center justify-center gap-2 uppercase transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>{isRegister ? 'Register' : 'Next'}</span>
            )}
          </button>
        </form>

        {/* Telegram-style Quick Mode Switcher */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-[#6c78e6] hover:text-[#8b95f2] font-medium transition"
          >
            {isRegister
              ? 'Already registered? Log in with phone'
              : 'New user? Create a permanent account'}
          </button>
        </div>

        {/* Server Connection Bar */}
        <div className="mt-6 pt-4 border-t border-[#242f3d] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 truncate max-w-[210px] text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                serverStatus === 'online'
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : serverStatus === 'offline'
                  ? 'bg-rose-400'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="truncate font-mono text-[10px]" title={activeApiUrl}>
              {formatUrlForDisplay(activeApiUrl)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowServerModal(true)}
            className="flex items-center gap-1 text-[#5288c1] hover:text-[#6c78e6] font-medium transition shrink-0 ml-2"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Server Settings</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-zinc-500 z-10 mt-6">
        Duo Chat Web &bull; Fast, secure & permanent messaging platform
      </footer>

      {/* Server Settings Modal */}
      <ServerSettingsModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
        onSaved={(url) => {
          setActiveApiUrl(url);
          setError('');
        }}
      />
    </div>
  );
}
