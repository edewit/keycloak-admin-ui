import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { sortBy } from "lodash-es";
import {
  AlertVariant,
  Button,
  ButtonVariant,
  DataList,
  DataListCell,
  DataListControl,
  DataListDragButton,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Modal,
  ModalVariant,
  TextContent,
  Text,
  Draggable,
} from "@patternfly/react-core";
import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useAdminClient } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";
import { OrderChangeList } from "../components/order-change-list/OrderChangeList";

type ManagePriorityDialogProps = {
  components: ComponentRepresentation[];
  onClose: () => void;
};

export const ManagePriorityDialog = ({
  components,
  onClose,
}: ManagePriorityDialogProps) => {
  const { t } = useTranslation("user-federation");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const [order, setOrder] = useState(
    sortBy(components, "config.priority", "name").map(
      (component) => component.name!
    )
  );

  return (
    <Modal
      variant={ModalVariant.small}
      title={t("managePriorityOrder")}
      isOpen={true}
      onClose={onClose}
      actions={[
        <Button
          id="modal-confirm"
          key="confirm"
          onClick={() => {
            order.map(async (name, index) => {
              const component = components!.find((c) => c.name === name)!;
              component.config!.priority = [index.toString()];
              try {
                await adminClient.components.update(
                  { id: component.id! },
                  component
                );
                addAlert(t("orderChangeSuccess"), AlertVariant.success);
              } catch (error) {
                addError("orderChangeError", error);
              }
            });

            onClose();
          }}
        >
          {t("common:save")}
        </Button>,
        <Button
          id="modal-cancel"
          key="cancel"
          variant={ButtonVariant.link}
          onClick={onClose}
        >
          {t("common:cancel")}
        </Button>,
      ]}
    >
      <TextContent className="pf-u-pb-lg">
        <Text>{t("managePriorityInfo")}</Text>
      </TextContent>

      <OrderChangeList order={order} onDrop={setOrder}>
        <DataList
          aria-label={t("manageOrderTableAria")}
          data-testid="manageOrderDataList"
          isCompact
        >
          {order.map((name) => (
            <Draggable key={name} hasNoWrapper>
              <DataListItem aria-labelledby={name} id={`${name}-item`}>
                <DataListItemRow>
                  <DataListControl>
                    <DataListDragButton
                      aria-label="Reorder"
                      aria-labelledby={name}
                      aria-describedby={t("manageOrderItemAria")}
                      aria-pressed="false"
                    />
                  </DataListControl>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key={`${name}-cell`} data-testid={name}>
                        <span id={name}>{name}</span>
                      </DataListCell>,
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </Draggable>
          ))}
        </DataList>
      </OrderChangeList>
    </Modal>
  );
};
