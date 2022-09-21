import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, ControllerProps, useFormContext } from "react-hook-form";
import {
  FormGroup,
  Select,
  SelectOption,
  SelectProps,
  ValidatedOptions,
} from "@patternfly/react-core";

type Option = {
  key: string;
  value: string;
};

type FormSelectProps = Omit<
  SelectProps,
  "name" | "onToggle" | "selections" | "onSelect" | "onClear" | "isOpen"
> & {
  name: string;
  options: string[] | Option[];
  controller: Omit<ControllerProps, "name" | "render">;
};

export const FormSelect = ({
  name,
  options,
  controller,
  ...rest
}: FormSelectProps) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [open, setOpen] = useState(false);
  return (
    <FormGroup
      isRequired={controller.rules?.required === true}
      label={t(name)}
      fieldId={name}
      helperTextInvalid={errors[name]?.message}
      validated={
        errors[name] ? ValidatedOptions.error : ValidatedOptions.default
      }
    >
      <Controller
        {...controller}
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            {...rest}
            toggleId={name}
            onToggle={(isOpen) => setOpen(isOpen)}
            selections={value}
            onSelect={(_, v) => {
              const option = v.toString();
              if (value.includes(option)) {
                onChange(value.filter((item: string) => item !== option));
              } else {
                onChange([...value, option]);
              }
            }}
            onClear={(event) => {
              event.stopPropagation();
              onChange([]);
            }}
            isOpen={open}
            validated={
              errors[name] ? ValidatedOptions.error : ValidatedOptions.default
            }
          >
            {options.map((option) => (
              <SelectOption
                key={typeof option === "string" ? option : option.key}
                value={typeof option === "string" ? option : option.key}
              >
                {typeof option === "string" ? option : option.value}
              </SelectOption>
            ))}
          </Select>
        )}
      />
    </FormGroup>
  );
};
