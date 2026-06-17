import type {
  ScorecardBody,
  ScorecardCustomList,
  ScorecardListColumn,
  ScorecardListPlacement,
  ScorecardListRow,
  ScorecardTeam,
  ScorecardVariant,
} from './scorecardTypes';

export function scorecardNewId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyListRow(columns: ScorecardListColumn[]): ScorecardListRow {
  const values: Record<string, string> = {};
  for (const col of columns) values[col.id] = '';
  return { values };
}

export function emptyCustomList(heading = 'Nuwe lys'): ScorecardCustomList {
  const columns: ScorecardListColumn[] = [
    { id: scorecardNewId(), label: 'Veld 1' },
    { id: scorecardNewId(), label: 'Veld 2' },
  ];
  const row = emptyListRow(columns);
  return {
    id: scorecardNewId(),
    heading,
    placement: 'panel',
    columns,
    homeRows: [row],
    awayRows: [{ ...row, values: { ...row.values } }],
    rows: [],
  };
}

export function rugbyStarterLists(): ScorecardCustomList[] {
  const minuteCol: ScorecardListColumn = { id: 'minute', label: 'Min.' };
  const nameCol: ScorecardListColumn = { id: 'name', label: 'Speler' };
  const columns = [minuteCol, nameCol];
  const blank = emptyListRow(columns);
  return [
    {
      id: 'scorers',
      heading: 'Doelskoppe',
      placement: 'panel',
      columns,
      homeRows: [blank],
      awayRows: [{ values: { minute: '', name: '' } }],
      rows: [],
    },
  ];
}

export function cricketStarterLists(): ScorecardCustomList[] {
  const runsCol: ScorecardListColumn = { id: 'stat', label: 'Lopies' };
  const oversCol: ScorecardListColumn = { id: 'minute', label: 'O.' };
  const nameCol: ScorecardListColumn = { id: 'name', label: 'Kolwer' };
  const batCols = [runsCol, oversCol, nameCol];
  const bowlCols: ScorecardListColumn[] = [
    { id: 'figures', label: 'Syfers' },
    { id: 'name', label: 'Bouler' },
  ];
  return [
    {
      id: 'batters',
      heading: 'Kolwers',
      placement: 'panel',
      columns: batCols,
      homeRows: [emptyListRow(batCols)],
      awayRows: [emptyListRow(batCols)],
      rows: [],
    },
    {
      id: 'bowlers',
      heading: 'Boulers',
      placement: 'panel',
      columns: bowlCols,
      homeRows: [emptyListRow(bowlCols)],
      awayRows: [emptyListRow(bowlCols)],
      rows: [],
    },
    {
      id: 'team-stats',
      heading: '',
      placement: 'team-inline',
      columns: [
        { id: 'label', label: 'Etiket' },
        { id: 'value', label: 'Waarde' },
      ],
      homeRows: [emptyListRow([{ id: 'label', label: '' }, { id: 'value', label: '' }])],
      awayRows: [emptyListRow([{ id: 'label', label: '' }, { id: 'value', label: '' }])],
      rows: [],
    },
  ];
}

export function starterListsForVariant(variant: ScorecardVariant): ScorecardCustomList[] {
  if (variant === 'cricket') return cricketStarterLists();
  if (variant === 'custom') return [];
  return rugbyStarterLists();
}

function rowHasData(row: ScorecardListRow, columns: ScorecardListColumn[]): boolean {
  return columns.some((col) => (row.values[col.id] ?? '').trim() !== '');
}

export function listRowHasData(list: ScorecardCustomList, row: ScorecardListRow): boolean {
  return rowHasData(row, list.columns);
}

export function listHasData(list: ScorecardCustomList): boolean {
  if (list.placement === 'full') {
    return list.rows.some((row) => listRowHasData(list, row));
  }
  const home = list.homeRows.some((row) => listRowHasData(list, row));
  const away = list.awayRows.some((row) => listRowHasData(list, row));
  return home || away;
}

export function listsForPlacement(lists: ScorecardCustomList[], placement: ScorecardListPlacement): ScorecardCustomList[] {
  return lists.filter((list) => list.placement === placement);
}

function scorersToList(
  heading: string,
  detailLabel: string,
  home: ScorecardTeam,
  away: ScorecardTeam,
  includeStat: boolean,
): ScorecardCustomList {
  const columns: ScorecardListColumn[] = [];
  if (includeStat) columns.push({ id: 'stat', label: 'Stat.' });
  columns.push({ id: 'minute', label: detailLabel || 'Min.' });
  columns.push({ id: 'name', label: 'Speler' });

  const toRow = (s: { name: string; minute: string; stat: string }): ScorecardListRow => ({
    values: {
      ...(includeStat ? { stat: s.stat } : {}),
      minute: s.minute,
      name: s.name,
    },
  });

  const homeRows = home.scorers.length ? home.scorers.map(toRow) : [emptyListRow(columns)];
  const awayRows = away.scorers.length ? away.scorers.map(toRow) : [emptyListRow(columns)];

  return {
    id: 'scorers',
    heading,
    placement: 'panel',
    columns,
    homeRows,
    awayRows,
    rows: [],
  };
}

