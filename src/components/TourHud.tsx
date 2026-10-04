import React, { useState } from 'react';
import { PropertyDetails, Room } from '../types/tour';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Glasses,
  Info,
  Maximize,
  Minimize,
  HelpCircle,
  PlusCircle,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface TourHudProps {
  property: PropertyDetails;
  currentRoom: Room;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  isVRMode: boolean;
  onToggleVR: () => void;
  onOpenPropertyModal: () => void;
  onOpenCustomPhotoModal: () => void;
  onToggleMiniMap: () => void;
  onOpenAIPlannerModal: () => void;
  isConvertingAI?: boolean;
}

export const TourHud: React.FC<TourHudProps> = ({
  property,
  currentRoom,
  isAutoRotate,
  onToggleAutoRotate,
  isAudioPlaying,
  onToggleAudio,
  isVRMode,
  onToggleVR,
  onOpenPropertyModal,
  onOpenCustomPhotoModal,
  onToggleMiniMap,
  onOpenAIPlannerModal,
  isConvertingAI,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
      {/* TOP LEFT: Brand & Room Identity HUD */}
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-1 max-w-[calc(100vw-120px)] sm:max-w-md pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <span className="text-amber-400 font-semibold">{property.building}</span>
              <span className="text-white/30">·</span>
              <span className="truncate">{property.specs.floor}</span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {currentRoom.title}
            </h1>
          </div>
        </div>

        {/* Room features subtle kicker */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 backdrop-blur-sm rounded-xl border border-white/5 text-[10px] text-slate-400 pointer-events-auto w-fit">
          <span className="text-amber-400 font-semibold">{currentRoom.area}</span>
          <span>·</span>
          <span className="truncate">{currentRoom.features.slice(0, 3).join(' · ')}</span>
        </div>
      </div>

      {/* TOP RIGHT: Action Controls Bar */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/15 p-1.5 rounded-2xl shadow-2xl text-white">
        {/* Auto Rotate Button */}
        <button
          onClick={onToggleAutoRotate}
          className={`p-2 rounded-xl transition-all ${
            isAutoRotate
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={isAutoRotate ? 'Pause auto-rotation (Space)' : 'Start auto-rotation (Space)'}
          aria-label="Toggle auto rotation"
        >
          {isAutoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Ambient Sound Atmosphere */}
        <button
          onClick={onToggleAudio}
          className={`p-2 rounded-xl transition-all relative ${
            isAudioPlaying
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={isAudioPlaying ? 'Mute tropical sunset breeze audio' : 'Play ambient audio'}
          aria-label="Toggle ambient audio"
        >
          {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {isAudioPlaying && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>

        {/* VR Stereo Mode */}
        <button
          onClick={onToggleVR}
          className={`p-2 rounded-xl transition-all ${
            isVRMode
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={isVRMode ? 'Exit VR mode' : 'Enter VR split-screen mode'}
          aria-label="Toggle VR mode"
        >
          <Glasses className="w-4 h-4" />
        </button>

        {/* Generate Full Tour / AI 360 Studio */}
        <button
          onClick={onOpenAIPlannerModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
          title="Plan several AI scenes at once & convert in background"
          aria-label="Generate Full Tour"
        >
          <Sparkles className={`w-3.5 h-3.5 text-slate-950 ${isConvertingAI ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Generate Full Tour</span>
          <span className="sm:hidden">AI Tour</span>
        </button>

        {/* Custom 360 photo loader */}
        <button
          onClick={onOpenCustomPhotoModal}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Upload or paste custom 360° photo"
          aria-label="Upload custom 360 photo"
        >
          <PlusCircle className="w-4 h-4" />
        </button>

        {/* Property Specs / Booking Modal */}
        <button
          onClick={onOpenPropertyModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg transition-all active:scale-95"
          title="View RestEasy property details & amenities"
          aria-label="Property info"
        >
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">Details</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'View in fullscreen'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Shortcuts Help */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Navigation controls guide"
          aria-label="Help guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm bg-slate-950/95 border border-white/20 rounded-2xl shadow-2xl p-5 text-white relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Virtual Tour Navigation Guide
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="font-medium text-slate-200">Look Around 360°</span>
                <span className="text-[11px] text-slate-400">Click & Drag / Touch Swipe</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="font-medium text-slate-200">Zoom In & Out</span>
                <span className="text-[11px] text-slate-400">Mouse Wheel / Pinch / + -</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="font-medium text-slate-200">Walk Between Rooms</span>
                <span className="text-[11px] text-slate-400">Click Pulsing Hotspots</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="font-medium text-slate-200">Keyboard Look</span>
                <span className="text-[11px] text-slate-400">Arrow Keys or W A S D</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="font-medium text-slate-200">Toggle Auto-Tour</span>
                <span className="text-[11px] text-slate-400">Spacebar</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
