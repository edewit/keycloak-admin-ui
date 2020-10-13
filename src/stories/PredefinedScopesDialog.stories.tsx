import React from "react";
import { Button } from "@patternfly/react-core";
import { Meta, Story } from "@storybook/react";

import serverInfo from "../context/server-info/__tests__/mock.json";
import { ServerInfoContext } from "../context/server-info/ServerInfoProvider";
import {
  PredefinedScopeDialog,
  PredefinedScopeProps,
  usePredefinedScopeDialog,
} from "../client-scopes/add/PredefinedScopesDialog";

export default {
  title: "PredefinedScopeDialog",
  component: PredefinedScopeDialog,
} as Meta;

const Template: Story<PredefinedScopeProps> = (args) => {
  const [toggle, Dialog] = usePredefinedScopeDialog(args);
  return (
    <ServerInfoContext.Provider value={serverInfo}>
      <Dialog />
      <Button onClick={toggle}>Show</Button>
    </ServerInfoContext.Provider>
  );
};

export const Dialog = Template.bind({});
Dialog.args = {
  protocol: "openid-connect",
};
