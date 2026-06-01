import { AF } from '@/copy';
import { Plus, Trash2 } from 'lucide-react';

const SC = AF.editor.scorecard;
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { applyScorecardVariant, presetConfigForBody, SCORECARD_PRESETS } from './scorecardPresets';
import { ScorecardCard } from './ScorecardCard';
import type { ScorecardTeamSideDisplay } from './scorecardDisplay';
import type {
  ScorecardBody,
  ScorecardPlayerRow,
  ScorecardScorer,
  ScorecardTeam,
  ScorecardTeamExtra,
  ScorecardVariant,
} from './scorecardTypes';
import { defaultScorecardBody } from './scorecardTypes';

export interface ScorecardBlockEditorProps {
  scorecardBody: ScorecardBody | null;
  onChange: (body: ScorecardBody) => void;
  onUploadLogo: (side: 'home' | 'away', file: File) => void | Promise<void>;
  onUploadBackground: (file: File) => void | Promise<void>;
  uploadingSide?: 'home' | 'away' | 'background' | null;
}

function sanitizeScore(value: string, numericOnly: boolean): string {
  if (numericOnly) return value.replace(/[^\d]/g, '').slice(0, 8);
  return value.slice(0, 16);
}

const SIDE_DISPLAY_OPTIONS: { value: ScorecardTeamSideDisplay; label: string }[] = [
  { value: 'auto', label: SC.sideDisplay.auto },
  { value: 'batters', label: SC.sideDisplay.batters },
  { value: 'bowlers', label: SC.sideDisplay.bowlers },
  { value: 'both', label: SC.sideDisplay.both },
  { value: 'none', label: SC.sideDisplay.none },
];

