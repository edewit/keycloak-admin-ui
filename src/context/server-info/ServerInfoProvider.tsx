import React, { createContext, FunctionComponent, useState } from "react";

import type { ServerInfoRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { sortProviders } from "../../util";
import { useAdminClient, useFetch } from "../auth/AdminClient";
import useRequiredContext from "../../utils/useRequiredContext";

export const ServerInfoContext = createContext<
  ServerInfoRepresentation | undefined
>(undefined);

export const useServerInfo = () => useRequiredContext(ServerInfoContext);

export const useLoginProviders = () =>
  sortProviders(useServerInfo().providers!["login-protocol"].providers);

export const ServerInfoProvider: FunctionComponent = ({ children }) => {
  const adminClient = useAdminClient();
  const [serverInfo, setServerInfo] = useState<ServerInfoRepresentation>({});

  useFetch(adminClient.serverInfo.find, setServerInfo, []);

  return (
    <ServerInfoContext.Provider value={serverInfo}>
      {children}
    </ServerInfoContext.Provider>
  );
};
