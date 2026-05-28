import { useEffect, useState, type CSSProperties } from 'react';

export type HeaderWatermarkConfig = {
  tileUrl?: string;
  tileSizePx?: { width: number; height: number };
  /** How many tile-heights fit in the bar (Maroela default 1.5). */
  verticalTiles?: number;
};

const DEFAULT_TILE_URL = '/muurpapier.png';
const DEFAULT_VERTICAL_TILES = 1.5;

/**
 * Repeatable muurpapier background for header chrome — ported from maroela_web2 Header.tsx.
 */
export function useHeaderWatermark(
  headerHeightPx: number,
  config: HeaderWatermarkConfig = {},
): CSSProperties {
  const tileUrl = config.tileUrl?.trim() || DEFAULT_TILE_URL;
  const verticalTiles =
    typeof config.verticalTiles === 'number' && config.verticalTiles > 0
      ? config.verticalTiles
      : DEFAULT_VERTICAL_TILES;
  const configured = config.tileSizePx;
  const hasConfiguredTileSize =
    typeof configured?.width === 'number' &&
    typeof configured?.height === 'number' &&
    configured.width > 0 &&
    configured.height > 0;

  const [tilePx, setTilePx] = useState<{ w: number; h: number } | null>(() => {
    const w = configured?.width;
    const h = configured?.height;
    if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) return { w, h };
    return null;
  });

  useEffect(() => {
    const w = configured?.width;
    const h = configured?.height;
    if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
      setTilePx({ w, h });
      return;
    }

    setTilePx(null);
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (nw > 0 && nh > 0) setTilePx({ w: nw, h: nh });
    };
    img.onerror = () => {
      if (!cancelled) setTilePx(null);
    };
    img.src = tileUrl;
    return () => {
      cancelled = true;
    };
  }, [tileUrl, configured?.width, configured?.height]);

  const targetTileHeightPx = headerHeightPx > 0 ? headerHeightPx / verticalTiles : 0;
  const scaledTilePx =
    tilePx && targetTileHeightPx > 0
      ? {
          h: Math.max(1, Math.round(targetTileHeightPx)),
          w: Math.max(1, Math.round((targetTileHeightPx * tilePx.w) / tilePx.h)),
        }
      : null;

  const verticalNudgePx = headerHeightPx > 0 ? Math.round(headerHeightPx * 0.2) : 0;

  return {
    backgroundImage: `url("${tileUrl}")`,
    backgroundRepeat: 'repeat',
    backgroundPosition:
      verticalNudgePx > 0 ? `center calc(50% - ${verticalNudgePx}px)` : 'center center',
    backgroundSize: hasConfiguredTileSize
      ? `${tilePx?.w ?? 0}px ${tilePx?.h ?? 0}px`
      : scaledTilePx
        ? `${scaledTilePx.w}px ${scaledTilePx.h}px`
        : tilePx
          ? `${tilePx.w}px ${tilePx.h}px`
          : 'auto',
  };
}
