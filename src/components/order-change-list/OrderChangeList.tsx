import { DragDrop, Droppable } from "@patternfly/react-core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type OrderChangeListProps = {
  order: string[];
  onDrop: (newOrder: string[]) => void;
  children: React.ReactNode;
};

// Copied from patternfly this seems not exported
interface DraggableItemPosition {
  /** Parent droppableId */
  droppableId: string;
  /** Index of item in parent Droppable */
  index: number;
}

export const OrderChangeList = ({
  order,
  onDrop,
  children,
}: OrderChangeListProps) => {
  const { t } = useTranslation("common");
  const [liveText, setLiveText] = useState("");

  const onDrag = (source: DraggableItemPosition) => {
    setLiveText(t("common:onDragStart", { item: order[source.index] }));
    // Return true to allow drag
    return true;
  };

  const onDragMove = (
    source: DraggableItemPosition,
    dest?: DraggableItemPosition
  ) => {
    const newText = dest
      ? t("common:onDragMove", { item: order[source.index] })
      : t("common:onDragInvalid");
    if (newText !== liveText) {
      setLiveText(newText);
    }
  };

  const onInnerDrop = (
    source: DraggableItemPosition,
    dest?: DraggableItemPosition
  ): boolean => {
    if (dest) {
      const result = [...order];
      const [removed] = result.splice(source.index, 1);
      result.splice(dest.index, 0, removed);
      onDrop(result);

      setLiveText(t("common:onDragFinish", { list: order }));
      return true; // Signal that this is a valid drop and not to animate the item returning home.
    } else {
      setLiveText(t("common:onDragInvalid"));
    }
    return false;
  };

  return (
    <DragDrop onDrag={onDrag} onDragMove={onDragMove} onDrop={onInnerDrop}>
      <Droppable hasNoWrapper>{children}</Droppable>
      <div className="pf-screen-reader" aria-live="assertive">
        {liveText}
      </div>
    </DragDrop>
  );
};
