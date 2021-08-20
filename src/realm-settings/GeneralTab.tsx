import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import {
  ActionGroup,
  Button,
  ClipboardCopy,
  FormGroup,
  PageSection,
  Select,
  SelectOption,
  SelectVariant,
  Stack,
  StackItem,
  Switch,
  TextInput,
} from "@patternfly/react-core";

import type RealmRepresentation from "keycloak-admin/lib/defs/realmRepresentation";
import { getBaseUrl } from "../util";
import { useAdminClient } from "../context/auth/AdminClient";
import { useRealm } from "../context/realm-context/RealmContext";
import { FormAccess } from "../components/form-access/FormAccess";
import { HelpItem } from "../components/help-enabler/HelpItem";
import { FormattedLink } from "../components/external-link/FormattedLink";

type RealmSettingsGeneralTabProps = {
  save: (realm: RealmRepresentation) => void;
  reset: () => void;
};

export const RealmSettingsGeneralTab = ({
  save,
  reset,
}: RealmSettingsGeneralTabProps) => {
  const { t } = useTranslation("realm-settings");
  const adminClient = useAdminClient();
  const { realm: realmName } = useRealm();
  const {
    register,
    control,
    handleSubmit,
    formState: { isDirty },
  } = useFormContext();
  const [open, setOpen] = useState(false);

  const baseUrl = getBaseUrl(adminClient);

  const requireSslTypes = ["all", "external", "none"];

  return (
    <>
      <PageSection variant="light">
        <FormAccess
          isHorizontal
          role="manage-realm"
          className="pf-u-mt-lg"
          onSubmit={handleSubmit(save)}
        >
          <FormGroup label={t("realmId")} fieldId="kc-realm-id" isRequired>
            <Controller
              name="realm"
              control={control}
              defaultValue=""
              render={({ onChange, value }) => (
                <ClipboardCopy onChange={onChange}>{value}</ClipboardCopy>
              )}
            />
          </FormGroup>
          <FormGroup label={t("displayName")} fieldId="kc-display-name">
            <TextInput
              type="text"
              id="kc-display-name"
              name="displayName"
              ref={register}
            />
          </FormGroup>
          <FormGroup
            label={t("htmlDisplayName")}
            fieldId="kc-html-display-name"
          >
            <TextInput
              type="text"
              id="kc-html-display-name"
              name="displayNameHtml"
              ref={register}
            />
          </FormGroup>
          <FormGroup
            label={t("frontendUrl")}
            fieldId="kc-frontend-url"
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:frontendUrl"
                forLabel={t("frontendUrl")}
                forID={t(`common:helpLabel`, { label: t("frontendUrl") })}
              />
            }
          >
            <TextInput
              type="text"
              id="kc-frontend-url"
              name="attributes.frontendUrl"
              ref={register}
            />
          </FormGroup>
          <FormGroup
            label={t("requireSsl")}
            fieldId="kc-require-ssl"
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:requireSsl"
                forLabel={t("requireSsl")}
                forID={t(`common:helpLabel`, { label: t("requireSsl") })}
              />
            }
          >
            <Controller
              name="sslRequired"
              defaultValue="none"
              control={control}
              render={({ onChange, value }) => (
                <Select
                  toggleId="kc-require-ssl"
                  onToggle={() => setOpen(!open)}
                  onSelect={(_, value) => {
                    onChange(value as string);
                    setOpen(false);
                  }}
                  selections={value}
                  variant={SelectVariant.single}
                  aria-label={t("requireSsl")}
                  isOpen={open}
                >
                  {requireSslTypes.map((sslType) => (
                    <SelectOption
                      selected={sslType === value}
                      key={sslType}
                      value={sslType}
                    >
                      {t(`sslType.${sslType}`)}
                    </SelectOption>
                  ))}
                </Select>
              )}
            />
          </FormGroup>
          <FormGroup
            hasNoPaddingTop
            label={t("userManagedAccess")}
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:userManagedAccess"
                forLabel={t("userManagedAccess")}
                forID={t(`common:helpLabel`, { label: t("userManagedAccess") })}
              />
            }
            fieldId="kc-user-manged-access"
          >
            <Controller
              name="userManagedAccessAllowed"
              control={control}
              defaultValue={false}
              render={({ onChange, value }) => (
                <Switch
                  id="kc-user-managed-access"
                  data-testid="user-managed-access-switch"
                  label={t("common:on")}
                  labelOff={t("common:off")}
                  isChecked={value}
                  onChange={onChange}
                />
              )}
            />
          </FormGroup>
          <FormGroup
            label={t("endpoints")}
            labelIcon={
              <HelpItem
                helpText="realm-settings-help:endpoints"
                forLabel={t("endpoints")}
                forID={t(`common:helpLabel`, { label: t("endpoints") })}
              />
            }
            fieldId="kc-endpoints"
          >
            <Stack>
              <StackItem>
                <FormattedLink
                  href={`${baseUrl}realms/${realmName}/.well-known/openid-configuration`}
                  title={t("openIDEndpointConfiguration")}
                />
              </StackItem>
              <StackItem>
                <FormattedLink
                  href={`${baseUrl}realms/${realmName}/protocol/saml/descriptor`}
                  title={t("samlIdentityProviderMetadata")}
                />
              </StackItem>
            </Stack>
          </FormGroup>

          <ActionGroup>
            <Button
              variant="primary"
              type="submit"
              data-testid="general-tab-save"
              isDisabled={!isDirty}
            >
              {t("common:save")}
            </Button>
            <Button variant="link" onClick={reset}>
              {t("common:revert")}
            </Button>
          </ActionGroup>
        </FormAccess>
      </PageSection>
    </>
  );
};
