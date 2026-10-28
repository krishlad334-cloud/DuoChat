import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  X,
  Wifi,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { authAPI } from '../../services/api';

export default function ConnectPhoneModal({ isOpen, onClose }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('priya'); // default for 2nd device testing
  const [copied, setCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);
  const canvasRef = useRef(null);

  // Fetch network IP info on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchInfo = async () => {
      try {
        const res = await authAPI.getNetworkInfo();
        if (isMounted && res.data?.success) {
          setNetworkInfo(res.data);
        }
      } catch (err) {
        console.warn('Network info lookup failed:', err.message);
      }
    };

    fetchInfo();
    return () => { isMounted = false; };
  }, [isOpen]);

  // Compute mobile URL based on host and selected direct login profile
  const getMobileUrl = () => {
    let base = '';
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const port = window.location.port;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

      if (isLocalhost) {
        // Crucial: Mobile phones can NEVER connect to "localhost". Always use the machine's LAN IP!
        const lanIp = networkInfo?.localIp || '192.168.1.28';
        base = `http://${lanIp}:${port || '5173'}`;
      } else {
        base = window.location.origin;
      }
    } else {
      base = 'http://192.168.1.28:5173';
    }

    if (selectedProfile === 'none') {
      return base;
    }
    return `${base}?direct=${selectedProfile}`;
  };

  const mobileUrl = getMobileUrl();

  // Render QR Code onto canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    setQrLoading(true);
    QRCode.toCanvas(
      canvasRef.current,
      mobileUrl,
      {
        width: 210,
        margin: 2,
        color: {
          dark: '#0e1621',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      },
      (err) => {
        setQrLoading(false);
        if (err) console.error('QR Code render error:', err);
      }
    );
  }, [isOpen, mobileUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#17212b] border border-[#242f3d] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242f3d] flex items-center justify-between bg-[#111923]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5288c1]/20 border border-[#5288c1]/40 flex items-center justify-center text-[#5288c1]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-1.5">
                <span>Login on Phone / Other Device</span>
              </h3>
              <p className="text-[11px] text-zinc-400">Direct mobile connection via QR Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#242f3d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center">
            <div className="p-3.5 bg-white rounded-2xl shadow-xl shadow-black/40 ring-4 ring-[#5288c1]/20 relative flex items-center justify-center min-h-[220px] min-w-[220px]">
              <canvas ref={canvasRef} className="rounded-lg" />
              {qrLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl text-zinc-800 text-xs font-semibold">
                  Generating QR...
                </div>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2.5 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#5288c1]" />
              <span>Point phone camera to open and login instantly</span>
            </p>
          </div>

          {/* Account selector for Phone Direct Login */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Auto-login Profile on Phone (1-Tap):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedProfile('priya')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  selectedProfile === 'priya'
                    ? 'bg-[#5288c1]/20 border-[#5288c1] text-white shadow-sm'
                    : 'bg-[#0e1621] border-[#242f3d] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-pink-400">👤 Priya</span>
                  {selectedProfile === 'priya' && <Check className="w-3.5 h-3.5 text-[#5288c1]" />}
                </div>
                <span className="text-[10px] text-zinc-400">+91 98765 43210</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProfile('krish')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  selectedProfile === 'krish'
                    ? 'bg-[#5288c1]/20 border-[#5288c1] text-white shadow-sm'
                    : 'bg-[#0e1621] border-[#242f3d] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-400">👤 Krish</span>
                  {selectedProfile === 'krish' && <Check className="w-3.5 h-3.5 text-[#5288c1]" />}
                </div>
                <span className="text-[10px] text-zinc-400">+91 99999 88888</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProfile('rahul')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  selectedProfile === 'rahul'
                    ? 'bg-[#5288c1]/20 border-[#5288c1] text-white shadow-sm'
                    : 'bg-[#0e1621] border-[#242f3d] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-400">👤 Rahul</span>
                  {selectedProfile === 'rahul' && <Check className="w-3.5 h-3.5 text-[#5288c1]" />}
                </div>
                <span className="text-[10px] text-zinc-400">+91 98765 43211</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProfile('none')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  selectedProfile === 'none'
                    ? 'bg-[#5288c1]/20 border-[#5288c1] text-white shadow-sm'
                    : 'bg-[#0e1621] border-[#242f3d] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-300">📱 Clean Screen</span>
                  {selectedProfile === 'none' && <Check className="w-3.5 h-3.5 text-[#5288c1]" />}
                </div>
                <span className="text-[10px] text-zinc-400">Manual / Picker</span>
              </button>
            </div>
          </div>

          {/* Direct Phone URL Box with Copy */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Direct Phone Access URL:
            </label>
            <div className="flex items-center gap-1.5 bg-[#0e1621] border border-[#242f3d] rounded-xl p-1.5 focus-within:border-[#5288c1]">
              <input
                type="text"
                readOnly
                value={mobileUrl}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs font-mono text-zinc-200 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#5288c1] hover:bg-[#4677aa] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="p-3 bg-[#0e1621]/60 border border-[#242f3d]/70 rounded-2xl text-[11px] text-zinc-400 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>How to use on Phone & Other Devices:</span>
            </div>
            <p>1. Connect your mobile phone to the <strong>same Wi-Fi network</strong> as this computer.</p>
            <p>2. Open your phone camera or browser and scan the QR code above.</p>
            <p>3. Tap <strong>Direct 1-Tap Login</strong> on your phone to start chatting immediately!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#242f3d] bg-[#111923] flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-400">
            Network IP: <code className="text-emerald-400 font-mono">{networkInfo?.localIp || 'Auto-detected'}</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#242f3d] hover:bg-[#2d3a4b] text-white rounded-xl font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
