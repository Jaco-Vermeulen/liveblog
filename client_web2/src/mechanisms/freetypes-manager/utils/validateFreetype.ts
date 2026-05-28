import type { Freetype } from '@/mechanisms/liveblog-api';

export const FREETYPE_VARIABLE_PATTERN = /\$([$a-z0-9_.[\]]+)/gi;

export function validateFreetypeTemplate(template: string): {
  valid: boolean;
  error?: 'missing_variable';
} {
  FREETYPE_VARIABLE_PATTERN.lastIndex = 0;
  if (!FREETYPE_VARIABLE_PATTERN.test(template)) {
    return { valid: false, error: 'missing_variable' };
  }
  return { valid: true };
}

export function validateFreetypeName(
  name: string,
  freetypes: Freetype[],
  editingId?: string,
): boolean {
  return !freetypes.some(
    (ft) => ft.name === name && (!editingId || ft._id !== editingId),
  );
}
