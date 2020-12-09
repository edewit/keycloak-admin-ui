import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardCopy,
  Form,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import ClientScopeRepresentation from "keycloak-admin/lib/defs/clientScopeRepresentation";

import { HelpItem } from "../../components/help-enabler/HelpItem";
import { useAdminClient } from "../../context/auth/AdminClient";

import "./evaluate.css";

export type EvaluateScopesProps = {
  clientId: string;
  protocol: string;
};

export const EvaluateScopes = ({ clientId, protocol }: EvaluateScopesProps) => {
  const { t } = useTranslation();
  const adminClient = useAdminClient();
  const [selectableScopes, setSelectableScopes] = useState<
    ClientScopeRepresentation[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([protocol]);

  useEffect(() => {
    (async () => {
      const optionalClientScopes = await adminClient.clients.listOptionalClientScopes(
        { id: clientId }
      );
      setSelectableScopes(optionalClientScopes);
    })();
  }, []);

  return (
    <Form isHorizontal>
      <FormGroup
        label={t("rootUrl")}
        fieldId="kc-root-url"
        labelIcon={
          <HelpItem
            helpText="client-scopes-help:protocolMapper"
            forLabel={t("protocolMapper")}
            forID="protocolMapper"
          />
        }
      >
        <Split hasGutter>
          <SplitItem isFilled>
            <Select
              variant={SelectVariant.typeaheadMulti}
              typeAheadAriaLabel="Select a state"
              onToggle={() => setIsOpen(!isOpen)}
              isOpen={isOpen}
              selections={selected}
              onSelect={(_, value) => {
                // const option = value as ClientScopeRepresentation;
                const option = value as string;
                if (selected.includes(option)) {
                  setSelected(selected.filter((item) => item !== option));
                } else {
                  setSelected([...selected, option]);
                }
              }}
              aria-labelledby="test"
              placeholderText="Select a state"
            >
              {selectableScopes.map((option, index) => (
                <SelectOption key={index} value={option.name} />
              ))}
            </Select>
          </SplitItem>
          <SplitItem>
            <ClipboardCopy className="keycloak__scopes_evaluate__clipboard-copy">
              {isOpen}
            </ClipboardCopy>
          </SplitItem>
        </Split>
      </FormGroup>
    </Form>
  );
};
