import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem, DropdownToggle } from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";

import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import type { ExpandableExecution } from "../execution-model";
import { AddStepModal } from "./modals/AddStepModal";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";

type AddedType = "step" | "condition" | "subFlow";

type EditFlowDropdownProps = {
  execution: ExpandableExecution;
  onSelect: (value?: AuthenticationProviderRepresentation) => void;
};

export const EditFlowDropdown = ({
  execution,
  onSelect,
}: EditFlowDropdownProps) => {
  const { t } = useTranslation("authentication");
  const adminClient = useAdminClient();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AddedType>();
  const [providerId, setProviderId] = useState<string>();

  useFetch(
    () =>
      adminClient.authenticationManagement.getFlow({
        flowId: execution.flowId!,
      }),
    ({ providerId }) => setProviderId(providerId),
    []
  );

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
        <AddStepModal
          name={execution.displayName!}
          type={providerId === "form-flow" ? "form" : "basic"}
          onSelect={(type) => {
            onSelect(type);
            setType(undefined);
          }}
        />
      )}
    </>
  );
};
