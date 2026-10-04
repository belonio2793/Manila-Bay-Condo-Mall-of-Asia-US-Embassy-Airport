import React from 'react';
import { Hotspot } from '../types/tour';
import { X, Sparkles, Bed, Tv, Sun, Eye, Coffee, Bath, Waves } from 'lucide-react';

interface HotspotModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
}

export const HotspotModal: React.FC<HotspotModalProps> = ({ hotspot, onClose }) => {
  if (!hotspot) return null;

  const renderIcon = () => {
    switch (hotspot.icon) {
      case 'bed':
        return <Bed className="w-5 h-5 text-amber-400" />;
      case 'tv':
        return <Tv className="w-5 h-5 text-rose-400" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-amber-300" />;
      case 'bath':
        return <Bath className="w-5 h-5 text-cyan-400" />;
      case 'pool':
        return <Waves className="w-5 h-5 text-blue-400" />;
      default:
        return <Eye className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-slate-950/95 border border-white/20 rounded-2xl shadow-2xl p-5 text-white relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            {renderIcon()}
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              Feature Highlight
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">{hotspot.title}</h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/5">
          {hotspot.description ||
            'High-definition architectural detail from Breeze Residences 37th Floor suite.'}
        </p>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
