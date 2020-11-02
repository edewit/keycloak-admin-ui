import React from "react";
import { Button } from "@patternfly/react-core";
import { Meta, Story } from "@storybook/react";

import serverInfo from "../context/server-info/__tests__/mock.json";
import { ServerInfoContext } from "../context/server-info/ServerInfoProvider";
import {
  AddMapperDialog,
  AddMapperDialogProps,
  useAddMapperDialog,
} from "../client-scopes/add/MapperDialog";

export default {
  title: "Add mapper dialog",
  component: AddMapperDialog,
} as Meta;

const Test = (args: AddMapperDialogProps) => {
  const [toggle, Dialog] = useAddMapperDialog(args);
  return (
    <>
      <Dialog />
      <Button onClick={toggle}>Show</Button>
    </>
  );
};

const Template: Story<AddMapperDialogProps> = (args) => {
  return (
    <ServerInfoContext.Provider value={serverInfo}>
      <Test {...args} />
    </ServerInfoContext.Provider>
  );
};

export const BuildInDialog = Template.bind({});
BuildInDialog.args = {
  protocol: "openid-connect",
  filter: [],
};

export const ProtocolMapperDialog = Template.bind({});
ProtocolMapperDialog.args = {
  protocol: "openid-connect",
};
