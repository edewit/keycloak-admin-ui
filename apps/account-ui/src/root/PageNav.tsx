import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSidebar,
} from "@patternfly/react-core";
import { FunctionComponent, MouseEvent as ReactMouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { To, useHref, useLinkClickHandler } from "react-router-dom";

type RootMenuItem = {
  label: string;
  path: string;
};

type MenuItemWithChildren = {
  label: string;
  children: MenuItem[];
};

type MenuItem = RootMenuItem | MenuItemWithChildren;

const menuItems: MenuItem[] = [
  {
    label: "personalInfo",
    path: "personal-info",
  },
  {
    label: "accountSecurity",
    children: [
      {
        label: "signingIn",
        path: "account-security/signing-in",
      },
      {
        label: "deviceActivity",
        path: "account-security/device-activity",
      },
      {
        label: "linkedAccounts",
        path: "account-security/linked-accounts",
      },
    ],
  },
  {
    label: "applications",
    path: "applications",
  },
  {
    label: "groups",
    path: "groups",
  },
  {
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
            <NavMenuItem key={menuItem.label} menuItem={menuItem} />
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

  if ("path" in menuItem) {
    return <NavLink to={menuItem.path}>{t(menuItem.label)}</NavLink>;
  }

  return (
    <NavExpandable title={t(menuItem.label)}>
      {menuItem.children.map((child) => (
        <NavMenuItem key={child.label} menuItem={child} />
      ))}
    </NavExpandable>
  );
}

type NavLinkProps = {
  to: To;
};

const NavLink: FunctionComponent<NavLinkProps> = ({ to, children }) => {
  const href = useHref(to);
  const handleClick = useLinkClickHandler(to);

  return (
    <NavItem
      to={href}
      onClick={(event) =>
        // PatternFly does not have the correct type for this event, so we need to cast it.
        handleClick(event as unknown as ReactMouseEvent<HTMLAnchorElement>)
      }
    >
      {children}
    </NavItem>
  );
};
