import {
  Nav,
  NavExpandable,
  NavList,
  PageSidebar,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

type PageNavProps = {
  content: ContentItem[];
};

export function flattenContent(pageDefs: ContentItem[]) {
  const flat: ContentItem[] = [];

  for (const item of pageDefs) {
    if (item.content) {
      flat.push(...flattenContent(item.content));
    } else {
      flat.push(item);
    }
  }

  return flat;
}

export const PageNav = ({ content }: PageNavProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const createNavItems = (
    activePage: ContentItem,
    contentParam: ContentItem[]
  ) =>
    contentParam.map((item) =>
      item.content ? (
        <NavExpandable
          id={`nav-link-${item.id}`}
          key={item.id}
          title={t(item.label, item.labelParams)}
          isExpanded={activePage.path?.includes(item.id)}
        >
          {createNavItems(activePage, item.content)}
        </NavExpandable>
      ) : (
        <NavLink
          id={`nav-link-${item.id}`}
          key={item.id}
          to={"/" + item.path}
          className="pf-c-nav__link"
          activeClassName="pf-m-current"
          isActive={() => item.id === activePage.id}
          type="button"
        >
          {t(item.label, item.labelParams)}
        </NavLink>
      )
    );

  const currentContentItem = flattenContent(content).find(
    (c) => c.path === location.pathname.substring(1)
  );

  return (
    <PageSidebar
      className="keycloak__page_nav__nav"
      nav={
        <Nav>
          <NavList>
            {createNavItems(currentContentItem || content[0], content)}
          </NavList>
        </Nav>
      }
    />
  );
};
