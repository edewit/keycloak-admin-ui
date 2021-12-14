import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import HttpBackend from "i18next-http-backend";

export const DEFAULT_LOCALE = "en";

export const initOptions = {
  defaultNS: "common",
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  preload: [DEFAULT_LOCALE],
  ns: [
    "common",
    "common-help",
    "dashboard",
    "clients",
    "clients-help",
    "client-scopes",
    "client-scopes-help",
    "groups",
    "realm",
    "roles",
    "users",
    "users-help",
    "sessions",
    "events",
    "realm-settings",
    "realm-settings-help",
    "authentication",
    "authentication-help",
    "user-federation",
    "user-federation-help",
    "identity-providers",
    "identity-providers-help",
    "dynamic",
  ],

  interpolation: {
    escapeValue: false,
  },

  backend: {
    expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    loadPath: "/auth/admin/master/console/{{ns}}.json?lang={{lng}}",
  },
};

const configuredI18n = i18n.use(initReactI18next).use(HttpBackend);

export default configuredI18n;
