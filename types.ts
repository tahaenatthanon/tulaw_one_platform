import { CategoryId } from "@/components/settings/category-sidebar";

export type { CategoryId } from "@/components/settings/category-sidebar";

export interface AuthSettings {
  sessionTimeout: string;
  jwtExpiry: string;
  maxLoginAttempts: string;
  mfaEnforced: boolean;
}

export interface SsoSettings {
  ldapUrl: string;
  baseDn: string;
  domain: string;
  syncInterval: string;
  enabled: boolean;
}

export interface BrandingSettings {
  name: string;
  color: string;
  logoUrl?: string;
}

export interface StorageSettings {
  quota: string;
  fileTypes: string[];
  projectTypes?: string[];
  annCats?: { id: string; name: string; color: string }[];
  projCats?: { id: string; name: string; color: string }[];
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string;
  createdAt: string;
  lastUsed: string;
  status?: "active" | "revoked";
}

export interface SystemConfigViewProps {
  loading: boolean;
  saving: boolean;
  saved: boolean;
  dirty: boolean;
  auth: AuthSettings;
  sso: SsoSettings;
  branding: BrandingSettings;
  storage: StorageSettings;
  apiKeys: ApiKey[];
  onAuthChange: (v: AuthSettings) => void;
  onSsoChange: (v: SsoSettings) => void;
  onBrandingChange: (v: BrandingSettings) => void;
  onStorageChange: (v: StorageSettings) => void;
  onApiKeysChange: (v: ApiKey[]) => void;
  onSave: () => void;
  onReset: () => void;
}