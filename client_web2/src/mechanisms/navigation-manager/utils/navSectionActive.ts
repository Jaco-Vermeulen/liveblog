import type { SubNavItem } from '../types';

function matchesSubItem(pathname: string, item: SubNavItem): boolean {
  if (item.end) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

/** True when the current route belongs under a drawer section (parent + sub-tabs). */
export function isNavSectionActive(
  pathname: string,
  sectionPath: string,
  subItems: SubNavItem[],
): boolean {
  if (subItems.some((item) => matchesSubItem(pathname, item))) {
    return true;
  }

  if (sectionPath === '/liveblog') {
    if (
      pathname.startsWith('/liveblog/edit/') ||
      pathname.startsWith('/liveblog/settings/') ||
      pathname.startsWith('/liveblog/analytics/')
    ) {
      return true;
    }
    return pathname === '/liveblog' || pathname.startsWith('/liveblog/');
  }

  if (sectionPath.startsWith('/settings')) {
    return pathname.startsWith('/settings');
  }

  return pathname === sectionPath || pathname.startsWith(`${sectionPath}/`);
}
