import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, UseFormMethods } from "react-hook-form";
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";

import type { IdentityProviderMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperTypeRepresentation";
import type { IdPMapperRepresentationWithAttributes } from "./AddMapper";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { camelCase } from "lodash";

type AddMapperFormProps = {
  mapperTypes?: Record<string, IdentityProviderMapperTypeRepresentation>;
  id: string;
  form: UseFormMethods<IdPMapperRepresentationWithAttributes>;
};

export const AddMapperForm = ({
  mapperTypes,
  form,
  id,
}: AddMapperFormProps) => {
  const { t } = useTranslation("identity-providers");

  const { control, register, errors, watch } = form;
  const mapperType = watch("identityProviderMapper");

  const [mapperTypeOpen, setMapperTypeOpen] = useState(false);

  const syncModes = ["inherit", "import", "legacy", "force"];
  const [syncModeOpen, setSyncModeOpen] = useState(false);

  return (
    <>
      <FormGroup
        label={t("common:name")}
        labelIcon={
          <HelpItem
            id="name-help-icon"
            helpText="identity-providers-help:addIdpMapperName"
            forLabel={t("common:name")}
            forID={t(`common:helpLabel`, { label: t("common:name") })}
          />
        }
        fieldId="kc-name"
        isRequired
        validated={
          errors.name ? ValidatedOptions.error : ValidatedOptions.default
        }
        helperTextInvalid={t("common:required")}
      >
        <TextInput
          ref={register({ required: true })}
          type="text"
          datatest-id="name-input"
          id="kc-name"
          name="name"
          isDisabled={!!id}
          validated={
            errors.name ? ValidatedOptions.error : ValidatedOptions.default
          }
        />
      </FormGroup>
      <FormGroup
        label={t("syncModeOverride")}
        isRequired
        labelIcon={
          <HelpItem
            helpText="identity-providers-help:syncModeOverride"
            forLabel={t("syncModeOverride")}
            forID={t(`common:helpLabel`, { label: t("syncModeOverride") })}
          />
        }
        fieldId="syncMode"
      >
        <Controller
          name="config.syncMode"
          defaultValue={syncModes[0].toUpperCase()}
          control={control}
          render={({ onChange, value }) => (
            <Select
              toggleId="syncMode"
              datatest-id="syncmode-select"
              required
              direction="down"
              onToggle={() => setSyncModeOpen(!syncModeOpen)}
              onSelect={(_, value) => {
                onChange(value.toString().toUpperCase());
                setSyncModeOpen(false);
              }}
              selections={t(`syncModes.${value.toLowerCase()}`)}
              variant={SelectVariant.single}
              aria-label={t("syncMode")}
              isOpen={syncModeOpen}
            >
              {syncModes.map((option) => (
                <SelectOption
                  selected={option === value}
                  key={option}
                  data-testid={option}
                  value={option.toUpperCase()}
                >
                  {t(`syncModes.${option}`)}
                </SelectOption>
              ))}
            </Select>
          )}
        />
      </FormGroup>
      <FormGroup
        label={t("mapperType")}
        labelIcon={
          <HelpItem
            helpText={mapperTypes?.[mapperType!]?.helpText}
            forLabel={t("mapperType")}
            forID={t(`common:helpLabel`, { label: t("mapperType") })}
          />
        }
        fieldId="identityProviderMapper"
      >
        <Controller
          name="identityProviderMapper"
          control={control}
          render={({ onChange, value }) => (
            <Select
              toggleId="identityProviderMapper"
              data-testid="idp-mapper-select"
              isDisabled={!!id}
              required
              direction="down"
              onToggle={() => setMapperTypeOpen(!mapperTypeOpen)}
              onSelect={(_, value) => {
                onChange(value);
                setMapperTypeOpen(false);
              }}
              selections={
                mapperTypes &&
                Object.values(mapperTypes).find(
                  (item) => item.id?.toLowerCase() === value
                )?.name
              }
              variant={SelectVariant.single}
              aria-label={t("syncMode")}
              isOpen={mapperTypeOpen}
            >
              {mapperTypes &&
                Object.values(mapperTypes).map((option) => (
                  <SelectOption
                    selected={option === value}
                    datatest-id={option.id}
                    key={option.id}
                    value={option.id}
                  >
                    {t(`mapperTypes.${camelCase(option.name)}`)}
                  </SelectOption>
                ))}
            </Select>
          )}
        />
      </FormGroup>
    </>
  );
};
