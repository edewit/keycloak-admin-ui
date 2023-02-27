import { ActionGroup, Button, Form } from "@patternfly/react-core";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAlerts } from "ui-shared";

import { getPersonalInfo, savePersonalInfo } from "../api/methods";
import {
  UserProfileMetadata,
  UserRepresentation,
} from "../api/representations";
import { Page } from "../components/page/Page";
import { usePromise } from "../utils/usePromise";
import { FormField } from "./FormField";

const PersonalInfo = () => {
  const { t } = useTranslation();
  const [userProfileMetadata, setUserProfileMetadata] =
    useState<UserProfileMetadata>();
  const form = useForm<UserRepresentation>({
    mode: "onChange",
  });
  const { handleSubmit, reset } = form;
  const { addAlert, addError } = useAlerts();

  usePromise(
    (signal) => getPersonalInfo({ signal }),
    (personalInfo) => {
      setUserProfileMetadata(personalInfo.userProfileMetadata);
      reset(personalInfo);
    }
  );

  const onSubmit = async (user: UserRepresentation) => {
    try {
      await savePersonalInfo(user);
      addAlert("accountUpdatedMessage");
    } catch (error) {
      addError("accountUpdatedError", error);
    }
  };

  return (
    <Page title={t("personalInfo")} description={t("personalInfoDescription")}>
      <Form isHorizontal onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...form}>
          {(userProfileMetadata?.attributes || []).map((attribute) => (
            <FormField key={attribute.name} attribute={attribute} />
          ))}
        </FormProvider>
        <ActionGroup>
          <Button type="submit" id="save-btn" variant="primary">
            {t("doSave")}
          </Button>
          <Button id="cancel-btn" variant="link" onClick={() => reset()}>
            {t("doCancel")}
          </Button>
        </ActionGroup>
      </Form>
    </Page>
  );
};

export default PersonalInfo;
