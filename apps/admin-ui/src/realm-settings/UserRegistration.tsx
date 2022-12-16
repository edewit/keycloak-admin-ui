import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertVariant, Tab, Tabs, TabTitleText } from "@patternfly/react-core";

import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useAdminClient } from "../context/auth/AdminClient";
import { useRealm } from "../context/realm-context/RealmContext";
import { useAlerts } from "../components/alert/Alerts";
import { RoleMapping } from "../components/role-mapping/RoleMapping";
import { DefaultsGroupsTab } from "./DefaultGroupsTab";

export const UserRegistration = () => {
  const { t } = useTranslation("realm-settings");
  const [activeTab, setActiveTab] = useState(10);
  const [key, setKey] = useState(0);

  const { adminClient } = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const { realmRepresentation: realm } = useRealm();

  const addComposites = async (composites: RoleRepresentation[]) => {
    const compositeArray = composites;

    try {
      await adminClient.roles.createComposite(
        { roleId: realm.defaultRole!.id!, realm: realm.realm },
        compositeArray
      );
      setKey(key + 1);
      addAlert(t("roles:addAssociatedRolesSuccess"), AlertVariant.success);
    } catch (error) {
      addError("roles:addAssociatedRolesError", error);
    }
  };

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(_, key) => setActiveTab(key as number)}
    >
      <Tab
        key={key}
        id="roles"
        eventKey={10}
        title={<TabTitleText>{t("defaultRoles")}</TabTitleText>}
      >
        <RoleMapping
          name={realm.defaultRole!.name!}
          id={realm.defaultRole!.id!}
          type="roles"
          isManager
          save={(rows) => addComposites(rows.map((r) => r.role))}
        />
      </Tab>
      <Tab
        id="groups"
        eventKey={20}
        title={<TabTitleText>{t("defaultGroups")}</TabTitleText>}
      >
        <DefaultsGroupsTab />
      </Tab>
    </Tabs>
  );
};
