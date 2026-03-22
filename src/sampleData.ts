import type { PointItem, GlobeTheme } from './theme/GlobeTheme';
import type { ArcDatum } from './layers/ArcLayer';
import type { TrailDatum } from './layers/TrailLayer';

// ---------------------------------------------------------------------------
// 50 hardcoded sample fish species for testing the globe engine.
// Coordinates are real-world ocean locations where these species are found.
// ---------------------------------------------------------------------------

export const SAMPLE_POINTS: PointItem[] = [
  // Great Barrier Reef
  { id: '1', lat: -16.5, lng: 145.8, name: 'Clownfish', nameZh: '小丑鱼', rarity: 1 },
  { id: '2', lat: -18.2, lng: 147.5, name: 'Blue Tang', nameZh: '蓝刺尾鱼', rarity: 1 },
  { id: '3', lat: -14.7, lng: 145.5, name: 'Parrotfish', nameZh: '鹦嘴鱼', rarity: 1 },
  { id: '4', lat: -20.0, lng: 149.0, name: 'Coral Trout', nameZh: '珊瑚石斑', rarity: 2 },
  { id: '5', lat: -17.3, lng: 146.8, name: 'Maori Wrasse', nameZh: '苏眉鱼', rarity: 4 },

  // Southeast Asia
  { id: '6', lat: 9.5, lng: 118.5, name: 'Whale Shark', nameZh: '鲸鲨', rarity: 4 },
  { id: '7', lat: 1.5, lng: 104.8, name: 'Barramundi', nameZh: '尖吻鲈', rarity: 1 },
  { id: '8', lat: -8.3, lng: 115.5, name: 'Manta Ray', nameZh: '蝠鲼', rarity: 3 },
  { id: '9', lat: 7.0, lng: 125.5, name: 'Tuna', nameZh: '金枪鱼', rarity: 1 },
  { id: '10', lat: 4.2, lng: 117.8, name: 'Clown Triggerfish', nameZh: '小丑炮弹鱼', rarity: 2 },

  // Caribbean
  { id: '11', lat: 18.4, lng: -64.9, name: 'Queen Angelfish', nameZh: '皇后神仙鱼', rarity: 2 },
  { id: '12', lat: 21.5, lng: -71.1, name: 'Nassau Grouper', nameZh: '拿骚石斑', rarity: 4 },
  { id: '13', lat: 16.7, lng: -62.2, name: 'Tarpon', nameZh: '大海鲢', rarity: 2 },
  { id: '14', lat: 24.5, lng: -77.8, name: 'Bonefish', nameZh: '北梭鱼', rarity: 2 },
  { id: '15', lat: 19.8, lng: -79.8, name: 'Lionfish', nameZh: '狮子鱼', rarity: 1 },

  // Mediterranean
  { id: '16', lat: 36.8, lng: 10.2, name: 'Mediterranean Swordfish', nameZh: '地中海旗鱼', rarity: 3 },
  { id: '17', lat: 39.5, lng: 2.5, name: 'Bluefin Tuna', nameZh: '蓝鳍金枪鱼', rarity: 5 },
  { id: '18', lat: 37.0, lng: 25.5, name: 'Grouper', nameZh: '石斑鱼', rarity: 2 },
  { id: '19', lat: 43.3, lng: 6.5, name: 'Sea Bream', nameZh: '鲷鱼', rarity: 1 },
  { id: '20', lat: 35.2, lng: -4.5, name: 'Moray Eel', nameZh: '海鳗', rarity: 2 },

  // North Atlantic
  { id: '21', lat: 42.0, lng: -66.5, name: 'Atlantic Cod', nameZh: '大西洋鳕鱼', rarity: 2 },
  { id: '22', lat: 63.5, lng: -20.0, name: 'Atlantic Salmon', nameZh: '大西洋鲑鱼', rarity: 2 },
  { id: '23', lat: 50.5, lng: -10.2, name: 'Basking Shark', nameZh: '姥鲨', rarity: 3 },
  { id: '24', lat: 55.0, lng: -1.5, name: 'Herring', nameZh: '鲱鱼', rarity: 1 },
  { id: '25', lat: 47.5, lng: -52.5, name: 'Halibut', nameZh: '大比目鱼', rarity: 2 },

  // North Pacific
  { id: '26', lat: 57.0, lng: -152.0, name: 'King Salmon', nameZh: '帝王鲑', rarity: 2 },
  { id: '27', lat: 36.5, lng: -122.0, name: 'Great White Shark', nameZh: '大白鲨', rarity: 3 },
  { id: '28', lat: 20.8, lng: -156.5, name: 'Mahi-Mahi', nameZh: '鬼头刀', rarity: 1 },
  { id: '29', lat: 34.0, lng: 136.5, name: 'Fugu', nameZh: '河豚', rarity: 3 },
  { id: '30', lat: 43.0, lng: 145.0, name: 'Pacific Saury', nameZh: '秋刀鱼', rarity: 1 },

  // Indian Ocean
  { id: '31', lat: -4.5, lng: 55.5, name: 'Sailfish', nameZh: '旗鱼', rarity: 2 },
  { id: '32', lat: -12.2, lng: 44.3, name: 'Coelacanth', nameZh: '腔棘鱼', rarity: 5 },
  { id: '33', lat: 12.0, lng: 73.5, name: 'Flying Fish', nameZh: '飞鱼', rarity: 1 },
  { id: '34', lat: -6.0, lng: 39.3, name: 'Yellowfin Tuna', nameZh: '黄鳍金枪鱼', rarity: 2 },
  { id: '35', lat: -21.1, lng: 55.5, name: 'Blue Marlin', nameZh: '蓝枪鱼', rarity: 3 },

  // South Pacific
  { id: '36', lat: -17.5, lng: -149.5, name: 'Napoleon Wrasse', nameZh: '拿破仑鱼', rarity: 4 },
  { id: '37', lat: -22.2, lng: 166.5, name: 'Nautilus', nameZh: '鹦鹉螺', rarity: 4 },
  { id: '38', lat: -41.3, lng: 174.8, name: 'Blue Cod', nameZh: '蓝鳕', rarity: 2 },
  { id: '39', lat: -8.5, lng: 160.0, name: 'Bumphead Parrotfish', nameZh: '隆头鹦哥鱼', rarity: 3 },
  { id: '40', lat: -15.4, lng: -145.2, name: 'Moorish Idol', nameZh: '镰鱼', rarity: 2 },

  // South Atlantic
  { id: '41', lat: -34.0, lng: 18.5, name: 'Cape Horse Mackerel', nameZh: '好望角竹荚鱼', rarity: 1 },
  { id: '42', lat: -3.8, lng: -32.4, name: 'Fernando Noronha Shark', nameZh: '费尔南多鲨', rarity: 3 },
  { id: '43', lat: -54.5, lng: -36.5, name: 'Patagonian Toothfish', nameZh: '巴塔哥尼亚犬牙鱼', rarity: 3 },

  // Arctic / Polar
  { id: '44', lat: 71.0, lng: 25.5, name: 'Arctic Char', nameZh: '北极红点鲑', rarity: 2 },
  { id: '45', lat: 78.0, lng: 15.5, name: 'Greenland Shark', nameZh: '格陵兰鲨', rarity: 3 },

  // Freshwater (major rivers / lakes)
  { id: '46', lat: -3.1, lng: -60.0, name: 'Arapaima', nameZh: '巨骨舌鱼', rarity: 3 },
  { id: '47', lat: 47.5, lng: 108.0, name: 'Taimen', nameZh: '哲罗鱼', rarity: 4 },
  { id: '48', lat: -6.0, lng: 29.5, name: 'Nile Perch', nameZh: '尼罗河鲈', rarity: 2 },

  // Deep sea
  { id: '49', lat: 32.5, lng: -64.8, name: 'Anglerfish', nameZh: '鮟鱇鱼', rarity: 3 },
  { id: '50', lat: -28.5, lng: -177.5, name: 'Oarfish', nameZh: '皇带鱼', rarity: 4 },
];

