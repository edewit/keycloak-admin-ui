import type { LocationDescriptorObject } from "history";
import { lazy } from "react";
import { generatePath } from "react-router-dom";
import type { RouteDef } from "../../route-config";

export type KeyProviderParams = {
  id: string;
  providerType: string;
  realm: string;
};

export const KeyProviderFormRoute: RouteDef = {
  path: "/:realm/realm-settings/keys/providers/:id/:providerType/settings",
  component: lazy(() => import("../keys/key-providers/KeyProviderForm")),
  breadcrumb: (t) => t("realm-settings:editProvider"),
  access: "view-realm",
};

export const toKeyProvider = (
  params: KeyProviderParams
): LocationDescriptorObject => ({
  pathname: generatePath(KeyProviderFormRoute.path, params),
});
