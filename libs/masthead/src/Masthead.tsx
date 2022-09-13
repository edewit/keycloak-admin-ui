import { ReactNode } from "react";
import {
  Avatar,
  AvatarProps,
  Brand,
  BrandProps,
  DropdownItem,
  PageHeader,
  PageHeaderProps,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from "@patternfly/react-core";
import Keycloak from "keycloak-js";

import { KeycloakDropdown } from "./KeycloakDropdown";
import { loggedInUserName } from "./util";

declare const keycloak: Keycloak | undefined;

export type TranslateFunction = (key: string, params?: string[]) => string;

type BrandLogo = BrandProps & {
  onClick?: () => void;
};

type KeycloakMastheadProps = PageHeaderProps & {
  brand: BrandLogo;
  avatar?: AvatarProps;
  features?: {
    hasLogout?: boolean;
    hasManageAccount?: boolean;
    hasUsername?: boolean;
  };
  keycloak?: Keycloak;
  kebabDropdownItems?: ReactNode[];
  dropdownItems: ReactNode[];
  translate?: TranslateFunction;
};

const KeycloakMasthead = ({
  brand: { onClick: onBrandLogoClick, ...brandProps },
  avatar,
  features: {
    hasLogout = true,
    hasManageAccount = true,
    hasUsername = true,
  } = {},
  keycloak: keycloakParam,
  kebabDropdownItems,
  dropdownItems,
  translate,
  ...rest
}: KeycloakMastheadProps) => {
  const keyClk = (keycloakParam || keycloak)!;
  const t =
    translate ||
    function (key) {
      return key;
    };
  const extraItems = [
    hasManageAccount && (
      <DropdownItem
        key="manageAccount"
        onClick={() => keyClk.accountManagement()}
      >
        {t("manageAccount")}
      </DropdownItem>
    ),
    hasLogout && (
      <DropdownItem key="signOut" onClick={() => keyClk.logout()}>
        {t("doSignOut")}
      </DropdownItem>
    ),
  ];

  return (
    <PageHeader
      {...rest}
      logo={
        <div onClick={onBrandLogoClick}>
          <Brand {...brandProps} />
        </div>
      }
      logoComponent="div"
      headerTools={
        <PageHeaderTools>
          <PageHeaderToolsGroup>
            <PageHeaderToolsItem
              visibility={{
                md: "hidden",
              }}
            >
              <KeycloakDropdown
                isKebab
                dropDownItems={[
                  ...(kebabDropdownItems || dropdownItems),
                  extraItems,
                ]}
              />
            </PageHeaderToolsItem>
            <PageHeaderToolsItem
              visibility={{
                default: "hidden",
                md: "visible",
              }}
            >
              <KeycloakDropdown
                dropDownItems={[...dropdownItems, extraItems]}
                title={hasUsername ? loggedInUserName(keyClk, t) : undefined}
              />
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
          <Avatar {...{ src: "/avatar.svg", alt: "avatar", ...avatar }} />
        </PageHeaderTools>
      }
    />
  );
};

export default KeycloakMasthead;
