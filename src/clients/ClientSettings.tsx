import React, { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ScrollForm } from "../components/scroll-form/ScrollForm";
import { ClientDescription } from "./ClientDescription";
import { ClientRepresentation } from "./models/client-model";
import { FormGroup, TextInput } from "@patternfly/react-core";

type ClientSettingsProps = {
  client: ClientRepresentation;
};

export const ClientSettings = ({ client: clientInit }: ClientSettingsProps) => {
  const { t } = useTranslation();
  const [client, setClient] = useState({ ...clientInit });
  const onChange = (
    value: string | boolean,
    event: FormEvent<HTMLInputElement>
  ) => {
    const target = event.target;
    const name = (target as HTMLInputElement).name;

    setClient({
      ...client,
      [name]: value,
    });
  };
  return (
    <ScrollForm sections={[t("Capability config"), t("General settings")]}>
      <FormGroup label="Client ID" fieldId="kc-client-id">
        <TextInput
          type="text"
          id="kc-client-id"
          name="clientId"
          value={client.clientId}
          onChange={onChange}
        />
      </FormGroup>
      <ClientDescription client={client} onChange={() => {}} />
    </ScrollForm>
  );
};
