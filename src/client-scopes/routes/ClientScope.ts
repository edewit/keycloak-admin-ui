import type { LocationDescriptorObject } from "history";
import { lazy } from "react";
import { generatePath } from "react-router-dom";
import type { RouteDef } from "../../route-config";

export type ClientScopeTab = "settings" | "mappers" | "scope";

export type ClientScopeParams = {
  realm: string;
  id: string;
  tab: ClientScopeTab;
  type?: string;
};

export const ClientScopeRoute: RouteDef = {
  path: "/:realm/client-scopes/:id/:tab/:type?",
  component: lazy(() => import("../form/ClientScopeForm")),
  breadcrumb: (t) => t("client-scopes:clientScopeDetails"),
  access: "view-clients",
};

export const toClientScope = (
  params: ClientScopeParams
): LocationDescriptorObject => ({
  pathname: generatePath(ClientScopeRoute.path, params),
});
