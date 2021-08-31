import {
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  Popover,
} from "@patternfly/react-core";
import { QuestionCircleIcon } from "@patternfly/react-icons";
import { cellWidth } from "@patternfly/react-table";
import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAlerts } from "../components/alert/Alerts";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { GroupPath } from "../components/group/GroupPath";
import { GroupPickerDialog } from "../components/group/GroupPickerDialog";
import { useHelp } from "../components/help-enabler/HelpHeader";
import { ListEmptyState } from "../components/list-empty-state/ListEmptyState";
import { KeycloakDataTable } from "../components/table-toolbar/KeycloakDataTable";
import { useAdminClient } from "../context/auth/AdminClient";
import { emptyFormatter } from "../util";

type UserGroupsProps = {
  user: UserRepresentation;
};

export const UserGroups = ({ user }: UserGroupsProps) => {
  const { t } = useTranslation("users");
  const { addAlert, addError } = useAlerts();
  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  const [selectedGroup, setSelectedGroup] = useState<GroupRepresentation>();
  const [search, setSearch] = useState("");

  const [isDirectMembership, setDirectMembership] = useState(true);
  const [directMembershipList, setDirectMembershipList] = useState<
    GroupRepresentation[]
  >([]);
  const [open, setOpen] = useState(false);

  const { enabled } = useHelp();

  const adminClient = useAdminClient();
  const alphabetize = (groupsList: GroupRepresentation[]) => {
    return _.sortBy(groupsList, (group) => group.path?.toUpperCase());
  };

  const loader = async (first?: number, max?: number, search?: string) => {
    const params: { [name: string]: string | number } = {
      first: first!,
      max: max!,
    };

    const searchParam = search || "";
    if (searchParam) {
      params.search = searchParam;
      setSearch(searchParam);
    }

    const joinedUserGroups = await adminClient.users.listGroups({
      ...params,
      id: user.id!,
    });

    const allCreatedGroups = await adminClient.groups.find();

    const getAllPaths = joinedUserGroups.reduce(
      (acc: string[], cur) => (cur.path && acc.push(cur.path), acc),
      []
    );
    const parentGroupNames: string[] = [];
    const allGroupMembership: string[] = [];
    const slicedGroups: string[] = [];
    const rootLevelGroups: GroupRepresentation[] = [...allCreatedGroups];
    let allPaths: GroupRepresentation[] = [];

    const getAllSubgroupPaths = (
      o: any,
      f: any,
      context: GroupRepresentation[]
    ): GroupRepresentation[] => {
      f(o, context);
      if (typeof o !== "object") return context;
      if (Array.isArray(o))
        return o.forEach((e) => getAllSubgroupPaths(e, f, context)), context;
      for (const prop in o) getAllSubgroupPaths(o[prop], f, context);
      return context;
    };

    const arr = getAllSubgroupPaths(
      rootLevelGroups,
      (
        x: GroupRepresentation | undefined,
        context: GroupRepresentation[][]
      ) => {
        if (x?.subGroups) context.push(x.subGroups);
      },
      []
    );

    const allSubgroups: GroupRepresentation[] = [].concat(...(arr as any));

    allPaths = [...rootLevelGroups, ...allSubgroups];

    getAllPaths.forEach((item) => {
      const paths = item.split("/");
      const groups: string[] = [];

      paths.reduce((acc, value) => {
        const path = acc + "/" + value;
        groups.push(path);
        return path;
      }, "");

      for (let i = 1; i < groups.length; i++) {
        slicedGroups.push(groups[i].substring(1));
      }
    });

    allGroupMembership.push(...slicedGroups);

    allPaths.forEach((item) => {
      if (item.subGroups!.length !== 0) {
        allPaths.push(...item!.subGroups!);
      }
    });

    allPaths = allPaths.filter((group) =>
      allGroupMembership.includes(group.path as any)
    );

    const topLevelGroups = allCreatedGroups.filter((value) =>
      parentGroupNames.includes(value.name!)
    );

    const subgroupArray: any[] = [];

    topLevelGroups.forEach((group) => subgroupArray.push(group.subGroups));

    const directMembership = joinedUserGroups!.filter(
      (value) => !topLevelGroups.includes(value)
    );

    setDirectMembershipList(directMembership);

    const filterDupesfromGroups = allPaths.filter(
      (thing, index, self) =>
        index === self.findIndex((t) => t.name === thing.name)
    );

    if (!isDirectMembership) {
      return alphabetize(filterDupesfromGroups);
    }

    return alphabetize(directMembership);
  };

  useEffect(() => {
    refresh();
  }, [isDirectMembership]);

  const AliasRenderer = (group: GroupRepresentation) => group.name;

  const toggleModal = () => {
    setOpen(!open);
  };

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("leaveGroup", {
      name: selectedGroup?.name,
    }),
    messageKey: t("leaveGroupConfirmDialog", {
      groupname: selectedGroup?.name,
      username: user.username,
    }),
    continueButtonLabel: "leave",
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        await adminClient.users.delFromGroup({
          id: user.id!,
          groupId: selectedGroup!.id!,
        });
        refresh();
        addAlert(t("removedGroupMembership"), AlertVariant.success);
      } catch (error) {
        addError("users:removedGroupMembershipError", error);
      }
    },
  });

  const leave = (group: GroupRepresentation) => {
    setSelectedGroup(group);
    toggleDeleteDialog();
  };

  const LeaveButtonRenderer = (group: GroupRepresentation) => {
    const canLeaveGroup =
      directMembershipList.some((item) => item.id === group.id) ||
      directMembershipList.length === 0 ||
      isDirectMembership;
    return (
      canLeaveGroup && (
        <Button
          data-testid={`leave-${group.name}`}
          onClick={() => leave(group)}
          variant="link"
        >
          {t("leave")}
        </Button>
      )
    );
  };

  const addGroups = async (groups: GroupRepresentation[]): Promise<void> => {
    const newGroups = groups;

    newGroups.forEach(async (group) => {
      try {
        await adminClient.users.addToGroup({
          id: user.id!,
          groupId: group.id!,
        });
        refresh();
        addAlert(t("addedGroupMembership"), AlertVariant.success);
      } catch (error) {
        addError("users:addedGroupMembershipError", error);
      }
    });
  };

  const Path = (group: GroupRepresentation) => <GroupPath group={group} />;

  return (
    <>
      <DeleteConfirm />
      {open && (
        <GroupPickerDialog
          id={user.id}
          type="selectMany"
          text={{
            title: t("joinGroupsFor", { username: user.username }),
            ok: "users:join",
          }}
          onClose={() => setOpen(false)}
          onConfirm={(groups) => {
            addGroups(groups);
            setOpen(false);
          }}
        />
      )}
      <KeycloakDataTable
        key={key}
        loader={loader}
        className="keycloak_user-section_groups-table"
        isPaginated
        ariaLabelKey="roles:roleList"
        searchPlaceholderKey="groups:searchGroup"
        canSelectAll
        toolbarItem={
          <>
            <Button
              className="kc-join-group-button"
              key="join-group-button"
              onClick={toggleModal}
              data-testid="add-group-button"
            >
              {t("joinGroup")}
            </Button>
            <Checkbox
              label={t("directMembership")}
              key="direct-membership-check"
              id="kc-direct-membership-checkbox"
              onChange={() => setDirectMembership(!isDirectMembership)}
              isChecked={isDirectMembership}
              className="direct-membership-check"
            />
            {enabled && (
              <Popover
                aria-label="Basic popover"
                position="bottom"
                bodyContent={<div>{t("whoWillAppearPopoverText")}</div>}
              >
                <Button
                  variant="link"
                  className="kc-who-will-appear-button"
                  key="who-will-appear-button"
                  icon={<QuestionCircleIcon />}
                >
                  {t("whoWillAppearLinkText")}
                </Button>
              </Popover>
            )}
          </>
        }
        columns={[
          {
            name: "groupMembership",
            displayKey: "users:groupMembership",
            cellRenderer: AliasRenderer,
            cellFormatters: [emptyFormatter()],
            transforms: [cellWidth(40)],
          },
          {
            name: "path",
            displayKey: "users:path",
            cellRenderer: Path,
            transforms: [cellWidth(45)],
          },

          {
            name: "",
            cellRenderer: LeaveButtonRenderer,
            cellFormatters: [emptyFormatter()],
            transforms: [cellWidth(20)],
          },
        ]}
        emptyState={
          !search ? (
            <ListEmptyState
              hasIcon={true}
              message={t("noGroups")}
              instructions={t("noGroupsText")}
              primaryActionText={t("joinGroup")}
              onPrimaryAction={toggleModal}
            />
          ) : (
            ""
          )
        }
      />
    </>
  );
};
