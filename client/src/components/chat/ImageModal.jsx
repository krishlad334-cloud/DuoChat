import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function ImageModal({ src, alt, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
      >
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <a
            href={src}
            download
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition"
            title="Download original"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <img
          src={src}
          alt={alt || 'Full preview'}
          className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}
