import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type LbCardVariant = 'default' | 'elevated' | 'interactive' | 'flat' | 'outline';
type LbCardPadding = 'none' | 'sm' | 'md' | 'lg';

type LbCardContextValue = {
  variant: LbCardVariant;
  padding: LbCardPadding;
};

const LbCardContext = createContext<LbCardContextValue>({
  variant: 'default',
  padding: 'md',
});

function useLbCardContext() {
  return useContext(LbCardContext);
}

const cardVariants: Record<LbCardVariant, string> = {
  default: 'border-mar-border bg-mar-card shadow-sm shadow-mar-border/30',
  elevated: 'border-mar-border bg-mar-card shadow-md shadow-mar-text/5',
  interactive:
    'border-mar-border bg-mar-card shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-mar-text/10',
  flat: 'border-mar-border bg-mar-card',
  outline: 'border-mar-border bg-mar-page',
};

/* ── Root ───────────────────────────────────────────────────────────── */

export type LbCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  variant?: LbCardVariant;
  /** Applied when card has no compound sections (plain children only) */
  padding?: LbCardPadding;
  as?: 'article' | 'div' | 'section';
};

export function LbCard({
  children,
  className,
  variant = 'default',
  padding = 'md',
  as: Tag = 'article',
  ...props
}: LbCardProps) {
  return (
    <LbCardContext.Provider value={{ variant, padding }}>
      <Tag
        className={cn(
          'flex flex-col overflow-hidden rounded-2xl border',
          cardVariants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    </LbCardContext.Provider>
  );
}

/* ── Header block ───────────────────────────────────────────────────── */

export type LbCardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  /** Show divider below header */
  bordered?: boolean;
};

export function LbCardHeader({
  children,
  className,
  bordered = false,
  ...props
}: LbCardHeaderProps) {
  const { padding } = useLbCardContext();
  const pad = padding === 'none' ? 'px-5 pt-5' : padding === 'sm' ? 'p-4 pb-0' : padding === 'lg' ? 'p-6 pb-0 sm:p-8 sm:pb-0' : 'p-5 pb-0';

  return (
    <header
      className={cn(
        pad,
        bordered && 'border-b border-mar-border pb-4',
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

/** Top row: title stack left, actions right */
export function LbCardHeaderRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      {children}
    </div>
  );
}

export function LbCardHeaderContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex min-w-0 flex-1 flex-col gap-1', className)}>{children}</div>;
}

export function LbCardActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex shrink-0 flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  );
}

/* ── Typography ───────────────────────────────────────────────────────── */

export type LbCardEyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

