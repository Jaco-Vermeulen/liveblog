export interface EveResource {
  _id: string;
  _etag?: string;
  _created?: string;
  _updated?: string;
}

export interface EveList<T> {
  _items: T[];
  _meta: {
    total: number;
    page?: number;
    max_results?: number;
  };
  _links?: {
    next?: { href: string };
    prev?: { href: string };
  };
}

export interface LiveblogUser extends EveResource {
  username: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string | null;
  jid?: string | null;
  slack_username?: string | null;
  user_type?: 'administrator' | 'user' | string;
  role?: string | null;
  desk?: string | null;
  is_active?: boolean;
  is_enabled?: boolean;
  is_author?: boolean;
  sign_off?: string | null;
  byline?: string | null;
  biography?: string | null;
  job_title?: string | null;
  language?: string | null;
  picture_url?: string;
  avatar?: string;
  avatar_renditions?: Record<string, { href?: string; width?: number; height?: number }>;
  needs_activation?: boolean;
  _links?: { self?: { href: string } };
}

export interface PasswordResetRequest extends EveResource {
  email?: string;
  expire_time?: string;
}

export interface ActivityRecipient {
  user_id?: string;
  desk_id?: string;
  read: boolean;
}

/** Superdesk activity / user notification item */
export interface ActivityNotification extends EveResource {
  name: string;
  message?: string;
  data?: Record<string, unknown>;
  recipients: ActivityRecipient[];
  item?: string;
  item_slugline?: string;
  user?: string;
  user_name?: string;
  resource?: string | null;
  desk?: string;
  /** Client-only — unread for current user */
  _unread?: boolean;
  /** Embedded user when query uses embedded: { user: 1 } */
  embeddedUser?: Partial<LiveblogUser>;
}

export interface ChangePasswordBody {
  username: string;
  old_password: string;
  new_password: string;
}

export type UserProfileUpdate = Pick<
  LiveblogUser,
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'sign_off'
  | 'byline'
  | 'biography'
  | 'is_author'
  | 'avatar'
>;

/** Admin user management (privilege `users`) */
export type UserAdminUpdate = UserProfileUpdate &
  Pick<LiveblogUser, 'user_type' | 'role' | 'is_active' | 'is_enabled'>;

export interface CreateUserBody {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  /** Omit — server sends activation e-mail via `reset_user_password`. */
  password?: string;
  phone?: string;
  user_type?: 'administrator' | 'user';
  is_author?: boolean;
  role?: string | null;
}


export interface SessionData extends EveResource {
  token: string;
  user: string;
  _links?: {
    self?: { href: string };
  };
}

export interface AuthLoginBody {
  username: string;
  password: string;
}

export type BlogStatusCode = 'open' | 'closed' | 'deleted';

export interface BlogMember {
  user: string;
  role?: string;
}

export interface Blog extends EveResource {
  title: string;
  description?: string;
  blog_status: BlogStatusCode;
  picture_url?: string;
  picture?: string;
  picture_renditions?: Record<string, { href?: string } | string>;
  total_posts?: number;
  posts_limit?: number;
  category?: string;
  users_can_comment?: string;
  syndication_enabled?: boolean;
  market_enabled?: boolean;
  language?: string;
  public_url?: string;
  public_urls?: {
    output?: Record<string, string>;
    [key: string]: unknown;
  };
  members?: BlogMember[];
  original_creator: LiveblogUser | string;
  blog_preferences?: { theme?: string; [key: string]: unknown };
  consumers_settings?: Record<string, { tags?: string[] | null }>;
}

export interface PollAnswer {
  option: string;
  votes: number;
  percentage?: number;
}

export interface PollBody {
  question: string;
  answers: PollAnswer[];
  active_until: string;
  totalVotes?: number;
  elapsed?: boolean;
  timeLeft?: string;
}

export interface Poll extends EveResource {
  blog: string;
  item_type?: string;
  poll_body: PollBody;
}

export interface Output extends EveResource {
  name: string;
  blog: string;
  collection: string;
  theme?: string | null;
  tags?: string[];
  style?: Record<string, string | null>;
  settings?: { frequency?: number; order?: number };
  logo_url?: string | null;
  main_page_url?: string | null;
  deleted?: boolean;
}

