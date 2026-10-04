/**
 * Procedural Equirectangular 360-degree Panorama Generator
 * Renders high-fidelity architectural room textures mapped onto a sphere.
 */

const textureCache = new Map<string, string>();

export function generatePanoramaTexture(type: 'bedroom' | 'balcony' | 'kitchenette' | 'bathroom' | 'pool'): string {
  if (textureCache.has(type)) {
    return textureCache.get(type)!;
  }

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  switch (type) {
    case 'bedroom':
      renderStudioBedroom(ctx, width, height);
      break;
    case 'balcony':
      renderBalconySunset(ctx, width, height);
      break;
    case 'kitchenette':
      renderKitchenette(ctx, width, height);
      break;
    case 'bathroom':
      renderBathroom(ctx, width, height);
      break;
    case 'pool':
      renderPoolDeck(ctx, width, height);
      break;
    default:
      renderStudioBedroom(ctx, width, height);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  textureCache.set(type, dataUrl);
  return dataUrl;
}

// -------------------------------------------------------------
// Helper Drawing Functions
// -------------------------------------------------------------

function fillEquirectangularSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  zenithColor: string,
  horizonColor: string,
  floorColor: string
) {
  // Ceiling / Sky (0 to h/2)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
  skyGrad.addColorStop(0, zenithColor);
  skyGrad.addColorStop(0.7, horizonColor);
  skyGrad.addColorStop(1, horizonColor);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.52);

  // Floor (h/2 to h)
  const floorGrad = ctx.createLinearGradient(0, h * 0.48, 0, h);
  floorGrad.addColorStop(0, horizonColor);
  floorGrad.addColorStop(0.3, floorColor);
  floorGrad.addColorStop(1, '#0f1013');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, h * 0.48, w, h * 0.52);
}

