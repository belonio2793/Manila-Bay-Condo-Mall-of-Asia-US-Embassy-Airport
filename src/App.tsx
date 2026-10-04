import React, { useState, useCallback } from 'react';
import { TOUR_ROOMS, PROPERTY_DETAILS } from './data/tourData';
import { Room, Hotspot } from './types/tour';
import { VirtualTourViewer } from './components/VirtualTourViewer';
import { TourHud } from './components/TourHud';
import { RoomSelector } from './components/RoomSelector';
import { MiniMap } from './components/MiniMap';
import { PropertyModal } from './components/PropertyModal';
import { HotspotModal } from './components/HotspotModal';
import { CustomPanoramaModal } from './components/CustomPanoramaModal';
import { AITourPlannerModal } from './components/AITourPlannerModal';
import { audioAmbience } from './utils/audioAmbience';
import { generateAI360Panorama } from './utils/aiPanoGenerator';

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(TOUR_ROOMS);
  const [currentRoomId, setCurrentRoomId] = useState<string>('studio-suite');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isVRMode, setIsVRMode] = useState<boolean>(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState<boolean>(false);
  const [isCustomPhotoModalOpen, setIsCustomPhotoModalOpen] = useState<boolean>(false);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState<boolean>(false);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState<boolean>(false);
  const [selectedInfoHotspot, setSelectedInfoHotspot] = useState<Hotspot | null>(null);

  // Background AI Conversion state
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<Record<string, number>>({});

  // Live camera tracking for MiniMap radar frustum
  const [cameraYaw, setCameraYaw] = useState<number>(0);
  const [cameraPitch, setCameraPitch] = useState<number>(0);
  const [cameraFov, setCameraFov] = useState<number>(68);

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  const handleNavigateRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const playing = audioAmbience.toggle();
    setIsAudioPlaying(playing);
  }, []);

  // Regenerate individual 360 scene
  const handleRegenerateScene = useCallback(
    async (roomId: string, resolution: '2k' | '4k') => {
      const target = rooms.find((r) => r.id === roomId);
      if (!target) return;

      setConversionProgress((prev) => ({ ...prev, [roomId]: 20 }));

      try {
        setConversionProgress((prev) => ({ ...prev, [roomId]: 60 }));
        const panoUrl = await generateAI360Panorama(target.photoUrl, target.id, resolution);
        setConversionProgress((prev) => ({ ...prev, [roomId]: 100 }));

        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, panoUrl } : r))
        );
      } catch (err) {
        console.error('Error generating 360 scene:', err);
        setConversionProgress((prev) => ({ ...prev, [roomId]: 100 }));
      }
    },
    [rooms]
  );

  // Batch convert all scenes in background
  const handleConvertAll = useCallback(async () => {
    setIsConvertingAll(true);

    for (const room of rooms) {
      setConversionProgress((prev) => ({ ...prev, [room.id]: 30 }));
      try {
        const panoUrl = await generateAI360Panorama(room.photoUrl, room.id, '4k');
        setConversionProgress((prev) => ({ ...prev, [room.id]: 100 }));
        setRooms((prev) =>
          prev.map((r) => (r.id === room.id ? { ...r, panoUrl } : r))
        );
      } catch (err) {
        console.error(`Failed to convert ${room.id}:`, err);
        setConversionProgress((prev) => ({ ...prev, [room.id]: 100 }));
      }
    }

    setIsConvertingAll(false);
  }, [rooms]);

  const handleApplyCustomTexture = useCallback((url: string, title: string) => {
    const customRoom: Room = {
      id: `custom-${Date.now()}`,
      title: title || 'Custom 360 View',
      subtitle: '360° Panoramic Scene',
      floor: '37th Floor Suite',
      area: '27 sq.m',
      defaultYaw: 0,
      defaultPitch: 0,
      generatorType: 'bedroom',
      photoUrl: url,
      panoUrl: url,
      miniMapCoords: { x: 50, y: 50 },
      description: 'Imported 360° virtual tour panorama.',
      features: ['360 Panorama', '4K Resolution'],
      hotspots: [],
    };

    setRooms((prev) => [customRoom, ...prev]);
    setCurrentRoomId(customRoom.id);
  }, []);

  const handleCameraChange = useCallback((yaw: number, pitch: number, fov: number) => {
    setCameraYaw(yaw);
    setCameraPitch(pitch);
    setCameraFov(fov);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Virtual Tour Viewer */}
      <VirtualTourViewer
        room={currentRoom}
        onNavigateRoom={handleNavigateRoom}
        onSelectInfoHotspot={(hotspot) => setSelectedInfoHotspot(hotspot)}
        isAutoRotate={isAutoRotate}
        onAutoRotateChange={setIsAutoRotate}
        onCameraChange={handleCameraChange}
        isVRMode={isVRMode}
      />

      {/* Floating HUD Controls */}
      <TourHud
        property={PROPERTY_DETAILS}
        currentRoom={currentRoom}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        isVRMode={isVRMode}
        onToggleVR={() => setIsVRMode(!isVRMode)}
        onOpenPropertyModal={() => setIsPropertyModalOpen(true)}
        onOpenCustomPhotoModal={() => setIsCustomPhotoModalOpen(true)}
        onToggleMiniMap={() => setIsMiniMapOpen(!isMiniMapOpen)}
        onOpenAIPlannerModal={() => setIsAIPlannerOpen(true)}
        isConvertingAI={isConvertingAll}
      />

      {/* Interactive Floor Plan Mini-Map */}
      <MiniMap
        rooms={rooms}
        currentRoomId={currentRoomId}
        cameraYaw={cameraYaw}
        cameraFov={cameraFov}
        onSelectRoom={handleNavigateRoom}
        isOpen={isMiniMapOpen}
        onToggle={() => setIsMiniMapOpen(!isMiniMapOpen)}
      />

      {/* Bottom Room Selector Carousel with Real Photo Previews */}
      <RoomSelector
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelectRoom={handleNavigateRoom}
      />

      {/* VirtualTourEasy "Generate Full Tour: Plan several AI scenes at once" Studio */}
      <AITourPlannerModal
        isOpen={isAIPlannerOpen}
        onClose={() => setIsAIPlannerOpen(false)}
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelectRoom={handleNavigateRoom}
        onRegenerateScene={handleRegenerateScene}
        isConvertingAll={isConvertingAll}
        onConvertAll={handleConvertAll}
        conversionProgress={conversionProgress}
      />

      {/* Property Details Slide-Over Sheet */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={PROPERTY_DETAILS}
        rooms={rooms}
        onSelectRoom={handleNavigateRoom}
      />

      {/* Interactive Feature Info Hotspot Popover */}
      <HotspotModal
        hotspot={selectedInfoHotspot}
        onClose={() => setSelectedInfoHotspot(null)}
      />

      {/* Custom 360 Image Loader & VirtualTourEasy Importer Modal */}
      <CustomPanoramaModal
        isOpen={isCustomPhotoModalOpen}
        onClose={() => setIsCustomPhotoModalOpen(false)}
        onApplyCustomTexture={handleApplyCustomTexture}
        onImportVTETour={(vteRooms) => {
          setRooms(vteRooms);
          if (vteRooms[0]) {
            setCurrentRoomId(vteRooms[0].id);
          }
        }}
      />
    </main>
  );
}
