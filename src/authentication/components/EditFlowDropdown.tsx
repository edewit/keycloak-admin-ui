import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownToggle } from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";

export const EditFlowDropdown = () => {
  const [open, setOpen] = useState(false);
  return (
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
        <DropdownItem key="addStep">Add Step</DropdownItem>,
        <DropdownItem key="addCondition">Add Condition</DropdownItem>,
        <DropdownItem key="addSubFlow">Add Sub-flow</DropdownItem>,
      ]}
    />
  );
};
