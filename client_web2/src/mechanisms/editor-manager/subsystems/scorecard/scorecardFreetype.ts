import { getPathValue } from '@/mechanisms/freetypes-manager';
import { scorecardPresetFor } from './scorecardPresets';
import type { ScorecardBattingSide, ScorecardTeamSideDisplay } from './scorecardDisplay';
import type {
  ScorecardBody,
  ScorecardPlayerRow,
  ScorecardScorer,
  ScorecardTeam,
  ScorecardTeamExtra,
  ScorecardVariant,
} from './scorecardTypes';
import {
  defaultScorecardBody,
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
  return 'rugby';
}

function readBattingSide(raw: unknown): ScorecardBattingSide {
  return String(raw ?? '').trim() === 'away' ? 'away' : 'home';
}

function readSideDisplay(raw: unknown): ScorecardTeamSideDisplay {
  const v = String(raw ?? '').trim();
  if (v === 'batters' || v === 'bowlers' || v === 'both' || v === 'none') return v;
  return 'auto';
}

export function freetypeDataToScorecardBody(data: Record<string, unknown>): ScorecardBody {
  const bg =
    String(getPathValue(data, 'background.img.picture_url') ?? '').trim() ||
    String(getPathValue(data, 'background.img') ?? '').trim();

  const variant = readVariant(getPathValue(data, 'match.variant'));
  const preset = scorecardPresetFor(variant);

  return {
    variant,
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
}

function teamToFreetype(team: ScorecardTeam): Record<string, unknown> {
  return {
    name: team.name,
    score: team.score,
    img1: team.logoUrl ? { picture_url: team.logoUrl } : {},
    scorers: team.scorers.map((s) => ({
      name: s.name,
      time: s.minute,
      stat: s.stat,
    })),
    bowlers: team.bowlers.map((b) => ({
      name: b.name,
      figures: b.figures,
    })),
    extras: team.extras.map((e) => ({ label: e.label, value: e.value })),
  };
}

export function scorecardBodyToFreetypeData(body: ScorecardBody): Record<string, unknown> {
  return {
    home: teamToFreetype(body.home),
    away: teamToFreetype(body.away),
    match: {
      variant: body.variant,
      scorers_label: body.scorersLabel,
      bowlers_label: body.bowlersLabel,
      scorer_detail_label: body.scorerDetailLabel,
      batting_side: body.battingSide,
      current_over: body.currentOver,
      home_side_display: body.homeSideDisplay,
      away_side_display: body.awaySideDisplay,
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
  const hasScorers =
    body.home.scorers.some((s) => s.name.trim() || s.minute.trim() || s.stat.trim()) ||
    body.away.scorers.some((s) => s.name.trim() || s.minute.trim() || s.stat.trim());
  const hasBowlers =
    body.home.bowlers.some((b) => b.name.trim() || b.figures.trim()) ||
    body.away.bowlers.some((b) => b.name.trim() || b.figures.trim());
  const hasExtras =
    body.home.extras.some((e) => e.label.trim() || e.value.trim()) ||
    body.away.extras.some((e) => e.label.trim() || e.value.trim());
  return !hasHome && !hasAway && !hasMeta && !hasScorers && !hasBowlers && !hasExtras;
}

export function normalizeScorecardBody(raw: unknown): ScorecardBody {
  if (!raw || typeof raw !== 'object') return defaultScorecardBody();
  const o = raw as Record<string, unknown>;
  if ('home' in o && typeof o.home === 'object') {
    const base = defaultScorecardBody();
    const home = { ...emptyTeam(), ...(o.home as ScorecardTeam) };
    const away = { ...emptyTeam(), ...(o.away as ScorecardTeam) };
    return {
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
  }
  return freetypeDataToScorecardBody(o);
}
