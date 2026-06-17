import { getPathValue } from '@/mechanisms/freetypes-manager';
import { scorecardPresetFor } from './scorecardPresets';
import type { ScorecardBattingSide, ScorecardTeamSideDisplay } from './scorecardDisplay';
import {
  ensureCustomLists,
  migrateLegacyBodyToLists,
  syncListColumnIds,
} from './scorecardCustomLists';
import type {
  ScorecardBody,
  ScorecardCustomList,
  ScorecardListColumn,
  ScorecardListPlacement,
  ScorecardListRow,
  ScorecardPlayerRow,
  ScorecardScorer,
  ScorecardSections,
  ScorecardTeam,
  ScorecardTeamExtra,
  ScorecardVariant,
} from './scorecardTypes';
import {
  defaultScorecardBody,
  defaultSectionsForVariant,
  emptyBowlers,
  emptyExtras,
  emptyScorers,
  emptyTeam,
} from './scorecardTypes';

function readScorers(raw: unknown): ScorecardScorer[] {
  const scorers: ScorecardScorer[] = [];
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      scorers.push({
        name: String(r.name ?? '').trim(),
        minute: String(r.time ?? r.minute ?? '').trim(),
        stat: String(r.stat ?? r.runs ?? '').trim(),
      });
    }
  }
  return scorers.length ? scorers : emptyScorers();
}

function readBowlers(raw: unknown): ScorecardPlayerRow[] {
  const bowlers: ScorecardPlayerRow[] = [];
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      bowlers.push({
        name: String(r.name ?? '').trim(),
        figures: String(r.figures ?? r.stats ?? '').trim(),
      });
    }
  }
  return bowlers.length ? bowlers : emptyBowlers();
}

function readExtras(raw: unknown): ScorecardTeamExtra[] {
  const extras: ScorecardTeamExtra[] = [];
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const label = String(r.label ?? '').trim();
      const value = String(r.value ?? '').trim();
      if (label || value) extras.push({ label, value });
    }
  }
  return extras;
}

function readTeam(prefix: 'home' | 'away', data: Record<string, unknown>): ScorecardTeam {
  const logo =
    String(getPathValue(data, `${prefix}.img1.picture_url`) ?? '').trim() ||
    String(getPathValue(data, `${prefix}.img1`) ?? '').trim();

  return {
    name: String(getPathValue(data, `${prefix}.name`) ?? '').trim(),
    score: String(getPathValue(data, `${prefix}.score`) ?? '').trim(),
    logoUrl: logo,
    scorers: readScorers(getPathValue(data, `${prefix}.scorers`)),
    bowlers: readBowlers(getPathValue(data, `${prefix}.bowlers`)),
    extras: readExtras(getPathValue(data, `${prefix}.extras`)),
  };
}

function readVariant(raw: unknown): ScorecardVariant {
  const v = String(raw ?? '').trim();
  if (v === 'cricket' || v === 'custom' || v === 'rugby') return v;
  return 'custom';
}

function readBattingSide(raw: unknown): ScorecardBattingSide {
  return String(raw ?? '').trim() === 'away' ? 'away' : 'home';
}

function readSections(data: Record<string, unknown>, variant: ScorecardVariant): ScorecardSections {
  const raw = getPathValue(data, 'match.sections');
  if (raw && typeof raw === 'object') {
    const s = raw as Record<string, unknown>;
    return {
      teamStats: Boolean(s.team_stats ?? s.teamStats),
      primaryPlayers: s.primary_players !== false && s.primaryPlayers !== false,
      secondaryPlayers: Boolean(s.secondary_players ?? s.secondaryPlayers),
    };
  }
  return defaultSectionsForVariant(variant);
}

function readSideDisplay(raw: unknown): ScorecardTeamSideDisplay {
  const v = String(raw ?? '').trim();
  if (v === 'batters' || v === 'bowlers' || v === 'both' || v === 'none') return v;
  return 'auto';
}

