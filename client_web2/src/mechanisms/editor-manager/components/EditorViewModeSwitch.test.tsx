import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorViewModeSwitch } from './EditorViewModeSwitch';

describe('EditorViewModeSwitch', () => {
  it('calls onChange when a mode is selected', () => {
    const onChange = vi.fn();
    render(<EditorViewModeSwitch mode="edit" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Voorskou alleen' }));
    expect(onChange).toHaveBeenCalledWith('preview');
  });
});
