import type { LocationDescriptorObject } from "history";
import type { RouteDef } from "../../route-config";
import { generatePath } from "react-router-dom";
import { lazy } from "react";

type PermissionCreationType = "resource" | "scope";

export type PermissionDetailsParams = {
  realm: string;
  id: string;
  permissionCreationType?: PermissionCreationType;
  permissionId?: string;
};

export const PermissionDetailsRoute: RouteDef = {
  path: "/:realm/clients/:id/authorization/permission/:permissionId?",
  component: lazy(() => import("../authorization/PermissionDetails")),
  breadcrumb: (t) => t("clients:createPermission"),
  access: "manage-clients",
};

export const toPermissionDetails = (
  params: PermissionDetailsParams
): LocationDescriptorObject => ({
  pathname: generatePath(PermissionDetailsRoute.path, params),
});
