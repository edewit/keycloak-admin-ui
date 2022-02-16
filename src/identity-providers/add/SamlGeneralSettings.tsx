import React from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { FormGroup, TextInput, ValidatedOptions } from "@patternfly/react-core";

import { HelpItem } from "../../components/help-enabler/HelpItem";
import { RedirectUrl } from "../component/RedirectUrl";
import { TextField } from "../component/TextField";
import { DisplayOrder } from "../component/DisplayOrder";
import { useParams } from "react-router";
import type { IdentityProviderParams } from "../routes/IdentityProvider";
import { FormattedLink } from "../../components/external-link/FormattedLink";
import { useRealm } from "../../context/realm-context/RealmContext";
import environment from "../../environment";

import "./saml-general-settings.css";

export const SamlGeneralSettings = ({ id }: { id: string }) => {
  const { t } = useTranslation("identity-providers");
  const { realm } = useRealm();
  const { tab } = useParams<IdentityProviderParams>();

  const { register, errors, watch } = useFormContext();

  const alias = watch("alias");

  return (
    <>
      <RedirectUrl id={id} />

      <FormGroup
        label={t("alias")}
        labelIcon={
          <HelpItem
            helpText="identity-providers-help:alias"
            fieldLabelId="identity-providers:alias"
          />
        }
        fieldId="alias"
        isRequired
        validated={
          errors.alias ? ValidatedOptions.error : ValidatedOptions.default
        }
        helperTextInvalid={t("common:required")}
      >
        <TextInput
          isRequired
          type="text"
          id="alias"
          data-testid="alias"
          name="alias"
          isReadOnly={tab === "settings"}
          validated={
            errors.alias ? ValidatedOptions.error : ValidatedOptions.default
          }
          ref={register({ required: true })}
        />
      </FormGroup>

      <TextField field="displayName" label="displayName" />
      <DisplayOrder />
      <FormGroup
        label={t("endpoints")}
        fieldId="endpoints"
        labelIcon={
          <HelpItem
            helpText="identity-providers-help:alias"
            fieldLabelId="identity-providers:alias"
          />
        }
        className="keycloak__identity-providers__saml_link"
      >
        <FormattedLink
          title={t("samlEndpointsLabel")}
          href={`${environment.authUrl}/realms/${realm}/broker/${alias}/endpoint/descriptor`}
          isInline
        />
      </FormGroup>
    </>
  );
};
