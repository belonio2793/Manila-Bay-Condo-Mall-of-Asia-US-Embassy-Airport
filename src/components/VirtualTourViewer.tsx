import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Room, Hotspot } from '../types/tour';
import { generateAI360Panorama } from '../utils/aiPanoGenerator';
import {
  Compass,
  ChevronRight,
  Info,
  DoorOpen,
  Sun,
  Eye,
  Bed,
  Tv,
  Coffee,
  Bath,
  Waves,
  Camera,
} from 'lucide-react';

interface ProjectedHotspot {
  hotspot: Hotspot;
  screenX: number;
  screenY: number;
  visible: boolean;
  opacity: number;
  scale: number;
}

interface VirtualTourViewerProps {
  room: Room;
  onNavigateRoom: (roomId: string) => void;
  onSelectInfoHotspot: (hotspot: Hotspot) => void;
  isAutoRotate: boolean;
  onAutoRotateChange: (active: boolean) => void;
  onCameraChange?: (yaw: number, pitch: number, fov: number) => void;
  isVRMode: boolean;
}

export const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  room,
  onNavigateRoom,
  onSelectInfoHotspot,
  isAutoRotate,
  onAutoRotateChange,
  onCameraChange,
  isVRMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentMeshRef = useRef<THREE.Mesh | null>(null);
  const fadeMeshRef = useRef<THREE.Mesh | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);

  // Camera angles (yaw: horizontal 0-360, pitch: vertical -85 to 85)
  const yawRef = useRef<number>(room.defaultYaw);
  const pitchRef = useRef<number>(room.defaultPitch);
  const targetYawRef = useRef<number>(room.defaultYaw);
  const targetPitchRef = useRef<number>(room.defaultPitch);
  const fovRef = useRef<number>(68);
  const targetFovRef = useRef<number>(68);

  // Interaction tracking
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const isTransitioningRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);

  // Hotspots projected to screen
  const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot[]>([]);
  const [headingDegrees, setHeadingDegrees] = useState<number>(0);
  const [isLoadingTexture, setIsLoadingTexture] = useState<boolean>(true);
  const [screenshotFlash, setScreenshotFlash] = useState<boolean>(false);

  // Texture cache for Three.js Texture objects
  const loadedThreeTextures = useRef<Map<string, THREE.Texture>>(new Map());

  // -------------------------------------------------------------
  // Initialize Three.js Scene
  // -------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1100);
    cameraRef.current = camera;
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true, // For snapshot capture
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();
    textureLoaderRef.current = textureLoader;

    // Inverted sphere for equirectangular 360 panorama
    const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
    sphereGeometry.scale(-1, 1, 1);

    // Primary mesh
    const currentMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1,
    });
    const currentMesh = new THREE.Mesh(sphereGeometry, currentMaterial);
    scene.add(currentMesh);
    currentMeshRef.current = currentMesh;

    // Transition/Fade mesh
    const fadeMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0,
    });
    const fadeMesh = new THREE.Mesh(sphereGeometry.clone(), fadeMaterial);
    scene.add(fadeMesh);
    fadeMeshRef.current = fadeMesh;

    // Load initial room
    loadRoomTexture(room, false);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      sphereGeometry.dispose();
      currentMaterial.dispose();
      fadeMaterial.dispose();
    };
  }, []);

  // -------------------------------------------------------------
  // Load Texture Function with Crossfade using ACTUAL photos
  // -------------------------------------------------------------
  const loadRoomTexture = useCallback(
    async (targetRoom: Room, animated: boolean = true) => {
      setIsLoadingTexture(true);

      // Generate mathematical equirectangular 360° projection from single actual photo
      let textureSrc: string = targetRoom.panoUrl || '';
      if (!textureSrc) {
        try {
          textureSrc = await generateAI360Panorama(targetRoom.photoUrl, targetRoom.id);
        } catch (e) {
          textureSrc = targetRoom.photoUrl;
        }
      }

      if (!textureLoaderRef.current) return;

      const applyTexture = (texture: THREE.Texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;

        if (animated && currentMeshRef.current && fadeMeshRef.current) {
          isTransitioningRef.current = true;
          const fadeMaterial = fadeMeshRef.current.material as THREE.MeshBasicMaterial;
          fadeMaterial.map = texture;
          fadeMaterial.needsUpdate = true;
          fadeMaterial.opacity = 0;

          // Warp camera FOV during jump (Matterport / VirtualTourEasy style)
          targetFovRef.current = Math.max(50, fovRef.current - 12);

          let startTime: number | null = null;
          const duration = 600; // ms

          const stepFade = (time: number) => {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

            fadeMaterial.opacity = ease;

            if (progress < 1) {
              requestAnimationFrame(stepFade);
            } else {
              // Complete crossfade
              const currentMat = currentMeshRef.current!.material as THREE.MeshBasicMaterial;
              currentMat.map = texture;
              currentMat.needsUpdate = true;
              fadeMaterial.opacity = 0;
              isTransitioningRef.current = false;
              targetFovRef.current = 68;
              setIsLoadingTexture(false);
            }
          };

          requestAnimationFrame(stepFade);
        } else if (currentMeshRef.current) {
          const currentMat = currentMeshRef.current.material as THREE.MeshBasicMaterial;
          currentMat.map = texture;
          currentMat.needsUpdate = true;
          setIsLoadingTexture(false);
        }
      };

      if (loadedThreeTextures.current.has(textureSrc)) {
        applyTexture(loadedThreeTextures.current.get(textureSrc)!);
      } else {
        textureLoaderRef.current.load(
          textureSrc,
          (loadedTex) => {
            loadedThreeTextures.current.set(textureSrc, loadedTex);
            applyTexture(loadedTex);
          },
          undefined,
          (err) => {
            console.error('Texture load error:', err);
            setIsLoadingTexture(false);
          }
        );
      }
    },
    []
  );

  // Trigger texture load when room prop changes
  useEffect(() => {
    targetYawRef.current = room.defaultYaw;
    targetPitchRef.current = room.defaultPitch;
    loadRoomTexture(room, true);
  }, [room.id, loadRoomTexture]);

  // -------------------------------------------------------------
  // Animation & Projection Loop
  // -------------------------------------------------------------
  useEffect(() => {
    const animate = () => {
      // Auto-rotation handling
      const now = Date.now();
      const timeSinceUser = now - lastInteractionTimeRef.current;

      if (isAutoRotate && !isDraggingRef.current && !isTransitioningRef.current && timeSinceUser > 3000) {
        targetYawRef.current = (targetYawRef.current + 0.08) % 360;
      }

      // Smooth camera damping / lerp
      yawRef.current += (targetYawRef.current - yawRef.current) * 0.12;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * 0.12;
      pitchRef.current = Math.max(-85, Math.min(85, pitchRef.current));

      fovRef.current += (targetFovRef.current - fovRef.current) * 0.14;

      if (cameraRef.current) {
        cameraRef.current.fov = fovRef.current;
        cameraRef.current.updateProjectionMatrix();

        // Convert spherical coords to camera lookAt vector
        const phi = THREE.MathUtils.degToRad(90 - pitchRef.current);
        const theta = THREE.MathUtils.degToRad(yawRef.current);

        const target = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        );
        cameraRef.current.lookAt(target);

        // Calculate heading degrees for compass (0 to 360)
        let normalizedYaw = yawRef.current % 360;
        if (normalizedYaw < 0) normalizedYaw += 360;
        setHeadingDegrees(Math.round(normalizedYaw));

        if (onCameraChange) {
          onCameraChange(normalizedYaw, pitchRef.current, fovRef.current);
        }

        // Project hotspots to 2D screen coordinates
        if (containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          const projected: ProjectedHotspot[] = [];

          for (const hotspot of room.hotspots) {
            // Spherical to 3D point
            const hPhi = THREE.MathUtils.degToRad(90 - hotspot.pitch);
            const hTheta = THREE.MathUtils.degToRad(hotspot.yaw);
            const radius = 450;

            const pos3D = new THREE.Vector3(
              radius * Math.sin(hPhi) * Math.cos(hTheta),
              radius * Math.cos(hPhi),
              radius * Math.sin(hPhi) * Math.sin(hTheta)
            );

            // Project to NDC
            const projectedVec = pos3D.clone().project(cameraRef.current);

            // Check if behind camera
            const isBehind = projectedVec.z > 1;
            const screenX = ((projectedVec.x + 1) / 2) * width;
            const screenY = ((-projectedVec.y + 1) / 2) * height;

            // Fade out when near screen boundaries
            const distFromCenter = Math.sqrt(
              projectedVec.x * projectedVec.x + projectedVec.y * projectedVec.y
            );
            const opacity = isBehind ? 0 : Math.max(0, 1 - distFromCenter * 0.4);

            projected.push({
              hotspot,
              screenX,
              screenY,
              visible: !isBehind && opacity > 0.05,
              opacity,
              scale: Math.max(0.75, 1 - distFromCenter * 0.2),
            });
          }

          setProjectedHotspots(projected);
        }
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (isVRMode && containerRef.current) {
          // Stereoscopic VR split-screen rendering
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;

          rendererRef.current.setScissorTest(true);

          // Left Eye
          rendererRef.current.setScissor(0, 0, w / 2, h);
          rendererRef.current.setViewport(0, 0, w / 2, h);
          cameraRef.current.aspect = w / 2 / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.render(sceneRef.current, cameraRef.current);

          // Right Eye
          rendererRef.current.setScissor(w / 2, 0, w / 2, h);
          rendererRef.current.setViewport(w / 2, 0, w / 2, h);
          rendererRef.current.render(sceneRef.current, cameraRef.current);

          rendererRef.current.setScissorTest(false);
        } else {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [room, isAutoRotate, isVRMode, onCameraChange]);

  // -------------------------------------------------------------
  // Mouse & Touch Controls
  // -------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    lastInteractionTimeRef.current = Date.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    lastInteractionTimeRef.current = Date.now();

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    const factor = (fovRef.current / 75) * 0.16;
    targetYawRef.current -= deltaX * factor;
    targetPitchRef.current += deltaY * factor;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    lastInteractionTimeRef.current = Date.now();
    const zoomDelta = e.deltaY * 0.05;
    targetFovRef.current = Math.max(40, Math.min(84, targetFovRef.current + zoomDelta));
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    lastInteractionTimeRef.current = Date.now();
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      touchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    lastInteractionTimeRef.current = Date.now();
    if (e.touches.length === 1 && isDraggingRef.current) {
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      const factor = (fovRef.current / 75) * 0.22;
      targetYawRef.current -= deltaX * factor;
      targetPitchRef.current += deltaY * factor;

      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = touchDistanceRef.current - dist;

      targetFovRef.current = Math.max(35, Math.min(95, targetFovRef.current + delta * 0.15));
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      lastInteractionTimeRef.current = Date.now();
      const step = 8;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          targetYawRef.current += step;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          targetYawRef.current -= step;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          targetPitchRef.current += step;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          targetPitchRef.current -= step;
          break;
        case '+':
        case '=':
          targetFovRef.current = Math.max(35, targetFovRef.current - 5);
          break;
        case '-':
        case '_':
          targetFovRef.current = Math.min(95, targetFovRef.current + 5);
          break;
        case ' ':
          onAutoRotateChange(!isAutoRotate);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoRotate, onAutoRotateChange]);

  // Hotspot Click Handling
  const handleHotspotClick = (hotspot: Hotspot) => {
    lastInteractionTimeRef.current = Date.now();

    targetYawRef.current = hotspot.yaw;
    targetPitchRef.current = hotspot.pitch;

    if (hotspot.type === 'navigation' && hotspot.targetRoomId) {
      setTimeout(() => {
        onNavigateRoom(hotspot.targetRoomId!);
      }, 250);
    } else if (hotspot.type === 'info') {
      onSelectInfoHotspot(hotspot);
    }
  };

  // Screenshot Capture
  const handleTakeSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    setScreenshotFlash(true);
    setTimeout(() => setScreenshotFlash(false), 200);

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `manila-bay-condo-${room.id}-3d.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const renderHotspotIcon = (hotspot: Hotspot) => {
    if (hotspot.type === 'navigation') {
      return <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />;
    }
    switch (hotspot.icon) {
      case 'bed':
        return <Bed className="w-3.5 h-3.5 text-amber-300" />;
      case 'tv':
        return <Tv className="w-3.5 h-3.5 text-rose-300" />;
      case 'sun':
        return <Sun className="w-3.5 h-3.5 text-amber-300" />;
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5 text-amber-200" />;
      case 'bath':
        return <Bath className="w-3.5 h-3.5 text-cyan-300" />;
      case 'pool':
        return <Waves className="w-3.5 h-3.5 text-blue-300" />;
      default:
        return <Info className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  const getCardinalDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden bg-slate-950"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Screenshot Flash Effect */}
      {screenshotFlash && (
        <div className="absolute inset-0 bg-white pointer-events-none z-40 animate-out fade-out duration-200" />
      )}

      {/* Loading Overlay */}
      {isLoadingTexture && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none transition-opacity duration-300">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/80 border border-white/10 rounded-full shadow-2xl">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-200">
              Loading 3D Experience ({room.title})...
            </span>
          </div>
        </div>
      )}

      {/* Projected Interactive Hotspots Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {projectedHotspots.map(({ hotspot, screenX, screenY, visible, opacity, scale }) => {
          if (!visible) return null;

          const isNav = hotspot.type === 'navigation';

          return (
            <div
              key={hotspot.id}
              style={{
                transform: `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${scale})`,
                opacity,
              }}
              className="absolute pointer-events-auto transition-opacity duration-150 group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHotspotClick(hotspot);
                }}
                className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isNav
                    ? 'w-11 h-11 bg-amber-500/90 hover:bg-amber-400 text-slate-950 border-2 border-white/80'
                    : 'w-9 h-9 bg-slate-950/85 hover:bg-slate-900 text-amber-400 border border-white/20'
                }`}
                title={hotspot.title}
                aria-label={hotspot.title}
              >
                {/* Pulsing Radar Ring on Navigation Hotspots */}
                {isNav && (
                  <span className="absolute inset-0 rounded-full border-2 border-amber-400/80 animate-pulse-ring pointer-events-none" />
                )}

                {/* Inner Icon */}
                {renderHotspotIcon(hotspot)}

                {/* Badge Label */}
                {hotspot.badge && (
                  <span className="absolute -top-3 px-1.5 py-0.5 bg-cyan-500 text-[9px] font-bold uppercase tracking-wider text-slate-950 rounded-full shadow-md whitespace-nowrap">
                    {hotspot.badge}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-13 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl text-white whitespace-nowrap">
                  <span className="text-xs font-semibold">{hotspot.title}</span>
                  {isNav && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compass Rose Indicator & Screenshot Button (Top Left) */}
      <div className="absolute top-16 left-4 z-20 flex items-center gap-2">
        <div className="pointer-events-none flex items-center gap-2 px-2.5 py-1 bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-full text-slate-300 text-[11px] font-mono shadow-md">
          <Compass
            className="w-3.5 h-3.5 text-amber-400 transition-transform duration-100"
            style={{ transform: `rotate(${-headingDegrees}deg)` }}
          />
          <span>
            {headingDegrees}° {getCardinalDirection(headingDegrees)}
          </span>
        </div>

        {/* Snapshot Capture Button */}
        <button
          onClick={handleTakeSnapshot}
          className="p-1.5 bg-slate-950/75 hover:bg-slate-900 backdrop-blur-md border border-white/10 rounded-full text-slate-400 hover:text-white transition-all shadow-md active:scale-95"
          title="Capture HD photo from 3D view"
          aria-label="Capture 3D Snapshot"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
