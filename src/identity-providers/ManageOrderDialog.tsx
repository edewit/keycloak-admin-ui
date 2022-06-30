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

import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useAdminClient } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";
import { OrderChangeList } from "../components/order-change-list/OrderChangeList";

type ManageOrderDialogProps = {
  providers: IdentityProviderRepresentation[];
  onClose: () => void;
};

export const ManageOrderDialog = ({
  providers,
  onClose,
}: ManageOrderDialogProps) => {
  const { t } = useTranslation("identity-providers");

  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const [order, setOrder] = useState(
    sortBy(providers, ["config.guiOrder", "alias"]).map(
      (provider) => provider.alias!
    )
  );

  return (
    <Modal
      variant={ModalVariant.small}
      title={t("manageDisplayOrder")}
      isOpen={true}
      onClose={onClose}
      actions={[
        <Button
          id="modal-confirm"
          data-testid="confirm"
          key="confirm"
          onClick={async () => {
            const updates = order.map((alias, index) => {
              const provider = providers.find((p) => p.alias === alias)!;
              provider.config!.guiOrder = index;
              return adminClient.identityProviders.update({ alias }, provider);
            });

            try {
              await Promise.all(updates);
              addAlert(t("orderChangeSuccess"), AlertVariant.success);
            } catch (error) {
              addError("identity-providers:orderChangeError", error);
            }

            onClose();
          }}
        >
          {t("common:save")}
        </Button>,
        <Button
          id="modal-cancel"
          data-testid="cancel"
          key="cancel"
          variant={ButtonVariant.link}
          onClick={onClose}
        >
          {t("common:cancel")}
        </Button>,
      ]}
    >
      <TextContent className="pf-u-pb-lg">
        <Text>{t("orderDialogIntro")}</Text>
      </TextContent>

      <OrderChangeList order={order} onDrop={setOrder}>
        <DataList
          aria-label={t("manageOrderTableAria")}
          data-testid="manageOrderDataList"
          isCompact
        >
          {order.map((alias) => (
            <Draggable key={alias} hasNoWrapper>
              <DataListItem aria-labelledby={alias}>
                <DataListItemRow>
                  <DataListControl>
                    <DataListDragButton aria-label={t("manageOrderItemAria")} />
                  </DataListControl>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key={alias} data-testid={alias}>
                        <span id={alias}>{alias}</span>
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
