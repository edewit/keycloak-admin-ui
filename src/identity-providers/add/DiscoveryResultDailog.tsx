import React from "react";
import { useTranslation } from "react-i18next";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Modal,
} from "@patternfly/react-core";

import { OIDCConfigurationRepresentation } from "../OIDCConfigurationRepresentation";

type DiscoveryResultDialogProps = {
  result: OIDCConfigurationRepresentation;
  onClose: () => void;
};

export const DiscoveryResultDialog = ({
  result,
  onClose,
}: DiscoveryResultDialogProps) => {
  const { t } = useTranslation("identity-providers");

  return (
    <Modal
      title={t("metadataOfDiscoveryEndpoint")}
      isOpen={true}
      onClose={onClose}
      variant="small"
    >
      <DescriptionList isHorizontal>
        {Object.keys(result).map((key) => (
          <DescriptionListGroup key={key}>
            <DescriptionListTerm>{t(key)}</DescriptionListTerm>
            <DescriptionListDescription>
              {(result as { [index: string]: string })[key].toString()}
            </DescriptionListDescription>
          </DescriptionListGroup>
        ))}
      </DescriptionList>
    </Modal>
  );
};
