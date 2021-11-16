import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
} from "@patternfly/react-core";

import { HelpItem } from "../help-enabler/HelpItem";
import type { ComponentProps } from "./components";
import { convertToHyphens } from "../../util";

export const MultiValuedListComponent = ({
  name,
  label,
  helpText,
  defaultValue,
  options,
  parentCallback,
  selectedValues,
}: ComponentProps) => {
  const { t } = useTranslation("dynamic");
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState<string[]>([defaultValue]);

  useEffect(() => {
    if (selectedValues) {
      parentCallback!(selectedValues);
      setSelectedItems(selectedValues!);
    }
  }, []);

  return (
    <FormGroup
      label={t(label!)}
      labelIcon={
        <HelpItem helpText={t(helpText!)} forLabel={label!} forID={name!} />
      }
      fieldId={name!}
    >
      <Controller
        name={`config.${convertToHyphens(name!)}`}
        control={control}
        defaultValue={defaultValue ? [defaultValue] : []}
        render={({ onChange, value }) => (
          <Select
            toggleId={name}
            data-testid={name}
            chipGroupProps={{
              numChips: 3,
              expandedText: t("common:hide"),
              collapsedText: t("common:showRemaining"),
            }}
            variant={SelectVariant.typeaheadMulti}
            typeAheadAriaLabel="Select"
            onToggle={(isOpen) => setOpen(isOpen)}
            selections={value}
            onSelect={(_, v) => {
              const option = v.toString();
              if (!value) {
                onChange([option]);

                if (selectedValues) {
                  parentCallback!([option]);
                  setSelectedItems([option]);
                }
              } else if (value.includes(option)) {
                if (selectedValues) {
                  const updatedItems = selectedItems.filter(
                    (item: string) => item !== option
                  );
                  setSelectedItems(updatedItems);
                  parentCallback!(updatedItems);
                  onChange(updatedItems);
                } else {
                  onChange(value.filter((item: string) => item !== option));
                }
              } else {
                if (selectedValues) {
                  parentCallback!([...value, option]);
                  setSelectedItems([...selectedItems, option]);
                }
                onChange([...value, option]);
              }
            }}
            onClear={(event) => {
              event.stopPropagation();
              onChange([]);
            }}
            isOpen={open}
            aria-label={t(label!)}
          >
            {options?.map((option) => (
              <SelectOption key={option} value={option} />
            ))}
          </Select>
        )}
      />
    </FormGroup>
  );
};
