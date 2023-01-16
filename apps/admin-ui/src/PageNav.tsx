import { FormEvent, FunctionComponent } from "react";
import { NavLink, useMatch, useNavigate } from "react-router-dom-v5-compat";
import { useTranslation } from "react-i18next";
import {
  Nav,
  NavItem,
  NavGroup,
  NavList,
  PageSidebar,
  Divider,
} from "@patternfly/react-core";

import { RealmSelector } from "./components/realm-selector/RealmSelector";
import { useRealm } from "./context/realm-context/RealmContext";
import { useAccess } from "./context/access/Access";
import { routes } from "./route-config";
import { AddRealmRoute } from "./realm/routes/AddRealm";

import "./page-nav.css";

export const PageNav: FunctionComponent = () => {
  const { t } = useTranslation("common");
  const { hasAccess, hasSomeAccess } = useAccess();
  const { realm } = useRealm();
  const navigate = useNavigate();

  type SelectedItem = {
    groupId: number | string;
    itemId: number | string;
    to: string;
    event: FormEvent<HTMLInputElement>;
  };

  const onSelect = (item: SelectedItem) => {
    navigate(item.to);
    item.event.preventDefault();
  };

  type LeftNavProps = { title: string; path: string };
  const LeftNav = ({ title, path }: LeftNavProps) => {
    const route = routes.find(
      (route) => route.path.replace(/\/:.+?(\?|(?:(?!\/).)*|$)/g, "") === path
    );

    const accessAllowed =
      route &&
      (route.access instanceof Array
        ? hasAccess(...route.access)
        : hasAccess(route.access));

    if (!accessAllowed) {
      return null;
    }

    return (
      <li>
        <NavLink
          id={"nav-item" + path.replace("/", "-")}
          to={`/${realm}${path}`}
          className={({ isActive }) =>
            `pf-c-nav__link${isActive ? " pf-m-current" : ""}`
          }
        >
          {t(title)}
        </NavLink>
      </li>
    );
  };

  const showManage = hasSomeAccess(
    "view-realm",
    "query-groups",
    "query-users",
    "query-clients",
    "view-events"
  );

  const showConfigure = hasSomeAccess(
    "view-realm",
    "query-clients",
    "view-identity-providers"
  );

  const isOnAddRealm = !!useMatch(AddRealmRoute.path);

  return (
    <PageSidebar
      className="keycloak__page_nav__nav"
      nav={
        <Nav onSelect={onSelect}>
          <NavList>
            <NavItem className="keycloak__page_nav__nav_item__realm-selector">
              <RealmSelector />
            </NavItem>
          </NavList>
          <Divider />
          {showManage && !isOnAddRealm && (
            <NavGroup aria-label={t("manage")} title={t("manage")}>
              <LeftNav title="clients" path="/clients" />
              <LeftNav title="clientScopes" path="/client-scopes" />
              <LeftNav title="realmRoles" path="/roles" />
              <LeftNav title="users" path="/users" />
              <LeftNav title="groups" path="/groups" />
              <LeftNav title="sessions" path="/sessions" />
              <LeftNav title="events" path="/events" />
            </NavGroup>
          )}

          {showConfigure && !isOnAddRealm && (
            <NavGroup aria-label={t("configure")} title={t("configure")}>
              <LeftNav title="realmSettings" path="/realm-settings" />
              <LeftNav title="authentication" path="/authentication" />
              <LeftNav title="identityProviders" path="/identity-providers" />
              <LeftNav title="userFederation" path="/user-federation" />
            </NavGroup>
          )}
        </Nav>
      }
    />
  );
};
