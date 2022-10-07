import { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, FormGroup, Modal } from "@patternfly/react-core";

import { FormProvider, useFieldArray, useForm } from "react-hook-form";

import type { Permission, Resource } from "../../representations";
import { useAlerts } from "../../context/alerts";
import { useAccountClient } from "../../context/fetch";
import { FormSelect } from "../components/form-select/FormSelect";
import { KeycloakTextInput } from "../components/keycloak-text-input/KeycloakTextInput";

type EditTheResourceProps = {
  resource: Resource;
  permissions?: Permission[];
  onClose: () => void;
};

type FormValues = {
  permissions: Permission[];
};

export const EditTheResource = ({
  resource,
  permissions,
  onClose,
}: EditTheResourceProps) => {
  const { t } = useTranslation();
  const accountClient = useAccountClient();
  const { addAlert, addError } = useAlerts();

  const form = useForm<FormValues>({ shouldUnregister: false });
  const { control, register, reset, handleSubmit } = form;

  const { fields } = useFieldArray<FormValues>({
    control,
    name: "permissions",
  });

  useEffect(() => reset({ permissions }), []);

  const editShares = async ({ permissions }: FormValues) => {
    try {
      await Promise.all(
        permissions.map((permission) =>
          accountClient.updatePermissions(resource._id, [permission])
        )
      );
      addAlert("updateSuccess");
      onClose();
    } catch (error) {
      addError("updateError", error);
    }
  };

  return (
    <Modal
      title={t("editTheResourceTitle", [resource.name])}
      variant="medium"
      isOpen
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          id="done"
          type="submit"
          form="edit-form"
        >
          {t("done")}
        </Button>,
      ]}
    >
      <Form id="edit-form" onSubmit={handleSubmit(editShares)}>
        <FormProvider {...form}>
          {fields.map((p, index) => (
            <Fragment key={p.id}>
              <FormGroup label={t("user")} fieldId={`user-${p.id}`}>
                <KeycloakTextInput
                  id={`user-${p.id}`}
                  type="text"
                  {...register(`permissions.${index}.username`)}
                  isDisabled
                />
              </FormGroup>
              <FormSelect
                id={`permissions-${p.id}`}
                name={`permissions.${index}.scopes`}
                label="permissions"
                variant="typeaheadmulti"
                controller={{ defaultValue: [] }}
                options={resource.scopes.map(({ name, displayName }) => ({
                  key: name,
                  value: displayName || name,
                }))}
                menuAppendTo="parent"
              />
            </Fragment>
          ))}
        </FormProvider>
      </Form>
    </Modal>
  );
};
