import React, { useState } from 'react';
import { Room } from '../types/tour';
import { ChevronUp, ChevronDown, Layers, Sparkles } from 'lucide-react';

interface RoomSelectorProps {
  rooms: Room[];
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  currentRoomId,
  onSelectRoom,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[96vw] sm:max-w-5xl transition-all duration-300">
      {/* Toggle Drawer Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-white/15 rounded-full text-slate-300 hover:text-white text-[11px] font-medium mb-1.5 shadow-xl transition-all"
        title={isExpanded ? 'Hide room carousel' : 'Show rooms & spaces'}
      >
        <Layers className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-semibold">{isExpanded ? 'Hide Spaces' : 'Select Listing Photos'}</span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Thumbnails Carousel Bar with REAL photos */}
      {isExpanded && (
        <div className="flex items-center gap-2 p-2 bg-slate-950/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-x-auto max-w-full scrollbar-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          {rooms.map((room) => {
            const isActive = room.id === currentRoomId;

            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all whitespace-nowrap text-left shrink-0 group ${
                  isActive
                    ? 'bg-amber-500/25 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25'
                }`}
              >
                {/* Real photo thumbnail preview */}
                <div className="relative w-13 h-9 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-slate-900">
                  <img
                    src={room.photoUrl}
                    alt={room.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {isActive && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isActive ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {room.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-amber-400/90 font-medium">{room.floor}</span>
                    <span className="text-white/20">·</span>
                    <span>{room.area}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
