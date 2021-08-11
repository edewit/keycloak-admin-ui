import {
  AlertVariant,
  Button,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Switch,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import _ from "lodash";

import type TestLdapConnectionRepresentation from "keycloak-admin/lib/defs/testLdapConnection";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { Controller, UseFormMethods, useWatch } from "react-hook-form";
import { FormAccess } from "../../components/form-access/FormAccess";
import { WizardSectionHeader } from "../../components/wizard-section-header/WizardSectionHeader";
import { PasswordInput } from "../../components/password-input/PasswordInput";
import { useAdminClient } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useAlerts } from "../../components/alert/Alerts";

export type LdapSettingsConnectionProps = {
  form: UseFormMethods;
  showSectionHeading?: boolean;
  showSectionDescription?: boolean;
};

const testLdapProperties: Array<keyof TestLdapConnectionRepresentation> = [
  "connectionUrl",
  "bindDn",
  "bindCredential",
  "useTruststoreSpi",
  "connectionTimeout",
  "startTls",
  "authType",
];

export const LdapSettingsConnection = ({
  form,
  showSectionHeading = false,
  showSectionDescription = false,
}: LdapSettingsConnectionProps) => {
  const { t } = useTranslation("user-federation");
  const { t: helpText } = useTranslation("user-federation-help");
  const adminClient = useAdminClient();
  const { realm } = useRealm();
  const { addAlert, addError } = useAlerts();

  const testLdap = async () => {
    try {
      const settings: TestLdapConnectionRepresentation = {};

      testLdapProperties.forEach((key) => {
        const value = _.get(form.getValues(), `config.${key}`);
        settings[key] = _.isArray(value) ? value[0] : "";
      });
      await adminClient.realms.testLDAPConnection(
        { realm },
        { ...settings, action: "testConnection" }
      );
      addAlert(t("testSuccess"), AlertVariant.success);
    } catch (error) {
      addError("user-federation:testError", error);
    }
  };

  const [isTruststoreSpiDropdownOpen, setIsTruststoreSpiDropdownOpen] =
    useState(false);

  const [isBindTypeDropdownOpen, setIsBindTypeDropdownOpen] = useState(false);

  const ldapBindType = useWatch({
    control: form.control,
    name: "config.authType",
    defaultValue: ["simple"],
  });

  return (
    <>
      {showSectionHeading && (
        <WizardSectionHeader
          title={t("connectionAndAuthenticationSettings")}
          description={helpText(
            "ldapConnectionAndAuthorizationSettingsDescription"
          )}
          showDescription={showSectionDescription}
        />
      )}
      <FormAccess role="manage-realm" isHorizontal>
        <FormGroup
          label={t("connectionURL")}
          labelIcon={
            <HelpItem
              helpText={helpText("consoleDisplayConnectionUrlHelp")}
              forLabel={t("connectionURL")}
              forID="kc-console-connection-url"
            />
          }
          fieldId="kc-console-connection-url"
          isRequired
        >
          <TextInput
            isRequired
            type="text"
            id="kc-console-connection-url"
            data-testid="ldap-connection-url"
            name="config.connectionUrl[0]"
            ref={form.register({
              required: {
                value: true,
                message: `${t("validateConnectionUrl")}`,
              },
            })}
          />
          {form.errors.config &&
            form.errors.config.connectionUrl &&
            form.errors.config.connectionUrl[0] && (
              <div className="error">
                {form.errors.config.connectionUrl[0].message}
              </div>
            )}
        </FormGroup>
        <FormGroup
          label={t("enableStartTls")}
          labelIcon={
            <HelpItem
              helpText={helpText("enableStartTlsHelp")}
              forLabel={t("enableStartTls")}
              forID="kc-enable-start-tls"
            />
          }
          fieldId="kc-enable-start-tls"
          hasNoPaddingTop
        >
          <Controller
            name="config.startTls"
            defaultValue={["false"]}
            control={form.control}
            render={({ onChange, value }) => (
              <Switch
                id={"kc-enable-start-tls"}
                isDisabled={false}
                onChange={(value) => onChange([`${value}`])}
                isChecked={value[0] === "true"}
                label={t("common:on")}
                labelOff={t("common:off")}
              />
            )}
          ></Controller>
        </FormGroup>

        <FormGroup
          label={t("useTruststoreSpi")}
          labelIcon={
            <HelpItem
              helpText={helpText("useTruststoreSpiHelp")}
              forLabel={t("useTruststoreSpi")}
              forID="kc-use-truststore-spi"
            />
          }
          fieldId="kc-use-truststore-spi"
        >
          <Controller
            name="config.useTruststoreSpi[0]"
            control={form.control}
            defaultValue="ldapsOnly"
            render={({ onChange, value }) => (
              <Select
                toggleId="kc-use-truststore-spi"
                onToggle={() =>
                  setIsTruststoreSpiDropdownOpen(!isTruststoreSpiDropdownOpen)
                }
                isOpen={isTruststoreSpiDropdownOpen}
                onSelect={(_, value) => {
                  onChange(value.toString());
                  setIsTruststoreSpiDropdownOpen(false);
                }}
                selections={value}
              >
                <SelectOption value="always">{t("always")}</SelectOption>
                <SelectOption value="ldapsOnly">{t("onlyLdaps")}</SelectOption>
                <SelectOption value="never">{t("never")}</SelectOption>
              </Select>
            )}
          ></Controller>
        </FormGroup>
        <FormGroup
          label={t("connectionPooling")}
          labelIcon={
            <HelpItem
              helpText={helpText("connectionPoolingHelp")}
              forLabel={t("connectionPooling")}
              forID="kc-connection-pooling"
            />
          }
          fieldId="kc-connection-pooling"
          hasNoPaddingTop
        >
          <Controller
            name="config.connectionPooling"
            defaultValue={["false"]}
            control={form.control}
            render={({ onChange, value }) => (
              <Switch
                id={"kc-connection-pooling"}
                isDisabled={false}
                onChange={(value) => onChange([`${value}`])}
                isChecked={value[0] === "true"}
                label={t("common:on")}
                labelOff={t("common:off")}
              />
            )}
          ></Controller>
        </FormGroup>
        <FormGroup
          label={t("connectionTimeout")}
          labelIcon={
            <HelpItem
              helpText={helpText("connectionTimeoutHelp")}
              forLabel={t("connectionTimeout")}
              forID="kc-console-connection-timeout"
            />
          }
          fieldId="kc-console-connection-timeout"
        >
          <TextInput
            type="number"
            min={0}
            id="kc-console-connection-timeout"
            name="config.connectionTimeout[0]"
            ref={form.register}
          />
        </FormGroup>
        <FormGroup
          label={t("bindType")}
          labelIcon={
            <HelpItem
              helpText={helpText("bindTypeHelp")}
              forLabel={t("bindType")}
              forID="kc-bind-type"
            />
          }
          fieldId="kc-bind-type"
          isRequired
        >
          <Controller
            name="config.authType[0]"
            defaultValue="simple"
            control={form.control}
            render={({ onChange, value }) => (
              <Select
                toggleId="kc-bind-type"
                required
                onToggle={() =>
                  setIsBindTypeDropdownOpen(!isBindTypeDropdownOpen)
                }
                isOpen={isBindTypeDropdownOpen}
                onSelect={(_, value) => {
                  onChange(value as string);
                  setIsBindTypeDropdownOpen(false);
                }}
                selections={value}
                variant={SelectVariant.single}
                data-testid="ldap-bind-type"
              >
                <SelectOption value="simple" />
                <SelectOption value="none" />
              </Select>
            )}
          ></Controller>
        </FormGroup>

        {_.isEqual(ldapBindType, ["simple"]) && (
          <>
            <FormGroup
              label={t("bindDn")}
              labelIcon={
                <HelpItem
                  helpText={helpText("bindDnHelp")}
                  forLabel={t("bindDn")}
                  forID="kc-console-bind-dn"
                />
              }
              fieldId="kc-console-bind-dn"
              helperTextInvalid={t("validateBindDn")}
              validated={
                form.errors.config?.bindDn
                  ? ValidatedOptions.error
                  : ValidatedOptions.default
              }
              isRequired
            >
              <TextInput
                type="text"
                id="kc-console-bind-dn"
                data-testid="ldap-bind-dn"
                name="config.bindDn[0]"
                ref={form.register({ required: true })}
              />
            </FormGroup>
            <FormGroup
              label={t("bindCredentials")}
              labelIcon={
                <HelpItem
                  helpText={helpText("bindCredentialsHelp")}
                  forLabel={t("bindCredentials")}
                  forID="kc-console-bind-credentials"
                />
              }
              fieldId="kc-console-bind-credentials"
              helperTextInvalid={t("validateBindCredentials")}
              validated={
                form.errors.config?.bindCredential
                  ? ValidatedOptions.error
                  : ValidatedOptions.default
              }
              isRequired
            >
              <PasswordInput
                isRequired
                id="kc-console-bind-credentials"
                data-testid="ldap-bind-credentials"
                name="config.bindCredential[0]"
                ref={form.register({
                  required: true,
                })}
              />
            </FormGroup>
          </>
        )}
        <FormGroup fieldId="kc-test-button">
          <Button
            variant="secondary"
            id="kc-test-button"
            onClick={() => testLdap()}
          >
            {t("common:test")}
          </Button>
        </FormGroup>
      </FormAccess>
    </>
  );
};
