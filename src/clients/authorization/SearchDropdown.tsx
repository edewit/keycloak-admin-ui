import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  DropdownToggle,
  Form,
  FormGroup,
  TextInput,
} from "@patternfly/react-core";

import useToggle from "../../utils/useToggle";

import "./search-dropdown.css";
import { useForm } from "react-hook-form";

export const SearchDropdown = () => {
  const { t } = useTranslation("clients");
  const { register } = useForm();

  const [open, toggle] = useToggle();
  return (
    <Dropdown
      data-testid="searchdropdown_dorpdown"
      className="pf-u-ml-md"
      toggle={
        <DropdownToggle
          onToggle={toggle}
          className="keycloak__client_authentication__searchdropdown"
        >
          {t("searchForPermission")}
        </DropdownToggle>
      }
      isOpen={open}
    >
      <Form
        isHorizontal
        className="keycloak__client_authentication__searchdropdown_form"
      >
        <FormGroup label={t("common:name")} fieldId="name">
          <TextInput
            ref={register}
            type="text"
            id="name"
            name="name"
            data-testid="searchdropdown_name"
          />
        </FormGroup>
        <FormGroup label={t("common:type")} fieldId="type">
          {/* <Controller
            name="otpPolicyAlgorithm"
            defaultValue={`Hmac${OTP_HASH_ALGORITHMS[0]}`}
            control={control}
            render={({ onChange, value }) => (
              <Select
                toggleId="otpHashAlgorithm"
                onToggle={toggle}
                onSelect={(_, value) => {
                  onChange(value.toString());
                  toggle();
                }}
                selections={value}
                variant={SelectVariant.single}
                aria-label={t("otpHashAlgorithm")}
                isOpen={open}
              >
                {OTP_HASH_ALGORITHMS.map((type) => (
                  <SelectOption
                    selected={`Hmac${type}` === value}
                    key={type}
                    value={`Hmac${type}`}
                  >
                    {type}
                  </SelectOption>
                ))}
              </Select>
            )}
          /> */}
        </FormGroup>
      </Form>
    </Dropdown>
  );
};
