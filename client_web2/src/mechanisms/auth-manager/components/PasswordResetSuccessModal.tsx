import { LbButton, LbModal } from '@/components/ui';

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
    title: 'E-pos gestuur',
    body:
      "Indien hierdie e-pos by ons geregistreer is, sal jy binnekort 'n skakel ontvang om jou wagwoord te stel.",
    primaryLabel: 'Verstaan',
  },
  'password-set': {
    title: 'Wagwoord gestel',
    body: 'Jou wagwoord is gestel. Jy kan nou aanmeld.',
    primaryLabel: 'Gaan na aanmelding',
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
