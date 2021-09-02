import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  Radio,
} from "@patternfly/react-core";

import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useAdminClient, useFetch } from "../../../context/auth/AdminClient";

type FlowType = "client" | "form" | "basic";

type AddStepModalProps = {
  name: string;
  type: FlowType;
  onSelect: () => void;
};

export const AddStepModal = ({ name, type, onSelect }: AddStepModalProps) => {
  const { t } = useTranslation("authentication");
  const adminClient = useAdminClient();

  const [, setProviders] = useState<AuthenticationProviderRepresentation[]>();

  useFetch(
    () => {
      switch (type) {
        case "client":
          return adminClient.authenticationManagement.getClientAuthenticatorProviders();
        case "form":
          return adminClient.authenticationManagement.getFormActionProviders();
        case "basic":
        default:
          return adminClient.authenticationManagement.getAuthenticatorProviders();
      }
    },
    (providers) => setProviders(providers),
    []
  );

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={true}
      title={t("executionConfig", { name })}
      onClose={() => onSelect()}
    >
      <Form>
        <FormGroup
          fieldId="simple-form-checkbox-group"
          label="How can we contact you?"
        >
          <Radio
            name="Email"
            label="Email"
            id="inlinecheck01"
            description="Some description can be long and then it will still look nice because patternfly is super and does this kind of things for us"
          />
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
