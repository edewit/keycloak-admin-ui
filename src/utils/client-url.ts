import ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { joinPath } from "./joinPath";

export const convertClientToUrl = (
  client: ClientRepresentation,
  adminClientBaseUrl: string
) => {
  const rootUrl = client.rootUrl;
  const baseUrl = client.baseUrl;

  // absolute base url configured, use base url is
  if (baseUrl?.startsWith("http")) {
    return baseUrl;
  }

  if (
    (rootUrl === "${authBaseUrl}" || rootUrl === "${authAdminUrl}") &&
    baseUrl
  ) {
    return rootUrl.replace(
      /\$\{(authAdminUrl|authBaseUrl)\}/,
      joinPath(adminClientBaseUrl, baseUrl)
    );
  }

  if (rootUrl?.startsWith("http")) {
    if (baseUrl) {
      return joinPath(rootUrl, baseUrl);
    }
    return rootUrl;
  }

  return baseUrl;
};
