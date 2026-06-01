import { LbButton, LbModal } from '@/components/ui';
import { AF } from '@/copy';

export type PasswordResetSuccessKind = 'email-sent' | 'password-set';

type PasswordResetSuccessModalProps = {
  open: boolean;
  kind: PasswordResetSuccessKind;
  onClose: () => void;
  onPrimaryAction?: () => void;
};

const COPY: Record<
  PasswordResetSuccessKind,
  { title: string; body: string; primaryLabel: string }
> = {
  'email-sent': {
    title: AF.auth.emailSentTitle,
    body: AF.auth.emailSentBody,
    primaryLabel: AF.common.understand,
  },
  'password-set': {
    title: AF.auth.passwordSetTitle,
    body: AF.auth.passwordSetBody,
    primaryLabel: AF.auth.goToSignIn,
  },
};

export function PasswordResetSuccessModal({
  open,
  kind,
  onClose,
  onPrimaryAction,
}: PasswordResetSuccessModalProps) {
  const { title, body, primaryLabel } = COPY[kind];

  return (
    <LbModal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <LbButton
          type="button"
          variant="accent"
          onClick={() => {
            onPrimaryAction?.();
            onClose();
          }}
        >
          {primaryLabel}
        </LbButton>
      }
    >
      <p className="m-0 text-sm leading-relaxed text-mar-muted">{body}</p>
    </LbModal>
  );
}
