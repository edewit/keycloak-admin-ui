import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem, DropdownToggle } from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";

import { AddStepModal } from "./modals/AddStepModal";

type AddedType = "step" | "condition" | "subFlow";

export const EditFlowDropdown = () => {
  const { t } = useTranslation("authentication");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AddedType>();

  return (
    <>
      <Dropdown
        isPlain
        position="right"
        id="user-dropdown"
        isOpen={open}
        toggle={
          <DropdownToggle onToggle={(open) => setOpen(open)}>
            <PlusIcon />
          </DropdownToggle>
        }
        dropdownItems={[
          <DropdownItem key="addStep" onClick={() => setType("step")}>
            {t("addStep")}
          </DropdownItem>,
          <DropdownItem key="addCondition" onClick={() => setType("condition")}>
            {t("addCondition")}
          </DropdownItem>,
          <DropdownItem key="addSubFlow" onClick={() => setType("subFlow")}>
            {t("addSubFlow")}
          </DropdownItem>,
        ]}
        onSelect={() => setOpen(false)}
      />
      {type === "step" && (
        <AddStepModal name="" onSelect={() => setType(undefined)} />
      )}
    </>
  );
};
