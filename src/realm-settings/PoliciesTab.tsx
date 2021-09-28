import React, { useMemo, useState } from "react";
import {
  AlertVariant,
  Button,
  ButtonVariant,
  Divider,
  Flex,
  FlexItem,
  PageSection,
  Radio,
  Spinner,
  Title,
  ToolbarItem,
} from "@patternfly/react-core";

import { ListEmptyState } from "../components/list-empty-state/ListEmptyState";
import { KeycloakDataTable } from "../components/table-toolbar/KeycloakDataTable";
import { useTranslation } from "react-i18next";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import { upperCaseFormatter } from "../util";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { Link } from "react-router-dom";
import type ClientPolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { useAlerts } from "../components/alert/Alerts";

import "./RealmSettingsSection.css";

export const PoliciesTab = () => {
  const { t } = useTranslation("realm-settings");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const [show, setShow] = useState(false);
  const [policies, setPolicies] = useState<ClientPolicyRepresentation[]>();
  const [selectedPolicy, setSelectedPolicy] =
    useState<ClientPolicyRepresentation>();

  useFetch(
    () => adminClient.clientPolicies.listPolicies(),
    (policies) => setPolicies(policies.policies),
    []
  );

  const loader = async () => policies ?? [];

  const code = useMemo(() => JSON.stringify(policies, null, 2), [policies]);

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("deleteClientPolicyConfirmTitle"),
    messageKey: t("deleteClientPolicyConfirm", {
      policyName: selectedPolicy?.name,
    }),
    continueButtonLabel: t("delete"),
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        // delete client policy here
        addAlert(t("deleteClientPolicySuccess"), AlertVariant.success);
      } catch (error) {
        addError(t("deleteClientPolicyError"), error);
      }
    },
  });

  if (!policies) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }
  return (
    <>
      <DeleteConfirm />
      <PageSection>
        <Flex className="kc-policies-config-section">
          <FlexItem>
            <Title headingLevel="h1" size="md">
              {t("policiesConfigType")}
            </Title>
          </FlexItem>
          <FlexItem>
            <Radio
              isChecked={!show}
              name="policiesView"
              onChange={() => setShow(false)}
              label={t("policiesConfigTypes.formView")}
              id="formView-policiesView"
              className="kc-form-radio-btn pf-u-mr-sm pf-u-ml-sm"
            />
          </FlexItem>
          <FlexItem>
            <Radio
              isChecked={show}
              name="policiesView"
              onChange={() => setShow(true)}
              label={t("policiesConfigTypes.jsonEditor")}
              id="jsonEditor-policiesView"
              className="kc-editor-radio-btn"
            />
          </FlexItem>
        </Flex>
      </PageSection>
      <Divider />
      {!show ? (
        <KeycloakDataTable
          key={policies.length}
          emptyState={
            <ListEmptyState
              message={t("realm-settings:noClientPolicies")}
              instructions={t("realm-settings:noClientPoliciesInstructions")}
              primaryActionText={t("realm-settings:createClientPolicy")}
            />
          }
          ariaLabelKey="realm-settings:clientPolicies"
          searchPlaceholderKey="realm-settings:clientPolicySearch"
          loader={loader}
          toolbarItem={
            <ToolbarItem>
              <Button
                id="createPolicy"
                component={Link}
                data-testid="createPolicy"
              >
                {t("createClientPolicy")}
              </Button>
            </ToolbarItem>
          }
          actions={[
            {
              title: t("common:delete"),
              onRowClick: (item) => {
                toggleDeleteDialog();
                setSelectedPolicy(item);
              },
            },
          ]}
          columns={[
            {
              name: "name",
            },
            {
              name: "enabled",
              cellFormatters: [upperCaseFormatter()],
            },
            {
              name: "description",
            },
          ]}
        />
      ) : (
        <>
          <div className="pf-u-mt-md pf-u-ml-lg">
            <CodeEditor
              isLineNumbersVisible
              isLanguageLabelVisible
              code={code}
              language={Language.json}
              height="30rem"
            />
          </div>
          <div className="pf-u-mt-md">
            <Button
              variant={ButtonVariant.primary}
              className="pf-u-mr-md pf-u-ml-lg"
            >
              {t("save")}
            </Button>
            <Button variant={ButtonVariant.secondary}> {t("reload")}</Button>
          </div>
        </>
      )}
    </>
  );
};