export interface Consumer extends EveResource {
  name: string;
  webhook_url: string;
  webhook_enabled?: boolean;
  api_key?: string;
  contacts?: Array<{ email: string; first_name?: string; last_name?: string }>;
}

export interface Collection extends EveResource {
  name: string;
  deleted?: boolean;
}

export interface ThemeAuthor {
  name?: string;
  email?: string;
  url?: string;
}

export interface ThemeBlogSummary {
  _id: string;
  title: string;
  iframe_url?: string;
}

export interface ThemeSettingOption {
  name: string;
  label?: string;
  type:
    | 'checkbox'
    | 'select'
    | 'text'
    | 'number'
    | 'textarea'
    | 'groupheading'
    | 'datetimeformat';
  default?: unknown;
  help?: string;
  isAdvanced?: boolean;
  dependsOn?: Record<string, unknown>;
  options?: { value: string; label: string }[];
}

export interface ThemeStyleDropdownOption {
  value: string;
  label: string;
}

export interface ThemeStyleOptionItem {
  label: string;
  property: string;
  type: 'text' | 'colorpicker' | 'dropdown' | 'fontpicker';
  placeholder?: string;
  options?: ThemeStyleDropdownOption[];
  help?: string;
  default?: string | number;
  tagName?: string;
  linkedToGroup?: string;
}

export interface ThemeStyleGroup {
  label: string;
  name: string;
  cssSelector: string;
  options: ThemeStyleOptionItem[];
  columns: string;
  serializerIgnore?: boolean;
}

export type StyleSettings = Record<string, Record<string, unknown>>;

export interface Theme extends EveResource {
  name: string;
  label?: string;
  version?: string;
  abstract?: boolean;
  extends?: string;
  author?: ThemeAuthor | string;
  screenshot_url?: string;
  blogs_count?: number;
  blogs?: ThemeBlogSummary[];
  blogs_data?: { total: number; _items: ThemeBlogSummary[] };
  options?: ThemeSettingOption[];
  settings?: Record<string, unknown>;
  styleOptions?: ThemeStyleGroup[];
  styleSettings?: StyleSettings;
  supportStylesSettings?: boolean;
  /** Base URL for theme static assets (styles, scripts) on the liveblog server */
  public_url?: string;
  styles?: string[];
  scripts?: string[];
}

export interface GlobalPreference extends EveResource {
  key: string;
  value?: unknown;
}

export interface LanguageOption extends EveResource {
  name: string;
  language_code?: string;
}

export interface InstanceSettingsDocument extends EveResource {
  settings: Record<string, unknown>;
}

export interface ArchiveUploadResult extends EveResource {
  renditions?: Record<string, { href?: string }>;
  _status?: string;
}

export interface CreateBlogPayload {
  title: string;
  description: string;
  picture_url?: string;
  picture?: string;
  picture_renditions?: Record<string, unknown>;
  members: { user: string }[];
  blog_preferences: { theme: string };
}

export interface BlogslistEmbed extends EveResource {
  key?: string;
  value?: string;
}

export interface BlogAnalyticsRow extends EveResource {
  blog_id: string;
  context_url: string;
  hits: number;
}

export interface Freetype extends EveResource {
  name: string;
  template: string;
}

export interface Advertisement extends EveResource {
  name: string;
  type: string;
  text: string;
  meta: { data: Record<string, unknown> };
  deleted?: boolean;
}

export interface AdvertisementCollection extends EveResource {
  name: string;
  advertisements: Array<{ advertisement_id: string }>;
  deleted?: boolean;
}

export interface MarketplaceBlog extends EveResource {
  title: string;
  start_date: string;
  marketer?: { _id?: string; name?: string };
  [key: string]: unknown;
}

export interface MarketplaceMarketer extends EveResource {
  name: string;
}

export interface MarketplaceLanguage extends EveResource {
  name: string;
}

export interface SyndicationProducer extends EveResource {
  name: string;
  contacts?: unknown[];
}

export interface SyndicationConsumer extends EveResource {
  name: string;
  contacts?: Array<{ first_name?: string; last_name?: string; email?: string }>;
}

export interface SyndicationIn extends EveResource {
  blog_id: string;
  producer_blog_id: string;
  blog_token: string;
  auto_publish: boolean;
  auto_retrieve: boolean;
}

export interface SyndicationOut extends EveResource {
  blog_id: string;
  consumer_id: string;
}
