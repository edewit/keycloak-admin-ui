import React from "react";
import { ActionGroup, Button, Form, PageSection } from "@patternfly/react-core";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { ScrollForm } from "../components/scroll-form/ScrollForm";
import { useRealm } from "../context/realm-context/RealmContext";
import type UserProfileConfig from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { AttributesGeneralSettings } from "./user-profile/attributes/AttributesGeneralSettings";
import "./realm-settings-section.css";
import { toUserProfile } from "./routes/UserProfile";

const CreateAttributeFormContent = ({
  save,
}: {
  save: (component: UserProfileConfig) => void;
}) => {
  const { t } = useTranslation("realm-settings");
  const form = useFormContext();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const { realm } = useRealm();

  return (
    <>
      <ScrollForm
        sections={[
          t("generalSettings"),
          t("permission"),
          t("validations"),
          t("annotations"),
        ]}
      >
        <AttributesGeneralSettings form={form} attributeGroupEdit={!!id} />
      </ScrollForm>
      <Form onSubmit={form.handleSubmit(save)}>
        <ActionGroup className="keycloak__form_actions">
          <Button
            isDisabled={!form.formState.isDirty}
            variant="primary"
            type="submit"
            data-testid="attribute-save"
          >
            {t("common:save")}
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
    </>
  );
};

export default function NewAttributeSettings() {
  const form = useForm<UserProfileConfig>({ mode: "onChange" });

  const save = async (component: UserProfileConfig) => {
    console.log(">>>> TODO");
  };

  return (
    <FormProvider {...form}>
      <PageSection variant="light" className="pf-u-p-0">
        <PageSection variant="light">
          <CreateAttributeFormContent save={() => form.handleSubmit(save)()} />
        </PageSection>
      </PageSection>
    </FormProvider>
  );
}
