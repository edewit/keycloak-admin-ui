import React from "react";
import { TFunction } from "i18next";
import { DropdownItem, SelectOption } from "@patternfly/react-core";

const clientScopeTypes = ["default", "optional"];

export const clientScopeTypesSelectOptions = (t: TFunction) =>
  clientScopeTypes.map((type) => (
    <SelectOption key={type} value={type}>
      {t(`clientScope.${type}`)}
    </SelectOption>
  ));

export const clientScopeTypesDropdown = (t: TFunction) =>
  clientScopeTypes.map((type) => (
    <DropdownItem key={type}>{t(`clientScope.${type}`)}</DropdownItem>
  ));
