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
  DragDrop,
  Droppable,
  Draggable,
} from "@patternfly/react-core";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useAdminClient } from "../context/auth/AdminClient";
import { useAlerts } from "../components/alert/Alerts";

type ManageOrderDialogProps = {
  providers: IdentityProviderRepresentation[];
  onClose: () => void;
};

// Copied from patternfly this seems not exported
interface DraggableItemPosition {
  /** Parent droppableId */
  droppableId: string;
  /** Index of item in parent Droppable */
  index: number;
}

export const ManageOrderDialog = ({
  providers,
  onClose,
}: ManageOrderDialogProps) => {
  const { t } = useTranslation("identity-providers");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const [liveText, setLiveText] = useState("");
  const [order, setOrder] = useState(
    sortBy(providers, ["config.guiOrder", "alias"]).map(
      (provider) => provider.alias!
    )
  );

  const onDrag = (source: DraggableItemPosition) => {
    setLiveText(
      t("common:onDragStart", { item: providers[source.index].alias })
    );
    // Return true to allow drag
    return true;
  };

  const onDragMove = (
    source: DraggableItemPosition,
    dest?: DraggableItemPosition
  ) => {
    const newText = dest
      ? t("common:onDragMove", { item: providers[source.index].alias })
      : t("common:onDragInvalid");
    if (newText !== liveText) {
      setLiveText(newText);
    }
  };

  const onDrop = (
    source: DraggableItemPosition,
    dest?: DraggableItemPosition
  ): boolean => {
    if (dest) {
      const result = [...order];
      const [removed] = result.splice(source.index, 1);
      result.splice(dest.index, 0, removed);
      setOrder(result);

      setLiveText(
        t("common:onDragFinish", { list: providers.map((p) => p.alias) })
      );
      return true; // Signal that this is a valid drop and not to animate the item returning home.
    } else {
      setLiveText(t("common:onDragInvalid"));
    }
    return false;
  };

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

      <DragDrop onDrag={onDrag} onDragMove={onDragMove} onDrop={onDrop}>
        <Droppable hasNoWrapper>
          <DataList
            aria-label={t("manageOrderTableAria")}
            data-testid="manageOrderDataList"
            isCompact
          >
            {order.map((alias) => (
              <Draggable key={alias} hasNoWrapper>
                <DataListItem
                  aria-labelledby={alias}
                  id={`${alias}-item`}
                  ref={React.createRef()}
                >
                  <DataListItemRow>
                    <DataListControl>
                      <DataListDragButton
                        aria-label="Reorder"
                        aria-labelledby={alias}
                        aria-describedby={t("manageOrderItemAria")}
                        aria-pressed="false"
                      />
                    </DataListControl>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={`${alias}-cell`} data-testid={alias}>
                          <span id={alias}>{alias}</span>
                        </DataListCell>,
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
              </Draggable>
            ))}
          </DataList>
        </Droppable>
        <div className="pf-screen-reader" aria-live="assertive">
          {liveText}
        </div>
      </DragDrop>
    </Modal>
  );
};
