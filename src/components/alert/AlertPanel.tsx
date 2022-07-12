import React from "react";
import {
  AlertGroup,
  Alert,
  AlertActionCloseButton,
  AlertVariant,
} from "@patternfly/react-core";

export type AlertType = {
  id: number;
  key: number;
  message: string;
  variant: AlertVariant;
  description?: string;
};

type AlertPanelProps = {
  alerts: AlertType[];
  onCloseAlert: (id: number) => void;
};

export function AlertPanel({ alerts, onCloseAlert }: AlertPanelProps) {
  return (
    <AlertGroup isToast>
      {alerts.map(({ id, variant, message, description }) => (
        <Alert
          key={id}
          isLiveRegion
          variant={AlertVariant[variant]}
          variantLabel=""
          title={message}
          actionClose={
            <AlertActionCloseButton
              title={message}
              onClose={() => onCloseAlert(id)}
            />
          }
        >
          {description && <p>{description}</p>}
        </Alert>
      ))}
    </AlertGroup>
  );
}
