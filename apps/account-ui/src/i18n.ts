import i18n, { InitOptions } from "i18next";
import HttpBackend, { LoadPathOption } from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const DEFAULT_LOCALE = "en";

export const init = () => {
  const options = initOptions();
  i18n.init(options);
};

const initOptions = (): InitOptions => {
  const constructLoadPath: LoadPathOption = () => {
    return `./resources/{{lng}}/{{ns}}.json`;
  };

  return {
    defaultNS: "console",
    fallbackLng: DEFAULT_LOCALE,
    preload: [DEFAULT_LOCALE],
    ns: ["console"],
    interpolation: {
      escapeValue: false,
    },
    postProcess: ["overrideProcessor"],
    backend: {
      loadPath: constructLoadPath,
    },
  };
};

const configuredI18n = i18n.use(initReactI18next).use(HttpBackend);

export default configuredI18n;
