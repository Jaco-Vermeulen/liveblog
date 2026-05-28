import type React from 'react';
import type { ThemeStyleGroup } from '@/mechanisms/liveblog-api';
import { connectStylesOption } from './connect';
import {
  ColorPickerField,
  DropdownStyleField,
  FontPickerField,
  TextStyleField,
} from './elements/ColorPickerField';

const ConnectedText = connectStylesOption(TextStyleField);
const ConnectedColor = connectStylesOption(ColorPickerField);
const ConnectedDropdown = connectStylesOption(DropdownStyleField);
const ConnectedFont = connectStylesOption(FontPickerField, (state) => ({
  fontOptions: state.fontsOptions,
}));

const elements = {
  text: ConnectedText,
  colorpicker: ConnectedColor,
  dropdown: ConnectedDropdown,
  fontpicker: ConnectedFont,
} as const;

type StyleOptionProps = ThemeStyleGroup['options'][number] & {
  group: ThemeStyleGroup;
};

export function StyleOption(props: StyleOptionProps) {
  const Element = elements[props.type as keyof typeof elements];
  if (!Element) {
    console.warn(`Style setting option "${props.type}" not found`);
    return null;
  }
  const Connected = Element as React.ComponentType<typeof props>;
  return (
    <div className="min-w-0">
      <Connected {...props} />
    </div>
  );
}
