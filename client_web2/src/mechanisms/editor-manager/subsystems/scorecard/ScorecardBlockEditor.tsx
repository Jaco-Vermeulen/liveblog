import { AF } from '@/copy';
import { Plus, Trash2 } from 'lucide-react';

const SC = AF.editor.scorecard;
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { applyScorecardVariant, presetConfigForBody, SCORECARD_PRESETS } from './scorecardPresets';
import { ScorecardCard } from './ScorecardCard';
import {
  addColumnToList,
  emptyCustomList,
  emptyListRow,
  removeColumnFromList,
  syncListColumnIds,
  updateListColumnLabel,
} from './scorecardCustomLists';
import type {
  ScorecardBody,
  ScorecardCustomList,
  ScorecardListPlacement,
  ScorecardListRow,
  ScorecardTeam,
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

function sanitizeScore(value: string): string {
  return value.slice(0, 16);
}

const PLACEMENT_OPTIONS: { value: ScorecardListPlacement; label: string }[] = [
  { value: 'panel', label: SC.placementPanel },
  { value: 'team-inline', label: SC.placementTeamInline },
  { value: 'full', label: SC.placementFull },
];

function RowEditor({
  row,
  list,
  onChange,
  onRemove,
  canRemove,
}: {
  row: ScorecardListRow;
  list: ScorecardCustomList;
  onChange: (row: ScorecardListRow) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="m-scorecard-editor__scorer-row">
      {list.columns.map((col) => (
        <LbInput
          key={col.id}
          aria-label={col.label || SC.columnLabel}
          value={row.values[col.id] ?? ''}
          onChange={(e) =>
            onChange({
              values: { ...row.values, [col.id]: e.target.value },
            })
          }
          placeholder={col.label || SC.columnLabelPlaceholder}
          className="min-w-0 flex-1"
        />
      ))}
      <button
        type="button"
        className="m-editor-composer__block-remove"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={SC.removeRow}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function RowsBlock({
  title,
  rows,
  list,
  onChange,
}: {
  title: string;
  rows: ScorecardListRow[];
  list: ScorecardCustomList;
  onChange: (rows: ScorecardListRow[]) => void;
}) {
  const addRow = () => onChange([...rows, emptyListRow(list.columns)]);
  const updateRow = (index: number, row: ScorecardListRow) => {
    onChange(rows.map((r, i) => (i === index ? row : r)));
  };
  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="m-scorecard-editor__scorers">
      <p className="m-scorecard-editor__scorers-label">{title}</p>
      {rows.map((row, index) => (
        <RowEditor
          key={index}
          row={row}
          list={list}
          onChange={(next) => updateRow(index, next)}
          onRemove={() => removeRow(index)}
          canRemove={rows.length > 1}
        />
      ))}
      <LbButton type="button" variant="secondary" onClick={addRow}>
        <Plus className="mr-1 inline h-4 w-4" aria-hidden />
        {SC.addRow}
      </LbButton>
    </div>
  );
}

function CustomListEditor({
  list,
  onChange,
  onRemove,
}: {
  list: ScorecardCustomList;
  onChange: (list: ScorecardCustomList) => void;
  onRemove: () => void;
}) {
  const patch = (partial: Partial<ScorecardCustomList>) => onChange({ ...list, ...partial });

  return (
    <fieldset className="m-scorecard-editor__list">
      <div className="m-scorecard-editor__list-header">
        <legend className="m-scorecard-editor__team-legend">{list.heading.trim() || SC.listHeading}</legend>
        <LbButton type="button" variant="secondary" onClick={onRemove}>
          {SC.removeList}
        </LbButton>
      </div>

      <LbFormField label={SC.listHeading} htmlFor={`sc-list-heading-${list.id}`}>
        <LbInput
          id={`sc-list-heading-${list.id}`}
          value={list.heading}
          onChange={(e) => patch({ heading: e.target.value })}
          placeholder={SC.listHeadingPlaceholder}
        />
      </LbFormField>

      <LbFormField label={SC.listPlacement} htmlFor={`sc-list-placement-${list.id}`}>
        <select
          id={`sc-list-placement-${list.id}`}
          className="m-editor-composer__select"
          value={list.placement}
          onChange={(e) => patch({ placement: e.target.value as ScorecardListPlacement })}
        >
          {PLACEMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </LbFormField>

      <div className="m-scorecard-editor__scorers">
        <p className="m-scorecard-editor__scorers-label">{SC.columnsHeading}</p>
        {list.columns.map((col) => (
          <div key={col.id} className="m-scorecard-editor__scorer-row">
            <LbInput
              aria-label={SC.columnLabel}
              value={col.label}
              onChange={(e) => onChange(updateListColumnLabel(list, col.id, e.target.value))}
              placeholder={SC.columnLabelPlaceholder}
              className="min-w-0 flex-1"
            />
            <button
              type="button"
              className="m-editor-composer__block-remove"
              onClick={() => onChange(removeColumnFromList(list, col.id))}
              disabled={list.columns.length <= 1}
              aria-label={SC.removeColumn}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
        <LbButton type="button" variant="secondary" onClick={() => onChange(addColumnToList(list))}>
          <Plus className="mr-1 inline h-4 w-4" aria-hidden />
          {SC.addColumn}
        </LbButton>
      </div>

      {list.placement === 'full' ? (
        <RowsBlock title={SC.fullRows} rows={list.rows} list={list} onChange={(rows) => patch({ rows })} />
      ) : (
        <>
          <RowsBlock
            title={SC.homeRows}
            rows={list.homeRows}
            list={list}
            onChange={(homeRows) => patch({ homeRows })}
          />
          <RowsBlock
            title={SC.awayRows}
            rows={list.awayRows}
            list={list}
            onChange={(awayRows) => patch({ awayRows })}
          />
        </>
      )}
    </fieldset>
  );
}

function TeamBasics({
  label,
  team,
  side,
  preset,
  onChange,
  onUploadLogo,
  uploading,
}: {
  label: string;
  team: ScorecardTeam;
  side: 'home' | 'away';
  preset: ReturnType<typeof presetConfigForBody>;
  onChange: (team: ScorecardTeam) => void;
  onUploadLogo: (file: File) => void;
  uploading: boolean;
}) {
  return (
    <fieldset className="m-scorecard-editor__team">
      <legend className="m-scorecard-editor__team-legend">{label}</legend>

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
          onChange={(e) => onChange({ ...team, score: sanitizeScore(e.target.value) })}
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
  const lists = body.customLists ?? [];

  const patch = (partial: Partial<ScorecardBody>) => onChange({ ...body, ...partial });

  const patchLists = (customLists: ScorecardCustomList[]) =>
    patch({ customLists: customLists.map(syncListColumnIds) });

  const onVariantChange = (variant: ScorecardVariant) => {
    onChange(applyScorecardVariant(body, variant));
  };

  const addList = () => {
    patchLists([...lists, emptyCustomList()]);
  };

  const updateList = (index: number, list: ScorecardCustomList) => {
    const next = [...lists];
    next[index] = syncListColumnIds(list);
    patchLists(next);
  };

  const removeList = (index: number) => {
    patchLists(lists.filter((_, i) => i !== index));
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
        <p className="mt-1 text-xs text-mar-muted">{SC.starterHint}</p>
        {body.variant === 'cricket' ? (
          <p className="mt-1 text-xs text-mar-muted">{SC.cricketHint}</p>
        ) : null}
      </LbFormField>

      {body.variant === 'cricket' && (
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

      <div className="m-scorecard-editor__grid">
        <TeamBasics
          label={SC.homeTeam}
          side="home"
          team={body.home}
          preset={preset}
          onChange={(home) => patch({ home })}
          onUploadLogo={(file) => void onUploadLogo('home', file)}
          uploading={uploadingSide === 'home'}
        />
        <TeamBasics
          label={SC.awayTeam}
          side="away"
          team={body.away}
          preset={preset}
          onChange={(away) => patch({ away })}
          onUploadLogo={(file) => void onUploadLogo('away', file)}
          uploading={uploadingSide === 'away'}
        />
      </div>

      <div className="m-scorecard-editor__sections">
        <p className="m-scorecard-editor__scorers-label">{SC.listsHeading}</p>
        {lists.length === 0 ? <p className="m-scorecard-editor__scorers-hint">{SC.emptyListsHint}</p> : null}
        {lists.map((list, index) => (
          <CustomListEditor
            key={list.id}
            list={list}
            onChange={(next) => updateList(index, next)}
            onRemove={() => removeList(index)}
          />
        ))}
        <LbButton type="button" variant="secondary" onClick={addList}>
          <Plus className="mr-1 inline h-4 w-4" aria-hidden />
          {SC.addList}
        </LbButton>
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
