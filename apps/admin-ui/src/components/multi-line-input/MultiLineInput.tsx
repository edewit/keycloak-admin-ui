import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  TextInputProps,
} from "@patternfly/react-core";
import { MinusCircleIcon, PlusCircleIcon } from "@patternfly/react-icons";
import { Fragment, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

function stringToMultiline(value?: string): string[] {
  return value ? value.split("##") : [];
}

function toStringValue(formValue: string[]): string {
  return formValue.join("##");
}

type IdValue = {
  id: number;
  value: string;
};

const generateId = () => Math.floor(Math.random() * 1000);

export type MultiLineInputProps = Omit<TextInputProps, "form"> & {
  name: string;
  addButtonLabel?: string;
  isDisabled?: boolean;
  defaultValue?: string[];
  stringify?: boolean;
};

export const MultiLineInput = ({
  name,
  addButtonLabel,
  isDisabled = false,
  defaultValue,
  stringify = false,
  ...rest
}: MultiLineInputProps) => {
  const { t } = useTranslation();
  const { register, setValue, control } = useFormContext();
  const value = useWatch({
    name,
    control,
    defaultValue: defaultValue || "",
  });

  const fields = useMemo<IdValue[]>(() => {
    let values = stringify ? stringToMultiline(value as string) : value;

    values =
      Array.isArray(values) && values.length !== 0
        ? values
        : defaultValue || [""];

    return values.map((value: string) => ({ value, id: generateId() }));
  }, [value]);

  const remove = (index: number) => {
    update([...fields.slice(0, index), ...fields.slice(index + 1)]);
  };

  const append = () => {
    update([...fields, { id: generateId(), value: "" }]);
  };

  const updateValue = (index: number, value: string) => {
    update([
      ...fields.slice(0, index),
      { ...fields[index], value },
      ...fields.slice(index + 1),
    ]);
  };

  const update = (values: IdValue[]) => {
    const fieldValue = values.flatMap((field) => field.value);
    setValue(name, stringify ? toStringValue(fieldValue) : fieldValue, {
      shouldDirty: true,
    });
  };

  useEffect(() => {
    register(name);
  }, [register]);

  return (
    <>
      {fields.map(({ id, value }, index) => (
        <Fragment key={id}>
          <InputGroup>
            <TextInput
              data-testid={name + index}
              onChange={(value) => updateValue(index, value)}
              name={`${name}[${index}].value`}
              value={value}
              isDisabled={isDisabled}
              {...rest}
            />
            <Button
              variant={ButtonVariant.link}
              onClick={() => remove(index)}
              tabIndex={-1}
              aria-label={t("common:remove")}
              isDisabled={fields.length === 1}
            >
              <MinusCircleIcon />
            </Button>
          </InputGroup>
          {index === fields.length - 1 && (
            <Button
              variant={ButtonVariant.link}
              onClick={append}
              tabIndex={-1}
              aria-label={t("common:add")}
              data-testid="addValue"
              isDisabled={!value}
            >
              <PlusCircleIcon /> {t(addButtonLabel || "common:add")}
            </Button>
          )}
        </Fragment>
      ))}
    </>
  );
};
