import type { EveList, EveResource, LiveblogUser } from '../types';

export type TimelineSort =
  | 'editorial'
  | 'updated_first'
  | 'newest_first'
  | 'oldest_first'
  | 'editorial_asc';

export interface PostFilters {
  status?: string;
  sticky?: boolean;
  authors?: string[];
  updatedAfter?: string;
  highlight?: boolean;
  excludeDeleted?: boolean;
  syndicationIn?: boolean;
  noSyndication?: boolean;
  scheduled?: boolean;
  maxPublishedDate?: string;
  sort?: string;
}

export interface PostItem {
  _id?: string;
  item_type: string;
  text?: string;
  meta?: Record<string, unknown>;
  commenter?: string;
  user?: LiveblogUser;
  group_type?: string;
  syndicated_creator?: LiveblogUser;
  poll_body?: unknown;
  id_to_update?: string;
}

export interface PostGroupRef {
  idRef?: string;
  residRef?: string;
  location?: string;
  type?: string;
  item?: PostItem;
}

export interface PostGroup {
  id: string;
  refs: PostGroupRef[];
  role?: string;
}

export interface Post extends EveResource {
  blog: string;
  post_status: string;
  published_date?: string;
  content_updated_date?: string;
  scheduled?: boolean;
  sticky?: boolean;
  lb_highlight?: boolean;
  deleted?: boolean;
  order?: number;
  tags?: string[];
  syndication_in?: string;
  producer_blog_title?: string;
  original_creator?: LiveblogUser | string;
  groups: PostGroup[];
  mainItem?: { item: PostItem };
  items?: Array<{ item: PostItem }>;
  multipleItems?: number | false;
  hasComments?: boolean;
  headline?: string;
  show_headline?: boolean;
  featured_image?: string;
  featured_image_url?: string;
  featured_image_renditions?: Record<
    string,
    { href?: string; width?: number; height?: number }
  >;
}

export interface PostItemPayload {
  blog: string;
  text?: string;
  meta?: Record<string, unknown>;
  group_type?: string;
  item_type: string;
  commenter?: string;
  syndicated_creator?: LiveblogUser;
}

export type PostsListResponse = EveList<Post>;
