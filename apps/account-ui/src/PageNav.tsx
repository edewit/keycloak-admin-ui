import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSidebar,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";

type ContentItem = {
  id: string;
  label: string;
  path?: string;
  content?: ContentItem[];
};

const content: ContentItem[] = [
  {
    id: "personal-info",
    label: "personalInfo",
    path: "personal-info",
  },
  {
    id: "security",
    label: "accountSecurity",
    content: [
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

function isChildOf(parent: ContentItem, child: ContentItem): boolean {
  for (const item of parent.content!) {
    if (item.content && isChildOf(item, child)) return true;
  }

  return false;
}

export const PageNav = () => {
  const { t } = useTranslation();

  const createNavItems = (
    activePage: ContentItem,
    contentParam: ContentItem[]
  ) =>
    contentParam.map((item) =>
      item.content ? (
        <NavExpandable
          id={`nav-link-${item.id}`}
          key={item.id}
          title={t(item.label)}
          isExpanded={isChildOf(item, activePage)}
        >
          {createNavItems(activePage, item.content)}
        </NavExpandable>
      ) : (
        <NavItem
          id={`nav-link-${item.id}`}
          key={item.id}
          to={"#/" + item.path}
          isActive={activePage.id === item.id}
          type="button"
        >
          {t(item.label)}
        </NavItem>
      )
    );

  return (
    <PageSidebar
      className="keycloak__page_nav__nav"
      nav={
        <Nav>
          <NavList>{createNavItems(content[0], content)}</NavList>
        </Nav>
      }
    />
  );
};
