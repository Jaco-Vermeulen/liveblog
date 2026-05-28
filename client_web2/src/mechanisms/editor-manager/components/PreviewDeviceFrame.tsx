import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { activateEmbedMarkup } from '../subsystems/embed-handlers/services/iframelyEmbedJs';
import {
  computeDeviceOuterSize,
  computePreviewScale,
  getVisibleViewport,
  scaleDeviceFrame,
} from '../services/deviceViewports';
import type { PreviewEmbedHandlers } from '../services/previewEmbedBridge';
import type { PreviewDeviceMode, PreviewDeviceOrientation } from '../types';
import { ThemeIframePreview } from './ThemeIframePreview';

export interface PreviewDeviceFrameProps {
  deviceMode: PreviewDeviceMode;
  orientation: PreviewDeviceOrientation;
  themePreviewUrl: string | null;
  embedHandlers: PreviewEmbedHandlers | null;
  draftSlot?: ReactNode;
  /** React fallback when iframe is cross-origin or embed URL missing */
  children: ReactNode;
}

export function PreviewDeviceFrame({
  deviceMode,
  orientation,
  themePreviewUrl,
  embedHandlers,
  draftSlot,
  children,
}: PreviewDeviceFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const [useFallback, setUseFallback] = useState(false);

  const viewport = useMemo(
    () => getVisibleViewport(deviceMode, orientation),
    [deviceMode, orientation],
  );

  const useLiveTheme = Boolean(themePreviewUrl) && !useFallback;
  const isDesktop = deviceMode === 'desktop';
  const isPhone = viewport.frameMode === 'phone';

  const outerSize = useMemo(() => computeDeviceOuterSize(viewport), [viewport]);

  const scale = useMemo(() => {
    if (isDesktop) return 1;
    return computePreviewScale(outerSize, hostSize);
  }, [isDesktop, outerSize, hostSize]);

  const frame = useMemo(
    () => (isDesktop ? null : scaleDeviceFrame(viewport, scale)),
    [isDesktop, viewport, scale],
  );

  useEffect(() => {
    setUseFallback(false);
  }, [themePreviewUrl, embedHandlers]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const update = () => {
      setHostSize({
        width: host.clientWidth || 0,
        height: host.clientHeight || 0,
      });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (useLiveTheme) return;
    const root = scrollRef.current;
    if (!root) return;
    const run = () => void activateEmbedMarkup(root);
    run();
    const t = window.setTimeout(run, 400);
    return () => window.clearTimeout(t);
  }, [children, deviceMode, orientation, useLiveTheme]);

  const desktopFillStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const renderScreen = (screenStyle?: { width: string; height: string; borderRadius?: number }) => (
    <div
      className={`lb-preview-device__screen${isDesktop ? ' lb-preview-device__screen--fill' : ''}${isPhone ? ' lb-preview-device__screen--phone' : ''}`}
      style={
        screenStyle
          ? {
              width: screenStyle.width,
              height: screenStyle.height,
              borderRadius: screenStyle.borderRadius,
            }
          : undefined
      }
    >
      {isPhone ? (
        <div
          className="lb-preview-device__island"
          style={
            frame
              ? { width: frame.islandWidth, height: frame.islandHeight }
              : undefined
          }
          aria-hidden
        />
      ) : null}
      <div
        ref={scrollRef}
        className={`lb-preview-device__scroll${useLiveTheme ? ' lb-preview-device__scroll--iframe' : ''}`}
      >
        {useLiveTheme && themePreviewUrl ? (
          <div className="lb-preview-iframe-stack">
            {draftSlot ? <div className="lb-preview-draft-overlay">{draftSlot}</div> : null}
            <ThemeIframePreview
              src={themePreviewUrl}
              handlers={embedHandlers}
              onNeedsFallback={() => setUseFallback(true)}
            />
          </div>
        ) : (
          children
        )}
      </div>
      {isPhone ? (
        <div
          className="lb-preview-device__home-indicator"
          style={
            frame
              ? { width: frame.homeWidth, height: frame.homeHeight }
              : undefined
          }
          aria-hidden
        />
      ) : null}
    </div>
  );

  return (
    <div
      ref={hostRef}
      className="lb-preview-viewport"
      data-device={deviceMode}
      data-orientation={orientation}
    >
      {isDesktop ? (
        <div className="lb-preview-device-wrap" style={desktopFillStyle}>
          <div className="lb-preview-device-scale" style={desktopFillStyle}>
            <div className="lb-preview-device lb-preview-device--desktop lb-preview-device--fill">
              {renderScreen()}
            </div>
          </div>
        </div>
      ) : frame ? (
        <div
          className="lb-preview-device-stage"
          style={{
            width: frame.outerWidth,
            height: frame.outerHeight,
            borderRadius: frame.radiusOuter,
          }}
        >
          <div
            className={`lb-preview-device lb-preview-device--${viewport.frameMode}`}
            style={{
              width: frame.outerWidth,
              height: frame.outerHeight,
              padding: `${frame.paddingTop}px ${frame.paddingSide}px ${frame.paddingBottom}px`,
              borderRadius: frame.radiusOuter,
            }}
          >
            {renderScreen({
              width: `${frame.screenWidth}px`,
              height: `${frame.screenHeight}px`,
              borderRadius: frame.radiusScreen,
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
