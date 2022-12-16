import RealmRepresentation from "libs/keycloak-admin-client/lib/defs/realmRepresentation";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { KeycloakSpinner } from "../../components/keycloak-spinner/KeycloakSpinner";
import { RecentUsed } from "../../components/realm-selector/recent-used";
import {
  DashboardParams,
  DashboardRouteWithRealm,
} from "../../dashboard/routes/Dashboard";
import environment from "../../environment";
import { createNamedContext } from "../../utils/createNamedContext";
import useRequiredContext from "../../utils/useRequiredContext";
import { useAdminClient, useFetch } from "../auth/AdminClient";

type RealmContextType = {
  realm: string;
  realmRepresentation: RealmRepresentation;
};

export const RealmContext = createNamedContext<RealmContextType | undefined>(
  "RealmContext",
  undefined
);

export const RealmContextProvider: FunctionComponent = ({ children }) => {
  const { adminClient } = useAdminClient();
  const recentUsed = useMemo(() => new RecentUsed(), []);
  const [realmRepresentation, setRealmRepresentation] =
    useState<RealmRepresentation>();
  const routeMatch = useRouteMatch<DashboardParams>(
    DashboardRouteWithRealm.path
  );
  const realmParam = routeMatch?.params.realm;
  const realm = useMemo(
    () => realmParam ?? environment.loginRealm,
    [realmParam]
  );

  // Configure admin client to use selected realm when it changes.
  useEffect(() => adminClient.setConfig({ realmName: realm }), [realm]);

  // Keep track of recently used realms when selected realm changes.
  useEffect(() => recentUsed.setRecentUsed(realm), [realm]);

  useFetch(
    () => adminClient.realms.findOne({ realm }),
    setRealmRepresentation,
    [realm]
  );

  if (!realmRepresentation) {
    return <KeycloakSpinner />;
  }

  return (
    <RealmContext.Provider value={{ realm, realmRepresentation }}>
      {children}
    </RealmContext.Provider>
  );
};

export const useRealm = () => useRequiredContext(RealmContext);