// -------------------------------------------------------------
// 1. STUDIO SUITE & LIVING SPACE
// -------------------------------------------------------------
function renderStudioBedroom(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base room ambient lighting: Warm contemporary boutique hotel condo
  fillEquirectangularSky(ctx, w, h, '#1e1c1b', '#2e2824', '#151312');

  const horizon = h * 0.5;

  // Ceiling with recessed LED cove lighting & architectural beams
  const ceilingGrad = ctx.createLinearGradient(0, 0, 0, h * 0.38);
  ceilingGrad.addColorStop(0, '#171514');
  ceilingGrad.addColorStop(0.8, '#26221f');
  ceilingGrad.addColorStop(1, '#3b322a');
  ctx.fillStyle = ceilingGrad;
  ctx.fillRect(0, 0, w, h * 0.38);

  // Ceiling LED downlights spots (equirectangular wrap)
  for (let i = 0; i < 8; i++) {
    const lx = (i / 8) * w + w * 0.05;
    const ly = h * 0.22;
    const radial = ctx.createRadialGradient(lx, ly, 2, lx, ly, 110);
    radial.addColorStop(0, 'rgba(255, 240, 210, 0.95)');
    radial.addColorStop(0.2, 'rgba(255, 215, 160, 0.45)');
    radial.addColorStop(1, 'rgba(255, 200, 140, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(lx - 120, ly - 120, 240, 240);
  }

  // Floor: Polished neutral porcelain tiles with soft reflection
  const floorGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  floorGrad.addColorStop(0, '#36312a');
  floorGrad.addColorStop(0.4, '#24201c');
  floorGrad.addColorStop(1, '#110f0e');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  // Tile grout perspective lines
  ctx.strokeStyle = 'rgba(255, 230, 200, 0.08)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < w; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, horizon);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = horizon + 40; y < h; y += 70) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Walls & Baseboard
  const wallGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.62);
  wallGrad.addColorStop(0, '#322d28');
  wallGrad.addColorStop(0.5, '#423a33');
  wallGrad.addColorStop(1, '#2c2621');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, h * 0.35, w, h * 0.28);

  // -------------------------------------------------------------
  // ZONE A: North / Front (Yaw 0 - 60): Direct View to Balcony Glass Doors
  // -------------------------------------------------------------
  const balconyX = w * 0.88;
  const balconyW = w * 0.26; // wraps nicely around 0
  // Balcony glass opening showing glowing Manila sunset sky & bay
  const skyOutside = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.6);
  skyOutside.addColorStop(0, '#f97316'); // vibrant sunset orange
  skyOutside.addColorStop(0.3, '#fb923c');
  skyOutside.addColorStop(0.6, '#fde047'); // golden yellow horizon
  skyOutside.addColorStop(0.8, '#38bdf8'); // sea blue
  skyOutside.addColorStop(1, '#0284c7');

  // Draw sliding glass doors
  ctx.fillStyle = skyOutside;
  ctx.fillRect(w * 0.88, h * 0.28, w * 0.12, h * 0.34);
  ctx.fillRect(0, h * 0.28, w * 0.14, h * 0.34);

  // Distant Manila Bay ships and Pasay skyline silhouettes outside window
  ctx.fillStyle = '#1e293b';
  for (let i = 0; i < 7; i++) {
    const bHeight = 15 + Math.random() * 35;
    ctx.fillRect(w * 0.89 + i * 28, h * 0.52 - bHeight, 22, bHeight);
  }
  for (let i = 0; i < 8; i++) {
    const bHeight = 12 + Math.random() * 40;
    ctx.fillRect(i * 28 + 10, h * 0.52 - bHeight, 20, bHeight);
  }

  // Balcony glass door dark frames
  ctx.fillStyle = '#181716';
  ctx.fillRect(w * 0.88 - 6, h * 0.27, 10, h * 0.36);
  ctx.fillRect(w * 0.94 - 4, h * 0.27, 8, h * 0.36);
  ctx.fillRect(w * 0.07 - 4, h * 0.27, 8, h * 0.36);
  ctx.fillRect(w * 0.14 - 6, h * 0.27, 10, h * 0.36);

  // Sheer white window drapes (translucent folds)
  const drapeGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  drapeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  drapeGrad.addColorStop(1, 'rgba(255, 245, 230, 0.2)');
  ctx.fillStyle = drapeGrad;
  ctx.fillRect(w * 0.86, h * 0.26, 40, h * 0.38);
  ctx.fillRect(w * 0.13, h * 0.26, 40, h * 0.38);

  // -------------------------------------------------------------
  // ZONE B: East (Yaw 40 - 110): Plush Double Bed & Floating Headboard
  // -------------------------------------------------------------
  const bedX = w * 0.18;
  const bedY = h * 0.45;
  const bedW = w * 0.19;
  const bedH = h * 0.28;

  // Headboard - warm upholstered dark charcoal / walnut wood accent
  ctx.fillStyle = '#231e1a';
  ctx.fillRect(bedX - 15, bedY - 50, bedW + 30, bedH + 10);
  ctx.fillStyle = '#3a322b';
  ctx.fillRect(bedX - 10, bedY - 45, bedW + 20, 65);

  // Bedside warm sconce lamps
  for (const lx of [bedX - 6, bedX + bedW + 6]) {
    const ly = bedY - 20;
    const lampGlow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 75);
    lampGlow.addColorStop(0, 'rgba(255, 235, 190, 0.95)');
    lampGlow.addColorStop(0.3, 'rgba(255, 200, 130, 0.4)');
    lampGlow.addColorStop(1, 'rgba(255, 180, 100, 0)');
    ctx.fillStyle = lampGlow;
    ctx.fillRect(lx - 80, ly - 80, 160, 160);

    // Lamp fixture
    ctx.fillStyle = '#d4af37'; // brushed brass
    ctx.fillRect(lx - 3, ly - 10, 6, 20);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(lx - 8, ly - 22, 16, 14);
  }

  // Bed Mattress & Crisp White Duvet
  const duvetGrad = ctx.createLinearGradient(bedX, bedY, bedX, bedY + bedH);
  duvetGrad.addColorStop(0, '#f8fafc');
  duvetGrad.addColorStop(0.3, '#f1f5f9');
  duvetGrad.addColorStop(0.8, '#e2e8f0');
  duvetGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = duvetGrad;
  ctx.fillRect(bedX, bedY + 15, bedW, bedH);

  // Decorative Accent Pillow arrangement
  ctx.fillStyle = '#0f766e'; // teal luxury accent pillows
  ctx.fillRect(bedX + 20, bedY - 5, 55, 25);
  ctx.fillRect(bedX + bedW - 75, bedY - 5, 55, 25);
  ctx.fillStyle = '#ffffff'; // white pillows
  ctx.fillRect(bedX + 15, bedY + 10, 65, 28);
  ctx.fillRect(bedX + bedW - 80, bedY + 10, 65, 28);

  // Modern throw blanket folded at the foot of bed
  ctx.fillStyle = '#b45309'; // warm amber textured runner
  ctx.fillRect(bedX, bedY + bedH - 35, bedW, 28);

  // -------------------------------------------------------------
  // ZONE C: South (Yaw 130 - 230): Dining Table & Kitchenette Entryway
  // -------------------------------------------------------------
  const diningX = w * 0.42;
  const diningY = h * 0.52;

  // 4-Seater Wooden Dining Table
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(diningX, diningY, 140, 65);
  ctx.fillStyle = '#573f27'; // rich oak tabletop
  ctx.fillRect(diningX - 6, diningY - 4, 152, 16);

  // Table place settings & wine glasses
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(diningX + 15, diningY + 2, 24, 6);
  ctx.fillRect(diningX + 60, diningY + 2, 24, 6);
  ctx.fillRect(diningX + 105, diningY + 2, 24, 6);

  // 4 Chairs (Modern Scandinavian grey/wood)
  ctx.fillStyle = '#292524';
  ctx.fillRect(diningX + 10, diningY - 26, 32, 26);
  ctx.fillRect(diningX + 55, diningY - 26, 32, 26);
  ctx.fillRect(diningX + 100, diningY - 26, 32, 26);

  // Pendant Chandelier hanging above dining table
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(diningX + 70, h * 0.25);
  ctx.lineTo(diningX + 70, diningY - 50);
  ctx.stroke();

  const diningLight = ctx.createRadialGradient(
    diningX + 70,
    diningY - 50,
    2,
    diningX + 70,
    diningY - 50,
    85
  );
  diningLight.addColorStop(0, 'rgba(255, 245, 220, 0.95)');
  diningLight.addColorStop(0.3, 'rgba(255, 210, 150, 0.4)');
  diningLight.addColorStop(1, 'rgba(255, 200, 120, 0)');
  ctx.fillStyle = diningLight;
  ctx.fillRect(diningX - 30, diningY - 150, 200, 200);

  // Sofa Bed next to dining area
  const sofaX = w * 0.56;
  const sofaY = h * 0.54;
  ctx.fillStyle = '#374151'; // dark graphite fabric
  ctx.fillRect(sofaX, sofaY, 160, 60);
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(sofaX - 8, sofaY - 18, 176, 22);
  ctx.fillStyle = '#fbbf24'; // accent cushion
  ctx.fillRect(sofaX + 12, sofaY - 6, 24, 18);

  // -------------------------------------------------------------
  // ZONE D: West (Yaw 260 - 320): 40" Wall-Mounted Smart TV
  // -------------------------------------------------------------
  const tvX = w * 0.73;
  const tvY = h * 0.38;
  const tvW = 160;
  const tvH = 95;

  // TV Wall Accent Panel (vertical slatted acoustic wood slats)
  for (let s = tvX - 30; s < tvX + tvW + 30; s += 8) {
    ctx.fillStyle = '#261f1a';
    ctx.fillRect(s, tvY - 30, 4, tvH + 90);
  }

  // TV Bezel & Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(tvX + 5, tvY + 5, tvW, tvH);
  ctx.fillStyle = '#111827';
  ctx.fillRect(tvX, tvY, tvW, tvH);

  // TV Screen Display: "Netflix / RestEasy Manila Bay"
  const screenGrad = ctx.createLinearGradient(tvX, tvY, tvX + tvW, tvY + tvH);
  screenGrad.addColorStop(0, '#0f172a');
  screenGrad.addColorStop(0.5, '#1e1b4b');
  screenGrad.addColorStop(1, '#020617');
  ctx.fillStyle = screenGrad;
  ctx.fillRect(tvX + 4, tvY + 4, tvW - 8, tvH - 8);

  // Netflix Red Logo Icon & Interface on screen
  ctx.fillStyle = '#e50914';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('N', tvX + 14, tvY + 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = '9px sans-serif';
  ctx.fillText('RestEasy Suite • 37th Flr', tvX + 34, tvY + 26);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(tvX + 14, tvY + 38, 40, 35);
  ctx.fillRect(tvX + 60, tvY + 38, 40, 35);
  ctx.fillRect(tvX + 106, tvY + 38, 40, 35);

  // Floating media console under TV
  ctx.fillStyle = '#1e1b18';
  ctx.fillRect(tvX - 10, tvY + tvH + 20, tvW + 20, 16);
  ctx.fillStyle = '#3e342b';
  ctx.fillRect(tvX - 12, tvY + tvH + 16, tvW + 24, 6);

  // Split-Type Air Conditioner above TV
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(tvX + 25, tvY - 55, 110, 20);
  ctx.fillStyle = '#10b981'; // green power LED dot
  ctx.fillRect(tvX + 120, tvY - 43, 3, 3);
}

