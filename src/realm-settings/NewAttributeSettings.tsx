import React from "react";
import { ActionGroup, Button, Form, PageSection } from "@patternfly/react-core";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { ScrollForm } from "../components/scroll-form/ScrollForm";
import { useRealm } from "../context/realm-context/RealmContext";
import type UserProfileConfig from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { AttributeGeneralSettings } from "./user-profile/attribute/AttributeGeneralSettings";
import { AttributePermission } from "./user-profile/attribute/AttributePermission";
import { AttributeValidations } from "./user-profile/attribute/AttributeValidations";
import { toUserProfile } from "./routes/UserProfile";
import "./realm-settings-section.css";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { UserProfileProvider } from "./user-profile/UserProfileContext";
import { AttributeAnnotations } from "./user-profile/attribute/AttributeAnnotations";

const CreateAttributeFormContent = ({
  save,
}: {
  save: (profileConfig: UserProfileConfig) => void;
}) => {
  const { t } = useTranslation("realm-settings");
  const form = useFormContext();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const { realm } = useRealm();

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
        <AttributeGeneralSettings form={form} attributeGroupEdit={!!id} />
        <AttributePermission form={form} />
        <AttributeValidations form={form} />
        <AttributeAnnotations form={form} />
      </ScrollForm>
      <Form onSubmit={form.handleSubmit(save)}>
        <ActionGroup className="keycloak__form_actions">
          <Button
            isDisabled={!form.formState.isDirty}
            variant="primary"
            type="submit"
            data-testid="attribute-create"
          >
            {t("common:create")}
          </Button>
          <Button
            variant="link"
            onClick={() =>
              history.push(toUserProfile({ realm, tab: "attributes" }))
            }
            data-testid="attribute-cancel"
          >
            {t("common:cancel")}
          </Button>
        </ActionGroup>
      </Form>
    </UserProfileProvider>
  );
};

export default function NewAttributeSettings() {
  const { t } = useTranslation("realm-settings");
  const form = useForm<UserProfileConfig>({ mode: "onChange" });

  const save = async (profileConfig: UserProfileConfig) => {
    console.log(">>>> TODO ", profileConfig);
  };

  return (
    <FormProvider {...form}>
      <ViewHeader
        titleKey={t("createAttribute")}
        subKey={t("createAttributeSubTitle")}
      />
      <PageSection variant="light">
        <CreateAttributeFormContent save={() => form.handleSubmit(save)()} />
      </PageSection>
    </FormProvider>
  );
}
