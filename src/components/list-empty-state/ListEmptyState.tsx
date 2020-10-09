import React, { MouseEventHandler } from "react";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
  Button,
  ButtonVariant,
  EmptyStateSecondaryActions,
} from "@patternfly/react-core";
import { PlusCircleIcon } from "@patternfly/react-icons";

export type Action = {
  text: string;
  type?: ButtonVariant;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type ListEmptyStateProps = {
  message: string;
  instructions: string;
  actions: Action[];
};

export const ListEmptyState = ({
  message,
  instructions,
  actions,
}: ListEmptyStateProps) => {
  const primaryAction = actions.splice(0, 1)[0];
  return (
    <>
      <EmptyState variant="large">
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel="h4" size="lg">
          {message}
        </Title>
        <EmptyStateBody>{instructions}</EmptyStateBody>
        <Button
          variant={primaryAction.type || ButtonVariant.primary}
          onClick={primaryAction.onClick}
        >
          {primaryAction.text}
        </Button>
        <EmptyStateSecondaryActions>
          {actions.map((action) => (
            <Button
              key={action.text}
              variant={action.type || ButtonVariant.primary}
              onClick={action.onClick}
            >
              {action.text}
            </Button>
          ))}
        </EmptyStateSecondaryActions>
      </EmptyState>
    </>
  );
};
