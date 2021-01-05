import React, { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";

import { useSubGroups } from "../../groups/GroupsSection";

export const GroupBreadCrumbs = () => {
  const { t } = useTranslation();
  const { clear, remove, subGroups } = useSubGroups();

  const history = useHistory();

  useEffect(() => {
    return history.listen(({ pathname }) => {
      if (!pathname.startsWith("/groups") || pathname === "/groups") {
        clear();
      }
    });
  }, [history]);

  return (
    <>
      {subGroups.length !== 0 && (
        <Breadcrumb>
          <BreadcrumbItem key="home">
            <Link to="/groups">{t("groups")}</Link>
          </BreadcrumbItem>
          {subGroups.map((group, i) => (
            <BreadcrumbItem key={i} isActive={subGroups.length - 1 === i}>
              {subGroups.length - 1 !== i && (
                <Link
                  to={location.pathname.substr(
                    0,
                    location.pathname.indexOf(group.id!) + group.id!.length
                  )}
                  onClick={() => remove(group)}
                >
                  {group.name}
                </Link>
              )}
              {subGroups.length - 1 === i && <>{group.name}</>}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}
    </>
  );
};
