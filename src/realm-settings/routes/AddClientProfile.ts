import type { LocationDescriptorObject } from "history";
import { lazy } from "react";
import { generatePath } from "react-router-dom";
import type { RouteDef } from "../../route-config";

export type AddClientProfileParams = {
  realm: string;
};

export const AddClientProfileRoute: RouteDef = {
  path: "/:realm/realm-settings/clientPolicies/add-profile",
  component: lazy(() => import("../ClientProfileForm")),
  breadcrumb: (t) => t("realm-settings:newClientProfile"),
  access: "manage-realm",
};

export const toAddClientProfile = (
  params: AddClientProfileParams
): LocationDescriptorObject => ({
  pathname: generatePath(AddClientProfileRoute.path, params),
});
