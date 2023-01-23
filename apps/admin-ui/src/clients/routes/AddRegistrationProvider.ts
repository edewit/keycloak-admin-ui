import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generatePath } from "react-router-dom";
import type { RouteDef } from "../../route-config";
import { ClientRegistrationTab } from "./ClientRegistration";

export type AddRegistrationProviderParams = {
  realm: string;
  subTab: ClientRegistrationTab;
  providerId: string;
};
export const AddRegistrationProviderRoute: RouteDef = {
  path: "/:realm/clients/client-registration/:subTab/:providerId",
  component: lazy(() => import("../registration/AddProvider")),
  breadcrumb: (t) => t("clients:clientSettings"),
  access: "manage-clients",
};

export const toAddRegistrationProviderTab = (
  params: AddRegistrationProviderParams
): Partial<Path> => ({
  pathname: generatePath(AddRegistrationProviderRoute.path, params),
});
