import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AF } from '@/copy';
import type { ComposerState } from '../types';
import { ComposerDraftPreview } from './ComposerDraftPreview';

function makeComposer(overrides: Partial<ComposerState> = {}): ComposerState {
  return {
    blocks: [{ type: 'Text', data: { text: '' } }],
    blockIds: ['block-1'],
    headline: '',
    showHeadline: false,
    featuredImageSource: { type: 'none' },
    sticky: false,
    highlight: false,
    tags: [],
    scheduleEnabled: false,
    scheduledDate: null,
    isDirty: false,
    editSession: 0,
    currentPost: null,
    selectedPostType: 'Default',
    freetypeData: {},
    ...overrides,
  };
}

describe('ComposerDraftPreview', () => {
  it('renders nothing when composer is clean and empty', () => {
    const { container } = render(
      <ComposerDraftPreview composer={makeComposer()} user={{ username: 'jaco' }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows draft placeholder when dirty but still empty', () => {
    render(
      <ComposerDraftPreview composer={makeComposer({ isDirty: true })} user={{ username: 'jaco' }} />,
    );
    expect(screen.getByLabelText(AF.editor.draftPreview)).toBeInTheDocument();
    expect(screen.getByText(AF.editor.draftLabel)).toBeInTheDocument();
    expect(screen.getByText(AF.editor.draftEmpty)).toBeInTheDocument();
  });

  it('renders live preview content from composer blocks', () => {
    const { container } = render(
      <ComposerDraftPreview
        composer={makeComposer({
          isDirty: true,
          blocks: [{ type: 'Text', data: { text: 'Live preview text' } }],
        })}
        user={{ display_name: 'Jaco' }}
      />,
    );
    expect(screen.getByText('Live preview text')).toBeInTheDocument();
    expect(screen.getByText('Jaco')).toBeInTheDocument();
    expect(container.querySelector('.lb-item.text')).toBeInTheDocument();
    expect(container.querySelector('.lb-type')).toBeInTheDocument();
  });
});
