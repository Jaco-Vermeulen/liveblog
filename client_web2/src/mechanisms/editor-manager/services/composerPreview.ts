import type { PostItem } from '@/mechanisms/liveblog-api';
import { freetypeDataToPostItem } from '@/mechanisms/freetypes-manager';
import type { ComposerState } from '../types';
import { blocksToPostItems, freetypeHasContent } from './blockTransform';

/** Post items that would be saved from the current composer draft. */
export function composerToPreviewItems(composer: ComposerState): PostItem[] {
  if (
    composer.selectedPostType !== 'Default' &&
    freetypeHasContent(composer.selectedPostType.template, composer.freetypeData)
  ) {
    return [
      freetypeDataToPostItem(
        composer.selectedPostType.name,
        composer.selectedPostType.template,
        composer.freetypeData,
      ),
    ];
  }
  return blocksToPostItems(composer.blocks);
}

export function previewAuthorLabel(
  user: { display_name?: string; username?: string } | null | undefined,
): string {
  const name = user?.display_name?.trim() || user?.username?.trim();
  return name || 'Redakteur';
}
