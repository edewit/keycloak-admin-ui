import React from "react";
import { TextContent, Text, TextVariants, ButtonVariant } from "@patternfly/react-core";
import { Meta, Story } from "@storybook/react";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../components/confirm-dialog/ConfirmDialog";

export default {
  title: "Confirmation Dialog",
  component: ConfirmDialog,
} as Meta;

const Template: Story<ConfirmDialogProps> = (args) => (
  <ConfirmDialog {...args} />
);

export const Simple = Template.bind({});
Simple.args = {
  titleKey: "Delete app02?",
  messageKey: "If you delete this client, all associated data will be removed.",
  continueButtonLabel: "Delete",
};

export const Children = Template.bind({});
Children.args = {
  titleKey: "Children as content!",
  continueButtonVariant: ButtonVariant.primary,
  children: (
    <>
      <TextContent>
        <Text component={TextVariants.h3}>Hello World</Text>
      </TextContent>
      <p>Example of some other patternfly components.</p>
    </>
  ),
};
