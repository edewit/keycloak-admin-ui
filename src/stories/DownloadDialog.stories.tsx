import React from "react";
import { Meta, Story } from "@storybook/react";

import {
  DownloadDialog,
  DownloadDialogProps,
} from "../components/download-dialog/DownloadDialog";

export default {
  title: "Download Dialog",
  component: DownloadDialog,
} as Meta;

const Template: Story<DownloadDialogProps> = (args) => (
  <DownloadDialog {...args} />
);

export const Simple = Template.bind({});
Simple.args = {
  id: "58577281-7af7-410c-a085-61ff3040be6d",
};
