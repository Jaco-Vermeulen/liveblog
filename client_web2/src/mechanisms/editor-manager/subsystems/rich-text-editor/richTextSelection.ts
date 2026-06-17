function findAnchorAncestor(node: Node | null, root: HTMLElement): HTMLAnchorElement | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (current.nodeType === Node.ELEMENT_NODE && (current as HTMLElement).tagName === 'A') {
      return current as HTMLAnchorElement;
    }
    current = current.parentNode;
  }
  return null;
}

/** True when the caret or non-collapsed selection touches an anchor inside the editor. */
export function isSelectionInLink(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  if (findAnchorAncestor(range.startContainer, root)) return true;
  if (findAnchorAncestor(range.endContainer, root)) return true;

  const fragment = range.cloneContents();
  return fragment.querySelector('a') != null;
}
