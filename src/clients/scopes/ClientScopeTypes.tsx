import React from "react";
import { TFunction } from "i18next";
import { DropdownItem } from "@patternfly/react-core";

export const clientScopeTypesDropdown = (t: TFunction) => [
  <DropdownItem key="always">{t("always")}</DropdownItem>,
  <DropdownItem key="default">{t("default")}</DropdownItem>,
  <DropdownItem key="optional">{t("optional")}</DropdownItem>,
  <DropdownItem key="required">{t("required")}</DropdownItem>,
];
