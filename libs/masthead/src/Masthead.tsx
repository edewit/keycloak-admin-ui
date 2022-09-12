import { ReactNode } from "react";
import {
  Avatar,
  AvatarProps,
  Brand,
  BrandProps,
  PageHeader,
  PageHeaderProps,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from "@patternfly/react-core";

import { KeycloakDropdown } from "./KeycloakDropdown";

type BrandLogo = BrandProps & {
  onClick?: () => void;
};

type KeycloakMastheadProps = PageHeaderProps & {
  brand: BrandLogo;
  avatar?: AvatarProps;
  kebabDropdownItems?: ReactNode[];
  dropdownItems: ReactNode[];
};

const KeycloakMasthead = ({
  brand: { onClick: onBrandLogoClick, ...brandProps },
  avatar,
  kebabDropdownItems,
  dropdownItems,
  ...rest
}: KeycloakMastheadProps) => {
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
              }} /** this kebab dropdown replaces the icon buttons and is hidden for desktop sizes */
            >
              <KeycloakDropdown
                isKebab
                dropDownItems={kebabDropdownItems || dropdownItems}
              />
            </PageHeaderToolsItem>
            <PageHeaderToolsItem
              visibility={{
                default: "hidden",
                md: "visible",
              }} /** this user dropdown is hidden on mobile sizes */
            >
              <KeycloakDropdown dropDownItems={dropdownItems} />
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
          <Avatar {...{ src: "/avatar.svg", alt: "avatar", ...avatar }} />
        </PageHeaderTools>
      }
    />
  );
};

export default KeycloakMasthead;
