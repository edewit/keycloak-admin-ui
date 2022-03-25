import React, { useEffect, useState } from "react";
import {
  ActionGroup,
  AlertVariant,
  Button,
  Form,
  PageSection,
} from "@patternfly/react-core";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import { ScrollForm } from "../components/scroll-form/ScrollForm";
import type UserProfileConfig from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { AttributeGeneralSettings } from "./user-profile/attribute/AttributeGeneralSettings";
import { AttributePermission } from "./user-profile/attribute/AttributePermission";
import { AttributeValidations } from "./user-profile/attribute/AttributeValidations";
import { toUserProfile } from "./routes/UserProfile";
import "./realm-settings-section.css";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { AttributeAnnotations } from "./user-profile/attribute/AttributeAnnotations";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";
import { UserProfileProvider } from "./user-profile/UserProfileContext";
import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import type { KeyValueType } from "../components/attribute-form/attribute-convert";
import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type { AttributeParams } from "./routes/Attribute";
import { arrayEquals } from "../util";

type UserProfileAttributeType = UserProfileAttribute & Attribute & Permission;

type Attribute = {
  roles: string[];
  scopes: string[];
  scopeRequired: string[];
  enabledWhen: string;
  requiredWhen: string;
};

type Permission = {
  view: PermissionView[];
  edit: PermissionEdit[];
};

type PermissionView = [
  {
    adminView: boolean;
    userView: boolean;
  }
];

type PermissionEdit = [
  {
    adminEdit: boolean;
    userEdit: boolean;
  }
];

const CreateAttributeFormContent = ({
  save,
}: {
  save: (profileConfig: UserProfileConfig) => void;
}) => {
  const { t } = useTranslation("realm-settings");
  const form = useFormContext();
  const { realm, attributeName } = useParams<AttributeParams>();
  const editMode = attributeName ? true : false;

  return (
    <UserProfileProvider>
      <ScrollForm
        sections={[
          t("generalSettings"),
          t("permission"),
          t("validations"),
          t("annotations"),
        ]}
      >
        <AttributeGeneralSettings />
        <AttributePermission />
        <AttributeValidations />
        <AttributeAnnotations />
      </ScrollForm>
      <Form onSubmit={form.handleSubmit(save)}>
        <ActionGroup className="keycloak__form_actions">
          <Button
            variant="primary"
            type="submit"
            data-testid="attribute-create"
          >
            {editMode ? t("common:save") : t("common:create")}
          </Button>
          <Link
            to={toUserProfile({ realm, tab: "attributes" })}
            data-testid="attribute-cancel"
            className="kc-attributeCancel"
          >
            {t("common:cancel")}
          </Link>
        </ActionGroup>
      </Form>
    </UserProfileProvider>
  );
};

