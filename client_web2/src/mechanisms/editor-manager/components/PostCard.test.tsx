import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Post } from '@/mechanisms/liveblog-api';
import { PostCard } from './PostCard';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    _id: 'post-1',
    blog: 'blog-1',
    post_status: 'draft',
    groups: [],
    mainItem: { item: { item_type: 'text', text: 'Hello world' } },
    ...overrides,
  };
}

describe('PostCard', () => {
  it('renders pin, highlight, edit and delete icon actions in the header toolbar', () => {
    render(
      <PostCard
        post={makePost()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePin={vi.fn()}
        onToggleHighlight={vi.fn()}
      />,
    );

    const toolbar = screen.getByRole('toolbar', { name: 'Plasing-aksies' });
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Speld vas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beklemtoon' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wysig' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verwyder' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publiseer' })).not.toBeInTheDocument();
    expect(screen.queryByText('Wysig')).not.toBeInTheDocument();
    expect(screen.queryByText('Verwyder')).not.toBeInTheDocument();
  });

  it('shows publish icon when post is not open', () => {
    const onPublish = vi.fn();
    render(
      <PostCard
        post={makePost({ post_status: 'draft' })}
        onEdit={vi.fn()}
        onPublish={onPublish}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Publiseer' }));
    expect(onPublish).toHaveBeenCalledOnce();
  });

  it('does not render a footer action row', () => {
    const { container } = render(
      <PostCard post={makePost()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(container.querySelector('footer')).toBeNull();
  });
});
