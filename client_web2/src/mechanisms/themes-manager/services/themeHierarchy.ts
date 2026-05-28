import type { Theme } from '@/mechanisms/liveblog-api';

/** Nested theme name → children map (legacy hierarchy). */
export type ThemeHierarchy = Record<string, Record<string, unknown>>;

/**
 * Build a nested map of theme name → children (legacy getHierachyFromThemesCollection).
 */
export function getHierarchyFromThemes(themes: Theme[]): ThemeHierarchy {
  const todo: Array<[string, string]> = [];
  const hierarchy: ThemeHierarchy = {};

  function getParentNode(
    name: string,
    collection: ThemeHierarchy = hierarchy,
  ): Record<string, unknown> | undefined {
    for (const key of Object.keys(collection)) {
      if (key === name) {
        return collection[key];
      }
      const child = collection[key];
      if (child && typeof child === 'object') {
        const found = getParentNode(name, child as ThemeHierarchy);
        if (found) return found;
      }
    }
    return undefined;
  }

  function addToHierarchy(name: string, extend?: string) {
    if (extend) {
      const parentNode = getParentNode(extend);
      const index = todo.findIndex(([n]) => n === name);
      if (parentNode) {
        if (index > -1) todo.splice(index, 1);
        parentNode[name] = {};
      } else if (index === -1) {
        todo.push([name, extend]);
      }
    } else if (!hierarchy[name]) {
      hierarchy[name] = {};
    }
  }

  for (const theme of themes) {
    addToHierarchy(theme.name, theme.extends);
  }

  let maxLoops = todo.length * todo.length;
  while (todo.length > 0 && maxLoops > 0) {
    for (const [name, extend] of [...todo]) {
      addToHierarchy(name, extend);
    }
    maxLoops -= 1;
  }

  return hierarchy;
}

/** Flatten hierarchy keys in depth-first order for display grouping. */
export function flattenHierarchyKeys(
  node: ThemeHierarchy,
  prefix = '',
): string[] {
  const keys: string[] = [];
  for (const name of Object.keys(node).sort()) {
    keys.push(prefix ? `${prefix} › ${name}` : name);
    const child = node[name];
    if (child && Object.keys(child).length > 0) {
      keys.push(
        ...flattenHierarchyKeys(child as ThemeHierarchy, prefix ? `${prefix} › ${name}` : name),
      );
    }
  }
  return keys;
}
