import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Divider,
  FormGroup,
  PageSection,
  Radio,
  Spinner,
  Switch,
} from "@patternfly/react-core";

import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { FormAccess } from "../../components/form-access/FormAccess";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { SaveReset } from "../advanced/SaveReset";

const PolicyEnforcementModes = ["ENFORCING", "PERMISSIVE", "DISABLED"] as const;
const DecisionStrategy = ["UNANIMOUS", "AFFIRMATIVE"] as const;

export const AuthorizationSettings = ({ clientId }: { clientId: string }) => {
  const { t } = useTranslation("clients");
  const [resource, setResource] = useState<ResourceServerRepresentation>();
  const { control, setValue, handleSubmit } =
    useForm<ResourceServerRepresentation>({
      shouldUnregister: false,
    });

  const adminClient = useAdminClient();

  const setupForm = (resource: ResourceServerRepresentation) =>
    Object.entries(resource).map(([key, value]) => setValue(key, value));

  useFetch(
    () => adminClient.clients.getResourceServer({ id: clientId }),
    (resource) => {
      setResource(resource);
      setupForm(resource);
    },
    []
  );

  if (!resource) {
    return <Spinner />;
  }

  return (
    <PageSection variant="light">
      <FormAccess role="manage-clients" isHorizontal>
        <FormGroup
          label={t("import")}
          fieldId="import"
          labelIcon={
            <HelpItem
              helpText="clients-help:import"
              forLabel={t("import")}
              forID={t(`common:helpLabel`, { label: t("import") })}
            />
          }
        >
          <Button variant="secondary">{t("import")}</Button>
        </FormGroup>
        <Divider />
        <FormGroup
          label={t("policyEnforcementMode")}
          labelIcon={
            <HelpItem
              helpText="clients-help:policyEnforcementMode"
              forLabel={t("policyEnforcementMode")}
              forID="policyEnforcementMode"
            />
          }
          fieldId="policyEnforcementMode"
          hasNoPaddingTop
        >
          <Controller
            name="policyEnforcementMode"
            data-testid="policyEnforcementMode"
            defaultValue={DecisionStrategy[0]}
            control={control}
            render={({ onChange, value }) => (
              <>
                {PolicyEnforcementModes.map((mode) => (
                  <Radio
                    id={mode}
                    key={mode}
                    data-testid={mode}
                    isChecked={value === mode}
                    name="policyEnforcementMode"
                    onChange={() => onChange(mode)}
                    label={t(`policyEnforcementModes.${mode}`)}
                    className="pf-u-mb-md"
                  />
                ))}
              </>
            )}
          />
        </FormGroup>
        <FormGroup
          label={t("decisionStrategy")}
          labelIcon={
            <HelpItem
              helpText="clients-help:decisionStrategy"
              forLabel={t("decisionStrategy")}
              forID="decisionStrategy"
            />
          }
          fieldId="decisionStrategy"
          hasNoPaddingTop
        >
          <Controller
            name="decisionStrategy"
            data-testid="decisionStrategy"
            defaultValue={DecisionStrategy[0]}
            control={control}
            render={({ onChange, value }) => (
              <>
                {DecisionStrategy.map((strategy) => (
                  <Radio
                    id={strategy}
                    key={strategy}
                    data-testid={strategy}
                    isChecked={value === strategy}
                    name="decisionStrategy"
                    onChange={() => onChange(strategy)}
                    label={t(`decisionStrategies.${strategy}`)}
                    className="pf-u-mb-md"
                  />
                ))}
              </>
            )}
          />
        </FormGroup>
        <FormGroup
          hasNoPaddingTop
          label={t("allowRemoteResourceManagement")}
          fieldId="allowRemoteResourceManagement"
          labelIcon={
            <HelpItem
              helpText={t("allowRemoteResourceManagement")}
              forLabel={t("allowRemoteResourceManagement")}
              forID={"allowRemoteResourceManagement"}
            />
          }
        >
          <Controller
            name="allowRemoteResourceManagement"
            data-testid="allowRemoteResourceManagement"
            defaultValue={false}
            control={control}
            render={({ onChange, value }) => (
              <Switch
                id="allowRemoteResourceManagement"
                label={t("common:on")}
                labelOff={t("common:off")}
                isChecked={value}
                onChange={onChange}
              />
            )}
          />
        </FormGroup>
        <SaveReset
          name="settings"
          save={(): void => {
            handleSubmit((value) => console.log(value))();
          }}
          reset={() => setupForm(resource)}
        />
      </FormAccess>
    </PageSection>
  );
};
