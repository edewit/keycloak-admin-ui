import React from "react";
import {
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  Radio,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";

type AddStepModalProps = {
  name: string;
  onSelect: () => void;
};

export const AddStepModal = ({ name, onSelect }: AddStepModalProps) => {
  const { t } = useTranslation("authentication");

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={true}
      title={t("executionConfig", { name })}
      onClose={() => onSelect()}
    >
      <Form>
        <FormGroup
          isInline
          fieldId="simple-form-checkbox-group"
          label="How can we contact you?"
        >
          <Radio name="Email" label="Email" id="inlinecheck01" />
          <Radio name="Email" label="Controlled radio" id="inlinecheck02" />
          <Radio
            name="Email"
            label="Reversed radio example"
            id="inlinecheck03"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};
