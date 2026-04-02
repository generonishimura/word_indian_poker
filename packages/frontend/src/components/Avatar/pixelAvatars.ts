// 16x16 pixel art face avatars rendered as 64x64 SVGs (4px per cell)
// '_' = transparent, 'x' = outline, other chars = palette colors
// Every grid row MUST be exactly 16 characters

interface AvatarDef {
  id: string;
  name: string;
  palette: Record<string, string>;
  grid: string[];
}

// Validate grids in dev
function validated(avatars: AvatarDef[]): AvatarDef[] {
  for (const a of avatars) {
    if (a.grid.length !== 16) throw new Error(`${a.id}: grid must have 16 rows, has ${a.grid.length}`);
    for (let i = 0; i < a.grid.length; i++) {
      if (a.grid[i].length !== 16) throw new Error(`${a.id}: row ${i} must be 16 chars, is ${a.grid[i].length}: "${a.grid[i]}"`);
    }
  }
  return avatars;
}

export const AVATARS: AvatarDef[] = validated([
  {
    id: 'boy',
    name: 'おとこのこ',
    palette: {
      x: '#5C3A1E', h: '#8B5E3C', s: '#FCDAB7',
      e: '#2C3E50', w: '#FFFFFF', m: '#E07B6B',
      c: '#F0A8A8', n: '#E88B9C',
    },
    grid: [
      '____xhhhhhx_____',
      '___xhhhhhhhhx___',
      '__xhhhhhhhhhhx__',
      '__xhhhhhhhhhhx__',
      '_xhhhhhhhhhhhx__',
      '_xhssssssssshx__',
      '_xssssssssssx___',
      '_xsswesssewsx___',
      '_xssxsssssxsx___',
      '_xsssssssssssx__',
      '__xssssnssssx___',
      '__xsscmmmmcsx___',
      '___xssssssssx___',
      '____xsssssx_____',
      '_____xxxxx______',
      '________________',
    ],
  },
  {
    id: 'girl',
    name: 'おんなのこ',
    palette: {
      x: '#3D2B1F', h: '#4A3328', s: '#FCDAB7',
      e: '#2C3E50', w: '#FFFFFF', m: '#E88B9C',
      c: '#F0B0B0', r: '#E05070', n: '#E88B9C',
    },
    grid: [
      '____xhhhhhx_____',
      '___xhhhhhhhhx___',
      '__xhhhhhhhhhhx__',
      '_xhhhhhhhhhhhhx_',
      '_xhssssssssshhx_',
      'xhssssssssssshx_',
      'xhsswesssewsshx_',
      'xhssxsssssxshx__',
      '_xsssssssssssx__',
      '_xssssnsssssx___',
      '__xsscmmmcssx___',
      '__xxsssssssxx___',
      '___xxsssssxx____',
      '____xrrxxrrx____',
      '_____xxxxxx_____',
      '________________',
    ],
  },
  {
    id: 'cat',
    name: 'ねこ',
    palette: {
      x: '#7A4B1E', f: '#F5A623', w: '#FFF0D4',
      e: '#2C3E50', g: '#7BC67B', n: '#E88B9C',
      d: '#D4891C',
    },
    grid: [
      '_xf__________fx_',
      '_xff________ffx_',
      '_xfff______fffx_',
      '_xffff____ffffx_',
      '_xfffffxxfffffx_',
      'xffffffffffff_x_',
      'xfwwfffffffwfx__',
      'xfgwfffffwgffx__',
      'xfwwfffffwwffx__',
      'xffffffnfffffx__',
      '_xffwfffffwffx__',
      '_xfffffffffffx__',
      '__xffdddddffx___',
      '___xffffffffx___',
      '____xxxxxxxx____',
      '________________',
    ],
  },
  {
    id: 'dog',
    name: 'いぬ',
    palette: {
      x: '#5C3A1E', b: '#A0724A', w: '#FFF0D4',
      e: '#2C3E50', n: '#4A3520', t: '#E88B9C',
    },
    grid: [
      '_xx________xx___',
      'xbbx______xbbx__',
      'xbbbx____xbbbx__',
      'xbbbbxxxxbbbbx__',
      '_xbbbbbbbbbbx___',
      '_xbbbbbbbbbbx___',
      '_xbwwbbbbwwbx___',
      '_xbwebbbbewbx___',
      '_xbwwbbbbwwbx___',
      '__xbbbnnnbbx____',
      '__xbbbnbbbbx____',
      '__xbwwwwwwbx____',
      '___xbbbbbbx_____',
      '____xxxxxx______',
      '________________',
      '________________',
    ],
  },
  {
    id: 'bear',
    name: 'くま',
    palette: {
      x: '#4A2E14', b: '#8B5E3C', w: '#DEB896',
      e: '#2C3E50', n: '#4A2E14', d: '#6B4226',
    },
    grid: [
      '__xx______xx____',
      '_xddx____xddx___',
      '_xdddx__xdddx___',
      '_xdddbxxbdddx___',
      '__xbbbbbbbbx____',
      '_xbbbbbbbbbbx___',
      '_xbwwbbbbwwbx___',
      '_xbwebbbbewbx___',
      '_xbwwbbbbwwbx___',
      '__xbbbnnnbbx____',
      '__xbbbnbbbbbx___',
      '__xbwwwwwwbx____',
      '___xbbbbbbx_____',
      '____xxxxxx______',
      '________________',
      '________________',
    ],
  },
  {
    id: 'rabbit',
    name: 'うさぎ',
    palette: {
      x: '#8B7088', w: '#FAFAFA', p: '#F4B4C8',
      e: '#C04060', n: '#E88B9C', l: '#F0E6E8',
    },
    grid: [
      '__xw____wx______',
      '__xwp__pwx______',
      '__xwp__pwx______',
      '__xwp__pwx______',
      '__xww__wwx______',
      '__xwwxxwwx______',
      '_xwwwwwwwwx_____',
      '_xwwwwwwwwwx____',
      'xlwwxwwwxwwlx___',
      'xlewwwwwwewlx___',
      'xlwwxwwwxwwlx___',
      '_xwwwwnwwwwx____',
      '__xwwpwwpwwx____',
      '___xwwwwwx______',
      '____xxxxxx______',
      '________________',
    ],
  },
  {
    id: 'fox',
    name: 'きつね',
    palette: {
      x: '#7A3A0E', f: '#E8763A', w: '#FFF0D4',
      e: '#2C3E50', n: '#4A3520', d: '#C05820',
    },
    grid: [
      'xf__________fx__',
      'xff________ffx__',
      'xfff______fffx__',
      'xffff____ffffx__',
      'xfffffxxfffffx__',
      '_xfffffffffffx__',
      '_xfwwffffffwfx__',
      '_xfwefffffwefx__',
      '_xfwwfffffwwfx__',
      '__xffwwnnwwfx___',
      '__xfwwwwwwwfx___',
      '___xwwwwwwwx____',
      '___xffdddffx____',
      '____xffffffx____',
      '_____xxxxxx_____',
      '________________',
    ],
  },
  {
    id: 'penguin',
    name: 'ペンギン',
    palette: {
      x: '#1A1A2E', b: '#2C3E50', w: '#FAFAFA',
      y: '#F5C542', e: '#1A1A2E', c: '#3D5570',
    },
    grid: [
      '____xxxxxx______',
      '___xbbbbbbx_____',
      '__xbbbbbbbbx____',
      '__xbbbbbbbbx____',
      '_xbwwbbbbwwbx___',
      '_xbwebbbbewbx___',
      '_xbwwbbbbwwbx___',
      '_xbbwwwwwwbbx___',
      '_xbbwwwwwwbbx___',
      '__xbbwywwbbx____',
      '__xbbwwwwbbx____',
      '___xbbwwbbx_____',
      '___xbbbbbbx_____',
      '____xxxxxx______',
      '________________',
      '________________',
    ],
  },
  {
    id: 'owl',
    name: 'ふくろう',
    palette: {
      x: '#4A3520', b: '#8B6914', c: '#DEB864',
      e: '#F5C542', p: '#2C3E50', k: '#C08A30',
    },
    grid: [
      '__xb______bx____',
      '_xbbx____xbbx___',
      '_xbbbxxxxbbbx___',
      '_xbbbbbbbbbbx___',
      'xbbeebbbbeebx___',
      'xbbepbbbbpebx___',
      'xbbeebbbbeebx___',
      '_xbbbbkkbbbbx___',
      '_xbcbbkkbbcbx___',
      '_xbccbbbbccbx___',
      '__xbccccccbx____',
      '__xbbccccbbx____',
      '___xbbbbbbx_____',
      '____xxxxxx______',
      '________________',
      '________________',
    ],
  },
  {
    id: 'frog',
    name: 'かえる',
    palette: {
      x: '#2D6B2D', g: '#5CAB5C', l: '#8ED88E',
      e: '#2C3E50', w: '#FAFAFA', m: '#D44040',
      d: '#3D8B3D',
    },
    grid: [
      '___xww__wwx_____',
      '__xwewxxwewx____',
      '__xwwwxxwwwx____',
      '___xggxxggx_____',
      '__xggggggggx____',
      '_xggggggggggx___',
      '_xlggggggggglx__',
      '_xlggggggggglx__',
      '_xgglggggllggx__',
      '__xgggggggggx___',
      '__xgmmmmmmggx___',
      '___xgggggggx____',
      '___xgdddddgx____',
      '____xgggggx_____',
      '_____xxxxxx_____',
      '________________',
    ],
  },
  {
    id: 'robot',
    name: 'ロボット',
    palette: {
      x: '#3A4550', g: '#8899AA', d: '#5C6B7A',
      l: '#44BBEE', r: '#E05050', w: '#C0CDD8',
      a: '#6B7D8D',
    },
    grid: [
      '______ll________',
      '______xx________',
      '____xaaaax______',
      '___xddddddx_____',
      '___xdddddddx____',
      '__xddlddddldx___',
      '__xdddddddddx___',
      '__xdddggggddx___',
      '__xddgrrrrddx___',
      '__xddggggggdx___',
      '___xdddddddx____',
      '___xggggggggx___',
      '___xgwggggwgx___',
      '___xggggggggx___',
      '____xxxxxxxx____',
      '________________',
    ],
  },
  {
    id: 'ghost',
    name: 'おばけ',
    palette: {
      x: '#7B6B9E', w: '#F0EEF5', l: '#D8D4E8',
      e: '#6B5B95', m: '#6B5B95', p: '#E8E4F0',
    },
    grid: [
      '____xxxxxx______',
      '___xwwwwwwx_____',
      '__xwwwwwwwwx____',
      '_xwwwwwwwwwwx___',
      '_xwwwwwwwwwwx___',
      '_xwweewwweewx___',
      '_xwweewwweewx___',
      '_xwwwwwwwwwwx___',
      '_xwwwwmmwwwwx___',
      '_xwwwwwwwwwwx___',
      '_xwwlwwwwwlwx___',
      '_xwllwwwwwllx___',
      '_xwlwwwwwwlwx___',
      '_xwx_xwwwx_xx___',
      '______xwx_______',
      '_______x________',
    ],
  },
]);

const CELL_SIZE = 4;
const GRID_PX = 16 * CELL_SIZE; // 64

export function avatarToSvg(avatarId: string): string {
  const avatar = AVATARS.find(a => a.id === avatarId);
  if (!avatar) return '';

  let rects = '';
  for (let y = 0; y < avatar.grid.length; y++) {
    const row = avatar.grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '_' || ch === ' ') continue;
      const color = avatar.palette[ch];
      if (!color) continue;
      rects += `<rect x="${x * CELL_SIZE}" y="${y * CELL_SIZE}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="${color}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_PX} ${GRID_PX}" width="64" height="64" shape-rendering="crispEdges">${rects}</svg>`;
}

export function avatarToDataUrl(avatarId: string): string {
  const svg = avatarToSvg(avatarId);
  if (!svg) return '';
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