function readPlacement(raw: unknown): ScorecardListPlacement {
  const v = String(raw ?? '').trim();
  if (v === 'team-inline' || v === 'full') return v;
  return 'panel';
}

function readColumns(raw: unknown): ScorecardListColumn[] {
  const columns: ScorecardListColumn[] = [];
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      columns.push({
        id: String(r.id ?? '').trim() || `col-${columns.length}`,
        label: String(r.label ?? '').trim(),
      });
    }
  }
  return columns.length ? columns : [{ id: 'field1', label: 'Veld 1' }];
}

function readListRows(raw: unknown, columns: ScorecardListColumn[]): ScorecardListRow[] {
  const rows: ScorecardListRow[] = [];
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const valuesRaw = r.values && typeof r.values === 'object' ? (r.values as Record<string, unknown>) : r;
      const values: Record<string, string> = {};
      for (const col of columns) {
        values[col.id] = String(valuesRaw[col.id] ?? '').trim();
      }
      rows.push({ values });
    }
  }
  return rows;
}

function readCustomLists(data: Record<string, unknown>): ScorecardCustomList[] {
  const raw = getPathValue(data, 'match.lists');
  if (!Array.isArray(raw)) return [];

  const lists: ScorecardCustomList[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const columns = readColumns(o.columns);
    lists.push(
      syncListColumnIds({
        id: String(o.id ?? '').trim() || `list-${lists.length}`,
        heading: String(o.heading ?? '').trim(),
        placement: readPlacement(o.placement),
        columns,
        homeRows: readListRows(o.home_rows ?? o.homeRows, columns),
        awayRows: readListRows(o.away_rows ?? o.awayRows, columns),
        rows: readListRows(o.rows, columns),
      }),
    );
  }
  return lists;
}

function listToFreetype(list: ScorecardCustomList): Record<string, unknown> {
  return {
    id: list.id,
    heading: list.heading,
    placement: list.placement,
    columns: list.columns.map((c) => ({ id: c.id, label: c.label })),
    home_rows: list.homeRows.map((row) => ({ values: row.values })),
    away_rows: list.awayRows.map((row) => ({ values: row.values })),
    rows: list.rows.map((row) => ({ values: row.values })),
  };
}

export function freetypeDataToScorecardBody(data: Record<string, unknown>): ScorecardBody {
  const bg =
    String(getPathValue(data, 'background.img.picture_url') ?? '').trim() ||
    String(getPathValue(data, 'background.img') ?? '').trim();

  const variant = readVariant(getPathValue(data, 'match.variant'));
  const preset = scorecardPresetFor(variant);
  const customLists = readCustomLists(data);

  const body: ScorecardBody = {
    variant,
    customLists,
    sections: readSections(data, variant),
    scorersLabel:
      String(getPathValue(data, 'match.scorers_label') ?? '').trim() || preset.scorersLabel,
    bowlersLabel:
      String(getPathValue(data, 'match.bowlers_label') ?? '').trim() || preset.bowlersLabel,
    scorerDetailLabel:
      String(getPathValue(data, 'match.scorer_detail_label') ?? '').trim() || preset.scorerDetailLabel,
    battingSide: readBattingSide(getPathValue(data, 'match.batting_side')),
    currentOver: String(getPathValue(data, 'match.current_over') ?? '').trim(),
    homeSideDisplay: readSideDisplay(getPathValue(data, 'match.home_side_display')),
    awaySideDisplay: readSideDisplay(getPathValue(data, 'match.away_side_display')),
    home: readTeam('home', data),
    away: readTeam('away', data),
    matchQuarters: String(getPathValue(data, 'match.quaters') ?? '').trim(),
    matchInfo: String(getPathValue(data, 'match.info') ?? '').trim(),
    backgroundUrl: bg,
  };

  if (!body.customLists.length) {
    body.customLists = migrateLegacyBodyToLists(body);
  }

  return body;
}

