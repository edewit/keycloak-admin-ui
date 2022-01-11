import React, { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  ActionGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  DropdownItem,
  FormGroup,
  PageSection,
  Radio,
  Switch,
  TextArea,
  TextInput,
} from "@patternfly/react-core";

import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import type { NewPermissionParams } from "../routes/NewPermission";
import {
  PermissionDetailsParams,
  toPermissionDetails,
} from "../routes/PermissionDetails";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { FormAccess } from "../../components/form-access/FormAccess";
import { useAlerts } from "../../components/alert/Alerts";
import { toClient } from "../routes/Client";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { ResourcesPolicySelect } from "./ResourcesPolicySelect";

const DECISION_STRATEGIES = ["UNANIMOUS", "AFFIRMATIVE", "CONSENSUS"] as const;

export default function PermissionDetails() {
  const { t } = useTranslation("clients");

  const form = useForm({
    shouldUnregister: false,
    mode: "onChange",
  });
  const { register, control, reset, errors, handleSubmit } = form;

  const history = useHistory();
  const { id, realm, permissionType, permissionId } = useParams<
    NewPermissionParams & PermissionDetailsParams
  >();

  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const [permission, setPermission] = useState<PolicyRepresentation>();
  const [applyToResourceTypeFlag, setApplyToResourceTypeFlag] = useState(false);

  useFetch(
    async () => {
      if (permissionId) {
        const r = await Promise.all([
          adminClient.clients.findOnePermission({
            id,
            type: permissionType,
            permissionId,
          }),
          adminClient.clients.getAssociatedResources({
            id,
            permissionId,
          }),
          adminClient.clients.getAssociatedPolicies({
            id,
            permissionId,
          }),
        ]);

        if (!r[0]) {
          throw new Error(t("common:notFound"));
        }

        return {
          permission: r[0],
          resources: r[1].map((p) => p._id),
          policies: r[2].map((p) => p.id!),
        };
      }
      return {};
    },
    ({ permission, resources, policies }) => {
      reset({ ...permission, resources, policies });
      if (permission && "resourceType" in permission) {
        setApplyToResourceTypeFlag(
          !!(permission as { resourceType: string }).resourceType
        );
      }
      setPermission({ ...permission, resources, policies });
    },
    []
  );

  const save = async (permission: PolicyRepresentation) => {
    try {
      if (permissionId) {
        await adminClient.clients.updatePermission(
          { id, type: permissionType, permissionId },
          permission
        );
      } else {
        const result = await adminClient.clients.createPermission(
          { id, type: permissionType },
          permission
        );
        history.push(
          toPermissionDetails({
            realm,
            id,
            permissionType,
            permissionId: result.id!,
          })
        );
      }
      addAlert(
        t((permissionId ? "update" : "create") + "PermissionSuccess"),
        AlertVariant.success
      );
    } catch (error) {
      addError("clients:permissionSaveError", error);
    }
  };

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: "clients:deletePermission",
    messageKey: t("deletePermissionConfirm", {
      permission: permission?.name,
    }),
    continueButtonVariant: ButtonVariant.danger,
    continueButtonLabel: "clients:confirm",
    onConfirm: async () => {
      try {
        await adminClient.clients.delPermission({
          id,
          type: permissionType,
          permissionId: permissionId,
        });
        addAlert(t("permissionDeletedSuccess"), AlertVariant.success);
        history.push(toClient({ realm, clientId: id, tab: "authorization" }));
      } catch (error) {
        addError("clients:permissionDeletedError", error);
      }
    },
  });

  return (
    <>
      <DeleteConfirm />
      <ViewHeader
        titleKey={permissionId ? permission?.name! : "clients:createPermission"}
        dropdownItems={
          permissionId
            ? [
                <DropdownItem
                  key="delete"
                  data-testid="delete-resource"
                  onClick={() => toggleDeleteDialog()}
                >
                  {t("common:delete")}
                </DropdownItem>,
              ]
            : undefined
        }
      />
      <PageSection variant="light">
        <FormAccess
          isHorizontal
          role="manage-clients"
          onSubmit={handleSubmit(save)}
        >
          <FormProvider {...form}>
            <FormGroup
              label={t("common:name")}
              fieldId="name"
              labelIcon={
                <HelpItem
                  helpText="clients-help:permissionName"
                  fieldLabelId="name"
                />
              }
            >
              <TextInput id="name" name="name" ref={register} />
            </FormGroup>
            <FormGroup
              label={t("common:description")}
              fieldId="description"
              labelIcon={
                <HelpItem
                  helpText="clients-help:permissionDescription"
                  fieldLabelId="description"
                />
              }
              validated={errors.description ? "error" : "default"}
              helperTextInvalid={errors.description?.message}
            >
              <TextArea
                id="description"
                name="description"
                ref={register({
                  maxLength: {
                    value: 255,
                    message: t("common:maxLength", { length: 255 }),
                  },
                })}
                validated={errors.description ? "error" : "default"}
              />
            </FormGroup>
            <FormGroup
              label={t("applyToResourceTypeFlag")}
              fieldId="applyToResourceTypeFlag"
              labelIcon={
                <HelpItem
                  helpText="clients-help:applyToResourceTypeFlag"
                  fieldLabelId="clients:applyToResourceTypeFlag"
                />
              }
            >
              <Switch
                id="applyToResourceTypeFlag"
                name="applyToResourceTypeFlag"
                label={t("common:on")}
                labelOff={t("common:off")}
                isChecked={applyToResourceTypeFlag}
                onChange={setApplyToResourceTypeFlag}
              />
            </FormGroup>
            {applyToResourceTypeFlag ? (
              <FormGroup
                label={t("resourceType")}
                fieldId="name"
                labelIcon={
                  <HelpItem
                    helpText="clients-help:resourceType"
                    fieldLabelId="resourceType"
                  />
                }
              >
                <TextInput
                  id="resourceType"
                  name="resourceType"
                  ref={register}
                />
              </FormGroup>
            ) : (
              <FormGroup
                label={t("resources")}
                fieldId="resources"
                labelIcon={
                  <HelpItem
                    helpText="clients-help:permissionResources"
                    fieldLabelId="clients:resources"
                  />
                }
              >
                <ResourcesPolicySelect
                  name="resources"
                  searchFunction="listResources"
                  clientId={id}
                />
              </FormGroup>
            )}
            <FormGroup
              label={t("policies")}
              fieldId="policies"
              labelIcon={
                <HelpItem
                  helpText="clients-help:permissionPolicies"
                  fieldLabelId="clients:policies"
                />
              }
            >
              <ResourcesPolicySelect
                name="policies"
                searchFunction="listPolicies"
                clientId={id}
              />
            </FormGroup>
            <FormGroup
              label={t("decisionStrategy")}
              labelIcon={
                <HelpItem
                  helpText="clients-help:permissionDecisionStrategy"
                  fieldLabelId="clients:decisionStrategy"
                />
              }
              fieldId="policyEnforcementMode"
              hasNoPaddingTop
            >
              <Controller
                name="decisionStrategy"
                data-testid="decisionStrategy"
                defaultValue={DECISION_STRATEGIES[0]}
                control={control}
                render={({ onChange, value }) => (
                  <>
                    {DECISION_STRATEGIES.map((strategy) => (
                      <Radio
                        id={strategy}
                        key={strategy}
                        data-testid={strategy}
                        isChecked={value === strategy}
                        name="decisionStrategies"
                        onChange={() => onChange(strategy)}
                        label={t(`decisionStrategies.${strategy}`)}
                        className="pf-u-mb-md"
                      />
                    ))}
                  </>
                )}
              />
            </FormGroup>
            <ActionGroup>
              <div className="pf-u-mt-md">
                <Button
                  variant={ButtonVariant.primary}
                  type="submit"
                  data-testid="save"
                >
                  {t("common:save")}
                </Button>

                <Button
                  variant="link"
                  data-testid="cancel"
                  component={(props) => (
                    <Link
                      {...props}
                      to={toClient({
                        realm,
                        clientId: id,
                        tab: "authorization",
                      })}
                    ></Link>
                  )}
                >
                  {t("common:cancel")}
                </Button>
              </div>
            </ActionGroup>
          </FormProvider>
        </FormAccess>
      </PageSection>
    </>
  );
}