function TeamFields({
  label,
  team,
  side,
  preset,
  scorersSectionLabel,
  sideDisplay,
  onSideDisplayChange,
  showSideDisplay,
  onChange,
  onUploadLogo,
  uploading,
}: {
  label: string;
  team: ScorecardTeam;
  side: 'home' | 'away';
  preset: ReturnType<typeof presetConfigForBody>;
  scorersSectionLabel: string;
  sideDisplay: ScorecardTeamSideDisplay;
  onSideDisplayChange: (value: ScorecardTeamSideDisplay) => void;
  showSideDisplay: boolean;
  onChange: (team: ScorecardTeam) => void;
  onUploadLogo: (file: File) => void;
  uploading: boolean;
}) {
  const updateScorer = (index: number, patch: Partial<ScorecardScorer>) => {
    const scorers = team.scorers.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange({ ...team, scorers });
  };

  const addScorer = () => {
    onChange({ ...team, scorers: [...team.scorers, { name: '', minute: '', stat: '' }] });
  };

  const removeScorer = (index: number) => {
    if (team.scorers.length <= 1) return;
    onChange({ ...team, scorers: team.scorers.filter((_, i) => i !== index) });
  };

  const updateBowler = (index: number, patch: Partial<ScorecardPlayerRow>) => {
    const bowlers = team.bowlers.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange({ ...team, bowlers });
  };

  const addBowler = () => {
    onChange({ ...team, bowlers: [...team.bowlers, { name: '', figures: '' }] });
  };

  const removeBowler = (index: number) => {
    if (team.bowlers.length <= 1) return;
    onChange({ ...team, bowlers: team.bowlers.filter((_, i) => i !== index) });
  };

  const extrasRows = team.extras.length ? team.extras : [{ label: '', value: '' }];

  const updateExtra = (index: number, patch: Partial<ScorecardTeamExtra>) => {
    const base = team.extras.length ? [...team.extras] : [{ label: '', value: '' }];
    const extras = base.map((e, i) => (i === index ? { ...e, ...patch } : e));
    onChange({ ...team, extras });
  };

  const addExtra = () => {
    onChange({ ...team, extras: [...extrasRows, { label: '', value: '' }] });
  };

  const removeExtra = (index: number) => {
    const next = extrasRows.filter((_, i) => i !== index);
    onChange({ ...team, extras: next.length ? next : [{ label: '', value: '' }] });
  };

  return (
    <fieldset className="m-scorecard-editor__team">
      <legend className="m-scorecard-editor__team-legend">{label}</legend>

      {showSideDisplay ? (
        <LbFormField label={SC.showOnCard} htmlFor={`sc-${side}-display`}>
          <select
            id={`sc-${side}-display`}
            className="m-editor-composer__select"
            value={sideDisplay}
            onChange={(e) => onSideDisplayChange(e.target.value as ScorecardTeamSideDisplay)}
          >
            {SIDE_DISPLAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </LbFormField>
      ) : null}

      <LbFormField label={SC.teamName} htmlFor={`sc-${side}-name`}>
        <LbInput
          id={`sc-${side}-name`}
          value={team.name}
          onChange={(e) => onChange({ ...team, name: e.target.value })}
          placeholder={SC.teamNamePlaceholder}
        />
      </LbFormField>

      <LbFormField label={SC.score} htmlFor={`sc-${side}-score`}>
        <LbInput
          id={`sc-${side}-score`}
          value={team.score}
          onChange={(e) => onChange({ ...team, score: sanitizeScore(e.target.value, preset.scoreNumericOnly) })}
          placeholder={preset.scoreNumericOnly ? '0' : SC.scorePlaceholderCricket}
          inputMode={preset.scoreNumericOnly ? 'numeric' : 'text'}
          className={preset.scoreNumericOnly ? 'max-w-[5rem]' : undefined}
        />
      </LbFormField>

      <LbFormField label={SC.teamLogo} htmlFor={`sc-${side}-logo-file`}>
        <div className="flex flex-wrap items-center gap-2">
          <LbButton
            type="button"
            variant="secondary"
            disabled={uploading}
            onClick={() => document.getElementById(`sc-${side}-logo-file`)?.click()}
          >
            {uploading ? AF.common.uploading : SC.uploadLogo}
          </LbButton>
          {team.logoUrl ? (
            <img src={team.logoUrl} alt="" className="h-12 w-12 rounded border border-mar-border object-contain" />
          ) : null}
        </div>
        <input
          id={`sc-${side}-logo-file`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadLogo(file);
            e.target.value = '';
          }}
        />
      </LbFormField>

      {preset.showTeamExtras ? (
        <div className="m-scorecard-editor__scorers">
          <p className="m-scorecard-editor__scorers-label">{SC.teamStats}</p>
          <p className="m-scorecard-editor__scorers-hint">
            Bv. Etiket &quot;Overs&quot; en waarde &quot;50.0&quot; vir innings-overs onder die span se naam op die kaart.
          </p>
          {extrasRows.map((extra, index) => (
            <div key={index} className="m-scorecard-editor__scorer-row">
              <LbInput
                aria-label={SC.labelField}
                value={extra.label}
                onChange={(e) => updateExtra(index, { label: e.target.value })}
                placeholder={SC.labelPlaceholder}
                className="min-w-0 flex-1"
              />
              <LbInput
                aria-label={SC.valueField}
                value={extra.value}
                onChange={(e) => updateExtra(index, { value: e.target.value })}
                placeholder={SC.valuePlaceholder}
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                className="m-editor-composer__block-remove"
                onClick={() => removeExtra(index)}
                aria-label={SC.removeStat}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
          <LbButton type="button" variant="secondary" onClick={addExtra}>
            <Plus className="mr-1 inline h-4 w-4" aria-hidden />
            Voeg statistiek by
          </LbButton>
        </div>
      ) : null}

      <div className="m-scorecard-editor__scorers">
        <p className="m-scorecard-editor__scorers-label">{scorersSectionLabel}</p>
        {preset.showScorerStat ? (
          <p className="m-scorecard-editor__scorers-hint">
            Kolwer-ry: runs in die eerste kolom, {preset.scorerDetailLabel.toLowerCase()} (bv. 48.2) in die tweede.
          </p>
        ) : null}
        {team.scorers.map((scorer, index) => (
          <div key={index} className="m-scorecard-editor__scorer-row">
            {preset.showScorerStat ? (
              <LbInput
                aria-label={SC.statField}
                value={scorer.stat}
                onChange={(e) => updateScorer(index, { stat: e.target.value.slice(0, 8) })}
                placeholder={SC.runsPlaceholder}
                className="w-16"
              />
            ) : null}
            <LbInput
              aria-label={preset.scorerDetailLabel}
              value={scorer.minute}
              onChange={(e) =>
                updateScorer(index, {
                  minute: preset.minuteSuffix
                    ? e.target.value.replace(/[^\d]/g, '').slice(0, 3)
                    : e.target.value.slice(0, 8),
                })
              }
              inputMode={preset.minuteSuffix ? 'numeric' : 'text'}
              placeholder={preset.scorerDetailLabel}
              className="w-16"
            />
            <LbInput
              aria-label={SC.playerField}
              value={scorer.name}
              onChange={(e) => updateScorer(index, { name: e.target.value })}
              placeholder={SC.playerNamePlaceholder}
              className="min-w-0 flex-1"
            />
            <button
              type="button"
              className="m-editor-composer__block-remove"
              onClick={() => removeScorer(index)}
              disabled={team.scorers.length <= 1}
              aria-label={SC.removePlayer}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
        <LbButton type="button" variant="secondary" onClick={addScorer}>
          <Plus className="mr-1 inline h-4 w-4" aria-hidden />
          Voeg speler by
        </LbButton>
      </div>

      {preset.showBowlers ? (
        <div className="m-scorecard-editor__scorers">
          <p className="m-scorecard-editor__scorers-label">{preset.bowlersLabel}</p>
          {team.bowlers.map((bowler, index) => (
            <div key={index} className="m-scorecard-editor__scorer-row">
              <LbInput
                aria-label={SC.figuresField}
                value={bowler.figures}
                onChange={(e) => updateBowler(index, { figures: e.target.value.slice(0, 12) })}
                placeholder={SC.figuresPlaceholder}
                className="w-20"
              />
              <LbInput
                aria-label={SC.bowlerField}
                value={bowler.name}
                onChange={(e) => updateBowler(index, { name: e.target.value })}
                placeholder={SC.bowlerNamePlaceholder}
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                className="m-editor-composer__block-remove"
                onClick={() => removeBowler(index)}
                disabled={team.bowlers.length <= 1}
                aria-label={SC.removeBowler}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
          <LbButton type="button" variant="secondary" onClick={addBowler}>
            <Plus className="mr-1 inline h-4 w-4" aria-hidden />
            Voeg bouler by
          </LbButton>
        </div>
      ) : null}
    </fieldset>
  );
}

export function ScorecardBlockEditor({
  scorecardBody,
  onChange,
  onUploadLogo,
  onUploadBackground,
  uploadingSide = null,
}: ScorecardBlockEditorProps) {
  const body = scorecardBody ?? defaultScorecardBody();
  const preset = presetConfigForBody(body);

  const patch = (partial: Partial<ScorecardBody>) => onChange({ ...body, ...partial });

  const onVariantChange = (variant: ScorecardVariant) => {
    onChange(applyScorecardVariant(body, variant));
  };

  return (
    <div className="m-scorecard-editor">
      <p className="m-scorecard-editor__hint">{SC.hint}</p>

      <ScorecardCard body={body} preview />

      <LbFormField label={SC.matchType} htmlFor="sc-variant">
        <select
          id="sc-variant"
          className="m-editor-composer__select"
          value={body.variant}
          onChange={(e) => onVariantChange(e.target.value as ScorecardVariant)}
        >
          {(Object.keys(SCORECARD_PRESETS) as ScorecardVariant[]).map((key) => (
            <option key={key} value={key}>
              {SCORECARD_PRESETS[key].label}
            </option>
          ))}
        </select>
        {body.variant === 'cricket' ? (
          <p className="mt-1 text-xs text-mar-muted">{SC.cricketHint}</p>
        ) : null}
      </LbFormField>

      {(body.variant === 'cricket' || body.variant === 'custom') && (
        <div className="m-scorecard-editor__labels-grid">
          <LbFormField label={SC.currentOver} htmlFor="sc-current-over">
            <LbInput
              id="sc-current-over"
              value={body.currentOver}
              onChange={(e) => patch({ currentOver: e.target.value.slice(0, 12) })}
              placeholder="bv. 32.4"
            />
          </LbFormField>
          <LbFormField label={SC.battingSide} htmlFor="sc-batting-side">
            <select
              id="sc-batting-side"
              className="m-editor-composer__select"
              value={body.battingSide}
              onChange={(e) => patch({ battingSide: e.target.value as 'home' | 'away' })}
            >
              <option value="home">{SC.homeBatting}</option>
              <option value="away">{SC.awayBatting}</option>
            </select>
          </LbFormField>
        </div>
      )}

      <div className="m-scorecard-editor__labels-grid">
        <LbFormField label={SC.scorersHeading} htmlFor="sc-scorers-label">
          <LbInput
            id="sc-scorers-label"
            value={body.scorersLabel}
            onChange={(e) => patch({ scorersLabel: e.target.value })}
            placeholder={preset.scorersLabel}
          />
        </LbFormField>
        {(preset.showBowlers || body.variant === 'custom') && (
          <LbFormField label={SC.bowlersHeading} htmlFor="sc-bowlers-label">
            <LbInput
              id="sc-bowlers-label"
              value={body.bowlersLabel}
              onChange={(e) => patch({ bowlersLabel: e.target.value })}
              placeholder={preset.bowlersLabel}
            />
          </LbFormField>
        )}
        <LbFormField label={SC.detailColumnLabel} htmlFor="sc-detail-label">
          <LbInput
            id="sc-detail-label"
            value={body.scorerDetailLabel}
            onChange={(e) => patch({ scorerDetailLabel: e.target.value })}
            placeholder={preset.scorerDetailLabel}
          />
        </LbFormField>
      </div>

      <div className="m-scorecard-editor__grid">
        <TeamFields
          label={SC.homeTeam}
          side="home"
          team={body.home}
          preset={preset}
          scorersSectionLabel={body.scorersLabel || preset.scorersLabel}
          sideDisplay={body.homeSideDisplay}
          onSideDisplayChange={(homeSideDisplay) => patch({ homeSideDisplay })}
          showSideDisplay={body.variant === 'cricket' || body.variant === 'custom'}
          onChange={(home) => patch({ home })}
          onUploadLogo={(file) => void onUploadLogo('home', file)}
          uploading={uploadingSide === 'home'}
        />
        <TeamFields
          label={SC.awayTeam}
          side="away"
          team={body.away}
          preset={preset}
          scorersSectionLabel={body.scorersLabel || preset.scorersLabel}
          sideDisplay={body.awaySideDisplay}
          onSideDisplayChange={(awaySideDisplay) => patch({ awaySideDisplay })}
          showSideDisplay={body.variant === 'cricket' || body.variant === 'custom'}
          onChange={(away) => patch({ away })}
          onUploadLogo={(file) => void onUploadLogo('away', file)}
          uploading={uploadingSide === 'away'}
        />
      </div>

      <LbFormField
        label={body.variant === 'cricket' ? SC.matchStatusCricket : SC.matchStatusRugby}
        htmlFor="sc-quarters"
      >
        <LbInput
          id="sc-quarters"
          value={body.matchQuarters}
          onChange={(e) => patch({ matchQuarters: e.target.value })}
          placeholder={
            body.variant === 'cricket'
              ? SC.matchStatusPlaceholderCricket
              : SC.matchStatusPlaceholderRugby
          }
        />
      </LbFormField>

      <LbFormField label={SC.matchInfo} htmlFor="sc-info">
        <LbInput
          id="sc-info"
          value={body.matchInfo}
          onChange={(e) => patch({ matchInfo: e.target.value })}
          placeholder={SC.matchInfoPlaceholder}
        />
      </LbFormField>

      <LbFormField label={SC.backgroundOptional} htmlFor="sc-bg-file">
        <LbButton
          type="button"
          variant="secondary"
          disabled={uploadingSide === 'background'}
          onClick={() => document.getElementById('sc-bg-file')?.click()}
        >
          {uploadingSide === 'background' ? AF.common.uploading : SC.uploadBackground}
        </LbButton>
        <input
          id="sc-bg-file"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onUploadBackground(file);
            e.target.value = '';
          }}
        />
      </LbFormField>
    </div>
  );
}
