import type { ThemeStyleGroup } from '@/mechanisms/liveblog-api';
import { StyleOption } from './StyleOption';

type StyleGroupProps = {
  group: ThemeStyleGroup;
};

function columnClass(columns: string): string {
  const n = Number.parseInt(columns, 10);
  if (n >= 3) return 'sm:grid-cols-2 lg:grid-cols-3';
  if (n === 2) return 'sm:grid-cols-2';
  return 'grid-cols-1';
}

export function StyleGroup({ group }: StyleGroupProps) {
  return (
    <section className="space-y-3 border-b border-mar-border pb-6 last:border-0">
      <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-mar-text">{group.label}</h3>
      <div className={`grid gap-4 ${columnClass(group.columns)}`}>
        {group.options.map((option, idx) => (
          <StyleOption key={`${group.name}-${option.property}-${idx}`} {...option} group={group} />
        ))}
      </div>
    </section>
  );
}
