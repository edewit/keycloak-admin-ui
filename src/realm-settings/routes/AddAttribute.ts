import type { LocationDescriptorObject } from "history";
import { lazy } from "react";
import { generatePath } from "react-router-dom";
import type { RouteDef } from "../../route-config";

export type AddAttributeParams = {
  realm: string;
};

export const AddAttributeRoute: RouteDef = {
  path: "/:realm/realm-settings/user-profile/attributes/add-attribute",
  component: lazy(() => import("../NewAttributeSettings")),
  breadcrumb: (t) => t("realm-settings:createAttribute"),
  access: "manage-realm",
};

export const toAddAttribute = (
  params: AddAttributeParams
): LocationDescriptorObject => ({
  pathname: generatePath(AddAttributeRoute.path, params),
});
