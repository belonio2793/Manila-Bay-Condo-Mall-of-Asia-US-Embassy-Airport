import React from 'react';
import { Room } from '../types/tour';
import { Maximize2, Minimize2, MapPin } from 'lucide-react';

interface MiniMapProps {
  rooms: Room[];
  currentRoomId: string;
  cameraYaw: number;
  cameraFov: number;
  onSelectRoom: (roomId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  rooms,
  currentRoomId,
  cameraYaw,
  cameraFov,
  onSelectRoom,
  isOpen,
  onToggle,
}) => {
  const currentRoom = rooms.find((r) => r.id === currentRoomId);
  const isCondoFloor = currentRoom?.floor === '37th Floor';

  // Calculate radar frustum cone SVG path based on cameraYaw and cameraFov
  // In our coordinate system, 0 is North/Balcony (-Y), 90 is East (+X), 180 is South (+Y), 270 is West (-X)
  const angleRad = ((cameraYaw - 90) * Math.PI) / 180;
  const halfFovRad = ((cameraFov * 0.5) * Math.PI) / 180;
  const frustumLength = 36;

  const currentX = currentRoom?.miniMapCoords.x ?? 50;
  const currentY = currentRoom?.miniMapCoords.y ?? 50;

  const leftAngle = angleRad - halfFovRad;
  const rightAngle = angleRad + halfFovRad;

  const lx = currentX + (Math.cos(leftAngle) * frustumLength) / 1.5;
  const ly = currentY + (Math.sin(leftAngle) * frustumLength) / 1.5;
  const rx = currentX + (Math.cos(rightAngle) * frustumLength) / 1.5;
  const ry = currentY + (Math.sin(rightAngle) * frustumLength) / 1.5;

  const frustumPath = `M ${currentX} ${currentY} L ${lx} ${ly} A ${frustumLength / 1.5} ${frustumLength / 1.5} 0 0 1 ${rx} ${ry} Z`;

  return (
    <div
      className={`fixed bottom-24 right-4 z-30 transition-all duration-300 ease-out ${
        isOpen ? 'w-72 sm:w-80' : 'w-auto'
      }`}
    >
      {isOpen ? (
        <div className="bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl text-white">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-semibold tracking-wide uppercase text-amber-300">
                {isCondoFloor ? 'Studio Floor Plan (27 m²)' : '8th Flr Amenity Deck'}
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Minimize floor plan"
              aria-label="Minimize floor plan"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Floor Plan SVG Diagram */}
          <div className="relative w-full aspect-[4/3] bg-slate-900/90 rounded-xl overflow-hidden border border-white/10 p-2">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
            >
              {/* Outer architectural walls */}
              {isCondoFloor ? (
                <>
                  {/* Studio 27 sqm boundary */}
                  <rect
                    x="10"
                    y="5"
                    width="80"
                    height="90"
                    fill="#18181b"
                    stroke="#475569"
                    strokeWidth="1.8"
                    rx="2"
                  />
                  {/* Balcony Zone (Top) */}
                  <rect
                    x="20"
                    y="5"
                    width="60"
                    height="20"
                    fill="#1e293b"
                    stroke="#38bdf8"
                    strokeDasharray="2,2"
                    strokeWidth="1"
                  />
                  <text
                    x="50"
                    y="17"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="4.2"
                    fontWeight="600"
                  >
                    BALCONY (BAY VIEW)
                  </text>

                  {/* Sliding glass door divider */}
                  <line
                    x1="20"
                    y1="25"
                    x2="80"
                    y2="25"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />

                  {/* Studio Main Living & Bed Area */}
                  <text
                    x="50"
                    y="46"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="4.5"
                    fontWeight="500"
                  >
                    STUDIO SUITE & LOUNGE
                  </text>
                  {/* Bed graphic */}
                  <rect
                    x="36"
                    y="50"
                    width="28"
                    height="22"
                    fill="#334155"
                    stroke="#64748b"
                    strokeWidth="0.8"
                    rx="1.5"
                  />
                  <line x1="36" y1="56" x2="64" y2="56" stroke="#475569" strokeWidth="0.8" />
                  <text x="50" y="64" textAnchor="middle" fill="#cbd5e1" fontSize="3.6">
                    Double Bed
                  </text>

                  {/* 40" TV on Wall */}
                  <line x1="12" y1="42" x2="12" y2="58" stroke="#f43f5e" strokeWidth="2.2" />
                  <text x="17" y="52" fill="#f43f5e" fontSize="3.2" fontWeight="bold">
                    40" TV
                  </text>

                  {/* Interior Partition Wall between Bath & Kitchenette */}
                  <line x1="45" y1="72" x2="45" y2="95" stroke="#475569" strokeWidth="1.8" />
                  <line x1="10" y1="72" x2="90" y2="72" stroke="#475569" strokeWidth="1.8" />

                  {/* Bathroom Zone */}
                  <rect x="10" y="72" width="35" height="23" fill="#1e293b" />
                  <text x="27.5" y="85" textAnchor="middle" fill="#94a3b8" fontSize="3.8">
                    BATHROOM
                  </text>

                  {/* Kitchenette Zone */}
                  <rect x="45" y="72" width="45" height="23" fill="#1e293b" />
                  <text x="67.5" y="85" textAnchor="middle" fill="#94a3b8" fontSize="3.8">
                    KITCHENETTE
                  </text>

                  {/* Entry Door indicator */}
                  <path d="M 88 95 A 8 8 0 0 0 80 87" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                  <line x1="88" y1="95" x2="80" y2="95" stroke="#cbd5e1" strokeWidth="1.2" />
                  <text x="73" y="93" fill="#64748b" fontSize="3">
                    ENTRY
                  </text>
                </>
              ) : (
                <>
                  {/* Pool Deck Blueprint */}
                  <rect
                    x="8"
                    y="8"
                    width="84"
                    height="84"
                    fill="#18181b"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    rx="4"
                  />
                  {/* Lap Pool Waters */}
                  <rect
                    x="20"
                    y="22"
                    width="60"
                    height="50"
                    fill="#0284c7"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    rx="2"
                  />
                  <line x1="20" y1="34" x2="80" y2="34" stroke="#0ea5e9" strokeWidth="0.5" />
                  <line x1="20" y1="46" x2="80" y2="46" stroke="#0ea5e9" strokeWidth="0.5" />
                  <line x1="20" y1="58" x2="80" y2="58" stroke="#0ea5e9" strokeWidth="0.5" />
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="5"
                    fontWeight="bold"
                  >
                    HORIZON LAP POOL
                  </text>
                  <text
                    x="50"
                    y="82"
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="3.8"
                  >
                    TEAK SUN LOUNGER TERRACE
                  </text>
                </>
              )}

              {/* Dynamic Camera Radar Frustum (Viewing Cone) */}
              <path
                d={frustumPath}
                fill="url(#frustumGradient)"
                stroke="rgba(251, 191, 36, 0.7)"
                strokeWidth="0.8"
                className="animate-radar-frustum"
              />

              {/* Gradient definition for frustum */}
              <defs>
                <radialGradient id="frustumGradient" cx={currentX} cy={currentY} r={frustumLength} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Interactive Room Position Nodes */}
              {rooms
                .filter((r) => (isCondoFloor ? r.floor === '37th Floor' : r.floor === '8th Floor Amenity Deck'))
                .map((room) => {
                  const isCurrent = room.id === currentRoomId;
                  return (
                    <g
                      key={room.id}
                      onClick={() => onSelectRoom(room.id)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse circle for active room */}
                      {isCurrent && (
                        <circle
                          cx={room.miniMapCoords.x}
                          cy={room.miniMapCoords.y}
                          r="6.5"
                          fill="#fbbf24"
                          opacity="0.3"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={room.miniMapCoords.x}
                        cy={room.miniMapCoords.y}
                        r={isCurrent ? '3.8' : '2.8'}
                        fill={isCurrent ? '#f59e0b' : '#94a3b8'}
                        stroke="#ffffff"
                        strokeWidth="1"
                        className="transition-all group-hover:scale-125"
                      />
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* Bottom Floor Selector */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-400">View:</span>
            <div className="flex gap-1">
              <button
                onClick={() => onSelectRoom('studio-suite')}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30"
              >
                37th Studio Suite
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl text-white hover:bg-slate-900/90 shadow-lg transition-all hover:scale-105 active:scale-95"
          title="Open interactive floor plan"
        >
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold">Floor Plan</span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  );
};
