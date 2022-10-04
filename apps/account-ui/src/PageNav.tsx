import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSidebar,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";

type PageNavProps = {
  content: ContentItem[];
};

function isChildOf(parent: ContentItem, child: ContentItem): boolean {
  for (const item of parent.content!) {
    if (item.content && isChildOf(item, child)) return true;
  }

  return false;
}

export const PageNav = ({ content }: PageNavProps) => {
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
