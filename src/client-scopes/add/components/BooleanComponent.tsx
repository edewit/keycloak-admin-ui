import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormGroup, Switch } from "@patternfly/react-core";

import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { createKey } from "../../../util";
import type { ComponentProps } from "./components";

export const BooleanComponent = ({
  name,
  label,
  helpText,
  defaultValue,
}: ComponentProps) => {
  const { t } = useTranslation("client-scopes");
  const { control } = useFormContext();

  return (
    <FormGroup
      hasNoPaddingTop
      label={t(label!)}
      fieldId={name!}
      labelIcon={
        <HelpItem helpText={t(helpText!)} forLabel={t(label!)} forID={name!} />
      }
    >
      <Controller
        name={`config.${createKey(name)}`}
        data-testid={name}
        defaultValue={defaultValue || "false"}
        control={control}
        render={({ onChange, value }) => (
          <Switch
            id={name!}
            label={t("common:on")}
            labelOff={t("common:off")}
            isChecked={value === "true" || value === true}
            onChange={(value) => onChange("" + value)}
          />
        )}
      />
    </FormGroup>
  );
};
