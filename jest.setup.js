// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from "./src/common-messages.json";
import clients from "./src/clients/messages.json";
import realm from "./src/realm/messages.json";
import groups from "./src/groups/messages.json";
import help from "./src/help.json";

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  // have a common namespace used around the full app
  ns: ["common", "help", "clients", "realm", "groups"],
  defaultNS: "common",
  resources: {
    en: { ...common, ...help, ...clients, ...realm, ...groups },
  },
});

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
