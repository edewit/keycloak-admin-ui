import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  PageSection,
  Switch,
} from "@patternfly/react-core";
import {
  ActionsColumn,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import type { ManagementPermissionReference } from "@keycloak/keycloak-admin-client/lib/defs/managementPermissionReference";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toPermissionDetails } from "../../clients/routes/PermissionDetails";
import { KeycloakSpinner } from "../../components/keycloak-spinner/KeycloakSpinner";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { useWhoAmI } from "../../context/whoami/WhoAmI";
import { useConfirmDialog } from "../confirm-dialog/ConfirmDialog";

import "./permissions-tab.css";

type PermissionScreenType = "clients" | "users" | "groups";

type PermissionsTabProps = {
  id?: string;
  type: PermissionScreenType;
};

export const PermissionsTab = ({ id, type }: PermissionsTabProps) => {
  const { t } = useTranslation("common");
  const history = useHistory();
  const adminClient = useAdminClient();
  const { realm } = useRealm();
  const { whoAmI } = useWhoAmI();
  const [realmId, setRealmId] = useState("");
  const [permission, setPermission] = useState<ManagementPermissionReference>();

  const togglePermissionEnabled = (enabled: boolean) => {
    switch (type) {
      case "clients":
        return adminClient.clients.updateFineGrainPermission(
          { id: id! },
          { enabled }
        );
      case "users":
        return adminClient.realms.updateUsersManagementPermissions({
          realm,
          enabled,
        });
      case "groups":
        return adminClient.groups.updatePermission({ id: id! }, { enabled });
    }
  };

  useFetch(
    () =>
      Promise.all([
        adminClient.clients.find({
          search: true,
          clientId: realm,
        }),
        (() => {
          switch (type) {
            case "clients":
              return adminClient.clients.listFineGrainPermissions({ id: id! });
            case "users":
              return adminClient.realms.getUsersManagementPermissions({
                realm,
              });
            case "groups":
              return adminClient.groups.listPermissions({ id: id! });
          }
        })(),
      ]),
    ([clients, permission]) => {
      setRealmId(clients[0]?.id!);
      setPermission(permission);
    },
    []
  );

  const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
    titleKey: "common:permissionsDisable",
    messageKey: "common:permissionsDisableConfirm",
    continueButtonLabel: "common:confirm",
    onConfirm: async () => {
      const permission = await togglePermissionEnabled(false);
      setPermission(permission);
    },
  });

  if (!permission) {
    return <KeycloakSpinner />;
  }

  return (
    <PageSection variant="light">
      <DisableConfirm />
      <Card isFlat>
        <CardTitle>{t("permissions")}</CardTitle>
        <CardBody>
          {t(`${type}PermissionsHint`)}
          <Form isHorizontal className="pf-u-pt-md">
            <FormGroup
              hasNoPaddingTop
              className="permission-label"
              label={t("permissionsEnabled")}
              fieldId="permissionsEnabled"
              labelIcon={
                <HelpItem
                  helpText="clients-help:permissionsEnabled"
                  fieldLabelId="clients:permissionsEnabled"
                />
              }
            >
              <Switch
                id="permissionsEnabled"
                label={t("common:on")}
                labelOff={t("common:off")}
                isChecked={permission.enabled}
                onChange={async (enabled) => {
                  if (enabled) {
                    const permission = await togglePermissionEnabled(enabled);
                    setPermission(permission);
                  } else {
                    toggleDisableDialog();
                  }
                }}
              />
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
      {permission.enabled && (
        <>
          <Card isFlat className="pf-u-mt-lg">
            <CardTitle>{t("permissionsList")}</CardTitle>
            <CardBody>
              <Trans i18nKey="common:permissionsListIntro">
                {" "}
                <strong>{{ realm: `${realm}-realm` }}</strong>.
              </Trans>
            </CardBody>
          </Card>
          <Card isFlat className="keycloak__permission__permission-table">
            <CardBody className="pf-u-p-0">
              <TableComposable
                aria-label={t("permissionsList")}
                variant="compact"
              >
                <Thead>
                  <Tr>
                    <Th id="permissionsScopeName">
                      {t("permissionsScopeName")}
                    </Th>
                    <Th id="description">{t("description")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(permission.scopePermissions || {})
                    .sort((a, b) =>
                      a[0]!.localeCompare(b[0]!, whoAmI.getLocale())
                    )
                    .map(([name, id]) => (
                      <Tr key={id}>
                        <Td>
                          <Link
                            to={toPermissionDetails({
                              realm,
                              id: realmId,
                              permissionType: "scope",
                              permissionId: id,
                            })}
                          >
                            {name}
                          </Link>
                        </Td>
                        <Td>
                          {t(`scopePermissions.${type}.${name}-description`)}
                        </Td>
                        <Td isActionCell>
                          <ActionsColumn
                            items={[
                              {
                                title: t("common:edit"),
                                onClick() {
                                  history.push(
                                    toPermissionDetails({
                                      realm,
                                      id: realmId,
                                      permissionType: "scope",
                                      permissionId: id,
                                    })
                                  );
                                },
                              },
                            ]}
                          />
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </TableComposable>
            </CardBody>
          </Card>
        </>
      )}
    </PageSection>
  );
};