// -------------------------------------------------------------
// 2. 37TH FLOOR BALCONY - MANILA BAY SUNSET VISTA
// -------------------------------------------------------------
function renderBalconySunset(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const horizon = h * 0.52;

  // Ultra-Cinematic Sky Gradient (Zenith deep indigo -> sunset crimson -> blazing gold)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
  skyGrad.addColorStop(0, '#1e1b4b'); // deep twilight purple-indigo
  skyGrad.addColorStop(0.25, '#3b0764');
  skyGrad.addColorStop(0.45, '#831843');
  skyGrad.addColorStop(0.65, '#ea580c'); // brilliant burning orange
  skyGrad.addColorStop(0.85, '#f97316');
  skyGrad.addColorStop(0.95, '#fbbf24'); // golden rim
  skyGrad.addColorStop(1, '#fef08a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, horizon);

  // The Manila Bay Sun (Setting on the West horizon at Yaw 180 = center of canvas)
  const sunX = w * 0.5;
  const sunY = horizon - 22;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 320);
  sunGlow.addColorStop(0, '#ffffff');
  sunGlow.addColorStop(0.15, '#fef08a');
  sunGlow.addColorStop(0.45, 'rgba(249, 115, 22, 0.7)');
  sunGlow.addColorStop(0.8, 'rgba(234, 88, 12, 0.25)');
  sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(sunX - 350, sunY - 250, 700, 500);

  // Sun disc
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
  ctx.fill();

  // Distant horizon clouds in golden & purple wisps
  ctx.fillStyle = 'rgba(120, 20, 60, 0.35)';
  for (let c = 0; c < 12; c++) {
    const cx = (c / 12) * w;
    const cy = horizon - 60 - Math.sin(c) * 40;
    ctx.fillRect(cx, cy, 140, 16);
  }

  // -------------------------------------------------------------
  // Manila Bay Water Surface (horizon to h*0.75)
  // -------------------------------------------------------------
  const waterGrad = ctx.createLinearGradient(0, horizon, 0, h * 0.75);
  waterGrad.addColorStop(0, '#f97316');
  waterGrad.addColorStop(0.2, '#c2410c');
  waterGrad.addColorStop(0.5, '#7c2d12');
  waterGrad.addColorStop(0.8, '#1e293b');
  waterGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, horizon, w, h * 0.23);

  // Sun vertical glitter track across Manila Bay waters
  const sunTrack = ctx.createLinearGradient(sunX - 90, horizon, sunX + 90, horizon);
  sunTrack.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sunTrack.addColorStop(0.5, 'rgba(254, 240, 138, 0.85)');
  sunTrack.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sunTrack;
  ctx.fillRect(sunX - 90, horizon, 180, h * 0.22);

  // Water gentle wave ripples
  ctx.strokeStyle = 'rgba(254, 215, 170, 0.25)';
  ctx.lineWidth = 1;
  for (let y = horizon + 5; y < h * 0.74; y += 8) {
    ctx.beginPath();
    ctx.moveTo(sunX - 160, y);
    ctx.lineTo(sunX + 160, y);
    ctx.stroke();
  }

  // Yachts and cargo ships anchored in Manila Bay
  ctx.fillStyle = '#0f172a';
  for (let s = 0; s < 6; s++) {
    const sx = w * 0.42 + s * 45;
    const sy = horizon + 12 + (s % 3) * 8;
    ctx.fillRect(sx, sy, 14, 4);
    ctx.fillRect(sx + 5, sy - 5, 2, 5); // mast
  }

  // -------------------------------------------------------------
  // Roxas Boulevard & City Promenade (Pasay / MOA / CCP)
  // -------------------------------------------------------------
  const cityY = horizon - 5;
  // Pasay City skyline silhouette on left and right horizons
  ctx.fillStyle = '#111827';
  for (let b = 0; b < w * 0.35; b += 22) {
    const bH = 20 + Math.sin(b * 0.05) * 45 + Math.random() * 20;
    ctx.fillRect(b, cityY - bH, 18, bH + 10);
    // Glowing window lights in skyscrapers
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(b + 4, cityY - bH + 6, 2, 2);
    ctx.fillRect(b + 9, cityY - bH + 12, 2, 2);
    ctx.fillStyle = '#111827';
  }
  for (let b = w * 0.65; b < w; b += 22) {
    const bH = 25 + Math.cos(b * 0.04) * 50 + Math.random() * 20;
    ctx.fillRect(b, cityY - bH, 18, bH + 10);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(b + 5, cityY - bH + 8, 2, 2);
    ctx.fillRect(b + 11, cityY - bH + 15, 2, 2);
    ctx.fillStyle = '#111827';
  }

  // Iconic SM Mall of Asia Eye Ferris Wheel silhouette on South Pasay horizon
  const wheelX = w * 0.68;
  const wheelY = horizon - 35;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(wheelX, wheelY, 18, 0, Math.PI * 2);
  ctx.stroke();

  // Roxas Boulevard traffic lines far down below
  const blvdY = h * 0.72;
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, blvdY, w, 18);
  // Headlights & Taillights stream
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // red tail lights
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, blvdY + 4);
  ctx.lineTo(w * 0.8, blvdY + 4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)'; // amber headlights
  ctx.beginPath();
  ctx.moveTo(w * 0.2, blvdY + 12);
  ctx.lineTo(w * 0.8, blvdY + 12);
  ctx.stroke();

  // -------------------------------------------------------------
  // Balcony Architecture: Floor, Glass Balustrade, Bistro Furniture
  // -------------------------------------------------------------
  // Breeze Residences Tower Facade Behind Viewer (Yaw 320 to 40)
  const bldGrad = ctx.createLinearGradient(0, 0, 0, h);
  bldGrad.addColorStop(0, '#1c1917');
  bldGrad.addColorStop(0.5, '#292524');
  bldGrad.addColorStop(1, '#0c0a09');
  ctx.fillStyle = bldGrad;
  ctx.fillRect(0, 0, w * 0.18, h * 0.75);
  ctx.fillRect(w * 0.82, 0, w * 0.18, h * 0.75);

  // Sliding glass door frame leading back into the condo
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(w * 0.96, h * 0.3, 8, h * 0.45);
  ctx.fillRect(w * 0.03, h * 0.3, 8, h * 0.45);

  // Balcony Floor: Architectural weather-resistant grey composite decking
  const deckGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
  deckGrad.addColorStop(0, '#44403c');
  deckGrad.addColorStop(0.3, '#292524');
  deckGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = deckGrad;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  // Decking plank lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  for (let y = h * 0.76; y < h; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // High-rise Glass Balustrade / Railing (at h*0.68 to h*0.77)
  const glassRailing = ctx.createLinearGradient(0, h * 0.67, 0, h * 0.76);
  glassRailing.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  glassRailing.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
  glassRailing.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = glassRailing;
  ctx.fillRect(w * 0.16, h * 0.67, w * 0.68, h * 0.09);

  // Stainless Steel Handrail on top
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(w * 0.16, h * 0.665, w * 0.68, 6);
  // Glass support spigots
  ctx.fillStyle = '#cbd5e1';
  for (let sp = w * 0.2; sp < w * 0.8; sp += 70) {
    ctx.fillRect(sp, h * 0.74, 8, 16);
  }

  // Balcony Bistro Table & Espresso Chairs (Yaw 150)
  const bistroX = w * 0.38;
  const bistroY = h * 0.82;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bistroX, bistroY, 60, 4); // table disc
  ctx.fillRect(bistroX + 28, bistroY, 4, 45); // table leg
  ctx.fillRect(bistroX + 15, bistroY + 45, 30, 4); // base
  // Coffee cup with steam
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(bistroX + 24, bistroY - 12, 10, 10);

  // Bistro Chair
  ctx.fillStyle = '#334155';
  ctx.fillRect(bistroX - 35, bistroY - 10, 24, 4);
  ctx.fillRect(bistroX - 35, bistroY - 26, 4, 16);
  ctx.fillRect(bistroX - 35, bistroY - 6, 3, 50);
  ctx.fillRect(bistroX - 15, bistroY - 6, 3, 50);
}

