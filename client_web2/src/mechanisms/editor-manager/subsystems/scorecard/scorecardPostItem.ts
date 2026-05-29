import { SCORECARD_FREETYPE_NAME } from '@/mechanisms/freetypes-manager/builtinFreetypes';
import type { PostItem } from '@/mechanisms/liveblog-api';
import { renderScorecardHtml } from './renderScorecardHtml';
import type { ScorecardBody } from './scorecardTypes';
import { scorecardBodyToFreetypeData } from './scorecardFreetype';

export function scorecardBodyToPostItem(body: ScorecardBody): PostItem {
  return {
    item_type: SCORECARD_FREETYPE_NAME,
    group_type: 'freetype',
    text: renderScorecardHtml(body),
    meta: { data: scorecardBodyToFreetypeData(body) },
  };
}