function bowlersToList(heading: string, home: ScorecardTeam, away: ScorecardTeam): ScorecardCustomList {
  const columns: ScorecardListColumn[] = [
    { id: 'figures', label: 'Detail' },
    { id: 'name', label: 'Speler' },
  ];
  const toRow = (b: { name: string; figures: string }): ScorecardListRow => ({
    values: { figures: b.figures, name: b.name },
  });
  return {
    id: 'bowlers',
    heading,
    placement: 'panel',
    columns,
    homeRows: home.bowlers.length ? home.bowlers.map(toRow) : [emptyListRow(columns)],
    awayRows: away.bowlers.length ? away.bowlers.map(toRow) : [emptyListRow(columns)],
    rows: [],
  };
}

function extrasToList(home: ScorecardTeam, away: ScorecardTeam): ScorecardCustomList {
  const columns: ScorecardListColumn[] = [
    { id: 'label', label: 'Etiket' },
    { id: 'value', label: 'Waarde' },
  ];
  const toRow = (e: { label: string; value: string }): ScorecardListRow => ({
    values: { label: e.label, value: e.value },
  });
  return {
    id: 'team-stats',
    heading: '',
    placement: 'team-inline',
    columns,
    homeRows: home.extras.length ? home.extras.map(toRow) : [emptyListRow(columns)],
    awayRows: away.extras.length ? away.extras.map(toRow) : [emptyListRow(columns)],
    rows: [],
  };
}

/** Build custom lists from legacy fixed fields when no lists are stored yet. */
export function migrateLegacyBodyToLists(body: ScorecardBody): ScorecardCustomList[] {
  const lists: ScorecardCustomList[] = [];
  const includeStat =
    body.variant === 'cricket' ||
    body.home.scorers.some((s) => s.stat.trim()) ||
    body.away.scorers.some((s) => s.stat.trim());

  if (body.sections?.teamStats) {
    lists.push(extrasToList(body.home, body.away));
  }
  if (body.sections?.primaryPlayers !== false) {
    lists.push(
      scorersToList(
        body.scorersLabel || 'Spelers',
        body.scorerDetailLabel,
        body.home,
        body.away,
        includeStat,
      ),
    );
  }
  if (body.sections?.secondaryPlayers) {
    lists.push(bowlersToList(body.bowlersLabel || 'Bykomende spelers', body.home, body.away));
  }
  return lists.length ? lists : rugbyStarterLists();
}

export function ensureCustomLists(body: ScorecardBody): ScorecardCustomList[] {
  if (body.customLists?.length) return body.customLists;
  return migrateLegacyBodyToLists(body);
}

export function syncListColumnIds(list: ScorecardCustomList): ScorecardCustomList {
  const colIds = new Set(list.columns.map((c) => c.id));
  const normalizeRows = (rows: ScorecardListRow[]) =>
    rows.map((row) => {
      const values: Record<string, string> = {};
      for (const col of list.columns) values[col.id] = row.values[col.id] ?? '';
      return { values };
    });

  return {
    ...list,
    homeRows: normalizeRows(list.homeRows),
    awayRows: normalizeRows(list.awayRows),
    rows: normalizeRows(list.rows),
    columns: list.columns.map((c) => ({ ...c, id: c.id || scorecardNewId() })).filter((c) => c.id),
  };
}

export function bodyHasCustomListData(body: ScorecardBody): boolean {
  return ensureCustomLists(body).some(listHasData);
}

export function addColumnToList(list: ScorecardCustomList, label = 'Nuwe kolom'): ScorecardCustomList {
  const col: ScorecardListColumn = { id: scorecardNewId(), label };
  const append = (rows: ScorecardListRow[]) =>
    rows.map((row) => ({ values: { ...row.values, [col.id]: '' } }));
  return syncListColumnIds({
    ...list,
    columns: [...list.columns, col],
    homeRows: append(list.homeRows),
    awayRows: append(list.awayRows),
    rows: append(list.rows),
  });
}

export function removeColumnFromList(list: ScorecardCustomList, columnId: string): ScorecardCustomList {
  if (list.columns.length <= 1) return list;
  const strip = (rows: ScorecardListRow[]) =>
    rows.map((row) => {
      const values = { ...row.values };
      delete values[columnId];
      return { values };
    });
  return syncListColumnIds({
    ...list,
    columns: list.columns.filter((c) => c.id !== columnId),
    homeRows: strip(list.homeRows),
    awayRows: strip(list.awayRows),
    rows: strip(list.rows),
  });
}

export function updateListColumnLabel(
  list: ScorecardCustomList,
  columnId: string,
  label: string,
): ScorecardCustomList {
  return {
    ...list,
    columns: list.columns.map((c) => (c.id === columnId ? { ...c, label } : c)),
  };
}
