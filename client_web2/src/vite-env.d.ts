/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIVEBLOG_API_URL: string;
  readonly VITE_LIVEBLOG_WS_URL: string;
  readonly VITE_MARKETPLACE?: string;
  readonly VITE_SYNDICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