// -------------------------------------------------------------
// 3. KITCHENETTE & DINING AREA
// -------------------------------------------------------------
function renderKitchenette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  fillEquirectangularSky(ctx, w, h, '#1c1917', '#292524', '#171514');

  const horizon = h * 0.5;

  // Ceiling with LED recessed spotlights
  ctx.fillStyle = '#26221f';
  ctx.fillRect(0, 0, w, h * 0.35);

  // Floor: Porcelain tiles with granite sheen
  const floorGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
  floorGrad.addColorStop(0, '#3f3832');
  floorGrad.addColorStop(0.4, '#26221e');
  floorGrad.addColorStop(1, '#141210');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  // Kitchen Backsplash & Wall (Yaw 140 to 240)
  const kitchX = w * 0.4;
  const kitchW = w * 0.32;
  const kitchY = h * 0.36;

  // Subway tile backsplash with under-cabinet warm LED lighting
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(kitchX, kitchY + 40, kitchW, 110);
  // Under-cabinet warm light glow
  const ledGlow = ctx.createLinearGradient(0, kitchY + 38, 0, kitchY + 110);
  ledGlow.addColorStop(0, 'rgba(254, 243, 199, 0.85)');
  ledGlow.addColorStop(0.3, 'rgba(254, 215, 170, 0.35)');
  ledGlow.addColorStop(1, 'rgba(254, 215, 170, 0)');
  ctx.fillStyle = ledGlow;
  ctx.fillRect(kitchX, kitchY + 40, kitchW, 90);

  // Upper Kitchen Cabinets (Modern Flat Panel Charcoal)
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(kitchX, kitchY - 30, kitchW, 70);
  ctx.fillStyle = '#292524';
  for (let c = 0; c < 4; c++) {
    ctx.strokeRect(kitchX + c * (kitchW / 4), kitchY - 28, kitchW / 4 - 4, 66);
  }

  // Solid Polished Granite Countertop
  ctx.fillStyle = '#0f172a'; // black pearl granite
  ctx.fillRect(kitchX - 10, kitchY + 148, kitchW + 20, 22);
  ctx.fillStyle = '#334155';
  ctx.fillRect(kitchX - 10, kitchY + 148, kitchW + 20, 3); // polished bevel

  // Lower Cabinets
  ctx.fillStyle = '#262626';
  ctx.fillRect(kitchX, kitchY + 170, kitchW, 110);

  // Microwave Oven on countertop
  const microX = kitchX + 30;
  const microY = kitchY + 95;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(microX, microY, 80, 52);
  ctx.fillStyle = '#0284c7'; // digital timer display
  ctx.font = 'bold 8px monospace';
  ctx.fillText('12:00', microX + 54, microY + 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(microX + 6, microY + 8, 42, 38);

  // Electric Kettle & Drip Coffee Maker
  ctx.fillStyle = '#d1d5db';
  ctx.fillRect(microX + 105, microY + 10, 24, 38); // stainless kettle
  ctx.fillStyle = '#374151';
  ctx.fillRect(microX + 138, microY + 8, 26, 40); // coffee brewer

  // Compact Refrigerator with freezer compartment
  const fridgeX = kitchX + kitchW - 75;
  const fridgeY = kitchY + 25;
  ctx.fillStyle = '#94a3b8'; // stainless steel finish
  ctx.fillRect(fridgeX, fridgeY, 70, 220);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(fridgeX, fridgeY + 70, 70, 4); // separation line
  // Chrome handles
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(fridgeX + 6, fridgeY + 20, 3, 35);
  ctx.fillRect(fridgeX + 6, fridgeY + 80, 3, 50);

  // Front Entryway Door with digital smart keypad (Yaw 270)
  const doorX = w * 0.8;
  const doorY = h * 0.32;
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(doorX, doorY, 110, 240);
  ctx.fillStyle = '#451a03'; // warm mahogany door
  ctx.fillRect(doorX + 5, doorY + 5, 100, 230);
  // Electronic Keypad Lock
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(doorX + 15, doorY + 110, 14, 34);
  ctx.fillStyle = '#38bdf8'; // keypad glow
  ctx.fillRect(doorX + 19, doorY + 115, 6, 6);

  // Foreground Dining Table Setup (Yaw 40)
  const tX = w * 0.12;
  const tY = h * 0.54;
  ctx.fillStyle = '#451a03';
  ctx.fillRect(tX, tY, 140, 16);
  ctx.fillStyle = '#292524';
  ctx.fillRect(tX + 10, tY + 16, 8, 80);
  ctx.fillRect(tX + 120, tY + 16, 8, 80);
}