// ---------------------------------------------------------------------------
// Sample arcs — fish migration routes
// ---------------------------------------------------------------------------

export const SAMPLE_ARCS: ArcDatum[] = [
  // Atlantic salmon: North Atlantic breeding migration
  {
    id: 'arc-1',
    startLat: 63.5, startLng: -20.0,
    endLat: 55.0, endLng: -1.5,
    color: ['#4cc9f0', '#56d6a0'],
    label: 'Atlantic Salmon Migration',
    width: 1.2,
  },
  // Bluefin tuna: Mediterranean ↔ Atlantic
  {
    id: 'arc-2',
    startLat: 39.5, startLng: 2.5,
    endLat: 42.0, endLng: -66.5,
    color: ['#ef476f', '#f9c74f'],
    label: 'Bluefin Tuna Transatlantic',
    width: 1.0,
  },
  // Whale shark: SE Asia → Indian Ocean
  {
    id: 'arc-3',
    startLat: 9.5, startLng: 118.5,
    endLat: -4.5, endLng: 55.5,
    color: ['#b185db', '#4cc9f0'],
    label: 'Whale Shark Migration',
    width: 1.5,
    particleSpeed: 3000,
  },
  // Great white: California → Hawaii
  {
    id: 'arc-4',
    startLat: 36.5, startLng: -122.0,
    endLat: 20.8, endLng: -156.5,
    color: ['#f9c74f', '#ef476f'],
    label: 'Great White Café Route',
  },
  // King salmon: Alaska → Pacific
  {
    id: 'arc-5',
    startLat: 57.0, startLng: -152.0,
    endLat: 43.0, endLng: 145.0,
    color: ['#56d6a0', '#4cc9f0'],
    label: 'Pacific Salmon Run',
    width: 0.8,
  },
];

