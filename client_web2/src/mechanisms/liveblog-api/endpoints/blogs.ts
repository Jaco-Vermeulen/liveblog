import { api } from '../client';
import type {
  Blog,
  BlogStatusCode,
  CreateBlogPayload,
  EveList,
} from '../types';

export interface ListBlogsOptions {
  blogStatus: BlogStatusCode;
  page?: number;
  maxResults?: number;
  /** Server-side Elasticsearch query (legacy query_string on title/description). */
  searchQuery?: string;
}

function buildListParams(options: ListBlogsOptions): Record<string, string | number> {
  const filter = { term: { blog_status: options.blogStatus } };
  let esQuery: { filtered: { filter: typeof filter; query?: unknown } } = {
    filtered: { filter },
  };

  const q = options.searchQuery?.trim();
  if (q) {
    esQuery = {
      filtered: {
        filter,
        query: {
          query_string: {
            query: `*${q}*`,
            fields: ['title', 'description'],
          },
        },
      },
    };
  }

  const params: Record<string, string | number> = {
    max_results: options.maxResults ?? 25,
    embedded: JSON.stringify({ original_creator: 1 }),
    sort: '[("versioncreated", -1)]',
    source: JSON.stringify({ query: esQuery }),
  };
  if (options.page !== undefined) {
    params.page = options.page;
  }
  return params;
}

export function listBlogs(options: ListBlogsOptions): Promise<EveList<Blog>> {
  return api.get<EveList<Blog>>('/blogs', buildListParams(options));
}

export function getBlog(id: string): Promise<Blog> {
  return api.get<Blog>(`/blogs/${id}`, {
    embedded: JSON.stringify({ original_creator: 1 }),
  });
}

function resolveCreatorId(blog: Blog): string {
  return typeof blog.original_creator === 'object'
    ? blog.original_creator._id
    : blog.original_creator;
}

/**
 * PATCH blog with only the supplied fields (never Eve metadata from GET responses).
 * Always includes original_creator id and title, matching legacy blogService.update behaviour.
 */
export function updateBlog(blog: Blog, patch: Partial<Blog>): Promise<Blog> {
  const etag = blog._etag;
  if (!etag) {
    throw new Error('Blog etag required for update');
  }

  const body: Partial<Blog> = {
    original_creator: resolveCreatorId(blog),
    title: patch.title ?? blog.title,
    ...patch,
  };

  return api.patch<Blog>(`/blogs/${blog._id}`, body, { etag });
}

export function createBlog(payload: CreateBlogPayload): Promise<Blog> {
  return api.post<Blog>('/blogs', payload);
}

export function updateBlogStatus(blog: Blog, blogStatus: BlogStatusCode): Promise<Blog> {
  return updateBlog(blog, {
    blog_status: blogStatus,
    description: blog.description,
  });
}

export function deleteBlog(blog: Blog): Promise<void> {
  const etag = blog._etag;
  if (!etag) {
    throw new Error('Blog etag required for delete');
  }
  return api.delete(`/blogs/${blog._id}`, { etag });
}
