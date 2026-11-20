const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getSkylineHeight = () => Math.min(
  Math.max(408, window.innerWidth * 0.28333),
  (window.visualViewport?.height || window.innerHeight) * 0.85,
  Math.max(160, (window.visualViewport?.height || window.innerHeight) - 350)
);

export const getHorizontalBounds = (itemWidth) => {
  const width = Math.max(1, window.innerWidth);
  const margin = Math.min(20, Math.max(4, ((itemWidth / 2 + 8) / width) * 100));
  return { min: margin, max: 100 - margin };
};

export const getLanternBounds = (itemWidth = 42, itemHeight = 68) => {
  const skylineHeight = getSkylineHeight();
  const skyTop = Math.min(120, Math.max(64, skylineHeight * 0.16));
  const skyBottom = Math.max(skyTop, skylineHeight - itemHeight - 20);
  return {
    minY: skyTop,
    maxY: skyBottom,
    ...getHorizontalBounds(itemWidth)
  };
};

export const getLanternSpawnY = (itemWidth = 42, itemHeight = 68, featured = false) => {
  const { minY, maxY } = getLanternBounds(itemWidth, itemHeight);
  const position = featured ? 0.58 : 0.16 + Math.random() * 0.68;
  return minY + (maxY - minY) * position;
};

export const getRiverBounds = (itemHeight = 82) => {
  const horizon = getSkylineHeight();
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight);
  const minY = horizon + itemHeight / 2 + 52;
  const maxY = height + itemHeight / 2;
  return {
    minY,
    maxY,
    min: -12,
    max: 112
  };
};

export const getRiverSpawnY = (itemHeight = 82, featured = false) => {
  const { minY, maxY } = getRiverBounds(itemHeight);
  const position = featured ? 0.42 : 0.2 + Math.random() * 0.6;
  return minY + (maxY - minY) * position;
};

export const clampSceneValue = clamp;
