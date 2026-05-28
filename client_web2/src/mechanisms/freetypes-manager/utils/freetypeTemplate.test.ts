import { describe, expect, it } from 'vitest';
import {
  extractFreetypeFields,
  freetypeDataToPostItem,
  getPathValue,
  renderFreetypeHtml,
  setPathValue,
} from './freetypeTemplate';

describe('freetypeTemplate', () => {
  it('extracts text fields from name/text attributes', () => {
    const fields = extractFreetypeFields('<div name="$title" text="$body"></div>');
    expect(fields.map((f) => f.path).sort()).toEqual(['body', 'title']);
  });

  it('getPathValue and setPathValue handle nested paths', () => {
    let data: Record<string, unknown> = {};
    data = setPathValue(data, 'team[0].name', 'Springboks');
    expect(getPathValue(data, 'team[0].name')).toBe('Springboks');
  });

  it('renderFreetypeHtml substitutes text fields', () => {
    const html = renderFreetypeHtml('<p name="$title">$title</p>', { title: 'Hello' });
    expect(html).toContain('Hello');
    expect(html).not.toContain('$title');
  });

  it('freetypeDataToPostItem sets group_type freetype', () => {
    const item = freetypeDataToPostItem('Score', '<span name="$score"></span>', { score: '12' });
    expect(item.group_type).toBe('freetype');
    expect(item.item_type).toBe('Score');
    expect(item.meta.data).toEqual({ score: '12' });
    expect(item.text).toContain('12');
  });
});
