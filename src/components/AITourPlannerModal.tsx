import React, { useState } from 'react';
import { Room } from '../types/tour';
import {
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Maximize2,
  Play,
  ArrowRight,
  Cpu,
  Image,
} from 'lucide-react';

interface AITourPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onRegenerateScene: (roomId: string, resolution: '2k' | '4k') => void;
  isConvertingAll: boolean;
  onConvertAll: () => void;
  conversionProgress: Record<string, number>;
}

export const AITourPlannerModal: React.FC<AITourPlannerModalProps> = ({
  isOpen,
  onClose,
  rooms,
  currentRoomId,
  onSelectRoom,
  onRegenerateScene,
  isConvertingAll,
  onConvertAll,
  conversionProgress,
}) => {
  const [resolution, setResolution] = useState<'2k' | '4k'>('4k');
  const [autoLinkHotspots, setAutoLinkHotspots] = useState(true);

  if (!isOpen) return null;

  const totalRooms = rooms.length;
  const completedCount = rooms.filter(
    (r) => (conversionProgress[r.id] ?? 100) >= 100
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-slate-950 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Spatial Tour Studio
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Live Engine
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-white mt-0.5">
                Generate Full Tour
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Banner: "Your photos are being converted to 360° scenes in the background" */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-amber-500/15 via-slate-900 to-cyan-500/15 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-100">
                Your photos are being converted to 360° scenes in the background.
              </p>
              <p className="text-[11px] text-slate-400">
                Plan several AI scenes at once using mathematical rectilinear-to-equirectangular projection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-xs font-bold text-amber-300">
                {completedCount} of {totalRooms} Ready
              </span>
              <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(completedCount / totalRooms) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={onConvertAll}
              disabled={isConvertingAll}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isConvertingAll ? 'animate-spin' : ''}`} />
              <span>{isConvertingAll ? 'Converting...' : 'Batch Convert All'}</span>
            </button>
          </div>
        </div>

        {/* Global Controls & Plan Settings */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">360° Output Resolution:</span>
            <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-xl">
              <button
                onClick={() => setResolution('2k')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  resolution === '2k'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2K (2048x1024)
              </button>
              <button
                onClick={() => setResolution('4k')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  resolution === '4k'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                4K Ultra-HD (3840x1920)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={autoLinkHotspots}
              onChange={(e) => setAutoLinkHotspots(e.target.checked)}
              className="rounded border-white/20 bg-slate-900 text-amber-400 focus:ring-amber-400"
            />
            <span className="text-xs">Auto-link walk hotspots across scenes</span>
          </label>
        </div>

        {/* Scrollable Scene Queue Cards */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rooms.map((room) => {
              const isActive = room.id === currentRoomId;
              const progress = conversionProgress[room.id] ?? 100;
              const isReady = progress >= 100;

              return (
                <div
                  key={room.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-400/50 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Photo thumbnail */}
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/15">
                    <img
                      src={room.photoUrl}
                      alt={room.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isReady && (
                      <span className="absolute bottom-1 right-1 p-0.5 rounded-full bg-emerald-500 text-slate-950">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Info & Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {room.title}
                      </span>
                      {isActive && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {room.floor} · {room.area} · {resolution.toUpperCase()} AI Equirectangular
                    </div>

                    {/* Progress indicator */}
                    {!isReady && (
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-amber-400 transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onRegenerateScene(room.id, resolution)}
                      className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-colors"
                      title="Regenerate 360 Scene"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectRoom(room.id);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Powered by high-precision spherical projection engine · Zero distortion
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Done Planning
          </button>
        </div>
      </div>
    </div>
  );
};
