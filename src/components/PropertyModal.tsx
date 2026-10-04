import React from 'react';
import { PropertyDetails, Room } from '../types/tour';
import {
  X,
  MapPin,
  Wifi,
  Tv,
  Users,
  Maximize,
  Building,
  CheckCircle,
  ExternalLink,
  Compass,
  Clock,
  Sparkles,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyDetails;
  rooms: Room[];
  onSelectRoom: (roomId: string) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  rooms,
  onSelectRoom,
}) => {
  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - 3D Virtual Tour at Breeze Residences Manila Bay`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Virtual Tour link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="w-full max-w-xl h-full bg-slate-950/95 border-l border-white/10 text-white flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                {property.building}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-slate-400">{property.specs.floor}</span>
            </div>
            <h2 className="text-lg font-bold font-display text-white mt-0.5">
              {property.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Share Virtual Tour"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Key Quick Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <Maximize className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">Total Area</div>
                <div className="text-xs font-semibold text-white">{property.specs.size}</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">Capacity</div>
                <div className="text-xs font-semibold text-white">{property.specs.capacity}</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">Balcony View</div>
                <div className="text-xs font-semibold text-white">Manila Bay Sunset</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <Wifi className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">Internet</div>
                <div className="text-xs font-semibold text-white">Fast Fiber Wi-Fi</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <Tv className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">Entertainment</div>
                <div className="text-xs font-semibold text-white">40" Smart TV + Netflix</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <Building className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">Amenities</div>
                <div className="text-xs font-semibold text-white">8th Flr Pools & Plaza</div>
              </div>
            </div>
          </div>

          {/* Quick 3D Room Jump */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Explore Spaces in 3D
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onSelectRoom(room.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-xl transition-all group text-left"
                >
                  <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                    <img
                      src={room.photoUrl}
                      alt={room.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 truncate">
                      {room.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {room.floor} · {room.area}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhood & Distances */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Prime Location & Proximity
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Located on Roxas Boulevard, Pasay City — minutes away from Manila’s primary cultural, shopping, and international transit hubs.
            </p>
            <div className="space-y-2">
              {property.nearby.map((place) => (
                <div
                  key={place.place}
                  className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {place.place}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {place.time}
                    </span>
                    <span className="text-[11px]">({place.distance})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Amenities */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Unit & Building Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <h4 className="text-xs font-semibold text-amber-300 border-b border-white/10 pb-1">
                    {cat.category}
                  </h4>
                  <ul className="space-y-1.5">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center gap-3">
          <a
            href={property.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg transition-all"
          >
            <span>View Full Listing on RestEasy.ph</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Back to 3D Tour
          </button>
        </div>
      </div>
    </div>
  );
};
