export function uniqueNameInItems<T extends { name: string; _id?: string }>(
  name: string,
  items: T[],
  editingId?: string,
): boolean {
  return !items.some((item) => item.name === name && item._id !== editingId);
}
