import React, { useState } from "react";
import {
  ActionGroup,
  AlertVariant,
  Button,
  Form,
  PageSection,
  Tab,
  TabTitleText,
} from "@patternfly/react-core";

import { LdapSettingsAdvanced } from "./ldap/LdapSettingsAdvanced";
import { LdapSettingsKerberosIntegration } from "./ldap/LdapSettingsKerberosIntegration";
import { SettingsCache } from "./shared/SettingsCache";
import { LdapSettingsSynchronization } from "./ldap/LdapSettingsSynchronization";
import { LdapSettingsGeneral } from "./ldap/LdapSettingsGeneral";
import { LdapSettingsConnection } from "./ldap/LdapSettingsConnection";
import { LdapSettingsSearching } from "./ldap/LdapSettingsSearching";

import { useRealm } from "../context/realm-context/RealmContext";
import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";

import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { ScrollForm } from "../components/scroll-form/ScrollForm";

import { KeycloakTabs } from "../components/keycloak-tabs/KeycloakTabs";
import { LdapMapperList } from "./ldap/mappers/LdapMapperList";
import { toUserFederation } from "./routes/UserFederation";
import { ExtendedHeader } from "./shared/ExtendedHeader";

type ldapComponentRepresentation = ComponentRepresentation & {
  config?: {
    periodicChangedUsersSync?: boolean;
    periodicFullSync?: boolean;
  };
};

const AddLdapFormContent = ({
  save,
}: {
  save: (component: ldapComponentRepresentation) => void;
}) => {
  const { t } = useTranslation("user-federation");
  const form = useFormContext();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const { realm } = useRealm();

  return (
    <>
      <ScrollForm
        sections={[
          t("generalOptions"),
          t("connectionAndAuthenticationSettings"),
          t("ldapSearchingAndUpdatingSettings"),
          t("synchronizationSettings"),
          t("kerberosIntegration"),
          t("cacheSettings"),
          t("advancedSettings"),
        ]}
      >
        <LdapSettingsGeneral form={form} vendorEdit={!!id} />
        <LdapSettingsConnection form={form} edit={!!id} />
        <LdapSettingsSearching form={form} />
        <LdapSettingsSynchronization form={form} />
        <LdapSettingsKerberosIntegration form={form} />
        <SettingsCache form={form} />
        <LdapSettingsAdvanced form={form} />
      </ScrollForm>
      <Form onSubmit={form.handleSubmit(save)}>
        <ActionGroup className="keycloak__form_actions">
          <Button
            isDisabled={!form.formState.isDirty}
            variant="primary"
            type="submit"
            data-testid="ldap-save"
          >
            {t("common:save")}
          </Button>
          <Button
            variant="link"
            onClick={() => history.push(toUserFederation({ realm }))}
            data-testid="ldap-cancel"
          >
            {t("common:cancel")}
          </Button>
        </ActionGroup>
      </Form>
    </>
  );
};

export default function UserFederationLdapSettings() {
  const { t } = useTranslation("user-federation");
  const form = useForm<ComponentRepresentation>({ mode: "onChange" });
  const history = useHistory();
  const adminClient = useAdminClient();
  const { realm } = useRealm();

  const { id } = useParams<{ id: string }>();
  const { addAlert, addError } = useAlerts();
  const [component, setComponent] = useState<ComponentRepresentation>();
  const [refreshCount, setRefreshCount] = useState(0);

  const editMode = component?.config?.editMode;
  const refresh = () => setRefreshCount((count) => count + 1);

  useFetch(
    async () => {
      if (id) {
        return await adminClient.components.findOne({ id });
      }
      return undefined;
    },
    (fetchedComponent) => {
      if (fetchedComponent) {
        setupForm(fetchedComponent);
        setComponent(fetchedComponent);
      } else if (id) {
        throw new Error(t("common:notFound"));
      }
    },
    [refreshCount]
  );

  const setupForm = (component: ComponentRepresentation) => {
    form.reset({ ...component });
    form.setValue(
      "config.periodicChangedUsersSync",
      component.config?.["changedSyncPeriod"][0] !== "-1"
    );

    form.setValue(
      "config.periodicFullSync",
      component.config?.["fullSyncPeriod"][0] !== "-1"
    );
  };

  const save = async (component: ldapComponentRepresentation) => {
    if (component.config?.periodicChangedUsersSync !== undefined) {
      if (component.config.periodicChangedUsersSync === false) {
        component.config.changedSyncPeriod = ["-1"];
      }
      delete component.config.periodicChangedUsersSync;
    }
    if (component.config?.periodicFullSync !== undefined) {
      if (component.config.periodicFullSync === false) {
        component.config.fullSyncPeriod = ["-1"];
      }
      delete component.config.periodicFullSync;
    }
    try {
      if (!id) {
        await adminClient.components.create(component);
        history.push(toUserFederation({ realm }));
      } else {
        await adminClient.components.update({ id }, component);
      }
      addAlert(t(id ? "saveSuccess" : "createSuccess"), AlertVariant.success);
      refresh();
    } catch (error) {
      addError(`user-federation:${id ? "saveError" : "createError"}`, error);
    }
  };

  return (
    <FormProvider {...form}>
      <ExtendedHeader
        provider="LDAP"
        noDivider
        editMode={editMode}
        save={() => form.handleSubmit(save)()}
      />
      <PageSection variant="light" className="pf-u-p-0">
        {id ? (
          <KeycloakTabs isBox>
            <Tab
              id="settings"
              eventKey="settings"
              title={<TabTitleText>{t("common:settings")}</TabTitleText>}
            >
              <PageSection variant="light">
                <AddLdapFormContent save={save} />
              </PageSection>
            </Tab>
            <Tab
              id="mappers"
              eventKey="mappers"
              title={<TabTitleText>{t("common:mappers")}</TabTitleText>}
              data-testid="ldap-mappers-tab"
            >
              <PageSection>
                <LdapMapperList />
              </PageSection>
            </Tab>
          </KeycloakTabs>
        ) : (
          <PageSection variant="light">
            <AddLdapFormContent save={save} />
          </PageSection>
        )}
      </PageSection>
    </FormProvider>
  );
}
