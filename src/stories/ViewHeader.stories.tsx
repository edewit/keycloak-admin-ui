import React from "react";
import { Meta, Story } from "@storybook/react";
import { Page, DropdownItem } from "@patternfly/react-core";
import {
  ViewHeader,
  ViewHeaderProps,
} from "../components/view-header/ViewHeader";

export default {
  title: "View Header",
  component: ViewHeader,
} as Meta;

const Template: Story<ViewHeaderProps> = (args) => (
  <Page>
    <ViewHeader {...args} />
  </Page>
);

export const Extended = Template.bind({});
Extended.args = {
  titleKey: "This is the title",
  badge: "badge",
  subKey: "This is the description.",
  extended: true,
  dropdownItems: [
    <DropdownItem key="link">First item</DropdownItem>,
    <DropdownItem key="link">Second item</DropdownItem>,
  ],
};

export const Simple = Template.bind({});
Simple.args = {
  titleKey: "Title simple",
  subKey: "Some lengthy description about what this is about.",
  extended: false,
};
