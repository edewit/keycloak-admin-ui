import { FunctionComponent, useEffect, useMemo } from "react";
import { useMatch } from "react-router-dom-v5-compat";

import { RecentUsed } from "../../components/realm-selector/recent-used";
import { DashboardRouteWithRealm } from "../../dashboard/routes/Dashboard";
import environment from "../../environment";
import { createNamedContext } from "../../utils/createNamedContext";
import useRequiredContext from "../../utils/useRequiredContext";
import { useAdminClient } from "../auth/AdminClient";

type RealmContextType = {
  realm: string;
};

export const RealmContext = createNamedContext<RealmContextType | undefined>(
  "RealmContext",
  undefined
);

export const RealmContextProvider: FunctionComponent = ({ children }) => {
  const { adminClient } = useAdminClient();
  const recentUsed = useMemo(() => new RecentUsed(), []);
  const routeMatch = useMatch({
    path: DashboardRouteWithRealm.path,
    end: false,
  });

  const realmParam = routeMatch?.params.realm;
  const realm = useMemo(
    () => realmParam ?? environment.loginRealm,
    [realmParam]
  );

  // Configure admin client to use selected realm when it changes.
  useEffect(() => adminClient.setConfig({ realmName: realm }), [realm]);

  // Keep track of recently used realms when selected realm changes.
  useEffect(() => recentUsed.setRecentUsed(realm), [realm]);

  const value = useMemo(() => ({ realm }), [realm]);

  return (
    <RealmContext.Provider value={value}>{children}</RealmContext.Provider>
  );
};

export const useRealm = () => useRequiredContext(RealmContext);
