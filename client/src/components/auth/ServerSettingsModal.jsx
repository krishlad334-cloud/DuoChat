import React, { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  RotateCcw,
  ExternalLink,
  Wifi,
  Sparkles
} from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl, resetCustomApiUrl, testApiConnection, authAPI } from '../../services/api';

export default function ServerSettingsModal({ isOpen, onClose, onSaved }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: bool, latency: number, message: string }
  const [saving, setSaving] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const active = getApiBaseUrl();
      setCurrentUrl(active);
      setInputUrl(active);
      setTestResult(null);

      authAPI.getNetworkInfo()
        .then(res => {
          if (res.data?.success) setNetworkInfo(res.data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!inputUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    const res = await testApiConnection(inputUrl.trim());
    setTesting(false);
    if (res.ok) {
      setTestResult({
        ok: true,
        latency: res.latency,
        message: `Connected successfully! (${res.latency}ms response)`
      });
    } else {
      setTestResult({
        ok: false,
        latency: res.latency,
        message: res.error || 'Connection failed'
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setCustomApiUrl(inputUrl.trim());
    if (onSaved) onSaved(inputUrl.trim());
    setSaving(false);
    onClose();
  };

  const handleReset = () => {
    resetCustomApiUrl();
    const restored = getApiBaseUrl();
    setInputUrl(restored);
    setTestResult(null);
  };

  const setPreset = (url) => {
    setInputUrl(url);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#17212b] border border-[#242f3d] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242f3d] flex items-center justify-between bg-[#111923]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5288c1]/20 border border-[#5288c1]/40 flex items-center justify-center text-[#5288c1]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Server Connection</h3>
              <p className="text-[11px] text-zinc-400">Configure Duo Chat backend API host</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#242f3d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Active Server Info */}
          <div className="p-3 bg-[#0e1621] border border-[#242f3d] rounded-2xl flex items-center justify-between text-xs">
            <span className="text-zinc-400">Active Backend:</span>
            <span className="font-mono text-[11px] text-[#5288c1] truncate max-w-[280px]" title={currentUrl}>
              {currentUrl}
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== 'undefined' ? window.location.origin : '';
                  setPreset(`${origin}/api`);
                }}
                className="p-2.5 bg-[#0e1621] hover:bg-[#242f3d] border border-[#242f3d] rounded-xl text-left transition flex flex-col gap-0.5"
              >
                <span className="font-semibold text-white">Same Host (/api)</span>
                <span className="text-[10px] text-zinc-400 truncate">Vercel & Auto-proxy</span>
              </button>
              {networkInfo?.localIp ? (
                <button
                  type="button"
                  onClick={() => setPreset(`http://${networkInfo.localIp}:5000/api`)}
                  className="p-2.5 bg-[#0e1621] hover:bg-[#242f3d] border border-[#242f3d] rounded-xl text-left transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-emerald-400">Wi-Fi LAN Server</span>
                  <span className="text-[10px] text-zinc-400 truncate">{networkInfo.localIp}:5000</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPreset('http://localhost:5000/api')}
                  className="p-2.5 bg-[#0e1621] hover:bg-[#242f3d] border border-[#242f3d] rounded-xl text-left transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">Localhost (5000)</span>
                  <span className="text-[10px] text-zinc-400 truncate">Local Node server</span>
                </button>
              )}
            </div>
          </div>

          {/* Backend URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Backend API Endpoint URL
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-zinc-400 hover:text-[#5288c1] flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://your-server.onrender.com/api"
                className="w-full px-4 py-3 bg-[#0e1621] border border-[#242f3d] rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5288c1]/50 focus:border-[#5288c1] transition"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed">
              Enter your backend server domain (e.g. Render, Railway, Vercel, or local IP like <code className="text-zinc-300">http://192.168.1.5:5000/api</code>).
            </p>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                testResult.ok
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.ok ? 'Connection Verified' : 'Connection Failed'}</p>
                <p className="text-[11px] opacity-90 mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#242f3d] bg-[#111923] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !inputUrl.trim()}
            className="px-4 py-2.5 bg-[#242f3d] hover:bg-[#2d3a4b] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Test Ping</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !inputUrl.trim()}
              className="px-5 py-2.5 bg-[#5288c1] hover:bg-[#4677aa] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#5288c1]/25 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
