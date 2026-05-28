import { useHeaderWatermark, type HeaderWatermarkConfig } from './useHeaderWatermark';

type LbHeaderWatermarkProps = {
  headerHeightPx: number;
  config?: HeaderWatermarkConfig;
};

/** Repeatable muurpapier layer behind header chrome (Maroela web2 parity). */
export function LbHeaderWatermark({ headerHeightPx, config }: LbHeaderWatermarkProps) {
  const style = useHeaderWatermark(headerHeightPx, config);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.42]"
        style={style}
        aria-hidden
        data-testid="header-watermark"
      />
    </div>
  );
}
