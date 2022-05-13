import React, {
  createContext,
  FunctionComponent,
  useContext,
  useState,
} from "react";

import type { ServerInfoRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { sortProviders } from "../../util";
import { useAdminClient, useFetch } from "../auth/AdminClient";

export const ServerInfoContext = createContext<
  ServerInfoRepresentation | undefined
>(undefined);

export const useServerInfo = () => {
  const serverInfo = useContext(ServerInfoContext);
  if (serverInfo === undefined) {
    throw new Error("Forbidden");
  }
  return serverInfo;
};

export const useLoginProviders = () => {
  return sortProviders(useServerInfo().providers!["login-protocol"].providers);
};

export const ServerInfoProvider: FunctionComponent = ({ children }) => {
  const adminClient = useAdminClient();
  const [serverInfo, setServerInfo] = useState<ServerInfoRepresentation>();

  useFetch(
    async () => {
      try {
        return await adminClient.serverInfo.find();
      } catch (error) {
        return undefined;
      }
    },
    setServerInfo,
    []
  );

  return (
    <ServerInfoContext.Provider value={serverInfo}>
      {children}
    </ServerInfoContext.Provider>
  );
};
