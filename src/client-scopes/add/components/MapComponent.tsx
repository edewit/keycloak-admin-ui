import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormGroup } from "@patternfly/react-core";

import {
  AttributeForm,
  AttributesForm,
} from "../../../components/attribute-form/AttributeForm";
import { HelpItem } from "../../../components/help-enabler/HelpItem";
import type { ComponentProps } from "./components";

export const MapComponent = ({
  name,
  label,
  helpText,
  defaultValue,
}: ComponentProps) => {
  const { t } = useTranslation("client-scopes");
  const form = useFormContext<AttributeForm>();
  const { append, remove, fields } = useFieldArray({
    control: form.control,
    name: name!,
  });

  useEffect(() => {
    form.setValue(name!, defaultValue);
  }, []);

  return (
    <FormGroup
      label={t(label!)}
      labelIcon={
        <HelpItem helpText={t(helpText!)} forLabel={t(label!)} forID={name!} />
      }
      fieldId={name!}
    >
      <AttributesForm form={form} inConfig array={{ fields, append, remove }} />
    </FormGroup>
  );
};
