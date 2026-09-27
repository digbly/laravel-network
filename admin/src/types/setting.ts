export type LocaleValues = Record<string, string>;

export interface SettingsData {
  title: LocaleValues;
  description: LocaleValues;
  sitename: string | null;
  logo: string | null;
  favicon: string | null;
  banner: string | null;
  user_registration: boolean | null;
  user_verification: boolean | null;
}

export interface UpdateSettingsPayload {
  title: LocaleValues;
  description: LocaleValues;
  sitename: string | null;
  logo: string | null;
  favicon: string | null;
  banner: string | null;
  user_registration: boolean;
  user_verification: boolean;
}
