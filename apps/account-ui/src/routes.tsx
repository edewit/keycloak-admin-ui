import type { IndexRouteObject, RouteObject } from "react-router";

import { DeviceActivity } from "./account-security/DeviceActivity";
import { LinkedAccounts } from "./account-security/LinkedAccounts";
import { SigningIn } from "./account-security/SigningIn";
import { Applications } from "./applications/Applications";
import { Groups } from "./groups/Groups";
import { PersonalInfo } from "./personal-info/PersonalInfo";
import { Resources } from "./resources/Resources";
import { ErrorPage } from "./root/ErrorPage";
import { Root } from "./root/Root";
import { RootIndex } from "./root/RootIndex";

export const DeviceActivityRoute: RouteObject = {
  path: "account-security/device-activity",
  element: <DeviceActivity />,
};

export const LinkedAccountsRoute: RouteObject = {
  path: "account-security/linked-accounts",
  element: <LinkedAccounts />,
};

export const SigningInRoute: RouteObject = {
  path: "account-security/signing-in",
  element: <SigningIn />,
};

export const ApplicationsRoute: RouteObject = {
  path: "applications",
  element: <Applications />,
};

export const GroupsRoute: RouteObject = {
  path: "groups",
  element: <Groups />,
};

export const PersonalInfoRoute: RouteObject = {
  path: "personal-info",
  element: <PersonalInfo />,
};

export const ResourcesRoute: RouteObject = {
  path: "resources",
  element: <Resources />,
};

export const RootIndexRoute: IndexRouteObject = {
  index: true,
  element: <RootIndex />,
};

export const RootRoute: RouteObject = {
  path: "/",
  element: <Root />,
  errorElement: <ErrorPage />,
  children: [
    RootIndexRoute,
    DeviceActivityRoute,
    LinkedAccountsRoute,
    SigningInRoute,
    ApplicationsRoute,
    GroupsRoute,
    PersonalInfoRoute,
    ResourcesRoute,
  ],
};

export const routes: RouteObject[] = [RootRoute];
