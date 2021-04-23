import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@patternfly/react-core";

import { FormGroupField } from "./FormGroupField";

export const SwitchField = ({ label, field }: FieldProps) => {
  const { t } = useTranslation("identity-providers");
  const { control } = useFormContext();
  return (
    <FormGroupField label={label}>
      <Controller
        name={field!}
        defaultValue="false"
        control={control}
        render={({ onChange, value }) => (
          <Switch
            id={label}
            label={t("common:on")}
            labelOff={t("common:off")}
            isChecked={value === "true"}
            onChange={(value) => onChange("" + value)}
          />
        )}
      />
    </FormGroupField>
  );
};