/** Small uppercase label above title (section kicker) */
export function LbCardEyebrow({ children, className, ...props }: LbCardEyebrowProps) {
  return (
    <p
      className={cn(
        'm-0 text-xs font-bold uppercase tracking-widest text-mar-teal',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type LbCardHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  /** h2 panel (default) | h3 compact | h1 hero */
  level?: 'hero' | 'panel' | 'compact';
  as?: 'h1' | 'h2' | 'h3' | 'h4';
};

/** Primary card title */
export function LbCardTitle({
  children,
  className,
  level = 'panel',
  as,
  ...props
}: LbCardHeadingProps) {
  const Tag = as ?? (level === 'hero' ? 'h1' : level === 'compact' ? 'h3' : 'h2');
  const levelClass = {
    hero: 'font-sans text-2xl font-black tracking-tight sm:text-3xl',
    panel: 'font-sans text-lg font-bold leading-snug sm:text-xl',
    compact: 'font-sans text-base font-bold leading-snug',
  }[level];

  return (
    <Tag
      className={cn('m-0 text-mar-text', levelClass, className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export type LbCardSubtitleProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

/** Secondary line under title */
export function LbCardSubtitle({ children, className, ...props }: LbCardSubtitleProps) {
  return (
    <p className={cn('m-0 text-sm leading-relaxed text-mar-muted sm:text-base', className)} {...props}>
      {children}
    </p>
  );
}

export type LbCardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

/** Body copy in header area (dek / summary) */
export function LbCardDescription({ children, className, ...props }: LbCardDescriptionProps) {
  return (
    <p
      className={cn('m-0 mt-1 text-sm leading-relaxed text-mar-muted', className)}
      {...props}
    >
      {children}
    </p>
  );
}

/* ── Icon / media ─────────────────────────────────────────────────────── */

export type LbCardIconProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: 'teal' | 'orange' | 'accent' | 'muted';
};

const iconVariants: Record<NonNullable<LbCardIconProps['variant']>, string> = {
  teal: 'bg-mar-teal/10 text-mar-teal',
  orange: 'bg-mar-orange/10 text-mar-orange',
  accent: 'bg-mar-accent/10 text-mar-accent',
  muted: 'bg-mar-beige text-mar-muted',
};

export function LbCardIcon({
  children,
  className,
  variant = 'teal',
  ...props
}: LbCardIconProps) {
  return (
    <div
      className={cn(
        'mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
        iconVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type LbCardMediaProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  aspect?: 'video' | 'square' | 'wide' | 'auto';
};

export function LbCardMedia({
  children,
  className,
  aspect = 'video',
  ...props
}: LbCardMediaProps) {
  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    auto: '',
  }[aspect];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-mar-beige',
        aspectClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Body / content / footer ────────────────────────────────────────── */

export type LbCardBodyProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

export function LbCardBody({ children, className, ...props }: LbCardBodyProps) {
  const { padding } = useLbCardContext();
  const pad =
    padding === 'none'
      ? 'px-5 py-4'
      : padding === 'sm'
        ? 'p-4 pt-3'
        : padding === 'lg'
          ? 'p-6 pt-4 sm:p-8 sm:pt-5'
          : 'p-5 pt-4';

  return (
    <div className={cn(pad, 'flex flex-1 flex-col gap-3', className)} {...props}>
      {children}
    </div>
  );
}

/** Alias for arbitrary content inside body */
export function LbCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('text-sm leading-relaxed text-mar-text', className)}>{children}</div>;
}

export type LbCardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
};

export function LbCardFooter({
  children,
  className,
  bordered = true,
  ...props
}: LbCardFooterProps) {
  const { padding } = useLbCardContext();
  const pad =
    padding === 'none'
      ? 'px-5 pb-5'
      : padding === 'sm'
        ? 'p-4 pt-0'
        : padding === 'lg'
          ? 'p-6 pt-0 sm:p-8 sm:pt-0'
          : 'p-5 pt-0';

  return (
    <footer
      className={cn(
        pad,
        bordered && 'border-t border-mar-border pt-4',
        'flex flex-wrap items-center gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

export type LbCardMetaProps = HTMLAttributes<HTMLDListElement> & {
  children: ReactNode;
  className?: string;
};

/** Footer meta row (blog-card style) */
export function LbCardMeta({ children, className, ...props }: LbCardMetaProps) {
  return (
    <dl
      className={cn(
        'm-0 flex flex-wrap gap-x-3 gap-y-1 border-t border-mar-border pt-3',
        'text-xs text-mar-meta sm:text-sm',
        className,
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

export function LbCardMetaItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-1">
      <dt className="m-0 font-semibold">{label}</dt>
      <dd className="m-0">{value}</dd>
    </div>
  );
}

/* ── Convenience: feature card (icon + title + description) ─────────── */

export type LbFeatureCardProps = {
  icon: ReactNode;
  iconVariant?: LbCardIconProps['variant'];
  title: ReactNode;
  description: ReactNode;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: LbCardVariant;
};

export function LbFeatureCard({
  icon,
  iconVariant = 'teal',
  title,
  description,
  eyebrow,
  footer,
  className,
  variant = 'default',
}: LbFeatureCardProps) {
  return (
    <LbCard variant={variant} padding="md" className={className}>
      <LbCardBody className="!p-5">
        {eyebrow ? <LbCardEyebrow className="mb-2">{eyebrow}</LbCardEyebrow> : null}
        <LbCardIcon variant={iconVariant}>{icon}</LbCardIcon>
        <LbCardTitle level="panel">{title}</LbCardTitle>
        <LbCardDescription>{description}</LbCardDescription>
        {footer ? <div className="mt-3">{footer}</div> : null}
      </LbCardBody>
    </LbCard>
  );
}

/* ── Convenience: panel card (header + body + optional footer) ────────── */

export type LbPanelCardProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: LbCardVariant;
  padding?: LbCardPadding;
};

export function LbPanelCard({
  eyebrow,
  title,
  subtitle,
  description,
  actions,
  children,
  footer,
  className,
  variant = 'default',
  padding = 'lg',
}: LbPanelCardProps) {
  return (
    <LbCard variant={variant} padding={padding} className={className}>
      <LbCardHeader bordered={Boolean(children || footer)}>
        <LbCardHeaderRow>
          <LbCardHeaderContent>
            {eyebrow ? <LbCardEyebrow>{eyebrow}</LbCardEyebrow> : null}
            <LbCardTitle level="panel">{title}</LbCardTitle>
            {subtitle ? <LbCardSubtitle>{subtitle}</LbCardSubtitle> : null}
            {description ? <LbCardDescription>{description}</LbCardDescription> : null}
          </LbCardHeaderContent>
          {actions ? <LbCardActions>{actions}</LbCardActions> : null}
        </LbCardHeaderRow>
      </LbCardHeader>
      {children ? <LbCardBody>{children}</LbCardBody> : null}
      {footer ? <LbCardFooter>{footer}</LbCardFooter> : null}
    </LbCard>
  );
}
