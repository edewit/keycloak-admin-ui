import { ReactNode, useState } from "react";
import { Dropdown, DropdownToggle, KebabToggle } from "@patternfly/react-core";

type KeycloakDropdownProps = {
  isKebab?: boolean;
  dropDownItems: ReactNode[];
};

export const KeycloakDropdown = ({
  dropDownItems,
  isKebab = false,
}: KeycloakDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      isPlain
      position="right"
      toggle={
        isKebab ? (
          <KebabToggle onToggle={setOpen} />
        ) : (
          <DropdownToggle onToggle={setOpen} />
        )
      }
      isOpen={open}
      dropdownItems={dropDownItems}
    />
  );
};