// -------------------------------------------------------------
// 4. EN-SUITE MODERN BATHROOM
// -------------------------------------------------------------
function renderBathroom(ctx: CanvasRenderingContext2D, w: number, h: number) {
  fillEquirectangularSky(ctx, w, h, '#18181b', '#27272a', '#09090b');

  const horizon = h * 0.5;

  // Warm porcelain bathroom tiles
  ctx.fillStyle = '#27272a';
  ctx.fillRect(0, 0, w, h);

  // Large-format wall tile grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 110) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 90) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // -------------------------------------------------------------
  // Glass Walk-in Shower Enclosure (Yaw 150 to 220)
  // -------------------------------------------------------------
  const showerX = w * 0.42;
  const showerW = w * 0.22;
  const showerY = h * 0.28;
  const showerH = h * 0.48;

  // Glass partition with subtle turquoise reflection
  const glassGrad = ctx.createLinearGradient(showerX, 0, showerX + showerW, 0);
  glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
  glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
  glassGrad.addColorStop(1, 'rgba(56, 189, 248, 0.3)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(showerX, showerY, showerW, showerH);

  // Stainless Steel Overhead Rainfall Shower Head & Riser
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(showerX + showerW * 0.5 - 2, showerY + 15, 4, 75); // pipe
  ctx.fillRect(showerX + showerW * 0.5 - 22, showerY + 15, 44, 8); // round shower plate
  // Thermostatic mixer valve & handheld wand
  ctx.fillRect(showerX + showerW * 0.5 - 12, showerY + 95, 24, 16);
  ctx.fillRect(showerX + showerW * 0.5 + 20, showerY + 80, 5, 25);

  // Recessed Shampoo Wall Niche with warm amber downlight
  const nicheX = showerX + 20;
  const nicheY = showerY + 60;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(nicheX, nicheY, 45, 30);
  ctx.fillStyle = '#065f46'; // amber/green luxury shampoo bottles
  ctx.fillRect(nicheX + 8, nicheY + 8, 8, 18);
  ctx.fillRect(nicheX + 22, nicheY + 8, 8, 18);

  // -------------------------------------------------------------
  // Vanity Counter & LED Backlit Mirror (Yaw 60 to 110)
  // -------------------------------------------------------------
  const vanityX = w * 0.18;
  const vanityY = h * 0.32;
  const vanityW = 150;

  // LED Backlit Mirror Glow
  const mirrorGlow = ctx.createRadialGradient(
    vanityX + vanityW * 0.5,
    vanityY + 45,
    30,
    vanityX + vanityW * 0.5,
    vanityY + 45,
    110
  );
  mirrorGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  mirrorGlow.addColorStop(0.4, 'rgba(254, 243, 199, 0.5)');
  mirrorGlow.addColorStop(1, 'rgba(254, 243, 199, 0)');
  ctx.fillStyle = mirrorGlow;
  ctx.fillRect(vanityX - 30, vanityY - 30, vanityW + 60, 160);

  // Mirror glass
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(vanityX + 10, vanityY, vanityW - 20, 95);
  ctx.fillStyle = '#f8fafc';
  ctx.strokeRect(vanityX + 10, vanityY, vanityW - 20, 95);

  // Floating Vanity Cabinet & Vessel Sink
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(vanityX, vanityY + 115, vanityW, 55);
  // White ceramic vessel basin
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(vanityX + vanityW * 0.5, vanityY + 112, 38, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Chrome tall mixer faucet
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(vanityX + vanityW * 0.5 - 3, vanityY + 88, 6, 24);

  // Toilet with Bidet Spray (Yaw 270)
  const toiletX = w * 0.76;
  const toiletY = h * 0.52;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(toiletX, toiletY, 48, 55);
  ctx.fillRect(toiletX - 10, toiletY - 25, 30, 35); // tank
  // Chrome bidet sprayer nozzle & hose
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(toiletX - 12, toiletY + 10);
  ctx.lineTo(toiletX - 25, toiletY + 15);
  ctx.lineTo(toiletX - 22, toiletY - 5);
  ctx.stroke();

  // Folded plush towels on chrome rack
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(vanityX - 60, vanityY + 40, 36, 12);
  ctx.fillRect(vanityX - 60, vanityY + 54, 36, 12);
}

// -------------------------------------------------------------
// 5. 8TH FLOOR RESORT POOL DECK
// -------------------------------------------------------------
function renderPoolDeck(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const horizon = h * 0.48;

  // Sunny Afternoon Manila Sky (Bright sky blue to warm golden horizon)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
  skyGrad.addColorStop(0, '#0284c7');
  skyGrad.addColorStop(0.6, '#38bdf8');
  skyGrad.addColorStop(0.9, '#bae6fd');
  skyGrad.addColorStop(1, '#fed7aa');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, horizon);

  // High-rise Breeze Residences tower backdrop rising behind pool deck
  const bldgX = w * 0.72;
  ctx.fillStyle = '#f8fafc'; // modern white and glass residential tower
  ctx.fillRect(bldgX, 0, w * 0.28, horizon + 20);
  // Balcony pattern on tower
  ctx.fillStyle = '#0284c7';
  for (let fl = 10; fl < horizon - 10; fl += 14) {
    for (let c = bldgX + 15; c < bldgX + w * 0.26; c += 22) {
      ctx.fillRect(c, fl, 15, 8);
    }
  }

  // Distant Manila Bay and Roxas Blvd skyline view over the pool edge (Yaw 130 to 230)
  ctx.fillStyle = '#0f172a';
  for (let b = w * 0.35; b < w * 0.65; b += 25) {
    const bH = 15 + Math.random() * 35;
    ctx.fillRect(b, horizon - bH, 20, bH);
  }

  // -------------------------------------------------------------
  // Olympic Resort Swimming Pools (Horizon to h*0.75)
  // -------------------------------------------------------------
  const poolY = horizon + 20;
  const poolH = h * 0.28;

  // Azure crystal pool water with sunlight caustic ripples
  const waterGrad = ctx.createLinearGradient(0, poolY, 0, poolY + poolH);
  waterGrad.addColorStop(0, '#38bdf8');
  waterGrad.addColorStop(0.3, '#0284c7');
  waterGrad.addColorStop(0.7, '#0369a1');
  waterGrad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(w * 0.15, poolY, w * 0.68, poolH);

  // Pool Lap Lane lines
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  for (let l = 1; l <= 4; l++) {
    const lx = w * 0.15 + (l / 5) * (w * 0.68);
    ctx.beginPath();
    ctx.moveTo(lx, poolY);
    ctx.lineTo(lx, poolY + poolH);
    ctx.stroke();
  }

  // Water caustic light shimmer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 40; i++) {
    const rx = w * 0.18 + Math.random() * (w * 0.62);
    const ry = poolY + 10 + Math.random() * (poolH - 20);
    ctx.beginPath();
    ctx.ellipse(rx, ry, 12, 4, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pool perimeter coping stone
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(w * 0.14, poolY - 6, w * 0.7, 6);
  ctx.fillRect(w * 0.14, poolY + poolH, w * 0.7, 8);

  // -------------------------------------------------------------
  // Teak Wood Lounging Deck & Royal Palm Trees
  // -------------------------------------------------------------
  const deckGrad = ctx.createLinearGradient(0, poolY + poolH, 0, h);
  deckGrad.addColorStop(0, '#78350f');
  deckGrad.addColorStop(0.5, '#451a03');
  deckGrad.addColorStop(1, '#292524');
  ctx.fillStyle = deckGrad;
  ctx.fillRect(0, poolY + poolH, w, h - (poolY + poolH));

  // Sun Loungers & Resort Umbrellas
  for (let l = 0; l < 4; l++) {
    const lx = w * 0.22 + l * 120;
    const ly = poolY + poolH + 28;
    // Teak Lounger
    ctx.fillStyle = '#f8fafc'; // white cushion
    ctx.fillRect(lx, ly, 65, 14);
    ctx.fillStyle = '#b45309'; // wood frame
    ctx.fillRect(lx - 4, ly + 14, 73, 4);

    // Resort Parasol / Umbrella
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(lx + 32, ly - 45);
    ctx.lineTo(lx + 8, ly - 22);
    ctx.lineTo(lx + 56, ly - 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(lx + 31, ly - 22, 3, 36); // pole
  }

  // Tropical Royal Palm Trees in Planters
  for (let p = 0; p < 3; p++) {
    const px = w * 0.08 + p * 80;
    const py = horizon + 30;
    // Planter
    ctx.fillStyle = '#374151';
    ctx.fillRect(px - 14, py + 30, 28, 25);
    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px - 4, py - 40, 8, 70);
    // Green Palm Fronds
    ctx.fillStyle = '#15803d';
    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        px + Math.cos(angle) * 25,
        py - 40 + Math.sin(angle) * 12,
        28,
        7,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}