// ---------------------------------------------------------------------------
// Sample trails — ocean currents
// ---------------------------------------------------------------------------

export const SAMPLE_TRAILS: TrailDatum[] = [
  // Gulf Stream
  {
    id: 'trail-1',
    label: 'Gulf Stream',
    color: ['#4cc9f0', '#56d6a0', '#4cc9f0'],
    width: 1.5,
    speed: 8000,
    waypoints: [
      { lat: 24.5, lng: -80.0 },
      { lat: 30.0, lng: -78.0 },
      { lat: 35.0, lng: -74.0 },
      { lat: 40.0, lng: -68.0 },
      { lat: 45.0, lng: -55.0 },
      { lat: 50.0, lng: -40.0 },
      { lat: 52.0, lng: -20.0 },
    ],
  },
  // Kuroshio Current
  {
    id: 'trail-2',
    label: 'Kuroshio Current',
    color: '#4cc9f0',
    width: 1.2,
    speed: 7000,
    waypoints: [
      { lat: 15.0, lng: 125.0 },
      { lat: 22.0, lng: 128.0 },
      { lat: 30.0, lng: 132.0 },
      { lat: 35.0, lng: 140.0 },
      { lat: 40.0, lng: 150.0 },
    ],
  },
  // Agulhas Current (Indian Ocean)
  {
    id: 'trail-3',
    label: 'Agulhas Current',
    color: ['#56d6a0', '#4cc9f0'],
    speed: 9000,
    waypoints: [
      { lat: -15.0, lng: 42.0 },
      { lat: -22.0, lng: 38.0 },
      { lat: -30.0, lng: 32.0 },
      { lat: -35.0, lng: 26.0 },
      { lat: -34.0, lng: 18.0 },
    ],
  },
];

/** Sample theme preset for testing — ocean-dark. */
export const OCEAN_DARK_THEME: GlobeTheme = {
  id: 'fish',
  name: 'FishGlobe',
  tagline: 'Every fish species, mapped',

  globeTexture: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  atmosphereColor: '#4fc3f7',
  backgroundColor: '#070d1f',
  terrain: {
    bumpMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
    bumpScale: 10,
    specularMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png',
    specular: 'grey',
    shininess: 15,
  },

  pointColor: (item) => {
    const r = item.rarity ?? 1;
    if (r >= 5) return '#ff1744';
    if (r >= 4) return '#ff9100';
    if (r >= 3) return '#ffea00';
    if (r >= 2) return '#69f0ae';
    return '#4fc3f7';
  },
  pointSize: (item) => {
    const r = item.rarity ?? 1;
    return 0.3 + r * 0.15;
  },
  clusterColor: (count) => {
    if (count > 100) return '#ff7043';
    if (count > 20) return '#ffca28';
    return '#4fc3f7';
  },

  colors: {
    primary: '#4fc3f7',
    surface: '#0d1b2a',
    text: '#e0e6ed',
    textMuted: '#7b8ca3',
    accent: '#00e5ff',
    gradient: ['#1a237e', '#0d47a1'],
  },

  fonts: {
    display: '"Playfair Display", serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },

  filters: [
    {
      key: 'rarity',
      label: 'Conservation Status',
      type: 'chips',
      options: ['Common', 'Uncommon', 'Vulnerable', 'Endangered', 'Critical'],
    },
    {
      key: 'habitat',
      label: 'Habitat',
      type: 'chips',
      options: ['Pelagic', 'Demersal', 'Reef', 'Freshwater', 'Deep Sea'],
    },
    {
      key: 'showRare',
      label: 'Rare species only',
      type: 'toggle',
    },
  ],

  detailFields: [
    { key: 'scientificName', label: 'Scientific Name' },
    { key: 'maxLength', label: 'Max Length' },
    { key: 'habitat', label: 'Habitat' },
  ],

  attribution: [
    { name: 'FishBase', url: 'https://fishbase.org', license: 'CC-BY-NC' },
  ],

  externalLinks: (item) => [
    { label: 'FishBase', url: `https://fishbase.org/summary/${item.id}` },
  ],
};
