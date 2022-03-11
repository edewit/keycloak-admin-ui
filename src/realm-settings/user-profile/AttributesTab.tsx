import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ButtonVariant,
  Divider,
  Select,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";

import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileConfig";
import { KeycloakSpinner } from "../../components/keycloak-spinner/KeycloakSpinner";
import { DraggableTable } from "../../authentication/components/DraggableTable";
import { Link, useHistory } from "react-router-dom";
import { toAddAttribute } from "../routes/AddAttribute";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useUserProfile } from "./UserProfileContext";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import useToggle from "../../utils/useToggle";

type movedAttributeType = UserProfileAttribute;

export const AttributesTab = () => {
  const { config, save } = useUserProfile();
  const { realm: realmName } = useRealm();
  const { t } = useTranslation("realm-settings");
  const history = useHistory();
  const [filter, setFilter] = useState("allGroups");
  const [isFilterTypeDropdownOpen, toggleIsFilterTypeDropdownOpen] =
    useToggle();
  const [data, setData] = useState(config?.attributes);
  const [attributeToDelete, setAttributeToDelete] =
    useState<{ name: string }>();

  const executeMove = async (
    attribute: UserProfileAttribute,
    newIndex: number
  ) => {
    const fromIndex = config?.attributes!.findIndex((attr) => {
      return attr.name === attribute.name;
    });

    let movedAttribute: movedAttributeType = {};
    movedAttribute = config?.attributes![fromIndex!]!;
    config?.attributes!.splice(fromIndex!, 1);
    config?.attributes!.splice(newIndex, 0, movedAttribute);

    save(
      { attributes: config?.attributes! },
      {
        successMessageKey: "realm-settings:updatedUserProfileSuccess",
        errorMessageKey: "realm-settings:updatedUserProfileError",
      }
    );
  };

  const goToCreate = () => history.push(toAddAttribute({ realm: realmName }));

  const updatedAttributes = config?.attributes!.filter(
    (attribute) => attribute.name !== attributeToDelete?.name
  );

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("deleteAttributeConfirmTitle"),
    messageKey: t("deleteAttributeConfirm", {
      attributeName: attributeToDelete?.name!,
    }),
    continueButtonLabel: t("common:delete"),
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      save(
        { attributes: updatedAttributes! },
        {
          successMessageKey: "realm-settings:deleteAttributeSuccess",
          errorMessageKey: "realm-settings:deleteAttributeError",
        }
      );
      setAttributeToDelete({
        name: "",
      });
    },
  });

  if (!config?.attributes) {
    return <KeycloakSpinner />;
  }

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Select
              width={200}
              data-testid="filter-select"
              isOpen={isFilterTypeDropdownOpen}
              variant={SelectVariant.single}
              onToggle={toggleIsFilterTypeDropdownOpen}
              toggleIcon={<FilterIcon />}
              onSelect={(_, value) => {
                const filter = value.toString();
                setFilter(filter);
                setData(
                  filter === "allGroups"
                    ? config.attributes
                    : config.attributes?.filter((attr) => attr.group === filter)
                );
                toggleIsFilterTypeDropdownOpen();
              }}
              selections={filter === "allGroups" ? t(filter) : filter}
            >
              {[
                <SelectOption
                  key="allGroups"
                  data-testid="all-groups"
                  value="allGroups"
                >
                  {t("allGroups")}
                </SelectOption>,
                ...config
                  .attributes!.filter((attr) => !!attr.group)
                  .map((attr) => (
                    <SelectOption
                      key={attr.group}
                      data-testid={`${attr.group}-option`}
                      value={attr.group}
                    />
                  )),
              ]}
            </Select>
          </ToolbarItem>
          <ToolbarItem className="kc-toolbar-attributesTab">
            <Button
              data-testid="createAttributeBtn"
              variant="primary"
              component={(props) => (
                <Link {...props} to={toAddAttribute({ realm: realmName })} />
              )}
            >
              {t("createAttribute")}
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Divider />
      <DeleteConfirm />
      <DraggableTable
        keyField="name"
        onDragFinish={async (nameDragged, items) => {
          const keys = config.attributes!.map((e) => e.name);
          const newIndex = items.indexOf(nameDragged);
          const oldIndex = keys.indexOf(nameDragged);
          const dragged = config.attributes![oldIndex];
          if (!dragged.name) return;

          executeMove(dragged, newIndex);
        }}
        actions={[
          {
            title: t("common:edit"),
            onClick: goToCreate,
          },
          {
            title: t("common:delete"),
            onClick: (_key, _idx, component) => {
              setAttributeToDelete(component.name);
              toggleDeleteDialog();
            },
          },
        ]}
        columns={[
          {
            name: "name",
            displayKey: t("attributeName"),
            cellRenderer: (row) => (
              <Link to={toAddAttribute({ realm: realmName })}>{row.name}</Link>
            ),
          },
          {
            name: "displayName",
            displayKey: t("attributeDisplayName"),
          },
          {
            name: "group",
            displayKey: t("attributeGroup"),
          },
        ]}
        data={data || config.attributes}
      />
    </>
  );
};