export default function NewAttributeSettings() {
  const { realm, attributeName } = useParams<AttributeParams>();
  const adminClient = useAdminClient();
  const form = useForm<UserProfileConfig>();
  const { t } = useTranslation("realm-settings");
  const history = useHistory();
  const { addAlert, addError } = useAlerts();
  const [config, setConfig] = useState<UserProfileConfig | null>(null);
  const [clientScopes, setClientScopes] =
    useState<ClientScopeRepresentation[]>();
  const attributes = config?.attributes;
  const editMode = attributeName ? true : false;

  useFetch(
    () =>
      Promise.all([
        adminClient.users.getProfile({ realm }),
        adminClient.clientScopes.find(),
      ]),
    ([config, clientScopes]) => {
      setConfig(config);
      setClientScopes(clientScopes);
    },
    []
  );

  const scopeNames = clientScopes?.map((clientScope) => clientScope.name);

  const attribute = attributes?.find(
    (attribute) => attribute.name === attributeName
  );

  const attributeAnnotationsKeys: any[] = [];
  const attributeAnnotationsValues: any[] = [];

  if (attribute) {
    const scopesComparison = arrayEquals(
      attribute.selector?.scopes,
      scopeNames
    );

    const attributeScopesEnabledWhen = scopesComparison
      ? "Always"
      : "Scopes are requested";

    const attributeScopes = scopesComparison ? [] : attribute.selector?.scopes;

    const attributeRequiredContents = Object.entries(attribute.required!).map(
      ([key, value]) => ({ key, value })
    );

    const attributeRequired =
      attributeRequiredContents.length !== 0 ? true : false;

    const requiredWhenScopesComparison = arrayEquals(
      attribute.required?.scopes,
      scopeNames
    );

    const attributeScopesRequiredWhen = requiredWhenScopesComparison
      ? "Always"
      : "Scopes are requested";

    const attributeRequiredWhenScopes = requiredWhenScopesComparison
      ? []
      : attribute.required?.scopes;

    const attributeAnnotations = Object.entries(attribute.annotations!).map(
      ([key, value]) => ({ key, value })
    );

    attributeAnnotations.forEach((item, index) => {
      attributeAnnotationsKeys.push({
        key: `annotations[${index}].key`,
        value: item.key,
      });

      attributeAnnotationsValues.push({
        key: `annotations[${index}].value`,
        value: item.value,
      });
    });

    form.setValue("name", attribute.name);
    form.setValue("displayName", attribute.displayName);
    form.setValue("attributeGroup", attribute.group);
    form.setValue("enabledWhen", attributeScopesEnabledWhen);
    form.setValue("scopes", attributeScopes);
    form.setValue("required", attributeRequired);
    form.setValue("roles", attribute.required?.roles);
    form.setValue("requiredWhen", attributeScopesRequiredWhen);
    form.setValue("scopeRequired", attributeRequiredWhenScopes);
  }

  useEffect(() => {
    attributeAnnotationsKeys.forEach((attribute) =>
      form.setValue(attribute.key, attribute.value)
    );
    attributeAnnotationsValues.forEach((attribute) =>
      form.setValue(attribute.key, attribute.value)
    );
  }, [attribute]);

  const save = async (profileConfig: UserProfileAttributeType) => {
    console.log(">>>> profileConfig ", profileConfig);
    const selector = {
      scopes:
        profileConfig.enabledWhen === "Always"
          ? scopeNames
          : profileConfig.scopes,
    };

    const required = {
      roles: profileConfig.roles,
      scopes:
        profileConfig.requiredWhen === "Always"
          ? scopeNames
          : profileConfig.scopeRequired,
    };

    const validations = profileConfig.validations?.reduce(
      (prevValidations: any, currentValidations: any) => {
        prevValidations[currentValidations.name] =
          currentValidations.config.length === 0
            ? {}
            : currentValidations.config;
        return prevValidations;
      },
      {}
    );

    const annotations = (profileConfig.annotations! as KeyValueType[]).reduce(
      (obj, item) => Object.assign(obj, { [item.key]: item.value }),
      {}
    );

    const newAttribute = [
      {
        name: profileConfig.name,
        displayName: profileConfig.displayName,
        required,
        validations,
        selector,
        permissions: profileConfig.permissions,
        annotations,
      },
    ];

    const newAttributesList = config?.attributes!.concat(
      newAttribute as UserProfileAttribute
    );

    try {
      await adminClient.users.updateProfile({
        attributes: newAttributesList,
        realm,
      });

      history.push(toUserProfile({ realm, tab: "attributes" }));

      addAlert(
        t("realm-settings:createAttributeSuccess"),
        AlertVariant.success
      );
    } catch (error) {
      addError("realm-settings:createAttributeError", error);
    }
  };

  return (
    <FormProvider {...form}>
      <ViewHeader
        titleKey={editMode ? attributeName : t("createAttribute")}
        subKey={editMode ? "" : t("createAttributeSubTitle")}
      />
      <PageSection variant="light">
        <CreateAttributeFormContent save={() => form.handleSubmit(save)()} />
      </PageSection>
    </FormProvider>
  );
}
