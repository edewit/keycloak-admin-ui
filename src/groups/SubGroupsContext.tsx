import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import React, { createContext, FunctionComponent, useState } from "react";
import useRequiredContext from "../utils/useRequiredContext";

type SubGroupsProps = {
  subGroups: GroupRepresentation[];
  setSubGroups: (group: GroupRepresentation[]) => void;
  clear: () => void;
  remove: (group: GroupRepresentation) => void;
  currentGroup: () => GroupRepresentation | undefined;
};

const SubGroupContext = createContext<SubGroupsProps | undefined>(undefined);

export const SubGroups: FunctionComponent = ({ children }) => {
  const [subGroups, setSubGroups] = useState<GroupRepresentation[]>([]);

  const clear = () => setSubGroups([]);
  const remove = (group: GroupRepresentation) =>
    setSubGroups(
      subGroups.slice(0, subGroups.findIndex((g) => g.id === group.id) + 1)
    );
  const currentGroup = () => subGroups[subGroups.length - 1];
  return (
    <SubGroupContext.Provider
      value={{ subGroups, setSubGroups, clear, remove, currentGroup }}
    >
      {children}
    </SubGroupContext.Provider>
  );
};

export const useSubGroups = () => useRequiredContext(SubGroupContext);
