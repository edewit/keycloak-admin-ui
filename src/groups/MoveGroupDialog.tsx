import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useErrorHandler } from "react-error-boundary";
import {
  Breadcrumb,
  BreadcrumbItem,
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
import { ListEmptyState } from "../components/list-empty-state/ListEmptyState";
import { GroupQuery } from "keycloak-admin/lib/resources/groups";

type MoveGroupDialogProps = {
  group: GroupRepresentation;
  onClose: () => void;
  onMove: (groupId: string | undefined) => void;
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
  const [searchValue, setSearchValue] = useState("");
  const [filter, setFilter] = useState("");

  const [id, setId] = useState<string>();
  const currentGroup = () => navigation[navigation.length - 1];

  const getLeafGroup = (
    groups: GroupRepresentation[]
  ): GroupRepresentation[] => {
    let result: GroupRepresentation[] = [];

    for (const group of groups) {
      if (group.subGroups?.length === 0) {
        result.push(group);
      } else {
        result = result.concat(getLeafGroup(group.subGroups!));
      }
    }

    return result;
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === "Enter") {
      setFilter(searchValue);
    }
  };

  useEffect(
    () =>
      asyncStateFetch(
        async () => {
          if (id) {
            const group = await adminClient.groups.findOne({ id });
            return { group, groups: group.subGroups! };
          } else {
            const params: GroupQuery = {};
            if (filter !== "") {
              params.search = filter;
            }
            return { groups: await adminClient.groups.find(params) };
          }
        },
        ({ group: selectedGroup, groups }) => {
          if (selectedGroup) setNavigation([...navigation, selectedGroup]);
          if (filter) {
            setFiltered(getLeafGroup(groups));
          } else {
            setGroups(groups.filter((g) => g.id !== group.id));
          }
        },
        errorHandler
      ),
    [id, filter]
  );

  return (
    <Modal
      variant={ModalVariant.large}
      title={t("moveToGroup", {
        group1: group.name,
        group2: currentGroup() ? currentGroup().name : filter ? "" : t("root"),
      })}
      isOpen={true}
      onClose={onClose}
      actions={[
        <Button
          data-testid="moveGroup"
          key="confirm"
          variant="primary"
          form="group-form"
          isDisabled={!!filter}
          onClick={() => onMove(currentGroup()?.id)}
        >
          {t("moveHere")}
        </Button>,
        <Button
          data-testid="moveCancel"
          key="cancel"
          variant="link"
          onClick={onClose}
        >
          {t("common:cancel")}
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
                onChange={(value) => setSearchValue(value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                variant={ButtonVariant.control}
                aria-label={t("common:search")}
                onClick={() => setFilter(searchValue)}
              >
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      {!filter && (
        <Breadcrumb>
          <BreadcrumbItem key="home">
            <Button
              variant="link"
              onClick={() => {
                setId(undefined);
                setNavigation([]);
              }}
            >
              {t("groups")}
            </Button>
          </BreadcrumbItem>
          {navigation.map((group, i) => (
            <BreadcrumbItem key={i}>
              {navigation.length - 1 !== i && (
                <Button
                  variant="link"
                  onClick={() => {
                    setId(group.id);
                    setNavigation([...navigation].slice(0, i));
                  }}
                >
                  {group.name}
                </Button>
              )}
              {navigation.length - 1 === i && <>{group.name}</>}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}

      <DataList
        onSelectDataListItem={(value) => {
          setFilter("");
          setFiltered(undefined);
          setId(value);
        }}
        aria-label={t("groups")}
        isCompact
      >
        {(filtered || groups).map((group) => (
          <DataListItem
            aria-labelledby={group.name}
            key={group.id}
            id={group.id}
          >
            <DataListItemRow data-testid={group.name}>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key={`name-${group.id}`}>
                    <>
                      {filtered && filtered?.length !== 0
                        ? group.path
                        : group.name}
                    </>
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
        {(filtered || groups).length === 0 && (
          <ListEmptyState
            hasIcon={false}
            message={t("moveGroupEmpty")}
            instructions={t("moveGroupEmptyInstructions")}
          />
        )}
      </DataList>
    </Modal>
  );
};