function teamToFreetype(team: ScorecardTeam): Record<string, unknown> {
  return {
    name: team.name,
    score: team.score,
    img1: team.logoUrl ? { picture_url: team.logoUrl } : {},
  };
}

export function scorecardBodyToFreetypeData(body: ScorecardBody): Record<string, unknown> {
  const lists = ensureCustomLists(body);
  return {
    home: teamToFreetype(body.home),
    away: teamToFreetype(body.away),
    match: {
      variant: body.variant,
      lists: lists.map(listToFreetype),
      batting_side: body.battingSide,
      current_over: body.currentOver,
      quaters: body.matchQuarters,
      info: body.matchInfo,
    },
    background: body.backgroundUrl ? { img: { picture_url: body.backgroundUrl } } : { img: {} },
  };
}

export function isScorecardBodyEmpty(body: ScorecardBody): boolean {
  const hasHome = Boolean(body.home.name.trim() || body.home.score.trim());
  const hasAway = Boolean(body.away.name.trim() || body.away.score.trim());
  const hasMeta = Boolean(body.matchQuarters.trim() || body.matchInfo.trim() || body.currentOver.trim());
  const hasLists = ensureCustomLists(body).some((list) =>
    list.placement === 'full'
      ? list.rows.some((row) => Object.values(row.values).some((v) => v.trim()))
      : list.homeRows.some((row) => Object.values(row.values).some((v) => v.trim())) ||
        list.awayRows.some((row) => Object.values(row.values).some((v) => v.trim())),
  );
  return !hasHome && !hasAway && !hasMeta && !hasLists;
}

export function normalizeScorecardBody(raw: unknown): ScorecardBody {
  if (!raw || typeof raw !== 'object') return defaultScorecardBody();
  const o = raw as Record<string, unknown>;
  if ('home' in o && typeof o.home === 'object') {
    const base = defaultScorecardBody();
    const home = { ...emptyTeam(), ...(o.home as ScorecardTeam) };
    const away = { ...emptyTeam(), ...(o.away as ScorecardTeam) };
    const body: ScorecardBody = {
      ...base,
      ...o,
      home: {
        ...home,
        scorers: home.scorers?.length ? home.scorers : emptyScorers(),
        bowlers: home.bowlers?.length ? home.bowlers : emptyBowlers(),
        extras: home.extras ?? emptyExtras(),
      },
      away: {
        ...away,
        scorers: away.scorers?.length ? away.scorers : emptyScorers(),
        bowlers: away.bowlers?.length ? away.bowlers : emptyBowlers(),
        extras: away.extras ?? emptyExtras(),
      },
      variant: readVariant(o.variant),
      customLists: Array.isArray(o.customLists)
        ? (o.customLists as ScorecardCustomList[]).map(syncListColumnIds)
        : [],
      sections:
        o.sections && typeof o.sections === 'object'
          ? (o.sections as ScorecardSections)
          : defaultSectionsForVariant(readVariant(o.variant)),
      scorersLabel: String(o.scorersLabel ?? base.scorersLabel),
      bowlersLabel: String(o.bowlersLabel ?? base.bowlersLabel),
      scorerDetailLabel: String(o.scorerDetailLabel ?? base.scorerDetailLabel),
      battingSide: readBattingSide(o.battingSide),
      currentOver: String(o.currentOver ?? ''),
      homeSideDisplay: readSideDisplay(o.homeSideDisplay),
      awaySideDisplay: readSideDisplay(o.awaySideDisplay),
      matchQuarters: String(o.matchQuarters ?? ''),
      matchInfo: String(o.matchInfo ?? ''),
      backgroundUrl: String(o.backgroundUrl ?? ''),
    };
    if (!body.customLists.length) {
      body.customLists = migrateLegacyBodyToLists(body);
    }
    return body;
  }
  return freetypeDataToScorecardBody(o);
}
