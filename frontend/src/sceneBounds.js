const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const narrowScreenFactor = (width) => clamp((1600 - width) / 1280, 0, 1);
const lanternNarrowScreenFactor = (width) => clamp((720 - width) / 400, 0, 1);

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

export const getLanternDimensions = (large = false) => {
  const width = large
    ? clamp(window.innerWidth * 0.32, 140, 190)
    : clamp(window.innerWidth * 0.032, 28, 42);
  return { width, height: width * (230 / 180) };
};

export const getLanternBounds = (itemWidth = 42, itemHeight = 68) => {
  const skylineBottom = document.querySelector('.background > .top')?.getBoundingClientRect().bottom
    ?? getSkylineHeight();
  const widthFactor = lanternNarrowScreenFactor(window.innerWidth);
  const desiredClearance = 24 + widthFactor * 64;
  const availableClearance = Math.max(0, skylineBottom - itemHeight - 16);
  const riverbedClearance = Math.min(desiredClearance, availableClearance);
  const skyBottom = Math.max(0, skylineBottom - itemHeight - riverbedClearance);
  const spawnRange = 112 - widthFactor * 80;
  const skyTop = Math.max(0, skyBottom - spawnRange);
  return {
    minY: skyTop,
    maxY: skyBottom,
    ...getHorizontalBounds(itemWidth)
  };
};

export const getLanternSpawnY = (itemWidth = 42, itemHeight = 68, featured = false) => {
  const { minY, maxY } = getLanternBounds(itemWidth, itemHeight);
  const position = featured ? 0.96 : 0.88 + Math.random() * 0.12;
  return minY + (maxY - minY) * position;
};

export const getLanternCenterY = (itemWidth = 42, itemHeight = 68) => {
  const { minY, maxY } = getLanternBounds(itemWidth, itemHeight);
  return minY + (maxY - minY) / 2;
};

export const getLanternInitialY = (itemWidth = 42, itemHeight = 68) => {
  const { minY, maxY } = getLanternBounds(itemWidth, itemHeight);
  return minY + Math.random() * (maxY - minY);
};

export const getRiverBounds = (itemHeight = 82) => {
  const horizon = getSkylineHeight();
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight);
  const minY = horizon + itemHeight / 2 + 63;
  const controlsTop = document.querySelector('.ui-controls')?.getBoundingClientRect().top
    ?? height - 150;
  const maxY = Math.max(minY, Math.min(
    height - itemHeight / 2 - 20,
    controlsTop - itemHeight / 2 - 24
  ));
  const offscreenMargin = ((itemHeight / 2 + 8) / Math.max(1, window.innerWidth)) * 100;
  return {
    minY,
    maxY,
    min: -offscreenMargin,
    max: 100 + offscreenMargin
  };
};

export const getRiverSpawnY = (itemHeight = 82) => {
  const { minY, maxY } = getRiverBounds(itemHeight);
  const rangeRatio = 0.83 - narrowScreenFactor(window.innerWidth) * 0.13;
  const position = Math.random() * rangeRatio;
  return minY + (maxY - minY) * position;
};

export const getRiverCenterY = (itemHeight = 82) => {
  const { minY, maxY } = getRiverBounds(itemHeight);
  return minY + (maxY - minY) / 2;
};

export const getRiverInitialX = (itemWidth = 82) => {
  const { min, max } = getHorizontalBounds(itemWidth);
  return min + Math.random() * (max - min);
};

export const clampSceneValue = clamp;
