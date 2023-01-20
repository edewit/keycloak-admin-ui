import ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { Button, ToolbarItem } from "@patternfly/react-core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { KeycloakDataTable } from "../../components/table-toolbar/KeycloakDataTable";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { toAddRegistrationProviderTab } from "../routes/AddRegistrationProvider";
import { ClientRegistrationParams } from "../routes/ClientRegistration";
import { AddProviderDialog } from "./AddProviderDialog";

export const AnonymousList = () => {
  const { t } = useTranslation("clients");
  const { subTab } = useParams<ClientRegistrationParams>();
  const navigate = useNavigate();

  const { adminClient } = useAdminClient();
  const { realm } = useRealm();
  const [policies, setPolicies] = useState<ComponentRepresentation[]>([]);
  const [isAddDialogOpen, toggleAddDialog] = useToggle();

  useFetch(
    () =>
      adminClient.components.find({
        type: "org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy",
      }),
    setPolicies,
    []
  );

  return (
    <>
      {isAddDialogOpen && (
        <AddProviderDialog
          onConfirm={(providerId) =>
            navigate(
              toAddRegistrationProviderTab({
                realm,
                subTab: subTab || "anonymous",
                providerId,
              })
            )
          }
          toggleDialog={toggleAddDialog}
        />
      )}
      <KeycloakDataTable
        ariaLabelKey="clients:initialAccessToken"
        searchPlaceholderKey="clients:searchInitialAccessToken"
        loader={policies}
        toolbarItem={
          <ToolbarItem>
            <Button data-testid="createPolicy" onClick={toggleAddDialog}>
              {t("createPolicy")}
            </Button>
          </ToolbarItem>
        }
        columns={[
          {
            name: "name",
            displayKey: "common:name",
          },
          {
            name: "providerId",
            displayKey: "clients:providerId",
          },
        ]}
      />
    </>
  );
};
