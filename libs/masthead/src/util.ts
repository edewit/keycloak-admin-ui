import Keycloak from "keycloak-js";
import { TranslateFunction } from "./Masthead";

export function loggedInUserName(keycloak: Keycloak, t: TranslateFunction) {
  let userName = t("unknownUser");
  if (keycloak.tokenParsed) {
    const givenName = keycloak.tokenParsed.given_name;
    const familyName = keycloak.tokenParsed.family_name;
    const preferredUsername = keycloak.tokenParsed.preferred_username;
    if (givenName && familyName) {
      userName = t("fullName", [givenName, familyName]);
    } else {
      userName = givenName || familyName || preferredUsername || userName;
    }
  }
  return userName;
}
