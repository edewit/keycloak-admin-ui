import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DropdownItem,
  PageSection,
  PageSectionVariants,
  AlertVariant,
  Tab,
  TabTitleText,
  Tabs,
} from "@patternfly/react-core";
import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";

import { ViewHeader } from "../components/view-header/ViewHeader";
import { useFetch, useAdminClient } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";
import { useRealm } from "../context/realm-context/RealmContext";

import { useSubGroups } from "./SubGroupsContext";
import { GroupTable } from "./GroupTable";
import { getId, getLastId } from "./groupIdUtils";
import { Members } from "./Members";
import { GroupAttributes } from "./GroupAttributes";
import { GroupsModal } from "./GroupsModal";

import "./GroupsSection.css";

export default function GroupsSection() {
  const { t } = useTranslation("groups");
  const [activeTab, setActiveTab] = useState(0);

  const adminClient = useAdminClient();
  const { subGroups, setSubGroups, currentGroup } = useSubGroups();
  const { addAlert, addError } = useAlerts();
  const { realm } = useRealm();

  const [rename, setRename] = useState<string>();

  const history = useHistory();
  const location = useLocation();
  const id = getLastId(location.pathname);

  const deleteGroup = async (group: GroupRepresentation) => {
    try {
      await adminClient.groups.del({
        id: group.id!,
      });
      addAlert(t("groupDelete"), AlertVariant.success);
    } catch (error) {
      addError("groups:groupDeleteError", error);
    }
    return true;
  };

  useFetch(
    async () => {
      const ids = getId(location.pathname);
      const isNavigationStateInValid = ids && ids.length > subGroups.length;

      if (isNavigationStateInValid) {
        const groups: GroupRepresentation[] = [];
        for (const i of ids!) {
          const group = await adminClient.groups.findOne({ id: i });
          if (group) {
            groups.push(group);
          } else {
            throw new Error(t("common:notFound"));
          }
        }
        return groups;
      }
      return [];
    },
    (groups: GroupRepresentation[]) => {
      if (groups.length) setSubGroups(groups);
    },
    [id]
  );

  const SearchDropdown = (
    <DropdownItem
      data-testid="searchGroup"
      key="searchGroup"
      onClick={() => history.push(`/${realm}/groups/search`)}
    >
      {t("searchGroup")}
    </DropdownItem>
  );

  return (
    <>
      {rename && (
        <GroupsModal
          id={id}
          rename={rename}
          refresh={(group) =>
            setSubGroups([...subGroups.slice(0, subGroups.length - 1), group!])
          }
          handleModalToggle={() => setRename(undefined)}
        />
      )}
      <ViewHeader
        titleKey={!id ? "groups:groups" : currentGroup().name!}
        subKey={!id ? "groups:groupsDescription" : ""}
        divider={!id}
        dropdownItems={
          id
            ? [
                SearchDropdown,
                <DropdownItem
                  data-testid="renameGroupAction"
                  key="renameGroup"
                  onClick={() => setRename(currentGroup().name)}
                >
                  {t("renameGroup")}
                </DropdownItem>,
                <DropdownItem
                  data-testid="deleteGroup"
                  key="deleteGroup"
                  onClick={() => {
                    deleteGroup({ id });
                    history.push(
                      location.pathname.substr(
                        0,
                        location.pathname.lastIndexOf("/")
                      )
                    );
                  }}
                >
                  {t("deleteGroup")}
                </DropdownItem>,
              ]
            : [SearchDropdown]
        }
      />
      <PageSection variant={PageSectionVariants.light} className="pf-u-p-0">
        {subGroups.length > 0 && (
          <Tabs
            inset={{
              default: "insetNone",
              md: "insetSm",
              xl: "inset2xl",
              "2xl": "insetLg",
            }}
            activeKey={activeTab}
            onSelect={(_, key) => setActiveTab(key as number)}
            isBox
          >
            <Tab
              data-testid="groups"
              eventKey={0}
              title={<TabTitleText>{t("childGroups")}</TabTitleText>}
            >
              <GroupTable />
            </Tab>
            <Tab
              data-testid="members"
              eventKey={1}
              title={<TabTitleText>{t("members")}</TabTitleText>}
            >
              <Members />
            </Tab>
            <Tab
              data-testid="attributes"
              eventKey={2}
              title={<TabTitleText>{t("common:attributes")}</TabTitleText>}
            >
              <GroupAttributes />
            </Tab>
          </Tabs>
        )}
        {subGroups.length === 0 && <GroupTable />}
      </PageSection>
    </>
  );
}
