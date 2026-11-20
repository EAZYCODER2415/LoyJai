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

export const getLanternDimensions = (large = false) => {
  const width = large
    ? clamp(window.innerWidth * 0.16, 104, 150)
    : clamp(window.innerWidth * 0.032, 28, 42);
  return { width, height: width * (230 / 180) };
};

export const getLanternBounds = (itemWidth = 42, itemHeight = 68) => {
  const skylineHeight = getSkylineHeight();
  const skyBottom = Math.max(0, skylineHeight - itemHeight - 6);
  const skyTop = Math.min(skyBottom, Math.min(72, Math.max(20, skylineHeight * 0.14)));
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

export const getRiverBounds = (itemHeight = 82) => {
  const horizon = getSkylineHeight();
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight);
  const minY = horizon + itemHeight / 2 + 55;
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

export const getRiverSpawnY = (itemHeight = 82, featured = false) => {
  const { minY, maxY } = getRiverBounds(itemHeight);
  const position = featured ? 0.06 : 0.02 + Math.random() * 0.14;
  return minY + (maxY - minY) * position;
};

export const clampSceneValue = clamp;
