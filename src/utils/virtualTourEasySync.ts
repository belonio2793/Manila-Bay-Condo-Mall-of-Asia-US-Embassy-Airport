import { Room } from '../types/tour';

export interface VTEApiResponse {
  format?: string;
  version?: number;
  ref_id?: string;
  title?: string;
  scenes?: Array<{
    uuid: string;
    name: string;
    image_url: string;
    thumbnail_url?: string | null;
    initial_yaw?: number;
    initial_pitch?: number;
    initial_zoom?: number;
    hotspots?: any[];
  }>;
}

export function extractVTETourId(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const r = url.searchParams.get('r') || url.searchParams.get('tourid') || url.searchParams.get('v');
    if (r) return r;
    const pathMatch = url.pathname.match(/\/([a-zA-Z0-9_-]{6,64})/);
    if (pathMatch) return pathMatch[1];
  } catch {
    // Not a full URL, treat as direct ref_id
  }
  return trimmed;
}

export async function fetchVirtualTourEasyTour(tourRefOrUrl: string): Promise<{
  title: string;
  rooms: Room[];
}> {
  const refId = extractVTETourId(tourRefOrUrl);
  if (!refId) {
    throw new Error('Invalid VirtualTourEasy tour URL or ID');
  }

  const endpoint = `https://api.virtualtoureasy.com/viewer/${encodeURIComponent(refId)}`;
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to load VirtualTourEasy tour (${res.status})`);
  }

  const data: VTEApiResponse = await res.json();
  const scenes = data.scenes || [];

  if (scenes.length === 0) {
    throw new Error('No scenes found in this VirtualTourEasy tour.');
  }

  const convertedRooms: Room[] = scenes.map((scene, idx) => ({
    id: `vte-${scene.uuid}`,
    title: scene.name || `360° Scene ${idx + 1}`,
    subtitle: data.title || '360° Panoramic Scene',
    floor: '37th Floor Suite',
    area: '27 sq.m',
    photoUrl: scene.image_url,
    panoUrl: scene.image_url,
    defaultYaw: scene.initial_yaw || 0,
    defaultPitch: scene.initial_pitch || 0,
    generatorType: 'bedroom',
    miniMapCoords: { x: 50 + idx * 10, y: 55 },
    description: `High-definition 4K 360° equirectangular panoramic scene.`,
    features: ['4K 360°', 'Equirectangular View', 'High Definition'],
    hotspots: [
      {
        id: `vte-hotspot-${idx}`,
        type: 'navigation',
        yaw: 15,
        pitch: -5,
        title: 'Explore Suite',
        targetRoomId: scenes[(idx + 1) % scenes.length] ? `vte-${scenes[(idx + 1) % scenes.length].uuid}` : undefined,
        icon: 'door',
      },
    ],
  }));

  return {
    title: data.title || 'VirtualTourEasy Tour',
    rooms: convertedRooms,
  };
}
