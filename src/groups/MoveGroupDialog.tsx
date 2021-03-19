import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useErrorHandler } from "react-error-boundary";
import {
  Button,
  ButtonVariant,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  InputGroup,
  Modal,
  ModalVariant,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { AngleRightIcon, SearchIcon } from "@patternfly/react-icons";

import GroupRepresentation from "keycloak-admin/lib/defs/groupRepresentation";
import { asyncStateFetch, useAdminClient } from "../context/auth/AdminClient";

type MoveGroupDialogProps = {
  group: GroupRepresentation;
  onClose: () => void;
  onMove: (groupId: string) => void;
};

export const MoveGroupDialog = ({
  group,
  onClose,
  onMove,
}: MoveGroupDialogProps) => {
  const { t } = useTranslation("groups");

  const adminClient = useAdminClient();
  const errorHandler = useErrorHandler();

  const [navigation, setNavigation] = useState<GroupRepresentation[]>([]);
  const [groups, setGroups] = useState<GroupRepresentation[]>([]);
  const [filtered, setFiltered] = useState<GroupRepresentation[]>();
  const [filter, setFilter] = useState("");

  const [id, setId] = useState<string>();
  const currentGroup = () => navigation[navigation.length - 1];

  useEffect(
    () =>
      asyncStateFetch(
        async () => {
          if (id) {
            const group = await adminClient.groups.findOne({ id });
            return { group, groups: group.subGroups! };
          } else {
            return { groups: await adminClient.groups.find() };
          }
        },
        ({ group, groups }) => {
          if (group) setNavigation([...navigation, group]);
          setGroups(groups);
        },
        errorHandler
      ),
    [id]
  );

  return (
    <Modal
      variant={ModalVariant.large}
      title={t("moveToGroup", {
        group1: group.name,
        group2: currentGroup()?.name,
      })}
      isOpen={true}
      onClose={onClose}
      actions={[
        <Button
          data-testid="moveGroup"
          key="confirm"
          variant="primary"
          form="group-form"
          onClick={() => onMove(currentGroup().id!)}
        >
          {t("moveHere")}
        </Button>,
      ]}
    >
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <InputGroup>
              <TextInput
                type="search"
                aria-label={t("common:search")}
                placeholder={t("searchForGroups")}
                onChange={(value) => {
                  if (value === "") {
                    setFiltered(undefined);
                  }
                  setFilter(value);
                }}
              />
              <Button
                variant={ButtonVariant.control}
                aria-label={t("common:search")}
                onClick={() =>
                  setFiltered(
                    currentGroup().subGroups!.filter((group) =>
                      group.name?.toLowerCase().includes(filter.toLowerCase())
                    )
                  )
                }
              >
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <DataList
        onSelectDataListItem={(value) => setId(value)}
        aria-label={t("groups")}
        isCompact
      >
        {(filtered || groups).map((group) => (
          <DataListItem
            aria-labelledby={group.name}
            key={group.id}
            id={group.id}
          >
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key={`name-${group.id}`}>
                    <>{group.name}</>
                  </DataListCell>,
                ]}
              />
              <DataListAction
                aria-labelledby={`select-${group.name}`}
                id={`select-${group.name}`}
                aria-label={t("groupName")}
                isPlainButtonAction
              >
                <Button isDisabled variant="link">
                  <AngleRightIcon />
                </Button>
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
        ))}
      </DataList>
    </Modal>
  );
};
