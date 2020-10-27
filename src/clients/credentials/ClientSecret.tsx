import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ClipboardCopy,
  FormGroup,
  Split,
  SplitItem,
} from "@patternfly/react-core";

import { HelpItem } from "../../components/help-enabler/HelpItem";

export type ClientSecretProps = {
  secret: string;
  toggle: () => void;
};

export const ClientSecret = ({ secret, toggle }: ClientSecretProps) => {
  const { t } = useTranslation("clients");
  return (
    <FormGroup
      label={t("clientSecret")}
      fieldId="kc-client-secret"
      labelIcon={
        <HelpItem
          helpText="clients-help:client-secret"
          forLabel={t("clientSecret")}
          forID="kc-client-secret"
        />
      }
    >
      <Split hasGutter>
        <SplitItem isFilled>
          <ClipboardCopy id="kc-client-secret" isReadOnly>
            {secret}
          </ClipboardCopy>
        </SplitItem>
        <SplitItem>
          <Button variant="secondary" onClick={toggle}>
            {t("regenerate")}
          </Button>
        </SplitItem>
      </Split>
    </FormGroup>
  );
};
