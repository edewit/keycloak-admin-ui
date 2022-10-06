import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSidebar,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";

type MenuItem = {
  id: string;
  label: string;
  path?: string;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  {
    id: "personal-info",
    label: "personalInfo",
    path: "personal-info",
  },
  {
    id: "security",
    label: "accountSecurity",
    children: [
      {
        id: "signingin",
        path: "security/signingin",
        label: "signingIn",
      },
      {
        id: "device-activity",
        path: "security/device-activity",
        label: "deviceActivity",
      },
      {
        id: "linked-accounts",
        path: "security/linked-accounts",
        label: "linkedAccounts",
      },
    ],
  },
  {
    id: "applications",
    label: "applications",
    path: "applications",
  },
  {
    id: "groups",
    label: "groups",
    path: "groups",
  },
  {
    id: "resources",
    label: "resources",
    path: "resources",
  },
];

export const PageNav = () => (
  <PageSidebar
    nav={
      <Nav>
        <NavList>
          {menuItems.map((menuItem) => (
            <NavMenuItem key={menuItem.id} menuItem={menuItem} />
          ))}
        </NavList>
      </Nav>
    }
  />
);

type NavMenuItemProps = {
  menuItem: MenuItem;
};

function NavMenuItem({ menuItem }: NavMenuItemProps) {
  const { t } = useTranslation();

  if (menuItem.children) {
    return (
      <NavExpandable title={t(menuItem.label)}>
        {menuItem.children.map((child) => (
          <NavMenuItem key={child.id} menuItem={child} />
        ))}
      </NavExpandable>
    );
  }

  return (
    <NavItem to={"#/" + menuItem.path} type="button">
      {t(menuItem.label)}
    </NavItem>
  );
}
