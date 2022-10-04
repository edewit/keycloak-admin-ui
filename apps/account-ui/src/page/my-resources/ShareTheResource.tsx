import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  Modal,
  Button,
  Form,
  FormGroup,
  ChipGroup,
  Chip,
  InputGroup,
  ValidatedOptions,
} from "@patternfly/react-core";

import { Permission, Resource } from "../../representations";
import { KeycloakTextInput } from "../components/keycloak-text-input/KeycloakTextInput";
import { FormSelect } from "../components/form-select/FormSelect";
import { SharedWith } from "./SharedWith";
import { useAccountClient } from "../../context/fetch";
import { useAlerts } from "../../context/alerts";

type ShareTheResourceProps = {
  resource: Resource;
  permissions?: Permission[];
  open: boolean;
  onClose: () => void;
};

type FormValues = {
  permissions: string[];
  usernames: { value: string }[];
};

export const ShareTheResource = ({
  resource,
  permissions,
  open,
  onClose,
}: ShareTheResourceProps) => {
  const { t } = useTranslation();
  const accountClient = useAccountClient();
  const { addAlert, addError } = useAlerts();
  const form = useForm<FormValues>();
  const {
    control,
    register,
    formState: { errors, isValid },
    setError,
    clearErrors,
    handleSubmit,
  } = form;
  const { fields, append, remove } = useFieldArray<FormValues>({
    control,
    name: "usernames",
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ value: "" });
    }
  }, [fields]);

  const watchFields = useWatch({
    control,
    name: "usernames",
  });

  const isDisabled = watchFields.every(
    ({ value }) => value.trim().length === 0
  );

  const addShare = async ({ usernames, permissions }: FormValues) => {
    try {
      await Promise.all(
        usernames.map(({ value: username }) =>
          accountClient.updateRequest(resource._id, username, permissions)
        )
      );
      addAlert("shareSuccess");
      onClose();
    } catch (error) {
      addError("shareError", error);
    }
  };

  const validateUser = async () => {
    const userOrEmails = fields.map((f) => f.value).filter((f) => f !== "");
    const userPermission = permissions
      ?.map((p) => [p.username, p.email])
      .flat();

    const hasUsers = userOrEmails.length > 0;
    const alreadyShared =
      userOrEmails.filter((u) => userPermission?.includes(u)).length !== 0;

    if (!hasUsers || alreadyShared) {
      setError("usernames", {
        message: !hasUsers ? t("required") : t("resourceAlreadyShared"),
      });
    } else {
      clearErrors();
    }

    return hasUsers && !alreadyShared;
  };

  return (
    <Modal
      title={t("shareTheResourceTitle", [resource.name])}
      variant="medium"
      isOpen={open}
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          id="done"
          isDisabled={!isValid}
          type="submit"
          form="share-form"
        >
          {t("done")}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t("cancel")}
        </Button>,
      ]}
    >
      <Form id="share-form" onSubmit={handleSubmit(addShare)}>
        <FormGroup
          label={t("shareUserLabel")}
          type="string"
          helperTextInvalid={errors.usernames?.message}
          fieldId="users"
          isRequired
          validated={
            errors.usernames ? ValidatedOptions.error : ValidatedOptions.default
          }
        >
          <InputGroup>
            <KeycloakTextInput
              id="users"
              placeholder={t("usernamePlaceholder")}
              validated={
                errors.usernames
                  ? ValidatedOptions.error
                  : ValidatedOptions.default
              }
              {...register(`usernames.${fields.length - 1}.value`, {
                validate: validateUser,
              })}
            />
            <Button
              key="add-user"
              variant="primary"
              id="add"
              onClick={() => append({ value: "" })}
              isDisabled={isDisabled}
            >
              {t("add")}
            </Button>
          </InputGroup>
          {fields.length > 1 && (
            <ChipGroup categoryName={t("shareWith")}>
              {fields.map(
                (field, index) =>
                  index !== fields.length - 1 && (
                    <Chip key={field.id} onClick={() => remove(index)}>
                      {field.value}
                    </Chip>
                  )
              )}
            </ChipGroup>
          )}
        </FormGroup>
        <FormProvider {...form}>
          <FormGroup label="" fieldId="permissions-selected">
            <FormSelect
              name="permissions"
              variant="typeaheadmulti"
              controller={{ defaultValue: [] }}
              options={resource.scopes.map(({ name, displayName }) => ({
                key: name,
                value: displayName || name,
              }))}
              menuAppendTo="parent"
            />
          </FormGroup>
        </FormProvider>
        <FormGroup>
          <SharedWith permissions={permissions} />
        </FormGroup>
      </Form>
    </Modal>
  );
};
