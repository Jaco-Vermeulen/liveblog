import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PostTagsSelector } from './PostTagsSelector';

describe('PostTagsSelector', () => {
  afterEach(() => cleanup());

  it('adds and removes tags from global list', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PostTagsSelector
        availableTags={['nuus', 'sport']}
        selectedTags={[]}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/etikette/i), { target: { value: 'nuus' } });
    expect(onChange).toHaveBeenCalledWith(['nuus']);

    rerender(
      <PostTagsSelector
        availableTags={['nuus', 'sport']}
        selectedTags={['nuus']}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /verwyder nuus/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('replaces tag when multiple not allowed', () => {
    const onChange = vi.fn();
    render(
      <PostTagsSelector
        availableTags={['nuus', 'sport']}
        selectedTags={['nuus']}
        allowMultiple={false}
        onChange={onChange}
      />,
    );

    expect(screen.queryByLabelText(/etikette/i)).toBeNull();
  });
});
