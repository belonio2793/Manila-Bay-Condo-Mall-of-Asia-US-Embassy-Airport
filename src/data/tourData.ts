import { Room, PropertyDetails } from '../types/tour';

export const PROPERTY_DETAILS: PropertyDetails = {
  title: 'Manila Bay Condo',
  tagline: 'Mall of Asia · US Embassy · Airport Access',
  building: 'SMDC Breeze Residences',
  location: 'Roxas Boulevard, Pasay City, Metro Manila, Philippines',
  neighborhood: 'Manila Bay Cultural & Entertainment District',
  specs: {
    unitType: 'Executive Studio Suite',
    size: '27 sq.m (290 sq.ft)',
    floor: '37th Floor (Skyline & Bay Sunset)',
    capacity: '1 - 3 Guests (Double Bed + Sofa Bed)',
    view: 'Manila Bay, Roxas Blvd & Pasay Cityscape',
    wifi: 'High-Speed Fiber Internet (Complimentary)',
  },
  amenities: [
    {
      category: 'Living & Comfort',
      items: [
        'Double-size Bed with Checkered Duvet & Fresh Linens',
        'Convertible Sofa Bed with Knit Blankets & Pillows',
        'Wall-Mounted Split-Type Air Conditioning with Remote',
        '40-inch Flat Screen Smart TV with Remote',
        'Free Netflix & YouTube Streaming Access',
        'Concrete Textured Feature Wall & Wooden Slatted Room Divider',
        'Dedicated Study/Work Desk with Desk Lamp & Modern Chair',
      ],
    },
    {
      category: 'Kitchenette & Dining',
      items: [
        'Circular Dining Table with Decorative Runner & Stools',
        'Countertop Microwave Oven on Floating Timber Shelf',
        'Compact Refrigerator with Freezer Compartment',
        'Electric Kettle, Dish Rack & Kitchen Utensils',
        'Built-in Wood-Grain Cabinetry & Granite Countertops',
        'Dinnerware, Glassware & Cutlery Sets',
      ],
    },
    {
      category: 'Bathroom & Hygiene',
      items: [
        'En-Suite Glass Shower Enclosure',
        'Thermostatic Rainfall Shower System & Hand Wand',
        'Toilet with Hygiene Bidet Sprayer',
        'Large Backlit LED Illuminated Vanity Mirror',
        'Vessel Sink & Contemporary Chrome Mixer Tap',
        'Fresh White Bath Towels & Toiletries',
      ],
    },
    {
      category: 'Building & Amenities',
      items: [
        '8th Floor Resort Swimming Pools Overlooking Manila Bay',
        'Lounge Sun Terraces & Outdoor Cabanas',
        'Grand Luxury Reception Lobby with 24/7 Security & Concierge',
        'Ground Floor 24/7 Alfamart Convenience Store & BDO Bank',
        'High-Speed Passenger Elevators',
      ],
    },
  ],
  nearby: [
    { place: 'US Embassy Manila', time: '10 mins', distance: '3.2 km' },
    { place: 'Manila Ocean Park & Rizal Park', time: '12 mins', distance: '3.8 km' },
    { place: 'SM Mall of Asia (MOA)', time: '15 mins', distance: '4.5 km' },
    { place: 'Cultural Center of the Philippines (CCP)', time: '5 mins', distance: '1.2 km' },
    { place: 'Ninoy Aquino Int’l Airport (NAIA T1-T3)', time: '20 mins', distance: '7.8 km' },
    { place: 'Intramuros Historic Walled City', time: '15 mins', distance: '4.9 km' },
  ],
  sourceUrl: 'https://resteasy.ph/property/manila-bay-condo-mall-of-asia-us-embassy-airport',
};

export const TOUR_ROOMS: Room[] = [
  {
    id: 'studio-suite',
    title: 'Studio Suite',
    subtitle: '37th Floor Executive Suite · 360° Virtual Tour',
    floor: '37th Floor',
    area: '27 sq.m',
    photoUrl: '/photos/vte_manila_bay_360.jpg',
    panoUrl: '/photos/vte_manila_bay_360.jpg',
    defaultYaw: 0,
    defaultPitch: -2,
    generatorType: 'bedroom',
    miniMapCoords: { x: 50, y: 55 },
    description:
      'Ultra-high-definition 4K 360° virtual tour of the 27 sqm studio suite: industrial concrete feature wall, 40" smart TV, double bed with checkered duvet, slatted wood divider, sofa bed, and private balcony overlooking Manila Bay.',
    features: ['4K 360° View', 'Double Bed', '40" Smart TV', 'Concrete Wall', 'Balcony Door'],
    hotspots: [
      {
        id: 'info-bed',
        type: 'info',
        yaw: 18,
        pitch: -10,
        title: 'Master Double Bed',
        description:
          'Plush double bed with checkered duvet, accent tribal pillows, soft hotel-grade linens, fresh folded bath towels, and an integrated headboard display shelf.',
        icon: 'bed',
        badge: 'Rest Area',
      },
      {
        id: 'info-tv',
        type: 'info',
        yaw: 312,
        pitch: -4,
        title: '40" Smart TV & Floating Console',
        description:
          'Wall-mounted 40-inch Smart TV with Netflix and YouTube on an industrial concrete accent wall, accompanied by a white floating media shelf, retro alarm clock, and dried palm bouquet.',
        icon: 'tv',
      },
      {
        id: 'info-balcony',
        type: 'info',
        yaw: 358,
        pitch: -2,
        title: '37th Floor Balcony & Manila Bay',
        description:
          'Private high-rise balcony accessible via floor-to-ceiling glass sliding doors, offering sweeping vistas of the Manila skyline and Manila Bay sunset.',
        icon: 'sun',
        badge: 'Bay View',
      },
      {
        id: 'info-divider',
        type: 'info',
        yaw: 220,
        pitch: -5,
        title: 'Timber Slatted Room Divider',
        description:
          'Warm vertical wood slat partition defining the dedicated work/study desk and entryway while preserving an open, airy studio layout.',
        icon: 'door',
      },
      {
        id: 'info-desk',
        type: 'info',
        yaw: 135,
        pitch: -12,
        title: 'Dedicated Work / Study Desk',
        description:
          'Ergonomic remote-work setup with modern curved armchair, warm study lamp, curated reading books, and high-speed fiber Wi-Fi.',
        icon: 'door',
      },
      {
        id: 'info-ac',
        type: 'info',
        yaw: 2,
        pitch: 28,
        title: 'Split-Type Air Conditioner',
        description:
          'High-efficiency remote-controlled split-type air conditioner ensuring a cool and quiet environment throughout the unit.',
        icon: 'sun',
      },
    ],
  },
];
