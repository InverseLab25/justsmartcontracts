// The standard Ethereum blockies algorithm, ported from the reference
// implementation. We render it ourselves because react-blockies still uses
// componentWillUpdate, which warns on React 18 and is removed in React 19.

const randseed = new Int32Array(4);

const seedrand = (seed: string) => {
  randseed.fill(0);

  for (let i = 0; i < seed.length; i += 1) {
    randseed[i % 4] =
      (randseed[i % 4] << 5) - randseed[i % 4] + seed.charCodeAt(i);
  }
};

const rand = () => {
  const t = randseed[0] ^ (randseed[0] << 11);

  randseed[0] = randseed[1];
  randseed[1] = randseed[2];
  randseed[2] = randseed[3];
  randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8);

  return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
};

const createColor = () => {
  const hue = Math.floor(rand() * 360);
  const saturation = `${rand() * 60 + 40}%`;
  // Four samples so lightness clusters mid-range instead of going flat.
  const lightness = `${(rand() + rand() + rand() + rand()) * 25}%`;

  return `hsl(${hue},${saturation},${lightness})`;
};

// Only half the grid is generated; the rest is mirrored, which is what gives
// blockies their symmetry.
const createImageData = (size: number) => {
  const dataWidth = Math.ceil(size / 2);
  const mirrorWidth = size - dataWidth;

  const data: number[] = [];

  for (let y = 0; y < size; y += 1) {
    let row: number[] = [];

    for (let x = 0; x < dataWidth; x += 1) {
      row[x] = Math.floor(rand() * 2.3);
    }

    row = row.concat(row.slice(0, mirrorWidth).reverse());
    data.push(...row);
  }

  return data;
};

export type TBlockie = {
  cells: number[];
  color: string;
  bgcolor: string;
  spotcolor: string;
};

export const createBlockie = (seed: string, size: number): TBlockie => {
  // Seeded with the raw string, not lowercased. react-blockies does the same,
  // so existing avatars keep the exact look they had.
  seedrand(seed);

  // Order matters: the reference draws three colours before the grid, so
  // changing it would give every address a different avatar.
  const color = createColor();
  const bgcolor = createColor();
  const spotcolor = createColor();

  return { cells: createImageData(size), color, bgcolor, spotcolor };
};
