import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagsManager } from './TagsManager';

describe('TagsManager', () => {
  afterEach(() => cleanup());
  it('adds a tag via Enter and via button', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagsManager tags={[]} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /globale etikette/i });
    fireEvent.change(input, { target: { value: 'nuus' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['nuus']);

    rerender(<TagsManager tags={['nuus']} onChange={onChange} />);
    fireEvent.change(input, { target: { value: 'sport' } });
    fireEvent.click(screen.getByRole('button', { name: /voeg by/i }));
    expect(onChange).toHaveBeenLastCalledWith(['nuus', 'sport']);
  });

  it('does not add duplicates', () => {
    const onChange = vi.fn();
    render(<TagsManager tags={['nuus']} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /globale etikette/i });
    fireEvent.change(input, { target: { value: 'nuus' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
