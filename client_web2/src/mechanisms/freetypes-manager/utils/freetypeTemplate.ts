/**
 * Freetype template parsing and HTML render (ported from legacy freetype.service.js).
 * Used by editor-manager FreetypeFields and timeline preview.
 */

const REGEX_VARIABLE = /\$([$a-z0-9_.[\]]+)/gi;

export type FreetypeFieldType = 'text' | 'select' | 'image' | 'embed' | 'link';

export interface FreetypeField {
  path: string;
  type: FreetypeFieldType;
  options?: string;
}

export function normalizeFreetypePath(path: string): string {
  return path.replace(/\[\]/g, '[0]').replace(/\[/g, '.').replace(/\]/g, '');
}

export function getPathValue(data: Record<string, unknown>, path: string): unknown {
  const parts = normalizeFreetypePath(path).split('.').filter(Boolean);
  let current: unknown = data;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function setPathValue(
  data: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const next = { ...data };
  const parts = normalizeFreetypePath(path).split('.').filter(Boolean);
  let current: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const childKey = parts[i + 1];
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = /^\d+$/.test(childKey) ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  if (parts.length) {
    current[parts[parts.length - 1]] = value;
  }
  return next;
}

function obj2path(ret: Record<string, string>, obj: Record<string, unknown>, path?: string): void {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$$')) continue;
    const gotopath = path ? `${path}.${key}` : key;
    if (Array.isArray(value)) {
      value.forEach((entry, i) => {
        if (entry && typeof entry === 'object') {
          obj2path(ret, entry as Record<string, unknown>, `${gotopath}[${i}]`);
        }
      });
    } else if (value && typeof value === 'object') {
      obj2path(ret, value as Record<string, unknown>, gotopath);
    } else if (value != null && value !== '') {
      ret[gotopath] = String(value);
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectClass(attr: string, cls: string): string {
  if (/class\s*=/i.test(attr)) {
    return attr.replace(/class\s*=\s*("|')?([^"']+)("|')?/i, `class="${cls} $2"`);
  }
  return `${attr} class="${cls}" `;
}

function addField(fields: Map<string, FreetypeField>, field: FreetypeField): void {
  if (!fields.has(field.path)) {
    fields.set(field.path, field);
  }
}

/** Extract editable fields from a freetype HTML template. */
export function extractFreetypeFields(template: string): FreetypeField[] {
  const fields = new Map<string, FreetypeField>();

  template.replace(/<([a-z][a-z0-9]*)\b([^>]*)>/gi, (_all, _tag, attrParam: string) => {
    let options: string | undefined;

    attrParam.replace(
      /(name|text)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi,
      (_m, _t, _q, rname: string) => {
        addField(fields, { path: rname, type: 'text' });
        return '';
      },
    );

    let selectName: string | undefined;
    attrParam.replace(
      /(select|dropdown)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi,
      (_m, _t, _q, rname: string) => {
        selectName = rname;
        return '';
      },
    );
    attrParam.replace(/(options)\s*=\s*("|')?([^"']+)("|')?/gi, (_m, _t, _q, roptions: string) => {
      options = roptions;
      return '';
    });
    if (selectName) {
      addField(fields, { path: selectName, type: 'select', options });
      return '';
    }

    attrParam.replace(
      /(image|graphic|rendition)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi,
      (_m, _t, _q, rname: string) => {
        addField(fields, { path: rname, type: 'image' });
        return '';
      },
    );

    attrParam.replace(
      /(link|url)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi,
      (_m, _t, _q, rname: string) => {
        addField(fields, { path: rname, type: 'link' });
        return '';
      },
    );

    attrParam.replace(
      /(embed|html)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi,
      (_m, _t, _q, rname: string) => {
        addField(fields, { path: rname, type: 'embed' });
        return '';
      },
    );

    return '';
  });

  template.replace(/<([a-z][a-z0-9]*)\b([^>]*)>(.*?)<\/\1>?/gi, (_all, _tag, _attr, content: string) => {
    const trimmed = content.trim();
    const match = trimmed.match(/^\$([$a-z0-9_.[\]]+)$/);
    if (match) {
      addField(fields, { path: match[1], type: 'text' });
    }
    return '';
  });

  return [...fields.values()];
}

/** Render freetype template HTML for timeline / live feed (legacy htmlContent). */
export function renderFreetypeHtml(templateParam: string, data: Record<string, unknown>): string {
  const paths: Record<string, string> = {};
  obj2path(paths, data);

  let wrapBefore = '';
  let wrapAfter = '';

  let template = templateParam.replace(/<li([^>]*)>((.|\n)*?)<\/li>/g, (all, attr, repeaterParam) => {
    let vectorPath: string | undefined;
    let parts: string[] = [];
    let templ = '';
    const emptyIndex: number[] = [];

    const repeater = repeaterParam.replace(REGEX_VARIABLE, (_all: string, path: string) => {
      parts = path.split(/[\d*]/);
      if (parts.length === 2 && parts[1] !== '') {
        vectorPath = parts[0].slice(0, -1);
      }
      return _all;
    });

    if (vectorPath) {
      const vector = getPathValue(data, vectorPath);
      if (!Array.isArray(vector)) return all.replace('[]', '[0]');

      for (let i = 1; i < vector.length; i++) {
        const row = vector[i] as Record<string, unknown>;
        const rowPaths: Record<string, string> = {};
        obj2path(rowPaths, row);
        const hasContent = Object.values(rowPaths).some((v) => v !== '');
        if (hasContent) {
          templ += `<li${attr}>${repeater.replace(REGEX_VARIABLE, (v: string) =>
            v.replace('[]', '[0]').replace('[0]', `[${i}]`),
          )}</li>`;
        } else {
          emptyIndex.push(i);
        }
      }

      const first = vector[0] as Record<string, unknown> | undefined;
      const firstPaths: Record<string, string> = {};
      if (first) obj2path(firstPaths, first);
      const firstHasContent = Object.values(firstPaths).some((v) => v !== '');
      if (firstHasContent) {
        return all.replace('[]', '[0]') + templ;
      }
      return '';
    }
    return all.replace('[]', '[0]');
  });

  const attributeScoop = (attrParam: string) => {
    let name: string | undefined;
    let type: FreetypeFieldType | undefined;
    let attr = attrParam.trim();
    if (attr.endsWith('/')) attr = attr.slice(0, -1);

    attr = attr.replace(/(name|text)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi, (_m, _t, _q, rname) => {
      name = rname;
      type = 'text';
      return '';
    });
    attr = attr.replace(
      /(image|graphic|rendition)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi,
      (_m, _t, _q, rname) => {
        name = `${rname}.picture_url`;
        type = 'image';
        return '';
      },
    );
    attr = attr.replace(/(wrap-link)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi, (_m, _t, _q, rname) => {
      name = rname;
      type = 'link';
      return '';
    });
    attr = attr.replace(/(embed)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi, (_m, _t, _q, rname) => {
      name = rname;
      type = 'embed';
      return '';
    });
    attr = attr.replace(/(select|dropdown)\s*=\s*("|')?\$([$a-z0-9_.[\]]+)("|')?/gi, (_m, _t, _q, rname) => {
      name = rname;
      type = 'select';
      return '';
    });

    attr = attr.replace(
      /(number|necessary|maxlength|tandem)\s*=\s*("|')?([^"']+)("|')?/gi,
      () => '',
    );

    return { name, type, attr };
  };

  template = template.replace(/<([a-z][a-z0-9]*)\b([^>]*)>(.*?)<\/\1>?/gi, (all, tag, attrParam, content) => {
    const trimmed = content.trim();
    const varMatch = trimmed.match(/^\$([$a-z0-9_.[\]]+)$/);
    if (varMatch) {
      const name = varMatch[1];
      const value = paths[name];
      const attr = attrParam.trim();
      return value
        ? `<${tag}${attr ? ` ${attr}` : ''}>${escapeHtml(value)}</${tag}>`
        : `<${tag}${attr ? ` ${attr}` : ''}></${tag}>`;
    }
    return all;
  });

  template = template.replace(/<([a-z][a-z0-9]*)\b([^>]*)>/gi, (all, _tag, attrParam) => {
    const { name, type, attr } = attributeScoop(attrParam);
    if (!name || !type) return all;

    switch (type) {
      case 'select':
      case 'text':
        return paths[name]
          ? `<span ${injectClass(attr, 'freetype--element')}>${escapeHtml(paths[name])}</span>`
          : `<span ${injectClass(attr, 'freetype--empty')}></span>`;
      case 'image':
        return paths[name]
          ? `<img src="${escapeHtml(paths[name])}" alt=""/>`
          : `<span ${injectClass(attr, 'freetype--empty')}></span>`;
      case 'embed':
        return paths[name] ? paths[name] : `<span ${injectClass(attr, 'freetype--empty')}></span>`;
      case 'link':
        if (paths[name]) {
          wrapBefore = `<a href="${escapeHtml(paths[name])}" ${injectClass(attr, 'freetype--wrap')} target="_blank" rel="noopener noreferrer">`;
          wrapAfter = '</a>';
        }
        return '';
      default:
        return all;
    }
  });

  template = template.replace(/@([a-z0-9_.[\]-]+)\?\s*([a-z0-9_.[\]]+)/gi, (all, str, name) => {
    if (str.includes('media')) return all;
    return paths[name] || paths[`${name}.picture_url`] ? str : '';
  });

  template = template.replace(/@([a-z0-9_.[\]-]+):\s*([a-z0-9_.[\]]+)/gi, (all, str, nameParam) => {
    if (str.includes('media')) return all;
    let name = nameParam;
    let prefix = '';
    let suffix = '';
    if (str === 'background-image') {
      name = `${nameParam}.picture_url`;
      prefix = 'url(';
      suffix = ')';
    }
    return paths[name] ? `${str}:${prefix}${paths[name]}${suffix}` : '';
  });

  template = template.replace(/@([a-z0-9_.[\]-]+)/gi, (all, name) => {
    if (all.includes('media')) return all;
    return paths[name] ?? '';
  });

  template = template.replace(/<([a-z][a-z0-9]*)\b[^>]*hide-render[^>]*>[\s\S]*?<\/\1>/gi, '');
  template = template.replace(/<([a-z][a-z0-9]*)\b[^>]*hide-render[^>]*\/?>/gi, '');

  return wrapBefore + template + wrapAfter;
}

export function freetypeDataToPostItem(
  freetypeName: string,
  template: string,
  data: Record<string, unknown>,
): { item_type: string; group_type: string; text: string; meta: { data: Record<string, unknown> } } {
  return {
    item_type: freetypeName,
    group_type: 'freetype',
    text: renderFreetypeHtml(template, data),
    meta: { data },
  };
}
