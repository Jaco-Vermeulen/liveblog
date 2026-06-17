import type { ScorecardCustomList, ScorecardListColumn, ScorecardListRow } from './scorecardTypes';
import { listHasData, listRowHasData } from './scorecardCustomLists';

export function escapeScorecardHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function visibleRows(list: ScorecardCustomList, rows: ScorecardListRow[]): ScorecardListRow[] {
  return rows.filter((row) => listRowHasData(list, row));
}

function renderInlineExtrasRow(row: ScorecardListRow, p: string): string {
  const label = row.values.label?.trim() || '—';
  const value = row.values.value?.trim() || '—';
  return (
    `<li><span class="${p}__extra-label">${escapeScorecardHtml(label)}</span>` +
    `<span class="${p}__extra-value">${escapeScorecardHtml(value)}</span></li>`
  );
}

function renderDataRow(
  row: ScorecardListRow,
  columns: ScorecardListColumn[],
  side: 'home' | 'away' | 'full',
  p: string,
): string {
  const cells = columns
    .map((col, index) => {
      const raw = row.values[col.id]?.trim() || '–';
      const isLast = index === columns.length - 1;
      const cls = isLast ? `${p}__scorer-name` : `${p}__scorer-min`;
      return `<span class="${cls}">${escapeScorecardHtml(raw)}</span>`;
    })
    .join('');
  const sideAttr = side === 'full' ? '' : ` data-side="${side}"`;
  return `<li${sideAttr}>${cells}</li>`;
}

export function renderInlineListHtml(list: ScorecardCustomList, side: 'home' | 'away', p: string): string {
  const rows = side === 'home' ? list.homeRows : list.awayRows;
  const visible = visibleRows(list, rows);
  if (!visible.length) return '';

  if (list.columns.length === 2 && list.columns[0]?.id === 'label' && list.columns[1]?.id === 'value') {
    const items = visible.map((row) => renderInlineExtrasRow(row, p)).join('');
    return `<ul class="${p}__team-extras">${items}</ul>`;
  }

  const items = visible.map((row) => renderDataRow(row, list.columns, side, p)).join('');
  return `<ul class="${p}__scorer-list" data-side="${side}">${items}</ul>`;
}

export function renderPanelListHtml(list: ScorecardCustomList, p: string): string {
  if (!listHasData(list)) return '';

  if (list.placement === 'full') {
    const visible = visibleRows(list, list.rows);
    if (!visible.length) return '';
    const items = visible.map((row) => renderDataRow(row, list.columns, 'full', p)).join('');
    const heading = list.heading.trim()
      ? `<p class="${p}__scorers-heading">${escapeScorecardHtml(list.heading)}</p>`
      : '';
    return (
      `<div class="${p}__scorers-panel ${p}__scorers-panel--full">` +
      heading +
      `<ul class="${p}__scorer-list" data-scope="full">${items}</ul></div>`
    );
  }

  const homeVisible = visibleRows(list, list.homeRows);
  const awayVisible = visibleRows(list, list.awayRows);
  if (!homeVisible.length && !awayVisible.length) return '';

  const homeList = homeVisible.length
    ? `<ul class="${p}__scorer-list" data-side="home">${homeVisible.map((row) => renderDataRow(row, list.columns, 'home', p)).join('')}</ul>`
    : '';
  const awayList = awayVisible.length
    ? `<ul class="${p}__scorer-list" data-side="away">${awayVisible.map((row) => renderDataRow(row, list.columns, 'away', p)).join('')}</ul>`
    : '';
  const heading = list.heading.trim()
    ? `<p class="${p}__scorers-heading">${escapeScorecardHtml(list.heading)}</p>`
    : '';

  return (
    `<div class="${p}__scorers-panel">` +
    heading +
    `<div class="${p}__scorers-row">${homeList}${awayList}</div></div>`
  );
}

export function renderAllCustomListsHtml(lists: ScorecardCustomList[], p: string): string {
  return lists
    .filter((list) => list.placement === 'panel' || list.placement === 'full')
    .map((list) => renderPanelListHtml(list, p))
    .join('');
}
