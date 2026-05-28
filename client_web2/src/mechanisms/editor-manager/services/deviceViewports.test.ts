import { describe, expect, it } from 'vitest';
import {
  computeDeviceOuterSize,
  computePreviewScale,
  DEVICE_VIEWPORTS,
  getVisibleViewport,
  scaleDeviceFrame,
} from './deviceViewports';

describe('deviceViewports', () => {
  it('has realistic iPhone portrait dimensions', () => {
    expect(DEVICE_VIEWPORTS.mobile.portrait).toEqual({
      width: 393,
      height: 852,
      frameMode: 'phone',
    });
  });

  it('swaps dimensions for phone landscape', () => {
    const p = DEVICE_VIEWPORTS.mobile.portrait;
    const l = DEVICE_VIEWPORTS.mobile.landscape;
    expect(l.width).toBe(p.height);
    expect(l.height).toBe(p.width);
  });

  it('caps visible height on phone', () => {
    const v = getVisibleViewport('mobile', 'portrait');
    expect(v.width).toBe(393);
    expect(v.height).toBeLessThanOrEqual(852);
  });

  it('includes phone chrome in outer size', () => {
    const outer = computeDeviceOuterSize(DEVICE_VIEWPORTS.mobile.portrait);
    expect(outer.width).toBe(417);
    expect(outer.height).toBe(882);
  });

  it('scaleDeviceFrame matches outer size at scale 1', () => {
    const outer = computeDeviceOuterSize(DEVICE_VIEWPORTS.mobile.portrait);
    const frame = scaleDeviceFrame(DEVICE_VIEWPORTS.mobile.portrait, 1);
    expect(frame.outerWidth).toBe(outer.width);
    expect(frame.outerHeight).toBe(outer.height);
    expect(frame.screenWidth).toBe(393);
  });

  it('scales down when host is smaller than device', () => {
    const outer = computeDeviceOuterSize(DEVICE_VIEWPORTS.mobile.portrait);
    const scaleByWidth = computePreviewScale(outer, { width: 300, height: 1200 });
    expect(scaleByWidth).toBeLessThan(1);
    expect(scaleByWidth).toBeCloseTo(300 / 417, 4);

    const scaleByHeight = computePreviewScale(outer, { width: 600, height: 400 });
    expect(scaleByHeight).toBeCloseTo(400 / 882, 4);
  });
});
