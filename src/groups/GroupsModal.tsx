import React from "react";
import {
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import type GroupRepresentation from "keycloak-admin/lib/defs/groupRepresentation";
import { useAdminClient } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";

type GroupsModalProps = {
  id?: string;
  rename?: string;
  handleModalToggle: () => void;
  refresh: (group?: GroupRepresentation) => void;
};

export const GroupsModal = ({
  id,
  rename,
  handleModalToggle,
  refresh,
}: GroupsModalProps) => {
  const { t } = useTranslation("groups");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const { register, errors, handleSubmit } = useForm({
    defaultValues: { name: rename },
  });

  const submitForm = async (group: GroupRepresentation) => {
    try {
      if (!id) {
        await adminClient.groups.create(group);
      } else if (rename) {
        await adminClient.groups.update({ id }, group);
      } else {
        await adminClient.groups.setOrCreateChild({ id }, group);
      }

      refresh(rename ? group : undefined);
      handleModalToggle();
      addAlert(
        t(rename ? "groupUpdated" : "groupCreated"),
        AlertVariant.success
      );
    } catch (error) {
      addError("groups:couldNotCreateGroup", error);
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={t(rename ? "renameAGroup" : "createAGroup")}
      isOpen={true}
      onClose={handleModalToggle}
      actions={[
        <Button
          data-testid={`${rename ? "rename" : "create"}Group`}
          key="confirm"
          variant="primary"
          type="submit"
          form="group-form"
        >
          {t(rename ? "rename" : "create")}
        </Button>,
        <Button
          id="modal-cancel"
          key="cancel"
          variant={ButtonVariant.link}
          onClick={() => {
            handleModalToggle();
          }}
        >
          {t("common:cancel")}
        </Button>,
      ]}
    >
      <Form id="group-form" isHorizontal onSubmit={handleSubmit(submitForm)}>
        <FormGroup
          name="create-modal-group"
          label={t("common:name")}
          fieldId="group-id"
          helperTextInvalid={t("common:required")}
          validated={
            errors.name ? ValidatedOptions.error : ValidatedOptions.default
          }
          isRequired
        >
          <TextInput
            data-testid="groupNameInput"
            aria-label="group name input"
            ref={register({ required: true })}
            autoFocus
            type="text"
            id="create-group-name"
            name="name"
            validated={
              errors.name ? ValidatedOptions.error : ValidatedOptions.default
            }
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};
