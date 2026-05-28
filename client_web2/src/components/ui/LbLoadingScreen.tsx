import { LbSpinner } from './LbSpinner';

type LbLoadingScreenProps = {
  message?: string;
};

export function LbLoadingScreen({ message = 'Laai…' }: LbLoadingScreenProps) {
  return (
    <div
      className="flex min-h-screen min-h-dvh flex-col items-center justify-center gap-4 bg-mar-page text-mar-muted"
      aria-busy="true"
    >
      <LbSpinner tone="dark" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
