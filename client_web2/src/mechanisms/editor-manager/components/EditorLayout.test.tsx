import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Blog } from '@/mechanisms/liveblog-api';
import { EditorLayout } from './EditorLayout';

const blog = { _id: 'b1', title: 'Test blog' } as Blog;

function renderLayout(viewMode: 'edit' | 'split' | 'preview') {
  return render(
    <MemoryRouter>
      <EditorLayout
        blog={blog}
        user={null}
        panel="editor"
        onPanelChange={() => {}}
        viewMode={viewMode}
        onViewModeChange={() => {}}
        composer={<div data-testid="compose">Compose</div>}
        preview={<div data-testid="preview">Preview</div>}
      />
    </MemoryRouter>,
  );
}

describe('EditorLayout', () => {
  afterEach(() => cleanup());

  it('shows only compose panel in edit mode', () => {
    renderLayout('edit');

    expect(screen.getByTestId('compose')).toBeInTheDocument();
    expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Tydlyn')).not.toBeInTheDocument();
  });

  it('shows only preview panel in preview mode', () => {
    renderLayout('preview');

    expect(screen.queryByTestId('compose')).not.toBeInTheDocument();
    expect(screen.getByTestId('preview')).toBeInTheDocument();
  });

  it('shows compose and preview in split mode', () => {
    renderLayout('split');

    expect(screen.getByTestId('compose')).toBeInTheDocument();
    expect(screen.getByTestId('preview')).toBeInTheDocument();
  });
});
