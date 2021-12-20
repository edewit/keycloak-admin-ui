import { lazy } from "react";
import { generatePath } from "react-router-dom";

import type { LocationDescriptorObject } from "history";
import type { RouteDef } from "../../route-config";

export type ProviderRouteParams = {
  realm: string;
  providerId: string;
  id?: string;
};

export const CustomProviderRoute: RouteDef = {
  path: "/:realm/user-federation/:providerId/new",
  component: lazy(() => import("../custom/CustomProviderSettings")),
  access: "view-realm",
};

export const CustomEditProviderRoute: RouteDef = {
  path: "/:realm/user-federation/:providerId/:id",
  component: lazy(() => import("../custom/CustomProviderSettings")),
  access: "view-realm",
};

export const toProvider = (
  params: ProviderRouteParams
): LocationDescriptorObject => ({
  pathname: generatePath(CustomProviderRoute.path, params),
});
