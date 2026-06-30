/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL. Defaults to the production project when unset. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
