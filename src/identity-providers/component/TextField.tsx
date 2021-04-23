import React from "react";
import { useFormContext } from "react-hook-form";
import { TextInput } from "@patternfly/react-core";

import { FieldProps, FormGroupField } from "./FormGroupField";

export const TextField = ({ label, field }: FieldProps) => {
  const { register } = useFormContext();
  return (
    <FormGroupField label={label}>
      <TextInput type="text" id={label} name={field} ref={register} />
    </FormGroupField>
  );
};
