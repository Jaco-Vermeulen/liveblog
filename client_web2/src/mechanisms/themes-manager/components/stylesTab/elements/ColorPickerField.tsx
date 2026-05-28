import type { StyleOptionProps } from '../types';

const fieldClass =
  'w-full rounded border border-mar-border bg-mar-input px-2 py-1.5 text-sm text-mar-text';

export function ColorPickerField(props: StyleOptionProps) {
  const propertyName = props.property as string;
  const value = typeof props.value === 'string' ? props.value : '#000000';

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-mar-muted" htmlFor={propertyName}>
        {props.label}
      </label>
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs text-mar-text">{value}</span>
        <input
          id={propertyName}
          type="color"
          className="h-9 w-12 cursor-pointer rounded border border-mar-border bg-transparent p-0"
          value={value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </div>
      {props.help && <p className="m-0 text-xs text-mar-muted">{props.help}</p>}
    </div>
  );
}

export function TextStyleField(props: StyleOptionProps) {
  const propertyName = props.property as string;

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-mar-muted" htmlFor={propertyName}>
        {props.label}
      </label>
      <input
        id={propertyName}
        type="text"
        className={fieldClass}
        value={typeof props.value === 'string' ? props.value : ''}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.help && <p className="m-0 text-xs text-mar-muted">{props.help}</p>}
    </div>
  );
}

export function DropdownStyleField(props: StyleOptionProps) {
  const propertyName = props.property as string;
  const current =
    props.value !== undefined && props.value !== null
      ? String(props.value)
      : props.default !== undefined
        ? String(props.default)
        : '';

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-mar-muted" htmlFor={propertyName}>
        {props.label}
      </label>
      <select
        id={propertyName}
        className={fieldClass}
        value={current}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {props.help && <p className="m-0 text-xs text-mar-muted">{props.help}</p>}
    </div>
  );
}

export function FontPickerField(props: StyleOptionProps & { fontOptions?: { value: string; label: string }[] }) {
  const propertyName = props.property as string;
  const fonts = props.fontOptions ?? [];
  const current = typeof props.value === 'string' ? props.value : '';

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-mar-muted" htmlFor={propertyName}>
        {props.label}
      </label>
      <select
        id={propertyName}
        className={fieldClass}
        value={current}
        onChange={(e) => props.onChange(e.target.value)}
      >
        <option value="">—</option>
        {fonts.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      {props.help && <p className="m-0 text-xs text-mar-muted">{props.help}</p>}
    </div>
  );
}
