import React, { useState } from "react";
import { ActionGroup, Button, Form, TextInput } from "@patternfly/react-core";
import { SubmitHandler, useFieldArray, UseFormMethods } from "react-hook-form";
import "./RealmRolesSection.css";
import RoleRepresentation from "keycloak-admin/lib/defs/roleRepresentation";

import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { MinusCircleIcon, PlusCircleIcon } from "@patternfly/react-icons";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

export type KeyValueType = { key: string; value: string };

type RoleAttributesProps = {
  form: UseFormMethods;
  save: SubmitHandler<RoleRepresentation>;
};

export const RoleAttributes = ({ form, save }: RoleAttributesProps) => {
  const { t } = useTranslation("roles");
  const history = useHistory();
  const [isKeyInputValid, setKeyInputValid] = useState(form.formState.isValid);
  const [isValueInputValid, setValueInputValid] = useState(
    form.formState.isValid
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  const columns = ["Key", "Value"];

  const onAdd = () => {
    append({ key: "", value: "" });
    setKeyInputValid(false);
    setValueInputValid(false);
  };

  const onKeyInputChange = (index: number, value: string) => {
    return value ? setKeyInputValid(true) : setKeyInputValid(false);
  };

  const onValueInputChange = (index: number, value: string) => {
    return value ? setValueInputValid(true) : setValueInputValid(false);
  };

  return (
    <>
      <Form role="anyone" onSubmit={form.handleSubmit(save)}>
        <TableComposable
          className="kc-role-attributes__table"
          aria-label="Role attribute keys and values"
          variant="compact"
          borders={false}
        >
          <Thead>
            <Tr>
              <Th id="key" width={40}>
                {columns[0]}
              </Th>
              <Th id="value" width={40}>
                {columns[1]}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {fields.map((attribute, rowIndex) => (
              <Tr key={attribute.id}>
                <Td
                  key={`${attribute.id}-key`}
                  id={`text-input-${attribute}-key`}
                  dataLabel={columns[0]}
                >
                  <TextInput
                    name={`attributes[${rowIndex}].key`}
                    ref={form.register({ required: true })}
                    aria-label="key-input"
                    defaultValue={attribute.key}
                    isReadOnly={false}
                    onChange={(value) => onKeyInputChange(rowIndex, value)}
                  />
                </Td>
                <Td
                  key={`${attribute}-value`}
                  id={`text-input-${attribute.id}-value`}
                  dataLabel={columns[1]}
                >
                  <TextInput
                    name={`attributes[${rowIndex}].value`}
                    ref={form.register({
                      required: true,
                      minLength: {
                        value: 1,
                        message: t("common:minLength", { length: 1 }),
                      },
                    })}
                    aria-label="value-input"
                    defaultValue={attribute.value}
                    onChange={(value) => onValueInputChange(rowIndex, value)}
                  />
                </Td>
                {rowIndex !== fields.length - 1 && fields.length - 1 !== 0 && (
                  <Td
                    key="minus-button"
                    id="kc-minus-button"
                    dataLabel={columns[2]}
                  >
                    <Button
                      id="minus-icon"
                      variant="link"
                      className="kc-role-attributes__minus-icon"
                      onClick={() => remove(rowIndex)}
                    >
                      <MinusCircleIcon />
                    </Button>
                  </Td>
                )}
                {rowIndex === fields.length - 1 && (
                  <Td key="add-button" id="add-button" dataLabel={columns[2]}>
                    <Button
                      aria-label={t("roles:addAttributeText")}
                      id="plus-icon"
                      variant="link"
                      className="kc-role-attributes__plus-icon"
                      onClick={onAdd}
                      icon={<PlusCircleIcon />}
                      isDisabled={!isKeyInputValid || !isValueInputValid}
                    />
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
        <ActionGroup className="kc-role-attributes__action-group">
          <Button
            variant="primary"
            type="submit"
            isDisabled={!isKeyInputValid || !isValueInputValid}
          >
            {t("common:save")}
          </Button>
          <Button variant="link" onClick={() => history.push("/roles/")}>
            {t("common:reload")}
          </Button>
        </ActionGroup>
      </Form>
    </>
  );
};
