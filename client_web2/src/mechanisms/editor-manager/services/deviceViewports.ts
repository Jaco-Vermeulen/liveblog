import type { PreviewDeviceMode, PreviewDeviceOrientation } from '../types';

export interface DeviceViewport {
  width: number;
  height: number;
  frameMode: 'desktop' | 'tablet' | 'phone';
}

/** Logical CSS pixels — iPhone 15 / iPad 10th gen class devices */
export const DEVICE_VIEWPORTS: Record<
  PreviewDeviceMode,
  Record<PreviewDeviceOrientation, DeviceViewport>
> = {
  mobile: {
    portrait: { width: 393, height: 852, frameMode: 'phone' },
    landscape: { width: 852, height: 393, frameMode: 'phone' },
  },
  tablet: {
    portrait: { width: 820, height: 1180, frameMode: 'tablet' },
    landscape: { width: 1180, height: 820, frameMode: 'tablet' },
  },
  desktop: {
    portrait: { width: 1280, height: 800, frameMode: 'desktop' },
    landscape: { width: 1440, height: 900, frameMode: 'desktop' },
  },
};

/** Bezel + notch/home indicator outside the logical screen (px). */
export function deviceChromeInsets(frameMode: DeviceViewport['frameMode']): {
  width: number;
  height: number;
} {
  if (frameMode === 'phone') return { width: 24, height: 30 };
  if (frameMode === 'tablet') return { width: 28, height: 34 };
  return { width: 0, height: 0 };
}

/** Total device frame size including chrome (before scale). */
export function computeDeviceOuterSize(viewport: DeviceViewport): {
  width: number;
  height: number;
} {
  const chrome = deviceChromeInsets(viewport.frameMode);
  return {
    width: viewport.width + chrome.width,
    height: viewport.height + chrome.height,
  };
}

/** Pixel layout for device mockup at a given scale (no CSS transform — avoids corner bleed). */
export interface ScaledDeviceFrame {
  outerWidth: number;
  outerHeight: number;
  paddingTop: number;
  paddingSide: number;
  paddingBottom: number;
  screenWidth: number;
  screenHeight: number;
  radiusOuter: number;
  radiusScreen: number;
  islandWidth: number;
  islandHeight: number;
  homeWidth: number;
  homeHeight: number;
}

export function scaleDeviceFrame(viewport: DeviceViewport, scale: number): ScaledDeviceFrame {
  const chrome = deviceChromeInsets(viewport.frameMode);
  const isPhone = viewport.frameMode === 'phone';
  const padTop = isPhone ? 14 : 10;
  const padSide = isPhone ? 12 : 10;
  const padBottom = isPhone ? 16 : 10;
  const radiusOuter = isPhone ? 44 : 24;
  const radiusScreen = isPhone ? 34 : 16;

  return {
    outerWidth: Math.round((viewport.width + chrome.width) * scale),
    outerHeight: Math.round((viewport.height + chrome.height) * scale),
    paddingTop: Math.round(padTop * scale),
    paddingSide: Math.round(padSide * scale),
    paddingBottom: Math.round(padBottom * scale),
    screenWidth: Math.round(viewport.width * scale),
    screenHeight: Math.round(viewport.height * scale),
    radiusOuter: Math.round(radiusOuter * scale),
    radiusScreen: Math.round(radiusScreen * scale),
    islandWidth: Math.round(116 * scale),
    islandHeight: Math.round(25 * scale),
    homeWidth: Math.round(92 * scale),
    homeHeight: Math.max(3, Math.round(4 * scale)),
  };
}

/** Scale device to fit preview host; uses both width and height. */
export function computePreviewScale(
  outerSize: { width: number; height: number },
  hostSize: { width: number; height: number },
): number {
  if (hostSize.width <= 0 || hostSize.height <= 0) return 1;
  return Math.min(1, hostSize.width / outerSize.width, hostSize.height / outerSize.height);
}

/** Max visible height inside split panel (device chrome scrolls internally). */
export function getVisibleViewport(
  device: PreviewDeviceMode,
  orientation: PreviewDeviceOrientation,
): DeviceViewport {
  const base = DEVICE_VIEWPORTS[device][orientation];
  if (device === 'desktop') {
    return base;
  }
  if (typeof window === 'undefined') {
    return base;
  }
  const cap =
    device === 'mobile'
      ? Math.round(window.innerHeight * 0.72)
      : Math.round(window.innerHeight * 0.65);
  return {
    ...base,
    height: Math.min(base.height, cap),
  };
}
