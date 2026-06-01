import type { Freetype } from '@/mechanisms/liveblog-api';

import { AF } from '@/copy';

/** Legacy scorecard template (client/app/scripts/liveblog-edit/views/scorecards.ng1). */
export const SCORECARD_FREETYPE_TEMPLATE = `<div class="scorecard-top @scorecard-top--background? background.img" style="background-size: cover; @background-image: background.img">
    <div class="scorecard-top__column scorecard-top__column--result">
        <div>
            <label for="home.score" hide-render>Tuis telling</label>
            <input id="home.score" name="$home.score" class="team-score" necessary="true" maxlength="4" />
        </div>
        <div class="team-score-colon">
            <span class="team-score">:</span>
        </div>
        <div>
            <label for="away.score" hide-render>Weg telling</label>
            <input id="away.score" name="$away.score" class="team-score" necessary="true" maxlength="4" />
        </div>
    </div>
    <hr hide-render>
    <div class="scorecard-top__column scorecard-top__column--home">
        <fieldset>
            <div class="scorecard-top__logoWrap">
                <div class="scorecard-top__logo">
                    <label for="home.img1" hide-render="">Tuis logo</label>
                    <input image="$home.img1"/>
                </div>
            </div>
            <hr hide-render>
            <div>
                <label for="home.name" hide-render>Tuis span</label>
                <input id="home.name" name="$home.name" class="team-name" necessary="true" />
            </div>
        </fieldset>
        <fieldset>
            <legend class="legend--padding-top" hide-render>Tuis doelmakers</legend>
            <ul class="scorecard-top__scorers">
                <li>
                    <div class="time">
                        <label hide-render>Minuut</label>
                        <input name="$home.scorers[0].time" tandem="$home.scorers[0].name" number="true" />
                    </div>
                    <div>
                        <label hide-render>Naam</label>
                        <input name="$home.scorers[0].name" tandem="$home.scorers[0].time"/>
                    </div>
                </li>
            </ul>
        </fieldset>
    </div>
    <div class="scorecard-top__column scorecard-top__column--away">
        <fieldset>
            <div class="scorecard-top__logoWrap">
                <div class="scorecard-top__logo">
                    <label for="away.img1" hide-render="">Weg logo</label>
                    <input image="$away.img1"/>
                </div>
            </div>
            <hr hide-render>
            <div>
                <label for="away.name" hide-render>Weg span</label>
                <input id="away.name" name="$away.name" class="team-name" necessary="true"/>
            </div>
        </fieldset>
        <fieldset>
            <legend class="legend--padding-top" hide-render>Weg doelmakers</legend>
            <ul class="scorecard-top__scorers">
                <li>
                    <div>
                    <div class="time">
                        <label hide-render>Minuut</label>
                        <input name="$away.scorers[0].time" tandem="$away.scorers[0].name" number="true"/>
                    </div>
                        <label hide-render>Naam</label>
                        <input name="$away.scorers[0].name" tandem="$away.scorers[0].time"/>
                    </div>
                </li>
            </ul>
        </fieldset>
    </div>
    <div class="scorecard-top__info">
        <div>
            <label for="match.quaters" hide-render>Rustydresultate</label>
            <input id="match.quaters" name="$match.quaters" class="match-quaters"/>
        </div>
        <div>
            <label for="match.info" hide-render>Wedstryinligting</label>
            <input id="match.info" name="$match.info" class="match-info"/>
        </div>
    </div>
    <div class="scorecard-top__background">
        <label for="home.img1" hide-render>Agtergrondbeeld</label>
        <input image="$background.img"/>
    </div>
</div>
<div hide-render>
    <label for="remember" class="inline">${AF.editor.scorecard.rememberLast}</label>
    <input id="remember" class="marginleft10" checkbox="$remember" type="checkbox">
</div>`;

export const BUILTIN_EDITOR_FREETYPES: Freetype[] = [
  {
    _id: 'builtin-scorecard',
    name: AF.freetypes.builtinScorecardName,
    template: SCORECARD_FREETYPE_TEMPLATE,
  },
];

/** Legacy sports scoreboard — hidden until product enables it in the composer. */
export const SHOW_SCORECARD_FREETYPE = true;

export const SCORECARD_FREETYPE_NAME = 'Scorecard';

/** Plasing-tipe dropdown (standard vs custom freetypes) — off until custom types are needed. */
export const SHOW_POST_TYPE_SELECTOR = false;

export function mergeEditorFreetypes(apiFreetypes: Freetype[]): Freetype[] {
  const withoutScorecard = apiFreetypes.filter(
    (f) => f.name !== 'Scorecard' && f.name !== AF.freetypes.builtinScorecardName,
  );
  if (!SHOW_SCORECARD_FREETYPE) {
    return withoutScorecard;
  }
  const names = new Set(withoutScorecard.map((f) => f.name));
  const builtins = BUILTIN_EDITOR_FREETYPES.filter((f) => !names.has(f.name));
  return [...builtins, ...withoutScorecard];
}
