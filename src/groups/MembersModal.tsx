import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import {
  AlertVariant,
  Button,
  Modal,
  ModalVariant,
} from "@patternfly/react-core";

import type UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import { useAdminClient } from "../context/auth/AdminClient";
import { useRealm } from "../context/realm-context/RealmContext";
import { useAlerts } from "../components/alert/Alerts";
import { KeycloakDataTable } from "../components/table-toolbar/KeycloakDataTable";
import { ListEmptyState } from "../components/list-empty-state/ListEmptyState";
import { emptyFormatter } from "../util";
import _ from "lodash";

type MemberModalProps = {
  groupId: string;
  onClose: () => void;
};

export const MemberModal = ({ groupId, onClose }: MemberModalProps) => {
  const { t } = useTranslation("groups");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const [selectedRows, setSelectedRows] = useState<UserRepresentation[]>([]);

  const history = useHistory();
  const { realm } = useRealm();
  const goToCreate = () => history.push(`/${realm}/users/add-user`);

  const loader = async (first?: number, max?: number, search?: string) => {
    const members = await adminClient.groups.listMembers({ id: groupId });
    const params: { [name: string]: string | number } = {
      first: first!,
      max: max! + members.length,
      search: search || "",
    };

    try {
      const users = await adminClient.users.find({ ...params });
      return _.differenceBy(users, members, "id").slice(0, max);
    } catch (error) {
      addError("groups:noUsersFoundError", error);
      return [];
    }
  };

  return (
    <Modal
      variant={ModalVariant.large}
      title={t("addMember")}
      isOpen={true}
      onClose={onClose}
      actions={[
        <Button
          data-testid="add"
          key="confirm"
          variant="primary"
          onClick={async () => {
            try {
              await Promise.all(
                selectedRows.map((user) =>
                  adminClient.users.addToGroup({ id: user.id!, groupId })
                )
              );
              onClose();
              addAlert(
                t("usersAdded", { count: selectedRows.length }),
                AlertVariant.success
              );
            } catch (error) {
              addError("groups:usersAddedError", error);
            }
          }}
        >
          {t("common:add")}
        </Button>,
        <Button
          data-testid="cancel"
          key="cancel"
          variant="link"
          onClick={onClose}
        >
          {t("common:cancel")}
        </Button>,
      ]}
    >
      <KeycloakDataTable
        loader={loader}
        isPaginated
        ariaLabelKey="users:title"
        searchPlaceholderKey="users:searchForUser"
        canSelectAll
        onSelect={(rows) => setSelectedRows([...rows])}
        emptyState={
          <ListEmptyState
            message={t("users:noUsersFound")}
            instructions={t("users:emptyInstructions")}
            primaryActionText={t("users:createNewUser")}
            onPrimaryAction={goToCreate}
          />
        }
        columns={[
          {
            name: "username",
            displayKey: "users:username",
          },
          {
            name: "email",
            displayKey: "users:email",
          },
          {
            name: "lastName",
            displayKey: "users:lastName",
            cellFormatters: [emptyFormatter()],
          },
          {
            name: "firstName",
            displayKey: "users:firstName",
            cellFormatters: [emptyFormatter()],
          },
        ]}
      />
    </Modal>
  );
};
