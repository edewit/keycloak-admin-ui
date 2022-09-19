import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { ActionGroup, Button, Form } from "@patternfly/react-core";

import { useAccountClient, useFetch } from "../context/AccountClient";
import { UserRepresentation } from "../representations";
import { FormText } from "./components/form-text/FormText";

export function AccountPage() {
  const { t } = useTranslation();
  const accountClient = useAccountClient();
  const form = useForm<UserRepresentation>({ mode: "onChange" });
  const {
    reset,
    formState: { isValid },
    handleSubmit,
  } = form;

  useFetch(
    (signal) => accountClient.fetchPersonalInfo({ signal }),
    (data) => reset(data),
    [reset]
  );

  const save = (userInfo: UserRepresentation) => console.log(userInfo);

  return (
    <Form isHorizontal onSubmit={handleSubmit(save)}>
      <FormProvider {...form}>
        <FormText
          name="username"
          options={{ maxLength: 254, required: true }}
        />
        <FormText name="firstName" />
        <FormText name="lastName" />
      </FormProvider>
      <ActionGroup>
        <Button
          type="submit"
          id="save-btn"
          variant="primary"
          isDisabled={!isValid}
        >
          {t("doSave")}
        </Button>
        <Button id="cancel-btn" variant="link" onClick={() => reset()}>
          {t("doCancel")}
        </Button>
      </ActionGroup>
    </Form>
  );
}
