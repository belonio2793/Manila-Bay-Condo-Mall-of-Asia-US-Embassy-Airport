export interface Hotspot {
  id: string;
  type: 'navigation' | 'info';
  yaw: number; // 0 - 360 degrees
  pitch: number; // -90 to +90 degrees
  title: string;
  targetRoomId?: string;
  description?: string;
  badge?: string;
  icon?: 'door' | 'info' | 'eye' | 'bed' | 'tv' | 'sun' | 'coffee' | 'pool' | 'bath';
}

export interface Room {
  id: string;
  title: string;
  subtitle: string;
  floor: string;
  area: string;
  photoUrl: string; // Direct actual photo from the listing
  panoUrl?: string; // Composited 360 equirectangular texture or custom 360
  defaultYaw: number;
  defaultPitch: number;
  generatorType: 'bedroom' | 'balcony' | 'kitchenette' | 'bathroom' | 'pool';
  miniMapCoords: { x: number; y: number }; // percentage 0-100 on floor plan
  hotspots: Hotspot[];
  features: string[];
  description: string;
}

export interface PropertyDetails {
  title: string;
  tagline: string;
  building: string;
  location: string;
  neighborhood: string;
  specs: {
    unitType: string;
    size: string;
    floor: string;
    capacity: string;
    view: string;
    wifi: string;
  };
  amenities: {
    category: string;
    items: string[];
  }[];
  nearby: {
    place: string;
    time: string;
    distance: string;
  }[];
  sourceUrl: string;
}
