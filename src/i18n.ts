import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import backend from "i18next-http-backend";
import detector from "i18next-browser-languagedetector";
import roles from "./realm-roles/messages.json";

const initOptions = {
  ns: ["common", "help", "clients", "realm", "roles", "groups"],
  defaultNS: "common",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
  react: {
    wait: true,
  },
};

i18n.use(detector).use(initReactI18next).use(backend).init(initOptions);

export default i18n;
