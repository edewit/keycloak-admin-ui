import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import {
  Button,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from "@patternfly/react-core";
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { MinusCircleIcon, PlusCircleIcon } from "@patternfly/react-icons";

import "../annotation-form/annotation-form.css";
import { camelCase } from "lodash-es";

export type AnnotationType = {
  key?: string;
  name: string;
  values?: {
    [key: string]: string;
  }[];
};

type AnnotationInputProps = {
  name: string;
  selectableValues?: AnnotationType[];
  isKeySelectable?: boolean;
  annotations?: Record<string, any>[];
};

export const AnnotationInput = ({
  name,
  isKeySelectable,
  selectableValues,
  annotations,
}: AnnotationInputProps) => {
  const { t } = useTranslation("common");
  const { control, register, watch, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name,
  });

  useEffect(() => {
    if (!fields.length) {
      append({ key: "", value: "" });
    }
  }, [fields]);

  const [isKeyOpenArray, setIsKeyOpenArray] = useState([false]);
  const watchLastKey = watch(`${name}[${fields.length - 1}].key`, "");
  const watchLastValue = watch(`${name}[${fields.length - 1}].value`, "");

  const [isValueOpenArray, setIsValueOpenArray] = useState([false]);
  const toggleKeySelect = (rowIndex: number, open: boolean) => {
    const arr = [...isKeyOpenArray];
    arr[rowIndex] = open;
    setIsKeyOpenArray(arr);
  };

  const toggleValueSelect = (rowIndex: number, open: boolean) => {
    const arr = [...isValueOpenArray];
    arr[rowIndex] = open;
    setIsValueOpenArray(arr);
  };

  const renderValueInput = (rowIndex: number, annotation: any) => {
    const annotationValues: { key: string; name: string }[] | undefined = [];

    const scopeValues = annotations?.find(
      (annotation) => annotation.name === getValues().annotations[rowIndex]?.key
    )?.scopes;

    const renderSelectOptionType = () => {
      if (annotationValues.length && !annotations) {
        return annotationValues.map((annotation) => (
          <SelectOption key={annotation.key} value={annotation.key}>
            {annotation.name}
          </SelectOption>
        ));
      } else if (scopeValues?.length) {
        return scopeValues.map((scope: any) => (
          <SelectOption key={scope.name} value={scope.name}>
            {scope.name}
          </SelectOption>
        ));
      }
    };

    const getMessageBundleKey = (annotationName: string) =>
      camelCase(annotationName).replace(/\W/g, "");

    return (
      <Td>
        {annotations || annotationValues.length ? (
          <Controller
            name={`${name}[${rowIndex}].value`}
            defaultValue={[]}
            control={control}
            render={({ onChange, value }) => (
              <Select
                id={`${annotation.id}-value`}
                className="kc-annotation-value-selectable"
                name={`${name}[${rowIndex}].value`}
                chipGroupProps={{
                  numChips: 1,
                  expandedText: t("common:hide"),
                  collapsedText: t("common:showRemaining"),
                }}
                toggleId={`group-${name}`}
                onToggle={(open) => toggleValueSelect(rowIndex, open)}
                isOpen={isValueOpenArray[rowIndex]}
                variant={SelectVariant.typeahead}
                typeAheadAriaLabel={t("clients:selectOrTypeAKey")}
                placeholderText={t("clients:selectOrTypeAKey")}
                selections={value}
                onSelect={(_, v) => {
                  onChange(v);

                  toggleValueSelect(rowIndex, false);
                }}
              >
                {renderSelectOptionType()}
              </Select>
            )}
          />
        ) : (
          <TextInput
            id={`${getMessageBundleKey(annotation.key)}-value`}
            className="value-input"
            name={`${name}[${rowIndex}].value`}
            ref={register()}
            defaultValue={annotation.value}
            data-testid="annotation-value-input"
          />
        )}
      </Td>
    );
  };

  return (
    <TableComposable
      className="kc-annotations__table"
      aria-label="Annotation keys and values"
      variant="compact"
      borders={false}
    >
      <Thead>
        <Tr>
          <Th id="key" width={40}>
            {t("key")}
          </Th>
          <Th id="value" width={40}>
            {t("value")}
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {fields.map((annotation, rowIndex) => (
          <Tr key={annotation.id} data-testid="annotation-row">
            <Td>
              {isKeySelectable ? (
                <Controller
                  name={`${name}[${rowIndex}].key`}
                  defaultValue={annotation.key}
                  control={control}
                  render={({ onChange, value }) => (
                    <Select
                      id={`${name}[${rowIndex}].key`}
                      className="kc-annotation-key-selectable"
                      name={`${name}[${rowIndex}].key`}
                      toggleId={`group-${name}`}
                      onToggle={(open) => toggleKeySelect(rowIndex, open)}
                      isOpen={isKeyOpenArray[rowIndex]}
                      variant={SelectVariant.typeahead}
                      typeAheadAriaLabel={t("clients:selectOrTypeAKey")}
                      placeholderText={t("clients:selectOrTypeAKey")}
                      selections={value}
                      onSelect={(_, v) => {
                        onChange(v.toString());

                        toggleKeySelect(rowIndex, false);
                      }}
                    >
                      {selectableValues?.map((annotation) => (
                        <SelectOption
                          selected={annotation.name === value}
                          key={annotation.key}
                          value={annotations ? annotation.name : annotation.key}
                        >
                          {annotation.name}
                        </SelectOption>
                      ))}
                    </Select>
                  )}
                />
              ) : (
                <TextInput
                  id={`${annotation.id}-key`}
                  name={`${name}[${rowIndex}].key`}
                  ref={register()}
                  defaultValue={annotation.key}
                  data-testid="annotation-key-input"
                />
              )}
            </Td>
            {renderValueInput(rowIndex, annotation)}
            <Td key="minus-button" id={`kc-minus-button-${rowIndex}`}>
              <Button
                id={`minus-button-${rowIndex}`}
                variant="link"
                className="kc-annotations__minus-icon"
                onClick={() => remove(rowIndex)}
              >
                <MinusCircleIcon />
              </Button>
            </Td>
          </Tr>
        ))}
        <Tr>
          <Td>
            <Button
              aria-label={t("realm-settings:addAnnotationText")}
              id="plus-icon"
              variant="link"
              className="kc-annotations__plus-icon"
              onClick={() => {
                append({ key: "", value: "" });
                if (isKeySelectable) {
                  setIsKeyOpenArray([...isKeyOpenArray, false]);
                }
              }}
              icon={<PlusCircleIcon />}
              isDisabled={isKeySelectable ? !watchLastValue : !watchLastKey}
              data-testid="annotation-add-row"
            >
              {t("realm-settings:addAnnotationText")}
            </Button>
          </Td>
        </Tr>
      </Tbody>
    </TableComposable>
  );
};
