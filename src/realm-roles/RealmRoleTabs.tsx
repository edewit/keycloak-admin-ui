import React, { useState } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import {
  AlertVariant,
  ButtonVariant,
  DropdownItem,
  PageSection,
  Spinner,
  Tab,
  TabTitleText,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { useFieldArray, useForm } from "react-hook-form";
import { omit } from "lodash";

import { useAlerts } from "../components/alert/Alerts";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import {
  AttributesForm,
  attributesToArray,
  arrayToAttributes,
  AttributeForm,
} from "../components/attribute-form/AttributeForm";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { RealmRoleForm } from "./RealmRoleForm";
import { useRealm } from "../context/realm-context/RealmContext";
import { AssociatedRolesModal } from "./AssociatedRolesModal";
import { KeycloakTabs } from "../components/keycloak-tabs/KeycloakTabs";
import { AssociatedRolesTab } from "./AssociatedRolesTab";
import { UsersInRoleTab } from "./UsersInRoleTab";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";

export default function RealmRoleTabs() {
  const { t } = useTranslation("roles");
  const form = useForm<AttributeForm>({
    mode: "onChange",
  });
  const { control, setValue, getValues, trigger, reset } = form;
  const history = useHistory();

  const adminClient = useAdminClient();
  const [role, setRole] = useState<AttributeForm>();

  const { id, clientId } = useParams<{ id: string; clientId: string }>();

  const { url } = useRouteMatch();

  const { realm: realmName } = useRealm();

  const [key, setKey] = useState("");

  const refresh = () => {
    setKey(`${new Date().getTime()}`);
  };

  const { addAlert, addError } = useAlerts();

  const [open, setOpen] = useState(false);
  const convert = (role: RoleRepresentation) => {
    const { attributes, ...rest } = role;
    return {
      attributes: attributesToArray(attributes),
      ...rest,
    };
  };

  const [realm, setRealm] = useState<RealmRepresentation>();

  useFetch(
    async () => {
      const realm = await adminClient.realms.findOne({ realm: realmName });
      if (!id) {
        return { realm };
      }
      const role = await adminClient.roles.findOneById({ id });
      return { realm, role };
    },
    ({ realm, role }) => {
      if (!realm || (!role && id)) {
        throw new Error(t("common:notFound"));
      }

      if (role) {
        const convertedRole = convert(role);
        setRole(convertedRole);
        Object.entries(convertedRole).map((entry) => {
          setValue(entry[0], entry[1]);
        });
      }

      setRealm(realm);
    },
    [key]
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  const save = async () => {
    try {
      const values = getValues();
      if (
        values.attributes &&
        values.attributes[values.attributes.length - 1]?.key === ""
      ) {
        setValue(
          "attributes",
          values.attributes.slice(0, values.attributes.length - 1)
        );
      }
      if (!(await trigger())) {
        return;
      }
      const { attributes, ...rest } = values;
      let roleRepresentation: RoleRepresentation = rest;
      if (id) {
        if (attributes) {
          roleRepresentation.attributes = arrayToAttributes(attributes);
        }
        roleRepresentation = {
          ...omit(role!, "attributes"),
          ...roleRepresentation,
        };
        if (!clientId) {
          await adminClient.roles.updateById({ id }, roleRepresentation);
        } else {
          await adminClient.clients.updateRole(
            { id: clientId, roleName: values.name! },
            roleRepresentation
          );
        }

        setRole(convert(roleRepresentation));
      } else {
        let createdRole;
        if (!clientId) {
          await adminClient.roles.create(roleRepresentation);
          createdRole = await adminClient.roles.findOneByName({
            name: values.name!,
          });
        } else {
          await adminClient.clients.createRole({
            id: clientId,
            name: values.name,
          });
          if (values.description) {
            await adminClient.clients.updateRole(
              { id: clientId, roleName: values.name! },
              roleRepresentation
            );
          }
          createdRole = await adminClient.clients.findRole({
            id: clientId,
            roleName: values.name!,
          });
        }
        if (!createdRole) {
          throw new Error(t("common:notFound"));
        }

        setRole(convert(createdRole));
        history.push(
          url.substr(0, url.lastIndexOf("/") + 1) + createdRole.id + "/details"
        );
      }
      addAlert(t(id ? "roleSaveSuccess" : "roleCreated"), AlertVariant.success);
    } catch (error) {
      addError(`roles:${id ? "roleSave" : "roleCreate"}Error`, error);
    }
  };

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: "roles:roleDeleteConfirm",
    messageKey: t("roles:roleDeleteConfirmDialog", {
      name: role?.name || t("createRole"),
    }),
    continueButtonLabel: "common:delete",
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        if (!clientId) {
          await adminClient.roles.delById({ id });
        } else {
          await adminClient.clients.delRole({
            id: clientId,
            roleName: role!.name as string,
          });
        }
        addAlert(t("roleDeletedSuccess"), AlertVariant.success);
        history.push(url.substr(0, url.indexOf("/roles") + "/roles".length));
      } catch (error) {
        addError("roles:roleDeleteError", error);
      }
    },
  });

  const dropdownItems =
    url.includes("AssociatedRoles") && !realm?.defaultRole
      ? [
          <DropdownItem
            key="delete-all-associated"
            component="button"
            onClick={() => toggleDeleteAllAssociatedRolesDialog()}
          >
            {t("roles:removeAllAssociatedRoles")}
          </DropdownItem>,
          <DropdownItem
            key="delete-role"
            component="button"
            onClick={() => {
              toggleDeleteDialog();
            }}
          >
            {t("deleteRole")}
          </DropdownItem>,
        ]
      : id && realm?.defaultRole && url.includes("AssociatedRoles")
      ? [
          <DropdownItem
            key="delete-all-associated"
            component="button"
            onClick={() => toggleDeleteAllAssociatedRolesDialog()}
          >
            {t("roles:removeAllAssociatedRoles")}
          </DropdownItem>,
        ]
      : [
          <DropdownItem
            key="toggle-modal"
            data-testid="add-roles"
            component="button"
            onClick={() => toggleModal()}
          >
            {t("addAssociatedRolesText")}
          </DropdownItem>,
          <DropdownItem
            key="delete-role"
            component="button"
            onClick={() => toggleDeleteDialog()}
          >
            {t("deleteRole")}
          </DropdownItem>,
        ];

  const [
    toggleDeleteAllAssociatedRolesDialog,
    DeleteAllAssociatedRolesConfirm,
  ] = useConfirmDialog({
    titleKey: t("roles:removeAllAssociatedRoles") + "?",
    messageKey: t("roles:removeAllAssociatedRolesConfirmDialog", {
      name: role?.name || t("createRole"),
    }),
    continueButtonLabel: "common:delete",
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        const additionalRoles = await adminClient.roles.getCompositeRoles({
          id: role!.id!,
        });
        await adminClient.roles.delCompositeRoles({ id }, additionalRoles);
        addAlert(
          t("compositeRoleOff"),
          AlertVariant.success,
          t("compositesRemovedAlertDescription")
        );
        const loc = url.replace(/\/AssociatedRoles/g, "/details");
        history.push(loc);
        refresh();
      } catch (error) {
        addError("roles:roleDeleteError", error);
      }
    },
  });

  const toggleModal = () => {
    setOpen(!open);
    refresh();
  };

  const isDefaultRole = (name: string) =>
    (realm?.defaultRole! as unknown as RoleRepresentation).name === name;

  if (!realm || !role) {
    return <Spinner />;
  }

  return (
    <>
      <DeleteConfirm />
      <DeleteAllAssociatedRolesConfirm />
      {open && <AssociatedRolesModal toggleDialog={toggleModal} />}
      <ViewHeader
        titleKey={role.name || t("createRole")}
        badges={[
          {
            id: "composite-role-badge",
            text: role.composite ? t("composite") : "",
            readonly: true,
          },
        ]}
        subKey={id ? "" : "roles:roleCreateExplain"}
        actionsDropdownId="roles-actions-dropdown"
        dropdownItems={dropdownItems}
        divider={!id}
      />
      <PageSection variant="light" className="pf-u-p-0">
        {id && (
          <KeycloakTabs isBox mountOnEnter>
            <Tab
              eventKey="details"
              title={<TabTitleText>{t("common:details")}</TabTitleText>}
            >
              <RealmRoleForm
                reset={() => reset(role)}
                form={form}
                save={save}
                editMode={true}
              />
            </Tab>
            {role.composite && (
              <Tab
                eventKey="AssociatedRoles"
                title={<TabTitleText>{t("associatedRolesText")}</TabTitleText>}
              >
                <AssociatedRolesTab parentRole={role} refresh={refresh} />
              </Tab>
            )}
            {!isDefaultRole(role.name!) && (
              <Tab
                eventKey="attributes"
                className="kc-attributes-tab"
                title={<TabTitleText>{t("common:attributes")}</TabTitleText>}
              >
                <AttributesForm
                  form={form}
                  save={save}
                  array={{ fields, append, remove }}
                  reset={() => reset(role)}
                />
              </Tab>
            )}
            {!isDefaultRole(role.name!) && (
              <Tab
                eventKey="users-in-role"
                title={<TabTitleText>{t("usersInRole")}</TabTitleText>}
              >
                <UsersInRoleTab data-cy="users-in-role-tab" />
              </Tab>
            )}
          </KeycloakTabs>
        )}
        {!id && (
          <RealmRoleForm
            reset={() => reset(role)}
            form={form}
            save={save}
            editMode={false}
          />
        )}
      </PageSection>
    </>
  );
}
